#!/bin/bash
# Go to project directory (if not already there)
cd "$(dirname "$0")"

# Debug: List files in current directory
echo "Listing files in current directory:"
ls -l
echo ""

# Check Python version and start appropriate server
if command -v python3 &>/dev/null; then
    echo "Starting server with Python 3..."
    echo "Access apps at:"
    echo "  - http://127.0.0.1:8080/flightTracker/"
    echo "  - http://127.0.0.1:8080/admin/"
    echo "  - http://127.0.0.1:8080/globeApp/"
    python3 -m http.server 8080 --bind 127.0.0.1
elif command -v python &>/dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    if [[ $PYTHON_VERSION == *"Python 3"* ]]; then
        echo "Starting server with Python 3..."
        echo "Access apps at:"
        echo "  - http://127.0.0.1:8080/flightTracker/"
        echo "  - http://127.0.0.1:8080/admin/"
        echo "  - http://127.0.0.1:8080/globeApp/"
        python -m http.server 8080 --bind 127.0.0.1
    else
        echo "Starting server with Python 2..."
        python -m SimpleHTTPServer 8080
    fi
else
    echo "Python is not installed. Please install Python or use another server option."
    exit 1
fi