$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromePath = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromePath = $path
        break
    }
}

if ($null -eq $chromePath) {
    Write-Error "Google Chrome could not be found. Please launch Google Chrome manually with: --remote-debugging-port=9222 --user-data-dir=`"C:\Users\VIGNESH\AppData\Local\Google\Chrome\User Data\ScraperProfile`""
    exit 1
}

$profileDir = "C:\Users\VIGNESH\AppData\Local\Google\Chrome\User Data\ScraperProfile"
if (!(Test-Path $profileDir)) {
    New-Item -ItemType Directory -Force -Path $profileDir | Out-Null
}

Write-Host "Launching Google Chrome in Remote Debugging Mode..."
Write-Host "Port: 9222"
Write-Host "Profile: $profileDir"

Start-Process -FilePath $chromePath -ArgumentList "--remote-debugging-port=9222", "--user-data-dir=`"$profileDir`"", "https://www.justdial.com"
