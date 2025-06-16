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
- CSRF protection

## Installation and Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with necessary environment variables
4. Run the application: `npm start` or `npm run dev` for development

## Network Configuration

The application is designed to work with isolated services:
- Web application server
- MongoDB database server
- DNS server

See IP-plan and network diagram in the documentation folder.
