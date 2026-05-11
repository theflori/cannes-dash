// deploy-marker 1778513130
// Phone normalization using Google's libphonenumber library (250+ countries, ~accurate).
//
// Strategy (each step only escalates if the previous failed):
//   1. Try parsing as-is (libphonenumber detects "+", "00", international format on its own)
//   2. If number has "00" prefix → strip + replace with "+", parse again
//   3. If no country detected → try with default country derived from email TLD
//   4. If still ambiguous → try DE (DACH primary) and FR (Cannes context) as fallback
//   5. If all fail → mark needs_review with a clear reason

import { parsePhoneNumberFromString } from './libphonenumber.js';

// Email TLD → ISO 3166-1 alpha-2 country code
const TLD_TO_COUNTRY = {
  'de': 'DE', 'at': 'AT', 'ch': 'CH',
  'fr': 'FR', 'es': 'ES', 'it': 'IT',
  'uk': 'GB', 'co.uk': 'GB', 'gb': 'GB',
  'nl': 'NL', 'be': 'BE', 'lu': 'LU',
  'pt': 'PT', 'pl': 'PL', 'cz': 'CZ',
  'dk': 'DK', 'se': 'SE', 'no': 'NO', 'fi': 'FI',
  'gr': 'GR', 'tr': 'TR', 'ru': 'RU',
  'us': 'US', 'ca': 'CA',
  'ae': 'AE', 'sa': 'SA', 'eg': 'EG', 'ma': 'MA', 'tn': 'TN',
  'br': 'BR', 'mx': 'MX', 'ar': 'AR', 'cl': 'CL', 'co': 'CO',
  'au': 'AU', 'nz': 'NZ',
  'jp': 'JP', 'cn': 'CN', 'kr': 'KR', 'in': 'IN', 'sg': 'SG', 'hk': 'HK', 'th': 'TH',
  'il': 'IL', 'za': 'ZA', 'ng': 'NG', 'ke': 'KE',
  'ie': 'IE'
};

// Fallback country guesses (tried in order if everything else fails)
const FALLBACK_COUNTRIES = ['DE', 'FR'];  // DACH primary, Cannes secondary

/**
 * Returns { original, cleaned, status, action, country, valid, validationReason }
 *   status: 'ok' | 'guessed' | 'likely' | 'needs_review' | 'empty' | 'unchanged' | 'invalid'
 */
export function cleanupPhone(rawPhone, emailHint) {
  const original = (rawPhone || '').trim();

  if (!original) {
    return { original: '', cleaned: '', status: 'empty', action: 'No phone', country: null, valid: false, validationReason: 'empty' };
  }

  // Step 0: Light cleanup before parsing (remove obvious non-essential characters but keep + and digits)
  let prepared = original.replace(/[^\d+\-\s().]/g, '').trim();
  if (!prepared) {
    return { original, cleaned: '', status: 'invalid', action: 'No digits found', country: null, valid: false, validationReason: 'no digits' };
  }

  // Convert leading "00" to "+" (international dialing prefix)
  if (prepared.startsWith('00')) {
    prepared = '+' + prepared.slice(2);
  }

  // ============== Try parsing without any country hint ==============
  // libphonenumber will detect the country from "+XX" prefix on its own.
  try {
    const parsed = parsePhoneNumberFromString(prepared);
    if (parsed && parsed.isValid()) {
      const e164 = parsed.number;
      const country = parsed.country;
      const wasFormatted = e164 !== original.replace(/\s/g, '');
      return {
        original,
        cleaned: e164,
        status: wasFormatted ? 'ok' : 'unchanged',
        action: wasFormatted
          ? `Formatted as ${country || 'international'}`
          : 'Already valid',
        country,
        valid: true,
        validationReason: ''
      };
    }
  } catch {}

  // ============== If no "+" prefix, try adding it (maybe user forgot the +) ==============
  // Catches cases like "971501234567" or "33612345678" which are valid E.164 without leading +
  if (!prepared.startsWith('+')) {
    const digitsOnly = prepared.replace(/\D/g, '');
    if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
      try {
        const parsed = parsePhoneNumberFromString('+' + digitsOnly);
        if (parsed && parsed.isValid()) {
          return {
            original,
            cleaned: parsed.number,
            status: 'guessed',
            action: `Added "+" — detected ${parsed.country} from country code`,
            country: parsed.country,
            valid: true,
            validationReason: ''
          };
        }
      } catch {}
    }
  }

  // ============== Try with country hint from email TLD ==============
  const tldCountry = countryFromEmail(emailHint);
  if (tldCountry) {
    try {
      const parsed = parsePhoneNumberFromString(prepared, tldCountry);
      if (parsed && parsed.isValid()) {
        return {
          original,
          cleaned: parsed.number,
          status: 'guessed',
          action: `Detected ${parsed.country} via email domain`,
          country: parsed.country,
          valid: true,
          validationReason: ''
        };
      }
    } catch {}
  }

  // ============== Try fallback countries (DACH + Cannes context) ==============
  for (const fallback of FALLBACK_COUNTRIES) {
    try {
      const parsed = parsePhoneNumberFromString(prepared, fallback);
      if (parsed && parsed.isValid()) {
        return {
          original,
          cleaned: parsed.number,
          status: 'likely',
          action: `Pattern matches ${parsed.country} — verify`,
          country: parsed.country,
          valid: true,
          validationReason: ''
        };
      }
    } catch {}
  }

  // ============== Last resort: parse without validation to give a hint ==============
  try {
    const parsed = parsePhoneNumberFromString(prepared, tldCountry || 'DE');
    if (parsed) {
      // Got a parse but not valid — still produce a result for review
      return {
        original,
        cleaned: parsed.number || prepared,
        status: 'needs_review',
        action: parsed.country ? `Parsed as ${parsed.country} but invalid for that country` : 'Could not validate',
        country: parsed.country || null,
        valid: false,
        validationReason: 'invalid format for detected country'
      };
    }
  } catch {}

  // ============== Truly unparseable ==============
  return {
    original,
    cleaned: prepared,
    status: 'needs_review',
    action: 'Could not detect country — needs manual review',
    country: null,
    valid: false,
    validationReason: 'unparseable'
  };
}

function countryFromEmail(email) {
  if (!email) return null;
  const at = email.lastIndexOf('@');
  if (at < 0) return null;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain) return null;

  // Multi-part TLDs first
  if (domain.endsWith('.co.uk')) return 'GB';
  if (domain.endsWith('.com.au')) return 'AU';
  if (domain.endsWith('.com.br')) return 'BR';
  if (domain.endsWith('.com.mx')) return 'MX';

  const lastDot = domain.lastIndexOf('.');
  if (lastDot < 0) return null;
  const tld = domain.slice(lastDot + 1);
  return TLD_TO_COUNTRY[tld] || null;
}

/**
 * Validates a cleaned phone number using libphonenumber
 */
export function validateCleaned(cleaned) {
  if (!cleaned) return { valid: false, reason: 'empty' };
  if (!cleaned.startsWith('+')) return { valid: false, reason: 'missing country code' };
  try {
    const parsed = parsePhoneNumberFromString(cleaned);
    if (parsed && parsed.isValid()) return { valid: true, reason: '' };
    return { valid: false, reason: 'invalid format' };
  } catch {
    return { valid: false, reason: 'unparseable' };
  }
}
