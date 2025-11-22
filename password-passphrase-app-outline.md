# Password & Passphrase Generator Web App – Conversion Outline

## 1. Overview

This document describes the conversion of a basic password generator into a more fully featured **GitHub Pages–hosted web app** with:

- **Two modes**:
  - Password mode
  - Passphrase mode
- **Configurable options** for:
  - Password length and character sets
  - Passphrase word count and separators
- **API-like behaviour** via URL query parameters
- A clean, responsive, minimal UI suitable for embedding or standalone use

Target deployment: `https://<username>.github.io/<repo>/` or a custom domain such as `https://password.mkeeves.com`.

---

## 2. Goals & Requirements

### 2.1 Functional Goals

1. **Password generation**
   - User-selectable length (8–128).
   - Toggles for:
     - Lowercase letters (a–z)
     - Uppercase letters (A–Z)
     - Numbers (0–9)
     - Simple symbols (no “nasty” escape characters)
     - All symbols (full printable symbol set, overrides simple)
   - Ensure at least one character from each enabled character set.

2. **Passphrase generation**
   - User-selectable number of words (1–12, default ~4).
   - User-selectable separator:
     - `-`, `space`, `_`, `.`, or `none`.
   - Words drawn from a predefined wordlist (swap in larger lists later).

3. **Strength indication**
   - Password strength: simple heuristic based on length and character variety.
   - Passphrase strength: based on number of words.

4. **Copy to clipboard**
   - One-click copy of generated value.
   - Visual feedback after copying.

5. **API-like behaviour via query string**
   - Configure mode and options via URL parameters.
   - Optional “bare” mode (minimal UI – just the generated value).
   - Optional auto-generate on initial page load.

6. **Client-side only**
   - No backend component required.
   - Use the Web Crypto API (`crypto.getRandomValues`) for randomness.
   - No logging or transmission of generated values.

---

## 3. Architecture & Structure

### 3.1 File Layout

Repository root (simple variant):

- `index.html` – UI layout, inline CSS, `<script src="app.js">`.
- `app.js` – password/passphrase generation logic, URL parameter handling, DOM wiring.
- `README.md` – documentation for users/devs.
- Optional:
  - `CNAME` – for custom domain mapping (e.g. `password.mkeeves.com`).

Example:

```text
/
├─ index.html
├─ app.js
├─ README.md
└─ CNAME        # optional, only if using a custom domain
```

### 3.2 Technology Stack

- **Frontend only** (works on GitHub Pages):
  - HTML5
  - Vanilla JavaScript (no framework dependencies)
  - CSS (embedded in `<style>` inside `index.html`)

- **Randomness**
  - Web Crypto API: `crypto.getRandomValues` for cryptographically secure random numbers.

- **No build step required**
  - Static assets only.
  - Just commit and enable GitHub Pages.

### 3.3 Deployment Target

- Hosted via **GitHub Pages**, either:
  - Root of the repo (`main` branch → `/`), or
  - `/docs` folder mode, if preferred.

- Optionally fronted by a **custom domain**:
  - e.g. `password.mkeeves.com`.
  - Handled via DNS + GitHub Pages configuration + `CNAME` file.

---

## 4. UI Design

### 4.1 Layout

- **Header**
  - Title: “Password & Passphrase Generator”.
  - Subtitle: brief description (client-side, URL-configurable).

- **Mode toggle**
  - Two buttons in a segmented-control style:
    - “Password”
    - “Passphrase”
  - Clicking switches:
    - Visible options panel (password vs passphrase).
    - Internal `mode` state.

- **Controls section**
  - Contains two “cards”:
    - Password options card.
    - Passphrase options card.
  - Only one visible at a time based on active mode.

- **Actions**
  - `Generate` button.
  - `Copy` button.

- **Output card**
  - Output box (monospace) that displays the generated value.
  - Strength/feedback text below (e.g. “Strength: strong” or “Copied to clipboard ✓”).

### 4.2 Password Options UI

Fields:

- **Length**
  - Input type: `number`.
  - Range: `min=8`, `max=128`.
  - Default: `16`.

- **Character sets** (checkboxes):
  - Lowercase: `a–z` (default: checked).
  - Uppercase: `A–Z` (default: checked).
  - Numbers: `0–9` (default: checked).
  - Simple symbols (default: checked).
  - All symbols (default: unchecked).
    - When checked, this **overrides** simple symbols.

Hint text:

- Simple symbols avoid characters like:
  - Quotes, backslash, backtick, angle brackets, etc.
- All symbols use a larger set including most printable punctuation.

### 4.3 Passphrase Options UI

Fields:

- **Number of words**
  - Input type: `number`.
  - Range: `min=3`, `max=12` (or `1` to `12` if you want to allow shorter phrases).
  - Default: `4`.

- **Separator**
  - Input type: `select`.
  - Options:
    - `hyphen (-)`
    - `space`
    - `underscore (_)`
    - `dot (.)`
    - `none` (no separator, jam words together)

