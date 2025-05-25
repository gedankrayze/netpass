'use strict';
const createRouter = require('@arangodb/foxx/router');
const db = require('@arangodb').db;
const queues = require('@arangodb/foxx/queues');
const router = createRouter();

module.context.use(router);

// Create a queue for session cleanup
const cleanupQueue = queues.create('session-cleanup');

// Define the cleanup job handler
const cleanupHandler = function(data) {
  const now = new Date().toISOString();
  
  try {
    // Remove expired sessions
    const result = db._query(`
      FOR s IN sessions 
      FILTER s.expiresAt < @now 
      REMOVE s IN sessions 
      RETURN OLD
    `, { now });
    
    const deletedCount = result.toArray().length;
    
    // Log the cleanup
    console.log(`Session cleanup: removed ${deletedCount} expired sessions at ${now}`);
    
    // Get statistics
    const stats = db._query(`
      LET total = LENGTH(sessions)
      LET active = LENGTH(
        FOR s IN sessions 
        FILTER s.expiresAt > @now 
        RETURN s
      )
      RETURN {
        total: total,
        active: active,
        expired: total - active,
        cleanedUp: @deletedCount
      }
    `, { now, deletedCount }).toArray()[0];
    
    return {
      success: true,
      deletedCount,
      stats,
      timestamp: now
    };
  } catch (error) {
    console.error('Session cleanup error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: now
    };
  }
};

// Register the job handler
cleanupQueue.registerJobType('cleanup-sessions', {
  execute: cleanupHandler,
  maxFailures: 3
});

// Manual trigger endpoint (for testing)
router.post('/cleanup', function (req, res) {
  const result = cleanupHandler({});
  res.json(result);
})
.response(['application/json'], 'Cleanup result')
.summary('Manually trigger session cleanup')
.description('Immediately runs the session cleanup process');

// Status endpoint
router.get('/status', function (req, res) {
  const now = new Date().toISOString();
  const stats = db._query(`
    LET total = LENGTH(sessions)
    LET expired = LENGTH(
      FOR s IN sessions 
      FILTER s.expiresAt < @now 
      RETURN s
    )
    LET active = total - expired
    RETURN {
      total: total,
      active: active,
      expired: expired,
      timestamp: @now
    }
  `, { now }).toArray()[0];
  
  res.json(stats);
})
.response(['application/json'], 'Session statistics')
.summary('Get session statistics')
.description('Returns current session statistics');

// Schedule cleanup job to run every hour
router.post('/schedule', function (req, res) {
  try {
    // Cancel any existing scheduled jobs
    const existingJobs = cleanupQueue.all({ type: 'cleanup-sessions' });
    existingJobs.forEach(job => cleanupQueue.delete(job._key));
    
    // Schedule new recurring job (every hour)
    const job = cleanupQueue.push(
      { mount: module.context.mount },
      'cleanup-sessions',
      {},
      {
        repeatDelay: 3600000, // 1 hour in milliseconds
        repeatTimes: Infinity
      }
    );
    
    res.json({
      success: true,
      message: 'Session cleanup scheduled to run every hour',
      jobId: job._key
    });
  } catch (error) {
    res.throw(500, error.message);
  }
})
.response(['application/json'], 'Schedule result')
.summary('Schedule automatic cleanup')
.description('Schedules session cleanup to run every hour');

// Cancel scheduled jobs
router.delete('/schedule', function (req, res) {
  try {
    const jobs = cleanupQueue.all({ type: 'cleanup-sessions' });
    const cancelled = jobs.length;
    jobs.forEach(job => cleanupQueue.delete(job._key));
    
    res.json({
      success: true,
      message: `Cancelled ${cancelled} scheduled cleanup job(s)`
    });
  } catch (error) {
    res.throw(500, error.message);
  }
})
.response(['application/json'], 'Cancellation result')
.summary('Cancel scheduled cleanup')
.description('Cancels all scheduled session cleanup jobs');