import { UpdateProfileData, ProfileResponse, DeleteAccountResponse, ForgotPasswordResponse, ResetPasswordResponse } from '../types/profile';
export interface RegisterData {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    location?: string;
    website?: string;
    company?: string;
    jobTitle?: string;
    timezone?: string;
    language?: string;
    acceptTerms: boolean;
}
export interface LoginData {
    email: string;
    password: string;
}
export interface AuthResponse {
    success: boolean;
    user?: any;
    token?: string;
    message: string;
    requires2FA?: boolean;
    userId?: string;
    requiresVerification?: boolean;
    email?: string;
}
export declare class AuthService {
    static register(data: RegisterData): Promise<AuthResponse>;
    static login(data: LoginData): Promise<AuthResponse>;
    static getUserProfile(userId: string): Promise<any | null>;
    static updateUserProfile(userId: string, updateData: UpdateProfileData): Promise<ProfileResponse>;
    static deleteUser(userId: string, password: string): Promise<DeleteAccountResponse>;
    static updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static forgotPassword(email: string): Promise<ForgotPasswordResponse>;
    static resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse>;
}
//# sourceMappingURL=auth.d.ts.map