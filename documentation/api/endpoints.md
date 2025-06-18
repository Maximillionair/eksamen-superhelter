# API Endpoints Documentation

## Overview
This document outlines all API endpoints available in the Superhero Application. The application follows a modular structure with RESTful principles for web routes and API interaction.

## Web Routes

### Authentication Routes (`/auth`)

#### Register User
- **Endpoint**: `GET /auth/register`
- **Description**: Displays the registration page
- **Controller**: `authController.getRegister`
- **Access**: Public, not authenticated users only

#### Submit Registration
- **Endpoint**: `POST /auth/register`
- **Description**: Creates a new user account
- **Controller**: `authController.postRegister`
- **Middleware**: Username/email/password validation
- **Request Body**:
  ```
  username: string (3-30 chars)
  email: string (valid email format)
  password: string (min 6 chars)
  ```
- **Response**: Redirects to login page on success, or registration page with errors

#### Login Page
- **Endpoint**: `GET /auth/login`
- **Description**: Displays the login page
- **Controller**: `authController.getLogin`
- **Access**: Public, not authenticated users only

#### Submit Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticates user and creates session
- **Controller**: `authController.postLogin`
- **Middleware**: Email/password validation
- **Request Body**:
  ```
  email: string
  password: string
  ```
- **Response**: Redirects to home page on success or login page with errors

#### Logout
- **Endpoint**: `GET /auth/logout`
- **Description**: Terminates user session
- **Controller**: `authController.logout`
- **Response**: Redirects to home page

### Superhero Routes

#### Home Page
- **Endpoint**: `GET /`
- **Description**: Displays homepage with paginated superhero listings
- **Controller**: `superheroController.getIndex`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Heroes per page (default: 20)

#### Hero Details
- **Endpoint**: `GET /superhero/:id`
- **Description**: Displays detailed information about a specific hero
- **Controller**: `superheroController.getSuperhero`
- **URL Parameters**:
  - `id`: Hero ID

#### Search Page
- **Endpoint**: `GET /superhero/search`
- **Description**: Displays search results for superheroes
- **Controller**: `superheroController.searchSuperheroes`
- **Query Parameters**:
  - `term`: Search term
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20)

#### API Search
- **Endpoint**: `GET /superhero/api-search`
- **Description**: Searches heroes from external API
- **Controller**: `superheroController.apiSearch`
- **Query Parameters**:
  - `term`: Search term

#### Add To Database
- **Endpoint**: `POST /superhero/add-to-database`
- **Description**: Adds a hero from external API to local database
- **Controller**: `superheroController.addToDatabase`
- **Request Body**:
  ```
  heroId: number (external API ID)
  ```

#### Batch Fetch
- **Endpoint**: `POST /superhero/batch`
- **Description**: Fetches multiple heroes from API and adds to database
- **Controller**: `superheroController.fetchHeroBatch`
- **Access**: Should be admin-only, currently open

### Profile Routes (`/profile`)

#### User Profile Page
- **Endpoint**: `GET /profile`
- **Description**: Displays user profile with favorite heroes
- **Controller**: `profileController.getProfile`
- **Middleware**: `isAuthenticated`
- **Access**: Authenticated users only
- **Protocol**: Forces HTTP (not HTTPS) via `ensureHttp` middleware

#### Update Profile
- **Endpoint**: `POST /profile`
- **Description**: Updates user profile information
- **Controller**: `profileController.updateProfile`
- **Middleware**: `isAuthenticated`
- **Access**: Authenticated users only
- **Request Body**:
  ```
  username: string
  email: string
  ```
- **Protocol**: Forces HTTP (not HTTPS)

#### Change Password
- **Endpoint**: `POST /profile/password`
- **Description**: Updates user password
- **Controller**: `profileController.changePassword`
- **Middleware**: `isAuthenticated`
- **Access**: Authenticated users only
- **Request Body**:
  ```
  currentPassword: string
  newPassword: string
  confirmPassword: string
  ```
- **Protocol**: Forces HTTP (not HTTPS)

#### Add to Favorites
- **Endpoint**: `POST /profile/favorites/:id/add`
- **Description**: Adds a superhero to user's favorites
- **Controller**: `profileController.addToFavorites`
- **Middleware**: `isAuthenticated`
- **URL Parameters**:
  - `id`: Hero ID
- **Request Body** (optional):
  ```
  reason: string (why user likes this hero)
  ```
- **Protocol**: Forces HTTP (not HTTPS)

#### Remove from Favorites
- **Endpoint**: `POST /profile/favorites/:id/remove`
- **Description**: Removes a superhero from user's favorites
- **Controller**: `profileController.removeFromFavorites`
- **Middleware**: `isAuthenticated`
- **URL Parameters**:
  - `id`: Hero ID
- **Protocol**: Forces HTTP (not HTTPS)

### Top Heroes Routes (`/top-heroes`)

#### Top Heroes Page
- **Endpoint**: `GET /top-heroes`
- **Description**: Displays the top 10 most favorited heroes
- **Controller**: `topHeroesController.getTopHeroes`
- **Access**: Public

## API Routes (`/api`)

#### Search Heroes API
- **Endpoint**: `GET /api/heroes/search`
- **Description**: JSON API for searching superheroes
- **Controller**: `apiController.searchHeroes`
- **Query Parameters**:
  - `term`: Search term
  - `limit`: Maximum results (default: 20)
- **Response Format**:
  ```json
  {
    "success": true,
    "heroes": [
      {
        "id": 123,
        "name": "Superman",
        "image": { "url": "..." },
        "biography": { ... },
        "powerstats": { ... },
        ...
      }
    ]
  }
  ```

#### Get Hero by ID API
- **Endpoint**: `GET /api/heroes/:id`
- **Description**: JSON API for retrieving specific hero details
- **Controller**: `apiController.getHero`
- **URL Parameters**:
  - `id`: Hero ID
- **Response Format**:
  ```json
  {
    "success": true,
    "hero": {
      "id": 123,
      "name": "Superman",
      "image": { "url": "..." },
      "biography": { ... },
      "powerstats": { ... },
      ...
    }
  }
  ```

## Debug Routes (`/debug`)

- The application includes various debug endpoints for developer use
- These endpoints provide system status, connection information, and diagnostic tools
- In a production environment, these routes should be either disabled or protected with administrative access controls
