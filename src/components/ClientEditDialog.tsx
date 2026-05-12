'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import type { ClientDetail } from '@/lib/types';

interface Props {
  client: ClientDetail | null;
  onClose: () => void;
}

export function ClientEditDialog({ client, onClose }: Props) {
  if (!client) return null;
  return <ClientEditDialogContent client={client} onClose={onClose} />;
}

function ClientEditDialogContent({
  client,
  onClose,
}: {
  client: ClientDetail;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [notes, setNotes] = useState(client.notes ?? '');
  const [petName, setPetName] = useState(client.pet.name);
  const [petBreed, setPetBreed] = useState(client.pet.breed ?? '');
  const [petNotes, setPetNotes] = useState(client.pet.notes ?? '');

  const mutation = useMutation({
    mutationFn: () => {
      return api.updateClient(client.id, {
        name: name.trim(),
        phone: phone.trim(),
        notes: notes.trim() || null,
        pet: {
          name: petName.trim(),
          breed: petBreed.trim() || null,
          notes: petNotes.trim() || null,
        },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
      void queryClient.invalidateQueries({ queryKey: ['clients', client.id] });
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
  });

  const canSubmit =
    name.trim().length >= 1 &&
    phone.trim().length >= 6 &&
    petName.trim().length >= 1;

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
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-semibold">Editar cliente</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Dueño
            </legend>
            <div>
              <label className="block text-xs text-zinc-600">Nombre</label>
              <input
                type="text"
                required
                minLength={1}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                required
                minLength={6}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Mascota
            </legend>
            <div>
              <label className="block text-xs text-zinc-600">Nombre</label>
              <input
                type="text"
                required
                minLength={1}
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600">
                Raza (opcional)
              </label>
              <input
                type="text"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={petNotes}
                onChange={(e) => setPetNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </fieldset>

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
