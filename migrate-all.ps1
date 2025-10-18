# Script de migration complète vers l'architecture feature-based

Write-Host "🚀 Début de la migration..." -ForegroundColor Green

# Créer les dossiers nécessaires
Write-Host "`n📁 Création des dossiers..." -ForegroundColor Yellow

$folders = @(
    "src/features/routes/pages",
    "src/features/data/pages",
    "src/features/profile/pages",
    "src/features/profile/components",
    "src/features/dashboard/pages",
    "src/features/dashboard/components",
    "src/features/dashboard/services",
    "src/features/team/pages",
    "src/features/users/pages",
    "src/features/users/services",
    "src/features/pdv/pages",
    "src/features/products/pages",
    "src/features/tasks/pages",
    "src/features/reports/pages",
    "src/features/performance/pages",
    "src/features/territories/services",
    "src/features/territories/store",
    "layouts"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
    Write-Host "  ✓ $folder" -ForegroundColor Gray
}

# Copier les fichiers Routes
Write-Host "`n📋 Copie des fichiers Routes..." -ForegroundColor Yellow
Get-Content "src/pages/route/RouteREP.tsx" | Set-Content "src/features/routes/pages/RouteREP.tsx"
Get-Content "src/pages/route/RouteADMIN.tsx" | Set-Content "src/features/routes/pages/RouteADMIN.tsx"
Get-Content "src/pages/route/RouteSUP.tsx" | Set-Content "src/features/routes/pages/RouteSUP.tsx"
Write-Host "  ✓ Routes copiés" -ForegroundColor Green

# Copier les fichiers Data
Write-Host "`n📊 Copie des fichiers Data..." -ForegroundColor Yellow
Get-Content "src/pages/DataPage.tsx" | Set-Content "src/features/data/pages/DataPage.tsx"
Get-Content "src/pages/data/DataREP.tsx" | Set-Content "src/features/data/pages/DataREP.tsx"
Get-Content "src/pages/data/DataADMIN.tsx" | Set-Content "src/features/data/pages/DataADMIN.tsx"
Get-Content "src/pages/data/DataSUP.tsx" | Set-Content "src/features/data/pages/DataSUP.tsx"
Write-Host "  ✓ Data copiés" -ForegroundColor Green

# Copier les fichiers Profile
Write-Host "`n👤 Copie des fichiers Profile..." -ForegroundColor Yellow
Get-Content "src/pages/profile/ProfilePageNew.tsx" | Set-Content "src/features/profile/pages/ProfilePage.tsx"
Copy-Item "src/pages/profile/components/*" "src/features/profile/components/" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Profile copiés" -ForegroundColor Green

# Copier les fichiers Dashboard
Write-Host "`n🏠 Copie des fichiers Dashboard..." -ForegroundColor Yellow
Get-Content "src/pages/HomePage.tsx" | Set-Content "src/features/dashboard/pages/HomePage.tsx"
Get-Content "src/pages/DashboardHome.tsx" | Set-Content "src/features/dashboard/pages/DashboardHome.tsx"
Copy-Item "src/pages/home/*" "src/features/dashboard/components/" -Recurse -Force -ErrorAction SilentlyContinue
Get-Content "src/services/dashboardService.ts" | Set-Content "src/features/dashboard/services/dashboardService.ts"
Write-Host "  ✓ Dashboard copiés" -ForegroundColor Green

# Copier les fichiers Team
Write-Host "`n👥 Copie des fichiers Team..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/TeamPage.tsx" | Set-Content "src/features/team/pages/TeamPage.tsx" -ErrorAction SilentlyContinue
Write-Host "  ✓ Team copiés" -ForegroundColor Green

# Copier les fichiers Users
Write-Host "`n👨‍💼 Copie des fichiers Users..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/UsersManagement.tsx" | Set-Content "src/features/users/pages/UsersManagement.tsx" -ErrorAction SilentlyContinue
Get-Content "src/services/usersService.ts" | Set-Content "src/features/users/services/usersService.ts" -ErrorAction SilentlyContinue
Write-Host "  ✓ Users copiés" -ForegroundColor Green

# Copier les fichiers PDV
Write-Host "`n🏪 Copie des fichiers PDV..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/PDVManagement.tsx" | Set-Content "src/features/pdv/pages/PDVManagement.tsx" -ErrorAction SilentlyContinue
Write-Host "  ✓ PDV copiés" -ForegroundColor Green

# Copier les fichiers Products
Write-Host "`n📦 Copie des fichiers Products..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/ProductsManagement.tsx" | Set-Content "src/features/products/pages/ProductsManagement.tsx" -ErrorAction SilentlyContinue
Write-Host "  ✓ Products copiés" -ForegroundColor Green

# Copier les fichiers Tasks
Write-Host "`n✅ Copie des fichiers Tasks..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/TasksManagement.tsx" | Set-Content "src/features/tasks/pages/TasksManagement.tsx" -ErrorAction SilentlyContinue
Write-Host "  ✓ Tasks copiés" -ForegroundColor Green

# Copier les fichiers Reports
Write-Host "`n📈 Copie des fichiers Reports..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/ReportsPage.tsx" | Set-Content "src/features/reports/pages/ReportsPage.tsx" -ErrorAction SilentlyContinue
Write-Host "  ✓ Reports copiés" -ForegroundColor Green

# Copier les fichiers Performance
Write-Host "`n⚡ Copie des fichiers Performance..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/PerformancePage.tsx" | Set-Content "src/features/performance/pages/PerformancePage.tsx" -ErrorAction SilentlyContinue
Write-Host "  ✓ Performance copiés" -ForegroundColor Green

# Copier les fichiers Territories
Write-Host "`n🗺️ Copie des fichiers Territories..." -ForegroundColor Yellow
Get-Content "src/services/territoriesService.ts" | Set-Content "src/features/territories/services/territoriesService.ts"
Get-Content "src/store/territoriesStore.ts" | Set-Content "src/features/territories/store/territoriesStore.ts"
Write-Host "  ✓ Territories copiés" -ForegroundColor Green

# Copier les layouts
Write-Host "`n🎨 Copie des layouts..." -ForegroundColor Yellow
Copy-Item "src/layouts/*" "layouts/" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Layouts copiés" -ForegroundColor Green

Write-Host "`n✅ Migration terminée avec succès!" -ForegroundColor Green
Write-Host "`n⚠️  Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Créer les fichiers index.ts pour chaque feature" -ForegroundColor White
Write-Host "  2. Mettre à jour les imports dans tous les fichiers" -ForegroundColor White
Write-Host "  3. Mettre à jour App.tsx" -ForegroundColor White
Write-Host "  4. Tester l'application" -ForegroundColor White
