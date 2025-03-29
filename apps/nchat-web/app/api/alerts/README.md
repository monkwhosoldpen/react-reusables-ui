# Alerts API

This directory contains consolidated alert endpoints for the application. These endpoints are used to send push notifications to users.

## Available Endpoints

### Main Endpoint
- **GET /api/alerts**
  - Returns information about all available alert endpoints
  - Use this for discovery and documentation

### Push Notifications
- **POST /api/alerts/push**
  - Sends push notifications to all subscribed users or a specific user
  - Required parameters:
    - `title`: The notification title
    - `message`: The notification message
  - Optional parameters:
    - `userId`: If provided, only sends to that specific user
    - `channelActivity`: Additional data for channel activity

### Elon Musk Alerts
- **GET /api/alerts/elon**
  - Sends push notifications to users who follow Elon Musk
  - Uses default title and message
- **POST /api/alerts/elon**
  - Sends push notifications to users who follow Elon Musk
  - Allows customization of the notification
  - Optional parameters:
    - `title`: Custom notification title
    - `message`: Custom notification message

## Usage Examples

### Sending a general push notification

```javascript
fetch('/api/alerts/push', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Important Update',
    message: 'This is an important notification for all users',
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### Sending an Elon Musk alert

```javascript
fetch('/api/alerts/elon', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Elon Musk Update',
    message: 'Check out the latest news from Elon Musk!',
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

## Testing

You can test these endpoints manually from the dashboard's Testing Tools section. 