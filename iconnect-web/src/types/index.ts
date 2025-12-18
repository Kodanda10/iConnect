/**
 * @file types/index.ts
 * @description Shared TypeScript types for iConnect CRM
 * @changelog
 * - 2024-12-11: Ported from prototype types.ts
 */

// User roles
export type UserRole = 'STAFF' | 'LEADER';

export interface User {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
}

// Constituent (Citizen) data
export interface Constituent {
    id: string;
    name?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    // Contact
    mobile_number?: string;
    phone?: string;
    whatsapp?: string;
    // Birthday
    dob?: string; // YYYY-MM-DD
    dob_month?: number;
    dob_day?: number;
    birthday?: Date | { seconds: number; nanoseconds: number }; // Firestore Timestamp
    birthday_mmdd?: string;
    // Anniversary
    anniversary?: string | Date | { seconds: number; nanoseconds: number };
    anniversary_month?: number;
    anniversary_day?: number;
    anniversary_mmdd?: string;
    // Location
    block?: string;
    gp_ulb?: string;
    ward_number?: string;
    ward?: string;
    village?: string;
    address?: string;
    // Metadata
    tags?: string[];
    created_at?: string | Date | { seconds: number; nanoseconds: number };
    updated_at?: string | Date | { seconds: number; nanoseconds: number };
}

// Task types
export type TaskType = 'BIRTHDAY' | 'ANNIVERSARY';
export type TaskStatus = 'PENDING' | 'COMPLETED';
export type ActionType = 'CALL' | 'SMS' | 'WHATSAPP';
export type CompletedBy = 'LEADER' | 'STAFF';

export interface Task {
    id: string;
    uid?: string;
    constituent_id: string;
    type: TaskType;
    due_date: Date | { seconds: number; nanoseconds: number }; // Strictly Timestamp/Date
    status: TaskStatus;
    notes?: string;
    generated_message?: string;
    created_at: Date | { seconds: number; nanoseconds: number };
    completed_by?: CompletedBy;
    action_taken?: ActionType;
    updated_at?: Date | { seconds: number; nanoseconds: number };
    // Denormalized fields
    constituent_name?: string;
    constituent_mobile?: string;
    ward_number?: string;
    // Helper fields
    call_sent?: boolean;
    sms_sent?: boolean;
    whatsapp_sent?: boolean;
}

// Enriched task with constituent data joined
export interface EnrichedTask extends Task {
    constituent: Constituent;
}

// Festival / Event
export interface Festival {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    description?: string;
    aiPromptContext?: string;
    isCustom?: boolean;
}

// App Settings (singleton)
export interface AppSettings {
    appName: string;
    leaderName: string;
    headerImageUrl?: string;
    profilePictureUrl?: string;
    alertSettings: {
        headsUp: boolean;
        action: boolean;
        headsUpMessage?: string;
        includeNamesHeadsUp?: boolean;
        actionMessage?: string;
        includeNamesAction?: boolean;
    };
}

// Language options
export type Language = 'ODIA' | 'ENGLISH' | 'HINDI';

// Greeting Request for AI
export interface GreetingRequest {
    name: string;
    type: TaskType;
    language: Language;
    ward_number?: string;
    ward?: string;
}

// Campaign data
export interface Campaign {
    id: string;
    festivalName: string;
    audience: 'ALL' | 'WARD' | 'CUSTOM';
    message: string;
    language: Language;
    scheduled_for: string;
    status: 'SCHEDULED' | 'SENT' | 'CANCELLED';
    recipient_count: number;
    created_at: string;
}
