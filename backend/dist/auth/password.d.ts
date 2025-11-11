export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hashedPassword: string): Promise<boolean>;
export declare function validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
};
//# sourceMappingURL=password.d.ts.map