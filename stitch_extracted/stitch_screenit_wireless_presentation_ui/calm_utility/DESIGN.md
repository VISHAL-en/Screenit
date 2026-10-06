---
name: Calm Utility
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#7f2500'
  on-tertiary: '#ffffff'
  tertiary-container: '#a73400'
  on-tertiary-container: '#ffc9b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832700'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-room-code:
    fontFamily: JetBrains Mono
    fontSize: 72px
    fontWeight: '600'
    lineHeight: 80px
    letterSpacing: 0.15em
  display-room-code-mobile:
    fontFamily: JetBrains Mono
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: 0.12em
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is engineered for zero-friction collaborative environments: boardrooms, lecture halls, seminar spaces, and agile meeting suites. In high-stakes presentation spaces, technology must step backward, yielding absolute focus to content and presenter confidence.

The design philosophy combines **Swiss precision minimalism** with **functional enterprise utility**:
- **Presence**: Calm, quiet, and unobtrusive. The interface remains invisible until summoned.
- **Cognitive Clarity**: Information is organized strictly by proximity and visual hierarchy. Critical setup data (such as pairing PINs, Wi-Fi networks, and active presenter states) are instantly readable from 10 to 30 feet across a room.
- **Restraint**: Zero decorative noise, zero neon artifacts, and no gratuitous frosted-glass blurs. Surfaces rely on structured layout grids, subtle 1px dividers, and crisp borders.
- **Affordance**: Pure tactile reassurance. Every interactive element features sharp, decisive micro-interactions with immediate visual feedback for connection, streaming states, and device security.

## Colors

The palette is rooted in an architectural slate spectrum, accented by a single high-integrity cobalt tone.

- **Background Canvas (`#F8FAFC`)**: A calm, low-glare foundation optimized for large-format displays, high-lumen projectors, and individual laptop or tablet controllers without causing visual fatigue.
- **Surface Elevation (`#FFFFFF`)**: Pure white containers layered directly above the canvas to designate active cards, control clusters, and dialogs.
- **Primary Cobalt (`#1D4ED8`)**: Used with extreme discipline. Reserved strictly for primary callouts, active casting indicators, verified network badges, and key confirmation actions.
- **Text & Hierarchy**:
  - Primary Content / Codes: `#0F172A` (Slate 900) — high-contrast, maximum legibility.
  - Secondary Guidance / Metadata: `#475569` (Slate 600) — contextual notes, room IDs, and instructions.
  - Tertiary / Inactive: `#94A3B8` (Slate 400) — placeholders, inactive states, and unselected devices.
- **Borders & Dividers (`#E2E8F0`)**: Hairline 1px structural outlines that construct clear layout geometry without adding visual mass.
- **Functional Semantics**:
  - Positive / Connected: `#059669` (Emerald 600) paired with `#ECFDF5` container.
  - Attention / Reconnecting: `#D97706` (Amber 600) paired with `#FFFBEB` container.
  - Critical / Terminated: `#DC2626` (Red 600) paired with `#FEF2F2` container.

## Typography

Typography prioritizes rapid distance scanning and immediate alphanumeric parsing.

- **Primary Typeface (`Hanken Grotesk`)**: Provides geometric clarity and neutral balance. Its tall x-height and open apertures guarantee reading comfort across presenter status panels, room schedules, and multi-device connection lists.
- **Monospace Technical Typeface (`JetBrains Mono`)**: Applied to all 4-digit pairing codes, IP addresses, network names (SSID), and security credentials. It enforces tabular figures (`font-variant-numeric: tabular-nums`) so numbers do not jump or shift when timers increment or credentials rotate.
- **Scale Behavior**:
  - `display-room-code`: Sized for wall-mounted TV panels and room monitors to allow immediate pairing from the back row.
  - `label-caps`: Rendered in all-caps for metadata headers (`ROOM STATUS`, `SECURITY KEY`, `RESOLUTON`) to cleanly group parameters without adding heavy borders.

## Layout & Spacing

The layout is built on an uncompromising 8-point base rhythm, operating across three canonical screen archetypes:

1. **Large Format Display (TV / Projector 1080p to 4K)**:
   - Fixed, centered dashboard canvas (max-width `1280px` or `1440px`).
   - Symmetrical splits: Primary instruction & pairing pillar on one side, secondary attendee grid or room telemetry on the other.
   - Generous margins (`margin`: `2.5rem` to `4rem`) prevent content clipping on display bezels.

2. **Personal Controller (Laptop / Tablet Web Client)**:
   - 12-column grid layout with `1.5rem` gutters.
   - Split-pane layout: Master room sidebar (left) with active stream canvas / presenter queue (center and right).

