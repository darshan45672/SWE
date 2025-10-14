import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password strength validation
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
} {
  const errors: string[] = [];
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasMinLength) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!hasNumber) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
  };
}

// Format error messages
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}
