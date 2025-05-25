# NetPass Session Cleanup Foxx Service

This Foxx service provides automatic cleanup of expired sessions in the NetPass database.

## Features

- Automatic hourly cleanup of expired sessions
- Manual cleanup trigger endpoint
- Session statistics endpoint
- Configurable scheduling

## Installation

1. Zip the service directory:
```bash
cd foxx-services/session-cleanup
zip -r ../session-cleanup.zip .
```

2. Install via ArangoDB Web UI:
   - Go to Services section
   - Click "Add Service"
   - Upload the zip file
   - Set mount point to `/netpass/session-cleanup`

3. Or install via ArangoDB CLI:
```bash
foxx install /netpass/session-cleanup ./session-cleanup.zip
```

## Endpoints

### POST /cleanup
Manually trigger session cleanup

### GET /status
Get current session statistics

### POST /schedule
Schedule automatic cleanup (every hour by default)

### DELETE /schedule
Cancel scheduled cleanup jobs

## Configuration

The service automatically schedules cleanup to run every hour upon installation. You can modify the schedule by:

1. Canceling existing schedule: `DELETE /schedule`
2. Modifying the `repeatDelay` in the schedule endpoint
3. Re-scheduling: `POST /schedule`

## Monitoring

Check the ArangoDB logs for cleanup activity:
```
Session cleanup: removed X expired sessions at TIMESTAMP
```