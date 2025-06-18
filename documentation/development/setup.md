# Development Environment Setup

## Overview

This document provides instructions for setting up a development environment for the Superhero Application. It covers the necessary tools, dependencies, and configuration needed to run the application locally.

## Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 16.x or later
  - Download from: https://nodejs.org/
  - Verify with: `node -v`

- **npm**: Version 8.x or later (included with Node.js)
  - Verify with: `npm -v`

- **MongoDB**: Version 4.4 or later
  - Download from: https://www.mongodb.com/try/download/community
  - Alternatively, use Docker: `docker run --name mongodb -d -p 27017:27017 mongo:4.4`

- **Git**: Latest version
  - Download from: https://git-scm.com/downloads
  - Verify with: `git --version`

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/eksamen-superhelter.git
cd eksamen-superhelter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root with the following variables:

```
# Server configuration
PORT=3002
NODE_ENV=development

# Session security
SESSION_SECRET=your_strong_session_secret

# MongoDB connection
MONGODB_URI=mongodb://10.12.87.70:27017/superhero-app
MONGODB_LOCAL_URI=mongodb://localhost:27017/superhero-app

# Superhero API
SUPERHERO_API_KEY=827b70542b140115fb17e369951a8fef
```

### 4. Database Setup

You can initialize the database with sample data using:

```bash
# Check MongoDB connection
node scripts/check-mongodb.js

# Initialize database with sample heroes
node scripts/init-db.js
```

Alternatively, for a quicker setup with minimal data:

```bash
node scripts/quick-init.js
```

### 5. Start the Application

For regular development:

```bash
npm start
```

For development with automatic reloading:

```bash
npm install -g nodemon
nodemon app.js
```

The application will be available at:
- Main application: http://localhost:3002
- API endpoints: http://localhost:3002/api

## Project Structure

```
eksamen-superhelter/
├── app.js                  # Main application entry point
├── server-env.js           # Environment config
├── config/                 # Configuration files
├── controllers/            # Request handlers
├── middleware/             # Express middleware
├── models/                 # Mongoose models
├── public/                 # Static assets
│   ├── css/                # Stylesheets
│   ├── images/             # Image assets
│   └── js/                 # Client-side JavaScript
├── routes/                 # Express routes
├── services/               # Business logic
├── utils/                  # Utility functions
├── views/                  # EJS templates
└── scripts/                # Utility scripts
```

## Development Workflow

### Feature Development

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the project structure

3. Test thoroughly:
   - Manual testing of UI flows
   - API endpoint testing (using Postman or similar)
   - Database operations

4. Commit your changes:
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

5. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- Use 2-space indentation
- Follow camelCase for variables and functions
- Use PascalCase for classes and models
- Follow JSDoc standards for documentation

Example:

```javascript
/**
 * Add a superhero to user's favorites
 * @param {string} userId - The user's ID
 * @param {number} heroId - The superhero's ID
 * @param {string} [reason] - Optional reason for favoriting
 * @returns {Promise<boolean>} Success status
 */
async function addHeroToFavorites(userId, heroId, reason = '') {
  try {
    // Implementation
    return true;
  } catch (error) {
    console.error('Failed to add hero to favorites:', error);
    return false;
  }
}
```

### Testing

The project currently uses manual testing. To test:

1. User Authentication
   - Registration
   - Login
   - Profile updates

2. Superhero Functionality
   - Browsing heroes
   - Searching
   - Viewing details
   - Favoriting/unfavoriting

3. API Endpoints
   - Hero search
   - Individual hero retrieval

### Debugging

For debugging Node.js:

1. Using Chrome DevTools:
   ```bash
   node --inspect app.js
   ```
   Then open Chrome and navigate to `chrome://inspect`

2. Using VS Code:
   - Add a launch configuration in `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Launch Program",
         "skipFiles": ["<node_internals>/**"],
         "program": "${workspaceFolder}/app.js"
       }
     ]
   }
   ```

3. Debug endpoints using built-in debug routes:
   - `/debug` for system information
   - Access logs in the console

## MongoDB Administration

### Local Database Management

1. Connect using MongoDB Compass:
   - Download from: https://www.mongodb.com/try/download/compass
   - Connect to: `mongodb://localhost:27017/superhero-app`

2. Basic MongoDB commands:
   ```bash
   # Start MongoDB shell
   mongosh
   
   # Select database
   use superhero-app
   
   # List collections
   show collections
   
   # Query heroes
   db.superheroes.find({ name: /man/i }).limit(5)
   
   # View user data
   db.users.find().projection({ username: 1, email: 1, favorites: 1 })
   ```

### Data Import/Export

1. Export data:
   ```bash
   mongoexport --db superhero-app --collection superheroes --out superheroes.json
   ```

2. Import data:
   ```bash
   mongoimport --db superhero-app --collection superheroes --file superheroes.json
   ```

## Common Issues and Solutions

### MongoDB Connection Problems

**Issue**: Cannot connect to MongoDB
**Solution**:
- Check if MongoDB is running: `ps aux | grep mongo`
- Verify connection string in `.env`
- Check network access if using VM database
- Try using the local MongoDB fallback

### API Rate Limiting

**Issue**: Superhero API returns errors
**Solution**:
- Check for API rate limiting
- Use local database cache more aggressively
- Implement retry logic with exponential backoff

### Session Handling

**Issue**: Session not persisting
**Solution**:
- Check session configuration in app.js
- Verify cookie settings
- Clear browser cookies and try again

## Deployment

### Preparing for Deployment

1. Environment configuration:
   - Set NODE_ENV=production
   - Use secure SESSION_SECRET
   - Configure MongoDB connection string

2. Build process:
   ```bash
   # Install production dependencies only
   npm ci --only=production
   ```

3. Security checks:
   ```bash
   # Check for vulnerabilities
   npm audit
   
   # Fix issues
   npm audit fix
   ```

### VM Deployment

See the detailed instructions in `documentation/vm-deployment.md` for:
- VM setup
- MongoDB configuration
- Application deployment
- Networking and firewall settings

## Additional Resources

- Express.js Documentation: https://expressjs.com/
- Mongoose Documentation: https://mongoosejs.com/docs/
- MongoDB Documentation: https://docs.mongodb.com/
- Bootstrap Documentation: https://getbootstrap.com/docs/

## Contributing

When contributing to this project:

1. Follow the code style guidelines
2. Write clear commit messages
3. Document new features
4. Test thoroughly before submitting
5. Keep dependencies up to date

## Troubleshooting

For assistance with development issues:

1. Check the logs:
   - Application logs in the console
   - MongoDB logs at `/var/log/mongodb/mongod.log` (Linux/Mac) or `C:\Program Files\MongoDB\Server\[version]\log\mongod.log` (Windows)

2. Debugging tools:
   - Node.js Inspector
   - MongoDB Compass
   - Browser DevTools for frontend issues

3. Common solutions:
   - Restart the application: `npm start`
   - Clear your browser cache and cookies
   - Restart MongoDB service if connection issues persist
