# Database Architecture Documentation

## Overview

The Superhero Application uses MongoDB, a NoSQL document database, for data persistence. The database architecture is designed to efficiently store and retrieve superhero data and user information, including the favorites system.

## Database Technology

- **MongoDB**: NoSQL document database
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB and Node.js
- **Connection Pooling**: Optimized connection management

## Database Connection Strategy

The application implements a robust connection strategy in `config/database.js`:

```javascript
// Primary VM connection with fallback to local
async function connectToDatabase() {
  const vmMongoUri = process.env.MONGODB_URI || 'mongodb://10.12.87.70:27017/superhero-app';
  const localMongoUri = 'mongodb://localhost:27017/superhero-app';

  try {
    // First attempt - VM connection
    await mongoose.connect(vmMongoUri, options);
    global.isVmEnvironment = true;
    return true;
  } catch (vmErr) {
    // Fallback - local connection
    try {
      await mongoose.connect(localMongoUri, options);
      global.isVmEnvironment = false;
      return true;
    } catch (localErr) {
      // Both connection attempts failed
      global.isVmEnvironment = false;
      return false;
    }
  }
}
```

Key features:
1. **Failover mechanism**: VM → Local
2. **Connection monitoring**: Event listeners track connection state
3. **Reconnection logic**: Automatic reconnect on disconnect
4. **Error handling**: Graceful degradation when database is unavailable

## Schema Design

### User Schema

```
User
├── username: String [required, unique, indexed]
├── email: String [required, unique, indexed]
├── password: String [required, hashed]
├── createdAt: Date
├── favoriteHeroes: [Number] (Array of hero IDs)
└── favoriteReasons: [
      ├── heroId: Number
      └── reason: String
    ]
```

Key design decisions:
1. **Embedded favoriteReasons**: Optimized for read operations on user profile
2. **Array of hero IDs**: Efficient storage of favorites with references to Superhero documents
3. **Indexes**: Username and email fields are indexed for faster lookup during authentication

### Superhero Schema

```
Superhero
├── id: Number [required, unique, indexed]
├── name: String [required, indexed]
├── slug: String
├── powerstats: Object
│   ├── intelligence: String
│   ├── strength: String
│   ├── speed: String
│   ├── durability: String
│   ├── power: String
│   └── combat: String
├── biography: Object
│   ├── fullName: String
│   ├── alterEgos: String
│   ├── aliases: [String]
│   ├── placeOfBirth: String
│   ├── firstAppearance: String
│   ├── publisher: String [indexed]
│   └── alignment: String
├── appearance: Object
│   ├── gender: String
│   ├── race: String
│   ├── height: [String]
│   ├── weight: [String]
│   ├── eyeColor: String
│   └── hairColor: String
├── work: Object
│   ├── occupation: String
│   └── base: String
├── connections: Object
│   ├── groupAffiliation: String
│   └── relatives: String
├── image: Object
│   └── url: String
├── fetchedAt: Date
└── favoritesCount: Number [indexed]
```

Key design decisions:
1. **Nested document structure**: Maps directly to the external API structure
2. **Denormalized design**: Optimized for read performance since hero data rarely changes
3. **Counter field**: `favoritesCount` tracks popularity without requiring aggregation queries
4. **Indexes**: Fields used for searching (name, publisher) and sorting (favoritesCount) are indexed

## Database Relationships

### User to Superhero Relationship

```
┌─────────┐                   ┌───────────┐
│  User   │                   │ Superhero │
├─────────┤                   ├───────────┤
│ _id     │                   │ id        │
│ username│                   │ name      │
│ email   │                   │ ...       │
│ password│                   │ favorites │
└─────────┘                   └───────────┘
     │                              ▲
     │                              │
     │      favoriteHeroes          │
     └─────────────────────────────┘
```

- **Type**: Many-to-Many relationship
- **Implementation**: Array of superhero IDs stored in User document
- **Denormalization**: Favorite reasons stored in User document for efficient profile page loading

## Data Access Patterns

### Common Queries

1. **User Authentication**
   ```javascript
   // Find user by email for login
   const user = await User.findOne({ email });
   ```

2. **Superhero Listing with Pagination**
   ```javascript
   // Get paginated heroes
   const heroes = await Superhero.find()
     .sort({ name: 1 })
     .skip((page - 1) * limit)
     .limit(limit)
     .lean();
   ```

3. **Search by Name**
   ```javascript
   // Search heroes by name using case-insensitive regex
   const heroes = await Superhero.find({ 
     name: { $regex: searchTerm, $options: 'i' } 
   }).lean();
   ```

4. **Top Heroes by Favorites**
   ```javascript
   // Get top heroes sorted by favorite count
   const topHeroes = await Superhero.find()
     .sort({ favoritesCount: -1 })
     .limit(10)
     .lean();
   ```

