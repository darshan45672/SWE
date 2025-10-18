#!/bin/bash

# SWE Platform - Podman Management Script
# This script helps manage the containerized application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if podman-compose is installed
check_requirements() {
    if ! command -v podman &> /dev/null; then
        print_error "Podman is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v podman-compose &> /dev/null; then
        print_warning "podman-compose not found. You can use 'podman compose' (built-in) instead."
        COMPOSE_CMD="podman compose"
    else
        COMPOSE_CMD="podman-compose"
    fi
}

# Show help
show_help() {
    cat << EOF
SWE Platform - Podman Management Script

Usage: ./podman-manage.sh [command]

Commands:
    start           Start all services
    stop            Stop all services
    restart         Restart all services
    build           Build all containers
    rebuild         Rebuild all containers from scratch (no cache)
    logs            Show logs from all services
    logs-backend    Show backend logs
    logs-frontend   Show frontend logs
    logs-mongodb    Show MongoDB logs
    status          Show status of all services
    ps              List running containers
    shell-backend   Access backend shell
    shell-frontend  Access frontend shell
    shell-db        Access MongoDB shell
    prisma-studio   Open Prisma Studio
    prisma-push     Push Prisma schema to database
    flush-db        Flush all database data
    clean           Stop and remove all containers and volumes
    health          Check health of all services
    help            Show this help message

Examples:
    ./podman-manage.sh start
    ./podman-manage.sh logs-backend
    ./podman-manage.sh shell-backend

EOF
}

# Start services
start_services() {
    print_info "Starting all services..."
    $COMPOSE_CMD up -d
    print_success "Services started successfully!"
    print_info "Access the application at:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend:  http://localhost:3001"
    echo "  - MongoDB:  localhost:27017"
}

# Stop services
stop_services() {
    print_info "Stopping all services..."
    $COMPOSE_CMD down
    print_success "Services stopped successfully!"
}

# Restart services
restart_services() {
    print_info "Restarting all services..."
    $COMPOSE_CMD restart
    print_success "Services restarted successfully!"
}

# Build containers
build_containers() {
    print_info "Building containers..."
    $COMPOSE_CMD build
    print_success "Containers built successfully!"
}

# Rebuild containers from scratch
rebuild_containers() {
    print_warning "This will rebuild all containers from scratch..."
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Rebuilding containers..."
        $COMPOSE_CMD build --no-cache
        print_success "Containers rebuilt successfully!"
    fi
}

# Show logs
show_logs() {
    $COMPOSE_CMD logs -f
}

show_backend_logs() {
    $COMPOSE_CMD logs -f backend
}

show_frontend_logs() {
    $COMPOSE_CMD logs -f frontend
}

show_mongodb_logs() {
    $COMPOSE_CMD logs -f mongodb
}

# Show status
show_status() {
    $COMPOSE_CMD ps
}

# Access backend shell
shell_backend() {
    print_info "Accessing backend container..."
    podman exec -it swe-backend sh
}

# Access frontend shell
shell_frontend() {
    print_info "Accessing frontend container..."
    podman exec -it swe-frontend sh
}

# Access MongoDB shell
shell_mongodb() {
    print_info "Accessing MongoDB shell..."
    podman exec -it swe-mongodb mongosh
}

# Open Prisma Studio
prisma_studio() {
    print_info "Opening Prisma Studio..."
    print_warning "Prisma Studio will be available at http://localhost:5555"
    podman exec -it swe-backend npx prisma studio
}

# Push Prisma schema
prisma_push() {
    print_info "Pushing Prisma schema to database..."
    podman exec -it swe-backend npx prisma db push
    print_success "Prisma schema pushed successfully!"
}

# Flush database
flush_database() {
    print_warning "This will delete ALL data from the database!"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Flushing database..."
        podman exec -it swe-backend npx tsx scripts/flush-db.ts
        print_success "Database flushed successfully!"
    fi
}

# Clean everything
clean_all() {
    print_warning "This will stop and remove all containers and volumes!"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        $COMPOSE_CMD down -v
        print_success "Cleanup completed!"
    fi
}

# Check health
check_health() {
    print_info "Checking service health..."
    echo ""
    
    # Check MongoDB
    if curl -s http://localhost:27017 > /dev/null 2>&1; then
        print_success "MongoDB is healthy"
    else
        print_error "MongoDB is not responding"
    fi
    
    # Check Backend
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend is not responding"
    fi
    
    # Check Frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi
}

# Main script
check_requirements

case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    build)
        build_containers
        ;;
    rebuild)
        rebuild_containers
        ;;
    logs)
        show_logs
        ;;
    logs-backend)
        show_backend_logs
        ;;
    logs-frontend)
        show_frontend_logs
        ;;
    logs-mongodb)
        show_mongodb_logs
        ;;
    status|ps)
        show_status
        ;;
    shell-backend)
        shell_backend
        ;;
    shell-frontend)
        shell_frontend
        ;;
    shell-db)
        shell_mongodb
        ;;
    prisma-studio)
        prisma_studio
        ;;
    prisma-push)
        prisma_push
        ;;
    flush-db)
        flush_database
        ;;
    clean)
        clean_all
        ;;
    health)
        check_health
        ;;
    help|*)
        show_help
        ;;
esac
