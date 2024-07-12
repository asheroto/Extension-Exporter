# Define vars
$googleUpdateUrl = "https://clients2.google.com/service/update2/crx"
$edgeUpdateUrl = "https://edge.microsoft.com/extensionwebstorebase/v1/crx"

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
        New-Item -ItemType Directory -Path $folderPath | Out-Null
        Write-Output "Folder created: $folderPath"
    } else {
        Remove-Item -Path (Join-Path $folderPath '*') -Recurse -Force
        Write-Output "Folder cleared: $folderPath"
    }
}

# Function to create a zip file
function Create-ZipFile {
    param (
        [string]$sourceFolder,
        [string]$zipFileName
    )

    # Create the zip file
    Compress-Archive -Path $sourceFolder -DestinationPath $zipFileName -Force

    Write-Output "Zip file created: $zipFileName"
}

# Ensure dist folder and its subfolders exist and are empty
Write-Output "Creating necessary folders and clearing existing content..."
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
    Create-ZipFile -sourceFolder $destFolder -zipFileName $zipFileName
}

# Update for Chrome
Update-ManifestAndZip -updateUrl $googleUpdateUrl -zipFileName $chromeZip -destFolder $chromeFolder

# Update for Edge
Update-ManifestAndZip -updateUrl $edgeUpdateUrl -zipFileName $edgeZip -destFolder $edgeFolder

# Restore the original manifest
$manifest.update_url = $googleUpdateUrl
$manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath

Write-Output "Manifest restored to original update URL."
Write-Output ""
Write-Output "Test extension by reloading extension in browser."