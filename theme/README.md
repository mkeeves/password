# Theme Toggle Module

A self-contained dark/light/auto theme switcher that can be dropped into any project.

## Features

- Light, Dark, and Auto (system preference) modes
- Persists preference via cookies
- Optional cross-subdomain cookie sharing
- System preference change detection
- Clean dropdown UI with smooth animations
- Zero dependencies

## Quick Start

### 1. Copy Files

Copy the `theme/` directory to your project:
```
theme/
├── theme.js    # JavaScript module
├── theme.css   # Styles
└── README.md   # This file
```

### 2. Add HTML

Add this markup to your page (typically before `</body>`):

```html
<div class="theme-dropdown">
  <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme menu">
    <span class="theme-icon"></span>
  </button>
  <div class="theme-menu" id="themeMenu">
    <button class="theme-option" data-theme="light">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      <span>Light</span>
    </button>
    <button class="theme-option" data-theme="dark">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <span>Dark</span>
    </button>
    <button class="theme-option" data-theme="auto">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/><path d="M12 6a6 6 0 0 1 0 12"/></svg>
      <span>Auto</span>
    </button>
  </div>
</div>
```

### 3. Include CSS

Add to your `<head>`:
```html
<link rel="stylesheet" href="theme/theme.css">
```

### 4. Initialize JavaScript

```html
<script type="module">
  import { initTheme } from './theme/theme.js';
  initTheme();
</script>
```

## Configuration

Pass options to `initTheme()`:

```javascript
initTheme({
  cookieName: 'my-theme-pref',     // Cookie name (default: 'theme-pref')
  cookieDomain: '.example.com',    // Share across subdomains (default: null)
  cookieDays: 365,                 // Cookie expiry (default: 365)
});
```

## Using Theme in Your CSS

The module sets `data-theme="light"` or `data-theme="dark"` on `<html>`. Use CSS variables:

```css
:root {
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}
```

## API

```javascript
import { initTheme, setTheme, getTheme } from './theme/theme.js';

// Initialize (call once on page load)
initTheme({ cookieDomain: '.example.com' });

// Programmatically set theme
setTheme('dark');   // 'light', 'dark', or 'auto'

// Get current preference
const pref = getTheme();  // Returns 'light', 'dark', or 'auto'
```

## Customization

### Different Position

Override in your CSS:
```css
.theme-dropdown {
  bottom: auto;
  top: 16px;
  right: 16px;
}
```

### Custom Selectors

If using different IDs/classes:
```javascript
initTheme({
  toggleSelector: '#myToggle',
  menuSelector: '#myMenu',
  optionSelector: '.my-option',
  iconSelector: '.my-icon',
  dropdownSelector: '.my-dropdown'
});
```

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6 module support
