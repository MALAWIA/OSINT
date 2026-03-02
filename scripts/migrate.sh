#!/bin/bash

# Database Migration Script for NSE Intelligence Platform
# Handles database schema migrations and data seeding

set -e

# Configuration
MIGRATIONS_DIR="database/migrations"
SEEDS_DIR="database/seeds"
DATABASE_URL=${DATABASE_URL:-"postgresql://nse_user:nse_password@localhost:5432/nse_intelligence_prod"}

echo "🗄️ Database Migration Script"
echo "=========================="

# Function to check if migration table exists
check_migration_table() {
    echo "🔍 Checking migration table..."
    psql "$DATABASE_URL" -c "
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    " 2>/dev/null || {
        echo "❌ Failed to connect to database"
        exit 1
    }
    echo "✅ Migration table ready"
}

# Function to get executed migrations
get_executed_migrations() {
    psql "$DATABASE_URL" -t -c "SELECT version FROM schema_migrations ORDER BY version;" 2>/dev/null | tr -d ' ' | grep -v '^$' || true
}

# Function to execute migration
execute_migration() {
    local migration_file=$1
    local version=$(basename "$migration_file" .sql)
    
    echo "🔄 Executing migration: $version"
    
    # Start transaction
    psql "$DATABASE_URL" -c "BEGIN;" || {
        echo "❌ Failed to start transaction"
        exit 1
    }
    
    # Execute migration
    if psql "$DATABASE_URL" < "$migration_file"; then
        # Record migration
        psql "$DATABASE_URL" -c "INSERT INTO schema_migrations (version) VALUES ('$version');" || {
            echo "❌ Failed to record migration"
            psql "$DATABASE_URL" -c "ROLLBACK;"
            exit 1
        }
        
        # Commit transaction
        psql "$DATABASE_URL" -c "COMMIT;" || {
            echo "❌ Failed to commit migration"
            exit 1
        }
        
        echo "✅ Migration $version completed successfully"
    else
        echo "❌ Migration $version failed"
        psql "$DATABASE_URL" -c "ROLLBACK;"
        exit 1
    fi
}

# Function to execute seed
execute_seed() {
    local seed_file=$1
    local seed_name=$(basename "$seed_file" .sql)
    
    echo "🌱 Executing seed: $seed_name"
    
    if psql "$DATABASE_URL" < "$seed_file"; then
        echo "✅ Seed $seed_name completed successfully"
    else
        echo "❌ Seed $seed_name failed"
        exit 1
    fi
}

# Function to rollback migration
rollback_migration() {
    local version=$1
    local migration_file="$MIGRATIONS_DIR/${version}.sql"
    
    if [ ! -f "$migration_file" ]; then
        echo "❌ Migration file not found: $migration_file"
        exit 1
    fi
    
    echo "⏪ Rolling back migration: $version"
    
    # Check if migration has rollback section
    if grep -q "-- ROLLBACK" "$migration_file"; then
        # Extract rollback section
        awk '/-- ROLLBACK/,/^$/ {if ($0 !~ /^-- ROLLBACK/) print}' "$migration_file" > /tmp/rollback.sql
        
        if psql "$DATABASE_URL" < /tmp/rollback.sql; then
            # Remove migration record
            psql "$DATABASE_URL" -c "DELETE FROM schema_migrations WHERE version = '$version';"
            echo "✅ Migration $version rolled back successfully"
        else
            echo "❌ Failed to rollback migration $version"
            exit 1
        fi
        
        rm -f /tmp/rollback.sql
    else
        echo "❌ Migration $version does not support rollback"
        exit 1
    fi
}

