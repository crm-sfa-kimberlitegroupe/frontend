# Script de Mise à Jour des Imports
# Ce script met à jour tous les imports pour utiliser la nouvelle structure

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MISE A JOUR DES IMPORTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$srcPath = Join-Path $projectRoot "src"

# Fonction pour mettre a jour les imports dans un fichier
function Update-ImportsInFile {
    param($filePath)
    
    if (-not (Test-Path $filePath)) {
        return
    }
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    $fileName = Split-Path $filePath -Leaf
    
    # Remplacements des imports
    $replacements = @{
        # Services
        "from '../services/authService'" = "from '@/core/auth/authService'"
        "from '../../services/authService'" = "from '@/core/auth/authService'"
        "from '../../../services/authService'" = "from '@/core/auth/authService'"
        "from './services/authService'" = "from '@/core/auth/authService'"
        
        "from '../services/dashboardService'" = "from '@/features/dashboard/services'"
        "from '../../services/dashboardService'" = "from '@/features/dashboard/services'"
        "from '../../../services/dashboardService'" = "from '@/features/dashboard/services'"
        
        "from '../services/outletsService'" = "from '@/features/pdv/services'"
        "from '../../services/outletsService'" = "from '@/features/pdv/services'"
        "from '../../../services/outletsService'" = "from '@/features/pdv/services'"
        
        "from '../services/routesService'" = "from '@/features/routes/services'"
        "from '../../services/routesService'" = "from '@/features/routes/services'"
        "from '../../../services/routesService'" = "from '@/features/routes/services'"
        
        "from '../services/territoriesService'" = "from '@/features/territories/services'"
        "from '../../services/territoriesService'" = "from '@/features/territories/services'"
        "from '../../../services/territoriesService'" = "from '@/features/territories/services'"
        
        "from '../services/usersService'" = "from '@/features/users/services'"
        "from '../../services/usersService'" = "from '@/features/users/services'"
        "from '../../../services/usersService'" = "from '@/features/users/services'"
        
        "from '../services/api'" = "from '@/core/api'"
        "from '../../services/api'" = "from '@/core/api'"
        "from '../../../services/api'" = "from '@/core/api'"
        
        # Composants
        "from '../components/ProtectedRoute'" = "from '@/core/components'"
        "from '../../components/ProtectedRoute'" = "from '@/core/components'"
        "from '../../../components/ProtectedRoute'" = "from '@/core/components'"
        "from './components/ProtectedRoute'" = "from '@/core/components'"
        
        "from '../components/BottomNavigation'" = "from '@/core/components'"
        "from '../../components/BottomNavigation'" = "from '@/core/components'"
        "from '../../../components/BottomNavigation'" = "from '@/core/components'"
        "from './components/BottomNavigation'" = "from '@/core/components'"
        
        "from '../components/Map'" = "from '@/core/components/Map'"
        "from '../../components/Map'" = "from '@/core/components/Map'"
        
        # Store
        "from '../store/territoriesStore'" = "from '@/features/territories/store/territoriesStore'"
        "from '../../store/territoriesStore'" = "from '@/features/territories/store/territoriesStore'"
        "from '../../../store/territoriesStore'" = "from '@/features/territories/store/territoriesStore'"
        
        # Contexts (à remplacer par authStore)
        "from '../contexts/AuthContext'" = "from '@/core/auth'"
        "from '../../contexts/AuthContext'" = "from '@/core/auth'"
        "from '../../../contexts/AuthContext'" = "from '@/core/auth'"
        
        # Types
        "from '../types'" = "from '@/core/types'"
        "from '../../types'" = "from '@/core/types'"
        "from '../../../types'" = "from '@/core/types'"
        "from './types'" = "from '@/core/types'"
        
        # Auth
        "from './core/auth'" = "from '@/core/auth'"
        "from '../core/auth'" = "from '@/core/auth'"
        "from '../../core/auth'" = "from '@/core/auth'"
        
        # Core types
        "from './core/types'" = "from '@/core/types'"
        "from '../core/types'" = "from '@/core/types'"
        "from '../../core/types'" = "from '@/core/types'"
    }
    
    # Appliquer tous les remplacements
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $content = $content -replace [regex]::Escape($old), $new
    }
    
    # Si le contenu a change, sauvegarder
    if ($content -ne $originalContent) {
        Set-Content $filePath $content -NoNewline
        Write-Host "[OK] Mis a jour: $fileName" -ForegroundColor Green
        return $true
    }
    
    return $false
}

# Parcourir tous les fichiers TypeScript/TSX
Write-Host "Recherche des fichiers a mettre a jour..." -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Path $srcPath -Include *.ts,*.tsx -Recurse -File
$updatedCount = 0

foreach ($file in $files) {
    $updated = Update-ImportsInFile $file.FullName
    if ($updated) {
        $updatedCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MISE A JOUR TERMINEE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fichiers mis a jour: $updatedCount" -ForegroundColor White
Write-Host ""
Write-Host "PROCHAINES ETAPES:" -ForegroundColor Yellow
Write-Host "1. Verifiez que l'application compile: npm run build" -ForegroundColor White
Write-Host "2. Testez l'application: npm run dev" -ForegroundColor White
Write-Host "3. Verifiez manuellement les imports dans App.tsx et les layouts" -ForegroundColor White
Write-Host ""
