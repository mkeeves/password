// Strength estimation module (entropy in bits)

/**
 * Estimate password strength based on character composition
 * @param {string} password
 * @returns {{label: string, level: string, entropy: number}}
 */
export function estimatePasswordStrength(password) {
  // Calculate charset size based on character types present
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32; // Approximate symbol count

  // Entropy = length * log2(charset_size)
  const entropy = charsetSize > 0 ? Math.floor(password.length * Math.log2(charsetSize)) : 0;

  return categorizeStrength(entropy);
}

/**
 * Estimate passphrase strength based on word count
 * @param {number} wordCount
 * @returns {{label: string, level: string, entropy: number}}
 */
export function estimatePassphraseStrength(wordCount) {
  // EFF Diceware: 7,776 words = ~12.9 bits per word
  const entropy = Math.floor(wordCount * 12.9);
  return categorizeStrength(entropy);
}

/**
 * Categorize entropy into strength levels
 * @param {number} entropy
 * @returns {{label: string, level: string, entropy: number}}
 */
function categorizeStrength(entropy) {
  let label, level;
  if (entropy < 40) {
    label = 'Weak';
    level = 'weak';
  } else if (entropy < 60) {
    label = 'Okay';
    level = 'okay';
  } else {
    label = 'Strong';
    level = 'strong';
  }

  return { label, level, entropy };
}
