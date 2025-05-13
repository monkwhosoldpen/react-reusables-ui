export async function subscribeToPush(vapidPublicKey: string) {
    console.log('[App] Attempting to subscribe to push...');
  
    const reg = await navigator.serviceWorker.ready;
    console.log('[App] SW ready, subscribing...');
  
    try {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
  
      console.log('[App] ✅ Push subscription successful:', subscription);
      return subscription;
    } catch (err) {
      console.error('[App] ❌ Push subscription failed:', err);
    }
  }
  
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
  
    return outputArray;
  }
  