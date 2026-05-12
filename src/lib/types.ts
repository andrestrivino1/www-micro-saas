// Tipos derivados del contrato en
// api-micro-saas/specs/002-whatsapp-notifications/contracts/openapi.yaml (v0.2.0)

export type UserRole = 'demo' | 'owner';

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  tenantId: string;
  userId: string;
  role: UserRole;
}

export interface Pet {
  id: string;
  name: string;
  breed: string | null;
  notes: string | null;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
  createdAt: string;
}

export interface ClientWithPet extends Client {
  pet: Pet;
}

export interface AppointmentSummary {
  id: string;
  scheduledAt: string;
  service: string;
  reminderStatus: 'not_sent' | 'sent';
}

export interface ClientDetail extends ClientWithPet {
  appointments: AppointmentSummary[];
}

export interface ClientCreateInput {
  name: string;
  phone: string;
  notes?: string;
  pet: {
    name: string;
    breed?: string;
    notes?: string;
  };
}

export interface ClientUpdateInput {
  name?: string;
  phone?: string;
  notes?: string | null;
  pet?: {
    name?: string;
    breed?: string | null;
    notes?: string | null;
  };
}

export interface Appointment {
  id: string;
  clientId: string;
  petId: string;
  clientName: string;
  petName: string;
  scheduledAt: string;
  service: string;
  reminderStatus: 'not_sent' | 'sent';
  reminderSentAt: string | null;
  createdAt: string;
}

export interface AppointmentCreateInput {
  clientId: string;
  petId: string;
  scheduledAt: string;
  service: string;
}

export interface AppointmentUpdateInput {
  clientId?: string;
  petId?: string;
  scheduledAt?: string;
  service?: string;
}

export type NotificationChannel =
  | 'whatsapp_simulated'
  | 'whatsapp_link'
  | 'whatsapp_cloud';

export interface NotificationDto {
  id: string;
  appointmentId: string;
  clientId: string;
  channel: NotificationChannel;
  messageText: string;
  sentAt: string;
}

/**
 * Respuesta del endpoint `POST /notifications/whatsapp-link`. El backend
 * decide la ruta según el tipo de tenant:
 * - `mode: 'sent'` → mensaje enviado real vía Cloud API. El cliente lo
 *   recibirá automáticamente. Incluye `externalMessageId` de Meta.
 * - `mode: 'link'` → fallback wa.me deep-link. Frontend abre `whatsappUrl`.
 */
export interface WhatsappReminderResult extends NotificationDto {
  mode: 'sent' | 'link';
  whatsappUrl?: string;
  externalMessageId?: string;
}

/** @deprecated usar WhatsappReminderResult (mode: 'link'). */
export interface WhatsappLinkNotification extends NotificationDto {
  channel: 'whatsapp_link';
  whatsappUrl: string;
}

export interface SendWhatsappLinkInput {
  appointmentId: string;
  customMessage?: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  code?: 'INVALID_PHONE' | 'CLIENT_HAS_NO_PHONE' | string;
}
