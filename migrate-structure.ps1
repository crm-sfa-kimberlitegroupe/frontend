# Script de Migration de la Structure Frontend
# Ce script migre l'ancienne structure vers la nouvelle architecture feature-based

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MIGRATION STRUCTURE FRONTEND SFA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$srcPath = Join-Path $projectRoot "src"

# Fonction pour créer un dossier s'il n'existe pas
function Ensure-Directory {
    param($path)
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "✓ Créé: $path" -ForegroundColor Green
    }
}

# Fonction pour déplacer un fichier avec gestion des conflits
function Move-FileWithBackup {
    param($source, $destination)
    
    if (-not (Test-Path $source)) {
        Write-Host "⚠ Fichier source introuvable: $source" -ForegroundColor Yellow
        return
    }
    
    $destDir = Split-Path $destination -Parent
    Ensure-Directory $destDir
    
    if (Test-Path $destination) {
        Write-Host "⚠ Le fichier existe déjà: $destination" -ForegroundColor Yellow
        $backup = "$destination.backup"
        Copy-Item $destination $backup -Force
        Write-Host "  → Backup créé: $backup" -ForegroundColor Gray
    }
    
    Move-Item $source $destination -Force
    Write-Host "✓ Déplacé: $(Split-Path $source -Leaf) → $destination" -ForegroundColor Green
}

# Fonction pour mettre à jour les imports dans un fichier
function Update-Imports {
    param($filePath, $oldImport, $newImport)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $newContent = $content -replace [regex]::Escape($oldImport), $newImport
        
        if ($content -ne $newContent) {
            Set-Content $filePath $newContent -NoNewline
            Write-Host "✓ Imports mis à jour: $(Split-Path $filePath -Leaf)" -ForegroundColor Green
        }
    }
}

Write-Host "ÉTAPE 1: Migration des Services" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""

# Migrer authService vers core/auth
$authServiceSrc = Join-Path $srcPath "services\authService.ts"
$authServiceDest = Join-Path $srcPath "core\auth\authService.ts"
if (Test-Path $authServiceSrc) {
    Write-Host "Note: authService.ts existe déjà dans core/auth, vérification..." -ForegroundColor Cyan
    if (Test-Path $authServiceDest) {
        Write-Host "✓ authService.ts déjà dans core/auth" -ForegroundColor Green
    }
}

# Migrer dashboardService vers features/dashboard/services
$dashboardServiceSrc = Join-Path $srcPath "services\dashboardService.ts"
$dashboardServiceDest = Join-Path $srcPath "features\dashboard\services\dashboardService.ts"
Move-FileWithBackup $dashboardServiceSrc $dashboardServiceDest

# Migrer outletsService vers features/pdv/services
$outletsServiceSrc = Join-Path $srcPath "services\outletsService.ts"
$outletsServiceDest = Join-Path $srcPath "features\pdv\services\outletsService.ts"
Move-FileWithBackup $outletsServiceSrc $outletsServiceDest

# Migrer routesService vers features/routes/services
$routesServiceSrc = Join-Path $srcPath "services\routesService.ts"
$routesServiceDest = Join-Path $srcPath "features\routes\services\routesService.ts"
Move-FileWithBackup $routesServiceSrc $routesServiceDest

# Migrer territoriesService vers features/territories/services
$territoriesServiceSrc = Join-Path $srcPath "services\territoriesService.ts"
$territoriesServiceDest = Join-Path $srcPath "features\territories\services\territoriesService.ts"
Move-FileWithBackup $territoriesServiceSrc $territoriesServiceDest

# Migrer usersService vers features/users/services
$usersServiceSrc = Join-Path $srcPath "services\usersService.ts"
$usersServiceDest = Join-Path $srcPath "features\users\services\usersService.ts"
Move-FileWithBackup $usersServiceSrc $usersServiceDest

