# Script de migration complete vers l'architecture feature-based

Write-Host "Debut de la migration..." -ForegroundColor Green

# Creer les dossiers necessaires
Write-Host "Creation des dossiers..." -ForegroundColor Yellow

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
    Write-Host "  OK: $folder" -ForegroundColor Gray
}

# Copier les fichiers Routes
Write-Host "Copie des fichiers Routes..." -ForegroundColor Yellow
Get-Content "src/pages/route/RouteREP.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/routes/pages/RouteREP.tsx"
Get-Content "src/pages/route/RouteADMIN.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/routes/pages/RouteADMIN.tsx"
Get-Content "src/pages/route/RouteSUP.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/routes/pages/RouteSUP.tsx"
Write-Host "  Routes copies" -ForegroundColor Green

# Copier les fichiers Data
Write-Host "Copie des fichiers Data..." -ForegroundColor Yellow
Get-Content "src/pages/DataPage.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/data/pages/DataPage.tsx"
Get-Content "src/pages/data/DataREP.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/data/pages/DataREP.tsx"
Get-Content "src/pages/data/DataADMIN.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/data/pages/DataADMIN.tsx"
Get-Content "src/pages/data/DataSUP.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/data/pages/DataSUP.tsx"
Write-Host "  Data copies" -ForegroundColor Green

# Copier les fichiers Profile
Write-Host "Copie des fichiers Profile..." -ForegroundColor Yellow
Get-Content "src/pages/profile/ProfilePageNew.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/profile/pages/ProfilePage.tsx"
Copy-Item "src/pages/profile/components/*" "src/features/profile/components/" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  Profile copies" -ForegroundColor Green

# Copier les fichiers Dashboard
Write-Host "Copie des fichiers Dashboard..." -ForegroundColor Yellow
Get-Content "src/pages/HomePage.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/dashboard/pages/HomePage.tsx"
Get-Content "src/pages/DashboardHome.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/dashboard/pages/DashboardHome.tsx"
Copy-Item "src/pages/home/*" "src/features/dashboard/components/" -Recurse -Force -ErrorAction SilentlyContinue
Get-Content "src/services/dashboardService.ts" -ErrorAction SilentlyContinue | Set-Content "src/features/dashboard/services/dashboardService.ts"
Write-Host "  Dashboard copies" -ForegroundColor Green

# Copier les fichiers Team
Write-Host "Copie des fichiers Team..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/TeamPage.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/team/pages/TeamPage.tsx"
Write-Host "  Team copies" -ForegroundColor Green

# Copier les fichiers Users
Write-Host "Copie des fichiers Users..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/UsersManagement.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/users/pages/UsersManagement.tsx"
Get-Content "src/services/usersService.ts" -ErrorAction SilentlyContinue | Set-Content "src/features/users/services/usersService.ts"
Write-Host "  Users copies" -ForegroundColor Green

# Copier les fichiers PDV
Write-Host "Copie des fichiers PDV..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/PDVManagement.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/pdv/pages/PDVManagement.tsx"
Write-Host "  PDV copies" -ForegroundColor Green

# Copier les fichiers Products
Write-Host "Copie des fichiers Products..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/ProductsManagement.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/products/pages/ProductsManagement.tsx"
Write-Host "  Products copies" -ForegroundColor Green

# Copier les fichiers Tasks
Write-Host "Copie des fichiers Tasks..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/TasksManagement.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/tasks/pages/TasksManagement.tsx"
Write-Host "  Tasks copies" -ForegroundColor Green

# Copier les fichiers Reports
Write-Host "Copie des fichiers Reports..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/ReportsPage.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/reports/pages/ReportsPage.tsx"
Write-Host "  Reports copies" -ForegroundColor Green

# Copier les fichiers Performance
Write-Host "Copie des fichiers Performance..." -ForegroundColor Yellow
Get-Content "src/pages/desktop/PerformancePage.tsx" -ErrorAction SilentlyContinue | Set-Content "src/features/performance/pages/PerformancePage.tsx"
Write-Host "  Performance copies" -ForegroundColor Green

# Copier les fichiers Territories
Write-Host "Copie des fichiers Territories..." -ForegroundColor Yellow
Get-Content "src/services/territoriesService.ts" -ErrorAction SilentlyContinue | Set-Content "src/features/territories/services/territoriesService.ts"
Get-Content "src/store/territoriesStore.ts" -ErrorAction SilentlyContinue | Set-Content "src/features/territories/store/territoriesStore.ts"
Write-Host "  Territories copies" -ForegroundColor Green

# Copier les layouts
Write-Host "Copie des layouts..." -ForegroundColor Yellow
Copy-Item "src/layouts/*" "layouts/" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  Layouts copies" -ForegroundColor Green

Write-Host "Migration terminee avec succes!" -ForegroundColor Green
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "  1. Mettre a jour les imports dans tous les fichiers" -ForegroundColor White
Write-Host "  2. Mettre a jour App.tsx" -ForegroundColor White
Write-Host "  3. Tester l'application" -ForegroundColor White
