'use client';

import { Send, X } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import type { Appointment, NotificationDto } from '@/lib/types';
import { api, ApiError } from '@/lib/api-client';
import { formatDate, formatTime } from '@/lib/format';
import { ReminderStatusPill } from './StatusPill';

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
}

export function AppointmentDetailDialog({ appointment, onClose }: Props) {
  const queryClient = useQueryClient();
  const [sent, setSent] = useState<NotificationDto | null>(null);

  const mutation = useMutation({
    mutationFn: (id: string) => api.sendReminder(id),
    onSuccess: (data) => {
      setSent(data);
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  if (!appointment) return null;
  const isSent = appointment.reminderStatus === 'sent' || sent !== null;

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
          <h2 className="text-base font-semibold">Detalle de cita</h2>
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
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {formatDate(appointment.scheduledAt)} · {formatTime(appointment.scheduledAt)}
          </p>
          <h3 className="mt-2 text-xl font-semibold">
            {appointment.petName}
          </h3>
          <p className="text-sm text-zinc-600">
            Dueño: {appointment.clientName}
          </p>
          <p className="mt-3 text-sm">
            Servicio: <span className="font-medium">{appointment.service}</span>
          </p>
          <div className="mt-3">
            <ReminderStatusPill status={isSent ? 'sent' : 'not_sent'} />
          </div>

          {sent && (
            <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
              <p className="text-xs font-medium">Mensaje enviado:</p>
              <p className="mt-1">{sent.messageText}</p>
            </div>
          )}

          {mutation.isError && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : 'No se pudo enviar el recordatorio.'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate(appointment.id)}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Send className="h-3.5 w-3.5" aria-hidden />
            )}
            {isSent ? 'Reenviar recordatorio' : 'Enviar recordatorio'}
          </button>
        </div>
      </div>
    </div>
  );
}
