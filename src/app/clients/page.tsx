'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Phone, Plus, UserPlus } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AppShell } from '@/components/AppShell';

export default function ClientsListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: api.listClients,
  });

  return (
    <AppShell>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {data ? `${data.length} cliente${data.length === 1 ? '' : 's'}` : ' '}
          </p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          Nuevo cliente
        </Link>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Cargando clientes…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          No se pudieron cargar los clientes.
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <h2 className="text-base font-medium">Aún no hay clientes</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Crea tu primer cliente con su mascota.
          </p>
          <Link
            href="/clients/new"
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nuevo cliente
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((c) => (
            <li key={c.id}>
              <Link
                href={`/clients/${c.id}`}
                className="block rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate font-medium">{c.name}</h3>
                  <span className="text-sm text-zinc-500">{c.pet.name}</span>
                </div>
                <p className="mt-1 truncate text-sm text-zinc-500">
                  {c.pet.breed ?? 'Sin raza'}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                  <Phone className="h-3 w-3" aria-hidden />
                  {c.phone}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
