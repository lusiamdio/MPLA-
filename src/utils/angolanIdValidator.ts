/**
 * Angolan Identification Validator & Formatter
 * 
 * Supports:
 * 1. Angolan Passport (Passaporte Angolano):
 *    Format: NXXXXXXX (Letter 'N' followed by exactly 7 digits = 8 characters)
 *    Example: N1234567, N0491823
 * 
 * 2. Angolan Bilhete de Identidade (B.I.):
 *    Format: XXXXXXXXXLAXXX (9 digits + 2 letters Province Code + 3 digits = 14 characters)
 *    Example: 004928172LA042, 009876543LA012, 123456789LA001
 */

export interface IdValidationResult {
  valid: boolean;
  idType: 'BI' | 'Passport';
  formatted: string;
  error?: string;
  helperText?: string;
}

// Regex for Angolan Passport: 'N' followed by 7 digits
export const ANGOLAN_PASSPORT_REGEX = /^N\d{7}$/;

// Regex for Angolan Bilhete de Identidade: 9 digits + 2 uppercase letters (ex: LA) + 3 digits
export const ANGOLAN_BI_REGEX = /^\d{9}[A-Z]{2}\d{3}$/;

/**
 * Validates an Angolan Passport number
 * Must be 'N' followed by exactly 7 digits (e.g. N1234567)
 */
export function validateAngolanPassport(input: string): { valid: boolean; formatted: string; error?: string } {
  const clean = input.trim().toUpperCase().replace(/[\s-]/g, '');
  
  if (!clean) {
    return { valid: false, formatted: clean, error: "O número de Passaporte é obrigatório." };
  }

  if (!clean.startsWith('N')) {
    return {
      valid: false,
      formatted: clean,
      error: "O Passaporte Angolano deve iniciar com a letra 'N' (ex: N1234567)."
    };
  }

  if (clean.length !== 8) {
    return {
      valid: false,
      formatted: clean,
      error: `O Passaporte Angolano deve ter exatamente 8 caracteres (N + 7 dígitos). Tem atualmente ${clean.length} caracteres.`
    };
  }

  if (!ANGOLAN_PASSPORT_REGEX.test(clean)) {
    return {
      valid: false,
      formatted: clean,
      error: "Formato de Passaporte inválido. Deve ser a letra 'N' seguida de 7 dígitos numéricos (ex: N1234567)."
    };
  }

  return { valid: true, formatted: clean };
}

/**
 * Validates an Angolan Bilhete de Identidade (BI)
 * Must be 9 digits + 2 letters (ex: LA) + 3 digits (e.g. 004928172LA042 = 14 characters)
 */
export function validateAngolanBI(input: string): { valid: boolean; formatted: string; error?: string } {
  const clean = input.trim().toUpperCase().replace(/[\s-]/g, '');

  if (!clean) {
    return { valid: false, formatted: clean, error: "O número de Bilhete de Identidade é obrigatório." };
  }

  if (clean.length !== 14) {
    return {
      valid: false,
      formatted: clean,
      error: `O Bilhete de Identidade de Angola (BI) deve ter exatamente 14 caracteres (9 dígitos + 2 letras + 3 dígitos). Tem atualmente ${clean.length} caracteres (ex: 004928172LA042).`
    };
  }

  // Check initial 9 digits
  const firstNine = clean.slice(0, 9);
  if (!/^\d{9}$/.test(firstNine)) {
    return {
      valid: false,
      formatted: clean,
      error: "Os primeiros 9 caracteres do B.I. devem ser números (ex: 004928172LA042)."
    };
  }

  // Check 2 letters (Province code, e.g. LA, BE, HA, etc.)
  const letters = clean.slice(9, 11);
  if (!/^[A-Z]{2}$/.test(letters)) {
    return {
      valid: false,
      formatted: clean,
      error: `As posições 10 e 11 do B.I. devem ser duas letras provinciais maiúsculas (ex: LA para Luanda, HA para Huambo). Encontrado: "${letters}".`
    };
  }

  // Check final 3 digits
  const lastThree = clean.slice(11, 14);
  if (!/^\d{3}$/.test(lastThree)) {
    return {
      valid: false,
      formatted: clean,
      error: "Os últimos 3 caracteres do B.I. devem ser dígitos numéricos (ex: LA042)."
    };
  }

  if (!ANGOLAN_BI_REGEX.test(clean)) {
    return {
      valid: false,
      formatted: clean,
      error: "Formato de Bilhete de Identidade inválido. Exemplo correto: 004928172LA042."
    };
  }

  return { valid: true, formatted: clean };
}

/**
 * Formats user typing into uppercase and enforces character limits
 */
export function sanitizeAngolanIdInput(raw: string, idType: 'BI' | 'Passport'): string {
  const upper = raw.toUpperCase().replace(/[\s-]/g, '');
  if (idType === 'Passport') {
    // Only allow N followed by digits, up to 8 characters
    if (upper.length === 0) return '';
    const firstChar = upper.charAt(0);
    const rest = upper.slice(1).replace(/[^0-9]/g, '');
    return (firstChar + rest).slice(0, 8);
  } else {
    // BI: max 14 characters
    // first 9 digits, 2 letters, 3 digits
    let result = '';
    for (let i = 0; i < upper.length && i < 14; i++) {
      const c = upper.charAt(i);
      if (i < 9) {
        if (/[0-9]/.test(c)) result += c;
      } else if (i < 11) {
        if (/[A-Z]/.test(c)) result += c;
      } else {
        if (/[0-9]/.test(c)) result += c;
      }
    }
    return result;
  }
}

/**
 * Intelligent auto-detection of Angolan document type & validation
 */
export function validateAngolanIdentification(
  input: string, 
  specifiedType?: 'BI' | 'Passport'
): IdValidationResult {
  const clean = input.trim().toUpperCase().replace(/[\s-]/g, '');

  if (!clean) {
    return {
      valid: false,
      idType: specifiedType || 'BI',
      formatted: '',
      error: "Introduza o número de identificação."
    };
  }

  // Auto-detect Passport if begins with 'N' and length <= 8
  const isLikelyPassport = specifiedType === 'Passport' || (clean.startsWith('N') && clean.length <= 8);

  if (isLikelyPassport) {
    const res = validateAngolanPassport(clean);
    return {
      valid: res.valid,
      idType: 'Passport',
      formatted: res.formatted,
      error: res.error,
      helperText: "Passaporte Angolano: Formato NXXXXXXX (ex: N1234567)"
    };
  } else {
    const res = validateAngolanBI(clean);
    return {
      valid: res.valid,
      idType: 'BI',
      formatted: res.formatted,
      error: res.error,
      helperText: "Bilhete de Identidade: Formato XXXXXXXXXLAXXX (ex: 004928172LA042)"
    };
  }
}
