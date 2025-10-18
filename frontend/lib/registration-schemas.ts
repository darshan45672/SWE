import * as z from "zod";

// Step 1: Profile Picture
export const profilePictureSchema = z.object({
  avatar: z.string().optional(),
});

// Step 2: Basic Information
export const basicInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

// Step 3: Contact Information
export const contactInfoSchema = z.object({
  phone: z.string().optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
});

// Step 4: Professional Information
export const professionalInfoSchema = z.object({
  company: z.string().max(100, "Company name must be less than 100 characters").optional(),
  jobTitle: z.string().max(100, "Job title must be less than 100 characters").optional(),
});

// Step 5: Preferences
export const preferencesSchema = z.object({
  timezone: z.string().optional(),
  language: z.string().default("en"),
});

// Step 6: Account Security
export const accountSecuritySchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Combined schema for complete registration
export const completeRegistrationSchema = z.object({
  // Profile Picture
  avatar: profilePictureSchema.shape.avatar,
  
  // Basic Information
  name: basicInfoSchema.shape.name,
  email: basicInfoSchema.shape.email,
  bio: basicInfoSchema.shape.bio,
  
  // Contact Information
  phone: contactInfoSchema.shape.phone,
  location: contactInfoSchema.shape.location,
  website: contactInfoSchema.shape.website,
  
  // Professional Information
  company: professionalInfoSchema.shape.company,
  jobTitle: professionalInfoSchema.shape.jobTitle,
  
  // Preferences
  timezone: preferencesSchema.shape.timezone,
  language: preferencesSchema.shape.language,
  
  // Account Security
  password: accountSecuritySchema.shape.password,
  confirmPassword: accountSecuritySchema.shape.confirmPassword,
  acceptTerms: accountSecuritySchema.shape.acceptTerms,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Export types
export type ProfilePictureFormData = z.infer<typeof profilePictureSchema>;
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
export type ProfessionalInfoFormData = z.infer<typeof professionalInfoSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
export type AccountSecurityFormData = z.infer<typeof accountSecuritySchema>;
export type CompleteRegistrationFormData = z.infer<typeof completeRegistrationSchema>;

// Form step configuration for Context7 pattern
export const REGISTRATION_STEPS = [
  {
    id: 1,
    title: "Profile Picture",
    description: "Upload your profile picture and public avatar",
    schema: profilePictureSchema,
    optional: true,
  },
  {
    id: 2,
    title: "Basic Information",
    description: "Tell us about yourself",
    schema: basicInfoSchema,
    optional: false,
  },
  {
    id: 3,
    title: "Contact Information",
    description: "How can people reach you?",
    schema: contactInfoSchema,
    optional: true,
  },
  {
    id: 4,
    title: "Professional Information",
    description: "Your work and professional details",
    schema: professionalInfoSchema,
    optional: true,
  },
  {
    id: 5,
    title: "Preferences",
    description: "Customize your experience",
    schema: preferencesSchema,
    optional: true,
  },
  {
    id: 6,
    title: "Account Security",
    description: "Secure your account",
    schema: accountSecuritySchema,
    optional: false,
  },
] as const;

export type RegistrationStep = typeof REGISTRATION_STEPS[number];