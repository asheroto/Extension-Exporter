(function (window, document) {
    'use strict';

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

    function loadTemplate(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', chrome.runtime.getURL('template.html'), true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                callback(xhr.responseText);
            }
        };
        xhr.send();
    }

    chrome.management.getAll(function (extensions) {
        var enabled = '';
        var disabled = '';

        var commentEnabled = '';
        var commentDisabled = '';

        var baseUrl = 'https://chrome.google.com/webstore/detail/';

        extensions.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });

        extensions.forEach(function (extension) {
            var html = '';
            var comment = '';

            var url = baseUrl + extension.id;
            var crxLink = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&acceptformat=crx3&x=id%3D${extension.id}%26installsource%3Dondemand%26uc`;
            var nameAndVersion = `${htmlEscape(extension.name)} ${extension.version}`;

            html += '            ';
            html += '<li>';
            html += '<a href="' + url + '" target="_blank" ';
            html += 'title="' + htmlEscape(extension.description) + '">';
            html += nameAndVersion + '</a> ';
            html += '<a href="' + crxLink + '" target="_blank" title="Download CRX file" alt="Download CRX file">';
            html += '<span class="crx-icon"></span>';
            html += '</a>';
            html += '</li>\n';

            comment += nameAndVersion + '\n';
            comment += url + '\n\n';

            if (extension.enabled) {
                enabled += html;
                commentEnabled += comment;
            } else {
                disabled += html;
                commentDisabled += comment;
            }
        });

        // Retrieve version from the manifest
        const exporterVersion = chrome.runtime.getManifest().version;

        // CRX icon encoded in base64
        const crxIcon = 'PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgdmlld0JveD0iMCAwIDIwIDIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMyA4VjJIN3Y2SDJsOCA4IDgtOGgtNXpNMCAxOGgyMHYySDB2LTJ6Ii8+PC9zdmc+';

        loadTemplate(function (template) {
            // Retrieve the extension ID to populate the 'generator' meta tag in the HTML output
            let extensionId = chrome.runtime.id;

            // Generate a timestamp based on the user's locale
            let timestamp = new Date().toLocaleString();

            // Generate file timestamp YYYY-MM-DD
            let fileTimestamp = new Date().toISOString().split('T')[0];

            // Replace the placeholders in the template with the generated HTML
            template = template.replace('{ENABLED}', enabled.trim())
                .replaceAll('{DISABLED}', disabled.trim())
                .replaceAll('{COMMENT_ENABLED}', commentEnabled.trim())
                .replaceAll('{COMMENT_DISABLED}', commentDisabled.trim())
                .replaceAll('{EXTENSION_ID}', extensionId)
                .replaceAll('{TIMESTAMP}', timestamp)
                .replaceAll('{EXPORTER_VERSION}', exporterVersion)
                .replaceAll('{CRX_ICON}', crxIcon);

            // Download the generated HTML file with the date
            download(template, `Extensions ${fileTimestamp}.html`);
        });
    });

})(window, document);