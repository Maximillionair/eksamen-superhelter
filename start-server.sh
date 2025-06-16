#!/bin/bash
# start-server.sh - Start the application on the server with explicit MongoDB configuration
export MONGODB_URI="mongodb://10.12.87.70:27017/superhero-app"

# Print environment info
echo "=============================================="
echo "Starting Superhero App Server"
echo "MongoDB URI: $MONGODB_URI"
echo "=============================================="

# Start the application
node app.js
