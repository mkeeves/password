// UI/DOM management module
import { generatePassword } from './password.js';
import {
  generatePassphrase,
  renderPassphrase,
  passphraseState,
  adjustWordCount
} from './passphrase.js';
import { estimatePasswordStrength, estimatePassphraseStrength } from './strength.js';
import { getUrlParams, buildUrlParams, updateBrowserUrl, clamp } from './url.js';

// Current mode state
let currentMode = 'password';
let feedbackTimeout = null;

/**
 * Get current mode
 * @returns {'password'|'passphrase'}
 */
export function getCurrentMode() {
  return currentMode;
}

/**
 * Get password options from DOM
 * @returns {Object}
 */
export function getPasswordOptions() {
  return {
    length: clamp(parseInt(document.getElementById('length').value) || 16, 8, 128),
    useLower: document.getElementById('useLower').checked,
    useUpper: document.getElementById('useUpper').checked,
    useNumbers: document.getElementById('useNumbers').checked,
    useSimpleSymbols: document.getElementById('useSimpleSymbols').checked,
    useAllSymbols: document.getElementById('useAllSymbols').checked
  };
}

/**
 * Get passphrase options from DOM
 * @returns {Object}
 */
export function getPassphraseOptions() {
  return {
    words: clamp(parseInt(document.getElementById('words').value) || 5, 1, 12),
    separator: document.getElementById('separator').value,
    capitalize: document.getElementById('passphraseCapitalize').checked,
    capitalizePosition: document.getElementById('capitalizePosition').value,
    addNumber: document.getElementById('passphraseNumbers').checked,
    numberPosition: document.getElementById('numberPosition').value,
    numberWord: document.getElementById('numberWord').value,
    addSymbol: document.getElementById('passphraseSymbols').checked,
    symbolPosition: document.getElementById('symbolPosition').value,
    symbolWord: document.getElementById('symbolWord').value
  };
}

/**
 * Show feedback message
 * @param {string} message
 * @param {string} type - 'success', 'error', or ''
 */
export function showFeedback(message, type = '') {
  const feedback = document.getElementById('feedback');
  feedback.textContent = message;
  feedback.className = 'feedback' + (type ? ' ' + type : '');

  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout);
    feedbackTimeout = null;
  }
}

/**
 * Update strength bar display
 * @param {string|null} level - 'weak', 'okay', 'strong', or null
 */
export function updateStrengthBar(level) {
  const bar = document.getElementById('strengthBar');
  bar.className = 'strength-bar-fill';
  if (level) {
    bar.classList.add(level);
  }
}

/**
 * Update URL and API URL display
 */
export function updateUrl() {
  const params = buildUrlParams(
    currentMode,
    getPasswordOptions(),
    getPassphraseOptions()
  );
  const newUrl = updateBrowserUrl(params);

  // Update API URL display
  const apiUrlEl = document.getElementById('apiUrl');
  if (apiUrlEl) {
    apiUrlEl.textContent = window.location.origin + newUrl;
  }
}

/**
 * Set the current mode
 * @param {'password'|'passphrase'} mode
 */
export function setMode(mode) {
  currentMode = mode;

  // Update toggle buttons
  document.getElementById('modePassword').classList.toggle('active', mode === 'password');
  document.getElementById('modePassphrase').classList.toggle('active', mode === 'passphrase');

  // Show/hide options
  document.getElementById('passwordOptions').classList.toggle('active', mode === 'password');
  document.getElementById('passphraseOptions').classList.toggle('active', mode === 'passphrase');

  // Auto-generate when switching modes
  generate();
}

/**
 * Generate password or passphrase based on current mode
 */
