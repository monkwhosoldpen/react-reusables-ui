const crypto = require('crypto');
const https = require('https');
const http = require('http');

// ANSI color codes for console styling
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Styled console logging
const styledLog = {
  title: (text) => console.log(`${colors.bright}${colors.fg.cyan}${text}${colors.reset}`),
  subtitle: (text) => console.log(`${colors.fg.magenta}${text}${colors.reset}`),
  info: (text) => console.log(`${colors.fg.green}${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.fg.yellow}${text}${colors.reset}`),
  error: (text) => console.log(`${colors.fg.red}${text}${colors.reset}`),
  highlight: (text) => console.log(`${colors.bg.blue}${colors.fg.white}${text}${colors.reset}`),
  json: (obj) => console.log(`${colors.fg.yellow}${JSON.stringify(obj, null, 2)}${colors.reset}`)
};

// Replace these values with your actual values
const WEBHOOK_URLS = [
  "https://starterapp.fixd.ai/api/webhooks/supabase", // Production URL
  "http://localhost:3000/api/webhooks/supabase"       // Local development URL
];
const WEBHOOK_SECRET = "3sLMc+FpEyr/t6IrcSipRXxGAPX2ba+ItCcIih7Zg7E=";

// Current timestamp
const timestamp = new Date().toISOString();

// Create a rich notification payload
const notificationPayload = {
  title: "🌟 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 𝗘𝘅𝗮𝗺𝗽𝗹𝗲",
  message: "Welcome to our app!\n\n★ 𝗡𝗲𝘄 𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀 ★\n\n• Rich notifications\n• Improved performance\n• Bug fixes\n\n━━━━━━━━━━━━━━━━━━\n\n⚠️ 𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁: Please update your app",
  icon: "/icons/icon-192x192.png",
  badge: "/icons/badge-96x96.png",
  image: "https://picsum.photos/400/200",
  vibrate: [200, 100, 200],
  url: '/elonmusk', // Direct URL property
  data: {
    url: '/elonmusk', // URL in data for compatibility
    username: 'elonmusk'
  },
  actions: [
    {
      action: 'explore',
      title: '🔍 Explore',
    },
    {
      action: 'close',
      title: '❌ Close',
    }
  ],
  dir: 'auto',
  tag: 'rich-notification',
  requireInteraction: true
};

// Create a sample payload that mimics what Supabase would send
const payload = {
  type: "INSERT",
  table: "channels_activity",
  schema: "public",
  record: {
    username: "elonmusk",
    last_updated_at: timestamp,
    last_message: {
      id: "test-message-id",
      message_text: notificationPayload.message,
      created_at: timestamp,
      notification: {
        title: notificationPayload.title,
        message: notificationPayload.message,
        icon: notificationPayload.icon,
        badge: notificationPayload.badge,
        image: notificationPayload.image,
        vibrate: notificationPayload.vibrate,
        url: '/elonmusk',  // Ensure URL is in the root of notification
        data: {
          url: '/elonmusk',  // Also keep in data for compatibility
          username: 'elonmusk'
        },
        actions: notificationPayload.actions,
        dir: notificationPayload.dir,
        tag: notificationPayload.tag,
        requireInteraction: notificationPayload.requireInteraction
      }
    },
    read: false
  },
  old_record: null
};

// Convert payload to JSON string
const payloadString = JSON.stringify(payload);

// Calculate the HMAC signature (this is what Supabase does to secure webhooks)
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payloadString)
  .digest('hex');

// Prepare the request options
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payloadString),
    'x-supabase-signature': signature
  }
};

// Function to send a request to a single endpoint
const sendRequest = (webhookUrl) => {
  return new Promise((resolve) => {
    // Parse the URL to determine if we need http or https
    const url = new URL(webhookUrl);
    const requestModule = url.protocol === 'https:' ? https : http;
    
    console.log(`Attempting to connect to ${webhookUrl}...`);
    
    // Send the request
    const req = requestModule.request(webhookUrl, options, (res) => {
      console.log(`Connected to ${webhookUrl} - Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(data);
          resolve({
            url: webhookUrl,
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          // If not JSON, return as text
          resolve({
            url: webhookUrl,
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`Error connecting to ${webhookUrl}: ${error.message}`);
      
      // Add specific error handling for common localhost issues
      let errorMessage = error.message;
      if (webhookUrl.includes('localhost') && error.code === 'ECONNREFUSED') {
        errorMessage = `Connection refused. Make sure your local server is running on port ${url.port || '3000'}.`;
      }
      
      resolve({
        url: webhookUrl,
        statusCode: 0,
        error: errorMessage,
        errorCode: error.code
      });
    });
    
    // Write the payload to the request body
    req.write(payloadString);
    req.end();
  });
};

// Send requests to all endpoints
Promise.all(WEBHOOK_URLS.map(sendRequest))
  .then(results => {
    console.log("");
    
    results.forEach((result) => {
      const urlParts = new URL(result.url);
      const host = urlParts.host;
      
      styledLog.subtitle(`📤 Result for ${host}:`);
      
      if (result.error) {
        styledLog.error(`❌ Error: ${result.error}`);
        if (result.errorCode) {
          console.log(`Error code: ${result.errorCode}`);
        }
        
        // Add troubleshooting tips for localhost
        if (host === 'localhost:3000') {
          console.log("\nTroubleshooting tips for localhost:");
          console.log("1. Make sure your Next.js server is running (npm run dev)");
          console.log("2. Check that port 3000 is not blocked by a firewall");
          console.log("3. Verify the webhook endpoint exists at /api/webhooks/supabase");
        }
      } else if (result.statusCode >= 200 && result.statusCode < 300) {
        styledLog.info(`✅ Response status: ${result.statusCode}`);
        styledLog.info("📄 Response body:");
        styledLog.json(result.data);
      } else {
        styledLog.error(`❌ Response status: ${result.statusCode}`);
        styledLog.info("📄 Response body:");
        console.log(result.data);
      }
      console.log("");
    });
    
    styledLog.highlight(" TEST COMPLETED! ");
    console.log("");
    styledLog.subtitle("📱 Check your device for the rich notifications");
    styledLog.subtitle("💡 Note: Not all features are supported in all browsers/platforms");
    
    // Display full payload details at the end for reference
    console.log("");
    styledLog.info("📋 Full Notification Payload (for reference):");
    styledLog.json(notificationPayload);
  }); 