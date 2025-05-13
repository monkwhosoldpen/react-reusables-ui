export const registerServiceWorker = async () => {
    console.log('[App] Registering Service Worker...');
    
    if (!('serviceWorker' in navigator)) {
        console.warn('[App] Service Workers are not supported in this browser');
        return null;
    }

    try {
        // Unregister any existing service workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            await registration.unregister();
            console.log('[App] Unregistered existing service worker');
        }

        // Get the absolute path to service worker
        const swUrl = new URL('/service-worker.js', window.location.origin).href;
        console.log('[App] Registering service worker from:', swUrl);

        // Register new service worker
        const reg = await navigator.serviceWorker.register(swUrl, {
            scope: '/',
            updateViaCache: 'none'
        });
        
        console.log('[App] ✅ Service Worker registered', reg);

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('[App] Service Worker is ready');

        return reg;
    } catch (err) {
        console.error('[App] ❌ SW registration failed', err);
        return null;
    }
};
  