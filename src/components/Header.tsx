'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, PawPrint } from 'lucide-react';
import { clearSession } from '@/lib/auth';

const navItems: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Agenda' },
  { href: '/clients', label: 'Clientes' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearSession();
    router.push('/');
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <PawPrint className="h-4 w-4" aria-hidden />
          </span>
          <span>Grooming</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 font-medium transition ${
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={logout}
            className="ml-2 inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
