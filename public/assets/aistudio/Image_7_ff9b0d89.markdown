---
name: Cyberpunk Quest HUD
colors:
  surface: '#171022'
  surface-dim: '#171022'
  surface-bright: '#3d364a'
  surface-container-lowest: '#110b1c'
  surface-container-low: '#1f182b'
  surface-container: '#231c2f'
  surface-container-high: '#2e273a'
  surface-container-highest: '#393145'
  on-surface: '#eadef8'
  on-surface-variant: '#e2bdc7'
  inverse-surface: '#eadef8'
  inverse-on-surface: '#342d40'
  outline: '#a98891'
  outline-variant: '#5a3f48'
  surface-tint: '#ffb0c9'
  primary: '#ffb0c9'
  on-primary: '#640034'
  primary-container: '#ff4799'
  on-primary-container: '#58002d'
  inverse-primary: '#b90066'
  secondary: '#ffdb9d'
  on-secondary: '#412d00'
  secondary-container: '#feb700'
  on-secondary-container: '#6b4b00'
  tertiary: '#fbabff'
  on-tertiary: '#580065'
  tertiary-container: '#e14ef6'
  on-tertiary-container: '#4d0059'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd9e3'
  primary-fixed-dim: '#ffb0c9'
  on-primary-fixed: '#3e001e'
  on-primary-fixed-variant: '#8e004c'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#ffba20'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#ffd6fd'
  tertiary-fixed-dim: '#fbabff'
  on-tertiary-fixed: '#36003e'
  on-tertiary-fixed-variant: '#7c008e'
  background: '#171022'
  on-background: '#eadef8'
  surface-variant: '#393145'
typography:
  display-hero:
    fontFamily: Syne
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Syne
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Syne
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Syne
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Syne
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Syne
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.08em
  label-mono-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.12em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

## Brand & Style

This design system targets next-generation Web3 builders, protocol engineers, and crypto-native developers. It evokes high adrenaline, technological mastery, and elite guild prestige. The interface bridges an immersive cyberpunk terminal aesthetic with high-precision enterprise developer tooling.

The visual style blends **Cyberpunk HUD Glassmorphism** with **Technical Minimalism**:
- **Atmosphere:** Deep void purples layered beneath luminous magenta data grids, creating a digital neon underworld.
- **Accents:** High-voltage neon pinks, cybernetic ambers, and subtle translucent violet perimeter borders.
- **Tone:** Authoritative, cryptographic, futuristic, and rewarding. The UI treats developer activity, deployments, and quest completion as high-stakes on-chain achievements.

## Colors

The palette is engineered exclusively for an OLED dark environment with high visual hierarchy:

- **Base Canvas & Void Surfaces:**
  - Background Base: `#090414` (ultra-deep midnight violet void)
  - Surface Glass (Tier 1): `#12072B` with 70–80% opacity
  - Elevated Container (Tier 2): `#1B0C3A` with 85% opacity
  - High Surface (Hover / Active): `#25124D`

- **Primary Interactive (Electric Magenta):** `#FF2E93` (core interactive actions, hero glow, primary quest vectors), supported by `#E0247D` (deep press) and `#D946EF` (secondary neon highlights and subtle gradients).
- **Secondary Accent (Cyber Amber):** `#FFB800` (wallet connection, XP highlights, achievement badges, and warning states) with glowing warmth `#FBBF24`.
- **Borders & Grid Lines:** Semi-transparent cyan-tinted violets (`rgba(217, 70, 239, 0.15)` to `rgba(99, 102, 241, 0.3)`) providing crisp architectural edges without overpowering content.
- **Text & Data:** 
  - Pure High-Contrast: `#FFFFFF` (headings, key metrics, active tabs)
  - Muted Technical White: `#C4B5FD` (subtitles, meta descriptions)
  - Dim Terminal Gray: `#6D5A8C` (step counters, grid lines, disabled states)

## Typography

The typographic hierarchy utilizes three specialized typefaces:
- **Display & Headings (Syne):** Hyper-modern, geometric, and aggressive with tight tracking. Syne drives the quest titles, hero messages, and level numbers.
- **Core Interface & Reading (Inter):** Highly legible, neutral, and clean. Used across descriptions, project cards, guides, and conversational text.
- **Terminal & Telemetry (JetBrains Mono):** Technical, uppercase-heavy, monospaced metadata used for tags, breadcrumbs, step numbers (`01`, `02`), transaction hashes, and wallet balances. Always letter-spaced generously to emulate tactical military/cyber interfaces.

## Layout & Spacing

