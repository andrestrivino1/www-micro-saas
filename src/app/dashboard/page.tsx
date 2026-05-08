'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Loader2, Plus, Users } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Appointment } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { AppShell } from '@/components/AppShell';
import { AppointmentCard } from '@/components/AppointmentCard';
import { ReminderPreviewDialog } from '@/components/ReminderPreviewDialog';

export default function DashboardPage() {
  const [reminderTarget, setReminderTarget] = useState<Appointment | null>(null);

  // No pasamos `date`: el backend usa `new Date()` y computa la ventana en la
  // zona horaria del servidor (que en local coincide con la del usuario).
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => api.listAppointments(),
  });

  // El calendario invalida con clave ['appointments', 'range', ...]; mantenemos
  // ['appointments', 'today'] para esta vista, pero ambas viven bajo el prefijo
  // común ['appointments'] así una mutación las invalida juntas.

  return (
    <AppShell>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            {formatDate(new Date().toISOString())}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Agenda de hoy
          </h1>
        </div>
        <Link
          href="/appointments/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nueva cita
        </Link>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Cargando agenda…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          No se pudo cargar la agenda.{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className="underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyAgenda />
      ) : (
        <ul className="space-y-3">
          {data.map((a) => (
            <li key={a.id}>
              <AppointmentCard
                appointment={a}
                onSendReminder={setReminderTarget}
              />
            </li>
          ))}
        </ul>
      )}

      {isRefetching && (
        <p className="mt-4 text-xs text-zinc-400">Actualizando…</p>
      )}

      <ReminderPreviewDialog
        appointment={reminderTarget}
        onClose={() => setReminderTarget(null)}
      />
    </AppShell>
  );
}

function EmptyAgenda() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
      <Calendar className="mx-auto h-10 w-10 text-zinc-400" aria-hidden />
      <h2 className="mt-4 text-base font-medium text-zinc-900">
        Sin citas para hoy
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Programa una nueva cita o revisa tu lista de clientes.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/appointments/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nueva cita
        </Link>
        <Link
          href="/clients"
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
        >
          <Users className="h-4 w-4" aria-hidden />
          Ver clientes
        </Link>
      </div>
    </div>
  );
}