# Migrer api.ts vers core/api
$apiServiceSrc = Join-Path $srcPath "services\api.ts"
$apiServiceDest = Join-Path $srcPath "core\api\api.ts"
Move-FileWithBackup $apiServiceSrc $apiServiceDest

Write-Host ""
Write-Host "ÉTAPE 2: Migration des Composants" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host ""

# Migrer ProtectedRoute vers core/components
$protectedRouteSrc = Join-Path $srcPath "components\ProtectedRoute.tsx"
$protectedRouteDest = Join-Path $srcPath "core\components\ProtectedRoute.tsx"
if (Test-Path $protectedRouteSrc) {
    if (-not (Test-Path $protectedRouteDest)) {
        Move-FileWithBackup $protectedRouteSrc $protectedRouteDest
    } else {
        Write-Host "✓ ProtectedRoute.tsx déjà dans core/components" -ForegroundColor Green
    }
}

# Migrer BottomNavigation vers core/components
$bottomNavSrc = Join-Path $srcPath "components\BottomNavigation.tsx"
$bottomNavDest = Join-Path $srcPath "core\components\BottomNavigation.tsx"
if (Test-Path $bottomNavSrc) {
    if (-not (Test-Path $bottomNavDest)) {
        Move-FileWithBackup $bottomNavSrc $bottomNavDest
    } else {
        Write-Host "✓ BottomNavigation.tsx déjà dans core/components" -ForegroundColor Green
    }
}

# Migrer Map.tsx vers core/components
$mapSrc = Join-Path $srcPath "components\Map.tsx"
$mapDest = Join-Path $srcPath "core\components\Map.tsx"
Move-FileWithBackup $mapSrc $mapDest

Write-Host ""
Write-Host "ÉTAPE 3: Migration du Store" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host ""

# Migrer territoriesStore vers features/territories/store
$territoriesStoreSrc = Join-Path $srcPath "store\territoriesStore.ts"
$territoriesStoreDest = Join-Path $srcPath "features\territories\store\territoriesStore.ts"
Move-FileWithBackup $territoriesStoreSrc $territoriesStoreDest

Write-Host ""
Write-Host "ÉTAPE 4: Migration des Types" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""

# Vérifier si types/index.ts existe à la racine
$typesSrc = Join-Path $srcPath "types\index.ts"
$typesDest = Join-Path $srcPath "core\types\index.ts"
if (Test-Path $typesSrc) {
    if (Test-Path $typesDest) {
        Write-Host "⚠ Les deux fichiers types/index.ts existent. Fusion manuelle requise." -ForegroundColor Yellow
        Write-Host "  → Ancien: $typesSrc" -ForegroundColor Gray
        Write-Host "  → Nouveau: $typesDest" -ForegroundColor Gray
    } else {
        Move-FileWithBackup $typesSrc $typesDest
    }
}

Write-Host ""
Write-Host "ÉTAPE 5: Suppression des dossiers vides" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# Supprimer les dossiers vides
$foldersToCheck = @(
    (Join-Path $srcPath "services"),
    (Join-Path $srcPath "components"),
    (Join-Path $srcPath "store"),
    (Join-Path $srcPath "types")
)

foreach ($folder in $foldersToCheck) {
    if (Test-Path $folder) {
        $items = Get-ChildItem $folder -Recurse
        if ($items.Count -eq 0) {
            Remove-Item $folder -Recurse -Force
            Write-Host "✓ Supprimé dossier vide: $folder" -ForegroundColor Green
        } else {
            Write-Host "⚠ Dossier non vide (vérification manuelle requise): $folder" -ForegroundColor Yellow
            Get-ChildItem $folder | ForEach-Object {
                Write-Host "  → $($_.Name)" -ForegroundColor Gray
            }
        }
    }
}

