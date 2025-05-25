import db from '../config/database';

async function addIndexes() {
    try {
        const usersCollection = db.collection('users');
        
        // Create unique index on email
        console.log('Creating unique index on email...');
        await usersCollection.ensureIndex({
            type: 'persistent',
            fields: ['email'],
            unique: true,
            sparse: false,
            name: 'idx_users_email_unique'
        });
        
        // Create unique index on username
        console.log('Creating unique index on username...');
        await usersCollection.ensureIndex({
            type: 'persistent',
            fields: ['username'],
            unique: true,
            sparse: false,
            name: 'idx_users_username_unique'
        });
        
        // Create index on isActive for faster queries
        console.log('Creating index on isActive...');
        await usersCollection.ensureIndex({
            type: 'persistent',
            fields: ['isActive'],
            unique: false,
            sparse: false,
            name: 'idx_users_isActive'
        });
        
        // Create index on sessions.token for faster lookups
        const sessionsCollection = db.collection('sessions');
        console.log('Creating index on sessions.token...');
        await sessionsCollection.ensureIndex({
            type: 'persistent',
            fields: ['token'],
            unique: true,
            sparse: false,
            name: 'idx_sessions_token_unique'
        });
        
        // Create index on sessions.userId for faster user session lookups
        console.log('Creating index on sessions.userId...');
        await sessionsCollection.ensureIndex({
            type: 'persistent',
            fields: ['userId'],
            unique: false,
            sparse: false,
            name: 'idx_sessions_userId'
        });
        
        console.log('✅ All indexes created successfully!');
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    }
}

addIndexes().then(() => process.exit(0));