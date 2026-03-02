#!/bin/bash

# Rollback Script for NSE Intelligence Platform
# Handles emergency rollback to previous deployment

set -e

# Configuration
ENVIRONMENT=${1:-"production"}
TARGET_VERSION=${2:-""}
FORCE_ROLLBACK=${FORCE_ROLLBACK:-false}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Rollback functions
get_available_backups() {
    log_info "Getting available backup versions..."
    
    # Get backup tags from Docker images
    docker images nse-backend --format "table {{.Tag}}" | grep "backup-" | sort -r
}

validate_rollback() {
    local version=$1
    
    log_info "Validating rollback to version: $version"
    
    # Check if backup images exist
    if ! docker images nse-backend --format "{{.Tag}}" | grep -q "^${version}$"; then
        log_error "Backend backup image not found: nse-backend:$version"
        return 1
    fi
    
    if ! docker images nse-frontend --format "{{.Tag}}" | grep -q "^${version}$"; then
        log_error "Frontend backup image not found: nse-frontend:$version"
        return 1
    fi
    
    if ! docker images nse-osint --format "{{.Tag}}" | grep -q "^${version}$"; then
        log_error "OSINT backup image not found: nse-osint:$version"
        return 1
    fi
    
    log_success "Backup validation passed"
    return 0
}

create_rollback_snapshot() {
    log_info "Creating rollback snapshot of current deployment..."
    
    snapshot_tag="snapshot-$(date +%Y%m%d_%H%M%S)"
    
    # Tag current running images
    docker tag nse-backend:latest nse-backend:$snapshot_tag
    docker tag nse-frontend:latest nse-frontend:$snapshot_tag
    docker tag nse-osint:latest nse-osint:$snapshot_tag
    
    log_success "Rollback snapshot created: $snapshot_tag"
    echo "$snapshot_tag" > /tmp/rollback_snapshot_tag
}

perform_rollback() {
    local version=$1
    
    log_info "Performing rollback to version: $version"
    
    # Create snapshot of current state
    create_rollback_snapshot
    
    # Stop current services
    log_info "Stopping current services..."
    docker-compose -f docker-compose.${ENVIRONMENT}.yml down
    
    # Restore backup images
    log_info "Restoring backup images..."
    docker tag nse-backend:$version nse-backend:latest
    docker tag nse-frontend:$version nse-frontend:latest
    docker tag nse-osint:$version nse-osint:latest
    
    # Start services with backup images
    log_info "Starting services with backup images..."
    docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d
    
    log_success "Rollback deployment completed"
}

wait_for_rollback_health() {
    local timeout=180  # 3 minutes for rollback
    local interval=10
    local elapsed=0
    
    log_info "Waiting for rollback to be healthy (timeout: ${timeout}s)..."
    
    while [ $elapsed -lt $timeout ]; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1 && \
           curl -f http://localhost:3000 > /dev/null 2>&1; then
            log_success "Rollback health check passed"
            return 0
        fi
        
        sleep $interval
        elapsed=$((elapsed + interval))
        
        if [ $((elapsed % 30)) -eq 0 ]; then
            log_info "Still waiting for rollback... (${elapsed}s elapsed)"
        fi
    done
    
    log_error "Rollback health check timed out"
    return 1
}

verify_rollback() {
    log_info "Verifying rollback integrity..."
    
    # Check service versions
    backend_version=$(docker inspect nse-backend:latest | jq -r '.[0].Config.Labels.version // "unknown"')
    frontend_version=$(docker inspect nse-frontend:latest | jq -r '.[0].Config.Labels.version // "unknown"')
    osint_version=$(docker inspect nse-osint:latest | jq -r '.[0].Config.Labels.version // "unknown"')
    
    log_info "Service versions after rollback:"
    log_info "  Backend: $backend_version"
    log_info "  Frontend: $frontend_version"
    log_info "  OSINT: $osint_version"
    
    # Run basic functionality tests
    if curl -f http://localhost:3001/api/companies > /dev/null 2>&1; then
        log_success "API functionality verified"
    else
        log_error "API functionality test failed"
        return 1
    fi
    
    log_success "Rollback verification completed"
}

database_rollback() {
    local backup_date=$1
    
    if [ -n "$backup_date" ]; then
        log_info "Rolling back database to: $backup_date"
        
        # Use restore script for database rollback
        ./scripts/restore.sh "$backup_date"
        
        log_success "Database rollback completed"
    else
        log_warning "No database backup specified, skipping database rollback"
    fi
}

