# Running the App on the VM

To ensure the application correctly connects to the MongoDB VM (at 10.12.87.70), follow these steps:

## Option 1: Use the start-server.sh script
```bash
# Make the script executable
chmod +x start-server.sh

# Run the script
./start-server.sh
```

## Option 2: Use the server-env.js file
```bash
# Run with the environment preloader
node -r ./server-env.js app.js
```

## Option 3: Use npm script
```bash
# Run the server script defined in package.json
npm run server
```

## Option 4: Set environment variable manually
```bash
# Set the MongoDB URI environment variable and run
export MONGODB_URI=mongodb://10.12.87.70:27017/superhero-app
node app.js
```

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