The layout is built upon a 12-column responsive fluid grid designed to frame wide desktop screens like a command dashboard:
- **Desktop (>=1280px):** 12 columns, 1.5rem (24px) gutters, 3rem (48px) margins. Quest cards naturally fit into 3-column (4-up) or 4-column (3-up) layouts.
- **Tablet (768px - 1279px):** 6-8 columns, 1rem (16px) gutters, 2rem (32px) margins. Cards fold to 2-up grids.
- **Mobile (<768px):** 4 columns, 0.75rem (12px) gutters, 1.25rem (20px) margins. Content stacks vertically with full-width horizontal swipe support for badge matrices.

Rhythm is maintained through a 4px/8px modular base scale, allowing dense telemetry arrays while reserving large negative voids around display titles.

## Elevation & Depth

Visual hierarchy uses frosted glass and colored ambient bioluminescence rather than standard drop shadows:

- **Surface 0 (Canvas):** Pure `#090414` layered beneath parametric background textures (such as repeating dotted matrix LEDs and ambient pink/purple radial gradients).
- **Surface 1 (HUD Glass Panels):** `#12072B` at 70% opacity, layered with `backdrop-filter: blur(16px)` and a 1px perimeter border of `rgba(217, 70, 239, 0.2)`.
- **Surface 2 (Elevated Quest Cards):** `#1B0C3A` at 85% opacity, `backdrop-filter: blur(24px)`. Hovering triggers a subtle neon bloom: `box-shadow: 0 0 24px -4px rgba(255, 46, 147, 0.25), inset 0 0 12px rgba(255, 46, 147, 0.1)`.
- **Surface 3 (Primary Callouts & Connect Modals):** Accent-driven illumination. For gold/amber components, a radiant gold bloom: `box-shadow: 0 0 30px rgba(255, 184, 0, 0.35)`.
- **Cut Corners & Chamfers:** HUD panels can utilize diagonal chamfered cut-out accents on corner nodes to evoke hardware circuit architecture.

## Shapes

The design uses a refined balance of controlled rounded rectangles paired with geometric corner cuts:
- **Default Elements:** 0.5rem (8px) border-radius for badges, inputs, and standard panels, avoiding overly playful bubbly curves while preventing harsh brutalist edges.
- **Cards & Containers:** `rounded-lg` (1rem / 16px) for quest cards and dashboard blocks, creating framing that fits sleek glass hardware.
- **Action Pills:** Full pill-shapes (`rounded-full`) reserved strictly for high-visibility telemetry tags, notification count pills, and the wallet connection CTA to distinguish action states from informational panels.

## Components

### Buttons & Interactive Controls
- **Primary CTA (Wallet Connect / Action):** High-voltage amber background (`#FFB800`) with pitch black bold text (`#090414`), accompanied by glowing golden ambient halos (`box-shadow: 0 0 20px rgba(255, 184, 0, 0.4)`).
- **Secondary Ghost Action:** Transparent dark purple glass fill with a 1px border of `rgba(255, 46, 147, 0.4)`. Text in white with hover transitions that shift border and glow to pure `#FF2E93`.
- **Icon / Step Forward Buttons:** Circular or rounded square glass nodes enclosing neon arrows (`→`) that translate 3px horizontally on hover.

### Quest & Module Cards
- Built with 16px border-radius, dark violet translucent glass fill, and delicate 1px neon borders.
- Include large muted watermark step counters (`01`, `02`, `03`) set in `JetBrains Mono` at low opacity (15-20%) positioned in the upper right.
- Featured icons are housed in recessed square frames with rounded corners and glowing monochromatic backgrounds (e.g., neon purple or amber glyph badges).

### Technical Badges & Status Indicators
- **Category Chips:** Set in `JetBrains Mono`, uppercase, letter-spaced, encased in semi-transparent pill outlines with tiny 4px circular glowing LEDs indicating network status (e.g., green for mainnet, magenta for testnet, amber for pending quest).
- **XP / Reward Badges:** Golden/amber pill labels featuring coin or star iconography alongside numerical token metrics.

### Input Fields & Terminal Prompts
- Deep inset violet background (`#0D051E`) with a 1px muted border (`rgba(217, 70, 239, 0.2)`).
- Active/focused state: Border ignites to `#FF2E93` with an outer pink halo.
- Text: Crisp white typography with placeholder text set in muted purple (`#6D5A8C`).

### Checkboxes & Radios
- Square 18px boxes with 4px corner rounding. Unchecked state uses a 1px boundary of `rgba(196, 181, 253, 0.3)`. Checked state displays a solid `#FF2E93` fill with a sharp white checkmark glyph and a 6px neon drop shadow.