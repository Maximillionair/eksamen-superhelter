# API Routes Documentation

## Overview

This document provides detailed information about the API routes available in the Superhero Application, including request parameters, response formats, and authentication requirements.

## Base URL

The base URL for all API endpoints depends on your deployment:

- Local Development: `http://localhost:3002/api`
- Production: Depends on your deployment environment

## Authentication

Currently, the API uses the same session-based authentication as the web interface. Future implementations should consider token-based authentication for API-specific access.

## Response Format

API responses follow a consistent structure:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data varies by endpoint
  },
  "pagination": {
    // Included when results are paginated
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description of the error"
  }
}
```

## Available Endpoints

### Hero Endpoints

#### Get Hero by ID

Retrieves detailed information about a specific superhero.

- **URL**: `/api/heroes/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Hero ID (required)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "hero": {
        "id": 123,
        "name": "Superman",
        "slug": "superman",
        "powerstats": {
          "intelligence": "100",
          "strength": "100",
          "speed": "100",
          "durability": "100",
          "power": "100",
          "combat": "85"
        },
        "biography": {
          "fullName": "Clark Kent",
          "alterEgos": "Superman Prime One-Million",
          "aliases": ["Man of Steel", "Man of Tomorrow"],
          "placeOfBirth": "Krypton",
          "firstAppearance": "ACTION COMICS #1",
          "publisher": "DC Comics",
          "alignment": "good"
        },
        "appearance": {
          "gender": "Male",
          "race": "Kryptonian",
          "height": ["6'3", "191 cm"],
          "weight": ["225 lb", "101 kg"],
          "eyeColor": "Blue",
          "hairColor": "Black"
        },
        "image": {
          "url": "https://example.com/images/superman.jpg"
        },
        "favoritesCount": 150
      }
    }
    ```
- **Error Responses**:
  - **Code**: 404 Not Found
    ```json
    {
      "success": false,
      "error": {
        "code": "HERO_NOT_FOUND",
        "message": "Hero with ID 123 not found"
      }
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "error": {
        "code": "SERVER_ERROR",
        "message": "An unexpected error occurred"
      }
    }
    ```
- **Sample Call**:
  ```javascript
  fetch('/api/heroes/123')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  ```

#### Search Heroes

Searches for heroes by name or other criteria.

- **URL**: `/api/heroes/search`
- **Method**: `GET`
- **Query Parameters**:
  - `term`: Search term (required)
  - `page`: Page number for pagination (optional, default: 1)
  - `limit`: Results per page (optional, default: 20)
  - `publisher`: Filter by publisher (optional)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "heroes": [
        {
          "id": 123,
          "name": "Superman",
          "biography": {
            "publisher": "DC Comics"
          },
          "image": {
            "url": "https://example.com/images/superman.jpg"
          },
          "favoritesCount": 150
        },
        {
          "id": 456,
          "name": "Superboy",
          "biography": {
            "publisher": "DC Comics"
          },
          "image": {
            "url": "https://example.com/images/superboy.jpg"
          },
          "favoritesCount": 75
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 3,
        "totalItems": 45,
        "hasNext": true,
        "hasPrev": false
      }
    }
    ```
- **Error Responses**:
  - **Code**: 400 Bad Request
    ```json
    {
      "success": false,
      "error": {
        "code": "INVALID_SEARCH",
        "message": "Search term is required"
      }
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "error": {
        "code": "SERVER_ERROR",
        "message": "An unexpected error occurred"
      }
    }
    ```
- **Sample Call**:
  ```javascript
  fetch('/api/heroes/search?term=super&page=1&limit=10&publisher=DC%20Comics')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  ```

### Top Heroes Endpoints

#### Get Top Heroes

Retrieves the most favorited heroes.

- **URL**: `/api/heroes/top`
- **Method**: `GET`
- **Query Parameters**:
  - `limit`: Number of heroes to return (optional, default: 10)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "heroes": [
        {
          "id": 123,
          "name": "Superman",
          "biography": {
            "publisher": "DC Comics"
          },
          "image": {
            "url": "https://example.com/images/superman.jpg"
          },
          "favoritesCount": 150,
          "rank": 1
        },
        {
          "id": 287,
          "name": "Batman",
          "biography": {
            "publisher": "DC Comics"
          },
          "image": {
            "url": "https://example.com/images/batman.jpg"
          },
          "favoritesCount": 142,
          "rank": 2
        }
      ]
    }
    ```
- **Error Response**:
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "error": {
        "code": "SERVER_ERROR",
        "message": "An unexpected error occurred"
      }
    }
    ```
- **Sample Call**:
  ```javascript
  fetch('/api/heroes/top?limit=5')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  ```

### User Profile Endpoints

#### Get User Profile

Retrieves the current user's profile information.

- **URL**: `/api/profile`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "profile": {
        "username": "superhero_fan",
        "email": "user@example.com",
        "createdAt": "2023-05-15T10:30:00Z",
        "favorites": {
          "count": 5,
          "heroes": [
            {
              "id": 123,
              "name": "Superman",
              "reason": "The original superhero!"
            },
            {
              "id": 287,
              "name": "Batman",
              "reason": "He's Batman!"
            }
          ]
        }
      }
    }
    ```
- **Error Responses**:
  - **Code**: 401 Unauthorized
    ```json
    {
      "success": false,
      "error": {
        "code": "UNAUTHORIZED",
        "message": "Authentication required"
      }
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "error": {
        "code": "SERVER_ERROR",
        "message": "An unexpected error occurred"
      }
    }
    ```
- **Sample Call**:
  ```javascript
  fetch('/api/profile', {
    credentials: 'include' // Include cookies for session authentication
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  ```

#### Get User Favorites

Retrieves the current user's favorite heroes with details.

- **URL**: `/api/profile/favorites`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**:
  - `page`: Page number (optional, default: 1)
  - `limit`: Results per page (optional, default: 20)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "favorites": [
        {
          "hero": {
            "id": 123,
            "name": "Superman",
            "biography": {
              "publisher": "DC Comics"
            },
            "image": {
              "url": "https://example.com/images/superman.jpg"
            }
          },
          "reason": "The original superhero!"
        },
        {
          "hero": {
            "id": 287,
            "name": "Batman",
            "biography": {
              "publisher": "DC Comics"
            },
            "image": {
              "url": "https://example.com/images/batman.jpg"
            }
          },
          "reason": "He's Batman!"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalItems": 2,
        "hasNext": false,
        "hasPrev": false
      }
    }
    ```
- **Error Responses**:
  - **Code**: 401 Unauthorized
    ```json
    {
      "success": false,
      "error": {
        "code": "UNAUTHORIZED",
        "message": "Authentication required"
      }
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "error": {
        "code": "SERVER_ERROR",
        "message": "An unexpected error occurred"
      }
    }
    ```
- **Sample Call**:
  ```javascript
  fetch('/api/profile/favorites', {
    credentials: 'include' // Include cookies for session authentication
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  ```

#### Add Hero to Favorites

Adds a hero to the user's favorites list.

- **URL**: `/api/profile/favorites/:id`
- **Method**: `POST`
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Hero ID (required)
- **Request Body**:
  ```json
  {
    "reason": "Optional reason for favoriting this hero"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Hero added to favorites",
      "favorite": {
        "heroId": 123,
        "reason": "Optional reason for favoriting this hero"
      }
    }
    ```
- **Error Responses**:
  - **Code**: 401 Unauthorized
    ```json
    {
      "success": false,
      "error": {
        "code": "UNAUTHORIZED",
        "message": "Authentication required"
      }
    }
    ```
  - **Code**: 404 Not Found
    ```json
    {
      "success": false,
      "error": {
        "code": "HERO_NOT_FOUND",
        "message": "Hero with ID 123 not found"
      }
    }
    ```
  - **Code**: 409 Conflict
    ```json
    {
      "success": false,
      "error": {
        "code": "ALREADY_FAVORITED",
        "message": "Hero is already in favorites"
      }
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "error": {
        "code": "SERVER_ERROR",
        "message": "An unexpected error occurred"
      }
    }
    ```
- **Sample Call**:
  ```javascript
  fetch('/api/profile/favorites/123', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ reason: "I like this hero's powers" })
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  ```

#### Remove Hero from Favorites

Removes a hero from the user's favorites list.

- **URL**: `/api/profile/favorites/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Hero ID (required)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Hero removed from favorites"
    }
    ```
- **Error Responses**:
  - **Code**: 401 Unauthorized
    ```json
    {
      "success": false,
      "error": {
        "code": "UNAUTHORIZED",
        "message": "Authentication required"
      }
    }
    ```
  - **Code**: 404 Not Found
    ```json
    {
      "success": false,
      "error": {
        "code": "NOT_IN_FAVORITES",
        "message": "Hero is not in favorites"
      }
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "error": {
        "code": "SERVER_ERROR",
        "message": "An unexpected error occurred"
      }
    }
    ```
- **Sample Call**:
  ```javascript
  fetch('/api/profile/favorites/123', {
    method: 'DELETE',
    credentials: 'include'
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  ```

#### Update Favorite Reason

Updates the reason for a favorited hero.

- **URL**: `/api/profile/favorites/:id/reason`
- **Method**: `PUT`
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Hero ID (required)
- **Request Body**:
  ```json
  {
    "reason": "Updated reason for favoriting this hero"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Favorite reason updated",
      "favorite": {
        "heroId": 123,
        "reason": "Updated reason for favoriting this hero"
      }
    }
    ```
- **Error Responses**:
  - **Code**: 401 Unauthorized
    ```json
    {
      "success": false,
      "error": {
        "code": "UNAUTHORIZED",
        "message": "Authentication required"
      }
    }
    ```
  - **Code**: 404 Not Found
    ```json
    {
      "success": false,
      "error": {
        "code": "NOT_IN_FAVORITES",
        "message": "Hero is not in favorites"
      }
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "error": {
        "code": "SERVER_ERROR",
        "message": "An unexpected error occurred"
      }
    }
    ```
- **Sample Call**:
  ```javascript
  fetch('/api/profile/favorites/123/reason', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ reason: "I changed my mind about why I like this hero" })
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  ```

## Status Codes

The API uses the following HTTP status codes:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was invalid or cannot be served
- `401 Unauthorized`: Authentication is required and has failed or has not been provided
- `403 Forbidden`: The server understood the request but refuses to authorize it
- `404 Not Found`: The requested resource could not be found
- `409 Conflict`: The request could not be completed due to a conflict
- `500 Internal Server Error`: An unexpected condition was encountered

## Error Codes

Common error codes returned by the API:

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication is required |
| `HERO_NOT_FOUND` | Requested hero was not found |
| `ALREADY_FAVORITED` | Hero is already in favorites list |
| `NOT_IN_FAVORITES` | Hero is not in favorites list |
| `INVALID_SEARCH` | Search parameters are invalid |
| `SERVER_ERROR` | An unexpected server error occurred |

## Rate Limiting

Currently, the API does not implement rate limiting. Future implementations should consider adding rate limiting for production environments.

## API Versioning

The current API does not use explicit versioning. Future implementations should consider adding API versioning (e.g., `/api/v1/heroes`) to support backwards compatibility when making breaking changes.
