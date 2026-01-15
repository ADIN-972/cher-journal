#!/bin/bash

# Test script for V2 Price Schema APIs
# Prerequisites: Backend running on http://localhost:3000

BASE_URL="http://localhost:3000/api"
ADMIN_EMAIL="admin@cherjournal.com"
ADMIN_PASSWORD="admin123"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to make requests
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local auth_header=$4

  if [ -z "$auth_header" ]; then
    auth_header="Cookie: session_token=$SESSION_TOKEN"
  fi

  if [ -z "$data" ]; then
    curl -s -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "$auth_header"
  else
    curl -s -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "$auth_header" \
      -d "$data"
  fi
}

echo -e "${BLUE}=== V2 Price Schema API Tests ===${NC}\n"

# Step 1: Login to get session token
echo -e "${BLUE}1. Authenticating as admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

SESSION_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"sessionToken":"[^"]*' | cut -d'"' -f4)
if [ -z "$SESSION_TOKEN" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo $LOGIN_RESPONSE
  exit 1
fi
echo -e "${GREEN}✓ Authenticated${NC}\n"

# Step 2: List existing schemas
echo -e "${BLUE}2. Listing price schemas...${NC}"
SCHEMAS=$(make_request GET "/admin/price-schemas")
echo $SCHEMAS | jq '.'
echo ""

# Step 3: Create a new schema
echo -e "${BLUE}3. Creating new price schema...${NC}"
NEW_SCHEMA=$(make_request POST "/admin/price-schemas" \
  '{
    "name": "2026-Q1 Test Schema",
    "description": "Test pricing",
    "priceFreeToRead": 199,
    "pricePaywall": 299,
    "priceEpilogue": 399
  }')

SCHEMA_ID=$(echo $NEW_SCHEMA | jq -r '.id')
if [ -z "$SCHEMA_ID" ] || [ "$SCHEMA_ID" == "null" ]; then
  echo -e "${RED}✗ Failed to create schema${NC}"
  echo $NEW_SCHEMA | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Created schema: $SCHEMA_ID${NC}"
echo $NEW_SCHEMA | jq '.'
echo ""

# Step 4: Get specific schema
echo -e "${BLUE}4. Getting specific schema...${NC}"
GET_SCHEMA=$(make_request GET "/admin/price-schemas/$SCHEMA_ID")
echo $GET_SCHEMA | jq '.'
echo ""

# Step 5: Update schema
echo -e "${BLUE}5. Updating schema prices...${NC}"
UPDATED_SCHEMA=$(make_request PATCH "/admin/price-schemas/$SCHEMA_ID" \
  '{
    "priceFreeToRead": 249,
    "pricePaywall": 349
  }')
echo $UPDATED_SCHEMA | jq '.'
echo ""

# Step 6: List chapter overrides (should be empty)
echo -e "${BLUE}6. Listing chapter overrides (before creating any)...${NC}"
OVERRIDES=$(make_request GET "/admin/chapter-overrides")
echo $OVERRIDES | jq '.'
echo ""

# Step 7: Get first chapter (to create override)
echo -e "${BLUE}7. Getting first chapter...${NC}"
CHAPTERS=$(make_request GET "/admin/chapters")
CHAPTER_ID=$(echo $CHAPTERS | jq -r '.[0].id')
if [ -z "$CHAPTER_ID" ] || [ "$CHAPTER_ID" == "null" ]; then
  echo -e "${RED}✗ No chapters found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Using chapter: $CHAPTER_ID${NC}\n"

# Step 8: Create chapter override
echo -e "${BLUE}8. Creating chapter price override...${NC}"
OVERRIDE=$(make_request POST "/admin/chapters/$CHAPTER_ID/price-override" \
  "{
    \"schemaId\": \"$SCHEMA_ID\",
    \"priceFreeToRead\": 99,
    \"reason\": \"Beta program member\"
  }")

echo $OVERRIDE | jq '.'
OVERRIDE_ID=$(echo $OVERRIDE | jq -r '.id')
echo -e "${GREEN}✓ Created override: $OVERRIDE_ID${NC}\n"

# Step 9: Get chapter override
echo -e "${BLUE}9. Getting chapter override...${NC}"
GET_OVERRIDE=$(make_request GET "/admin/chapters/$CHAPTER_ID/price-override")
echo $GET_OVERRIDE | jq '.'
echo ""

# Step 10: Update chapter override
echo -e "${BLUE}10. Updating chapter override...${NC}"
UPDATE_OVERRIDE=$(make_request PATCH "/admin/chapters/$CHAPTER_ID/price-override" \
  '{
    "priceFreeToRead": 49,
    "reason": "Premium user discount"
  }')
echo $UPDATE_OVERRIDE | jq '.'
echo ""

# Step 11: List all overrides
echo -e "${BLUE}11. Listing all chapter overrides...${NC}"
ALL_OVERRIDES=$(make_request GET "/admin/chapter-overrides")
echo $ALL_OVERRIDES | jq '.'
echo ""

# Step 12: Get price history
echo -e "${BLUE}12. Getting price history (all changes)...${NC}"
HISTORY=$(make_request GET "/admin/price-history")
echo $HISTORY | jq '.'
echo ""

# Step 13: Get price history for specific entity
echo -e "${BLUE}13. Getting price history for schema...${NC}"
SCHEMA_HISTORY=$(make_request GET "/admin/price-history/$SCHEMA_ID")
echo $SCHEMA_HISTORY | jq '.'
echo ""

# Step 14: Deactivate schema
echo -e "${BLUE}14. Deactivating schema...${NC}"
DEACTIVATED=$(make_request POST "/admin/price-schemas/$SCHEMA_ID/deactivate")
echo $DEACTIVATED | jq '.'
echo ""

# Step 15: Reactivate schema
echo -e "${BLUE}15. Reactivating schema...${NC}"
REACTIVATED=$(make_request POST "/admin/price-schemas/$SCHEMA_ID/activate")
echo $REACTIVATED | jq '.'
echo ""

# Step 16: Delete chapter override
echo -e "${BLUE}16. Deleting chapter override...${NC}"
DELETE_OVERRIDE=$(make_request DELETE "/admin/chapters/$CHAPTER_ID/price-override")
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Override deleted${NC}"
else
  echo -e "${RED}✗ Failed to delete override${NC}"
fi
echo ""

# Step 17: Verify deletion
echo -e "${BLUE}17. Verifying override deletion...${NC}"
VERIFY=$(make_request GET "/admin/chapters/$CHAPTER_ID/price-override")
echo $VERIFY | jq '.'
echo ""

echo -e "${GREEN}=== All tests completed ===${NC}"
