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
        
        console.log('✅ Database collections initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

export default db;