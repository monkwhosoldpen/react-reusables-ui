/**
 * Development Utilities for Service Worker Management
 * 
 * This script provides utility functions to help manage service workers
 * during development. It can be included in your development environment
 * to make it easier to clear caches and unregister service workers.
 * 
 * Usage:
 * 1. Include this script in your HTML: <script src="/dev-utils.js"></script>
 * 2. Use the global functions:
 *    - clearAllCaches() - Clears all caches
 *    - unregisterServiceWorker() - Unregisters the service worker
 *    - resetServiceWorker() - Unregisters and clears all caches
 */

(function() {
  const isDev = false; //window.location.hostname === 'localhost' || 
                //window.location.hostname === '127.0.0.1' ||
                //window.location.hostname.includes('.local');
  
  if (!isDev) {
    return;
  }
  
  // Clear all caches
  window.clearAllCaches = async function() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Unregister service worker
  window.unregisterServiceWorker = async function() {
    try {
      // First try to use the exposed method from NotificationContext
      if (window.__unregisterServiceWorker) {
        const result = await window.__unregisterServiceWorker();
        if (result) return true;
      }
      
      // Fallback to manual unregistration
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => {
          return registration.unregister();
        })
      );
      
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Reset service worker (unregister and clear caches)
  window.resetServiceWorker = async function() {
    const cacheResult = await window.clearAllCaches();
    const swResult = await window.unregisterServiceWorker();
    
    if (cacheResult && swResult) {
      window.location.reload();
      return true;
    } else {
      return false;
    }
  };
  
})(); 