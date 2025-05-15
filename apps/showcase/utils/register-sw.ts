import { PUSH_CONFIG } from '~/lib/core/config/push-config';

// Track registration state
let registrationInProgress = false;
let currentRegistration: ServiceWorkerRegistration | null = null;

// Keep track of active subscription
let currentSubscription: PushSubscription | null = null;

export const registerServiceWorker = async () => {
    // Prevent multiple simultaneous registrations
    if (registrationInProgress) {
        return currentRegistration;
    }

    if (!('serviceWorker' in navigator)) {
        return null;
    }

    if (!('Notification' in window)) {
        return null;
    }

    try {
        registrationInProgress = true;

        // Check existing permission
        const permission = Notification.permission;

        // Check for existing registrations
        const existingRegistration = await navigator.serviceWorker.getRegistration();

        if (existingRegistration) {
            // Check if there's an existing subscription
            const subscription = await existingRegistration.pushManager.getSubscription();
            if (subscription) {
                currentRegistration = existingRegistration;
                currentSubscription = subscription;
                return existingRegistration;
            }
        }

        // Register new service worker if no valid existing one found
        const registration = await navigator.serviceWorker.register('/service-worker.js');

        currentRegistration = registration;
        return registration;

    } catch (error) {
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
            return null;
        }

        // If we already have an active subscription, return it
        if (currentSubscription) {
            return currentSubscription;
        }

        // Check if we already have a subscription
        let subscription = await reg.pushManager.getSubscription();

        // If we have an existing subscription, unsubscribe first to ensure clean state
        if (subscription) {
            await subscription.unsubscribe();
            subscription = null;
        }

        if (!subscription) {
            // Verify permission before attempting subscription
            if (Notification.permission !== 'granted') {
                return null;
            }

            let attempt = 0;
            while (attempt < retryCount) {
                try {
                    const publicVapidKey = PUSH_CONFIG.PUBLIC_VAPID_KEY;
                    const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);

                    subscription = await reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey
                    });

                    currentSubscription = subscription;
                    break;
                } catch (subscribeError) {
                    attempt++;

                    if (attempt === retryCount) {
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

                if (permissionState !== 'granted') {
                    return null;
                }
            } catch (error) {
                // Continue anyway as some browsers might not support permissionState
            }
        }

        return subscription;
    } catch (error) {
        return null;
    }
};

// Add cleanup function
export const cleanupPushSubscription = async () => {
    try {
        if (currentSubscription) {
            await currentSubscription.unsubscribe();
            currentSubscription = null;
        }
    } catch (error) {
        // Error silently ignored
    }
};