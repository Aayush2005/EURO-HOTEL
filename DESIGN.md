# EURO HOTEL — Design System

Typography and color reference, extracted from `frontend/src/app/globals.css` and `frontend/src/app/layout.tsx`.

---

## Typography

Fonts are loaded two ways: **Playfair Display** + **Inter** via a Google Fonts `@import` in `globals.css`, and **Geist** / **Geist Mono** via `next/font` in `layout.tsx` (exposed as CSS variables).

| Role | Font | Weights | Where |
|------|------|---------|-------|
| **Headings / display** | `Playfair Display`, serif | 300, 400, 500, 600, 700 | `.font-serif` utility |
| **Body / UI / buttons** | `Inter`, system-ui, -apple-system, sans-serif | 300, 400, 500, 600 | `body` default, `.font-sans` |
| **Mono (available)** | `Geist Mono` | — | `--font-geist-mono` (via `next/font`) |
| **Geist Sans (available)** | `Geist` | — | `--font-geist-sans` (via `next/font`) |

**Base body:** `font-family: 'Inter', system-ui, -apple-system, sans-serif` on `<body>`.

**Buttons:** `Inter`, `font-weight: 600`, `letter-spacing: 0.5px`.

> Note: `Geist` / `Geist_Mono` are wired up as CSS variables on `<body>`, but the active body font is **Inter**. Geist is available if referenced explicitly.

### CSS font helpers
```css
.font-serif { font-family: 'Playfair Display', serif; }
.font-sans  { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
```

---

## Colors

### Core palette (CSS variables — `:root`)

| Token | Hex | Swatch | Usage |
|-------|-----|--------|-------|
| `--deep-navy` | `#0B1D3A` | ⬛ deep navy | Primary brand, page bg, navbar, overlays |
| `--gold-accent` | `#C9A227` | 🟨 muted gold | Accent (toast success icon, glows) |
| `--off-white` | `#F8F6F3` | ⬜ off-white | App background, cards |
| `--charcoal-text` | `#2C2C2C` | ⬛ charcoal | Primary text / foreground |
| `--muted-beige` | `#F0EDE8` | ⬜ beige | Borders, dividers |
| `--soft-gray` | `#D3D3D3` | ⬜ gray | Subtle/secondary gray |

Semantic aliases: `--background: var(--off-white)` · `--foreground: var(--charcoal-text)`.

### Tailwind theme tokens (`@theme inline`)
These expose the palette as Tailwind color utilities (e.g. `bg-navy`, `text-gold`, `bg-off-white`):

| Utility name | Maps to |
|--------------|---------|
| `background` | `--off-white` |
| `foreground` | `--charcoal-text` |
| `navy` | `#0B1D3A` |
| `gold` | `#C9A227` |
| `off-white` | `#F8F6F3` |
| `charcoal` | `#2C2C2C` |
| `beige` | `#F0EDE8` |
| `gray` | `#D3D3D3` |

### Button gold (⚠️ differs from the gold token)
The gold buttons use **Tailwind yellow**, *not* `--gold-accent`:

| Element | Color |
|---------|-------|
| `.btn-gold` background | `#eab308` (yellow-500) |
| `.btn-gold:hover` background | `#ca8a04` (yellow-600) |
| `.btn-gold` text / `.btn-outline-gold:hover` text | `#0B1D3A` (navy) |

> Inconsistency worth noting: the accent token is `#C9A227`, but buttons render `#eab308`. Consider unifying to one gold.

### Accent / state colors

| Color | Hex | Usage |
|-------|-----|-------|
| Bright gold | `#FFD700` | Sparkle / highlight effects |
| Orange | `#FFA500` | Sparkle / highlight effects |
| Error red | `#ef4444` | Toast error icon |
| Loading gradient mid | `#1a2f4a` | `.loading-gradient` (navy gradient stop) |

### Common transparent / overlay values (rgba)

| rgba | Usage |
|------|-------|
| `rgba(11, 29, 58, 0.6 → 0.8)` | Hero / gradient overlays (`.bg-gradient-overlay`) |
| `rgba(11, 29, 58, 0.95)` / `0.98` | Solid navbar background |
| `rgba(11, 29, 58, 0.8)` | Modal backdrops (auth / profile) |
| `rgba(11, 29, 58, 0.1 → 0.15)` | Premium card shadows |
| `rgba(201, 162, 39, 0.2)` | Navbar bottom border (gold) |
| `rgba(201, 162, 39, 0.6)` | Progress / gold glow |
| `rgba(234, 179, 8, 0.3)` | Gold button hover shadow |
| `rgba(255, 215, 0, 0.4)` | Gold sparkle glow |
| `rgba(0, 0, 0, 0.3 → 0.8)` | Text shadows / drop shadows |

---

## Notable component styles
- **`.premium-card`** — off-white bg, beige border, `0 4px 20px rgba(11,29,58,0.1)` shadow, lifts on hover.
- **`.navbar-transparent` / `.navbar-solid`** — transparent → `rgba(11,29,58,0.95)` + `blur(10px)` + gold border on scroll.
- **`.loading-gradient`** — `linear-gradient(135deg, #0B1D3A, #1a2f4a, #0B1D3A)`.
- **Container:** `max-width: 1200px`, centered.

### Z-index scale
`modal-backdrop: 99997` · `modal: 99998` · `auth/profile modals: 99999` · `loading: 100001` · `toast: 100002`.

---

*Source of truth: `frontend/src/app/globals.css`. Update this doc if the palette or fonts change.*
