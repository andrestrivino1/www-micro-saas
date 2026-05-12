'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import type { Appointment } from '@/lib/types';

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
}

function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function AppointmentEditDialog({ appointment, onClose }: Props) {
  if (!appointment) return null;
  return (
    <AppointmentEditDialogContent appointment={appointment} onClose={onClose} />
  );
}

function AppointmentEditDialogContent({
  appointment,
  onClose,
}: {
  appointment: Appointment;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const [scheduledLocal, setScheduledLocal] = useState(() =>
    toDateTimeLocal(appointment.scheduledAt),
  );
  const [service, setService] = useState(appointment.service);

  const mutation = useMutation({
    mutationFn: () => {
      const iso = new Date(scheduledLocal).toISOString();
      return api.updateAppointment(appointment.id, {
        scheduledAt: iso,
        service: service.trim(),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      void queryClient.invalidateQueries({
        queryKey: ['clients', appointment.clientId],
      });
      onClose();
    },
  });

  const originalIso = toDateTimeLocal(appointment.scheduledAt);
  const willResetReminder =
    appointment.reminderStatus === 'sent' && scheduledLocal !== originalIso;
  const canSubmit = service.trim().length >= 1 && scheduledLocal.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-semibold">Editar cita</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="text-sm text-zinc-600">
            <span className="font-medium">{appointment.petName}</span> ·{' '}
            {appointment.clientName}
          </div>

          <div>
            <label className="block text-xs text-zinc-600">Fecha y hora</label>
            <input
              type="datetime-local"
              required
              value={scheduledLocal}
              onChange={(e) => setScheduledLocal(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-600">Servicio</label>
            <input
              type="text"
              required
              minLength={1}
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {['Baño', 'Corte', 'Completo'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setService(s)}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {willResetReminder && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">
              Esta cita ya tiene un recordatorio enviado. Al cambiar la
              fecha/hora, el estado del recordatorio se reiniciará y deberás
              reenviarlo.
            </p>
          )}

          {mutation.isError && (
            <p className="text-sm text-red-600" role="alert">
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : 'No se pudo guardar.'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit || mutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Save className="h-3.5 w-3.5" aria-hidden />
            )}
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
