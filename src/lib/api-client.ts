import { loadSession, type AuthSession } from './auth';
import type {
  Appointment,
  AppointmentCreateInput,
  ClientCreateInput,
  ClientDetail,
  ClientWithPet,
  LoginResponse,
  NotificationDto,
} from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | undefined>;
  auth?: boolean | AuthSession; // default: true (uses loadSession)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true } = options;

  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth !== false) {
    const session = typeof auth === 'object' ? auth : loadSession();
    if (session) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let payload: unknown = undefined;
    try {
      payload = await res.json();
    } catch {
      // ignore parse errors; payload stays undefined
    }
    const message =
      (payload as { message?: string | string[] } | undefined)?.message ??
      `HTTP ${res.status}`;
    const flat = Array.isArray(message) ? message.join(', ') : String(message);
    throw new ApiError(res.status, flat, payload);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  loginDemo: () =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { mode: 'demo' },
      auth: false,
    }),

  listAppointments: (params?: { date?: string; from?: string; to?: string }) =>
    request<Appointment[]>('/appointments', { query: params }),

  createAppointment: (input: AppointmentCreateInput) =>
    request<Appointment>('/appointments', { method: 'POST', body: input }),

  sendReminder: (appointmentId: string) =>
    request<NotificationDto>('/notifications/reminder', {
      method: 'POST',
      body: { appointmentId },
    }),

  listClients: () => request<ClientWithPet[]>('/clients'),

  getClient: (id: string) => request<ClientDetail>(`/clients/${id}`),

  createClient: (input: ClientCreateInput) =>
    request<ClientWithPet>('/clients', { method: 'POST', body: input }),
};
