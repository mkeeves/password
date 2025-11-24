/**
 * Theme Toggle Module
 * A self-contained dark/light/auto theme switcher
 *
 * Usage:
 *   import { initTheme } from './theme/theme.js';
 *   initTheme({ cookieDomain: '.example.com' });
 *
 * Or with script tag:
 *   <script type="module">
 *     import { initTheme } from './theme/theme.js';
 *     initTheme();
 *   </script>
 */

// ============================================
// Configuration
// ============================================
const DEFAULT_CONFIG = {
  cookieName: 'theme-pref',
  cookieDomain: null,  // Set to '.example.com' to share across subdomains
  cookieDays: 365,
  toggleSelector: '#themeToggle',
  menuSelector: '#themeMenu',
  optionSelector: '.theme-option',
  iconSelector: '.theme-icon',
  dropdownSelector: '.theme-dropdown'
};

let config = { ...DEFAULT_CONFIG };

// ============================================
// SVG Icons
// ============================================
const ICONS = {
  sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
};

// ============================================
// Cookie Utilities
// ============================================
function setCookie(name, value, days, domain) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const domainStr = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=${value}; expires=${expires}; path=/${domainStr}; SameSite=Lax`;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// ============================================
// Theme Logic
// ============================================
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getThemePreference() {
  return getCookie(config.cookieName) || 'auto';
}

function getEffectiveTheme(preference) {
  return preference === 'auto' ? getSystemTheme() : preference;
}

function updateThemeIcon(effectiveTheme) {
  const icon = document.querySelector(config.iconSelector);
  if (icon) {
    icon.innerHTML = effectiveTheme === 'dark' ? ICONS.moon : ICONS.sun;
  }
}

function updateActiveOption(preference) {
  document.querySelectorAll(config.optionSelector).forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === preference);
  });
}

/**
 * Set the theme
 * @param {'light'|'dark'|'auto'} preference
 */
export function setTheme(preference) {
  const effective = getEffectiveTheme(preference);
  document.documentElement.setAttribute('data-theme', effective);
  setCookie(config.cookieName, preference, config.cookieDays, config.cookieDomain);
  updateThemeIcon(effective);
  updateActiveOption(preference);
}

/**
 * Get current theme preference
 * @returns {'light'|'dark'|'auto'}
 */
export function getTheme() {
  return getThemePreference();
}

/**
 * Toggle theme menu visibility
 */
export function toggleThemeMenu() {
  const menu = document.querySelector(config.menuSelector);
  if (menu) menu.classList.toggle('open');
}

/**
 * Close theme menu
 */
export function closeThemeMenu() {
  const menu = document.querySelector(config.menuSelector);
  if (menu) menu.classList.remove('open');
}

/**
 * Initialize theme system
 * @param {Object} options - Configuration options
 * @param {string} options.cookieName - Cookie name (default: 'theme-pref')
 * @param {string} options.cookieDomain - Cookie domain for cross-subdomain (default: null)
 * @param {number} options.cookieDays - Cookie expiry in days (default: 365)
 */
export function initTheme(options = {}) {
  // Merge options with defaults
  config = { ...DEFAULT_CONFIG, ...options };

  // Apply saved theme
  setTheme(getThemePreference());

  // Listen for system theme changes (for auto mode)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePreference() === 'auto') {
      setTheme('auto');
    }
  });

  // Theme toggle button
  const toggle = document.querySelector(config.toggleSelector);
  if (toggle) {
    toggle.addEventListener('click', toggleThemeMenu);
  }

  // Theme menu options
  document.querySelectorAll(config.optionSelector).forEach(opt => {
    opt.addEventListener('click', () => {
      setTheme(opt.dataset.theme);
      closeThemeMenu();
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest(config.dropdownSelector)) {
      closeThemeMenu();
    }
  });
}

// Auto-init if data attribute present
if (document.currentScript?.dataset.autoInit !== undefined) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initTheme());
  } else {
    initTheme();
  }
}
