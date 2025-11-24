// Passphrase generation module
import { PASSPHRASE_SYMBOLS } from './constants.js';
import { getRandomInt } from './crypto.js';

// Wordlist loaded from external file
let WORDLIST = [];

// State for live passphrase updates
export const passphraseState = {
  words: [],      // Raw words (lowercase)
  number: null,   // Generated number (0-99)
  symbol: null    // Generated symbol
};

/**
 * Load the EFF Diceware wordlist from file
 * @returns {Promise<void>}
 */
export async function loadWordlist() {
  try {
    const response = await fetch('words.txt');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    WORDLIST = text.trim().split('\n');
    console.log(`Loaded ${WORDLIST.length} words`);
  } catch (error) {
    console.error('Failed to load wordlist:', error);
    throw new Error('Failed to load wordlist. Please refresh the page.');
  }
}

/**
 * Check if wordlist is loaded
 * @returns {boolean}
 */
export function isWordlistLoaded() {
  return WORDLIST.length > 0;
}

/**
 * Get a random word from the wordlist
 * @returns {string}
 */
export function getRandomWord() {
  return WORDLIST[getRandomInt(WORDLIST.length)];
}

/**
 * Generate a new passphrase with the given options
 * @param {Object} options
 * @param {number} options.words - Number of words
 * @returns {string}
 */
export function generatePassphrase(options) {
  const { words } = options;

  // Generate new random words and store them
  passphraseState.words = [];
  for (let i = 0; i < words; i++) {
    passphraseState.words.push(getRandomWord());
  }

  // Generate number and symbol (will be used if options are enabled)
  passphraseState.number = getRandomInt(100);
  passphraseState.symbol = PASSPHRASE_SYMBOLS[getRandomInt(PASSPHRASE_SYMBOLS.length)];

  return renderPassphrase(options);
}

/**
 * Render passphrase from current state with given options
 * @param {Object} options
 * @returns {string}
 */
export function renderPassphrase(options) {
  const {
    separator,
    capitalize,
    capitalizePosition,
    addNumber,
    numberPosition,
    numberWord,
    addSymbol,
    symbolPosition,
    symbolWord
  } = options;

  // Resolve separator
  let sep;
  switch (separator) {
    case 'space': sep = ' '; break;
    case 'none': sep = ''; break;
    default: sep = separator;
  }

  // Apply capitalization to stored words
  const processedWords = passphraseState.words.map((word, i) => {
    if (capitalize) {
      const shouldCapitalize =
        capitalizePosition === 'all' ||
        (capitalizePosition === 'first' && i === 0) ||
        (capitalizePosition === 'last' && i === passphraseState.words.length - 1);
      if (shouldCapitalize) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
    }
    return word;
  });

  let finalWords = [...processedWords];
  let suffix = '';

  // Add number
  if (addNumber && passphraseState.number !== null) {
    const num = String(passphraseState.number);
    if (numberPosition === 'random') {
      suffix += num;
    } else {
      finalWords = addExtraToWords(finalWords, num, numberPosition, numberWord);
    }
  }

  // Add symbol
  if (addSymbol && passphraseState.symbol !== null) {
    if (symbolPosition === 'random') {
      suffix += passphraseState.symbol;
    } else {
      finalWords = addExtraToWords(finalWords, passphraseState.symbol, symbolPosition, symbolWord);
    }
  }

  return finalWords.join(sep) + suffix;
}

/**
 * Add extra character(s) to word(s) at specified positions
 * @param {string[]} words - Array of words
 * @param {string} extra - Character(s) to add
 * @param {'start'|'end'} position - Where to add (start or end of word)
 * @param {'first'|'last'|'all'|'random'} wordSelection - Which word(s) to modify
 * @returns {string[]}
 */
function addExtraToWords(words, extra, position, wordSelection) {
  const result = [...words];
  let indices = [];

  if (wordSelection === 'first') {
    indices = [0];
  } else if (wordSelection === 'last') {
    indices = [words.length - 1];
  } else if (wordSelection === 'all') {
    indices = words.map((_, i) => i);
  } else {
    // random word - pick one
    indices = [getRandomInt(words.length)];
  }

  for (const i of indices) {
    if (position === 'start') {
      result[i] = extra + result[i];
    } else {
      result[i] = result[i] + extra;
    }
  }

  return result;
}

/**
 * Adjust word count in state (for live updates)
 * @param {number} targetCount
 */
export function adjustWordCount(targetCount) {
  while (passphraseState.words.length < targetCount) {
    passphraseState.words.push(getRandomWord());
  }
  if (passphraseState.words.length > targetCount) {
    passphraseState.words = passphraseState.words.slice(0, targetCount);
  }
}
