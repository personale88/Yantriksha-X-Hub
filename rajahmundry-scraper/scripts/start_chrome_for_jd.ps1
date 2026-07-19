# Start Chrome with remote debugging for JustDial scraping.
# Usage: .\scripts\start_chrome_for_jd.ps1

$chrome = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) {
    $chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $chrome)) {
    Write-Error "Chrome not found. Install Google Chrome."
    exit 1
}

Write-Host "Closing existing Chrome processes..."
Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$profile = Join-Path $env:TEMP "jd-scrape-chrome"
$url = "https://www.justdial.com/Rajahmundry/Jewellery-Showrooms/nct-10282098"

Write-Host "Starting Chrome with debug port 9222..."
Write-Host "Profile: $profile"
Start-Process $chrome -ArgumentList @(
    "--remote-debugging-port=9222",
    "--user-data-dir=$profile",
    $url
)

Write-Host ""
Write-Host "NEXT STEPS:"
Write-Host "1. In the Chrome window that opened, make sure city is Rajahmundry/Rajamahendravaram"
Write-Host "2. Wait until jewellery shop listings appear on screen"
Write-Host "3. In Network tab confirm resultsPageListing shows 200 OK"
Write-Host "4. Run: python main.py --jd-only"
