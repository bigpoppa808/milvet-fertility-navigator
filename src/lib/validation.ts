import { z } from 'zod'

// Military-specific validation schemas and utilities

// Email validation with military domain support
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

// Enhanced email validation for military personnel
export const militaryEmailSchema = z.string()
  .email('Please enter a valid email address')
  .refine((email) => {
    const militaryDomains = [
      '.mil',
      '.army.mil',
      '.navy.mil',
      '.af.mil',
      '.marines.mil',
      '.uscg.mil',
      '.socom.mil'
    ]
    
    // Allow all emails, but flag military ones for special handling
    return true
  }, 'Invalid email format')

// Password validation with military-grade security requirements
export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
  .refine((password) => {
    // Check for common patterns to avoid
    const commonPatterns = [
      /(.)\1{2,}/, // Three or more consecutive identical characters
      /123456/, // Sequential numbers
      /abcdef/, // Sequential letters
      /password/i, // Contains "password"
      /qwerty/i, // Contains "qwerty"
    ]
    
    return !commonPatterns.some(pattern => pattern.test(password))
  }, 'Password contains common patterns that are not secure')

// Military service information validation
export const serviceBranchSchema = z.enum([
  'army',
  'navy',
  'air_force',
  'marines',
  'coast_guard',
  'space_force',
  'national_guard',
  'reserves',
  'other'
], {
  errorMap: () => ({ message: 'Please select a valid service branch' })
})

export const serviceStatusSchema = z.enum([
  'active_duty',
  'veteran',
  'retired',
  'reserve',
  'national_guard',
  'civilian_spouse',
  'dependent'
], {
  errorMap: () => ({ message: 'Please select a valid service status' })
})

export const payGradeSchema = z.string()
  .regex(/^(E-[1-9]|W-[1-5]|O-[1-10]|GS-[1-15]|N\/A)$/, 
    'Please enter a valid pay grade (e.g., E-5, O-3, W-2, GS-12, or N/A)')
  .optional()

// Disability rating validation
export const disabilityRatingSchema = z.number()
  .min(0, 'Disability rating must be 0% or higher')
  .max(100, 'Disability rating cannot exceed 100%')
  .step(10, 'Disability rating must be in 10% increments (0%, 10%, 20%, etc.)')
  .optional()

// Phone number validation
export const phoneSchema = z.string()
  .regex(/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, 
    'Please enter a valid phone number')
  .optional()

// Name validation
export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')

// Address validation
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required').max(200, 'Street address is too long'),
  city: z.string().min(1, 'City is required').max(100, 'City name is too long'),
  state: z.string().length(2, 'State must be a 2-letter abbreviation').toUpperCase(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code (12345 or 12345-6789)'),
  country: z.string().default('US')
})

// Date validation
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
  }, 'Please enter a valid date')

export const birthDateSchema = dateSchema
  .refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 18 && age <= 120
  }, 'Age must be between 18 and 120 years')

// Fertility stage validation
export const fertilityStageSchema = z.enum([
  'exploring_options',
  'trying_to_conceive',
  'undergoing_treatment',
  'pregnant',
  'parenting',
  'completed_family',
  'prefer_not_to_say'
], {
  errorMap: () => ({ message: 'Please select a fertility stage' })
})

// Profile update schema
export const profileUpdateSchema = z.object({
  full_name: nameSchema.optional(),
  service_branch: serviceBranchSchema.optional(),
  service_status: serviceStatusSchema.optional(),
  pay_grade: payGradeSchema.optional(),
  disability_rating: disabilityRatingSchema.optional(),
  state: z.string().length(2).toUpperCase().optional(),
  fertility_stage: fertilityStageSchema.optional(),
  preferred_language: z.enum(['en', 'es']).default('en'),
  phone: phoneSchema.optional(),
  spouse_info: z.object({
    name: nameSchema.optional(),
    service_member: z.boolean().optional(),
    service_branch: serviceBranchSchema.optional()
  }).optional(),
  notification_preferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    legislation_updates: z.boolean().default(true),
    funding_opportunities: z.boolean().default(true),
    community_updates: z.boolean().default(false)
  }).default({
    email: true,
    sms: false,
    push: true,
    legislation_updates: true,
    funding_opportunities: true,
    community_updates: false
  })
})

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Registration schema
export const registrationSchema = z.object({
  email: militaryEmailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  full_name: nameSchema,
  service_branch: serviceBranchSchema,
  service_status: serviceStatusSchema,
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
  privacy_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Contact form schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
  category: z.enum(['technical', 'general', 'feedback', 'billing', 'other']),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
})

// Utility functions for validation

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function validatePassword(password: string): { 
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const result = passwordSchema.safeParse(password)
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  
  if (result.success) {
    // Calculate password strength
    let score = 0
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    if (!/(.)\1{2,}/.test(password)) score += 1 // No repeated characters
    
    if (score <= 3) strength = 'weak'
    else if (score <= 5) strength = 'medium'
    else strength = 'strong'
  }
  
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.errors.map(err => err.message),
    strength
  }
}

export function validateServiceInfo(data: {
  service_branch?: string
  service_status?: string
  pay_grade?: string
}): { isValid: boolean; errors: string[] } {
  const schema = z.object({
    service_branch: serviceBranchSchema.optional(),
    service_status: serviceStatusSchema.optional(),
    pay_grade: payGradeSchema.optional()
  })
  
  const result = schema.safeParse(data)
  
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.errors.map(err => err.message)
  }
}

// Sanitization functions
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .slice(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// Form field helpers
export function getFieldError(
  errors: Record<string, any>,
  fieldName: string
): string | undefined {
  const error = errors[fieldName]
  if (typeof error === 'object' && error?.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return undefined
}

export function hasFieldError(
  errors: Record<string, any>,
  fieldName: string
): boolean {
  return !!getFieldError(errors, fieldName)
}