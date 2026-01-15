#!/bin/bash

# Test Pricing & Promotions API
# Remplacer les variables avant d'exécuter

BASE_URL="http://localhost:3000"
ADMIN_SESSION="your-admin-session-token"

echo "=== PRICING API TESTS ==="

# 1. Admin crée un prix
echo "1. Créer un prix..."
PRICE_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/prices" \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  -d '{
    "scope": "VOLUME",
    "amountCents": 199,
    "currency": "EUR"
  }')

echo "$PRICE_RESPONSE" | jq .
PRICE_ID=$(echo "$PRICE_RESPONSE" | jq -r '.data.id')
echo "Price ID: $PRICE_ID"

# 2. Admin crée une promotion (20% off pendant 7 jours)
echo -e "\n2. Créer une promotion..."
START_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
END_DATE=$(date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%SZ")

PROMO_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/promotions" \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  -d "{
    \"scope\": \"VOLUME\",
    \"type\": \"PERCENT\",
    \"value\": 20,
    \"startsAt\": \"$START_DATE\",
    \"endsAt\": \"$END_DATE\",
    \"maxUses\": 1000,
    \"perUserLimit\": 5,
    \"priceId\": \"$PRICE_ID\"
  }")

echo "$PROMO_RESPONSE" | jq .
PROMO_ID=$(echo "$PROMO_RESPONSE" | jq -r '.data.id')
echo "Promotion ID: $PROMO_ID"

# 3. Admin vérifie le prix avec promo
echo -e "\n3. Calculer prix final avec promo..."
curl -s -X GET "$BASE_URL/admin/prices/$PRICE_ID/calculate" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  | jq .

# 4. Lecteur récupère le prix d'un volume
echo -e "\n4. Lecteur: Récupérer prix du volume..."
CHAPTER_ID="chapter-test-123"
VOLUME_NUMBER="5"
USER_ID="user-test-456"

curl -s -X GET "$BASE_URL/api/volumes/$CHAPTER_ID/$VOLUME_NUMBER/price?userId=$USER_ID" \
  | jq .

# 5. Vérifier si volume est publié
echo -e "\n5. Lecteur: Vérifier publication du volume..."
curl -s -X GET "$BASE_URL/api/volumes/$CHAPTER_ID/$VOLUME_NUMBER/published" \
  | jq .

# 6. Admin liste tous les prix
echo -e "\n6. Admin: Lister tous les prix..."
curl -s -X GET "$BASE_URL/admin/prices" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  | jq .

# 7. Admin liste toutes les promotions
echo -e "\n7. Admin: Lister toutes les promotions..."
curl -s -X GET "$BASE_URL/admin/promotions" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  | jq .

# 8. Admin filtre promotions par scope
echo -e "\n8. Admin: Filtrer promotions VOLUME"
curl -s -X GET "$BASE_URL/admin/promotions?scope=VOLUME" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  | jq .

# 9. Admin active/désactive une promotion
echo -e "\n9. Admin: Désactiver promotion..."
curl -s -X PATCH "$BASE_URL/admin/promotions/$PROMO_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  -d '{"isActive": false}' \
  | jq .

# 10. Admin réactive la promotion
echo -e "\n10. Admin: Réactiver promotion..."
curl -s -X PATCH "$BASE_URL/admin/promotions/$PROMO_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  -d '{"isActive": true}' \
  | jq .

# 11. Admin met à jour le prix
echo -e "\n11. Admin: Mettre à jour le prix..."
curl -s -X PATCH "$BASE_URL/admin/prices/$PRICE_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  -d '{"amountCents": 249}' \
  | jq .

# 12. Admin supprime la promotion
echo -e "\n12. Admin: Supprimer promotion..."
curl -s -X DELETE "$BASE_URL/admin/promotions/$PROMO_ID" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  | jq .

# 13. Admin supprime le prix
echo -e "\n13. Admin: Supprimer prix..."
curl -s -X DELETE "$BASE_URL/admin/prices/$PRICE_ID" \
  -H "Cookie: sessionToken=$ADMIN_SESSION" \
  | jq .

echo -e "\n=== Tests terminés ==="
