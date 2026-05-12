'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Pencil, Trash2, X } from 'lucide-react';
import type { Appointment } from '@/lib/types';
import { api, ApiError } from '@/lib/api-client';
import { formatDate, formatTime } from '@/lib/format';
import { ReminderStatusPill } from './StatusPill';
import { AppointmentEditDialog } from './AppointmentEditDialog';
import { ReminderPreviewDialog } from './ReminderPreviewDialog';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
}

export function AppointmentDetailDialog({ appointment, onClose }: Props) {
  const queryClient = useQueryClient();
  const [showReminder, setShowReminder] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!appointment) throw new Error('no appointment');
      return api.deleteAppointment(appointment.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
  });

  if (!appointment) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-900/40 p-4 sm:items-center"
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
              {formatDate(appointment.scheduledAt)} ·{' '}
              {formatTime(appointment.scheduledAt)}
            </p>
            <h3 className="mt-2 text-xl font-semibold">{appointment.petName}</h3>
            <p className="text-sm text-zinc-600">
              Dueño: {appointment.clientName}
            </p>
            <p className="mt-3 text-sm">
              Servicio:{' '}
              <span className="font-medium">{appointment.service}</span>
            </p>
            <div className="mt-3">
              <ReminderStatusPill status={appointment.reminderStatus} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
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
              onClick={() => setShowReminder(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              {appointment.reminderStatus === 'sent'
                ? 'Reenviar recordatorio'
                : 'Enviar recordatorio'}
            </button>
          </div>
        </div>
      </div>

      <ReminderPreviewDialog
        appointment={showReminder ? appointment : null}
        onClose={() => setShowReminder(false)}
      />

      <AppointmentEditDialog
        appointment={editing ? appointment : null}
        onClose={() => setEditing(false)}
      />

      <ConfirmDialog
        open={confirmingDelete}
        title="Eliminar cita"
        destructive
        loading={deleteMutation.isPending}
        confirmLabel="Sí, eliminar"
        message={
          <div className="space-y-2">
            <p>
              Vas a eliminar la cita de <strong>{appointment.petName}</strong>{' '}
              del {formatDate(appointment.scheduledAt)} a las{' '}
              {formatTime(appointment.scheduledAt)}.
            </p>
            <p className="text-zinc-600">
              También se eliminará el historial de recordatorios asociado a
              esta cita.
            </p>
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
    </>
  );
}
