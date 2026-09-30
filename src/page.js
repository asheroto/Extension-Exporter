import { icons, strings, urls } from './strings.js';

// ========================================================================== //
// Debug flags
// ========================================================================== //
const DEBUG = false;
const DEBUG_SHOW_ALL_EXTENSIONS = false;

// ========================================================================== //
// Escape text for safe insertion into HTML content and attributes
// ========================================================================== //
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ========================================================================== //
// Determine the browser running the exporter
// ========================================================================== //
const getBrowser = () => /Edg\//.test(navigator.userAgent) ? 'Edge' : 'Chrome';

// ========================================================================== //
// Get the store an extension came from, based on its update URL
// ========================================================================== //
const getPlatform = (extension) => {
    const updateUrl = extension.updateUrl || '';
    if (updateUrl.includes('google.com')) return 'Chrome';
    if (updateUrl.includes('microsoft.com')) return 'Edge';
    if (DEBUG) console.log(`Unknown platform for ${extension.id}. It is not hosted on the Chrome Web Store or Microsoft Edge Add-ons.`);
    return '';
};

// ========================================================================== //
// Get the section an item is listed under (management API types: extension,
// login_screen_extension, theme, hosted_app, packaged_app, legacy_packaged_app)
// ========================================================================== //
const getSection = (item) => {
    if (item.type === 'theme') return 'THEMES';
    if (item.type.endsWith('app')) return 'APPS';
    return item.enabled ? 'ENABLED_EXTENSIONS' : 'DISABLED_EXTENSIONS';
};

// ========================================================================== //
// Convert the listing to CSV (RFC 4180 quoting, with a BOM so Excel reads UTF-8)
// ========================================================================== //
const CSV_COLUMNS = { name: 'Name', version: 'Version', id: 'ID', type: 'Type', enabled: 'Enabled', store: 'Store', description: 'Description', storeUrl: 'Store URL', crxLink: 'CRX Link', statsLink: 'Stats Link', securityLink: 'Security Report' };

export const toCsv = (listing) => {
    const cell = (value) => {
        let text = String(value ?? '');
        // A leading = + - @ tab or CR makes spreadsheets run the cell as a formula, so neutralize it
        if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
        return `"${text.replace(/"/g, '""')}"`;
    };
    const keys = Object.keys(CSV_COLUMNS);
    const rows = [Object.values(CSV_COLUMNS), ...listing.map((item) => keys.map((key) => item[key]))];
    return '﻿' + rows.map((row) => row.map(cell).join(',')).join('\r\n');
};

