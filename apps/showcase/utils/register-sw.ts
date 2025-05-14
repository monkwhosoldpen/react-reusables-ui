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

        // Check existing permission
        const permission = Notification.permission;
        console.log('[App] Checking existing notification permission:', permission);

        // Check for existing registrations
        console.log('[App] Checking for existing service worker registrations...');
        const existingRegistration = await navigator.serviceWorker.getRegistration();

        if (existingRegistration) {
            console.log('[App] Found existing service workers:', 1);
            
            // Check if there's an existing subscription
            const subscription = await existingRegistration.pushManager.getSubscription();
            if (subscription) {
                console.log('[App] Found existing push subscription');
                currentRegistration = existingRegistration;
                currentSubscription = subscription;
                console.log('[App] Found valid existing service worker, using it');
                return existingRegistration;
            }
        }

        // Register new service worker if no valid existing one found
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('[App] Service Worker registered successfully');
        
        currentRegistration = registration;
        return registration;

    } catch (error) {
        console.error('[App] Service Worker registration failed:', error);
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
  