# Main execution
case "${1:-migrate}" in
    "migrate")
        echo "🚀 Running database migrations..."
        
        check_migration_table
        
        # Get list of migration files
        if [ ! -d "$MIGRATIONS_DIR" ]; then
            echo "❌ Migrations directory not found: $MIGRATIONS_DIR"
            exit 1
        fi
        
        # Get executed migrations
        executed_migrations=$(get_executed_migrations)
        
        # Run pending migrations
        for migration_file in "$MIGRATIONS_DIR"/*.sql; do
            if [ -f "$migration_file" ]; then
                version=$(basename "$migration_file" .sql)
                
                if ! echo "$executed_migrations" | grep -q "^$version$"; then
                    execute_migration "$migration_file"
                else
                    echo "⏭️ Skipping already executed migration: $version"
                fi
            fi
        done
        
        echo "🎉 All migrations completed!"
        ;;
        
    "seed")
        echo "🌱 Running database seeds..."
        
        # Run all seed files
        if [ -d "$SEEDS_DIR" ]; then
            for seed_file in "$SEEDS_DIR"/*.sql; do
                if [ -f "$seed_file" ]; then
                    execute_seed "$seed_file"
                fi
            done
        else
            echo "ℹ️ No seeds directory found"
        fi
        
        echo "🎉 All seeds completed!"
        ;;
        
    "rollback")
        if [ -z "$2" ]; then
            echo "❌ Usage: $0 rollback <migration_version>"
            echo "📋 Available migrations to rollback:"
            get_executed_migrations | tail -10
            exit 1
        fi
        
        rollback_migration "$2"
        ;;
        
    "status")
        echo "📊 Migration Status:"
        echo "=================="
        
        executed_migrations=$(get_executed_migrations)
        total_migrations=$(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l)
        executed_count=$(echo "$executed_migrations" | wc -l)
        
        echo "📈 Total migrations: $total_migrations"
        echo "✅ Executed migrations: $executed_count"
        echo "⏳ Pending migrations: $((total_migrations - executed_count))"
        echo ""
        echo "📋 Executed migrations:"
        echo "$executed_migrations" | sed 's/^/  ✅ /'
        ;;
        
    "fresh")
        echo "🔄 Fresh migration (reset and migrate)..."
        
        # Drop all tables (dangerous!)
        echo "⚠️ This will delete all data. Are you sure? (y/N)"
        read -r confirmation
        
        if [ "$confirmation" = "y" ] || [ "$confirmation" = "Y" ]; then
            echo "🗑️ Dropping all tables..."
            psql "$DATABASE_URL" -c "
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
                GRANT ALL ON SCHEMA public TO postgres;
                GRANT ALL ON SCHEMA public TO public;
            "
            
            # Run migrations
            "$0" migrate
            
            # Run seeds
            "$0" seed
        else
            echo "❌ Fresh migration cancelled"
        fi
        ;;
        
    "create")
        if [ -z "$2" ]; then
            echo "❌ Usage: $0 create <migration_name>"
            exit 1
        fi
        
        migration_name=$2
        timestamp=$(date +%Y%m%d_%H%M%S)
        migration_file="$MIGRATIONS_DIR/${timestamp}_${migration_name}.sql"
        
        echo "📝 Creating new migration: $migration_file"
        
        cat > "$migration_file" << EOF
-- Migration: ${timestamp}_${migration_name}
-- Description: ${migration_name}

-- Add your migration SQL here

-- ROLLBACK
-- Add rollback SQL here (optional)
EOF
        
        echo "✅ Migration created: $migration_file"
        ;;
        
    *)
        echo "🔧 Database Migration Tool"
        echo "========================"
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  migrate              Run pending migrations"
        echo "  seed                 Run all seeds"
        echo "  rollback <version>   Rollback specific migration"
        echo "  status               Show migration status"
        echo "  fresh                Reset database and run all migrations"
        echo "  create <name>        Create new migration file"
        echo ""
        echo "Examples:"
        echo "  $0 migrate"
        echo "  $0 seed"
        echo "  $0 rollback 001_initial_schema"
        echo "  $0 status"
        exit 1
        ;;
esac
