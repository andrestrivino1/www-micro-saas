'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadSession } from '@/lib/auth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loadSession()) {
      router.replace('/');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
