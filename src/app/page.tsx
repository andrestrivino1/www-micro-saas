'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, LogIn, PawPrint } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { saveSession } from '@/lib/auth';

export default function LandingPage() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const [showCredentials, setShowCredentials] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [credLoading, setCredLoading] = useState(false);
  const [credError, setCredError] = useState<string | null>(null);

  function persistSession(res: {
    accessToken: string;
    tenantId: string;
    userId: string;
    expiresIn: number;
  }) {
    saveSession({
      accessToken: res.accessToken,
      tenantId: res.tenantId,
      userId: res.userId,
      expiresAt: Date.now() + res.expiresIn * 1000,
    });
    router.push('/dashboard');
  }

  async function startDemo() {
    setDemoLoading(true);
    setDemoError(null);
    try {
      const res = await api.loginDemo();
      persistSession(res);
    } catch (e) {
      setDemoError(
        e instanceof Error
          ? `No se pudo iniciar la demo: ${e.message}`
          : 'No se pudo iniciar la demo.',
      );
      setDemoLoading(false);
    }
  }

  async function loginWithCredentials(e: React.FormEvent) {
    e.preventDefault();
    setCredLoading(true);
    setCredError(null);
    try {
      const res = await api.loginCredentials(email.trim(), password);
      persistSession(res);
    } catch (err) {
      setCredError(
        err instanceof ApiError && err.status === 401
          ? 'Email o contraseña incorrectos.'
          : err instanceof Error
            ? `No se pudo iniciar sesión: ${err.message}`
            : 'No se pudo iniciar sesión.',
      );
      setCredLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
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
          disabled={demoLoading}
          className="mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 text-base font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {demoLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Cargando demo…
            </>
          ) : (
            'Probar demo'
          )}
        </button>

        {demoError && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {demoError}
          </p>
        )}

        <p className="mt-6 text-sm text-zinc-500">
          Datos ficticios. Ninguna información se envía a clientes reales.
        </p>

        <div className="mt-10 border-t border-zinc-200 pt-6">
          {showCredentials ? (
            <form
              onSubmit={loginWithCredentials}
              className="mx-auto max-w-sm space-y-3 text-left"
            >
              <h2 className="text-center text-sm font-medium text-zinc-700">
                Iniciar sesión con cuenta
              </h2>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-zinc-600"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-zinc-600"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              {credError && (
                <p className="text-sm text-red-600" role="alert">
                  {credError}
                </p>
              )}
              <button
                type="submit"
                disabled={credLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {credLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <LogIn className="h-4 w-4" aria-hidden />
                )}
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCredentials(false);
                  setCredError(null);
                }}
                className="block w-full text-xs text-zinc-500 hover:text-zinc-700"
              >
                Volver
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowCredentials(true)}
              className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-700 hover:underline"
            >
              ¿Ya tienes cuenta? Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
