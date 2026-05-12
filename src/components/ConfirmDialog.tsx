'use client';

import { AlertTriangle, Loader2, X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            {destructive && (
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
            )}
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="px-5 py-5 text-sm text-zinc-700">{message}</div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
              destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {loading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
