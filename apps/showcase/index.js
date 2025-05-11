import './global.css';

import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import * as serviceWorkerRegistration from './src/serviceWorkerRegistration';

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
