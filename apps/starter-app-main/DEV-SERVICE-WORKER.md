# Service Worker Development Guide

This document explains how to manage service workers during development to avoid caching issues.

## Automatic Development Mode Detection

The service worker has been configured to automatically detect development environments and disable caching. This happens when:

- The hostname is `localhost`
- The hostname is `127.0.0.1`
- The hostname includes `.local`

In development mode, the service worker will:

1. Disable all caching
2. Clear all existing caches on activation
3. Always fetch from the network, bypassing the cache

## Browser Dev Tools

You can also use the browser's developer tools to manage service workers:

1. Open Chrome DevTools (F12 or Ctrl+Shift+I)
2. Go to the "Application" tab
3. Select "Service Workers" in the left sidebar
4. Click "Unregister" to remove the service worker
5. Check "Update on reload" to ensure the service worker is updated on page refresh

## Development Utilities

We've added development utilities to help manage service workers during development:

### Browser Console Commands

The following commands are available in the browser console when in development mode:

```javascript
// Clear all caches
clearAllCaches();

// Unregister the service worker
unregisterServiceWorker();

// Unregister service worker, clear caches, and reload the page
resetServiceWorker();
```

### Command Line Script

You can also use the provided script to reset the service worker from the command line:

1. Start Chrome with remote debugging enabled:
   ```
   chrome.exe --remote-debugging-port=9222
   ```

2. Run the reset script:
   ```
   npm run reset-sw
   ```

## Troubleshooting

If you're still experiencing caching issues:

1. Open Chrome DevTools
2. Hold the refresh button and select "Empty Cache and Hard Reload"
3. Or use the keyboard shortcut: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

## Completely Disabling Service Workers

If you want to completely disable service workers during development:

1. Open Chrome DevTools
2. Go to the "Application" tab
3. Check "Bypass for network" in the Service Workers section

Alternatively, you can use Chrome with the `--disable-web-security` flag:

```
chrome.exe --disable-web-security --user-data-dir="C:/ChromeDevSession"
```

## Production Behavior

In production environments, the service worker will function normally:

1. Cache essential assets for offline use
2. Serve from cache when available
3. Update caches when new versions are deployed 