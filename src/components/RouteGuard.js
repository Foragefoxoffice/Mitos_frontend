// components/RouteGuard.js
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserRole } from '../utils/auth';

const guestAllowedRoutes = [
  '/user/dashboard',
  '/',
  '/login',
  '/register',
];

export default function RouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const role = getUserRole();
    
    if (role === 'guest' && !guestAllowedRoutes.some(route => 
        pathname.startsWith(route))) {
      router.push('/user/dashboard');
    }
  }, [pathname, router]);

  return children;
}