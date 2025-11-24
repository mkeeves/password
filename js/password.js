// Password generation module
import { LOWER, UPPER, NUMBERS, SIMPLE_SYMBOLS, ALL_SYMBOLS } from './constants.js';
import { getRandomInt, shuffle } from './crypto.js';

/**
 * Generate a password with the given options
 * @param {Object} options
 * @param {number} options.length - Password length
 * @param {boolean} options.useLower - Include lowercase letters
 * @param {boolean} options.useUpper - Include uppercase letters
 * @param {boolean} options.useNumbers - Include numbers
 * @param {boolean} options.useSimpleSymbols - Include simple symbols
 * @param {boolean} options.useAllSymbols - Include all symbols
 * @returns {string}
 */
export function generatePassword(options) {
  const { length, useLower, useUpper, useNumbers, useSimpleSymbols, useAllSymbols } = options;

  // Build character pool
  let pool = '';
  const requiredSets = [];

  if (useLower) {
    pool += LOWER;
    requiredSets.push(LOWER);
  }
  if (useUpper) {
    pool += UPPER;
    requiredSets.push(UPPER);
  }
  if (useNumbers) {
    pool += NUMBERS;
    requiredSets.push(NUMBERS);
  }
  if (useAllSymbols) {
    pool += ALL_SYMBOLS;
    requiredSets.push(ALL_SYMBOLS);
  } else if (useSimpleSymbols) {
    pool += SIMPLE_SYMBOLS;
    requiredSets.push(SIMPLE_SYMBOLS);
  }

  if (pool.length === 0) {
    throw new Error('Select at least one character set');
  }

  if (length < requiredSets.length) {
    throw new Error(`Length must be at least ${requiredSets.length} for selected character sets`);
  }

  // Ensure at least one character from each required set
  const passwordChars = [];
  for (const set of requiredSets) {
    passwordChars.push(set[getRandomInt(set.length)]);
  }

  // Fill remaining positions from the full pool
  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(pool[getRandomInt(pool.length)]);
  }

  // Shuffle to randomize positions
  return shuffle(passwordChars).join('');
}
