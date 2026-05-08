'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { AppShell } from '@/components/AppShell';

const inputCls =
  'mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200';

const SERVICES = ['Baño', 'Corte', 'Completo'] as const;

function defaultDateTime(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);
  return formatLocal(d);
}

function formatLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function initialFromParams(date: string | null, hour: string | null): string {
  if (!date) return defaultDateTime();
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return defaultDateTime();
  const hh = hour && /^\d{2}:\d{2}$/.test(hour) ? hour : '09:00';
  return `${date}T${hh}`;
}

function NewAppointmentForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const hourParam = searchParams.get('hour');

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: api.listClients,
  });

  const [clientId, setClientId] = useState('');
  const [scheduledAt, setScheduledAt] = useState(() =>
    initialFromParams(dateParam, hourParam),
  );
  const [service, setService] = useState<string>(SERVICES[0]);

  const selected = useMemo(
    () => clients?.find((c) => c.id === clientId) ?? null,
    [clients, clientId],
  );

  const isPast = useMemo(() => {
    if (!scheduledAt) return false;
    return new Date(scheduledAt).getTime() < Date.now();
  }, [scheduledAt]);

  const mutation = useMutation({
    mutationFn: api.createAppointment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push(dateParam ? '/calendar' : '/dashboard');
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mutation.isPending || !selected) return;
    if (isPast) {
      const ok = window.confirm(
        'La fecha que elegiste ya pasó. ¿Quieres registrar la cita igualmente?',
      );
      if (!ok) return;
    }
    mutation.mutate({
      clientId: selected.id,
      petId: selected.pet.id,
      scheduledAt: new Date(scheduledAt).toISOString(),
      service,
    });
  }

  const backHref = dateParam ? '/calendar' : '/dashboard';
  const backLabel = dateParam ? 'Volver al calendario' : 'Volver a la agenda';

  return (
    <>
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Nueva cita</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {dateParam
          ? 'Fecha precargada desde el calendario.'
          : 'Selecciona un cliente, fecha y servicio.'}
      </p>

      <form
        onSubmit={submit}
        className="mt-6 space-y-5 rounded-2xl border border-zinc-200 bg-white p-5"
      >
        <label className="block text-sm">
          <span className="text-zinc-700">Cliente</span>
          <select
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={inputCls}
          >
            <option value="">— Seleccionar —</option>
            {clientsLoading ? (
              <option disabled>Cargando…</option>
            ) : (
              clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.pet.name}
                </option>
              ))
            )}
          </select>
          {selected && (
            <p className="mt-2 text-xs text-zinc-500">
              Mascota: <span className="font-medium">{selected.pet.name}</span>
              {selected.pet.breed ? ` (${selected.pet.breed})` : ''}
            </p>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-zinc-700">Fecha y hora</span>
            <input
              required
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className={inputCls}
            />
            {isPast && (
              <p className="mt-1 text-xs text-amber-700">
                La fecha está en el pasado; al guardar te pediremos confirmación.
              </p>
            )}
          </label>

          <label className="text-sm">
            <span className="text-zinc-700">Servicio</span>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={inputCls}
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : 'No se pudo crear la cita.'}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link
            href={backHref}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending || !selected}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {mutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            )}
            Crear cita
          </button>
        </div>
      </form>
    </>
  );
}

export default function NewAppointmentPage() {
  return (
    <AppShell>
      <Suspense fallback={<p className="text-sm text-zinc-500">Cargando…</p>}>
        <NewAppointmentForm />
      </Suspense>
    </AppShell>
  );
}
