import db from '../config/database';

async function clearTestData() {
    try {
        // Clear test users
        await db.query(`
            FOR u IN users 
            FILTER u.email IN ["test@example.com", "different@example.com", "test2@example.com", "test3@example.com"]
               OR u.username IN ["testuser", "anotheruser", "validuser"]
            REMOVE u IN users
        `);
        
        console.log('✅ Test data cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing test data:', error);
        process.exit(1);
    }
}

clearTestData().then(() => process.exit(0));