// Profile Update Types - Context7 Pattern
export interface UpdateProfileData {
  name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  timezone?: string;
  language?: string;
  company?: string;
  jobTitle?: string;
  avatar?: string;
}

// Password Update Types - Context7 Pattern
export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    bio: string | null;
    phone: string | null;
    location: string | null;
    website: string | null;
    timezone: string | null;
    language: string | null;
    company: string | null;
    jobTitle: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}