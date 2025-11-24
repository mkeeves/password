// Main entry point
// Password & Passphrase Generator
// Client-side only, uses Web Crypto API for secure randomness

import { loadWordlist } from './passphrase.js';
import { initTheme } from '../theme/theme.js';
import { initUI, applyUrlParams } from './ui.js';

/**
 * Initialize the application
 */
async function init() {
  try {
    // Load wordlist first
    await loadWordlist();

    // Initialize theme with mkeeves.com cross-subdomain config
    const domain = window.location.hostname.includes('mkeeves.com') ? '.mkeeves.com' : null;
    initTheme({
      cookieName: 'mkeeves-theme-pref',
      cookieDomain: domain
    });

    // Initialize UI event listeners
    initUI();

    // Apply URL params and generate
    applyUrlParams();
  } catch (error) {
    // Show error to user if wordlist fails to load
    const output = document.getElementById('output');
    const feedback = document.getElementById('feedback');
    if (output) output.textContent = '';
    if (feedback) {
      feedback.textContent = error.message || 'Failed to initialize';
      feedback.className = 'feedback error';
    }
    console.error('Initialization error:', error);
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
