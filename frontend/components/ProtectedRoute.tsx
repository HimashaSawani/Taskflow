'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken, getStoredUser } from '../lib/auth';
import { User } from '../types/user';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    const currentUser = getStoredUser();

    if (!token || !currentUser) {
      router.replace('/login');
      return;
    }

    if (requireAdmin && currentUser.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    setUser(currentUser);
    setAuthorized(true);
  }, [router, requireAdmin]);

  if (!authorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Verifying session permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}
