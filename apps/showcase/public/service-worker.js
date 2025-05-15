// Service Worker for Web Push Notifications
// Version control
const SW_VERSION = '1.0.0';
const CACHE_VERSION = '1';
const CACHE_NAME = `app-cache-v${CACHE_VERSION}`;
// Check if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || 
                      self.location.hostname === '127.0.0.1' ||
                      self.location.hostname.includes('.local');
// Disable caching in development mode
const CACHING_ENABLED = !isDevelopment;
// Badge configuration
const BADGE_CONFIG = {
  DEFAULT_BADGE: '/icons/badge-default.png',
  NUMBER_BADGES: {
    1: '/icons/badge-1.png',
    2: '/icons/badge-2.png',
    3: '/icons/badge-3.png',
    4: '/icons/badge-4.png',
    5: '/icons/badge-5.png',
    '5plus': '/icons/badge-5plus.png'
  }
};
// State tracking
let isInitialized = false;
let isAuthenticated = false;
let notificationCount = 0;
// Helper function to get appropriate badge based on count
function getBadgeForCount(count) {
  if (count <= 0) return BADGE_CONFIG.DEFAULT_BADGE;
  if (count > 5) return BADGE_CONFIG.NUMBER_BADGES['5plus'];
  return BADGE_CONFIG.NUMBER_BADGES[count] || BADGE_CONFIG.DEFAULT_BADGE;
}
// Initialize service worker state
async function initializeServiceWorker() {
  if (isInitialized) return;
  try {
    const notifications = await self.registration.getNotifications();
    notificationCount = notifications.length;
    isInitialized = true;
  } catch (error) {
    isInitialized = false;
  }
}
// Text formatting utilities for notifications
const textFormat = {
  // Unicode symbols for formatting
  bold: (text) => `𝗕𝗼𝗹𝗱: ${text.split('').map(c => {
    if (/[a-zA-Z0-9]/.test(c)) {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) { // Uppercase A-Z
        return String.fromCodePoint(code + 120211); // Bold uppercase
      } else if (code >= 97 && code <= 122) { // Lowercase a-z
        return String.fromCodePoint(code + 120205); // Bold lowercase
      } else if (code >= 48 && code <= 57) { // Numbers 0-9
        return String.fromCodePoint(code + 120764); // Bold numbers
      }
    }
    return c;
  }).join('')}`,
  
  italic: (text) => `𝘐𝘵𝘢𝘭𝘪𝘤: ${text.split('').map(c => {
    // Map regular characters to italic unicode characters
    if (/[a-zA-Z]/.test(c)) {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) { // Uppercase A-Z
        return String.fromCodePoint(code + 120263); // Italic uppercase
      } else if (code >= 97 && code <= 122) { // Lowercase a-z
        return String.fromCodePoint(code + 120257); // Italic lowercase
      }
    }
    return c;
  }).join('')}`,
  heading: (text) => `★ ${text} ★`,
  subheading: (text) => `• ${text} •`,
  line: () => `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`,
  doubleLine: () => `══════════════════`,
  bullet: (text) => `• ${text}`,
  numbered: (index, text) => `${index}. ${text}`,
  highlight: (text) => `✧ ${text} ✧`,
  important: (text) => `❗ ${text}`,
  quote: (text) => `"${text}"`,
  formatMessage: (message, formatting) => {
    if (!formatting || !message) return message;
    let formattedMessage = message;
    if (formatting.bold) {
      formattedMessage = formattedMessage.replace(
        new RegExp(`\\*\\*(${formatting.bold})\\*\\*`, 'g'), 
        textFormat.bold('$1')
      );
    }
    if (formatting.italic) {
      formattedMessage = formattedMessage.replace(
        new RegExp(`\\*(${formatting.italic})\\*`, 'g'), 
        textFormat.italic('$1')
      );
    }
    if (formatting.bullets) {
      formatting.bullets.forEach(bullet => {
        formattedMessage = formattedMessage.replace(
          `- ${bullet}`, 
          textFormat.bullet(bullet)
        );
      });
    }
    if (formatting.sections) {
      formatting.sections.forEach(section => {
        if (section.heading) {
          formattedMessage = formattedMessage.replace(
            `# ${section.heading}`, 
            textFormat.heading(section.heading)
          );
        }
        if (section.subheading) {
          formattedMessage = formattedMessage.replace(
            `## ${section.subheading}`, 
            textFormat.subheading(section.subheading)
          );
        }
      });
    }
    return formattedMessage;
  }
};
// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'AUTH_STATUS') {
    isAuthenticated = event.data.isAuthenticated;
    if (isAuthenticated) {
      initializeServiceWorker().catch(() => {});
    }
  }
  if (event.data && event.data.type === 'MANUAL_NOTIFICATION') {
    const notification = event.data.notification;
    const options = {
      body: notification.message || 'Test notification',
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: getBadgeForCount(++notificationCount),
      data: {
        ...notification.data,
        sentFrom: 'test-page',
        testMode: true,
        timestamp: new Date().toISOString()
      },
      requireInteraction: true,
      actions: notification.actions || [
        {
          action: 'viewTest',
          title: 'View Test'
        }
      ]
    };
    self.registration.showNotification(notification.title || 'Test Notification', options)
      .then(() => {
        if (event.source) {
          event.source.postMessage({
            type: 'TOAST_NOTIFICATION',
            notification: {
              title: notification.title || 'Test Notification',
              message: notification.message || 'Test notification',
              icon: notification.icon,
              data: {
                ...notification.data,
                sentFrom: 'service-worker-test',
                testMode: true,
                timestamp: new Date().toISOString()
              }
            }
          });
        }
      })
      .catch(() => {});
  }
});
// Enhanced install handler
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        await initializeServiceWorker();
        if (CACHING_ENABLED) {
          const cache = await caches.open(CACHE_NAME);
          await cache.addAll([
            '/',
            '/icons/icon-192x192.png',
            '/icons/icon-512x512.png'
          ]);
        }
        await self.skipWaiting();
      } catch (error) {}
    })()
  );
});
// Enhanced activate handler
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        if (!CACHING_ENABLED) {
          const cacheKeys = await caches.keys();
          await Promise.all(
            cacheKeys.map(key => caches.delete(key))
          );
        } else {
          const cacheKeys = await caches.keys();
          await Promise.all(
            cacheKeys.map(key => {
              if (key !== CACHE_NAME) {
                return caches.delete(key);
              }
            })
          );
        }
        await self.clients.claim();
        if (!isInitialized) {
          await initializeServiceWorker();
        }
      } catch (error) {}
    })()
  );
});
// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  if (!CACHING_ENABLED) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
// Push subscription event - log when subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {});
// Helper function to send toast notification to client
async function sendToastToClient(notification) {
  try {
    const clients = await self.clients.matchAll({ type: 'window' });
    if (clients && clients.length > 0) {
      const successfulClients = [];
      for (const client of clients) {
        try {
          client.postMessage({
            type: 'TOAST_NOTIFICATION',
            notification: {
              ...notification,
              data: {
                ...notification.data,
                clientId: client.id,
                sentTimestamp: new Date().toISOString()
              }
            }
          });
          successfulClients.push(client.id);
        } catch (clientError) {}
      }
      return successfulClients.length > 0;
    }
    return false;
  } catch (error) {
    return false;
  }
}
// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  let notificationData = {};
  let rawData = '';
  try {
    if (event.data) {
      try {
        notificationData = event.data.json();
      } catch (jsonError) {
        rawData = event.data ? event.data.text() : '';
        notificationData = {
          title: 'New Message',
          message: rawData,
          icon: '/icons/icon-192x192.png'
        };
      }
    }
  } catch (error) {
    notificationData = {
      title: 'New Notification',
      message: 'You have a new notification',
      icon: '/icons/icon-192x192.png'
    };
  }
  const notification = notificationData.notification || notificationData;
  notificationCount++;
  const badgeUrl = getBadgeForCount(notificationCount);
  const notificationTag = `notification-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let title = notification.title || notificationData.title || 'New Notification';
  let message = notification.message || notification.body || notificationData.message || rawData || 'You have a new notification';
  if (notification.formatting) {
    if (notification.formatting.title) {
      title = textFormat.formatMessage(title, notification.formatting.title);
    }
    message = textFormat.formatMessage(message, notification.formatting);
  }
  const options = {
    body: message,
    icon: notification.icon || '/icons/icon-192x192.png',
    badge: badgeUrl,
    image: notification.image,
    dir: notification.dir || 'ltr',
    lang: notification.lang || 'en',
    tag: notification.tag || notificationTag,
    requireInteraction: true,
    renotify: true,
    silent: false,
    timestamp: notification.timestamp || Date.now(),
    vibrate: notification.vibrate || [100, 50, 100],
    actions: notification.actions || [
      {
        action: 'view',
        title: 'View'
      }
    ],
    data: {
      url: notification.data?.url || '/janedoe',
      notificationCount: notificationCount,
      deliveryMethod: 'push',
      deliveryTimestamp: new Date().toISOString(),
      rawPushData: rawData,
      notificationId: notificationTag,
      ...notification.data
    }
  };
  event.waitUntil(
    (async () => {
      try {
        await self.registration.showNotification(title, options);
        const toastNotification = {
          title,
          message: options.body,
          icon: options.icon,
          image: options.image,
          data: {
            ...options.data,
            deliveryMethod: 'toast',
          },
          actions: options.actions,
          formatting: notification.formatting
        };
        const clients = await self.clients.matchAll({ type: 'window' });
        if (clients.length > 0) {
          await Promise.all(clients.map(client => 
            client.postMessage({
              type: 'TOAST_NOTIFICATION',
              notification: toastNotification
            })
          ));
        }
      } catch (error) {
        try {
          await self.registration.showNotification('New Notification', {
            body: 'You have a new notification',
            icon: '/icons/icon-192x192.png',
            tag: `fallback-${notificationTag}`,
            renotify: true
          });
        } catch (fallbackError) {}
      }
    })()
  );
});
// Notification click event - handle notification clicks and actions
self.addEventListener('notificationclick', (event) => {
  const notificationData = event.notification.data || {};
  event.notification.close();
  const url = '/elonmusk';
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
// Handle notification close event
self.addEventListener('notificationclose', (event) => {});
// Log any errors that occur in the service worker
self.addEventListener('error', (event) => {});