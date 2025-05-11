import React, { useEffect, useState } from 'react';

export default function AddToHomescreenButton() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };

    const handleAppInstalled = () => setInstalled(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const addToHomeScreen = () => {
    if (!prompt) return;
    prompt.prompt();
    prompt.userChoice.then(() => {
      setPrompt(null);
      setInstalled(true);
    });
  };

  if (installed || !prompt) return null;

  return (
    <button 
      onClick={addToHomeScreen} 
      className="fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-colors"
    >
      💾 Add to Homescreen
    </button>
  );
} 