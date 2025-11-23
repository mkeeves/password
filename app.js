// Password & Passphrase Generator
// Client-side only, uses Web Crypto API for secure randomness

(function() {
  'use strict';

  // ============================================
  // Character Sets
  // ============================================
  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const NUMBERS = '0123456789';
  // Simple symbols: excludes quotes, backslash, backtick, wildcards, shell/regex special chars
  const SIMPLE_SYMBOLS = '!@#$%^&()-_=+[]{}:;,.?';
  // All symbols: full printable ASCII punctuation
  const ALL_SYMBOLS = '!@#$%^&*()-_=+[]{}|;:\'",.<>?/`~\\';

  // ============================================
  // EFF Diceware Wordlist (7,776 words) - loaded from words.txt
  // ============================================
  let WORDLIST = [];

  async function loadWordlist() {
    try {
      const response = await fetch('words.txt');
      const text = await response.text();
      WORDLIST = text.trim().split('\n');
      console.log(`Loaded ${WORDLIST.length} words`);
    } catch (error) {
      console.error('Failed to load wordlist:', error);
    }
  }


  // ============================================
  // Cookie utilities (cross-subdomain theme)
  // ============================================
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    // Set cookie for .mkeeves.com to share across subdomains
    const domain = window.location.hostname.includes('mkeeves.com') 
      ? '; domain=.mkeeves.com' 
      : '';
    document.cookie = `${name}=${value}; expires=${expires}; path=/${domain}; SameSite=Lax`;
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  // ============================================
  // Theme management
  // ============================================
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getThemePreference() {
    return getCookie('mkeeves-theme-pref') || 'auto';
  }

  function getEffectiveTheme(preference) {
    if (preference === 'auto') {
      return getSystemTheme();
    }
    return preference;
  }

  function setTheme(preference) {
    const effective = getEffectiveTheme(preference);
    document.documentElement.setAttribute('data-theme', effective);
    setCookie('mkeeves-theme-pref', preference, 365);
    updateThemeIcon(effective);
    updateActiveOption(preference);
  }

  function updateThemeIcon(effectiveTheme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
      icon.innerHTML = effectiveTheme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    }
  }

  function updateActiveOption(preference) {
    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === preference);
    });
  }

  function toggleThemeMenu() {
    const menu = document.getElementById('themeMenu');
    menu.classList.toggle('open');
  }

  function closeThemeMenu() {
    const menu = document.getElementById('themeMenu');
    menu.classList.remove('open');
  }

  // ============================================
  // Random number generation (Web Crypto API)
  // ============================================
  function getRandomInt(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }

  // Fisher-Yates shuffle
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ============================================
  // Password generation
  // ============================================
  function generatePassword(options) {
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

  // ============================================
  // Passphrase generation
  // ============================================
  function generatePassphrase(options) {
    const { words } = options;

    // Generate new random words and store them
    passphraseState.words = [];
    for (let i = 0; i < words; i++) {
      passphraseState.words.push(WORDLIST[getRandomInt(WORDLIST.length)]);
    }

    // Generate number and symbol (will be used if options are enabled)
    passphraseState.number = getRandomInt(100);
    const symbols = '!@#$%^&*';
    passphraseState.symbol = symbols[getRandomInt(symbols.length)];

    return renderPassphrase(options);
  }

  function renderPassphrase(options) {
    const { separator, capitalize, capitalizePosition, addNumber, numberPosition, numberWord, addSymbol, symbolPosition, symbolWord } = options;

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

    // Helper to add extra to word(s)
    function addExtraToWords(words, extra, position, wordSelection) {
      if (position === 'random') {
        // Random: add to end of entire passphrase (handled separately)
        return { words, prefix: '', suffix: extra };
      }

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

      return { words: result, prefix: '', suffix: '' };
    }

    let finalWords = [...processedWords];
    let prefix = '';
    let suffix = '';

    // Add number
    if (addNumber && passphraseState.number !== null) {
      const num = String(passphraseState.number);
      if (numberPosition === 'random') {
        suffix += num;
      } else {
        const result = addExtraToWords(finalWords, num, numberPosition, numberWord);
        finalWords = result.words;
      }
    }

    // Add symbol
    if (addSymbol && passphraseState.symbol !== null) {
      if (symbolPosition === 'random') {
        suffix += passphraseState.symbol;
      } else {
        const result = addExtraToWords(finalWords, passphraseState.symbol, symbolPosition, symbolWord);
        finalWords = result.words;
      }
    }

    return prefix + finalWords.join(sep) + suffix;
  }

  function updatePassphraseDisplay() {
    if (passphraseState.words.length === 0) return;

    const options = getPassphraseOptions();

    // Handle word count changes
    while (passphraseState.words.length < options.words) {
      passphraseState.words.push(WORDLIST[getRandomInt(WORDLIST.length)]);
    }
    if (passphraseState.words.length > options.words) {
      passphraseState.words = passphraseState.words.slice(0, options.words);
    }

    const result = renderPassphrase(options);
    const output = document.getElementById('output');
    output.textContent = result;

    const strength = estimatePassphraseStrength(options.words);
    showFeedback(`Strength: ${strength.label} (${strength.entropy} bits)`);
    updateStrengthBar(strength.level);
    updateUrl();
  }

  // ============================================
  // Strength estimation (entropy in bits)
  // ============================================
  function estimatePasswordStrength(password) {
    // Calculate charset size based on character types present
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32; // Approximate symbol count

    // Entropy = length × log2(charset_size)
    const entropy = charsetSize > 0 ? Math.floor(password.length * Math.log2(charsetSize)) : 0;

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

  function estimatePassphraseStrength(wordCount) {
    // EFF Diceware: 7,776 words = ~12.9 bits per word
    const entropy = Math.floor(wordCount * 12.9);

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

  // ============================================
  // URL parameter parsing
  // ============================================
  function parseBoolean(value, defaultValue) {
    if (value === null || value === undefined) return defaultValue;
    const v = value.toLowerCase();
    return v === '1' || v === 'true' || v === 'yes';
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getUrlParams() {
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

  // ============================================
  // DOM management
  // ============================================
  let currentMode = 'password';
  let feedbackTimeout = null;

  // Store passphrase components for live updates
  let passphraseState = {
    words: [],      // Raw words (lowercase)
    number: null,   // Generated number (0-99)
    symbol: null    // Generated symbol
  };

  function getPasswordOptions() {
    return {
      length: clamp(parseInt(document.getElementById('length').value) || 16, 8, 128),
      useLower: document.getElementById('useLower').checked,
      useUpper: document.getElementById('useUpper').checked,
      useNumbers: document.getElementById('useNumbers').checked,
      useSimpleSymbols: document.getElementById('useSimpleSymbols').checked,
      useAllSymbols: document.getElementById('useAllSymbols').checked
    };
  }

  function getPassphraseOptions() {
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

  function setMode(mode) {
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

  function showFeedback(message, type = '') {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = 'feedback' + (type ? ' ' + type : '');

    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
      feedbackTimeout = null;
    }
  }

  function updateStrengthBar(level) {
    const bar = document.getElementById('strengthBar');
    bar.className = 'strength-bar-fill';
    if (level) {
      bar.classList.add(level);
    }
  }

  function updateUrl() {
    const params = new URLSearchParams();

    params.set('mode', currentMode);

    if (currentMode === 'password') {
      const opts = getPasswordOptions();
      params.set('length', opts.length);
      params.set('lower', opts.useLower ? '1' : '0');
      params.set('upper', opts.useUpper ? '1' : '0');
      params.set('numbers', opts.useNumbers ? '1' : '0');
      params.set('simpleSymbols', opts.useSimpleSymbols ? '1' : '0');
      params.set('allSymbols', opts.useAllSymbols ? '1' : '0');
    } else {
      const opts = getPassphraseOptions();
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

    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newUrl);

    // Update API URL display
    const apiUrlEl = document.getElementById('apiUrl');
    if (apiUrlEl) {
      apiUrlEl.textContent = window.location.origin + newUrl;
    }
  }

  function generate() {
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

  async function copyToClipboard() {
    const output = document.getElementById('output');
    const value = output.textContent;
    
    if (!value) {
      showFeedback('Nothing to copy', 'error');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(value);
      const previousFeedback = document.getElementById('feedback').textContent;
      showFeedback('Copied to clipboard ✓', 'success');
      
      feedbackTimeout = setTimeout(() => {
        showFeedback(previousFeedback);
      }, 1200);
    } catch (err) {
      showFeedback('Failed to copy', 'error');
    }
  }

  async function copyUrl() {
    const apiUrl = document.getElementById('apiUrl');
    const url = apiUrl ? apiUrl.textContent : window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      const previousFeedback = document.getElementById('feedback').textContent;
      showFeedback('URL copied ✓', 'success');

      feedbackTimeout = setTimeout(() => {
        showFeedback(previousFeedback);
      }, 1200);
    } catch (err) {
      showFeedback('Failed to copy URL', 'error');
    }
  }

  function applyUrlParams() {
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

  // ============================================
  // Initialization
  // ============================================
  async function init() {
    // Load wordlist first
    await loadWordlist();

    // Apply theme
    setTheme(getThemePreference());

    // Listen for system theme changes (for auto mode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const pref = getThemePreference();
      if (pref === 'auto') {
        setTheme('auto');
      }
    });

    // Event listeners
    document.getElementById('themeToggle').addEventListener('click', toggleThemeMenu);

    // Theme menu options
    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        setTheme(opt.dataset.theme);
        closeThemeMenu();
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.theme-dropdown')) {
        closeThemeMenu();
      }
    });

    document.getElementById('modePassword').addEventListener('click', () => setMode('password'));
    document.getElementById('modePassphrase').addEventListener('click', () => setMode('passphrase'));
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

    function updateNumberDropdowns() {
      const checked = document.getElementById('passphraseNumbers').checked;
      const pos = document.getElementById('numberPosition').value;
      document.getElementById('numberPosition').disabled = !checked;
      document.getElementById('numberWord').disabled = !checked || pos === 'random';
    }

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

    // Apply URL params and auto-generate if needed
    applyUrlParams();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
