import { icons, strings, urls } from './strings.js';

// ========================================================================== //
// Define browserAPI to handle both Chrome and other browsers (like Firefox)
// ========================================================================== //
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// ========================================================================== //
// Define a debug flag
// ========================================================================== //
const DEBUG = false;
const DEBUG_SHOW_ALL_EXTENSIONS = false;

// ========================================================================== //
// Define URL types using an enum
// ========================================================================== //
const UrlType = Object.freeze({
    STORE_DETAIL: 'storeDetailUrl',
    STATS: 'statsUrl',
    CRX_DOWNLOAD: 'crxdownloadUrl',
    CRXCAVATOR: 'crxcavatorUrl'
});

(function (window, document) {
    'use strict';

    // ========================================================================== //
    // Determine the browser based on the user agent
    // ========================================================================== //
    const getBrowser = function () {
        const userAgent = navigator.userAgent;
        if (/Chrome/.test(userAgent) && !/Edg\//.test(userAgent)) {
            return 'Chrome';
        } else if (/Edg\//.test(userAgent)) {
            return 'Edge';
        } else {
            return 'Chrome';  // Default to Chrome
        }
    };

    // ========================================================================== //
    // Replace placeholders in the page that is presented to the user upon clicking the extension icon
    // ========================================================================== //
    document.addEventListener('DOMContentLoaded', function () {
        let currentBrowser = getBrowser();
        let storeName = strings.storeName[currentBrowser];
        let storeUrl = urls.storeDetailUrl[currentBrowser].replace('{EXTENSION_ID}', browserAPI.runtime.id);

        if (DEBUG) {
            console.log('Current Browser:', currentBrowser);
            console.log('Store Name:', storeName);
            console.log('Store URL:', storeUrl);
        }

        // Replace placeholders in the HTML content
        document.body.innerHTML = document.body.innerHTML.replace(/{STORE_NAME}/g, storeName).replace(/{STORE_URL}/g, storeUrl);
    });

    // ========================================================================== //
    // Log all extensions if debug is enabled
    // ========================================================================== //
    if (DEBUG_SHOW_ALL_EXTENSIONS) {
        browserAPI.management.getAll().then((extensions) => {
            console.log('All extensions:', extensions);
        });
    }

    // ========================================================================== //
    // Get the store that the extension belongs to based on its extension ID
    // ========================================================================== //
    const getExtensionPlatform = function (extensionId) {
        return browserAPI.management.get(extensionId).then((extension) => {
            const updateUrl = extension.updateUrl || '';

            if (updateUrl.includes("google.com")) {
                return strings.browserName.Chrome;
            } else if (updateUrl.includes("microsoft.com")) {
                return strings.browserName.Edge;
            } else {
                // Log a warning if the platform is unknown
                console.log(`Unknown platform for extension ${extensionId}. This means it's not hosted on the Chrome Web Store or Microsoft Edge Add-ons.`);
                return '';
            }
        });
    };

    // ========================================================================== //
    // Retrieve the appropriate URL for an extension based on the URL type
    // ========================================================================== //
    const getUrl = function (extensionId, urlType) {
        return getExtensionPlatform(extensionId).then((platform) => {
            if (platform && urls[urlType][platform]) {
                return urls[urlType][platform].replace('{EXTENSION_ID}', extensionId);
            } else {
                return '';
            }
        });
    };

    // ========================================================================== //
    // Get the store URL for an extension based on its extension ID
    // ========================================================================== //
    const getStoreUrl = function (extensionId) {
        return getUrl(extensionId, UrlType.STORE_DETAIL);
    };

    // ========================================================================== //
    // Get the stats URL for an extension based on its id
    // ========================================================================== //
    const getStatsUrl = function (extensionId) {
        return getUrl(extensionId, UrlType.STATS);
    };

    // ========================================================================== //
    // Get the CRX download link for an extension based on its id
    // ========================================================================== //
    const getCrxLink = function (extensionId) {
        return getUrl(extensionId, UrlType.CRX_DOWNLOAD);
    };

    // ========================================================================== //
    // Get the CRXcavator link for an extension based on its id
    // ========================================================================== //
    const getCrxcavatorLink = function (extensionId) {
        return getUrl(extensionId, UrlType.CRXCAVATOR);
    };

    // ========================================================================== //
    // Get all necessary URLs related to an extension
    // ========================================================================== //
    const getStoreUrls = function (extensionId) {
        return Promise.all([
            getStoreUrl(extensionId),
            getStatsUrl(extensionId),
            getCrxLink(extensionId),
            getCrxcavatorLink(extensionId)
        ]).then((urls) => {
            return {
                storeUrl: urls[0],
                crxLink: urls[2],
                statsLink: urls[1],
                crxcavatorLink: urls[3]
            };
        });
    };

    // ========================================================================== //
    // Download the generated HTML file
    // ========================================================================== //
    const download = function (str, fileName) {
        const file = new Blob([str]);
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(file);
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (DEBUG) {
            console.log(`Downloaded file: ${fileName}`);
        }
    };

    // ========================================================================== //
    // Load the template and generate the HTML file
    // ========================================================================== //
    const loadTemplate = function (callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', browserAPI.runtime.getURL('template.html'), true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                callback(xhr.responseText);
            }
        };
        xhr.send();
    };

    // ========================================================================== //
    // Timestamp
    // ========================================================================== //
    let getFileTimestamp = function () {
        // Generate file timestamp YYYY-MM-DD HH:MM:SS in the user's local time
        let now = new Date();
        let year = now.getFullYear();
        let month = String(now.getMonth() + 1).padStart(2, '0');
        let day = String(now.getDate()).padStart(2, '0');
        let hours = String(now.getHours()).padStart(2, '0');
        let minutes = String(now.getMinutes()).padStart(2, '0');
        let seconds = String(now.getSeconds()).padStart(2, '0');

        let formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedTimestamp;
    };

    // Get timestamp for the generated HTML file
    let getTimestamp = function () {
        return new Date().toLocaleString().replace(',', '');
    }

    // ========================================================================== //
    // Initialize the extension
    // ========================================================================== //
    const initialize = function () {
        browserAPI.management.getAll().then(async function (extensions) {
            let enabled = '';
            let disabled = '';

            let commentEnabled = '';
            let commentDisabled = '';

            extensions.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });

            for (const extension of extensions) {
                let html = '';
                let comment = '';

                const urls = await getStoreUrls(extension.id);

                const div = document.createElement('div');
                div.appendChild(document.createTextNode(`${extension.name} ${extension.version}`));
                const nameAndVersion = div.innerHTML;

                div.innerHTML = '';
                div.appendChild(document.createTextNode(extension.description));
                const descriptionEscaped = div.innerHTML;

                if (!urls.storeUrl && extension.homepageUrl) {
                    urls.storeUrl = extension.homepageUrl;
                }

                html += `
                    <li>
                        ${urls.storeUrl ? `<a href="${urls.storeUrl}" target="_blank" title="${descriptionEscaped}">${nameAndVersion}</a>` : nameAndVersion}
                        <a href="${urls.crxLink}" target="_blank" title="Download CRX file" alt="Download CRX file">
                            <span class="crxdownload-icon"></span>
                        </a> 
                        <a href="${urls.statsLink}" target="_blank" title="Stats" alt="Stats">
                            <span class="stats-icon"></span>
                        </a> 
                        <a href="${urls.crxcavatorLink}" target="_blank" title="CRXcavator Report" alt="CRXcavator Report">
                            <span class="crxcavator-icon"></span>
                        </a>
                    </li>\n`;

                comment += `${nameAndVersion}\n${urls.storeUrl}\n\n`;

                if (extension.enabled) {
                    enabled += html;
                    commentEnabled += comment;
                } else {
                    disabled += html;
                    commentDisabled += comment;
                }
            }

            // Retrieve version from the manifest
            const exporterVersion = browserAPI.runtime.getManifest().version;

            loadTemplate(function (template) {
                // Retrieve the extension ID to populate the 'generator' meta tag in the HTML output
                let extensionId = browserAPI.runtime.id;

                // Determine the current browser
                const currentBrowser = getBrowser();

                // Determine the generator URL based on the source of the self-extension
                let generatorUrl = urls.storeDetailUrl[currentBrowser].replace('{EXTENSION_ID}', extensionId);

                // Replace the placeholders in the template with the generated HTML
                template = template.replace('{ENABLED}', enabled.trim())
                    .replaceAll('{TIMESTAMP}', getTimestamp())
                    .replaceAll('{EXTENSION_ID}', extensionId)
                    .replaceAll('{GENERATOR_URL}', generatorUrl)
                    .replaceAll('{DISABLED}', disabled.trim())
                    .replaceAll('{COMMENT_ENABLED}', commentEnabled.trim())
                    .replaceAll('{COMMENT_DISABLED}', commentDisabled.trim())
                    .replaceAll('{EXPORTER_VERSION}', exporterVersion)
                    .replaceAll('{CRX_DOWNLOAD_ICON}', icons.crxDownloadIcon)
                    .replaceAll('{STATS_ICON}', icons.statsIcon)
                    .replaceAll('{CRXCAVATOR_ICON}', icons.crxcavatorIcon);

                // Download the generated HTML file with the date
                download(template, `${strings.filePrefix} ${getFileTimestamp()}.html`);
            });
        });
    };

    document.addEventListener('DOMContentLoaded', initialize);

})(window, document);