3. **Mobile Presenter (Handheld / Quick Connect)**:
   - Single vertical stack with edge-to-edge touch boundaries and sticky bottom action bar.
   - Gutter set to `1rem` and canvas margin to `1rem` for maximum usable real estate.

Spacing distances are functional: `space-xs` and `space-sm` bind micro-labels to values; `space-md` separates stacked items inside cards; `space-lg` and `space-xl` cleanly delineate independent functional panels.

## Elevation & Depth

To maintain visual purity and prevent screen muddiness in ambient-lit rooms, this design system minimizes heavy drop shadows in favor of **structural containment and tonal hierarchy**:

- **Level 0 (Canvas Base)**: `#F8FAFC`. Zero elevation.
- **Level 1 (Card & Modular Modules)**: Surface `#FFFFFF` enclosed by a crisp `1px solid #E2E8F0` border. No drop shadow is used by default. Depth is conveyed strictly by the contrast between white and the slate background.
- **Level 2 (Active Presenter Tile / Hover State)**: `#FFFFFF` surface with an upgraded border (`#CBD5E1`) and a subtle ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Overlays, Floating Control HUDs, Dropdowns)**: `#FFFFFF` surface, `1px solid #E2E8F0`, accompanied by a refined directional elevation: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.
- **Level 4 (Modals & PIN Prompt Dialogs)**: Centered above an intentional backdrop overlay (`rgba(15, 23, 42, 0.4)` with `backdrop-filter: blur(2px)`). Modals carry `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The design adopts a **Soft (Level 1)** geometric standard. This geometry produces a structured, professional, precision-instrument feel, avoiding overly playful or child-like pill forms on core containers.

- **Base Radius (`0.25rem` / `4px`)**: Buttons, text input cells, tabular data rows, and segmented switch items.
- **Container Radius (`0.5rem` / `8px`)**: Surface cards, pairing status boxes, and device list containers.
- **Modal Radius (`0.75rem` / `12px`)**: Overlay dialogs and system alert panels.
- **Pill Exception (`9999px`)**: Reserved exclusively for compact status tags (e.g., `SHARING`, `HOST`, `MUTED`), active participant counters, and PIN entry character slot indicators.

## Components

### Buttons
- **Primary**: Solid `#1D4ED8` background, `#FFFFFF` text, `4px` border radius, `0 1px 2px rgba(29, 78, 216, 0.2)` shadow. Hover transitions to `#1E40AF`. Active transitions to `#1E3A8A`.
- **Secondary / Neutral**: Pure `#FFFFFF` background, `1px solid #E2E8F0` border, `#0F172A` text. Hover shifts background to `#F8FAFC` and border to `#CBD5E1`.
- **Danger (Disconnect / End Session)**: Subtle `#FEF2F2` background, `1px solid #FECACA`, text `#DC2626`. Hover: `#FEE2E2`.

### 4-Digit Code Block (Pairing PIN)
- Four individual monospace digit tiles rendered at `display-room-code` typography.
- Dimensions: `64px x 80px` (or `48px x 64px` on mobile), background `#FFFFFF`, border `1px solid #CBD5E1`, with subtle inset focus when typing: `ring 2px #1D4ED8`.

### Status Badges & Pills
- Pill-shaped (`rounded-full`), padding `2px 8px`, typography `label-caps`.
- **Active Streaming**: Background `#EFF6FF`, border `1px solid #BFDBFE`, text `#1D4ED8`, accompanied by a solid `6px` pulsing dot.
- **Ready / Idle**: Background `#ECFDF5`, border `1px solid #A7F3D0`, text `#059669`.
- **Offline / Protected**: Background `#F1F5F9`, border `1px solid #E2E8F0`, text `#64748B`.

### Input Fields
- Monospace or sans-serif single-line inputs with `#FFFFFF` fill and a crisp `1px solid #CBD5E1` border.
- Focus state: `outline: none`, `border-color: #1D4ED8`, `box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.12)`.
- Helper labels sit `4px` above the input in `body-sm` (`#475569`).

### Device & Attendee Lists
- Structured rows separated by `1px solid #F1F5F9`.
- Each row contains: device type icon (`16px`, `#64748B`), device name in `body-md` (`#0F172A`), connection quality indicator (tabular latency in ms), and a discrete overflow action button.

### Presentation Cards
- Pure `#FFFFFF` body, `1px solid #E2E8F0` border, `8px` corner radius.
- Padding: `space-lg` (`1.5rem`).
- Header includes category label in `label-caps` (`#64748B`) followed by an uncluttered action or status indicator.

### Floating Session Bar (Presenter HUD)
- Anchored to bottom-center of the screen during an active session.
- Background: `#0F172A` (dark slate contrast against light screen content), border `1px solid #334155`, padding `8px 16px`, pill shape.
- Houses session controls: `Pause Stream`, `Mute Audio`, `Hand Over Control`, and `Disconnect`.