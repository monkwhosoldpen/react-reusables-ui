import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface LoginCommonProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string;
  isLoading: boolean;
  handleSubmit: () => Promise<void>;
  handleAnonymousSignIn: () => Promise<void>;
  handleGuestSignIn: () => Promise<void>;
  onCancel: () => void;
}

export function LoginCommon({
  email,
  setEmail,
  password,
  setPassword,
  error,
  isLoading,
  handleSubmit,
  handleAnonymousSignIn,
  handleGuestSignIn,
  onCancel,
}: LoginCommonProps) {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginCommon] Form submitted with:', { email, password });
    setIsSigningIn(true);
    try {
      await handleSubmit();
      console.log('[LoginCommon] Form submission successful');
    } catch (err) {
      console.error('[LoginCommon] Form submission error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[LoginCommon] Email changed to:', e.target.value);
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[LoginCommon] Password changed');
    setPassword(e.target.value);
  };

  return (
    <div className="flex flex-col space-y-4">
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading || isSigningIn}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading || isSigningIn ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="flex flex-col space-y-2">
        <button
          onClick={handleAnonymousSignIn}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Sign in anonymously
        </button>
        <button
          onClick={handleGuestSignIn}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Sign in as guest
        </button>
        <button
          onClick={onCancel}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default LoginCommon; 