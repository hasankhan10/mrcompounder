// ================================================================= //
// DATABASE & CORE TYPES
// These types mirror the structure of your Supabase tables.
// ================================================================= //

export type UserRole = 'super_admin' | 'compounder';
export type QueueStatus = 'active' | 'paused' | 'ended' | 'waiting' | 'cancelled';
export type TokenStatus = 'waiting' | 'called' | 'served' | 'no_show';
export type TransactionType = 'topup' | 'usage';

export interface ClinicSettings {
  upi_id?: string;
  qr_code_url?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface TransactionMetadata {
  [key: string]: string | number | boolean | undefined;
}

export interface Clinic {
  id: string; // uuid
  created_at: string; // timestamp
  name: string;
  slug: string;
  location?: string; // Added field
  contact_number?: string; // Added field
  logo_url?: string;
  current_due: number;
  is_active: boolean;
  trial_start_date?: string; // timestamp
  trial_end_date?: string; // timestamp
  settings?: ClinicSettings; // jsonb
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
  doctor_arrival_time?: string; // Added field
  session_date: string; // date
  status: QueueStatus;
  ended_at?: string; // timestamp
  served_count?: number; // Added field for history
}

export interface Token {
  id: string; // uuid
  created_at: string; // timestamp
  clinic_id: string; // uuid
  queue_id: string; // uuid
  phone: string;
  patient_name?: string;
  purpose?: string; // Added purpose field
  token_number: number; // serial
  status: TokenStatus;
  called_at?: string; // timestamp
  served_at?: string; // timestamp
  is_booked_online?: boolean;
  is_present?: boolean;
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
  metadata?: TransactionMetadata; // jsonb
}

export interface NotificationSubscription {
  id: string; // uuid
  created_at: string; // timestamp
  clinic_id: string; // uuid
  token_id: string; // uuid
  fcm_token: string;
}

export interface PaymentRequest {
  id: string;
  created_at: string;
  clinic_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  screenshot_url: string;
  transaction_id?: string;
  clinics?: {
    name: string;
  };
}


// ================================================================= //
// API CONTRACT TYPES
// These types define the request and response shapes for API routes.
// ================================================================= //

// --- Super Admin API ---

export interface CreateClinicRequest {
  name: string;
  slug: string;
  location?: string; // Added field
  contactNumber?: string; // Added field
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
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  name?: string;
  slug?: string;
  location?: string; // Added field
  contactNumber?: string; // Added field
  logoUrl?: string;
  password?: string;
}
export type UpdateClinicResponse = Clinic;


// --- Compounder Dashboard API ---

export interface StartSessionRequest {
  doctorName: string;
  doctorImageUrl?: string;
  doctorArrivalTime?: string; // Added field
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

export interface CancelSessionRequest {
  sessionId: string;
}
export interface CancelSessionResponse {
  message: 'Session cancelled successfully';
  cancelledAt: string;
}

export interface RegisterTokenRequest {
  queueId: string;
  phone: string;
  patientName?: string;
  purpose?: string; // Added purpose field
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

export interface AdminStats {
  totalClinics: number;
  totalPatientsToday: number;
  totalRevenue: number;
  lastMonthRevenue: number;
}

export interface RecentDoctor {
  doctor_name: string;
  doctor_image_url: string;
}

export interface BookingData {
  token: Token;
  queue: Queue;
  currentToken: Token | null;
  lastServedTokenNumber: number;
  lastServedTokens: Token[];
}
