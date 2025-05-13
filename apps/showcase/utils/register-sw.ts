import { PUSH_CONFIG } from '~/lib/core/config/push-config';

export const registerServiceWorker = async () => {
    console.log('[App] Starting Service Worker registration process...');
    
    if (!('serviceWorker' in navigator)) {
        console.error('[App] Service Workers are not supported in this browser');
        return null;
    }

    if (!('Notification' in window)) {
        console.error('[App] Notifications are not supported in this browser');
        return null;
    }

    try {
        console.log('[App] Checking existing notification permission:', Notification.permission);
        
        // Request notification permission
        if ('Notification' in window) {
            console.log('[App] Requesting notification permission...');
            const permission = await Notification.requestPermission();
            console.log('[App] Notification permission status:', permission);
            
            if (permission !== 'granted') {
                console.warn('[App] Notification permission not granted. Status:', permission);
            } else {
                console.log('[App] Notification permission granted successfully');
            }
        }

        // Check for existing service worker registrations
        console.log('[App] Checking for existing service worker registrations...');
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('[App] Found existing service workers:', registrations.length);

        // Unregister existing service workers
        for (const registration of registrations) {
            console.log('[App] Unregistering service worker for scope:', registration.scope);
            await registration.unregister();
            console.log('[App] Successfully unregistered service worker');
        }

        // Get the absolute path to service worker
        const swUrl = new URL('/service-worker.js', window.location.origin).href;
        console.log('[App] Registering new service worker from:', swUrl);

        // Register new service worker
        const reg = await navigator.serviceWorker.register(swUrl, {
            scope: '/',
            updateViaCache: 'none'
        });
        
        console.log('[App] ✅ Service Worker registered successfully. Scope:', reg.scope);

        // Wait for the service worker to be ready
        console.log('[App] Waiting for service worker to be ready...');
        const readyReg = await navigator.serviceWorker.ready;
        console.log('[App] Service Worker is ready. Controller:', navigator.serviceWorker.controller?.state);

        // Check and setup push subscription
        if ('pushManager' in reg) {
            try {
                let subscription = await reg.pushManager.getSubscription();
                console.log('[App] Current push subscription:', subscription ? 'Exists' : 'None');

                if (!subscription) {
                    console.log('[App] Creating new push subscription...');
                    
                    try {
                        // Convert VAPID key to Uint8Array
                        const publicVapidKey = PUSH_CONFIG.PUBLIC_VAPID_KEY;
                        const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);
                        
                        subscription = await reg.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey
                        });
                        console.log('[App] Push subscription created successfully:', subscription);
                        
                        // Here you would typically send this subscription to your server
                        // await sendSubscriptionToServer(subscription);
                    } catch (subscribeError) {
                        console.error('[App] Failed to create push subscription:', subscribeError);
                        if (subscribeError instanceof Error) {
                            console.error('[App] Subscription error details:', {
                                message: subscribeError.message,
                                stack: subscribeError.stack
                            });
                        }
                    }
                }
                
                const permissionState = await reg.pushManager.permissionState({
                    userVisibleOnly: true
                });
                console.log('[App] Push Manager permission state:', permissionState);
            } catch (error) {
                console.error('[App] Error checking push subscription:', error);
            }
        }

        return reg;
    } catch (err) {
        console.error('[App] ❌ Service Worker registration failed:', err);
        if (err instanceof Error) {
            console.error('[App] Error details:', {
                message: err.message,
                stack: err.stack
            });
        }
        return null;
    }
};

// Helper function to convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
  