// Service Worker for Web Push Notifications

// Cache name for offline support
const CACHE_NAME = 'app-cache-v1';
const DEBUG = false;

// Check if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || 
                      self.location.hostname === '127.0.0.1' ||
                      self.location.hostname.includes('.local');

// Disable caching in development mode
const CACHING_ENABLED = !isDevelopment;

// Log development mode status
if (DEBUG) {
  console.log(`[Service Worker] Running in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
  console.log(`[Service Worker] Caching ${CACHING_ENABLED ? 'ENABLED' : 'DISABLED'}`);
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

// Keep track of notification count
let notificationCount = 0;

// Helper function to get appropriate badge based on count
function getBadgeForCount(count) {
  if (count <= 0) return BADGE_CONFIG.DEFAULT_BADGE;
  if (count > 5) return BADGE_CONFIG.NUMBER_BADGES['5plus'];
  return BADGE_CONFIG.NUMBER_BADGES[count] || BADGE_CONFIG.DEFAULT_BADGE;
}

// Enhanced logging function
function log(...args) {
  if (DEBUG) {
    console.log('[Service Worker]', ...args);
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

// Track if we have an authenticated user
let isAuthenticated = false;

// Listen for messages from the client
self.addEventListener('message', (event) => {
  log('📩 Message received from client:', event.data);
  
  // Handle auth status updates
  if (event.data && event.data.type === 'AUTH_STATUS') {
    isAuthenticated = event.data.isAuthenticated;
    log(`🔐 Authentication status updated: ${isAuthenticated ? 'Logged in' : 'Logged out'}`);
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

// Log service worker lifecycle events
self.addEventListener('install', (event) => {
  log('🟢 Installing service worker version:', CACHE_NAME);
  
  if (CACHING_ENABLED) {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        log('📦 Caching app assets');
        return cache.addAll([
          '/',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png'
        ]);
      })
    );
  } else {
    log('📦 Caching DISABLED in development mode');
  }
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  log('⏩ Skip waiting - forcing activation');
});

self.addEventListener('activate', (event) => {
  log('🔵 Activating service worker');
  
  // In development mode, clear ALL caches to ensure fresh content
  if (!CACHING_ENABLED) {
    log('🧹 Development mode: clearing ALL caches');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            log('🗑️ Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        log('✅ All caches cleared in development mode');
      })
    );
  } else {
    // In production, only clear old caches
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => {
        log('✅ Service worker activated and controlling all clients');
      })
    );
  }
  
  // Take control of all clients immediately
  self.clients.claim();
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
  log('📨 Push received PushEvent');
  
  let notificationData = {};
  
  try {
    // Try to parse the data from the push event
    if (event.data) {
      notificationData = event.data.json();
      log('📊 Push data received:', notificationData);
    }
  } catch (error) {
    log('❌ Error parsing push data:', error);
    notificationData = {
      title: 'New Notification',
      message: 'You have a new notification',
      icon: '/icons/icon-192x192.png'
    };
  }

  // Extract notification details from the payload
  const notification = notificationData.notification || notificationData;
  
  // Log user ID for end-to-end testing if available
  if (notification.data && notification.data.userId) {
    log(`[E2E-TEST] Processing push notification for user: ${notification.data.userId.slice(0, 8)}...`, {
      title: notification.title || notificationData.title,
      type: notification.data.type,
      timestamp: new Date().toISOString(),
      testInfo: notification.data.testInfo || {
        source: 'service-worker',
        endpoint: 'push-handler',
        component: 'PushEvent'
      }
    });
  }
  
  // Update notification count and get appropriate badge
  notificationCount++;
  const badgeUrl = getBadgeForCount(notificationCount);
  
  // Ensure we have the required fields with fallbacks
  let title = notification.title || notificationData.title || 'New Notification';
  let message = notification.message || notification.body || notificationData.message || 'You have a new notification';
  
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
    badge: badgeUrl, // Use our dynamic badge
    image: notification.image,
    
    // Styling
    dir: notification.dir || 'ltr',
    lang: notification.lang || 'en',
    tag: notification.tag,
    
    // Behavior
    requireInteraction: notification.requireInteraction === true,
    renotify: notification.renotify === true,
    silent: notification.silent === true,
    timestamp: notification.timestamp || Date.now(),
    vibrate: notification.vibrate || [100, 50, 100],
    
    // Actions (buttons)
    actions: notification.actions || [],
    
    // Data to be used when notification is clicked
    data: {
      url: '/janedoe', // Hardcoded URL as requested
      notificationCount: notificationCount,
      deliveryMethod: 'push', // Track how this notification was delivered
      deliveryTimestamp: new Date().toISOString(),
      ...notification.data
    }
  };

  // Create a simplified toast notification object
  const toastNotification = {
    title,
    message: options.body,
    icon: options.icon,
    image: options.image,
    data: {
      ...options.data,
      deliveryMethod: 'toast', // Override to indicate toast delivery
    },
    actions: options.actions,
    formatting: notification.formatting // Pass formatting to toast
  };

  log('🔔 Preparing notification:', { title, options });
  log(`🔐 Current authentication status: ${isAuthenticated ? 'Logged in' : 'Logged out'}`);
  
  // Log user ID again for end-to-end testing
  if (options.data && options.data.userId) {
    log(`[E2E-TEST] Showing notification for user: ${options.data.userId.slice(0, 8)}...`, {
      title,
      message: options.body,
      timestamp: new Date().toISOString(),
      deliveryMethod: 'pending', // Will be updated to 'push' or 'toast'
      testInfo: options.data.testInfo || {
        source: 'service-worker',
        endpoint: 'notification-display',
        component: 'ShowNotification'
      }
    });
  }

  // Check if we should show the notification
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(async clientList => {
        // Always show push notification regardless of client state
        const pushPromise = self.registration.showNotification(title, options)
          .then(() => {
            // Log successful push notification
            if (options.data && options.data.userId) {
              log(`[E2E-TEST] Push notification shown for user: ${options.data.userId.slice(0, 8)}...`, {
                title,
                message: options.body,
                timestamp: new Date().toISOString(),
                deliveryMethod: 'push',
                testInfo: options.data.testInfo || {
                  source: 'service-worker',
                  endpoint: 'push-delivery',
                  component: 'PushNotification',
                  status: 'success'
                }
              });
            }
            return true;
          });

        // If we have open clients, also send toast notification
        if (clientList.length > 0) {
          log('🔍 Found open windows:', clientList.length);
          
          // Send toast notification
          const toastSent = await sendToastToClient(toastNotification);
          
          if (toastSent) {
            log('✅ Toast notification sent successfully');
          } else {
            log('⚠️ Failed to send toast notification');
          }
        }

        return pushPromise;
      })
      .catch(error => {
        log('❌ Error handling notification:', error);
        
        // Log error for E2E testing
        if (options.data && options.data.userId) {
          log(`[E2E-TEST] Notification error for user: ${options.data.userId.slice(0, 8)}...`, {
            title,
            message: options.body,
            error: error.message,
            timestamp: new Date().toISOString(),
            testInfo: options.data.testInfo || {
              source: 'service-worker',
              endpoint: 'notification-display',
              component: 'ShowNotification',
              status: 'error'
            }
          });
        }
      })
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

log('🚀 Service Worker loaded with toast notification support'); 