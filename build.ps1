# Define the source folder path and output zip file names
$srcFolderPath = "src"
$manifestPath = Join-Path $srcFolderPath "manifest.json"
$destFolderPath = "dist"
$chromeFolder = Join-Path $destFolderPath "chrome"
$edgeFolder = Join-Path $destFolderPath "edge"
$chromeZip = Join-Path $destFolderPath "chrome.zip"
$edgeZip = Join-Path $destFolderPath "edge.zip"

# Function to create folder if it doesn't exist and clear it if it does
function Ensure-Folder {
    param (
        [string]$folderPath
    )

    if (-not (Test-Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath
    } else {
        Remove-Item -Path (Join-Path $folderPath '*') -Recurse -Force
    }
}

# Ensure dist folder and its subfolders exist and are empty
Ensure-Folder -folderPath $destFolderPath
Ensure-Folder -folderPath $chromeFolder
Ensure-Folder -folderPath $edgeFolder

# Read the original manifest
$manifest = Get-Content -Raw -Path $manifestPath | ConvertFrom-Json

# Function to update the manifest and create a zip file
function Update-ManifestAndZip {
    param (
        [string]$updateUrl,
        [string]$zipFileName,
        [string]$destFolder
    )

    # Update the update_url in the manifest
    $manifest.update_url = $updateUrl

    # Write the updated manifest back to the file, prettified
    $manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath

    # Copy files to the destination folder
    Copy-Item -Path (Join-Path $srcFolderPath '*') -Destination $destFolder -Recurse -Force

    # Create the zip file
    if (Test-Path $zipFileName) {
        Remove-Item $zipFileName
    }
    Compress-Archive -Path (Join-Path $destFolder '*') -DestinationPath $zipFileName
}

# Update for Chrome
Update-ManifestAndZip -updateUrl "https://clients2.google.com/service/update2/crx" -zipFileName $chromeZip -destFolder $chromeFolder

# Update for Edge
Update-ManifestAndZip -updateUrl "https://edge.microsoft.com/extensionwebstorebase/v1/crx" -zipFileName $edgeZip -destFolder $edgeFolder

# Restore the original manifest
$manifest.update_url = "https://clients2.google.com/service/update2/crx"
$manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath