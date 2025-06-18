# Architecture Overview

## System Architecture

The Superhero Application follows a modern 3-tier architecture pattern with clear separation of concerns:

```
┌────────────────┐     ┌────────────────┐      ┌────────────────┐
│                │     │                │      │                │
│  PRESENTATION  │◄───►│   APPLICATION  │◄────►│     DATA       │
│     LAYER      │     │     LAYER      │      │    LAYER       │
│                │     │                │      │                │
└────────────────┘     └────────────────┘      └────────────────┘
       ▲                      ▲                       ▲
       │                      │                       │
       ▼                      ▼                       ▼
┌────────────────┐     ┌────────────────┐      ┌────────────────┐
│   Views (EJS)  │     │  Controllers   │      │   MongoDB      │
│   CSS/JS       │     │  Services      │      │   Mongoose     │
│   Bootstrap    │     │  Middleware    │      │   Models       │
└────────────────┘     └────────────────┘      └────────────────┘
```

### Architecture Components

#### Presentation Layer
The frontend interface that users interact with, built using:
- **EJS** (Embedded JavaScript) templates 
- **Bootstrap** for responsive design
- **Custom CSS** for styling
- **Client-side JavaScript** for dynamic interactions

#### Application Layer
The core business logic of the application:
- **Express.js** for handling HTTP requests and routing
- **Controllers** that process requests and prepare responses
- **Services** that encapsulate business logic and external API interactions
- **Middleware** for authentication, validation, and request processing

#### Data Layer
Manages data persistence and access:
- **MongoDB** as the NoSQL database
- **Mongoose** for object modeling
- **Models** that define data schemas and provide data access methods

## Flow of Data

```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌────────────┐     ┌─────────┐
│  Client  │────►│  Routes  │────►│ Controllers│────►│  Services  │────►│ Models  │
│ Browser  │◄────│          │◄────│            │◄────│            │◄────│         │
└──────────┘     └──────────┘     └────────────┘     └────────────┘     └─────────┘
                                                          │                  │
                                                          ▼                  ▼
                                                    ┌────────────┐     ┌─────────┐
                                                    │ External   │     │ MongoDB │
                                                    │ APIs       │     │ Database│
                                                    └────────────┘     └─────────┘
```

1. **Client Request**: The browser sends an HTTP request to the server
2. **Routing**: Express routes direct the request to the appropriate controller
3. **Controller Processing**: The controller processes the request and may call services
4. **Service Logic**: Services perform business logic, data manipulation, and may call external APIs
5. **Data Access**: Models interact with the MongoDB database for CRUD operations
6. **Response**: Data flows back through the layers to generate the response to the client

## External Dependencies

The application interacts with:
- **Superhero API**: External service providing superhero data
- **MongoDB**: Database for persistent storage, running either locally or on a VM

## Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌───────────┐     ┌──────────────┐
│  Login   │────►│ Authenticate │────►│  Create   │────►│  Protected   │
│  Request │     │ Credentials  │     │  Session  │     │  Resources   │
└──────────┘     └──────────────┘     └───────────┘     └──────────────┘
                        │
                        │
                        ▼
                 ┌────────────┐
                 │ User Model │
                 │ (Password) │
                 └────────────┘
```

1. User submits login credentials
2. Authentication middleware verifies credentials against stored (hashed) passwords
3. Upon success, a session is created with user information
4. Protected routes check for valid session before granting access

## Favorite Heroes System

```
┌──────────┐     ┌─────────────┐     ┌───────────────┐
│  User    │────►│ Add/Remove  │────►│ Update User   │
│  Action  │     │ Favorite    │     │ Model         │
└──────────┘     └─────────────┘     └───────────────┘
                        │                    │
                        │                    ▼
                        │            ┌───────────────┐
                        └───────────►│ Update Hero   │
                                     │ Favorite Count│
                                     └───────────────┘
```

1. User clicks to favorite/unfavorite a hero
2. The system updates the user's favorites list and optional reason
3. The system increments/decrements the hero's favorite count
4. UI reflects changes with updated icon state and tooltips

## Top Heroes System

```
┌──────────────┐     ┌───────────────────┐     ┌─────────────┐
│ Top Heroes   │────►│ Get Heroes Sorted │────►│ Render Top  │
│  Page Request│     │ By Favorite Count │     │ Heroes Page │
└──────────────┘     └───────────────────┘     └─────────────┘
```

1. User requests the top heroes page
2. The system queries heroes sorted by favorite count
3. The page displays heroes in ranked order with favorite counts

## Key Design Patterns

1. **MVC (Model-View-Controller)**: Separation of data, presentation, and control logic
2. **Repository Pattern**: Data access abstracted through service layer
3. **Middleware Pattern**: Request processing pipeline with specialized middleware functions
4. **Dependency Injection**: Services and models injected into controllers
5. **Singleton**: Database connection instance shared across application

This architecture promotes:
- **Maintainability**: Clear separation of concerns makes code easier to maintain
- **Scalability**: Modular design allows components to scale independently
- **Testability**: Isolated components can be tested independently
- **Security**: Authentication middleware consistently protects routes
