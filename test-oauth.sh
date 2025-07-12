#!/bin/bash

# MDSG OAuth Test Script
# This script helps you test the OAuth setup step by step

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if .env file exists and has credentials
check_env_file() {
    print_header "Checking Environment Configuration"

    if [[ ! -f ".env" ]]; then
        print_error ".env file not found"
        print_info "Creating .env from template..."
        cp .env.example .env
        print_warning "Please edit .env with your GitHub OAuth credentials"
        return 1
    fi

    if grep -q "your_github_client_id_here" .env; then
        print_error ".env file contains placeholder values"
        print_warning "Please edit .env with your actual GitHub OAuth credentials"
        echo ""
        echo "You need to:"
        echo "1. Go to: https://github.com/settings/applications/new"
        echo "2. Create an OAuth app with callback URL: http://localhost:3000"
        echo "3. Update .env with your Client ID and Secret"
        return 1
    fi

    print_success ".env file configured"
    return 0
}

# Test backend server
test_backend() {
    print_header "Testing Backend Server"

    # Start server in background
    npm run server &
    SERVER_PID=$!

    # Wait for server to start
    sleep 3

    # Test health endpoint
    if curl -s http://localhost:3001/health > /dev/null; then
        print_success "Backend server is running"

        # Test if OAuth endpoint exists
        if curl -s -X POST http://localhost:3001/auth/github -H "Content-Type: application/json" -d '{}' | grep -q "error"; then
            print_success "OAuth endpoint is responding"
        else
            print_warning "OAuth endpoint may not be working correctly"
        fi
    else
        print_error "Backend server is not responding"
        kill $SERVER_PID 2>/dev/null || true
        return 1
    fi

    # Cleanup
    kill $SERVER_PID 2>/dev/null || true
    sleep 1
    return 0
}

# Test frontend
test_frontend() {
    print_header "Testing Frontend"

    # Build the frontend
    if npm run build > /dev/null 2>&1; then
        print_success "Frontend builds successfully"
    else
        print_error "Frontend build failed"
        return 1
    fi

    # Start dev server in background
    npm run dev &
    DEV_PID=$!

    # Wait for dev server to start
    sleep 5

    # Test if frontend is accessible
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend server is running at http://localhost:3000"
    else
        print_error "Frontend server is not responding"
        kill $DEV_PID 2>/dev/null || true
        return 1
    fi

    # Cleanup
    kill $DEV_PID 2>/dev/null || true
    sleep 1
    return 0
}

# Main test function
run_full_test() {
    print_header "MDSG OAuth Setup Test"
    echo "This script will test your OAuth configuration"
    echo ""

    # Test dependencies
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi

    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed"
        exit 1
    fi

    print_success "Dependencies available"
    echo ""

    # Install dependencies
    print_info "Installing npm dependencies..."
    if npm install > /dev/null 2>&1; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
    echo ""

    # Test each component
    if check_env_file; then
        echo ""
        if test_backend; then
            echo ""
            if test_frontend; then
                echo ""
                print_success "All tests passed! 🎉"
                echo ""
                echo "Next steps:"
                echo "1. Start backend: npm run server (in Terminal 1)"
                echo "2. Start frontend: npm run dev (in Terminal 2)"
                echo "3. Visit: http://localhost:3000"
                echo "4. Test GitHub login"
                return 0
            fi
        fi
    fi

    echo ""
    print_error "Some tests failed. Please fix the issues above."
    echo ""
    echo "Quick setup guide:"
    echo "1. Go to: https://github.com/settings/applications/new"
    echo "2. Fill in:"
    echo "   - Application name: MDSG Local Development"
    echo "   - Homepage URL: http://localhost:3000"
    echo "   - Authorization callback URL: http://localhost:3000"
    echo "3. Copy Client ID and Secret to .env file"
    echo "4. Run this test again: ./test-oauth.sh"

    return 1
}

# Run the test
run_full_test
