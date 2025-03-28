# Push Notifications Setup Guide

This guide explains how to set up push notifications for your application using Web Push API and Supabase.

## Prerequisites

- Node.js and npm installed
- Supabase account and project
- Vercel account (for deployment)

## Setup Steps

### 1. Install Required Packages

```bash
npm install web-push
npm install --save-dev @types/web-push
```

### 2. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for web push notifications.

```bash
# Run the script to generate VAPID keys
node scripts/generate-vapid-keys.js
```

### 3. Set Up Environment Variables

Create a `.env.local` file based on the `.env.local.example` file and add your VAPID keys:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-generated-public-key
VAPID_PRIVATE_KEY=your-generated-private-key
VAPID_EMAIL=your-email@example.com
```

### 4. Create the Push Subscriptions Table in Supabase

Run the SQL migration in Supabase SQL Editor:

```sql
-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions
  USING (auth.uid() = user_id);

-- Allow service role to read all subscriptions (for sending push notifications)
CREATE POLICY "Service role can read all push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to update updated_at on update
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on update
CREATE TRIGGER update_push_subscription_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscription_updated_at();
```

### 5. Set Up Supabase Webhook

1. Go to your Supabase project dashboard
2. Navigate to Database > Webhooks
3. Create a new webhook:
   - Name: `push-notifications`
   - Table: `channels_activity`
   - Events: `INSERT`, `UPDATE`
   - URL: `https://your-app-url.vercel.app/api/webhooks/supabase`
   - HTTP Method: `POST`
   - Enable signing secret and copy the generated secret

4. Add the webhook secret to your environment variables:
   ```
   SUPABASE_WEBHOOK_SECRET=your-webhook-secret
   ```

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all the environment variables from your `.env.local` file to Vercel
4. Deploy your application

## How It Works

1. When a user enables notifications, they subscribe to push notifications
2. Their subscription is saved in the `push_subscriptions` table in Supabase
3. When a new message is added to `channels_activity`, Supabase triggers a webhook
4. The webhook calls the push notification API endpoint
5. The API endpoint sends push notifications to all subscribed users
6. The service worker displays the notification, even when the app is closed

## Testing Push Notifications

To test if push notifications are working:

1. Open your application in Chrome
2. Enable notifications when prompted
3. Add a new message to trigger a notification
4. Close the application and add another message
5. You should receive a push notification even when the app is closed

## Troubleshooting

- **Notifications not showing**: Check browser console for errors
- **Service worker not registering**: Ensure the service worker file is accessible
- **Webhook not triggering**: Check Supabase webhook logs
- **Push subscription failing**: Verify VAPID keys are correctly set 