5. **User Favorites with Hero Details**
   ```javascript
   // Get user's favorite heroes
   const user = await User.findById(userId);
   const favoriteHeroes = await Superhero.find({ 
     id: { $in: user.favoriteHeroes } 
   }).lean();
   ```

### Favorite Management Operations

1. **Add to Favorites**
   ```javascript
   // Update user's favorites and increment hero's count
   await User.findByIdAndUpdate(userId, {
     $addToSet: { favoriteHeroes: heroId }
   });
   await Superhero.findOneAndUpdate(
     { id: heroId },
     { $inc: { favoritesCount: 1 } }
   );
   ```

2. **Remove from Favorites**
   ```javascript
   // Remove from user's favorites and decrement hero's count
   await User.findByIdAndUpdate(userId, {
     $pull: { favoriteHeroes: heroId }
   });
   await Superhero.findOneAndUpdate(
     { id: heroId },
     { $inc: { favoritesCount: -1 } }
   );
   ```

3. **Add/Update Favorite Reason**
   ```javascript
   // Set reason for a favorite hero
   await User.findOneAndUpdate(
     { _id: userId, 'favoriteReasons.heroId': heroId },
     { $set: { 'favoriteReasons.$.reason': reason } }
   );
   ```

## Indexing Strategy

The database uses strategic indexing to optimize query performance:

### User Collection Indexes

```javascript
// Username index for profile lookups
UserSchema.index({ username: 1 });

// Email index for authentication
UserSchema.index({ email: 1 });
```

### Superhero Collection Indexes

```javascript
// Primary ID index from external API
SuperheroSchema.index({ id: 1 }, { unique: true });

// Name index for searching
SuperheroSchema.index({ name: 'text' });

// Publisher index for filtering
SuperheroSchema.index({ 'biography.publisher': 1 });

// Favorites count for top heroes listing
SuperheroSchema.index({ favoritesCount: -1 });
```

## Data Consistency

To maintain data consistency between User favorites and Superhero favorite counts:

1. **Atomic Operations**: Using MongoDB atomic update operations
2. **Transactions**: For operations that update multiple collections
3. **Validation**: Schema validation ensures data integrity

Example transaction for favorite management:
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Update user favorites
  await User.findByIdAndUpdate(userId, 
    { $addToSet: { favoriteHeroes: heroId } }, 
    { session }
  );
  
  // Update hero favorite count
  await Superhero.findOneAndUpdate(
    { id: heroId }, 
    { $inc: { favoritesCount: 1 } },
    { session }
  );
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## Data Migration Strategy

For updates to the database schema:

1. **Schema Versioning**: Track schema versions to identify documents needing migration
2. **Script-based Migration**: Use scripts in the `scripts/` directory
3. **Incremental Updates**: Apply migrations in small, reversible steps

Example migration script for adding favorite reasons:
```javascript
// scripts/add-favorite-reasons.js
async function migrateUsers() {
  const users = await User.find({ favoriteReasons: { $exists: false } });
  
  for (const user of users) {
    // Create empty favorite reasons array from existing favorites
    const favoriteReasons = user.favoriteHeroes.map(heroId => ({
      heroId,
      reason: ''
    }));
    
    user.favoriteReasons = favoriteReasons;
    await user.save();
  }
}
```

## Backup and Recovery

The application's data can be backed up using:

1. **MongoDB Dumps**: Regular database dumps using `mongodump`
2. **Script-based Export**: Custom scripts for exporting critical data
3. **Incremental Backups**: Regular backups of changed data

Recovery procedures:
1. **Full Restore**: Using `mongorestore` for complete database restoration
2. **Selective Import**: Custom scripts for restoring specific data
3. **Point-in-Time Recovery**: Using oplog for recovering to a specific point

## Performance Optimization

Strategies implemented to optimize database performance:

1. **Query Optimization**:
   - Using projection to retrieve only needed fields
   - Limiting result sets appropriately
   - Using lean() for read-only operations

2. **Indexing**:
   - Strategic indexes on frequently queried fields
   - Compound indexes for complex queries
   - Text indexes for search functionality

3. **Connection Pooling**:
   - Mongoose connection pooling for request handling
   - Proper connection management

4. **Caching**:
   - Caching external API responses
   - Timestamps to determine data freshness

## Scalability Considerations

The database architecture supports scaling through:

1. **Horizontal Scaling**:
   - Prepared for MongoDB sharding
   - Shard key considerations (heroId, userId)

2. **Vertical Scaling**:
   - Efficient indexing to maximize single-server performance
   - Query optimization to reduce resource usage

3. **Read Scaling**:
   - Denormalized data model supports read replicas
   - Secondary indexes alignment with read patterns
