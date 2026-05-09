'use client';

import './calendar.css';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type View,
  type SlotInfo,
} from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import type { Appointment } from '@/lib/types';
import { AppShell } from '@/components/AppShell';
import { AppointmentDetailDialog } from '@/components/AppointmentDetailDialog';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es }),
  getDay,
  locales,
});

const messages = {
  date: 'Fecha',
  time: 'Hora',
  event: 'Cita',
  allDay: 'Todo el día',
  week: 'Semana',
  work_week: 'Semana laboral',
  day: 'Día',
  month: 'Mes',
  previous: 'Anterior',
  next: 'Siguiente',
  yesterday: 'Ayer',
  tomorrow: 'Mañana',
  today: 'Hoy',
  agenda: 'Agenda',
  noEventsInRange: 'No hay citas en este rango.',
  showMore: (n: number) => `+${n} más`,
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

function toYmd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function rangeForView(date: Date, view: View): { from: string; to: string } {
  if (view === 'month') {
    // Approximate month-view window: 7 days before the 1st through 14 days after.
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const from = new Date(first);
    from.setDate(from.getDate() - 7);
    const to = new Date(last);
    to.setDate(to.getDate() + 14);
    return { from: toYmd(from), to: toYmd(to) };
  }
  if (view === 'week') {
    const start = startOfWeek(date, { locale: es });
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { from: toYmd(start), to: toYmd(end) };
  }
  // day or agenda
  return { from: toYmd(date), to: toYmd(date) };
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const range = useMemo(() => rangeForView(currentDate, view), [currentDate, view]);

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', 'range', range.from, range.to],
    queryFn: () => api.listAppointments({ from: range.from, to: range.to }),
  });

  const events = useMemo<CalendarEvent[]>(() => {
    if (!data) return [];
    return data.map((a) => {
      const start = new Date(a.scheduledAt);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1h por defecto
      return {
        id: a.id,
        title: `${a.petName} · ${a.service}`,
        start,
        end,
        resource: a,
      };
    });
  }, [data]);

  function handleSelectSlot(slot: SlotInfo) {
    const date = toYmd(slot.start);
    const hour = String(slot.start.getHours()).padStart(2, '0');
    const minute = String(slot.start.getMinutes()).padStart(2, '0');
    router.push(`/appointments/new?date=${date}&hour=${hour}:${minute}`);
  }

  return (
    <AppShell>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Calendario
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Vista mensual de citas. Toca un día vacío para crear o una cita para enviar el recordatorio.
          </p>
        </div>
        <Link
          href="/appointments/new"
          className="inline-flex h-10 w-fit items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nueva cita
        </Link>
      </header>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Cargando agenda…
        </div>
      )}

      <div className="h-[70vh] min-h-[480px] sm:h-[720px]">
        <Calendar
          culture="es"
          localizer={localizer}
          messages={messages}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          selectable
          popup
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(e) => setSelected((e as CalendarEvent).resource)}
          eventPropGetter={(event) => {
            const e = event as CalendarEvent;
            const status = e.resource.reminderStatus;
            return {
              className: status === 'sent' ? 'event-sent' : 'event-not-sent',
            };
          }}
          formats={{
            monthHeaderFormat: (date) =>
              format(date, 'LLLL yyyy', { locale: es }),
            dayHeaderFormat: (date) =>
              format(date, "EEEE d 'de' LLLL", { locale: es }),
            dayRangeHeaderFormat: ({ start, end }) =>
              `${format(start, 'd LLL', { locale: es })} – ${format(end, 'd LLL', { locale: es })}`,
            agendaDateFormat: (date) =>
              format(date, "EEE d 'de' LLL", { locale: es }),
          }}
        />
      </div>

      <AppointmentDetailDialog
        appointment={selected}
        onClose={() => setSelected(null)}
      />
    </AppShell>
  );
}
