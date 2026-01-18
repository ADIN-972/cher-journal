#!/bin/bash

# Script pour exécuter tous les tests du système de publication
# Usage: ./run-all-tests.sh

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Tests du Système de Publication - Chapitres & Volumes       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "test-cron.ts" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis docs/"
    exit 1
fi

# Vérifier que tsx est disponible
if ! command -v npx &> /dev/null; then
    echo "❌ Erreur: npx n'est pas installé"
    exit 1
fi

# Fonction pour afficher un séparateur
separator() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
}

# Test 1: Publication Automatique (Cron)
echo "📋 Test 1/2: Publication Automatique (Cron)"
echo "─────────────────────────────────────────────────────────────────"
npx tsx test-cron.ts
CRON_EXIT=$?

if [ $CRON_EXIT -eq 0 ]; then
    echo ""
    echo "✅ Test cron terminé avec succès"
else
    echo ""
    echo "❌ Test cron échoué (code: $CRON_EXIT)"
fi

separator

# Test 2: Accès Lecteur
echo "📋 Test 2/2: Accès Lecteur"
echo "─────────────────────────────────────────────────────────────────"
npx tsx test-reader-access.ts
READER_EXIT=$?

if [ $READER_EXIT -eq 0 ]; then
    echo ""
    echo "✅ Test accès lecteur terminé avec succès"
else
    echo ""
    echo "❌ Test accès lecteur échoué (code: $READER_EXIT)"
fi

separator

# Résumé
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                          RÉSUMÉ                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ $CRON_EXIT -eq 0 ] && [ $READER_EXIT -eq 0 ]; then
    echo "✅ Tous les tests sont passés avec succès!"
    echo ""
    echo "Prochaines étapes:"
    echo "  1. Vérifier les résultats ci-dessus"
    echo "  2. Tester via l'interface admin: http://localhost:5174/admin/publishing-calendar"
    echo "  3. Exécuter les tests manuels (voir TEST-COMPLETE-GUIDE.md)"
    echo ""
    exit 0
else
    echo "❌ Certains tests ont échoué"
    echo ""
    if [ $CRON_EXIT -ne 0 ]; then
        echo "  ❌ Test cron échoué"
    fi
    if [ $READER_EXIT -ne 0 ]; then
        echo "  ❌ Test accès lecteur échoué"
    fi
    echo ""
    echo "Pour débugger:"
    echo "  - Vérifier la connexion à la base de données"
    echo "  - Vérifier que les migrations sont appliquées"
    echo "  - Consulter README-TESTS.md pour plus d'aide"
    echo ""
    exit 1
fi
