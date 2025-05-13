self.addEventListener('install', () => {
    console.log('[SW] Installed');
  });
  
  self.addEventListener('activate', (event) => {
    console.log('[SW] Activated');
  });
  
  self.addEventListener('push', function (event) {
    console.log('[SW] Push event received:', event);
  
    let data = {};
    try {
      data = event.data?.json() || {};
    } catch (err) {
      console.error('[SW] Error parsing push data:', err);
    }
  
    const title = data.title || 'New Notification';
    const options = {
      body: data.body || 'You have a new message!',
      icon: '/icons/icon-192x192.png',
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notification clicked:', event.notification);
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
  });
  