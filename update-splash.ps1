# PowerShell script to update splash screens
# Run this after downloading splash.png from the icon generator

param(
    [Parameter(Mandatory=$true)]
    [string]$SplashImagePath
)

if (!(Test-Path $SplashImagePath)) {
    Write-Error "Splash image not found at: $SplashImagePath"
    Write-Host "Please download the splash.png from the icon generator first"
    exit 1
}

Write-Host "Updating FitTracker splash screens with orange theme..." -ForegroundColor Green

# Define all splash screen locations
$splashLocations = @(
    "android\app\src\main\res\drawable\splash.png",
    "android\app\src\main\res\drawable-land-hdpi\splash.png",
    "android\app\src\main\res\drawable-land-mdpi\splash.png", 
    "android\app\src\main\res\drawable-land-xhdpi\splash.png",
    "android\app\src\main\res\drawable-land-xxhdpi\splash.png",
    "android\app\src\main\res\drawable-land-xxxhdpi\splash.png",
    "android\app\src\main\res\drawable-port-hdpi\splash.png",
    "android\app\src\main\res\drawable-port-mdpi\splash.png",
    "android\app\src\main\res\drawable-port-xhdpi\splash.png", 
    "android\app\src\main\res\drawable-port-xxhdpi\splash.png",
    "android\app\src\main\res\drawable-port-xxxhdpi\splash.png"
)

$updatedCount = 0

foreach ($location in $splashLocations) {
    if (Test-Path $location) {
        try {
            Copy-Item $SplashImagePath $location -Force
            Write-Host "✅ Updated: $location" -ForegroundColor Green
            $updatedCount++
        }
        catch {
            Write-Warning "❌ Failed to update: $location - $($_.Exception.Message)"
        }
    }
    else {
        Write-Warning "⚠️  Path not found: $location"
    }
}

Write-Host "`n🎉 Updated $updatedCount splash screen files!" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: pnpm run build" -ForegroundColor White
Write-Host "2. Run: npx cap sync android" -ForegroundColor White  
Write-Host "3. Run: npx cap open android" -ForegroundColor White
Write-Host "4. Build new APK in Android Studio" -ForegroundColor White
