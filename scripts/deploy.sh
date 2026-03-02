#!/bin/bash

# Deployment Script for NSE Intelligence Platform
# Handles automated deployment with rollback capabilities

set -e

# Configuration
ENVIRONMENT=${1:-"production"}
VERSION=${2:-"latest"}
BACKUP_BEFORE_DEPLOY=${BACKUP_BEFORE_DEPLOY:-true}
HEALTH_CHECK_TIMEOUT=${HEALTH_CHECK_TIMEOUT:-300}
ROLLBACK_ON_FAILURE=${ROLLBACK_ON_FAILURE:-true}

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

# Deployment functions
check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not available"
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        log_error "Environment file .env.${ENVIRONMENT} not found"
        exit 1
    fi
    
    # Check disk space
    available_space=$(df / | awk 'NR==2 {print $4}')
    min_space=1073741824  # 1GB in bytes
    
    if [ "$available_space" -lt "$min_space" ]; then
        log_error "Insufficient disk space for deployment"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

backup_current_deployment() {
    if [ "$BACKUP_BEFORE_DEPLOY" = "true" ]; then
        log_info "Creating backup of current deployment..."
        
        backup_tag="backup-$(date +%Y%m%d_%H%M%S)"
        
        # Tag current images
        docker tag nse-backend:latest nse-backend:$backup_tag
        docker tag nse-frontend:latest nse-frontend:$backup_tag
        docker tag nse-osint:latest nse-osint:$backup_tag
        
        # Backup database
        if docker-compose -f docker-compose.${ENVIRONMENT}.yml ps | grep -q "postgres.*Up"; then
            ./scripts/backup.sh
            log_success "Database backup completed"
        fi
        
        log_success "Backup completed with tag: $backup_tag"
        echo "$backup_tag" > /tmp/deployment_backup_tag
    fi
}

pull_new_images() {
    log_info "Pulling new Docker images..."
    
    # Pull images based on version
    if [ "$VERSION" = "latest" ]; then
        docker pull nse-backend:latest
        docker pull nse-frontend:latest
        docker pull nse-osint:latest
    else
        docker pull nse-backend:$VERSION
        docker pull nse-frontend:$VERSION
        docker pull nse-osint:$VERSION
        
        # Tag as latest for deployment
        docker tag nse-backend:$VERSION nse-backend:latest
        docker tag nse-frontend:$VERSION nse-frontend:latest
        docker tag nse-osint:$VERSION nse-osint:latest
    fi
    
    log_success "Images pulled successfully"
}

run_database_migrations() {
    log_info "Running database migrations..."
    
    # Start only database service
    docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d postgres
    
    # Wait for database to be ready
    timeout 60 bash -c 'until docker-compose -f docker-compose.'${ENVIRONMENT}'.yml exec -T postgres pg_isready -U nse_user -d nse_intelligence_'${ENVIRONMENT}'; do sleep 2; done'
    
    # Run migrations
    ./scripts/migrate.sh migrate
    
    log_success "Database migrations completed"
}

deploy_services() {
    log_info "Deploying services..."
    
    # Deploy with zero downtime
    if [ "$ENVIRONMENT" = "production" ]; then
        # Blue-green deployment for production
        deploy_blue_green
    else
        # Simple deployment for staging
        deploy_simple
    fi
}

deploy_simple() {
    log_info "Starting simple deployment..."
    
    # Stop old services
    docker-compose -f docker-compose.${ENVIRONMENT}.yml down
    
    # Start new services
    docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d
    
    log_success "Services deployed"
}

deploy_blue_green() {
    log_info "Starting blue-green deployment..."
    
    # Check if green environment exists
    if docker-compose -f docker-compose.green.yml ps | grep -q "Up"; then
        log_info "Green environment is running, deploying to blue..."
        TARGET_ENV="blue"
        CURRENT_ENV="green"
    else
        log_info "Blue environment is running, deploying to green..."
        TARGET_ENV="green"
        CURRENT_ENV="blue"
    fi
    
    # Deploy to target environment
    docker-compose -f docker-compose.${TARGET_ENV}.yml up -d
    
    # Wait for target environment to be healthy
    wait_for_health_check "$TARGET_ENV"
    
    # Switch traffic to target environment
    switch_traffic "$TARGET_ENV"
    
    # Stop old environment
    docker-compose -f docker-compose.${CURRENT_ENV}.yml down
    
    log_success "Blue-green deployment completed"
}

