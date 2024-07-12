(function (window, document) {
    'use strict';

    // ========================================================================== //
    // Replace placedholders in page that is presented to user upon clicking the extension icon
    // ========================================================================== //

    document.addEventListener('DOMContentLoaded', function () {
        var browserName = getBrowser();
        var storeUrl = getStoreUrl(browserAPI.runtime.id);
        document.body.innerHTML = document.body.innerHTML.replace(/{STORE_NAME}/g, browserName).replace(/{STORE_URL}/g, storeUrl);
    });    

    // ========================================================================== //
    // Get browser object
    // ========================================================================== //

    var browserAPI = typeof browser !== 'undefined' ? browser : chrome;

    // ========================================================================== //
    // Icons
    // ========================================================================== //

    const icons = {
        crxDownloadIcon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgdmlld0JveD0iMCAwIDIwIDIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMyA4VjJIN3Y2SDJsOCA4IDgtOGgtNXpNMCAxOGgyMHYySDB2LTJ6Ii8+PC9zdmc+',
        statsIcon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgdmlld0JveD0iMCAwIDMyIDMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MnB4O308L3N0eWxlPjwvZGVmcz48dGl0bGUvPjxnIGlkPSJkYXNoYm9hcmQiPjxsaW5lIGNsYXNzPSJjbHMtMSIgeDE9IjMiIHgyPSIyOSIgeTE9IjI5IiB5Mj0iMjkiLz48bGluZSBjbGFzcz0iY2xzLTEiIHgxPSIzIiB4Mj0iMyIgeTE9IjMiIHkyPSIyOSIvPjxsaW5lIGNsYXNzPSJjbHMtMSIgeDE9IjE2IiB4Mj0iMTYiIHkxPSI3IiB5Mj0iMjUiLz48bGluZSBjbGFzcz0iY2xzLTEiIHgxPSIyMiIgeDI9IjIyIiB5MT0iMTEiIHkyPSIyNSIvPjxsaW5lIGNsYXNzPSJjbHMtMSIgeDE9IjEwIiB4Mj0iMTAiIHkxPSIxNiIgeTI9IjI1Ii8+PC9nPjwvc3ZnPg==',
        crxcavatorIcon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgdmlld0JveD0iMCAwIDY0IDY0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGlkPSJFZmZpY2FjeV9yZXNlYXJjaGluZyI+PHBhdGggZD0iTTQwLjYzNDUsMjQuNTUyNmwuMjU1Ni0uMDQ4YTEuMzM0OSwxLjMzNDksMCwwLDAsMS4wODg5LTEuMzEyVjE5LjkzNkExLjMzNDgsMS4zMzQ4LDAsMCwwLDQwLjg5LDE4LjYyNGwtMy43NzM3LS43MDhhMi4wNTE3LDIuMDUxNywwLDAsMS0xLjU2NDktMS4zMTksMTQuNzk1MiwxNC43OTUyLDAsMCwwLS41OTIzLTEuNDM0NywyLjA1MTQsMi4wNTE0LDAsMCwxLC4xNzQ4LTIuMDM2NmwyLjE2NjgtMy4xNjc1YTEuMzM1MSwxLjMzNTEsMCwwLDAtLjE1OC0xLjY5NzVMMzQuODQsNS45NThBMS4zMzQ4LDEuMzM0OCwwLDAsMCwzMy4xNDI2LDUuOEwyOS45NzQ4LDcuOTY3YTIuMDUxOCwyLjA1MTgsMCwwLDEtMi4wMzY2LjE3NDgsMTQuNzAzNCwxNC43MDM0LDAsMCwwLTEuNDM0Ni0uNTkyNSwyLjA1MTYsMi4wNTE2LDAsMCwxLTEuMzE4OC0xLjU2NWwtLjcwOC0zLjc3MzhhMS4zMzQ5LDEuMzM0OSwwLDAsMC0xLjMxMi0xLjA4ODdIMTkuOTA4MmExLjMzNDYsMS4zMzQ2LDAsMCwwLTEuMzExOCwxLjA4ODdsLS43MDgsMy43NzM3QTIuMDUyOCwyLjA1MjgsMCwwLDEsMTYuNTcsNy41NDkzYTE0LjcwNywxNC43MDcsMCwwLDAtMS40MzQ4LjU5MjUsMi4wNTE0LDIuMDUxNCwwLDAsMS0yLjAzNjctLjE3NDhMOS45Myw1LjhhMS4zMzQ5LDEuMzM0OSwwLDAsMC0xLjY5NzUuMTU4TDUuOTMsOC4yNjA3YTEuMzM1MSwxLjMzNTEsMCwwLDAtLjE1OCwxLjY5NzVsMi4xNjcsMy4xNjc1YTIuMDUxNiwyLjA1MTYsMCwwLDEsLjE3NDgsMi4wMzY3LDE0Ljc0NjQsMTQuNzQ2NCwwLDAsMC0uNTkyNSwxLjQzNDcsMi4wNTIxLDIuMDUyMSwwLDAsMS0xLjU2NSwxLjMxODlsLTMuNzczNy43MDhhMS4zMzQ3LDEuMzM0NywwLDAsMC0xLjA4ODYsMS4zMTJ2My4yNTY2YTEuMzM0NywxLjMzNDcsMCwwLDAsMS4wODg2LDEuMzEybDMuNzczNy43MDc5YTIuMDUxNywyLjA1MTcsMCwwLDEsMS41NjUsMS4zMTg5QTE0LjczNDMsMTQuNzM0MywwLDAsMCw4LjExNCwyNy45NjZhMi4wNTE0LDIuMDUxNCwwLDAsMS0uMTc0OCwyLjAzNjZMNS43NzIyLDMzLjE3YTEuMzM1NSwxLjMzNTUsMCwwLDAsLjE1OCwxLjY5NzhsMi4zMDI3LDIuMzAyN2ExLjMzNDcsMS4zMzQ3LDAsMCwwLDEuNjk3NS4xNTc3bDMuMTY3Ny0yLjE2NjdhMi4wNTEzLDIuMDUxMywwLDAsMSwyLjAzNjctLjE3NDgsMTQuNzc3NSwxNC43Nzc1LDAsMCwwLDEuNDM0OC41OTI1LDIuMDUyMiwyLjA1MjIsMCwwLDEsMS4zMTg4LDEuNTY0OWwuNzA3OCwzLjc3MzdhMS4zMzQ4LDEuMzM0OCwwLDAsMCwxLjMxMiwxLjA4ODhoMy4yNTY2YTEuMzM0OCwxLjMzNDgsMCwwLDAsMS4zMTItMS4wODg4bC4wOTExLS40ODQ5YTE2Ljk5MTMsMTYuOTkxMywwLDAsMSwxNi4wNjY2LTE1Ljg4Wk0yMS41MzY2LDI5LjE0MDhhNy41NzY3LDcuNTc2NywwLDEsMSw3LjU3NjctNy41NzY2QTcuNTc2NSw3LjU3NjUsMCwwLDEsMjEuNTM2NiwyOS4xNDA4WiIvPjxwYXRoIGQ9Ik02MC40Njc1LDU2LjY2ODksNTMuNTE3Niw0OS42YTE0LjQwMzgsMTQuNDAzOCwwLDEsMC00LjQ5NDQsNC4yNzM3TDU2LjA4NjksNjEuMDVhMy4wOTc2LDMuMDk3NiwwLDAsMCw0LjM4MDYtNC4zODA2Wk00MS41ODM3LDQ5LjAwMzZhNy40MTg2LDcuNDE4NiwwLDEsMSw3LjQxODUtNy40MTg3QTcuNDE4Nyw3LjQxODcsMCwwLDEsNDEuNTgzNyw0OS4wMDM2WiIvPjwvZz48L3N2Zz4='
    };

    // ========================================================================== //
    // Strings
    // ========================================================================== //

    const strings = {
        storeName: {
            Chrome: 'the Chrome Web Store',
            Edge: 'Microsoft Edge Add-ons'
        },
        statsName: {
            Chrome: 'Chrome-Stats',
            Edge: 'Edge-Stats'
        },
        browserName: {
            Chrome: 'Chrome',
            Edge: 'Edge'
        }
    };

    // ========================================================================== //
    // URLs
    // ========================================================================== //

    const urls = {
        storeUrl: {
            Chrome: 'https://chrome.google.com/webstore/detail/{EXTENSION_ID}',
            Edge: 'https://microsoftedge.microsoft.com/addons/detail/{EXTENSION_ID}'
        },
        statsUrl: {
            Chrome: 'https://chrome-stats.com/d/{EXTENSION_ID}',
            Edge: 'https://edge-stats.com/d/{EXTENSION_ID}'
        },
        crxdownloadUrl: {
            Chrome: 'https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&acceptformat=crx3&x=id%3D{EXTENSION_ID}%26installsource%3Dondemand%26uc',
            Edge: 'https://edge.microsoft.com/extensionwebstorebase/v1/crx?response=redirect&prodversion=49.0&acceptformat=crx3&x=id%3D{EXTENSION_ID}%26installsource%3Dondemand%26uc'
        },
        crxcavatorUrl: {
            Chrome: 'https://crxcavator.io/report/{EXTENSION_ID}?platform=Chrome',
            Edge: 'https://crxcavator.io/report/{EXTENSION_ID}?platform=Edge'
        }
    };

    // ========================================================================== //
    // Functions
    // ========================================================================== //

    // Determine the browser based on the user agent.
    var getBrowser = function () {
        var userAgent = navigator.userAgent;
        if (/Chrome/.test(userAgent) && !/Edg\//.test(userAgent)) {
            return strings.browserName.Chrome;
        } else if (/Edg\//.test(userAgent)) {
            return strings.browserName.Edge;
        } else {
            // Handle other browsers or unrecognized user agents
            return "Unknown Browser";
        }
    }

    // Get the store that the extension belongs to based on its homepage URL.
    var getExtensionPlatform = function (homepageUrl) {
        return homepageUrl.includes('chrome.google.com') ? strings.browserName.Chrome : strings.browserName.Edge;
    };

    // Get the store URL for an extension based on its homepage URL.
    function getStoreUrl(extension) {
        
    }

    // Get the stats URL for an extension based on its id. Browser-specific.
    var getStatsUrl = function (extensionId) {
        
    };

    // Get the CRX download link for an extension based on its id.
    var getCrxLink = function (extensionId) {
        
    };

    // Get the name of the stats platform (Chrome Stats or Edge Stats).
    var getStatsName = function () {
        
    };

    // Get the CRXcavator link for an extension based on its id.
    var getCrxcavatorLink = function (extensionId, homepageUrl) {
        
    };

    // Get all necessary URLs related to an extension.
    function getStoreUrls(extension) {
        var extensionPlatform = getExtensionPlatform(extension.homepageUrl);
        var storeUrl = getStoreUrl(extension);
        var statsLink = getStatsUrl(extension.id);
        var crxLink = getCrxLink(extension.id);
        var crxcavatorLink = getCrxcavatorLink(extension.id, extension.homepageUrl);

        return {
            storeUrl: storeUrl,
            crxLink: crxLink,
            statsLink: statsLink,
            extensionPlatform: extensionPlatform,
            crxcavatorLink: crxcavatorLink
        };
    }

    // ========================================================================== //
    // HTML Escape
    // ========================================================================== //

    function htmlEscape(str) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&#34;',
            "'": '&#39;'
        };

        return ('' + str).replace(/[&<>"']/g, function (match) {
            return map[match];
        });
    }

    // ========================================================================== //
    // Download the generated HTML file
    // ========================================================================== //

    function download(str, fileName) {
        var file = new Blob([str]);
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(file);
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // ========================================================================== //
    // Load the template and generate the HTML file
    // ========================================================================== //

    function loadTemplate(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', browserAPI.runtime.getURL('template.html'), true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                callback(xhr.responseText);
            }
        };
        xhr.send();
    }

    // ========================================================================== //
    // Initialize the extension
    // ========================================================================== //

    function initialize() {
        browserAPI.management.getAll(function (extensions) {
            var enabled = '';
            var disabled = '';

            var commentEnabled = '';
            var commentDisabled = '';

            extensions.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });

            extensions.forEach(function (extension) {
                var html = '';
                var comment = '';

                var urls = getStoreUrls(extension);
                var statsLink = getStatsUrl(extension.id);
                var statsName = getStatsName();
                var nameAndVersion = `${htmlEscape(extension.name)} ${extension.version}`;

                html += `
                    <li>
                        <a href="${urls.storeUrl}" target="_blank" title="${htmlEscape(extension.description)}">
                            ${nameAndVersion}
                        </a> 
                        <a href="${urls.crxLink}" target="_blank" title="Download CRX file" alt="Download CRX file">
                            <span class="crxdownload-icon"></span>
                        </a> 
                        <a href="${urls.statsLink}" target="_blank" title="${statsName}" alt="${statsName}">
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
            });

            // Retrieve version from the manifest
            const exporterVersion = browserAPI.runtime.getManifest().version;

            loadTemplate(function (template) {
                // Retrieve the extension ID to populate the 'generator' meta tag in the HTML output
                let extensionId = browserAPI.runtime.id;

                // Generate a timestamp based on the user's locale
                let timestamp = new Date().toLocaleString();

                // Generate file timestamp YYYY-MM-DD
                let fileTimestamp = new Date().toISOString().split('T')[0];

                // Determine the generator URL based on the source of the self-extension
                var selfExtensionUrl = browserAPI.runtime.getManifest().homepage_url;
                var generatorUrl = `${urls.storeUrl}${extensionId}`;

                // Determine Chrome or Edge for stats button value
                var statsName = getStatsName();

                // Replace the placeholders in the template with the generated HTML
                template = template.replace('{ENABLED}', enabled.trim())
                    .replaceAll('{TIMESTAMP}', timestamp)
                    .replaceAll('{EXTENSION_ID}', extensionId)
                    .replaceAll('{GENERATOR_URL}', generatorUrl)
                    .replaceAll('{DISABLED}', disabled.trim())
                    .replaceAll('{COMMENT_ENABLED}', commentEnabled.trim())
                    .replaceAll('{COMMENT_DISABLED}', commentDisabled.trim())
                    .replaceAll('{EXPORTER_VERSION}', exporterVersion)
                    .replaceAll('{CRXDOWNLOAD_ICON}', icons.crxDownloadIcon)
                    .replaceAll('{STATS_ICON}', icons.statsIcon)
                    .replaceAll('{STATS_NAME}', statsName)
                    .replaceAll('{CRXCAVATOR_ICON}', icons.crxcavatorIcon);

                // Download the generated HTML file with the date
                download(template, `Extensions ${fileTimestamp}.html`);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', initialize);

})(window, document);