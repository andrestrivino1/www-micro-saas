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
    <article className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="w-20 shrink-0 text-center">
        <div className="text-2xl font-semibold tabular-nums text-zinc-900">
          {formatTime(appointment.scheduledAt)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h3 className="truncate text-base font-medium text-zinc-900">
            {appointment.petName}
          </h3>
          <span className="truncate text-sm text-zinc-500">
            · {appointment.clientName}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-sm text-zinc-600">{appointment.service}</span>
          <ReminderStatusPill status={appointment.reminderStatus} />
        </div>
      </div>

      {onSendReminder && (
        <button
          type="button"
          onClick={() => onSendReminder(appointment)}
          className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition ${
            isSent
              ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          <Send className="h-3.5 w-3.5" aria-hidden />
          {isSent ? 'Reenviar' : 'Enviar recordatorio'}
        </button>
      )}
    </article>
  );
}
