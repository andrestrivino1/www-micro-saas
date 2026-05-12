'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Pencil,
  Phone,
  Trash2,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { formatDateShort, formatTime } from '@/lib/format';
import { AppShell } from '@/components/AppShell';
import { ReminderStatusPill } from '@/components/StatusPill';
import { ClientEditDialog } from '@/components/ClientEditDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClientDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => api.getClient(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteClient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push('/clients');
    },
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Cargando cliente…
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          No se pudo cargar el cliente.
        </div>
      </AppShell>
    );
  }

  const futureCount = data.appointments.filter(
    (a) => new Date(a.scheduledAt) >= new Date(),
  ).length;

  return (
    <AppShell>
      <Link
        href="/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a clientes
      </Link>

      <header className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {data.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {data.pet.name} · {data.pet.breed ?? 'Sin raza'}
            </p>
          </div>
          <a
            href={`tel:${data.phone}`}
            className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {data.phone}
          </a>
        </div>
        {data.pet.notes && (
          <p className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">
            <span className="font-medium text-zinc-700">Notas: </span>
            {data.pet.notes}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Editar
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-red-600 ring-1 ring-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Eliminar
          </button>
        </div>
      </header>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-700">
          <Calendar className="h-4 w-4" aria-hidden />
          Historial de citas ({data.appointments.length})
        </h2>
        {data.appointments.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-sm text-zinc-500 ring-1 ring-zinc-200">
            Aún no hay citas registradas para esta mascota.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.appointments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-zinc-200"
              >
                <div>
                  <div className="text-sm font-medium">
                    {formatDateShort(a.scheduledAt)} · {formatTime(a.scheduledAt)}
                  </div>
                  <div className="text-xs text-zinc-500">{a.service}</div>
                </div>
                <ReminderStatusPill status={a.reminderStatus} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ClientEditDialog
        client={editing ? data : null}
        onClose={() => setEditing(false)}
      />

      <ConfirmDialog
        open={confirmingDelete}
        title="Eliminar cliente"
        destructive
        loading={deleteMutation.isPending}
        confirmLabel="Sí, eliminar"
        message={
          <div className="space-y-2">
            <p>
              Vas a eliminar a <strong>{data.name}</strong> y su mascota{' '}
              <strong>{data.pet.name}</strong>.
            </p>
            {futureCount > 0 && (
              <p className="text-amber-700">
                También se eliminarán {futureCount} cita
                {futureCount === 1 ? '' : 's'} futura
                {futureCount === 1 ? '' : 's'} y todo el historial de
                recordatorios. Esta acción no se puede deshacer.
              </p>
            )}
            {deleteMutation.isError && (
              <p className="text-red-600">
                {deleteMutation.error instanceof ApiError
                  ? deleteMutation.error.message
                  : 'No se pudo eliminar.'}
              </p>
            )}
          </div>
        }
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </AppShell>
  );
}
