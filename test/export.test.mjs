// Run with: node test/export.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildExport, toCsv } from '../src/page.js';

const template = readFileSync(new URL('../src/template.html', import.meta.url), 'utf8');
const chromeUpdate = 'https://clients2.google.com/service/update2/crx';
const edgeUpdate = 'https://edge.microsoft.com/extensionwebstorebase/v1/crx';

const extensions = [
    { id: 'a'.repeat(32), name: '<img src=x onerror=alert(1)>', version: '1.0', type: 'extension', enabled: true, description: 'Says "hi" & <b>bye</b>', updateUrl: chromeUpdate, permissions: ['tabs', 'storage'], hostPermissions: ['<all_urls>'] },
    { id: 'b'.repeat(32), name: "Price $' {TIMESTAMP}", version: '2.0', type: 'extension', enabled: false, description: '', updateUrl: edgeUpdate },
    { id: 'c'.repeat(32), name: 'Local Dev', version: '0.1', type: 'extension', enabled: true, description: '', homepageUrl: 'javascript:alert(1)' },
    { id: 'd'.repeat(32), name: 'Docs App', version: '3.0', type: 'hosted_app', enabled: false, description: '', updateUrl: chromeUpdate },
    { id: 'e'.repeat(32), name: 'Dark Theme', version: '4.0', type: 'theme', enabled: true, description: '', updateUrl: chromeUpdate }
];

const html = buildExport(extensions, template, { exporterVersion: '9.9.9', browserName: 'Chrome', browserVersion: '140.0', generatorUrl: 'https://example.com', timestamp: 'NOW', fileTimestamp: 'FILE', logo: 'data:image/png;base64,AAAA' });
const section = (name) => html.split(`<section class="${name}">`)[1].split('</section>')[0];

// Hostile names and descriptions are escaped
assert.ok(!html.includes('<img src=x'), 'name must be escaped');
assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
assert.ok(html.includes('<td class="col-description">Says &quot;hi&quot; &amp; &lt;b&gt;bye&lt;/b&gt;</td>'), 'description must be escaped');

// Replacement patterns and placeholder text in names are left literal
assert.ok(html.includes("Price $&#39; {TIMESTAMP}</a>"), 'name with $\' or {TIMESTAMP} must be kept as-is');

// Non-http homepages are dropped
assert.ok(!html.includes('javascript:'), 'javascript: homepage must not be linked');

// Items land in the right sections
assert.ok(section('enabled').includes('onerror') && section('enabled').includes('Local Dev'));
assert.ok(section('disabled').includes('Price'));
assert.ok(section('apps').includes('Docs App') && section('apps').includes('(disabled)'));
assert.ok(section('themes').includes('Dark Theme'));

// Counts and summary
assert.ok(section('enabled').includes('<span class="count">2</span>') && section('apps').includes('<span class="count">1</span>'));
assert.ok(html.includes('<p class="summary">3 extensions (2 enabled, 1 disabled), 1 app, 1 theme</p>'));

// Links: Chrome gets a CRXaminer report, Edge gets Edge links and no report, unknown gets neither
assert.ok(html.includes(`https://crxaminer.tech/scan/${'a'.repeat(32)}`));
assert.ok(html.includes(`https://microsoftedge.microsoft.com/addons/detail/${'b'.repeat(32)}`));
assert.ok(!html.includes(`crxaminer.tech/scan/${'b'.repeat(32)}`), 'no CRXaminer link for Edge-hosted items');
assert.ok(!html.includes(`chrome-stats.com/d/${'c'.repeat(32)}`), 'no stats link for unknown platform');
assert.ok(!html.includes('crxcavator'), 'CRXcavator must be gone');
assert.ok(html.includes(`prodversion=140.0&amp;acceptformat=crx3&amp;x=id%3D${'a'.repeat(32)}`), 'CRX link carries the exporting browser version');
assert.ok(!html.includes('{BROWSER_VERSION}'));

// Every placeholder is filled, and the embedded JSON round-trips
const leftovers = html.replaceAll("Price $&#39; {TIMESTAMP}", '').replaceAll("Price $' {TIMESTAMP}", '').match(/\{[A-Z_]+\}/g);
assert.equal(leftovers, null, 'every template placeholder is filled; only the literal text inside the extension name remains');
assert.ok(html.includes('<title>Extension Export NOW</title>') && html.includes('<link rel="icon" href="data:image/png;base64,AAAA"'));
const unescape = (s) => s.replace(/&(amp|lt|gt|quot|#39|#13);/g, (m, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", '#13': '\r' })[e]);
const listing = JSON.parse(unescape(html.match(/data-json="([^"]*)"/)[1]));
assert.equal(listing.length, 5);
assert.equal(listing.find((x) => x.type === 'theme').name, 'Dark Theme');
assert.equal(listing[0].name, extensions[0].name, 'JSON keeps original text');
assert.deepEqual(listing.map((x) => x.store), ['Chrome Web Store', 'Chrome Web Store', 'Chrome Web Store', '', 'Edge Add-ons'], 'store label per item');

// Permissions: API then host, escaped in the table, empty for items without any
assert.deepEqual(listing[0].permissions, ['tabs', 'storage', '<all_urls>']);
assert.deepEqual(listing[1].permissions, []);
assert.ok(html.includes('<td class="col-permissions">tabs, storage, &lt;all_urls&gt;</td>'));

// CSV: embedded copy matches, and it survives HTML parsing (no raw CR in the attribute)
const csv = toCsv(listing);
assert.equal(unescape(html.match(/data-csv="([^"]*)"/)[1]), csv);
assert.ok(!html.match(/data-csv="([^"]*)"/)[1].includes('\r'));
assert.ok(csv.startsWith('﻿"Name","Version","ID"'), 'BOM and header row');
assert.equal(csv.split('\r\n').length, 6, 'header plus one row per item');
assert.ok(csv.includes('"tabs, storage, <all_urls>"'), 'permissions joined into one CSV cell');

// CSV: quotes are doubled, and formula-looking cells are neutralized
const row = toCsv([{ name: '=HYPERLINK("http://evil")', version: '-1', id: '@x', description: 'a "b", c\nd', enabled: false }]).split('\r\n')[1];
assert.ok(row.startsWith(`"'=HYPERLINK(""http://evil"")","'-1","'@x","","false","","a ""b"", c\nd"`), row);

console.log('All export checks passed.');