Hint text:

- Words are chosen using crypto-safe RNG from a built-in `WORDLIST`.
- You can later replace or extend `WORDLIST` with a larger EFF/Diceware list.

### 4.4 Bare Mode UI

- If `bare=1` query parameter is present:
  - Hide:
    - Header (title and subtitle).
    - Mode toggle.
    - Options cards (password and passphrase).
    - Action buttons (Generate, Copy).
  - Show:
    - Only the output text (styled minimally).
  - Typically combined with `auto=1` to generate immediately.

Use cases:

- Embedding in an `<iframe>` and controlling via URL.
- Simple copy-paste page with no distractions.
- “API-like” human view where the URL completely defines the output.

---

## 5. Behaviour & Logic

### 5.1 Random Number Generation

Helper function:

- `getRandomIntExclusive(max)`
  - Creates a `Uint32Array(1)`.
  - Calls `crypto.getRandomValues` to fill it.
  - Returns `array[0] % max` as a value from `0` to `max - 1`.
  - This is acceptable for:
    - Character set selection.
    - Wordlist selection.
    - (Assuming `max` is reasonably small, e.g. < 2³¹.)

### 5.2 Password Generation Flow

1. **Read UI/URL options**:
   - `length`
   - `useLower`, `useUpper`, `useNumbers`
   - `useSimpleSymbols`, `useAllSymbols`

2. **Combine character pool**:
   - Start with an empty string `pool = ""`.
   - Append:
     - `LOWER` if `useLower` is true.
     - `UPPER` if `useUpper` is true.
     - `NUMBERS` if `useNumbers` is true.
   - If `useAllSymbols`:
     - Append `ALL_SYMBOLS`.
   - Else if `useSimpleSymbols`:
     - Append `SIMPLE_SYMBOLS`.

3. **Validate**:
   - If `pool` is still empty:
     - Throw an error: “Select at least one character set.”

4. **Build required sets for policy**:
   - `requiredSets = []`.
   - Add each enabled individual set:
     - `LOWER`, `UPPER`, `NUMBERS`, and either `ALL_SYMBOLS` or `SIMPLE_SYMBOLS`.
   - This ensures at least one character from each enabled category.

5. **Generate characters**:
   - Start with `passwordChars = []`.
   - For each set in `requiredSets`:
     - Pick a random index via `getRandomIntExclusive(set.length)`.
     - Push that character into `passwordChars`.
   - For remaining positions (up to `length`):
     - Pick random characters from the full `pool`.

6. **Shuffle**:
   - Apply Fisher–Yates shuffle on `passwordChars`.
   - Ensures that “required” chars aren’t always at the start.

7. **Return result**:
   - Join `passwordChars` into a string.

### 5.3 Passphrase Generation Flow

1. **Read options**:
   - `words` (number of words).
   - `separator` (string or keyword).

2. **Resolve separator**:
   - If `separator` is:
     - `"space"` → set `sep = " "`.
     - `"none"` → set `sep = ""`.
     - `"-"`, `"_"`, `"."` → use as-is.
   - Else default (e.g. `"-"`).

3. **Choose words**:
   - Initialise `chosen = []`.
   - Loop `i = 0 .. words-1`:
     - `idx = getRandomIntExclusive(WORDLIST.length)`.
     - Push `WORDLIST[idx]` into `chosen`.

4. **Join**:
   - Return `chosen.join(sep)` as the passphrase.

### 5.4 Strength Estimation

#### 5.4.1 Password Strength

- Input: generated password string.
- Heuristic:
  - Start `variety = 0`.
  - If contains lowercase (`/[a-z]/`) → `variety++`.
  - If contains uppercase (`/[A-Z]/`) → `variety++`.
  - If contains digits (`/[0-9]/`) → `variety++`.
  - If contains non-alphanumeric (`/[^A-Za-z0-9]/`) → `variety++`.
- Compute `score = password.length * variety`.
- Map to label:
  - `score < 40` → “Strength: weak”.
  - `40 <= score < 80` → “Strength: okay”.
  - `score >= 80` → “Strength: strong”.

This isn’t full cryptographic analysis, but it’s a useful user-facing indicator.

#### 5.4.2 Passphrase Strength

- Input: `words` (word count).
- Rules:
  - `words < 3` → “Strength: weak (too few words)”.
  - `3 <= words < 5` → “Strength: okay”.
  - `words >= 5` → “Strength: strong”.

Again, heuristic; you could later compute approximate entropy from wordlist size.

### 5.5 Copy to Clipboard Behaviour

- When Copy is clicked:
  - Read the current `output` text.
  - If empty, do nothing.
  - Call `navigator.clipboard.writeText(value)`.
  - Temporarily change strength text to “Copied to clipboard ✓”.
  - After a short timeout (e.g. 1200 ms), restore the previous strength text.

### 5.6 Error Handling

