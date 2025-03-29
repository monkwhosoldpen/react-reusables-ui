# Cron Jobs API

This directory contains consolidated cron job endpoints for the application. These endpoints are designed to be called by a cron job scheduler at regular intervals.

## Available Endpoints

### Main Endpoint
- **GET /api/crons**
  - Returns information about all available cron endpoints
  - Use this for discovery and documentation

### Global Cron
- **GET /api/crons/global**
  - Inserts messages for global users
  - Fetches a Chuck Norris joke and inserts it as a message for each user
  - Recommended schedule: Every 5 minutes

### Tenant Cron
- **GET /api/crons/tenant**
  - Inserts messages for tenant users
  - Fetches a Chuck Norris joke and inserts it as a message for a randomly selected tenant user
  - Also updates the channel activity in the global Supabase
  - Recommended schedule: Every 10 minutes

### Elon Cron
- **GET /api/crons/elon**
  - Triggers Elon Musk alerts
  - Sends notifications to all Elon followers
  - Recommended schedule: Daily

## Usage

These endpoints can be triggered manually from the dashboard or scheduled using a cron job scheduler like Vercel Cron Jobs or a third-party service.

Example cron schedule configuration:
```
# Run global cron every 5 minutes
*/5 * * * * curl https://yourdomain.com/api/crons/global

# Run tenant cron every 10 minutes
*/10 * * * * curl https://yourdomain.com/api/crons/tenant

# Run Elon cron once a day at 9 AM
0 9 * * * curl https://yourdomain.com/api/crons/elon
```

## Testing

You can test these endpoints manually from the dashboard's Testing Tools section. 