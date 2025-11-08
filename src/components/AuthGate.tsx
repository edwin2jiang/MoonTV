/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface AuthGateProps {
  children: React.ReactNode;
}

// 基于 localStorage 的前端访问拦截
export default function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const shouldSkip = useMemo(() => {
    // 登录页与告示页不拦截；静态资源也不拦截
    if (!pathname) return true;
    return (
      pathname.startsWith('/login') ||
      pathname.startsWith('/warning') ||
      pathname.startsWith('/_next') ||
      pathname === '/favicon.ico' ||
      pathname.startsWith('/icons') ||
      pathname === '/logo.png' ||
      pathname === '/robots.txt'
    );
  }, [pathname]);

  useEffect(() => {
    // 仅在客户端执行
    if (typeof window === 'undefined') return;

    if (shouldSkip) {
      setReady(true);
      return;
    }

    const loggedIn = window.localStorage.getItem('moontv_logged_in') === 'true';
    if (loggedIn) {
      setReady(true);
      return;
    }

    const redirect = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
  }, [pathname, searchParams, router, shouldSkip]);

  // 在未就绪（还未判断登录）或已重定向时不渲染内容
  if (!ready) return null;
  return <>{children}</>;
}