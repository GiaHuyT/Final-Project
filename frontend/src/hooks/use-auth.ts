'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const syncAuth = () => {
      const storedToken = Cookies.get('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setToken(null);
        setUser(null);
      }
    };

    syncAuth();
    window.addEventListener('user-updated', syncAuth);
    return () => window.removeEventListener('user-updated', syncAuth);
  }, []);

  return { user, token, isLoggedIn: !!token };
};
