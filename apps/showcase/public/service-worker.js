self.addEventListener('install', () => {
  console.log('[SW] Installed');
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
});

self.addEventListener('push', function(event) {
  console.log('[SW] Push event received:', event);

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new message'
  };

  if (event.data) {
    const payload = event.data.text();
    console.log('[SW] Push payload:', payload);
    
    try {
      // Try parsing as JSON
      const jsonData = JSON.parse(payload);
      notificationData = {
        title: jsonData.title || notificationData.title,
        body: jsonData.body || notificationData.body,
        ...jsonData
      };
    } catch (e) {
      // If not JSON, use the text as message body
      console.log('[SW] Using payload as plain text message');
      notificationData.body = payload;
    }
  }

  const options = {
    body: notificationData.body,
    icon: '/assets/images/icon.png',
    badge: '/assets/images/icon.png',
    data: notificationData,
    vibrate: [200, 100, 200],
    tag: 'notification-' + Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.notification.data);
  
  event.notification.close();
  
  // Open or focus main app window when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is already open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});