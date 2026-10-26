/**
 * Authentication and form validation utilities for Aura AI
 */

export interface PasswordValidationResult {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  if (!password || typeof password !== 'string') {
    return { isValid: false, strength: 'weak', errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 3) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
}

export function validateSignUpPayload(payload: {
  name?: string;
  email?: string;
  password?: string;
  termsAccepted?: boolean;
}): { isValid: boolean; error?: string } {
  if (!payload.name || payload.name.trim().length < 2) {
    return { isValid: false, error: 'Please enter your full name (at least 2 characters).' };
  }
  if (!payload.email || !validateEmail(payload.email)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  const pwdCheck = validatePassword(payload.password || '');
  if (!pwdCheck.isValid) {
    return { isValid: false, error: pwdCheck.errors[0] || 'Password does not meet requirements.' };
  }
  if (payload.termsAccepted === false) {
    return { isValid: false, error: 'You must agree to the Terms of Service to create an account.' };
  }
  return { isValid: true };
}

export function validateSignInPayload(payload: {
  email?: string;
  password?: string;
}): { isValid: boolean; error?: string } {
  if (!payload.email || !validateEmail(payload.email)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  if (!payload.password || payload.password.length === 0) {
    return { isValid: false, error: 'Please enter your password.' };
  }
  return { isValid: true };
}

export function formatUserInitials(name: string): string {
  if (!name || typeof name !== 'string') return 'AI';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