export function generate() {
  const output = document.getElementById('output');

  try {
    let result, strength;

    if (currentMode === 'password') {
      const options = getPasswordOptions();
      result = generatePassword(options);
      strength = estimatePasswordStrength(result);
    } else {
      const options = getPassphraseOptions();
      result = generatePassphrase(options);
      strength = estimatePassphraseStrength(options.words);
    }

    output.textContent = result;
    showFeedback(`Strength: ${strength.label} (${strength.entropy} bits)`);
    updateStrengthBar(strength.level);
    updateUrl();
  } catch (err) {
    output.textContent = '';
    showFeedback(err.message, 'error');
    updateStrengthBar(null);
  }
}

/**
 * Update passphrase display without regenerating words
 */
export function updatePassphraseDisplay() {
  if (passphraseState.words.length === 0) return;

  const options = getPassphraseOptions();

  // Handle word count changes
  adjustWordCount(options.words);

  const result = renderPassphrase(options);
  const output = document.getElementById('output');
  output.textContent = result;

  const strength = estimatePassphraseStrength(options.words);
  showFeedback(`Strength: ${strength.label} (${strength.entropy} bits)`);
  updateStrengthBar(strength.level);
  updateUrl();
}

/**
 * Copy output to clipboard
 */
export async function copyToClipboard() {
  const output = document.getElementById('output');
  const value = output.textContent;

  if (!value) {
    showFeedback('Nothing to copy', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    const previousFeedback = document.getElementById('feedback').textContent;
    showFeedback('Copied to clipboard', 'success');

    feedbackTimeout = setTimeout(() => {
      showFeedback(previousFeedback);
    }, 1200);
  } catch (err) {
    showFeedback('Failed to copy', 'error');
  }
}

/**
 * Copy API URL to clipboard
 */
export async function copyUrl() {
  const apiUrl = document.getElementById('apiUrl');
  const url = apiUrl ? apiUrl.textContent : window.location.href;

  try {
    await navigator.clipboard.writeText(url);
    const previousFeedback = document.getElementById('feedback').textContent;
    showFeedback('URL copied', 'success');

    feedbackTimeout = setTimeout(() => {
      showFeedback(previousFeedback);
    }, 1200);
  } catch (err) {
    showFeedback('Failed to copy URL', 'error');
  }
}

/**
 * Apply URL parameters to form controls
 */
export function applyUrlParams() {
  const params = getUrlParams();

  // Apply bare mode
  if (params.bare) {
    document.body.classList.add('bare-mode');
  }

  // Apply mode
  const mode = (params.mode === 'passphrase' || params.mode === 'phrase') ? 'passphrase' : 'password';
  setMode(mode);

  // Apply password options
  document.getElementById('length').value = params.length;
  document.getElementById('useLower').checked = params.lower;
  document.getElementById('useUpper').checked = params.upper;
  document.getElementById('useNumbers').checked = params.numbers;
  document.getElementById('useSimpleSymbols').checked = params.simpleSymbols && !params.allSymbols;
  document.getElementById('useAllSymbols').checked = params.allSymbols;

  // Apply passphrase options
  document.getElementById('words').value = params.words;
  const sepSelect = document.getElementById('separator');
  for (let opt of sepSelect.options) {
    if (opt.value === params.sep || (params.sep === 'hyphen' && opt.value === '-')) {
      opt.selected = true;
      break;
    }
  }
  document.getElementById('passphraseCapitalize').checked = params.capitalize;
  document.getElementById('capitalizePosition').value = params.capitalizePos;
  document.getElementById('capitalizePosition').disabled = !params.capitalize;
  document.getElementById('passphraseNumbers').checked = params.addNumber;
  document.getElementById('numberPosition').value = params.numberPos;
  document.getElementById('numberPosition').disabled = !params.addNumber;
  document.getElementById('numberWord').value = params.numberWord;
  document.getElementById('numberWord').disabled = !params.addNumber || params.numberPos === 'random';
  document.getElementById('passphraseSymbols').checked = params.addSymbol;
  document.getElementById('symbolPosition').value = params.symbolPos;
  document.getElementById('symbolPosition').disabled = !params.addSymbol;
  document.getElementById('symbolWord').value = params.symbolWord;
  document.getElementById('symbolWord').disabled = !params.addSymbol || params.symbolPos === 'random';

  // Always generate on load (setMode already generates, but options may have changed)
  generate();
}

/**
 * Initialize UI event listeners
 */
export function initUI() {
  // Mode toggle
  document.getElementById('modePassword').addEventListener('click', () => setMode('password'));
  document.getElementById('modePassphrase').addEventListener('click', () => setMode('passphrase'));

  // Generate and copy buttons
  document.getElementById('generateBtn').addEventListener('click', generate);
  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
  document.getElementById('copyUrlBtn').addEventListener('click', copyUrl);

  // Auto-generate when password options change
  document.getElementById('length').addEventListener('input', generate);
  document.getElementById('useLower').addEventListener('change', generate);
  document.getElementById('useUpper').addEventListener('change', generate);
  document.getElementById('useNumbers').addEventListener('change', generate);
  document.getElementById('useSimpleSymbols').addEventListener('change', generate);
  document.getElementById('useAllSymbols').addEventListener('change', generate);

  // Passphrase options - enable/disable dropdowns and update display
  document.getElementById('words').addEventListener('input', updatePassphraseDisplay);
  document.getElementById('separator').addEventListener('change', updatePassphraseDisplay);

  document.getElementById('passphraseCapitalize').addEventListener('change', function() {
    document.getElementById('capitalizePosition').disabled = !this.checked;
    updatePassphraseDisplay();
  });
  document.getElementById('capitalizePosition').addEventListener('change', updatePassphraseDisplay);

  // Number dropdown handlers
  function updateNumberDropdowns() {
    const checked = document.getElementById('passphraseNumbers').checked;
    const pos = document.getElementById('numberPosition').value;
    document.getElementById('numberPosition').disabled = !checked;
    document.getElementById('numberWord').disabled = !checked || pos === 'random';
  }

  // Symbol dropdown handlers
  function updateSymbolDropdowns() {
    const checked = document.getElementById('passphraseSymbols').checked;
    const pos = document.getElementById('symbolPosition').value;
    document.getElementById('symbolPosition').disabled = !checked;
    document.getElementById('symbolWord').disabled = !checked || pos === 'random';
  }

  document.getElementById('passphraseNumbers').addEventListener('change', function() {
    updateNumberDropdowns();
    updatePassphraseDisplay();
  });
  document.getElementById('numberPosition').addEventListener('change', function() {
    updateNumberDropdowns();
    updatePassphraseDisplay();
  });
  document.getElementById('numberWord').addEventListener('change', updatePassphraseDisplay);

  document.getElementById('passphraseSymbols').addEventListener('change', function() {
    updateSymbolDropdowns();
    updatePassphraseDisplay();
  });
  document.getElementById('symbolPosition').addEventListener('change', function() {
    updateSymbolDropdowns();
    updatePassphraseDisplay();
  });
  document.getElementById('symbolWord').addEventListener('change', updatePassphraseDisplay);

  // Update strength when user manually edits the output
  document.getElementById('output').addEventListener('input', function() {
    const value = this.textContent.trim();
    if (value) {
      const strength = estimatePasswordStrength(value);
      showFeedback(`Strength: ${strength.label} (${strength.entropy} bits)`);
      updateStrengthBar(strength.level);
    } else {
      showFeedback('');
      updateStrengthBar(null);
    }
  });

  // Handle allSymbols overriding simpleSymbols
  document.getElementById('useAllSymbols').addEventListener('change', function() {
    if (this.checked) {
      document.getElementById('useSimpleSymbols').checked = false;
    }
  });
  document.getElementById('useSimpleSymbols').addEventListener('change', function() {
    if (this.checked) {
      document.getElementById('useAllSymbols').checked = false;
    }
  });

  // Initialize dropdown states
  updateNumberDropdowns();
  updateSymbolDropdowns();
}
