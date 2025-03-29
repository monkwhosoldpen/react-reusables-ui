# Setting Up Supabase Webhook for Push Notifications

Follow these steps to set up a webhook in Supabase that will trigger push notifications when new messages are added to the `channels_activity` table.

## 1. Create the Push Subscriptions Table

First, run the SQL in the `push_subscriptions_table.sql` file in your Supabase SQL Editor to create the table that will store browser push subscriptions.

## 2. Set Up the Webhook

1. Go to your Supabase project dashboard
2. Navigate to Database > Webhooks
3. Create a new webhook with the following settings:
   - **Name**: `push-notifications`
   - **Table**: `channels_activity`
   - **Events**: Select `INSERT` and `UPDATE`
   - **URL**: `https://your-app-url.vercel.app/api/webhooks/supabase` (replace with your actual deployed URL)
   - **HTTP Method**: `POST`
   - **Enable signing secret**: Check this option
   - **Secret**: Enter the value from your `.env.local` file for `SUPABASE_WEBHOOK_SECRET`

## 3. Deploy Your Application

Make sure your application is deployed with all the environment variables set in your hosting platform (e.g., Vercel).

## 4. Test the Webhook

1. Open your application in a browser
2. Enable notifications when prompted
3. Add a new message to trigger a notification
4. Check the Supabase webhook logs to ensure it's being triggered correctly

## Troubleshooting

- If the webhook isn't triggering, check the Supabase webhook logs for errors
- Ensure your application is properly deployed and accessible at the webhook URL
- Verify that the webhook secret matches the one in your `.env.local` file 