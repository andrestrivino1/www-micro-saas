'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, ListTodo, LogOut, PawPrint, Users } from 'lucide-react';
import { clearSession } from '@/lib/auth';

const navItems: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { href: '/dashboard', label: 'Agenda', icon: ListTodo },
  { href: '/calendar', label: 'Calendario', icon: Calendar },
  { href: '/clients', label: 'Clientes', icon: Users },
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
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <PawPrint className="h-4 w-4" aria-hidden />
          </span>
          <span className="hidden xs:inline sm:inline">Grooming</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-medium transition sm:px-4 ${
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Icon className="h-4 w-4 sm:hidden" aria-hidden />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={logout}
            className="ml-1 inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
