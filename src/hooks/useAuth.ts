'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

interface User {
  userId: number;
  email: string;
  role: string;
}

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();

    if (!token) {
      if (requireAuth) router.push('/signin');
      setLoading(false);
      return;
    }

    try {
      // Decodifica el JWT sin librería extra
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      });
    } catch {
      authService.removeToken();
      if (requireAuth) router.push('/signin');
    } finally {
      setLoading(false);
    }
  }, [router, requireAuth]);

  const logout = () => {
    authService.removeToken();
    router.push('/signin');
  };

  return { user, loading, logout };
}