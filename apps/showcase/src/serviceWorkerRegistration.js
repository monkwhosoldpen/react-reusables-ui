// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === "[::1]" ||
      // 127.0.0.0/8 are considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
  );
  
  export function register(config) {
    console.log('[PWA] Registration started - Environment:', process.env.NODE_ENV);
    const isEnvProduction = process.env.NODE_ENV === "production";
    if (isEnvProduction && "serviceWorker" in navigator) {
      console.log('[PWA] Service worker supported in production environment');
      // The URL constructor is available in all browsers that support SW.
      const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        console.log('[PWA] Registration skipped - Different origin detected');
        return;
      }
  
      window.addEventListener("load", () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
        console.log('[PWA] Service worker URL:', swUrl);
  
        if (isLocalhost) {
          console.log('[PWA] Running on localhost - Checking service worker validity');
          checkValidServiceWorker(swUrl, config);
  
          navigator.serviceWorker.ready.then(() => {
            console.log('[PWA] Service worker ready - Cache-first mode active');
          });
        } else {
          console.log('[PWA] Running in production - Registering service worker');
          registerValidSW(swUrl, config);
        }
      });
    } else {
      console.log('[PWA] Registration skipped - Not in production or service worker not supported');
    }
  }
  
  function registerValidSW(swUrl, config) {
    console.log('[PWA] Attempting to register service worker');
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('[PWA] Service worker registered successfully');
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          installingWorker.onstatechange = () => {
            console.log('[PWA] Service worker state changed:', installingWorker.state);
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log('[PWA] New content available - Will be used after all tabs are closed');
                if (config && config.onUpdate) {
                  config.onUpdate(registration);
                }
              } else {
                console.log('[PWA] Content cached for offline use');
                if (config && config.onSuccess) {
                  config.onSuccess(registration);
                }
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('[PWA] Registration failed:', error);
      });
  }
  
  function checkValidServiceWorker(swUrl, config) {
    console.log('[PWA] Validating service worker');
    fetch(swUrl, {
      headers: { "Service-Worker": "script" },
    })
      .then((response) => {
        const contentType = response.headers.get("content-type");
        if (
          response.status === 404 ||
          (contentType != null && contentType.indexOf("javascript") === -1)
        ) {
          console.log('[PWA] No valid service worker found - Reloading page');
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          console.log('[PWA] Valid service worker found - Proceeding with registration');
          registerValidSW(swUrl, config);
        }
      })
      .catch(() => {
        console.log('[PWA] Offline mode - No internet connection');
      });
  }
  
  export function unregister() {
    console.log('[PWA] Unregistering service worker');
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
          console.log('[PWA] Service worker unregistered successfully');
        })
        .catch((error) => {
          console.error('[PWA] Unregistration failed:', error.message);
        });
    }
  }