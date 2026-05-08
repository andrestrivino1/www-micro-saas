// Tipos derivados del contrato en
// api-micro-saas/specs/001-grooming-saas-mvp/contracts/openapi.yaml

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  tenantId: string;
  userId: string;
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

export interface NotificationDto {
  id: string;
  appointmentId: string;
  clientId: string;
  channel: 'whatsapp_simulated';
  messageText: string;
  sentAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
