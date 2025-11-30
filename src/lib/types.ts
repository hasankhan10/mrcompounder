// ================================================================= //
// DATABASE & CORE TYPES
// These types mirror the structure of your Supabase tables.
// ================================================================= //

export type UserRole = 'super_admin' | 'compounder';
export type QueueStatus = 'active' | 'paused' | 'ended' | 'waiting';
export type TokenStatus = 'waiting' | 'called' | 'served' | 'no_show';
export type TransactionType = 'topup' | 'usage';

export interface Clinic {
  id: string; // uuid
  created_at: string; // timestamp
  name: string;
  slug: string;
  logo_url?: string;
  prepaid_balance: number;
  is_active: boolean;
  trial_start_date?: string; // timestamp
  trial_end_date?: string; // timestamp
  settings?: any; // jsonb
  served_today_count?: number;
}

export interface Profile {
  id: string; // uuid, references auth.users(id)
  clinic_id?: string; // uuid, references clinics(id)
  role: UserRole;
  full_name?: string;
}

export interface Queue {
  id: string; // uuid
  created_at: string; // timestamp
  clinic_id: string; // uuid
  doctor_name?: string;
  doctor_image_url?: string;
  session_date: string; // date
  status: QueueStatus;
  ended_at?: string; // timestamp
}

export interface Token {
  id: string; // uuid
  created_at: string; // timestamp
  clinic_id: string; // uuid
  queue_id: string; // uuid
  phone: string;
  patient_name?: string;
  token_number: number; // serial
  status: TokenStatus;
  called_at?: string; // timestamp
  served_at?: string; // timestamp
  is_booked_online?: boolean;
}

export interface Transaction {
  id: string; // uuid
  created_at: string; // timestamp
  clinic_id: string; // uuid
  token_id?: string; // uuid
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  metadata?: any; // jsonb
}

export interface NotificationSubscription {
  id: string; // uuid
  created_at: string; // timestamp
  clinic_id: string; // uuid
  token_id: string; // uuid
  fcm_token: string;
}


// ================================================================= //
// API CONTRACT TYPES
// These types define the request and response shapes for API routes.
// ================================================================= //

// --- Super Admin API ---

export interface CreateClinicRequest {
  name: string;
  slug: string;
  initialBalance: number;
  compounderEmail: string;
  compounderPassword: string;
  logoUrl?: string;
}

export interface CreateClinicResponse {
  clinicId: string;
  userId: string;
  message: string;
}

export interface ClinicSummary extends Clinic {
  todaysPatientCount: number;
}
export type ListClinicsResponse = ClinicSummary[];

export interface UpdateClinicRequest {
  topupAmount?: number;
  isActive?: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  name?: string;
  slug?: string;
  logoUrl?: string;
  password?: string;
}
export type UpdateClinicResponse = Clinic;


// --- Compounder Dashboard API ---

export interface StartSessionRequest {
  doctorName: string;
  doctorImageUrl?: string;
}
export type StartSessionResponse = Queue;

export interface EndSessionRequest {
  sessionId: string;
}
export interface EndSessionResponse {
  message: 'Session ended successfully';
  endedAt: string;
}

export interface ToggleBreakRequest {
  sessionId: string;
  newStatus: 'paused' | 'active';
}
export type ToggleBreakResponse = Queue;

export interface RegisterTokenRequest {
  queueId: string;
  phone: string;
  patientName?: string;
}
export type RegisterTokenResponse = Token;

export interface CallNextRequest {
  queueId: string;
  currentCalledTokenId?: string;
}
export interface CallNextResponse {
  servedToken?: Token;
  calledToken?: Token;
  message?: 'Queue is empty' | 'End of queue';
}


// --- Public Patient API ---

export interface PatientJoinRequest {
  clinicId: string;
  phone: string;
  patientName?: string;
}
export interface PatientJoinResponse {
  token: Token;
  queue: Queue;
}


// --- Notification API ---

export interface RegisterFcmTokenRequest {
  tokenId: string;
  fcmToken: string;
}
export interface RegisterFcmTokenResponse {
  success: boolean;
}
