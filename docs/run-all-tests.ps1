# Script PowerShell pour exécuter tous les tests du système de publication
# Usage: .\run-all-tests.ps1

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Tests du Système de Publication - Chapitres & Volumes       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon dossier
if (-Not (Test-Path "test-cron.ts")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis docs/" -ForegroundColor Red
    exit 1
}

# Fonction pour afficher un séparateur
function Show-Separator {
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
}

# Test 1: Publication Automatique (Cron)
Write-Host "📋 Test 1/2: Publication Automatique (Cron)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────" -ForegroundColor Gray

$cronResult = $null
try {
    npx tsx test-cron.ts
    $cronResult = $LASTEXITCODE

    if ($cronResult -eq 0) {
        Write-Host ""
        Write-Host "✅ Test cron terminé avec succès" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Test cron échoué (code: $cronResult)" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'exécution du test cron: $_" -ForegroundColor Red
    $cronResult = 1
}

Show-Separator

# Test 2: Accès Lecteur
Write-Host "📋 Test 2/2: Accès Lecteur" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────" -ForegroundColor Gray

$readerResult = $null
try {
    npx tsx test-reader-access.ts
    $readerResult = $LASTEXITCODE

    if ($readerResult -eq 0) {
        Write-Host ""
        Write-Host "✅ Test accès lecteur terminé avec succès" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Test accès lecteur échoué (code: $readerResult)" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'exécution du test lecteur: $_" -ForegroundColor Red
    $readerResult = 1
}

Show-Separator

# Résumé
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                          RÉSUMÉ                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($cronResult -eq 0 -and $readerResult -eq 0) {
    Write-Host "✅ Tous les tests sont passés avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "  1. Vérifier les résultats ci-dessus"
    Write-Host "  2. Tester via l'interface admin: http://localhost:5174/admin/publishing-calendar"
    Write-Host "  3. Exécuter les tests manuels (voir TEST-COMPLETE-GUIDE.md)"
    Write-Host ""
    exit 0
} else {
    Write-Host "❌ Certains tests ont échoué" -ForegroundColor Red
    Write-Host ""
    if ($cronResult -ne 0) {
        Write-Host "  ❌ Test cron échoué" -ForegroundColor Red
    }
    if ($readerResult -ne 0) {
        Write-Host "  ❌ Test accès lecteur échoué" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Pour débugger:" -ForegroundColor Yellow
    Write-Host "  - Vérifier la connexion à la base de données"
    Write-Host "  - Vérifier que les migrations sont appliquées"
    Write-Host "  - Consulter README-TESTS.md pour plus d'aide"
    Write-Host ""
    exit 1
}
