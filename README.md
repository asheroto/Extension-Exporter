https://github.com/asheroto/Extension-Exporter/assets/49938263/c348aceb-dfaa-4e33-a903-c5886fb9a342

[![Release](https://img.shields.io/github/v/release/asheroto/Extension-Exporter)](https://github.com/asheroto/Extension-Exporter/releases)
[![GitHub Release Date - Published_At](https://img.shields.io/github/release-date/asheroto/Extension-Exporter)](https://github.com/asheroto/Extension-Exporter/releases)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/doikmfpjbcjjimnbablebijofdbgfepb)](https://chromewebstore.google.com/detail/extension-exporter/doikmfpjbcjjimnbablebijofdbgfepb)
[![GitHub Downloads - All Releases](https://img.shields.io/github/downloads/asheroto/Extension-Exporter/total)](https://github.com/asheroto/Extension-Exporter/releases)
[![GitHub Sponsor](https://img.shields.io/github/sponsors/asheroto?label=Sponsor&logo=GitHub)](https://github.com/sponsors/asheroto)
<a href="https://ko-fi.com/asheroto"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Ko-Fi Button" height="20px"></a>
<a href="https://www.buymeacoffee.com/asheroto"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=asheroto&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me a Coffee" height="40px"></a>

# Extension Exporter

Extension Exporter is a Chrome extension designed to export the names and URLs of all your installed extensions into an HTML file. This extension is fully open-source to ensure transparency and safety.

## Stores

Available on both the [Chrome Web Store](https://chromewebstore.google.com/detail/extension-exporter/doikmfpjbcjjimnbablebijofdbgfepb) and [Microsoft Edge-Addons](https://microsoftedge.microsoft.com/addons/detail/extension-exporter/oejmelcbffojcocoodfdkkmmidolpeoo).

## Features

- **Export Installed Extensions**: Organize installed extension names and homepage URLs into an offline HTML file (no dependencies).
- **Local Execution**: All code runs locally without connecting to remote servers.
- **Easy-to-use**: Click the extension button to instantly generate the HTML file.
- **Cross-browser compatibility**: Currently functions on both Chrome and Edge browsers.
- **Table Layout**: Each section is a table with name, version, ID, description, and links columns.
- **Separate Enabled and Disabled Extensions**: Clearly distinguish between enabled and disabled extensions.
- **Separate Apps and Themes**: Apps and themes are listed in their own sections instead of mixed in with extensions. Only legacy Chrome Apps are visible to extensions, and their section is hidden when you have none. Web apps added with "Install app" are not visible, so the Help page points you to `chrome://apps` or `edge://apps` for those.
- **Light and Dark Themes**: The export follows your system's light or dark setting, prints in light, and stays fully self-contained with no external fonts or files.
- **Extension IDs**: Shows each extension's ID. Click an ID to copy it, which is handy for browser policies such as force-install lists.
- **Copy AI Prompt**: Copies a ready-made prompt listing every extension by name, version, ID, and store. Paste it into any AI assistant to get a security and privacy review of what you have installed. Nothing is sent anywhere by the extension. You choose where to paste it.
- **Text-only Listing**: Opens a plain text listing, including CRX links, ready to copy, print, or save.
- **Download JSON or CSV**: Saves the full listing, including IDs, descriptions, and links, as a JSON file or as a CSV file that opens in Excel.
- **Toggle Stats**: View extension stats using [Chrome-Stats.com](https://chrome-stats.com/) or [Edge-Stats.com](https://edge-stats.com/). These sites provide statistics on the usage, popularity, and ratings of Chrome and Edge extensions, aiding users in assessing their reliability and performance.
- **Toggle Security Report**: Access [CRXaminer](https://crxaminer.tech/) reports for Chrome Web Store extensions, covering permissions, a risk rating, and the remote servers the extension contacts. This replaces CRXcavator, which Cisco shut down.

## Installation

This extension is available on the [Chrome Web Store](https://chromewebstore.google.com/detail/extension-exporter/doikmfpjbcjjimnbablebijofdbgfepb). This is the recommended installation approach. Alternatively, you can install the CRX file in releases.

## Open Source

This extension is fully open-source to ensure both transparency and security. You can view and even contribute to the source code.

## Feature Removal  

Some features have been **removed** due to Chrome security changes or discontinued services.

- **CRX Download Links and Toggle** - Removed because Chrome prevents direct CRX downloads from external HTML files. Use the CRX link from the text-only listing or the JSON download with `wget`, `curl`, or the [CRX Extractor/Downloader](https://chromewebstore.google.com/detail/crx-extractordownloader/ajkhmmldknmfjnmeedkbkkojgobmljda) extension.
- **CRXcavator Report** - Replaced by the CRXaminer security report, because CRXcavator is no longer online.
**Manually installed CRX files also won't update automatically**, so we recommend installing from the **Chrome Web Store** or **Edge Add-ons Store** for updates and security patches.

## Contributing Guidelines

We value community contributions and encourage you to get involved. For issues, feature requests, or code contributions, please visit our GitHub repository.

- If you come across any issues, open a new issue on GitHub.
- To suggest new features, you can also submit an issue.
- If you wish to contribute code, we accept Pull Requests. Be sure to read our [contributing guidelines](https://github.com/asheroto/Extension-Exporter/blob/main/CONTRIBUTING.md) for the required code style.

Detailed instructions on how to contribute can be found on the [contributing guidelines](https://github.com/asheroto/Extension-Exporter/blob/main/CONTRIBUTING.md) page. Thank you for helping to improve our Chrome extension.

## Support

If you found this extension helpful and want to show your appreciation, consider making a small donation to the developer. Your support is greatly appreciated and helps keep the coffee flowing, allowing me to continue working on other cool projects like this!

[![Buy Me a Coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=asheroto&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff)](https://www.buymeacoffee.com/asheroto)

## Rate and Feedback

If you enjoyed using this extension, please take a moment to [rate it on the Chrome Web Store](https://chromewebstore.google.com/detail/extension-exporter/doikmfpjbcjjimnbablebijofdbgfepb).

For feature requests and bug reports, visit the [Issues](https://github.com/asheroto/Extension-Exporter/issues) tab.