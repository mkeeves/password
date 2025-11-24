// URL parameter handling module

/**
 * Parse a boolean from URL parameter value
 * @param {string|null} value
 * @param {boolean} defaultValue
 * @returns {boolean}
 */
export function parseBoolean(value, defaultValue) {
  if (value === null || value === undefined) return defaultValue;
  const v = value.toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/**
 * Clamp a value between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parse URL parameters into options object
 * @returns {Object}
 */
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    mode: params.get('mode') || 'password',
    auto: parseBoolean(params.get('auto'), true),
    bare: parseBoolean(params.get('bare'), false),
    // Password options
    length: clamp(parseInt(params.get('length')) || 16, 8, 128),
    lower: parseBoolean(params.get('lower'), true),
    upper: parseBoolean(params.get('upper'), true),
    numbers: parseBoolean(params.get('numbers'), true),
    simpleSymbols: parseBoolean(params.get('simpleSymbols'), true),
    allSymbols: parseBoolean(params.get('allSymbols'), false),
    // Passphrase options
    words: clamp(parseInt(params.get('words')) || 5, 1, 12),
    sep: params.get('sep') || '.',
    capitalize: parseBoolean(params.get('capitalize'), false),
    capitalizePos: params.get('capitalizePos') || 'all',
    addNumber: parseBoolean(params.get('addNumber'), false),
    numberPos: params.get('numberPos') || 'random',
    numberWord: params.get('numberWord') || 'random',
    addSymbol: parseBoolean(params.get('addSymbol'), false),
    symbolPos: params.get('symbolPos') || 'random',
    symbolWord: params.get('symbolWord') || 'random'
  };
}

/**
 * Build URL parameters from current options
 * @param {string} mode - 'password' or 'passphrase'
 * @param {Object} passwordOptions
 * @param {Object} passphraseOptions
 * @returns {URLSearchParams}
 */
export function buildUrlParams(mode, passwordOptions, passphraseOptions) {
  const params = new URLSearchParams();

  params.set('mode', mode);

  if (mode === 'password') {
    const opts = passwordOptions;
    params.set('length', opts.length);
    params.set('lower', opts.useLower ? '1' : '0');
    params.set('upper', opts.useUpper ? '1' : '0');
    params.set('numbers', opts.useNumbers ? '1' : '0');
    params.set('simpleSymbols', opts.useSimpleSymbols ? '1' : '0');
    params.set('allSymbols', opts.useAllSymbols ? '1' : '0');
  } else {
    const opts = passphraseOptions;
    params.set('words', opts.words);
    params.set('sep', opts.separator);
    params.set('capitalize', opts.capitalize ? '1' : '0');
    if (opts.capitalize) params.set('capitalizePos', opts.capitalizePosition);
    params.set('addNumber', opts.addNumber ? '1' : '0');
    if (opts.addNumber) {
      params.set('numberPos', opts.numberPosition);
      if (opts.numberPosition !== 'random') params.set('numberWord', opts.numberWord);
    }
    params.set('addSymbol', opts.addSymbol ? '1' : '0');
    if (opts.addSymbol) {
      params.set('symbolPos', opts.symbolPosition);
      if (opts.symbolPosition !== 'random') params.set('symbolWord', opts.symbolWord);
    }
  }

  return params;
}

/**
 * Update browser URL without reload
 * @param {URLSearchParams} params
 */
export function updateBrowserUrl(params) {
  const newUrl = window.location.pathname + '?' + params.toString();
  window.history.replaceState({}, '', newUrl);
  return newUrl;
}
