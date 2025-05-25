import dayjs from 'dayjs';
import db from '../config/database';

async function cleanupExpiredSessions() {
    try {
        const now = dayjs().toISOString();
        
        // Remove all sessions that have expired
        const result = await db.query(
            `FOR s IN sessions 
             FILTER s.expiresAt < @now 
             REMOVE s IN sessions 
             RETURN OLD`,
            { now }
        );
        
        const deletedSessions = await result.all();
        const count = deletedSessions.length;
        
        if (count > 0) {
            console.log(`✅ Cleaned up ${count} expired session${count > 1 ? 's' : ''}`);
        } else {
            console.log('✅ No expired sessions to clean up');
        }
        
        // Optional: Get statistics about remaining sessions
        const statsResult = await db.query(`
            LET total = LENGTH(sessions)
            LET active = LENGTH(
                FOR s IN sessions 
                FILTER s.expiresAt > @now 
                RETURN s
            )
            RETURN {
                total: total,
                active: active,
                expired: total - active
            }
        `, { now });
        
        const stats = await statsResult.next();
        console.log(`📊 Session statistics: ${stats.active} active, ${stats.total} total`);
        
    } catch (error) {
        console.error('❌ Error cleaning up sessions:', error);
        process.exit(1);
    }
}

// Run cleanup
cleanupExpiredSessions().then(() => process.exit(0));