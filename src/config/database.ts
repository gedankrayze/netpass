import { Database } from 'arangojs';

const db = new Database({
    url: process.env.ARANGO_URL || 'http://localhost:8529',
    databaseName: process.env.ARANGO_DB || 'netpass',
    auth: {
        username: process.env.ARANGO_USERNAME || 'root',
        password: process.env.ARANGO_PASSWORD || ''
    }
});

export const collections = {
    users: 'users',
    sessions: 'sessions'
};

export async function initDatabase() {
    try {
        // We assume the database already exists and we have access to it
        // Just check and create collections if needed
        const cols = await db.collections();
        const colNames = cols.map(c => c.name);
        
        for (const [key, name] of Object.entries(collections)) {
            if (!colNames.includes(name)) {
                console.log(`Creating collection: ${name}`);
                await db.createCollection(name);
            }
        }
        
        // Create indexes for data integrity and performance
        const usersCollection = db.collection(collections.users);
        const sessionsCollection = db.collection(collections.sessions);
        
        // Users collection indexes
        await usersCollection.ensureIndex({
            type: 'persistent',
            fields: ['email'],
            unique: true,
            sparse: false,
            name: 'idx_users_email_unique'
        });
        
        await usersCollection.ensureIndex({
            type: 'persistent',
            fields: ['username'],
            unique: true,
            sparse: false,
            name: 'idx_users_username_unique'
        });
        
        await usersCollection.ensureIndex({
            type: 'persistent',
            fields: ['isActive'],
            unique: false,
            sparse: false,
            name: 'idx_users_isActive'
        });
        
        // Sessions collection indexes
        await sessionsCollection.ensureIndex({
            type: 'persistent',
            fields: ['token'],
            unique: true,
            sparse: false,
            name: 'idx_sessions_token_unique'
        });
        
        await sessionsCollection.ensureIndex({
            type: 'persistent',
            fields: ['userId'],
            unique: false,
            sparse: false,
            name: 'idx_sessions_userId'
        });
        
        console.log('✅ Database collections and indexes initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

export default db;