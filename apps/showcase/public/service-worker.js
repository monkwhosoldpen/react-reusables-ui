// Service Worker for Web Push Notifications

// Version control
const SW_VERSION = '1.0.0';
const CACHE_VERSION = '1';
const CACHE_NAME = `app-cache-v${CACHE_VERSION}`;
const DEBUG = true; // Set to true to enable all logging

// Check if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || 
                      self.location.hostname === '127.0.0.1' ||
                      self.location.hostname.includes('.local');

// Disable caching in development mode
const CACHING_ENABLED = !isDevelopment;

// Log development mode status
if (DEBUG) {
  console.log(`[Service Worker v${SW_VERSION}] Running in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
  console.log(`[Service Worker v${SW_VERSION}] Caching ${CACHING_ENABLED ? 'ENABLED' : 'DISABLED'}`);
}

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

// Log with timestamp and version
function log(...args) {
  if (DEBUG) {
    console.log(`[Service Worker v${SW_VERSION}]`, ...args, {
      timestamp: new Date().toISOString(),
      initialized: isInitialized,
      authenticated: isAuthenticated
    });
  }
}

// Initialize service worker state
async function initializeServiceWorker() {
  if (isInitialized) {
    log('🔄 Service worker already initialized');
    return;
  }

  try {
    log('🚀 Initializing service worker');
    
    // Check if we have any existing notifications
    const notifications = await self.registration.getNotifications();
    notificationCount = notifications.length;
    log(`📊 Found ${notificationCount} existing notifications`);

    isInitialized = true;
    log('✅ Service worker initialized successfully');
  } catch (error) {
    log('❌ Error initializing service worker:', error);
    isInitialized = false;
  }
}

// Text formatting utilities for notifications
const textFormat = {
  // Unicode symbols for formatting
  bold: (text) => `𝗕𝗼𝗹𝗱: ${text.split('').map(c => {
    // Map regular characters to bold unicode characters
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
  
  // Decorative text with symbols
  heading: (text) => `★ ${text} ★`,
  subheading: (text) => `• ${text} •`,
  
  // Separator lines
  line: () => `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`,
  doubleLine: () => `══════════════════`,
  
  // Bullet points and lists
  bullet: (text) => `• ${text}`,
  numbered: (index, text) => `${index}. ${text}`,
  
  // Highlight with symbols
  highlight: (text) => `✧ ${text} ✧`,
  important: (text) => `❗ ${text}`,
  
  // Quotes
  quote: (text) => `"${text}"`,
  
  // Format a message with multiple styles
  formatMessage: (message, formatting) => {
    if (!formatting || !message) return message;
    
    let formattedMessage = message;
    
    // Apply text formatting based on formatting instructions
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
  log('📩 Message received from client:', event.data);
  
  if (event.data && event.data.type === 'AUTH_STATUS') {
    isAuthenticated = event.data.isAuthenticated;
    log(`🔐 Authentication status updated: ${isAuthenticated ? 'Logged in' : 'Logged out'}`);
    
    // Re-initialize on auth status change
    if (isAuthenticated) {
      initializeServiceWorker().catch(error => {
        log('❌ Error reinitializing after auth change:', error);
      });
    }
  }
  
  // Handle manual notification request from test page
  if (event.data && event.data.type === 'MANUAL_NOTIFICATION') {
    log('🧪 Manual notification requested from test page');
    
    const notification = event.data.notification;
    
    // Build notification options
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
    
    // Show the notification
    self.registration.showNotification(notification.title || 'Test Notification', options)
      .then(() => {
        log('🧪 Manual test notification shown successfully', { title: notification.title, options });
        
        // Also send a toast notification
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
      .catch(error => {
        log('❌ Error showing test notification:', error);
      });
  }
});

// Enhanced install handler
self.addEventListener('install', (event) => {
  log(`🟢 Installing service worker version: ${SW_VERSION}`);
  
  event.waitUntil(
    (async () => {
      try {
        // Initialize service worker
        await initializeServiceWorker();
        
        if (CACHING_ENABLED) {
          const cache = await caches.open(CACHE_NAME);
          log('📦 Caching app assets');
          await cache.addAll([
            '/',
            '/icons/icon-192x192.png',
            '/icons/icon-512x512.png'
          ]);
        } else {
          log('📦 Caching DISABLED in development mode');
        }

        // Force activation
        await self.skipWaiting();
        log('⏩ Skip waiting - forcing activation');
      } catch (error) {
        log('❌ Error during installation:', error);
      }
    })()
  );
});

// Enhanced activate handler
self.addEventListener('activate', (event) => {
  log('🔵 Activating service worker');
  
  event.waitUntil(
    (async () => {
      try {
        // Clear caches based on environment
        if (!CACHING_ENABLED) {
          log('🧹 Development mode: clearing ALL caches');
          const cacheKeys = await caches.keys();
          await Promise.all(
            cacheKeys.map(key => caches.delete(key))
          );
          log('✅ All caches cleared in development mode');
        } else {
          // In production, only clear old caches
          const cacheKeys = await caches.keys();
          await Promise.all(
            cacheKeys.map(key => {
              if (key !== CACHE_NAME) {
                log('🗑️ Deleting old cache:', key);
                return caches.delete(key);
              }
            })
          );
        }

        // Take control of all clients
        await self.clients.claim();
        log('✅ Service worker activated and controlling all clients');

        // Re-initialize if needed
        if (!isInitialized) {
          await initializeServiceWorker();
        }
      } catch (error) {
        log('❌ Error during activation:', error);
      }
    })()
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  // Only log important fetches to avoid console spam
  if (event.request.url.includes('api/') || event.request.url.includes('supabase')) {
    log('🔍 Fetch:', event.request.url);
  }
  
  if (!CACHING_ENABLED) {
    // In development mode, always go to network and bypass cache
    log('🌐 Development mode: bypassing cache for:', event.request.url);
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        log('📤 Serving from cache:', event.request.url);
        return response;
      }
      
      // Only log important fetches to avoid console spam
      if (event.request.url.includes('api/') || event.request.url.includes('supabase')) {
        log('🌐 Network fetch:', event.request.url);
      }
      return fetch(event.request);
    })
  );
});

// Push subscription event - log when subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  log('🔄 Push subscription changed', event);
  // You might want to re-subscribe here
});

// Helper function to send toast notification to client
async function sendToastToClient(notification) {
  try {
    const clients = await self.clients.matchAll({ type: 'window' });
    
    // Log for E2E testing
    if (notification.data && notification.data.userId) {
      log(`[E2E-TEST] Attempting to send toast to clients for user: ${notification.data.userId.slice(0, 8)}...`, {
        title: notification.title,
        clientCount: clients.length,
        timestamp: new Date().toISOString(),
        testInfo: notification.data.testInfo || {
          source: 'service-worker',
          endpoint: 'send-toast-to-client',
          component: 'ToastNotification',
          status: 'attempt'
        }
      });
    }
    
    if (clients && clients.length > 0) {
      // Send to all clients
      const successfulClients = [];
      
      for (const client of clients) {
        log('🍞 Sending toast notification to client:', client.id);
        
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
          
          // Log individual client success for E2E testing
          if (notification.data && notification.data.userId) {
            log(`[E2E-TEST] Toast sent to client ${client.id} for user: ${notification.data.userId.slice(0, 8)}...`, {
              title: notification.title,
              clientId: client.id,
              timestamp: new Date().toISOString(),
              testInfo: notification.data.testInfo || {
                source: 'service-worker',
                endpoint: 'toast-to-client',
                component: 'ToastNotification',
                status: 'success'
              }
            });
          }
        } catch (clientError) {
          log(`❌ Error sending toast to specific client ${client.id}:`, clientError);
          
          // Log individual client failure for E2E testing
          if (notification.data && notification.data.userId) {
            log(`[E2E-TEST] Failed to send toast to client ${client.id} for user: ${notification.data.userId.slice(0, 8)}...`, {
              title: notification.title,
              clientId: client.id,
              error: clientError.message,
              timestamp: new Date().toISOString(),
              testInfo: notification.data.testInfo || {
                source: 'service-worker',
                endpoint: 'toast-to-client',
                component: 'ToastNotification',
                status: 'error'
              }
            });
          }
        }
      }
      
      // Log overall success for E2E testing
      if (notification.data && notification.data.userId) {
        log(`[E2E-TEST] Toast delivery summary for user: ${notification.data.userId.slice(0, 8)}...`, {
          title: notification.title,
          totalClients: clients.length,
          successfulClients: successfulClients.length,
          clientIds: successfulClients,
          timestamp: new Date().toISOString(),
          testInfo: notification.data.testInfo || {
            source: 'service-worker',
            endpoint: 'toast-delivery-summary',
            component: 'ToastNotification',
            status: successfulClients.length > 0 ? 'success' : 'partial-failure'
          }
        });
      }
      
      return successfulClients.length > 0;
    }
    
    // Log no clients found for E2E testing
    if (notification.data && notification.data.userId) {
      log(`[E2E-TEST] No clients found to send toast for user: ${notification.data.userId.slice(0, 8)}...`, {
        title: notification.title,
        timestamp: new Date().toISOString(),
        testInfo: notification.data.testInfo || {
          source: 'service-worker',
          endpoint: 'send-toast-to-client',
          component: 'ToastNotification',
          status: 'no-clients'
        }
      });
    }
    
    return false;
  } catch (error) {
    log('❌ Error sending toast to client:', error);
    
    // Log error for E2E testing
    if (notification.data && notification.data.userId) {
      log(`[E2E-TEST] Error sending toast for user: ${notification.data.userId.slice(0, 8)}...`, {
        title: notification.title,
        error: error.message,
        timestamp: new Date().toISOString(),
        testInfo: notification.data.testInfo || {
          source: 'service-worker',
          endpoint: 'send-toast-to-client',
          component: 'ToastNotification',
          status: 'error'
        }
      });
    }
    
    return false;
  }
}

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  log('📨 Push received with raw data:', event.data ? event.data.text() : 'No data');
  
  let notificationData = {};
  let rawData = '';
  
  try {
    // First store the raw data
    rawData = event.data ? event.data.text() : '';
    log('📝 Raw push data:', rawData);

    // Try to parse as JSON
    if (event.data) {
      try {
        notificationData = event.data.json();
        log('📊 Successfully parsed JSON data:', JSON.stringify(notificationData, null, 2));
      } catch (jsonError) {
        // If JSON parsing fails, use the raw text as message
        log('ℹ️ Not JSON data, using as plain text message');
        notificationData = {
          title: 'New Message',
          message: rawData,
          icon: '/icons/icon-192x192.png'
        };
      }
    }
  } catch (error) {
    log('❌ Error handling push data:', error);
    notificationData = {
      title: 'New Notification',
      message: 'You have a new notification',
      icon: '/icons/icon-192x192.png'
    };
  }

  // Extract notification details from the payload
  const notification = notificationData.notification || notificationData;
  
  log('🔔 Processing notification payload:', {
    title: notification.title,
    message: notification.message || notification.body,
    data: notification.data,
    timestamp: new Date().toISOString()
  });

  // Update notification count and get appropriate badge
  notificationCount++;
  const badgeUrl = getBadgeForCount(notificationCount);
  
  // Generate a unique tag for the notification
  const notificationTag = `notification-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
  // Ensure we have the required fields with fallbacks
  let title = notification.title || notificationData.title || 'New Notification';
  let message = notification.message || notification.body || notificationData.message || rawData || 'You have a new notification';
  
  // Apply text formatting if specified
  if (notification.formatting) {
    log('🎨 Applying text formatting to notification');
    if (notification.formatting.title) {
      title = textFormat.formatMessage(title, notification.formatting.title);
    }
    message = textFormat.formatMessage(message, notification.formatting);
    log('✅ Formatting applied:', { title, message });
  }
  
  // Build rich notification options
  const options = {
    // Content
    body: message,
    
    // Visual elements
    icon: notification.icon || '/icons/icon-192x192.png',
    badge: badgeUrl,
    image: notification.image,
    
    // Styling
    dir: notification.dir || 'ltr',
    lang: notification.lang || 'en',
    tag: notification.tag || notificationTag, // Use provided tag or generated one
    
    // Behavior
    requireInteraction: true, // Always require interaction
    renotify: true, // Always show new notifications
    silent: false, // Never silent
    timestamp: notification.timestamp || Date.now(),
    vibrate: notification.vibrate || [100, 50, 100],
    
    // Actions (buttons)
    actions: notification.actions || [
      {
        action: 'view',
        title: 'View'
      }
    ],
    
    // Data to be used when notification is clicked
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

  log('📱 Showing notification with options:', {
    title,
    tag: options.tag,
    options: JSON.stringify(options, null, 2),
    timestamp: new Date().toISOString()
  });

  // Always show both push notification and toast
  event.waitUntil(
    (async () => {
      try {
        // Always show push notification
        await self.registration.showNotification(title, options);
        log('✅ Push notification shown successfully');

        // Create toast notification
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

        // Send toast to all clients
        const clients = await self.clients.matchAll({ type: 'window' });
        if (clients.length > 0) {
          log(`📬 Sending toast to ${clients.length} clients`);
          await Promise.all(clients.map(client => 
            client.postMessage({
              type: 'TOAST_NOTIFICATION',
              notification: toastNotification
            })
          ));
          log('✅ Toast notifications sent to all clients');
        }

        log('🎉 All notifications delivered successfully', {
          pushShown: true,
          toastsSent: clients.length,
          notificationId: notificationTag,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        log('❌ Error showing notifications:', error);
        // Try to show a basic notification as fallback
        try {
          await self.registration.showNotification('New Notification', {
            body: 'You have a new notification',
            icon: '/icons/icon-192x192.png',
            tag: `fallback-${notificationTag}`, // Add tag to fallback notification
            renotify: true
          });
          log('✅ Fallback notification shown');
        } catch (fallbackError) {
          log('❌ Even fallback notification failed:', fallbackError);
        }
      }
    })()
  );
});

// Notification click event - handle notification clicks and actions
self.addEventListener('notificationclick', (event) => {
  log('👆 Notification clicked:', event.notification.title);
  
  // Log user ID for end-to-end testing if available
  const notificationData = event.notification.data || {};
  if (notificationData.userId) {
    log(`[E2E-TEST] Notification clicked by user: ${notificationData.userId.slice(0, 8)}...`, {
      title: event.notification.title,
      action: event.action || 'default',
      timestamp: new Date().toISOString(),
      deliveryMethod: notificationData.deliveryMethod || 'unknown',
      deliveryTimestamp: notificationData.deliveryTimestamp,
      interactionType: 'click',
      interactionTimestamp: new Date().toISOString(),
      testInfo: notificationData.testInfo || {
        source: 'service-worker',
        endpoint: 'notification-click',
        component: 'NotificationClickEvent',
        status: 'success'
      }
    });
  }
  
  // Close the notification
  event.notification.close();
  
  // Always redirect to /elonmusk regardless of notification data
  const url = '/elonmusk';
  log('🔗 Redirecting to hardcoded URL:', url);

  // Open or focus window with URL
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if there's already a window open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            log('🔄 Focusing existing window');
            
            // Log window focus for E2E testing
            if (notificationData.userId) {
              log(`[E2E-TEST] Focusing existing window for user: ${notificationData.userId.slice(0, 8)}...`, {
                clientId: client.id,
                url: url,
                timestamp: new Date().toISOString(),
                testInfo: notificationData.testInfo || {
                  source: 'service-worker',
                  endpoint: 'window-focus',
                  component: 'NotificationClickEvent'
                }
              });
            }
            
            return client.focus();
          }
        }
        
        // If no existing window found, open a new one
        log('🔄 Opening new window with URL:', url);
        
        // Log window open for E2E testing
        if (notificationData.userId) {
          log(`[E2E-TEST] Opening new window for user: ${notificationData.userId.slice(0, 8)}...`, {
            url: url,
            timestamp: new Date().toISOString(),
            testInfo: notificationData.testInfo || {
              source: 'service-worker',
              endpoint: 'window-open',
              component: 'NotificationClickEvent'
            }
          });
        }
        
        return clients.openWindow(url);
      })
      .then(windowClient => {
        // Log successful navigation for E2E testing
        if (notificationData.userId && windowClient) {
          log(`[E2E-TEST] Navigation successful for user: ${notificationData.userId.slice(0, 8)}...`, {
            url: url,
            clientId: windowClient.id,
            timestamp: new Date().toISOString(),
            testInfo: notificationData.testInfo || {
              source: 'service-worker',
              endpoint: 'navigation-complete',
              component: 'NotificationClickEvent',
              status: 'success'
            }
          });
        }
      })
      .catch(error => {
        log('❌ Error handling notification click:', error);
        
        // Log error for E2E testing
        if (notificationData.userId) {
          log(`[E2E-TEST] Navigation error for user: ${notificationData.userId.slice(0, 8)}...`, {
            url: url,
            error: error.message,
            timestamp: new Date().toISOString(),
            testInfo: notificationData.testInfo || {
              source: 'service-worker',
              endpoint: 'navigation-error',
              component: 'NotificationClickEvent',
              status: 'error'
            }
          });
        }
      })
  );
});

// Handle notification close event
self.addEventListener('notificationclose', (event) => {
  log('🚫 Notification closed without clicking:', event.notification.title);
  
  // You could track metrics here about dismissed notifications
  const notificationData = event.notification.data || {};
  
  // Log user ID for end-to-end testing if available
  if (notificationData.userId) {
    log(`[E2E-TEST] Notification dismissed by user: ${notificationData.userId.slice(0, 8)}...`, {
      title: event.notification.title,
      timestamp: new Date().toISOString(),
      deliveryMethod: notificationData.deliveryMethod || 'unknown',
      deliveryTimestamp: notificationData.deliveryTimestamp,
      interactionType: 'dismiss',
      interactionTimestamp: new Date().toISOString(),
      testInfo: notificationData.testInfo || {
        source: 'service-worker',
        endpoint: 'notification-dismiss',
        component: 'NotificationCloseEvent'
      }
    });
  }
  
  log('🔍 Closed notification data:', notificationData);
});

// Log any errors that occur in the service worker
self.addEventListener('error', (event) => {
  log('❌ Service Worker error:', event.message, event.filename, event.lineno);
});

log('🚀 Service Worker v${SW_VERSION} loaded with toast notification support'); 
