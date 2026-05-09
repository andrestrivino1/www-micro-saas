'use client';

import { Send } from 'lucide-react';
import type { Appointment } from '@/lib/types';
import { formatTime } from '@/lib/format';
import { ReminderStatusPill } from './StatusPill';

interface Props {
  appointment: Appointment;
  onSendReminder?: (a: Appointment) => void;
}

export function AppointmentCard({ appointment, onSendReminder }: Props) {
  const isSent = appointment.reminderStatus === 'sent';
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
      <div className="w-14 shrink-0 text-center sm:w-20">
        <div className="text-lg font-semibold tabular-nums text-zinc-900 sm:text-2xl">
          {formatTime(appointment.scheduledAt)}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h3 className="truncate text-sm font-medium text-zinc-900 sm:text-base">
            {appointment.petName}
          </h3>
          <span className="truncate text-xs text-zinc-500 sm:text-sm">
            · {appointment.clientName}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-600 sm:text-sm">
            {appointment.service}
          </span>
          <ReminderStatusPill status={appointment.reminderStatus} />
        </div>
      </div>

      {onSendReminder && (
        <button
          type="button"
          onClick={() => onSendReminder(appointment)}
          aria-label={isSent ? 'Reenviar recordatorio' : 'Enviar recordatorio'}
          title={isSent ? 'Reenviar recordatorio' : 'Enviar recordatorio'}
          className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition sm:px-3.5 ${
            isSent
              ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          <Send className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">
            {isSent ? 'Reenviar' : 'Enviar recordatorio'}
          </span>
        </button>
      )}
    </article>
  );
}
