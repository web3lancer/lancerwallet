"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { getLoggedInUser } from '@/app/auth/actions';
import { Models } from 'appwrite';
import Skeleton from './ui/Skeleton'; // A loading skeleton

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { user } = await getLoggedInUser();
        if (user) {
          setUser(user as Models.User<Models.Preferences>);
        }
      } catch (error) {
        console.error('Failed to fetch user session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [setUser]);

  if (isLoading) {
    // You can replace this with a more sophisticated loading screen or splash screen
    return (
        <div className="flex items-center justify-center h-screen">
            <Skeleton className="w-64 h-8" />
        </div>
    );
  }

  return <>{children}</>;
}
