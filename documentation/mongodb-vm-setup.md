# MongoDB VM Configuration Guide

This guide helps set up MongoDB on a separate VM to accept connections from your application VM.

## 1. Check MongoDB Status

SSH into the database VM (10.12.87.70) and check if MongoDB is running:

```bash
sudo systemctl status mongod
```

If it's not running, start it:

```bash
sudo systemctl start mongod
```

## 2. Configure MongoDB to Accept Remote Connections

Edit the MongoDB configuration file:

```bash
sudo nano /etc/mongod.conf
```

Find the `net` section and modify the `bindIp` setting to allow connections from other machines:

```yaml
# network interfaces
net:
  port: 27017
  bindIp: 0.0.0.0  # Allow connections from any IP
```

Save the file and restart MongoDB:

```bash
sudo systemctl restart mongod
```

## 3. Check Firewall Settings

Make sure port 27017 is open in the firewall:

```bash
sudo ufw status
```

If it's not allowed, add a rule:

```bash
sudo ufw allow 27017/tcp
sudo ufw reload
```

## 4. Test Connection from Application VM

From your application VM, test the connection to MongoDB:

```bash
# Install netcat if needed
sudo apt-get install netcat

# Test if port 27017 is reachable
nc -zv 10.12.87.70 27017

# Or try telnet
telnet 10.12.87.70 27017
```

## 5. Create Database and User (Optional but Recommended)

For better security, create a dedicated database user:

```bash
# Connect to MongoDB shell
mongo

# Switch to superhero-app database
use superhero-app

# Create a user
db.createUser({
  user: "superherouser",
  pwd: "securepassword",
  roles: [{ role: "readWrite", db: "superhero-app" }]
})

# Exit MongoDB shell
exit
```

If you create a user, update your connection string in the .env file:

```
MONGODB_URI=mongodb://superherouser:securepassword@10.12.87.70:27017/superhero-app
```

## 6. Troubleshooting

### Connection Timeout
If you get connection timeouts, check:
- MongoDB is running
- bindIp is set correctly
- Firewall allows port 27017
- Network connectivity between VMs is working

### Authentication Failed
If authentication fails after setting up a user:
- Ensure username and password in connection string are correct
- Check that you created the user in the right database
- Verify MongoDB authentication is enabled in mongod.conf

### Database Not Found
The database will be created automatically when data is first inserted, so this usually indicates a connection problem.
