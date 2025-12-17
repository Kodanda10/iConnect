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
    // Name fields
    name?: string;
    fullName?: string; // full_name -> fullName
    firstName?: string; // first_name -> firstName
    lastName?: string; // last_name -> lastName
    // Contact
    mobileNumber?: string; // mobile_number -> mobileNumber
    phone?: string;
    whatsapp?: string;
    // Birthday
    dob?: string; // YYYY-MM-DD
    dobMonth?: number; // dob_month -> dobMonth
    dobDay?: number; // dob_day -> dobDay
    birthday?: Date | { seconds: number; nanoseconds: number }; // Firestore Timestamp
    birthdayMmdd?: string; // birthday_mmdd -> birthdayMmdd // MM-DD format
    // Anniversary
    anniversary?: string | Date | { seconds: number; nanoseconds: number }; // YYYY-MM-DD or Timestamp
    anniversaryMonth?: number; // anniversary_month -> anniversaryMonth
    anniversaryDay?: number; // anniversary_day -> anniversaryDay
    anniversaryMmdd?: string; // anniversary_mmdd -> anniversaryMmdd // MM-DD format
    // Location
    block?: string;
    gpUlb?: string; // gp_ulb -> gpUlb // Gram Panchayat or ULB
    wardNumber?: string; // ward_number -> wardNumber
    ward?: string;
    village?: string;
    address?: string;
    // Metadata
    tags?: string[];
    createdAt?: string | Date | { seconds: number; nanoseconds: number }; // created_at -> createdAt
    updatedAt?: string | Date | { seconds: number; nanoseconds: number }; // updated_at -> updatedAt
}

// Task types
export type TaskType = 'BIRTHDAY' | 'ANNIVERSARY';
export type TaskStatus = 'PENDING' | 'COMPLETED';
export type ActionType = 'CALL' | 'SMS' | 'WHATSAPP';
export type CompletedBy = 'LEADER' | 'STAFF';

export interface Task {
    id: string;
    constituentId: string; // constituent_id -> constituentId
    type: TaskType;
    dueDate: string; // due_date -> dueDate
    status: TaskStatus;
    notes?: string;
    generatedMessage?: string; // generated_message -> generatedMessage
    createdAt: string; // created_at -> createdAt
    completedBy?: CompletedBy; // completed_by -> completedBy
    actionTaken?: ActionType; // action_taken -> actionTaken
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
    ward?: string;
}

// Campaign data
export interface Campaign {
    id: string;
    festivalName: string;
    audience: 'ALL' | 'WARD' | 'CUSTOM';
    message: string;
    language: Language;
    scheduledFor: string;
    status: 'SCHEDULED' | 'SENT' | 'CANCELLED';
    recipientCount: number;
    createdAt: string;
}
