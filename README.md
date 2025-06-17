# Superhero Web Application

A web application for displaying and managing superheroes using data from the Superhero API.

## Features

- Landing page with superhero cards
- Detailed superhero information pages
- User registration and authentication
- Profile management
- Search functionality for superheroes
- Responsive design for mobile and desktop

## Technology Stack

- Node.js with Express.js
- EJS templating engine
- MongoDB database
- Superhero API integration
- BCrypt for password hashing
- Express-session for authentication
- JWT for persistent authentication

## Project Structure

The application follows the MVC (Model-View-Controller) architecture:

- **Models**: Database schemas and data access
- **Views**: EJS templates for rendering pages
- **Controllers**: Business logic and request handling
- **Routes**: API endpoint definitions
- **Config**: Configuration files
- **Middleware**: Custom middleware functions
- **Public**: Static assets (CSS, JavaScript, images)
- **Services**: External API integration

## Security Features

- Password hashing with bcrypt
- Input validation and sanitization
- Protected routes with authentication middleware
- Session management
- JWT for persistent authentication
- HTTP-only cookies

## Installation and Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with necessary environment variables (see `.env.example`)
4. Initialize the database:
   ```
   npm run init-db    # Full initialization
   npm run quick-init  # Quick initialization with fewer heroes
   ```
5. Run the application:
   ```
   npm start         # Production
   npm run dev       # Development with auto-reload
   ```
6. Visit `http://localhost:3000` in your browser

## Environment Variables

The following environment variables should be set in your `.env` file:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://10.12.87.70:27017/superhero-app
SESSION_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret
SUPERHERO_API_KEY=your_api_key
```

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start with nodemon for development
- `npm run test-db` - Test database connection
- `npm run init-db` - Initialize database with superhero data
- `npm run quick-init` - Quick initialization with fewer heroes
- `npm run check-heroes` - Check the superhero data in the database

## Network Configuration

The application is designed to work with isolated services:
- Web application server
- MongoDB database server
- DNS server

See IP-plan and network diagram in the documentation folder.
