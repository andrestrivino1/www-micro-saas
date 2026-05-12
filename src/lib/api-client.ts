import { loadSession, type AuthSession } from './auth';
import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentUpdateInput,
  ClientCreateInput,
  ClientDetail,
  ClientUpdateInput,
  ClientWithPet,
  LoginResponse,
  NotificationDto,
  SendWhatsappLinkInput,
  WhatsappReminderResult,
} from './types';

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get code(): string | undefined {
    const d = this.details as { code?: string } | undefined;
    return d?.code;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | undefined>;
  auth?: boolean | AuthSession;
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
      // ignore parse errors
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

  loginCredentials: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { mode: 'credentials', email, password },
      auth: false,
    }),

  listAppointments: (params?: { date?: string; from?: string; to?: string }) =>
    request<Appointment[]>('/appointments', { query: params }),

  getAppointment: (id: string) => request<Appointment>(`/appointments/${id}`),

  createAppointment: (input: AppointmentCreateInput) =>
    request<Appointment>('/appointments', { method: 'POST', body: input }),

  updateAppointment: (id: string, input: AppointmentUpdateInput) =>
    request<Appointment>(`/appointments/${id}`, { method: 'PATCH', body: input }),

  deleteAppointment: (id: string) =>
    request<void>(`/appointments/${id}`, { method: 'DELETE' }),

  /** @deprecated desde spec 002 — usar `sendWhatsappLink`. */
  sendReminder: (appointmentId: string) =>
    request<NotificationDto>('/notifications/reminder', {
      method: 'POST',
      body: { appointmentId },
    }),

  sendWhatsappLink: (input: SendWhatsappLinkInput) =>
    request<WhatsappReminderResult>('/notifications/whatsapp-link', {
      method: 'POST',
      body: input,
    }),

  listClients: () => request<ClientWithPet[]>('/clients'),

  getClient: (id: string) => request<ClientDetail>(`/clients/${id}`),

  createClient: (input: ClientCreateInput) =>
    request<ClientWithPet>('/clients', { method: 'POST', body: input }),

  updateClient: (id: string, input: ClientUpdateInput) =>
    request<ClientWithPet>(`/clients/${id}`, { method: 'PATCH', body: input }),

  deleteClient: (id: string) =>
    request<void>(`/clients/${id}`, { method: 'DELETE' }),
};
