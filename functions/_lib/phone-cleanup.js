// deploy-marker phone-cleanup-v1
// Phone normalization utility - shared between dry-run preview and bulk apply.
//
// Strategy:
//   1. Strip whitespace, dashes, parens, dots
//   2. Convert "00..." to "+..."
//   3. If already starts with "+" → assume good, just emit cleaned digits
//   4. If only digits + has country code prefix matching known patterns → add "+"
//   5. If no prefix + email domain known (.de, .fr, .es, .it, .co.uk, .nl, .be, .ch, .at) → prepend that country code
//   6. Otherwise: leave as-is, mark "needs review"

// Common European + DACH + relevant country codes
const DOMAIN_TO_COUNTRY = {
  'de': '+49', 'at': '+43', 'ch': '+41',
  'fr': '+33', 'es': '+34', 'it': '+39',
  'uk': '+44', 'co.uk': '+44',
  'nl': '+31', 'be': '+32', 'lu': '+352',
  'pt': '+351', 'pl': '+48', 'cz': '+420',
  'dk': '+45', 'se': '+46', 'no': '+47', 'fi': '+358',
  'gr': '+30', 'tr': '+90', 'ru': '+7',
  'us': '+1', 'ca': '+1',
  'ae': '+971', 'sa': '+966',
  'br': '+55', 'mx': '+52', 'ar': '+54',
  'au': '+61', 'nz': '+64',
  'jp': '+81', 'cn': '+86', 'kr': '+82', 'in': '+91'
};

// Known country code prefixes (sorted by length descending so 3-digit matches before 2-digit)
const COUNTRY_PREFIXES = [
  '358', '352', '420', '971', '966', '352',  // 3-digit
  '49', '43', '41', '33', '34', '39', '44', '31', '32', '45', '46', '47', '48',
  '30', '90', '55', '52', '54', '61', '64', '81', '86', '82', '91',
  '20', '27', '60',
  '7', '1' // last
];

const DEFAULT_COUNTRY = '+33'; // Cannes context — but only used if explicitly opted-in

/**
 * Returns { original, cleaned, action, status, note }
 *   status: 'ok' | 'guessed' | 'needs_review' | 'empty' | 'unchanged'
 *   action: human-readable explanation
 */
export function cleanupPhone(rawPhone, emailHint) {
  const original = (rawPhone || '').trim();

  if (!original) {
    return { original: '', cleaned: '', status: 'empty', action: 'No phone' };
  }

  // Step 1: Remove all non-digit/non-plus characters
  // Keep leading + if present
  let stripped = original.replace(/[^\d+]/g, '');

  // Step 2: Convert leading "00" to "+"
  if (stripped.startsWith('00')) {
    stripped = '+' + stripped.slice(2);
  }

  // Step 3: Already has + prefix — just emit cleaned version
  if (stripped.startsWith('+')) {
    if (stripped === original.replace(/\s/g, '')) {
      return { original, cleaned: stripped, status: 'unchanged', action: 'Already clean' };
    }
    return { original, cleaned: stripped, status: 'ok', action: 'Removed formatting' };
  }

  // Step 4: No + prefix - try to detect country code from leading digits
  // If it starts with a known country code AND total length is plausible (10-15 digits)
  if (stripped.length >= 8 && stripped.length <= 15) {
    for (const prefix of COUNTRY_PREFIXES) {
      if (stripped.startsWith(prefix)) {
        const remainingDigits = stripped.length - prefix.length;
        // Phones typically have 7-12 digits after country code
        if (remainingDigits >= 7 && remainingDigits <= 12) {
          return {
            original,
            cleaned: '+' + stripped,
            status: 'guessed',
            action: `Added "+" (detected +${prefix} country prefix)`
          };
        }
      }
    }
  }

  // Step 5: No detected prefix — try email domain
  const tld = extractTld(emailHint);
  if (tld && DOMAIN_TO_COUNTRY[tld]) {
    const cc = DOMAIN_TO_COUNTRY[tld];
    // Remove leading 0 from local number if present (e.g. "017..." → "17...")
    let local = stripped;
    if (local.startsWith('0')) local = local.slice(1);
    return {
      original,
      cleaned: cc + local,
      status: 'guessed',
      action: `Added ${cc} based on email domain .${tld}`
    };
  }

  // Step 6: Cannot reliably determine
  return {
    original,
    cleaned: stripped,
    status: 'needs_review',
    action: 'Country unknown — needs manual review'
  };
}

function extractTld(email) {
  if (!email) return null;
  const at = email.lastIndexOf('@');
  if (at < 0) return null;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain) return null;

  // Check for two-part TLDs first
  if (domain.endsWith('.co.uk')) return 'co.uk';
  if (domain.endsWith('.com.au')) return 'au';
  if (domain.endsWith('.com.br')) return 'br';
  if (domain.endsWith('.com.mx')) return 'mx';

  const lastDot = domain.lastIndexOf('.');
  if (lastDot < 0) return null;
  return domain.slice(lastDot + 1);
}

/**
 * Validates a cleaned phone number after the cleanup
 * Returns { valid: bool, reason: string }
 */
export function validateCleaned(cleaned) {
  if (!cleaned) return { valid: false, reason: 'empty' };
  if (!cleaned.startsWith('+')) return { valid: false, reason: 'missing country code' };
  const digits = cleaned.slice(1);
  if (!/^\d+$/.test(digits)) return { valid: false, reason: 'contains non-digits' };
  if (digits.length < 8) return { valid: false, reason: 'too short' };
  if (digits.length > 15) return { valid: false, reason: 'too long' };
  return { valid: true, reason: '' };
}
