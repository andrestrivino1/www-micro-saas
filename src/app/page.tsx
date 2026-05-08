'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api-client';
import { saveSession } from '@/lib/auth';
import { Loader2, PawPrint } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startDemo() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.loginDemo();
      saveSession({
        accessToken: res.accessToken,
        tenantId: res.tenantId,
        userId: res.userId,
        expiresAt: Date.now() + res.expiresIn * 1000,
      });
      router.push('/dashboard');
    } catch (e) {
      setError(
        e instanceof Error
          ? `No se pudo iniciar la demo: ${e.message}`
          : 'No se pudo iniciar la demo.',
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <PawPrint className="h-7 w-7" aria-hidden />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Tu peluquería canina, organizada.
        </h1>
        <p className="mt-4 text-lg leading-7 text-zinc-600">
          Agenda, clientes y recordatorios por WhatsApp en un solo lugar.
          Pruébalo en vivo en menos de 2 minutos, sin registro.
        </p>

        <button
          type="button"
          onClick={startDemo}
          disabled={loading}
          className="mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 text-base font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Cargando demo…
            </>
          ) : (
            'Probar demo'
          )}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <p className="mt-6 text-sm text-zinc-500">
          Datos ficticios. Ninguna información se envía a clientes reales.
        </p>
      </div>
    </main>
  );
}
