# nchat Starter App

A modern, responsive web application built with Next.js, React, and Tailwind CSS. This application includes internationalization support that works across React, Next.js, and React Native environments.

## Features

- Modern UI with Tailwind CSS and shadcn/ui components
- Dark/Light mode support
- Responsive design for mobile and desktop
- Internationalization with i18next (supports English, Telugu, Kannada, Hindi, and Tamil)
- Notification system
- Authentication context
- Cross-platform compatibility (Web and Mobile)
- Nine PM Alerts system for scheduled notifications

## Nine PM Alerts

The application includes a scheduled notification system that sends push notifications to all users at 9 PM. This feature:

- Sends a "Hello World" message to all subscribed users
- Can be triggered manually via API endpoint
- Automatically runs daily at 9 PM via Vercel Cron Jobs
- Supports custom messages through POST requests

### API Endpoints

- `GET /api/nine-pm-alerts` - Triggers the alert with default message
- `POST /api/nine-pm-alerts` - Triggers the alert with custom message
  ```json
  {
    "title": "Custom Title",
    "message": "Custom message content"
  }
  ```

### Cron Job Configuration

The alerts are scheduled using Vercel Cron Jobs in the `vercel.json` file:
```json
{
  "crons": [
    {
      "path": "/api/crons/nine-pm-alert",
      "schedule": "0 21 * * *"
    }
  ]
}
```

### Debugging Nine PM Alerts

To debug the Nine PM Alerts feature, you can use these endpoints:

- `GET /api/nine-pm-alerts/test` - Checks if the API is accessible and environment variables are configured
- `GET /api/nine-pm-alerts/count` - Counts the number of push subscriptions without sending notifications
- `GET /api/nine-pm-alerts` - Sends notifications to all users (regardless of their notification preferences)

The API includes detailed logging with the `[DEBUG]` prefix to help troubleshoot issues. Common problems include:

1. Missing VAPID keys - Ensure `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, and `VAPID_EMAIL` are set
2. Supabase connection issues - Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. No subscriptions in the database - Users need to have registered for push notifications

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fixd-ai-starter-app.git
cd fixd-ai-starter-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Internationalization

This project uses i18next for internationalization, which works across React, Next.js, and React Native environments.

### Supported Languages

- English (en)
- Telugu (te)
- Kannada (kn)
- Hindi (hi)
- Tamil (ta)

### Usage in React/Next.js

```jsx
import { useLanguage } from "@/lib/contexts/LanguageContext";

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <p>{t('common:search')}</p>
    </div>
  );
}
```

### React Native Integration

To use this internationalization setup in React Native:

1. Install the required dependencies:

```bash
npm install i18next react-i18next
# For React Native specific functionality
npm install @react-native-async-storage/async-storage
```

2. Create a language detector for React Native:

```jsx
// languageDetector.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const language = await AsyncStorage.getItem('language');
      if (language) {
        return callback(language);
      }
      // Default language
      return callback('en');
    } catch (error) {
      console.log('Error reading language from AsyncStorage:', error);
      return callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem('language', language);
    } catch (error) {
      console.log('Error saving language to AsyncStorage:', error);
    }
  }
};

export default languageDetector;
```

3. Modify the LanguageContext for React Native:

```jsx
// For React Native, replace localStorage with AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageDetector from './languageDetector';

// In the initialization section:
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    // Same configuration as web
  });

// Replace localStorage calls with AsyncStorage
const setLanguage = useCallback(async (language: Language) => {
  setCurrentLanguage(language);
  try {
    await AsyncStorage.setItem('language', language);
  } catch (error) {
    console.log('Error saving language:', error);
  }
  i18n.changeLanguage(language);
}, []);

// Load saved language
useEffect(() => {
  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language') as Language;
      if (savedLanguage && languages.some(lang => lang.id === savedLanguage)) {
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };
  
  loadLanguage();
}, []);
```

## License

MIT 