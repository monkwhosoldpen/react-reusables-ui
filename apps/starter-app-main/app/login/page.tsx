'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import DefaultLayout from '@/components/layout/defaultlayout';
import LoginCommon from '@/components/common/LoginCommon';

export default function Login() {
  const router = useRouter();
  const { signIn, signInAnonymously, signInAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInAnonymously();
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      setError('Failed to sign in anonymously');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInAsGuest();
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      setError('Failed to sign in as guest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <main className="flex-1 w-full py-0 md:py-12 flex items-center justify-center">
        <div className="w-full h-full flex flex-col md:flex-row md:items-center md:justify-center md:max-w-7xl md:mx-auto">
          {/* Left column with Buddha image - hidden on mobile */}
          <div className="hidden md:flex md:h-auto md:flex-1 items-center justify-center bg-gradient-to-br from-background/80 to-background p-6 md:p-12">
            <div className="relative w-full h-full max-h-[300px] md:max-h-[500px]">
              <img
                src="/blue-buddha.svg"
                alt="Blue Buddha"
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Right column with login form */}
          <LoginCommon
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={error}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            handleAnonymousSignIn={handleAnonymousSignIn}
            handleGuestSignIn={handleGuestSignIn}
          />
        </div>
      </main>
    </DefaultLayout>
  );
}
