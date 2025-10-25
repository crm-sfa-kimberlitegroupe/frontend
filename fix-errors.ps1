# Script de correction rapide des erreurs de compilation

Write-Host "Correction des erreurs de compilation..." -ForegroundColor Cyan
Write-Host ""

$srcPath = Join-Path $PSScriptRoot "src"

# 1. Corriger RouteManager.tsx - territoryId -> territory
$routeManagerPath = Join-Path $srcPath "features\routes\pages\RouteManager.tsx"
if (Test-Path $routeManagerPath) {
    $content = Get-Content $routeManagerPath -Raw
    $content = $content -replace 'currentUser\?\.territoryId', 'currentUser?.territory'
    $content = $content -replace 'user\?\.territoryId', 'user?.territory'
    Set-Content $routeManagerPath $content -NoNewline
    Write-Host "[OK] Corrige: RouteManager.tsx (territoryId -> territory)" -ForegroundColor Green
}

# 2. Corriger PDVFormWizard.tsx - territoryId -> territory
$pdvFormPath = Join-Path $srcPath "features\visits\components\PDVFormWizard.tsx"
if (Test-Path $pdvFormPath) {
    $content = Get-Content $pdvFormPath -Raw
    $content = $content -replace 'user\.territoryId', 'user.territory'
    $content = $content -replace 'user\?\.territoryId', 'user?.territory'
    Set-Content $pdvFormPath $content -NoNewline
    Write-Host "[OK] Corrige: PDVFormWizard.tsx (territoryId -> territory)" -ForegroundColor Green
}

# 3. Corriger ProfilePage.tsx - photoUrl -> photo
$profilePagePath = Join-Path $srcPath "features\profile\pages\ProfilePage.tsx"
if (Test-Path $profilePagePath) {
    $content = Get-Content $profilePagePath -Raw
    $content = $content -replace 'user\?\.photoUrl', 'user?.photo'
    Set-Content $profilePagePath $content -NoNewline
    Write-Host "[OK] Corrige: ProfilePage.tsx (photoUrl -> photo)" -ForegroundColor Green
}

# 4. Corriger TeamPage.tsx - supprimer setTeam non utilise
$teamPagePath = Join-Path $srcPath "features\team\pages\TeamPage.tsx"
if (Test-Path $teamPagePath) {
    $content = Get-Content $teamPagePath -Raw
    $content = $content -replace 'const \[team, setTeam\]', 'const [team]'
    Set-Content $teamPagePath $content -NoNewline
    Write-Host "[OK] Corrige: TeamPage.tsx (supprime setTeam)" -ForegroundColor Green
}

# 5. Corriger PDVDetailsModal.tsx - pencil -> edit
$pdvDetailsPath = Join-Path $srcPath "features\visits\components\PDVDetailsModal.tsx"
if (Test-Path $pdvDetailsPath) {
    $content = Get-Content $pdvDetailsPath -Raw
    $content = $content -replace 'name="pencil"', 'name="edit"'
    Set-Content $pdvDetailsPath $content -NoNewline
    Write-Host "[OK] Corrige: PDVDetailsModal.tsx (pencil -> edit)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Corrections terminees !" -ForegroundColor Green
Write-Host "Testez maintenant: npm run build" -ForegroundColor Yellow
Write-Host ""