// ========================================================================== //
// Build the export HTML from the installed extensions and the template
// ========================================================================== //
export const buildExport = (extensions, template, meta) => {
    const sections = { ENABLED_EXTENSIONS: '', DISABLED_EXTENSIONS: '', APPS: '', THEMES: '' };
    const counts = { ENABLED_EXTENSIONS: 0, DISABLED_EXTENSIONS: 0, APPS: 0, THEMES: 0 };
    const listing = [];

    for (const extension of [...extensions].sort((a, b) => a.name.localeCompare(b.name))) {
        const platform = getPlatform(extension);
        const link = (type) => (urls[type][platform] || '').replace('{EXTENSION_ID}', extension.id).replace('{BROWSER_VERSION}', meta.browserVersion);
        const homepageUrl = /^https?:\/\//i.test(extension.homepageUrl || '') ? extension.homepageUrl : '';

        const item = {
            name: extension.name,
            version: extension.version,
            id: extension.id,
            type: extension.type,
            enabled: extension.enabled,
            store: platform ? strings.storeLabel[platform] : '',
            description: extension.description,
            storeUrl: link('storeDetailUrl') || homepageUrl,
            crxLink: link('crxdownloadUrl'),
            statsLink: link('statsUrl'),
            securityLink: link('securityUrl')
        };
        listing.push(item);

        const section = getSection(item);
        const name = esc(item.name);
        const disabledNote = !item.enabled && !section.endsWith('EXTENSIONS') ? ' (disabled)' : '';

        // Table row for the extension listing
        counts[section]++;
        sections[section] += `
                <tr>
                    <td class="col-name">${item.storeUrl ? `<a href="${esc(item.storeUrl)}" target="_blank">${name}</a>` : name}${disabledNote}</td>
                    <td class="col-version">${esc(item.version)}</td>
                    <td class="col-id"><button type="button" class="ext-id" title="Copy ID">${esc(item.id)}</button></td>
                    <td class="col-description">${esc(item.description)}</td>
                    <td class="col-links">
                        ${item.statsLink ? `<a class="link-stats" href="${esc(item.statsLink)}" target="_blank" title="Stats" aria-label="Stats for ${name}"><span class="icon icon-stats"></span></a>` : ''}
                        ${item.securityLink ? `<a class="link-security" href="${esc(item.securityLink)}" target="_blank" title="Security report" aria-label="Security report for ${name}"><span class="icon icon-security"></span></a>` : ''}
                    </td>
                </tr>`;
    }

    // Header summary, for example "15 extensions (12 enabled, 3 disabled), 1 theme"
    const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
    const summary = [
        `${plural(counts.ENABLED_EXTENSIONS + counts.DISABLED_EXTENSIONS, 'extension')} (${counts.ENABLED_EXTENSIONS} enabled, ${counts.DISABLED_EXTENSIONS} disabled)`,
        counts.APPS && plural(counts.APPS, 'app'),
        counts.THEMES && plural(counts.THEMES, 'theme')
    ].filter(Boolean).join(', ');

    const values = {
        ...sections,
        ...Object.fromEntries(Object.entries(counts).map(([key, count]) => [`COUNT_${key}`, count])),
        SUMMARY: summary,
        EXPORTER_VERSION: esc(meta.exporterVersion),
        GENERATOR_URL: esc(meta.generatorUrl),
        TIMESTAMP: esc(meta.timestamp),
        FILE_TIMESTAMP: esc(meta.fileTimestamp),
        LISTING_JSON: esc(JSON.stringify(listing)),
        // &#13; keeps the CRLF row endings, since HTML parsing turns a raw CR in an attribute into LF
        LISTING_CSV: esc(toCsv(listing)).replace(/\r/g, '&#13;'),
        LOGO: esc(meta.logo),
        TEXT_ONLY_ICON: icons.textOnlyIcon,
        DOWNLOAD_ICON: icons.downloadIcon,
        STATS_ICON: icons.statsIcon,
        SECURITY_ICON: icons.securityIcon,
        HELP_ICON: icons.helpIcon,
        AI_ICON: icons.aiIcon,
        BROWSER_NAME: esc(meta.browserName)
    };

    // Single pass, so placeholder-like text inside extension names is never substituted
    return template.replace(/\{([A-Z_]+)\}/g, (match, key) => key in values ? values[key] : match);
};

// ========================================================================== //
// Download the generated HTML file
// ========================================================================== //
const download = (str, fileName) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([str], { type: 'text/html' }));
    a.download = fileName;
    a.click();
    if (DEBUG) console.log(`Downloaded file: ${fileName}`);
};

// ========================================================================== //
// Run only inside the extension page (skipped when imported by the test)
// ========================================================================== //
if (globalThis.chrome?.management) {
    document.addEventListener('DOMContentLoaded', async () => {
        const browser = getBrowser();
        const storeUrl = urls.storeDetailUrl[browser].replace('{EXTENSION_ID}', chrome.runtime.id);

        // Replace placeholders in the page shown after clicking the extension icon
        document.body.innerHTML = document.body.innerHTML.replace(/{STORE_NAME}/g, strings.storeName[browser]).replace(/{STORE_URL}/g, storeUrl);

        const extensions = await chrome.management.getAll();
        if (DEBUG_SHOW_ALL_EXTENSIONS) console.log('All extensions:', extensions);

        const template = await (await fetch(chrome.runtime.getURL('template.html'))).text();

        // Embed the extension icon so the export stays a single offline file
        const iconBytes = new Uint8Array(await (await fetch(chrome.runtime.getURL('img/128.png'))).arrayBuffer());
        const logo = `data:image/png;base64,${btoa(String.fromCharCode(...iconBytes))}`;

        // sv-SE formats as YYYY-MM-DD HH:MM:SS; colons are swapped out because Windows forbids them in file names
        const fileTimestamp = new Date().toLocaleString('sv-SE').replace(/:/g, '-');

        const html = buildExport(extensions, template, {
            exporterVersion: chrome.runtime.getManifest().version,
            browserName: browser,
            // Chromium major version, for the CRX links (Edge reports Chrome/ in its user agent too)
            browserVersion: `${navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || 140}.0`,
            generatorUrl: storeUrl,
            timestamp: new Date().toLocaleString().replace(',', ''),
            fileTimestamp,
            logo
        });

        download(html, `${strings.filePrefix} ${fileTimestamp}.html`);
    });
}
