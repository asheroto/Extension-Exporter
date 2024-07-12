# Define the source folder path and output zip file names
$srcFolderPath = "src"
$manifestPath = Join-Path $srcFolderPath "manifest.json"
$destFolderPath = "dist"
$chromeZip = Join-Path $destFolderPath "chrome.zip"
$edgeZip = Join-Path $destFolderPath "edge.zip"

# Read the original manifest
$manifest = Get-Content -Raw -Path $manifestPath | ConvertFrom-Json

# Function to update the manifest and create a zip file
function Update-ManifestAndZip {
    param (
        [string]$updateUrl,
        [string]$zipFileName
    )

    # Update the update_url in the manifest
    $manifest.update_url = $updateUrl

    # Write the updated manifest back to the file, prettified
    $manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath

    # Create the zip file
    if (Test-Path $zipFileName) {
        Remove-Item $zipFileName
    }
    Compress-Archive -Path (Join-Path $srcFolderPath '*') -DestinationPath $zipFileName
}

# Update for Chrome
Update-ManifestAndZip -updateUrl "https://clients2.google.com/service/update2/crx" -zipFileName $chromeZip

# Update for Edge
Update-ManifestAndZip -updateUrl "https://edge.microsoft.com/extensionwebstorebase/v1/crx" -zipFileName $edgeZip

# Restore the original manifest
$manifest.update_url = "https://clients2.google.com/service/update2/crx"
$manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath