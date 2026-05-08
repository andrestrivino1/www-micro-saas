import { Check, Clock } from 'lucide-react';

export function ReminderStatusPill({
  status,
}: {
  status: 'not_sent' | 'sent';
}) {
  if (status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
        <Check className="h-3 w-3" aria-hidden />
        Recordatorio enviado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
      <Clock className="h-3 w-3" aria-hidden />
      Sin enviar
    </span>
  );
}
