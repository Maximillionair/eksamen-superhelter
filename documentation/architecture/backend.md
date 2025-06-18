# Backend Architecture Documentation

## Overview

The backend of the Superhero Application is built on Node.js with Express.js, following a modular architecture with clear separation of concerns. The system uses MongoDB for data persistence and integrates with external APIs for superhero data.

## Technology Stack

- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Axios**: HTTP client for external API requests
- **Express-session**: Session management
- **Bcrypt.js**: Password hashing
- **Connect-flash**: Flash messages
- **EJS**: Server-side templating

## Directory Structure

```
├── app.js                  # Application entry point
├── server-env.js           # Environment variable handling
├── config/
│   ├── database.js         # Database connection logic
│   └── jwt.js              # JWT configuration
├── controllers/
│   ├── apiController.js    # API endpoint handlers
│   ├── authController.js   # Authentication logic
│   ├── profileController.js# User profile handlers
│   ├── superheroController.js# Superhero handlers
│   └── topHeroesController.js# Top heroes functionality
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validators.js       # Input validation
├── models/
│   ├── Superhero.js        # Superhero data model
│   └── User.js             # User data model
├── routes/
│   ├── api.js              # API routes
│   ├── auth.js             # Authentication routes
│   ├── index.js            # Main routes
│   ├── profile.js          # Profile routes
│   ├── superhero.js        # Superhero routes
│   └── top-heroes.js       # Top heroes routes
├── services/
│   └── superheroService.js # Business logic for heroes
└── utils/
    └── jwt.js              # JWT helper functions
```

## Component Architecture

### Express Application Structure

The application follows a layered architecture:

```
┌─────────────┐
│   Routes    │ ◄─── HTTP Requests
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Middleware  │ ◄─── Cross-cutting concerns
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Controllers │ ◄─── Request handling
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  Services   │ ◄─── Business logic
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Models    │ ◄─── Data access
└─────────────┘
```

### Request Flow

1. **HTTP Request**: Client sends request to a specific route
2. **Routing**: Express router directs to appropriate controller method
3. **Middleware**: Request passes through authentication, validation middleware
4. **Controller**: Processes request, may call services
5. **Service**: Implements business logic, interacts with models and external APIs
6. **Model**: Performs database operations
7. **Response**: Controller sends response back to client

## Core Components

### Controllers

Controllers handle HTTP requests and prepare responses:

1. **authController.js**
   - User registration and login/logout
   - Password management
   - Session handling

2. **superheroController.js**
   - Hero listing and pagination
   - Hero details retrieval
   - Search functionality
   - API integration for hero data

3. **profileController.js**
   - User profile management
   - Favorite heroes management
   - User settings

4. **topHeroesController.js**
   - Top heroes ranking display
   - Sorting heroes by popularity

5. **apiController.js**
   - JSON API endpoints
   - Data formatting for client consumption

### Services

Services encapsulate business logic:

1. **superheroService.js**
   - External API interaction
   - Hero data transformation
   - Caching strategies
   - Top heroes calculation
   - Database operations for heroes

### Models

Models define data structures and database interactions:

1. **User.js**
   - User account information
   - Password hashing
   - Favorites management
   - Method to store favorite reasons

2. **Superhero.js**
   - Hero attributes and powers
   - Nested schemas for complex data
   - Popularity tracking via favorites count

### Middleware

Middleware functions for cross-cutting concerns:

1. **auth.js**
   - Authentication checking
   - Route protection
   - User session validation

2. **validators.js**
   - Input validation
   - Sanitization
   - Validation error handling

## Database Schema

### User Schema

```javascript
{
  username: String,       // Unique username
  email: String,          // Unique email
  password: String,       // Hashed password
  createdAt: Date,        // Account creation timestamp
  favoriteHeroes: [Number], // Array of hero IDs
  favoriteReasons: [{     // Array of reasons for favorites
    heroId: Number,       // Hero ID
    reason: String        // User's reason for liking
  }]
}
```

### Superhero Schema

```javascript
{
  id: Number,             // Unique hero ID from API
  name: String,           // Hero name
  slug: String,           // URL-friendly name
  powerstats: {           // Hero abilities
    intelligence: String,
    strength: String,
    speed: String,
    durability: String,
    power: String,
    combat: String
  },
  biography: {            // Background information
    fullName: String,
    alterEgos: String,
    aliases: [String],
    placeOfBirth: String,
    firstAppearance: String,
    publisher: String,
    alignment: String
  },
  appearance: {           // Physical attributes
    gender: String,
    race: String,
    height: [String],
    weight: [String],
    eyeColor: String,
    hairColor: String
  },
  work: {                 // Occupation info
    occupation: String,
    base: String
  },
  connections: {          // Relationships
    groupAffiliation: String,
    relatives: String
  },
  image: {                // Hero image
    url: String
  },
  fetchedAt: Date,        // Last API fetch timestamp
  favoritesCount: Number  // Number of users who favorited
}
```

## Authentication System

The application uses session-based authentication:

1. **Registration Flow**:
   - Validate user input
   - Check for existing users
   - Hash password with bcrypt
   - Create user record
   - Redirect to login

2. **Login Flow**:
   - Validate credentials
   - Compare password hash
   - Create session
   - Store user in session
   - Redirect to protected area

3. **Session Management**:
   - Express-session for session handling
   - Cookie-based session storage
   - Flash messages for user feedback

## External API Integration

The application integrates with the Superhero API:

1. **API Client**:
   - Axios for HTTP requests
   - Centralized in superheroService.js
   - Error handling and retry logic

2. **Data Transformation**:
   - API response mapping to application schema
   - Data normalization and cleanup

3. **Caching Strategy**:
   - Store API data in local database
   - Use timestamp to determine when to refresh
   - Fallback to cached data on API failure

## Error Handling

Comprehensive error handling strategy:

1. **Controller Level**:
   - Try/catch blocks around async operations
   - Flash messages for user feedback
   - Graceful redirects on error

2. **Service Level**:
   - Detailed error logging
   - Error classification
   - Default values on failure

3. **Express Error Middleware**:
   - Centralized error handling
   - Different responses based on environment
   - Stack traces in development only

## Database Connection Management

Robust connection handling implemented in `database.js`:

1. **Connection Pool**:
   - Mongoose connection pooling
   - Connection retry logic

2. **Failover Strategy**:
   - Try VM connection first
   - Fall back to local MongoDB
   - Graceful degradation on failure

3. **Connection Events**:
   - Logging of connection states
   - Reconnection on disconnect
   - Error handling for connection issues

## Performance Considerations

1. **Query Optimization**:
   - Lean queries for read operations
   - Selective field projection
   - Proper indexing on frequently queried fields

2. **Caching**:
   - API response caching
   - Metadata caching

3. **Pagination**:
   - All list endpoints support pagination
   - Efficient skip/limit implementation

## Security Measures

1. **Password Security**:
   - Bcrypt hashing with salt rounds
   - No plain-text password storage

2. **Input Validation**:
   - Server-side validation for all inputs
   - Sanitization to prevent injection

3. **Session Security**:
   - Secure cookies
   - CSRF protection
   - Session timeout

## Scalability Considerations

1. **Stateless Design**:
   - Minimize session dependency
   - Preparation for horizontal scaling

2. **Database Scaling**:
   - Index optimization
   - Query performance monitoring

3. **Modular Architecture**:
   - Components can be extracted to microservices
   - Clean separation of concerns
