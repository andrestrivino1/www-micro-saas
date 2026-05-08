'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, MessageCircle, X } from 'lucide-react';
import type { Appointment, NotificationDto } from '@/lib/types';
import { api, ApiError } from '@/lib/api-client';

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
}

function composePreview(a: Appointment): string {
  const time = new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota',
  })
    .format(new Date(a.scheduledAt))
    .replace('a. m.', 'am')
    .replace('p. m.', 'pm');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(a.scheduledAt);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );

  let when: string;
  if (diffDays === 0) when = `hoy a las ${time}`;
  else if (diffDays === 1) when = `mañana a las ${time}`;
  else if (diffDays === -1) when = `ayer a las ${time}`;
  else {
    const dateStr = new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Bogota',
    }).format(new Date(a.scheduledAt));
    when = `el ${dateStr} a las ${time}`;
  }

  return `Hola, ${a.petName} tiene ${a.service} ${when} 🐶`;
}

export function ReminderPreviewDialog({ appointment, onClose }: Props) {
  const open = appointment !== null;
  const [confirmRetry, setConfirmRetry] = useState(false);
  const [sentNotification, setSentNotification] =
    useState<NotificationDto | null>(null);
  const queryClient = useQueryClient();

  const preview = useMemo(
    () => (appointment ? composePreview(appointment) : ''),
    [appointment],
  );

  const mutation = useMutation({
    mutationFn: (id: string) => api.sendReminder(id),
    onSuccess: (data) => {
      setSentNotification(data);
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  useEffect(() => {
    if (!open) {
      setConfirmRetry(false);
      setSentNotification(null);
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !appointment) return null;

  const alreadySent = appointment.reminderStatus === 'sent';
  const needsRetryConfirm = alreadySent && !confirmRetry;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-semibold">Enviar recordatorio</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm text-zinc-500">
            Vista previa del mensaje para{' '}
            <span className="font-medium text-zinc-900">
              {appointment.petName}
            </span>{' '}
            ({appointment.clientName}):
          </p>
          <div className="mt-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-emerald-800">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              WhatsApp · simulado
            </div>
            <p className="text-sm text-zinc-900">{preview}</p>
          </div>

          {sentNotification ? (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
              <Check className="h-4 w-4" aria-hidden />
              Recordatorio enviado correctamente.
            </div>
          ) : needsRetryConfirm ? (
            <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
              Esta cita ya tenía un recordatorio enviado. ¿Quieres reenviarlo?
            </div>
          ) : null}

          {mutation.isError && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : 'No se pudo enviar el recordatorio.'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4">
          {sentNotification ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Cerrar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
              >
                Cancelar
              </button>
              {needsRetryConfirm ? (
                <button
                  type="button"
                  onClick={() => setConfirmRetry(true)}
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                >
                  Sí, reenviar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => mutation.mutate(appointment.id)}
                  disabled={mutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                >
                  {mutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  )}
                  {alreadySent ? 'Confirmar reenvío' : 'Enviar'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
