# Password & Passphrase Generator

A secure, client-side password and passphrase generator. No backend, no logging, no data transmission.

**Live:** [password.mkeeves.com](https://password.mkeeves.com)

## Features

- **Password mode**: Configurable length (8-128) with selectable character sets
- **Passphrase mode**: 1-12 words from the EFF Diceware wordlist (7,776 words, ~12.9 bits entropy per word)
- **URL parameter API**: Configure and generate via query string
- **Bare mode**: Minimal UI for embedding
- **Dark mode**: Persists across mkeeves.com subdomains
- **Strength indicator**: Visual feedback on password/passphrase strength
- **Copy to clipboard**: One-click copy with confirmation

## Security

- **Client-side only**: All generation happens in your browser
- **Web Crypto API**: Uses `crypto.getRandomValues()` for cryptographically secure randomness
- **No logging**: Generated passwords are never transmitted or stored
- **EFF Diceware wordlist**: Industry-standard wordlist curated by the Electronic Frontier Foundation

## Usage

### Password Mode

Select character sets and length, then click Generate:

- **Lowercase (a-z)**: 26 characters
- **Uppercase (A-Z)**: 26 characters
- **Numbers (0-9)**: 10 characters
- **Simple symbols**: `!@#$%^&()-_=+[]{}:;,.?` (excludes quotes, backslash, wildcards)
- **All symbols**: Full printable punctuation set

Generated passwords always include at least one character from each selected set.

### Passphrase Mode

Select word count and separator:

- **Word count**: 1-12 words (default: 3)
- **Separators**: Hyphen, space, underscore, dot, or none

**Entropy guide:**
| Words | Bits of Entropy | Recommendation |
|-------|-----------------|----------------|
| 3     | ~38.7 bits      | Low security   |
| 4     | ~51.6 bits      | Moderate       |
| 5     | ~64.5 bits      | Good           |
| 6     | ~77.4 bits      | Strong         |
| 7+    | ~90+ bits       | Very strong    |

## URL Parameters

Configure the generator via query string for bookmarks, sharing, or embedding.

### General Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `mode` | `password`, `passphrase`, `phrase` | `password` | Generator mode |
| `auto` | `1`, `true`, `yes` | `true` | Auto-generate on page load |
| `bare` | `1`, `true`, `yes` | `false` | Minimal UI (output only) |

### Password Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `length` | `8`-`128` | `16` | Password length |
| `lower` | `1`/`0`, `true`/`false` | `true` | Include lowercase |
| `upper` | `1`/`0`, `true`/`false` | `true` | Include uppercase |
| `numbers` | `1`/`0`, `true`/`false` | `true` | Include numbers |
| `simpleSymbols` | `1`/`0`, `true`/`false` | `true` | Include simple symbols |
| `allSymbols` | `1`/`0`, `true`/`false` | `false` | Include all symbols (overrides simple) |

### Passphrase Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `words` | `1`-`12` | `3` | Number of words |
| `sep` | `-`, `space`, `_`, `.`, `none` | `-` | Word separator |

### Examples

**24-character password with all character types:**
```
?mode=password&length=24&allSymbols=1
```

**6-word passphrase with spaces:**
```
?mode=passphrase&words=6&sep=space
```

**Bare mode for embedding (passphrase, auto-generate):**
```
?mode=passphrase&words=5&bare=1&auto=1
```

**Alphanumeric only (no symbols):**
```
?mode=password&length=20&simpleSymbols=0
```

## Deployment

### GitHub Pages

1. Push to a GitHub repository
2. Go to **Settings > Pages**
3. Set source to `main` branch, `/ (root)`
4. Access at `https://<username>.github.io/<repo>/`

### Custom Domain

1. Add a `CNAME` file with your domain (e.g., `password.mkeeves.com`)
2. Configure DNS: `CNAME` record pointing to `<username>.github.io`
3. Enable HTTPS in GitHub Pages settings

## Development

No build step required. Just open `index.html` in a browser or serve with any static file server:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

## Files

```
/
├── index.html    # UI and styling
├── app.js        # Generation logic and EFF wordlist
├── README.md     # This file
└── CNAME         # Custom domain (optional)
```

## Credits

- [EFF Diceware Wordlist](https://www.eff.org/dice) - Electronic Frontier Foundation
- Web Crypto API for secure random number generation

## License

MIT
