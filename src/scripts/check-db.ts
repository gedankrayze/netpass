import db from '../config/database';

async function checkDatabase() {
    try {
        console.log('🔍 Checking ArangoDB connection...');
        console.log(`📡 URL: ${process.env.ARANGO_URL || 'http://localhost:8529'}`);
        console.log(`📁 Database: ${process.env.ARANGO_DB || 'netpass'}`);
        console.log(`👤 User: ${process.env.ARANGO_USERNAME || 'root'}`);
        
        // Try to run a simple query
        const cursor = await db.query('RETURN "ok"');
        
        const result = await cursor.next();
        
        if (result === 'ok') {
            console.log('✅ Database connection successful!');
            process.exit(0);
        } else {
            console.error('❌ Unexpected response from database');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Database connection failed!');
        
        if (error instanceof Error) {
            console.error('Error:', error.message);
            
            // Check for specific error types
            if (error.message.includes('not authorized')) {
                console.error('🔐 Authentication failed. Please check your credentials.');
            } else if (error.message.includes('ECONNREFUSED')) {
                console.error('🔌 Connection refused. Is ArangoDB running?');
            } else if (error.message.includes('getaddrinfo')) {
                console.error('🌐 DNS resolution failed. Check the ARANGO_URL.');
            }
        }
        
        process.exit(1);
    }
}

checkDatabase().catch(console.error);