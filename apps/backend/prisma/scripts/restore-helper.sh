#!/bin/bash

# Restore Seed Helper Script
# Simplifies common restore-seed operations
# Usage: bash scripts/restore-helper.sh [command]

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PRISMA_DIR="$( dirname "$SCRIPT_DIR" )"
RESTORE_DATA_PATH="$PRISMA_DIR/seeds/data/restore-data.json"
RESTORE_BACKUP_PATH="$PRISMA_DIR/seeds/data/restore-data.backup.json"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_help() {
    echo "Restore Seed Helper - Database backup and restore operations"
    echo ""
    echo "Usage: bash scripts/restore-helper.sh [command]"
    echo ""
    echo "Commands:"
    echo "  export          Export current database to restore-data.json"
    echo "  export-backup   Export and create timestamped backup"
    echo "  restore         Restore database from restore-data.json"
    echo "  restore-backup  Restore from latest backup"
    echo "  status          Show status of restore data files"
    echo "  list-backups    List all backup files"
    echo "  clean           Remove restore-data.json"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  # Export current state before making changes"
    echo "  bash scripts/restore-helper.sh export"
    echo ""
    echo "  # Commit to git after successful export"
    echo "  git add seeds/data/restore-data.json && git commit -m 'Update test data'"
    echo ""
    echo "  # Restore from backup if something goes wrong"
    echo "  bash scripts/restore-helper.sh restore-backup"
    echo ""
    echo "  # Create timestamped backup before major changes"
    echo "  bash scripts/restore-helper.sh export-backup"
}

export_data() {
    echo -e "${YELLOW}📦 Exporting current database...${NC}"
    cd "$PRISMA_DIR/.."
    npx ts-node "$PRISMA_DIR/scripts/extract-all-data.ts"
    echo ""
    echo -e "${GREEN}✅ Export completed!${NC}"
    echo "File: $RESTORE_DATA_PATH"
}

export_backup() {
    echo -e "${YELLOW}📦 Exporting and creating backup...${NC}"

    # Create export first
    cd "$PRISMA_DIR/.."
    npx ts-node "$PRISMA_DIR/scripts/extract-all-data.ts"

    # Create timestamped backup
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$PRISMA_DIR/seeds/data/restore-data_${TIMESTAMP}.json"
    cp "$RESTORE_DATA_PATH" "$BACKUP_FILE"

    echo ""
    echo -e "${GREEN}✅ Export and backup completed!${NC}"
    echo "Latest:  $RESTORE_DATA_PATH"
    echo "Backup:  $BACKUP_FILE"
}

restore_data() {
    if [ ! -f "$RESTORE_DATA_PATH" ]; then
        echo -e "${RED}❌ Error: restore-data.json not found at $RESTORE_DATA_PATH${NC}"
        echo ""
        echo "First, create an export:"
        echo "  bash scripts/restore-helper.sh export"
        exit 1
    fi

    echo -e "${YELLOW}📥 Restoring database from restore-data.json...${NC}"
    cd "$PRISMA_DIR/.."
    npm run seed
    echo ""
    echo -e "${GREEN}✅ Restore completed!${NC}"
}

restore_backup() {
    if [ ! -f "$RESTORE_BACKUP_PATH" ]; then
        echo -e "${RED}❌ Error: backup file not found${NC}"
        echo ""
        echo "Available backups:"
        bash "$0" list-backups
        exit 1
    fi

    echo -e "${YELLOW}📥 Restoring from backup...${NC}"
    cp "$RESTORE_BACKUP_PATH" "$RESTORE_DATA_PATH"

    cd "$PRISMA_DIR/.."
    npm run seed
    echo ""
    echo -e "${GREEN}✅ Restore from backup completed!${NC}"
}

show_status() {
    echo -e "${YELLOW}📊 Restore Data Status${NC}"
    echo ""

    if [ -f "$RESTORE_DATA_PATH" ]; then
        SIZE=$(du -h "$RESTORE_DATA_PATH" | cut -f1)
        MODIFIED=$(date -r "$RESTORE_DATA_PATH" '+%Y-%m-%d %H:%M:%S')
        echo -e "${GREEN}✓ restore-data.json exists${NC}"
        echo "  Size: $SIZE"
        echo "  Modified: $MODIFIED"
    else
        echo -e "${RED}✗ restore-data.json not found${NC}"
    fi

    echo ""
    echo -e "${YELLOW}Backups:${NC}"
    BACKUP_COUNT=$(ls "$PRISMA_DIR/seeds/data"/restore-data_*.json 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        ls -lh "$PRISMA_DIR/seeds/data"/restore-data_*.json | awk '{print "  " $9 " (" $5 ")"}'
    else
        echo "  No backups found"
    fi
}

list_backups() {
    echo -e "${YELLOW}📋 Available Backups${NC}"
    echo ""

    if ls "$PRISMA_DIR/seeds/data"/restore-data_*.json >/dev/null 2>&1; then
        ls -lh "$PRISMA_DIR/seeds/data"/restore-data_*.json | \
            awk '{printf "  %s (%s) - %s %s\n", $9, $5, $6, $7}'
    else
        echo "  No backups found"
    fi
}

clean_data() {
    if [ ! -f "$RESTORE_DATA_PATH" ]; then
        echo -e "${RED}❌ restore-data.json not found${NC}"
        exit 1
    fi

    echo -e "${YELLOW}⚠️  This will delete restore-data.json${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm "$RESTORE_DATA_PATH"
        echo -e "${GREEN}✅ Deleted: $RESTORE_DATA_PATH${NC}"
    else
        echo "Cancelled."
    fi
}

# Main
COMMAND="${1:-help}"

case "$COMMAND" in
    export)
        export_data
        ;;
    export-backup)
        export_backup
        ;;
    restore)
        restore_data
        ;;
    restore-backup)
        restore_backup
        ;;
    status)
        show_status
        ;;
    list-backups)
        list_backups
        ;;
    clean)
        clean_data
        ;;
    help|--help|-h)
        print_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $COMMAND${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac
