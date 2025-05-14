import { PUSH_CONFIG } from '~/lib/core/config/push-config';

// Track registration state
let registrationInProgress = false;
let currentRegistration: ServiceWorkerRegistration | null = null;

// Keep track of active subscription
let currentSubscription: PushSubscription | null = null;

export const registerServiceWorker = async () => {
    // Prevent multiple simultaneous registrations
    if (registrationInProgress) {
        console.log('[App] Service Worker registration already in progress');
        return currentRegistration;
    }
    
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
        registrationInProgress = true;
        
        // Only check permission status, don't request it here
        console.log('[App] Checking existing notification permission:', Notification.permission);
        
        // Check for existing service worker registrations
        console.log('[App] Checking for existing service worker registrations...');
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('[App] Found existing service workers:', registrations.length);

        // If we have an active registration with the correct scope, use it
        const existingReg = registrations.find(reg => 
            reg.active && 
            reg.scope === window.location.origin + '/'
        );

        if (existingReg) {
            console.log('[App] Found valid existing service worker, using it');
            currentRegistration = existingReg;
            return existingReg;
        }

        // Unregister any other service workers
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
        await navigator.serviceWorker.ready;
        
        // Wait for the service worker to be activated
        if (reg.installing) {
            await new Promise<void>((resolve) => {
                reg.installing?.addEventListener('statechange', (e) => {
                    if ((e.target as ServiceWorker).state === 'activated') {
                        resolve();
                    }
                });
            });
        }
        
        console.log('[App] Service Worker is ready. Controller:', navigator.serviceWorker.controller?.state);
        
        currentRegistration = reg;
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
    } finally {
        registrationInProgress = false;
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

// Separate function to handle push subscription
export const setupPushSubscription = async (retryCount = 3) => {
    try {
        // Get registration - either existing or new
        const reg = currentRegistration || await navigator.serviceWorker.ready;
        
        if (!reg || !('pushManager' in reg)) {
            console.error('[App] Push notifications not supported');
            return null;
        }

        // If we already have an active subscription, return it
        if (currentSubscription) {
            console.log('[App] Using existing active subscription');
            return currentSubscription;
        }

        // Check if we already have a subscription
        let subscription = await reg.pushManager.getSubscription();
        console.log('[App] Current push subscription:', subscription ? 'Exists' : 'None');

        // If we have an existing subscription, unsubscribe first to ensure clean state
        if (subscription) {
            console.log('[App] Unsubscribing from existing subscription');
            await subscription.unsubscribe();
            subscription = null;
        }

        if (!subscription) {
            // Verify permission before attempting subscription
            if (Notification.permission !== 'granted') {
                console.error('[App] Notification permission not granted');
                return null;
            }

            console.log('[App] Creating new push subscription...');
            
            let attempt = 0;
            while (attempt < retryCount) {
                try {
                    const publicVapidKey = PUSH_CONFIG.PUBLIC_VAPID_KEY;
                    const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);
                    
                    subscription = await reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey
                    });
                    
                    console.log('[App] Push subscription created successfully:', subscription);
                    currentSubscription = subscription;
                    break;
                } catch (subscribeError) {
                    attempt++;
                    console.error(`[App] Failed to create push subscription (attempt ${attempt}/${retryCount}):`, subscribeError);
                    
                    if (attempt === retryCount) {
                        console.error('[App] Max retry attempts reached for push subscription');
                        return null;
                    }
                    
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        
        // Verify the subscription is valid
        if (subscription) {
            try {
                const permissionState = await reg.pushManager.permissionState({
                    userVisibleOnly: true
                });
                console.log('[App] Push Manager permission state:', permissionState);
                
                if (permissionState !== 'granted') {
                    console.error('[App] Push permission not granted:', permissionState);
                    return null;
                }
            } catch (error) {
                console.error('[App] Error checking push permission state:', error);
                // Continue anyway as some browsers might not support permissionState
            }
        }
        
        return subscription;
    } catch (error) {
        console.error('[App] Error in push subscription setup:', error);
        return null;
    }
};

// Add cleanup function
export const cleanupPushSubscription = async () => {
    try {
        if (currentSubscription) {
            console.log('[App] Cleaning up push subscription');
            await currentSubscription.unsubscribe();
            currentSubscription = null;
        }
    } catch (error) {
        console.error('[App] Error cleaning up push subscription:', error);
    }
};
  