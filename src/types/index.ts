export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  business_id?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  contact_phone?: string;
  contact_email?: string;
  twilio_phone_number?: string;
  retention_months_new: number;
  retention_months_returning: number;
  retention_days_after_booking: number;
  sms_send_time_type: 'fixed' | 'random';
  sms_send_time?: string;
  sms_send_time_start?: string;
  sms_send_time_end?: string;
  bokadirekt_webhook_secret?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessLocation {
  id: string;
  business_id: string;
  location_id: string;
  location_name?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone_number: string;
  business_id: string;
  workflow_id?: string;
  last_visit?: string;
  last_contacted?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  business_id: string;
  name: string;
  inactive_months: number;
  positive_threshold: number;
  google_review_link: string;
  internal_feedback_link: string;
  sms_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledSms {
  id: string;
  business_id: string;
  customer_id: string;
  message: string;
  scheduled_at: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  customers?: {
    name: string;
    phone_number: string;
  };
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  type: string;
  content?: string;
  sentiment_score?: number;
  sentiment_label?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface DashboardOverview {
  business?: Business;
  total_customers: number;
  new_this_month: number;
  active_customers: number;
  scheduled_sms: number;
  total_businesses?: number;
  recent_businesses?: Business[];
  message?: string;
}

export interface RetentionStats {
  month: string;
  new_customers: number;
  returning_visits: number;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
  role?: 'admin' | 'user';
}

export interface CreateBusinessForm {
  name: string;
  slug: string;
  contact_phone?: string;
  contact_email?: string;
  retention_months_new?: number;
  retention_months_returning?: number;
  retention_days_after_booking?: number;
}

export interface CreateWorkflowForm {
  business_id: string;
  name: string;
  inactive_months: number;
  positive_threshold: number;
  google_review_link: string;
  internal_feedback_link: string;
  sms_template: string;
  is_active?: boolean;
}

export interface CreateCustomerForm {
  name: string;
  phone_number: string;
  business_id: string;
  workflow_id?: string;
  metadata?: Record<string, any>;
}