switch_traffic() {
    local target_env=$1
    log_info "Switching traffic to $target_env environment..."
    
    # Update load balancer configuration
    # This would depend on your load balancer (nginx, AWS ALB, etc.)
    # For now, we'll just update nginx configuration
    
    if [ "$target_env" = "green" ]; then
        sed -i 's/backend:3001/backend-green:3001/g' nginx/nginx.conf
    else
        sed -i 's/backend-green:3001/backend:3001/g' nginx/nginx.conf
    fi
    
    # Reload nginx
    docker-compose -f docker-compose.${ENVIRONMENT}.yml restart nginx
    
    log_success "Traffic switched to $target_env"
}

wait_for_health_check() {
    local env_suffix=${1:-""}
    local timeout=$HEALTH_CHECK_TIMEOUT
    local interval=10
    local elapsed=0
    
    log_info "Waiting for services to be healthy (timeout: ${timeout}s)..."
    
    while [ $elapsed -lt $timeout ]; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1 && \
           curl -f http://localhost:3000 > /dev/null 2>&1; then
            log_success "All services are healthy"
            return 0
        fi
        
        sleep $interval
        elapsed=$((elapsed + interval))
        
        if [ $((elapsed % 30)) -eq 0 ]; then
            log_info "Still waiting... (${elapsed}s elapsed)"
        fi
    done
    
    log_error "Health check timed out after ${timeout}s"
    return 1
}

run_post_deployment_tests() {
    log_info "Running post-deployment tests..."
    
    # Basic smoke tests
    if curl -f http://localhost:3001/health > /dev/null; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    if curl -f http://localhost:3000 > /dev/null; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    # API tests
    if curl -f http://localhost:3001/api/companies > /dev/null; then
        log_success "API endpoint test passed"
    else
        log_error "API endpoint test failed"
        return 1
    fi
    
    log_success "Post-deployment tests passed"
}

rollback_deployment() {
    if [ "$ROLLBACK_ON_FAILURE" = "true" ] && [ -f /tmp/deployment_backup_tag ]; then
        backup_tag=$(cat /tmp/deployment_backup_tag)
        log_warning "Rolling back to backup: $backup_tag"
        
        # Restore backup images
        docker tag nse-backend:$backup_tag nse-backend:latest
        docker tag nse-frontend:$backup_tag nse-frontend:latest
        docker tag nse-osint:$backup_tag nse-osint:latest
        
        # Redeploy
        docker-compose -f docker-compose.${ENVIRONMENT}.yml down
        docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d
        
        # Wait for rollback to be healthy
        wait_for_health_check
        
        log_success "Rollback completed"
    else
        log_error "Rollback not available or disabled"
        exit 1
    fi
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove temporary files
    rm -f /tmp/deployment_backup_tag
    
    log_success "Cleanup completed"
}

# Main deployment flow
main() {
    log_info "Starting deployment to $ENVIRONMENT environment"
    log_info "Version: $VERSION"
    
    # Set environment variables
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
    
    # Deployment steps
    check_prerequisites
    backup_current_deployment
    pull_new_images
    run_database_migrations
    
    # Deploy services
    if deploy_services; then
        # Wait for health checks
        if wait_for_health_check; then
            # Run post-deployment tests
            if run_post_deployment_tests; then
                log_success "Deployment completed successfully!"
            else
                log_error "Post-deployment tests failed"
                rollback_deployment
            fi
        else
            log_error "Health checks failed"
            rollback_deployment
        fi
    else
        log_error "Service deployment failed"
        rollback_deployment
    fi
    
    # Cleanup
    cleanup
    
    log_info "Deployment process completed"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
