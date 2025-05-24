import { initDatabase } from '../config/database';

async function main() {
    try {
        await initDatabase();
        console.log('✅ Database initialization completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

main();