- If generation fails (no charsets selected, etc.):
  - Clear `output`.
  - Display error message in the strength/feedback area (e.g. `err.message`).

---

## 6. URL Parameter “API”

### 6.1 General Parameters

- `mode=password | passphrase | phrase`
  - Default: `password`.
  - `passphrase` / `phrase` selects passphrase mode.

- `auto=1 | true | yes`
  - If “truthy”, auto-generate on load.
  - Default behaviour can be “auto” (generate on first load) if desired.

- `bare=1 | true | yes`
  - If truthy, enable bare mode (minimal UI).

### 6.2 Password Mode Parameters

- `length=<number>`
  - Clamped to `[8, 128]`.
  - Default: 16.

- `lower=<bool>`
- `upper=<bool>`
- `numbers=<bool>`
- `simpleSymbols=<bool>`
- `allSymbols=<bool>`

Boolean parsing convention:

- True if value is one of: `1`, `true`, `yes` (case-insensitive).
- False otherwise.

Defaults (if missing):

- `lower`: true
- `upper`: true
- `numbers`: true
- `simpleSymbols`: true
- `allSymbols`: false

Additional logic:

- If `allSymbols` parses as true, force `simpleSymbols` to false.

Example:

```text
?mode=password&length=24&lower=1&upper=1&numbers=1&simpleSymbols=1&auto=1
```

### 6.3 Passphrase Mode Parameters

- `words=<number>`
  - Clamped to `[1, 12]`.
  - Default: 4.

- `sep=<value>`
  - Allowed:
    - `-`
    - `space`
    - `_`
    - `.`
    - `none`
  - Extra:
    - `hyphen` could be mapped to `-`.

Example:

```text
?mode=passphrase&words=6&sep=-&auto=1
```

### 6.4 Bare Mode Examples

Bare password:

```text
?mode=password&length=20&numbers=1&simpleSymbols=0&auto=1&bare=1
```

Bare passphrase:

```text
?mode=passphrase&words=5&sep=space&auto=1&bare=1
```

---

## 7. GitHub Pages Setup

### 7.1 Create and Configure Repository

1. Create a new repository (e.g. `password` or `password-generator`).
2. Add files:
   - `index.html`
   - `app.js`
   - `README.md`
3. Commit and push to `main`.

### 7.2 Enable GitHub Pages

1. Go to **Settings → Pages** in the repo.
2. Set **Source** to:
   - `Deploy from a branch` → `main` branch → `/ (root)` (or `/docs` if you put the files there).
3. Save and wait for Pages to deploy.
4. Note the generated URL, e.g. `https://<username>.github.io/password/`.

### 7.3 Custom Domain (Optional)

1. Pick a domain or subdomain, e.g. `password.mkeeves.com`.
2. Add a DNS `CNAME` record pointing `password.mkeeves.com` to `<username>.github.io`.
3. In GitHub Pages settings:
   - Enter `password.mkeeves.com` as the custom domain.
4. Add a `CNAME` file to the repo root containing:
   - `password.mkeeves.com`

---

## 8. README.md Content Outline

`README.md` can include:

1. **Project Title & Description**
   - Short description of password & passphrase generator.
2. **Live Demo**
   - Link to GitHub Pages URL (and custom domain if applicable).
3. **Features**
   - Password mode, passphrase mode, simple vs all symbols, etc.
4. **Usage**
   - How to use the UI.
   - Explanation of strength indicator.
5. **URL Parameters**
   - Table or list explaining:
     - `mode`, `auto`, `bare`.
     - `length`, `lower`, `upper`, `numbers`, `simpleSymbols`, `allSymbols`.
     - `words`, `sep`.
   - Include sample URLs.
6. **Security Notes**
   - Client-side only, uses Web Crypto API.
   - No logging of generated values.
7. **Extending**
   - How to replace/extend `WORDLIST`.
   - Potential hooks for future backend/API implementations.

---

## 9. Future Enhancements

Potential upgrades for later iterations:

1. **Larger wordlist**
   - Move `WORDLIST` into a separate JS/JSON file.
   - Use Diceware/EFF lists for more entropy.
   - Show approximate bits of entropy.

2. **Generate multiple outputs**
   - Option `count` to generate N passwords/passphrases at once.
   - UI to display them in a list.
   - Export to CSV/JSON.

3. **Entropy display**
   - Display estimated entropy in bits for both:
     - Passwords (based on pool size and length).
     - Passphrases (based on log2(wordlist size) × word count).

4. **Theming / preferences**
   - Light/dark mode toggle beyond system `color-scheme`.
   - URL parameter or localStorage for preferred mode.

5. **True HTTP API**
   - Wrap the logic in:
     - Cloudflare Worker
     - Netlify/Vercel/Azure Function
   - Provide endpoints like:
     - `/api/password?length=32&lower=1&upper=1`
     - `/api/passphrase?words=5&sep=-`
   - Return JSON payloads suitable for curl/scripts.
