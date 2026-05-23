// =============================================
//  src/utils/validation.js
//  ES6 EXPORT VERSION - For React Native frontend
// =============================================

// ─────────────────────────────────────────────
//  PHONE VALIDATION
//  Format: +2519XXXXXXXX (13 characters total)
// ─────────────────────────────────────────────
export function validatePhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^\+2519[0-9]{8}$/;
  return phoneRegex.test(phone);
}

export function formatPhoneForDisplay(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('09')) {
      cleaned = '+251' + cleaned.substring(1);
    } else if (cleaned.startsWith('9')) {
      cleaned = '+251' + cleaned;
    }
  }
  return cleaned;
}

export function getPhoneError(phone) {
  if (!phone) return 'Phone number is required';
  if (!validatePhone(phone)) return 'Phone must be in format +2519XXXXXXXX (e.g., +251912345678)';
  return null;
}

// ─────────────────────────────────────────────
//  PASSWORD VALIDATION
//  Min 6 chars, at least 1 number
// ─────────────────────────────────────────────
export function validatePassword(password) {
  if (!password) return false;
  return password.length >= 6 && /[0-9]/.test(password);
}

export function getPasswordError(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

// ─────────────────────────────────────────────
//  NAME VALIDATION
//  Min 2 chars, letters and spaces only
// ─────────────────────────────────────────────
export function validateName(name) {
  if (!name) return false;
  return name.trim().length >= 2 && /^[a-zA-Z\u1200-\u137F\s]+$/.test(name);
}

export function getNameError(name) {
  if (!name) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\u1200-\u137F\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return null;
}

// ─────────────────────────────────────────────
//  DESCRIPTION VALIDATION
//  Min 10 chars, not gibberish
// ─────────────────────────────────────────────
export function validateDescription(description) {
  if (!description) return false;
  const trimmed = description.trim();
  if (trimmed.length < 10) return false;
  if (/(.)\1{5,}/.test(trimmed)) return false;
  if (/[asdfghjkl]{6,}/i.test(trimmed)) return false;
  return true;
}

export function getDescriptionError(description) {
  if (!description) return 'Description is required';
  if (description.trim().length < 10) return 'Please provide a meaningful description (minimum 10 characters)';
  if (/(.)\1{5,}/.test(description)) return 'Please provide a real description, not repeated characters';
  if (/[asdfghjkl]{6,}/i.test(description)) return 'Please provide a meaningful description';
  return null;
}

// ─────────────────────────────────────────────
//  RATING VALIDATION
//  Between 1 and 5
// ─────────────────────────────────────────────
export function validateRating(rating) {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

export function getRatingError(rating) {
  if (!rating && rating !== 0) return 'Rating is required';
  if (rating < 1 || rating > 5) return 'Rating must be between 1 and 5 stars';
  return null;
}

// ─────────────────────────────────────────────
//  AMOUNT VALIDATION (for payments)
//  Must be 100 or 20
// ─────────────────────────────────────────────
export function validateAmount(amount, allowedAmounts = [100, 20]) {
  return allowedAmounts.includes(amount);
}

export function getAmountError(amount) {
  if (!amount && amount !== 0) return 'Amount is required';
  if (!validateAmount(amount)) return 'Invalid amount. Allowed: 100 ETB or 20 ETB';
  return null;
}

// ─────────────────────────────────────────────
//  FORM VALIDATION (Complete form check)
// ─────────────────────────────────────────────
export function validateRegisterForm(data) {
  const errors = {};
  
  errors.name = getNameError(data.name);
  errors.phone = getPhoneError(data.phone);
  errors.password = getPasswordError(data.password);
  
  if (data.role === 'provider' || data.registerBoth) {
    if (!data.idPhoto) {
      errors.idPhoto = 'National ID photo is required';
    }
    if (data.selectedServices && data.selectedServices.length === 0) {
      errors.services = 'Please select at least one service you offer';
    }
  }
  
  return Object.fromEntries(Object.entries(errors).filter(([_, v]) => v !== null));
}

export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}