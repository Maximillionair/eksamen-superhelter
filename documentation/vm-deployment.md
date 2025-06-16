# Running the App on the VM

The application has been improved to automatically detect and use the correct MongoDB connection URI (10.12.87.70), even if environment variables are missing or incorrect. 

## Recommended Deployment Options

### Option 1: Use the start-server.sh script (Recommended)
```bash
# Make the script executable
chmod +x start-server.sh

# Run the script
./start-server.sh
```
This script will test the database connection first and then start the application.

### Option 2: Use npm scripts
```bash
# Run with VM-specific settings
npm run vm

# Or use the server preloader
npm run server
```

### Option 3: Use the server-env.js file
```bash
# Run with the environment preloader
node -r ./server-env.js app.js
```

### Option 4: Set environment variable manually
```bash
# Set the MongoDB URI environment variable and run
export MONGODB_URI=mongodb://10.12.87.70:27017/superhero-app
node app.js
```

## Enhanced Reliability Features

The application now includes:

1. **Auto-detection of localhost references**: If MONGODB_URI is set to localhost/127.0.0.1, it will automatically use 10.12.87.70 instead.

2. **Connection retry logic**: The app will automatically retry database connections if they fail.

3. **Explicit IPv4 usage**: Configured to use IPv4 addressing to avoid IPv6 complications.

4. **Robust environment variable handling**: Better error handling for missing .env files.

5. **Database connection testing**: Scripts to verify connectivity before starting the app.

## Troubleshooting

If you still see issues with MongoDB connecting to localhost:

1. Check if there's an existing .env file on the VM that might be overriding the MongoDB URI:
   ```bash
   cat .env
   ```

2. Temporarily rename the .env file to ensure it's not causing issues:
   ```bash
   mv .env .env.backup
   ```

3. Try the connection test script to verify MongoDB connectivity:
   ```bash
   MONGODB_URI=mongodb://10.12.87.70:27017/superhero-app node scripts/test-db-connection.js
   ```

4. Check if MongoDB is actually running on the VM at 10.12.87.70:
   ```bash
   # From another VM or server
   telnet 10.12.87.70 27017
   ```