# Supprimer contexts/AuthContext.tsx si authStore existe
$authContextPath = Join-Path $srcPath "contexts\AuthContext.tsx"
$authStorePath = Join-Path $srcPath "core\auth\authStore.ts"
if ((Test-Path $authContextPath) -and (Test-Path $authStorePath)) {
    Write-Host ""
    Write-Host "⚠ ATTENTION: AuthContext.tsx et authStore.ts coexistent" -ForegroundColor Yellow
    Write-Host "  Avant de supprimer AuthContext, assurez-vous que tous les composants utilisent authStore" -ForegroundColor Yellow
    Write-Host "  Pour supprimer AuthContext, exécutez: Remove-Item '$authContextPath'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "ÉTAPE 6: Création des fichiers index.ts manquants" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host ""

# Créer index.ts pour features/dashboard/services
$dashboardServicesIndex = Join-Path $srcPath "features\dashboard\services\index.ts"
if (-not (Test-Path $dashboardServicesIndex)) {
    Ensure-Directory (Split-Path $dashboardServicesIndex -Parent)
    @"
export * from './dashboardService';
"@ | Set-Content $dashboardServicesIndex
    Write-Host "✓ Créé: features/dashboard/services/index.ts" -ForegroundColor Green
}

# Créer index.ts pour features/pdv/services
$pdvServicesIndex = Join-Path $srcPath "features\pdv\services\index.ts"
if (-not (Test-Path $pdvServicesIndex)) {
    Ensure-Directory (Split-Path $pdvServicesIndex -Parent)
    @"
export * from './outletsService';
"@ | Set-Content $pdvServicesIndex
    Write-Host "✓ Créé: features/pdv/services/index.ts" -ForegroundColor Green
}

# Créer index.ts pour features/routes/services
$routesServicesIndex = Join-Path $srcPath "features\routes\services\index.ts"
if (-not (Test-Path $routesServicesIndex)) {
    Ensure-Directory (Split-Path $routesServicesIndex -Parent)
    @"
export * from './routesService';
"@ | Set-Content $routesServicesIndex
    Write-Host "✓ Créé: features/routes/services/index.ts" -ForegroundColor Green
}

# Créer index.ts pour features/users/services
$usersServicesIndex = Join-Path $srcPath "features\users\services\index.ts"
if (-not (Test-Path $usersServicesIndex)) {
    Ensure-Directory (Split-Path $usersServicesIndex -Parent)
    @"
export * from './usersService';
"@ | Set-Content $usersServicesIndex
    Write-Host "✓ Créé: features/users/services/index.ts" -ForegroundColor Green
}

# Créer index.ts pour features/territories/services
$territoriesServicesIndex = Join-Path $srcPath "features\territories\services\index.ts"
if (-not (Test-Path $territoriesServicesIndex)) {
    Ensure-Directory (Split-Path $territoriesServicesIndex -Parent)
    @"
export * from './territoriesService';
"@ | Set-Content $territoriesServicesIndex
    Write-Host "✓ Créé: features/territories/services/index.ts" -ForegroundColor Green
}

# Mettre à jour core/components/index.ts
$coreComponentsIndex = Join-Path $srcPath "core\components\index.ts"
if (Test-Path $coreComponentsIndex) {
    $expectedContent = @"
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as BottomNavigation } from './BottomNavigation';
"@
    Set-Content $coreComponentsIndex $expectedContent
    Write-Host "✓ Mis à jour: core/components/index.ts" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MIGRATION TERMINÉE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "1. Exécutez: .\update-imports.ps1 (pour mettre à jour tous les imports)" -ForegroundColor White
Write-Host "2. Vérifiez les fichiers avec .backup et supprimez-les si tout fonctionne" -ForegroundColor White
Write-Host "3. Testez votre application: npm run dev" -ForegroundColor White
Write-Host "4. Supprimez les dossiers vides restants manuellement si nécessaire" -ForegroundColor White
Write-Host ""
Write-Host "Pour annuler la migration, restaurez les fichiers .backup" -ForegroundColor Gray
Write-Host ""
