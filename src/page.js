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

            html += '            ';
            html += '<li>';
            html += '<a href="' + url + '" target="_blank" ';
            html += 'title="' + htmlEscape(extension.description) + '">';
            html += htmlEscape(extension.name) + '</a>';
            html += '</li>\n';

            comment += extension.name + '\n';
            comment += url + '\n\n';

            if (extension.enabled) {
                enabled += html;
                commentEnabled += comment;
            }
            else {
                disabled += html;
                commentDisabled += comment;
            }
        });


        loadTemplate(function (template) {
            // Retrieve the extension ID to populate the 'generator' meta tag in the HTML output
            let extensionId = chrome.runtime.id;

            // Replace the placeholders in the template with the generated HTML
            template = template.replace('{ENABLED}', enabled.trim())
                .replace('{DISABLED}', disabled.trim())
                .replace('{COMMENT_ENABLED}', commentEnabled.trim())
                .replace('{COMMENT_DISABLED}', commentDisabled.trim())
                .replace('{EXTENSION_ID}', extensionId);

            // Download the generated HTML file
            download(template, 'extensions.html');
        });
    });

})(window, document);