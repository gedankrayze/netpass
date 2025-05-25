'use strict';
const queues = require('@arangodb/foxx/queues');

// Create the cleanup queue
const cleanupQueue = queues.create('session-cleanup');

// Schedule initial cleanup job to run every hour
const job = cleanupQueue.push(
  { mount: module.context.mount },
  'cleanup-sessions',
  {},
  {
    repeatDelay: 3600000, // 1 hour in milliseconds
    repeatTimes: Infinity
  }
);

console.log('Session cleanup service installed');
console.log(`Scheduled cleanup job: ${job._key}`);
console.log('Cleanup will run every hour');