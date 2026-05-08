'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import type { ClientCreateInput } from '@/lib/types';
import { AppShell } from '@/components/AppShell';

const inputCls =
  'mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200';

export default function NewClientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ClientCreateInput>({
    name: '',
    phone: '',
    notes: '',
    pet: { name: '', breed: '', notes: '' },
  });

  const mutation = useMutation({
    mutationFn: api.createClient,
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
      router.push(`/clients/${created.id}`);
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate({
      name: form.name.trim(),
      phone: form.phone.trim(),
      notes: form.notes?.trim() || undefined,
      pet: {
        name: form.pet.name.trim(),
        breed: form.pet.breed?.trim() || undefined,
        notes: form.pet.notes?.trim() || undefined,
      },
    });
  }

  return (
    <AppShell>
      <Link
        href="/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a clientes
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Nuevo cliente</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Registra al dueño y a su mascota en un solo paso.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <fieldset className="rounded-2xl border border-zinc-200 bg-white p-5">
          <legend className="px-2 text-sm font-medium text-zinc-700">
            Dueño
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-zinc-700">Nombre</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                placeholder="María González"
              />
            </label>
            <label className="text-sm">
              <span className="text-zinc-700">Teléfono / WhatsApp</span>
              <input
                required
                minLength={6}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputCls}
                placeholder="+57 300 000 0000"
              />
            </label>
            <label className="sm:col-span-2 text-sm">
              <span className="text-zinc-700">Notas (opcional)</span>
              <input
                value={form.notes ?? ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputCls}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-zinc-200 bg-white p-5">
          <legend className="px-2 text-sm font-medium text-zinc-700">
            Mascota
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-zinc-700">Nombre</span>
              <input
                required
                value={form.pet.name}
                onChange={(e) =>
                  setForm({ ...form, pet: { ...form.pet, name: e.target.value } })
                }
                className={inputCls}
                placeholder="Luna"
              />
            </label>
            <label className="text-sm">
              <span className="text-zinc-700">Raza (opcional)</span>
              <input
                value={form.pet.breed ?? ''}
                onChange={(e) =>
                  setForm({ ...form, pet: { ...form.pet, breed: e.target.value } })
                }
                className={inputCls}
                placeholder="Golden Retriever"
              />
            </label>
            <label className="sm:col-span-2 text-sm">
              <span className="text-zinc-700">Observaciones (opcional)</span>
              <input
                value={form.pet.notes ?? ''}
                onChange={(e) =>
                  setForm({ ...form, pet: { ...form.pet, notes: e.target.value } })
                }
                className={inputCls}
              />
            </label>
          </div>
        </fieldset>

        {mutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : 'No se pudo crear el cliente.'}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <Link
            href="/clients"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {mutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            )}
            Crear cliente
          </button>
        </div>
      </form>
    </AppShell>
  );
}
