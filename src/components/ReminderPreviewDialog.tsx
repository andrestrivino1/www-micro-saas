'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Check,
  Copy,
  Loader2,
  MessageCircle,
  RotateCcw,
  X,
} from 'lucide-react';
import type {
  Appointment,
  SendWhatsappLinkInput,
  WhatsappReminderResult,
} from '@/lib/types';
import { api, ApiError } from '@/lib/api-client';

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
}

export function ReminderPreviewDialog({ appointment, onClose }: Props) {
  if (!appointment) return null;
  return (
    <ReminderPreviewDialogContent
      appointment={appointment}
      onClose={onClose}
    />
  );
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

function ReminderPreviewDialogContent({
  appointment,
  onClose,
}: {
  appointment: Appointment;
  onClose: () => void;
}) {
  const defaultPreview = useMemo(
    () => composePreview(appointment),
    [appointment],
  );

  const [confirmRetry, setConfirmRetry] = useState(false);
  const [messageText, setMessageText] = useState(defaultPreview);
  const [sent, setSent] = useState<WhatsappReminderResult | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'link' | 'message'>(
    'idle',
  );
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: SendWhatsappLinkInput) => api.sendWhatsappLink(input),
    onSuccess: (data) => {
      setSent(data);
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });

      // Sólo abrir WhatsApp Web cuando el backend devuelve el deep-link (modo
      // demo o fallback). En modo 'sent' el mensaje ya salió vía Cloud API.
      if (data.mode === 'link' && data.whatsappUrl) {
        const win = window.open(
          data.whatsappUrl,
          '_blank',
          'noopener,noreferrer',
        );
        if (!win) {
          setPopupBlocked(true);
        }
      }
    },
  });

  const alreadySent = appointment.reminderStatus === 'sent';
  const needsRetryConfirm = alreadySent && !confirmRetry && !sent;
  const messageEdited = messageText.trim() !== defaultPreview.trim();

  const handleSend = () => {
    const trimmed = messageText.trim();
    mutation.mutate({
      appointmentId: appointment.id,
      customMessage:
        trimmed && trimmed !== defaultPreview.trim() ? trimmed : undefined,
    });
  };

  const copyToClipboard = async (text: string, kind: 'link' | 'message') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(kind);
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.code === 'CLIENT_HAS_NO_PHONE'
        ? 'El cliente no tiene teléfono registrado. Edítalo para agregarlo.'
        : mutation.error.code === 'INVALID_PHONE'
          ? 'El teléfono del cliente no es válido. Edítalo para corregirlo.'
          : mutation.error.message
      : 'No se pudo preparar el recordatorio.';

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
            Mensaje para{' '}
            <span className="font-medium text-zinc-900">
              {appointment.petName}
            </span>{' '}
            ({appointment.clientName}):
          </p>

          <div className="mt-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-emerald-800">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                WhatsApp
              </span>
              {messageEdited && !sent && (
                <button
                  type="button"
                  onClick={() => setMessageText(defaultPreview)}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-emerald-700 hover:bg-emerald-100"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden />
                  Restaurar
                </button>
              )}
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border-0 bg-white px-3 py-2 text-sm text-zinc-900 ring-1 ring-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={mutation.isPending || sent !== null}
              maxLength={1000}
            />
          </div>

          {sent ? (
            sent.mode === 'sent' ? (
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
                <span>
                  Mensaje enviado automáticamente vía WhatsApp Business. El
                  cliente lo recibirá en su WhatsApp en segundos. No necesitas
                  hacer nada más.
                </span>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
                  <span>
                    {popupBlocked
                      ? 'Mensaje listo. Tu navegador bloqueó el popup — usa los botones de abajo.'
                      : 'WhatsApp abierto. Pulsa Enviar dentro de WhatsApp para que llegue el mensaje al cliente.'}
                  </span>
                </div>

                {sent.whatsappUrl && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(sent.whatsappUrl!, 'link')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      {copyStatus === 'link' ? 'Copiado' : 'Copiar enlace'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(sent.messageText, 'message')
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      {copyStatus === 'message' ? 'Copiado' : 'Copiar mensaje'}
                    </button>
                  </div>
                )}

                {popupBlocked && sent.whatsappUrl && (
                  <a
                    href={sent.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-full bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Abrir WhatsApp manualmente
                  </a>
                )}
              </div>
            )
          ) : needsRetryConfirm ? (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
              <span>
                Esta cita ya tenía un recordatorio enviado. ¿Quieres reenviar?
              </span>
            </div>
          ) : null}

          {mutation.isError && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4">
          {sent ? (
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
                  onClick={handleSend}
                  disabled={mutation.isPending || messageText.trim().length === 0}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {mutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  )}
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  Enviar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
