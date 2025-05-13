const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys generated:');
console.log('==========================================');
console.log(`Public Key:
${vapidKeys.publicKey}`);
console.log('==========================================');
console.log(`Private Key:
${vapidKeys.privateKey}`);
console.log('==========================================');
console.log('\nAdd these to your .env.local file:');
console.log(`
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_EMAIL=your-email@example.com
`); 