cleanup_after_rollback() {
    log_info "Cleaning up after rollback..."
    
    # Remove temporary files
    rm -f /tmp/rollback_snapshot_tag
    
    # Optional: Clean up old backup images (keep last 5)
    old_backups=$(docker images nse-backend --format "{{.Tag}}" | grep "backup-" | tail -n +6)
    if [ -n "$old_backups" ]; then
        echo "$old_backups" | xargs -I {} docker rmi nse-backend:{} 2>/dev/null || true
        echo "$old_backups" | xargs -I {} docker rmi nse-frontend:{} 2>/dev/null || true
        echo "$old_backups" | xargs -I {} docker rmi nse-osint:{} 2>/dev/null || true
        log_info "Cleaned up old backup images"
    fi
    
    log_success "Cleanup completed"
}

notify_rollback() {
    local version=$1
    local status=$2
    
    log_info "Sending rollback notification..."
    
    # Create rollback notification
    notification_message="Rollback to $version completed with status: $status"
    
    # Add to audit log
    echo "$(date): $notification_message" >> /var/log/nse-intelligence/rollback.log
    
    # Send to monitoring system (if configured)
    if command -v curl &> /dev/null && [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
             -H "Content-Type: application/json" \
             -d "{\"text\": \"$notification_message\", \"environment\": \"$ENVIRONMENT\"}" \
             2>/dev/null || true
    fi
    
    log_success "Rollback notification sent"
}

# Interactive rollback prompt
interactive_rollback() {
    log_info "Available backup versions:"
    get_available_backups
    
    echo ""
    read -p "Enter backup version to rollback to (or 'cancel' to exit): " selected_version
    
    if [ "$selected_version" = "cancel" ]; then
        log_info "Rollback cancelled by user"
        exit 0
    fi
    
    if [ -z "$selected_version" ]; then
        log_error "No version selected"
        exit 1
    fi
    
    TARGET_VERSION="$selected_version"
}

# Main rollback flow
main() {
    log_info "Starting rollback process for $ENVIRONMENT environment"
    
    # Set environment variables
    if [ -f ".env.${ENVIRONMENT}" ]; then
        export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
    else
        log_error "Environment file .env.${ENVIRONMENT} not found"
        exit 1
    fi
    
    # Get target version
    if [ -z "$TARGET_VERSION" ]; then
        if [ "$FORCE_ROLLBACK" = "false" ]; then
            interactive_rollback
        else
            log_error "No target version specified and force rollback is disabled"
            exit 1
        fi
    fi
    
    # Validate rollback
    if ! validate_rollback "$TARGET_VERSION"; then
        log_error "Rollback validation failed"
        exit 1
    fi
    
    # Confirm rollback
    if [ "$FORCE_ROLLBACK" = "false" ]; then
        echo ""
        log_warning "You are about to rollback to version: $TARGET_VERSION"
        log_warning "This will replace the current deployment"
        read -p "Are you sure you want to continue? (yes/no): " confirmation
        
        if [ "$confirmation" != "yes" ]; then
            log_info "Rollback cancelled by user"
            exit 0
        fi
    fi
    
    # Perform rollback
    log_info "Starting rollback to $TARGET_VERSION..."
    
    if perform_rollback "$TARGET_VERSION"; then
        # Wait for rollback to be healthy
        if wait_for_rollback_health; then
            # Verify rollback
            if verify_rollback; then
                log_success "Rollback completed successfully!"
                notify_rollback "$TARGET_VERSION" "success"
                
                # Optional database rollback
                if [ -n "$3" ]; then
                    database_rollback "$3"
                fi
            else
                log_error "Rollback verification failed"
                notify_rollback "$TARGET_VERSION" "verification_failed"
                exit 1
            fi
        else
            log_error "Rollback health check failed"
            notify_rollback "$TARGET_VERSION" "health_check_failed"
            exit 1
        fi
    else
        log_error "Rollback deployment failed"
        notify_rollback "$TARGET_VERSION" "deployment_failed"
        exit 1
    fi
    
    # Cleanup
    cleanup_after_rollback
    
    log_info "Rollback process completed"
}

# Handle script interruption
trap 'log_error "Rollback interrupted"; exit 1' INT TERM

# Show usage
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [environment] [version] [database_backup_date]"
    echo ""
    echo "Arguments:"
    echo "  environment        Target environment (production, staging)"
    echo "  version           Backup version to rollback to"
    echo "  database_backup_date  Optional database backup date (YYYYMMDD_HHMMSS)"
    echo ""
    echo "Environment variables:"
    echo "  FORCE_ROLLBACK    Skip confirmation prompts (true/false)"
    echo "  WEBHOOK_URL      Notification webhook URL"
    echo ""
    echo "Examples:"
    echo "  $0 production backup-20231201_120000"
    echo "  $0 staging backup-20231201_110000 20231201_100000"
    echo "  FORCE_ROLLBACK=true $0 production backup-20231201_120000"
    exit 0
fi

# Run main function
main "$@"
