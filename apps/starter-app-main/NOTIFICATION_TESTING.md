# Web Push Notification Testing

This document provides information about the notification testing tools integrated into the application.

## Test Page

The application includes a comprehensive testing page for web push notifications at `/testpage`. This testing interface helps debug and monitor the entire notification flow from permission request to service worker registration to push subscription and delivery.

### Testing Features

- **Permission Management**: Request notification permission from the browser
- **Subscription Control**: Enable/disable push notification subscriptions 
- **Manual Testing**: Trigger test notifications directly from the service worker
- **Backend Testing**: Send test notifications through the API
- **Service Worker Inspection**: Check the status of the service worker and subscriptions
- **Detailed Logging**: Real-time logs track notification state and actions

## Test API Endpoint

The app provides a dedicated API endpoint for testing notifications:

- `POST /api/notifications/test` - Sends a test notification to a user
  ```json
  {
    "userId": "user-id-here",
    "message": "Custom test message",
    "testId": "optional-test-identifier"
  }
  ```

## Notification Flow

The web push notification flow involves several components:

1. **Permission Request**: The browser asks the user for permission to show notifications
2. **Service Worker Registration**: A service worker is registered to handle background notifications
3. **Push Subscription**: The app creates a push subscription for the current device
4. **Subscription Storage**: The subscription is stored in the database
5. **Push Message**: The backend sends a push message to the subscription
6. **Service Worker Handling**: The service worker receives the push and shows a notification
7. **User Interaction**: The user can click the notification to open the app

## Debugging Notifications

The test page provides detailed logging to help track issues in the notification flow:

1. **Permission issues**: Track browser permission status and changes
2. **Subscription problems**: Verify subscription creation and storage
3. **Service worker status**: Confirm proper registration and activation
4. **Push delivery**: Monitor successful and failed notification deliveries

## Common Issues

Common web push notification issues include:

1. **Browser permissions**: Users must explicitly grant notification permission
2. **Service worker registration**: Service worker must be registered and active
3. **Valid VAPID keys**: Check that VAPID keys are properly configured
4. **Subscription storage**: Verify subscriptions are correctly stored in database
5. **Network conditions**: Service workers require HTTPS in production

## Implementation Details

### Service Worker

The service worker (`public/sw.js`) handles several responsibilities:

- Receiving push messages from the server
- Displaying notifications to the user
- Handling notification clicks
- Managing notification badge counts
- Sending toast notifications to the app

### Environment Variables

For notifications to work correctly, ensure these environment variables are set:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: Public VAPID key for Web Push
- `VAPID_PRIVATE_KEY`: Private VAPID key (server-side only)
- `VAPID_SUBJECT`: Usually a mailto URL for the developer

### Database Tables

The notifications system uses these database tables:

- `push_subscriptions`: Stores user push subscription details
- `user_notifications`: Stores user notification preferences 