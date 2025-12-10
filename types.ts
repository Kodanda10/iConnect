
export interface Constituent {
  id: string;
  name: string;
  mobile_number: string;
  dob: string; // YYYY-MM-DD
  anniversary?: string; // YYYY-MM-DD
  block?: string;
  gp_ulb?: string; // Gram Panchayat or ULB
  ward_number: string;
  address: string;
  created_at: string;
}

export type TaskType = 'BIRTHDAY' | 'ANNIVERSARY';
export type TaskStatus = 'PENDING' | 'COMPLETED';

export interface Task {
  id: string;
  constituent_id: string;
  type: TaskType;
  due_date: string;
  status: TaskStatus;
  notes?: string;
  generated_message?: string; // AI generated draft
  created_at: string;
  completed_by?: string;
  action_taken?: 'CALL' | 'SMS' | 'WHATSAPP';
}

// For the UI to display combined data
export interface EnrichedTask extends Task {
  constituent: Constituent;
}

export interface Festival {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  description?: string;
  isCustom?: boolean;
}
