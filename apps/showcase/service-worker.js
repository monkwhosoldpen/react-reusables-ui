self.addEventListener('install', () => {
  console.log('[SW] Installed');
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
});

self.addEventListener('push', function (event) {
  console.log('[SW] Push event received:', event);

  let data = {
    title: 'New Notification',
    body: 'You have a new message!'
  };

  try {
    // Try to parse as JSON first
    if (event.data) {
      const text = event.data.text();
      try {
        data = JSON.parse(text);
      } catch (err) {
        // If not JSON, use the text as the notification body
        data.body = text;
      }
    }
  } catch (err) {
    console.error('[SW] Error handling push data:', err);
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  console.log('[SW] Notification clicked:', event.notification);
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
}); 