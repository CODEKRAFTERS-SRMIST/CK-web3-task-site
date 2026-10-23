# Implementation Plan: WebGL Micro-Slats Background & Screen Streamlining

## Title & Summary
Refactor the CodeKrafters application to bring the signature WebGL micro-slats wave background fully forward into view with live mouse ripple harmonics, remove the quests view, eliminate extraneous top-bar nav links (Home, Quests, Passport) to strictly match the reference header, and support seamless toggling between the Landing Page and the Join Builder Network screen.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed by the user in Phase 1:
> - **WebGL Micro-Slats Background**: Fix the WebGL canvas stacking order, viewport sizing, and shader parameters so the animated micro-slats wave with mouse ripple interaction is vibrant and visible behind the frosted glass interface.
> - **Top Bar Cleanliness**: Remove the `HOME`, `QUESTS`, and `PASSPORT` text tabs from the header. The header strictly follows the reference: Brand Logo `[CK] CODEKRAFTERS` on the left, and on the right: wallet connection status, `[BUILDER NETWORK]` CTA, and user profile avatar.
> - **Page Scope**: Completely eliminate the Quests page and its sub-views. The application focuses exclusively on the two core screens requested:
>   1. **Landing Page** (`Image 1`): Display hero, 4 holographic HUD cards, prompt banner with `[CONNECT WALLET]` CTA, and bottom telemetry ribbon.
>   2. **Join the Builder Network** (`Image 5`): 3-step wizard with live real-time Soulbound Passport card preview, handle validation, guild tier selection, wallet connection grid, and GitHub/Discord handshake.
>   3. **Connect Wallet Modal** (`Image 3 & 4`): Direct overlay/modal with EIP-1193 Gateway v2.4, 3 simulation states (Provider Pick, Awaiting Sign, Authenticated dashboard).

---

## 1. Overview & Core Concept

CodeKrafters is a specialized Web3 developer guild platform designed for campus clubs, student engineers, and protocol contributors to mint on-chain builder identities and connect developer tooling.

By fixing the WebGL micro-slats canvas visibility and removing auxiliary pages, the app delivers a focused, 1:1 match with the provided visual references:
- **Atmospheric Visual Depth**: The micro-slats wave shader oscillates with neon magenta (`#ff1a8c`) and glint amber (`#ff8703`) highlights, rippling under mouse movement.
- **Direct Navigation**: Clicking `[BUILDER NETWORK]` or the cards seamlessly transitions between the Landing Page and the On-Chain Passport Minting flow, while `[CONNECT WALLET]` opens the modal gateway.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Landing Page (`Image 1`)**:
   - The user experiences the full-screen animated micro-slats wave canvas beneath the deep purple void (`#090414`).
   - The hero section displays the bold geometric typography: *"Build, Learn and Lead in the Web3 World."*
   - Four holographic HUD cards (`01 On-Chain Quests`, `02 Earn & Level Up`, `03 Showcase Your Work`, `04 Join the Community`).
   - Cards 1 & 2 link directly to wallet verification / identity setup; Cards 3 & 4 navigate to Join Builder Network.
   - The bottom prompt bar provides the golden `[CONNECT WALLET]` CTA.
2. **Connect Wallet Gateway Modal (`Image 3 & 4`)**:
   - Opened via `[CONNECT WALLET]` on the landing banner or the top-bar wallet trigger.
   - Includes the glowing hexagonal node, EIP-1193 status, 3 tabs (Provider Pick, Awaiting Sign, Authenticated), and real-time approval simulation.
3. **Join Builder Network Screen (`Image 5`)**:
   - Reached via `[BUILDER NETWORK]` top button or `[ENTER BUILDER NETWORK]`.
   - Top bar displays `<- BACK TO HOME` and `STEP 01 / 03 • BUILDER IDENTITY [33%]`.
   - Left column features real-time editable `@ satoshi.eth` input, 3 affiliation cards (*Club Member*, *Campus Lead*, *Core Dev*), 4 wallet status cards, and GitHub/Discord integration.
   - Right column displays the live updating Soulbound Passport NFT Card with animated protocol hash ECG waveform, dynamic XP counter, and university chapter auto-detection.

### Visual Identity & Theme
- **Background**: Ambient WebGL canvas positioned at `z-0` with no opaque CSS backgrounds occluding it; dark vignette overlays maintain high readability for text.
- **Top Bar Contract**: Strict 1-row layout:
  - Left Zone: `[CK]` hex badge + `CODEKRAFTERS` title.
  - Center: Clean empty breathing space (zero pill clutter, no text tabs).
  - Right Zone: Wallet status + `[BUILDER NETWORK]` gold CTA + circular avatar icon.
- **Palette**: Deep void violet (`#090414`), electric neon pink (`#ff4799` / `#ff1a8c`), cyber amber (`#feb700` / `#ffb800`), muted lavender (`#eadef8` / `#e2bdc7`).

---

## 3. Key Product Decisions & Trade-Offs

- **WebGL Canvas Stacking Fix**:
  - *Decision*: Set the canvas container to `fixed inset-0 z-0 pointer-events-none` and set all app layout layers to `relative z-10 bg-transparent` (removing solid `bg-[#090414]` that was masking the canvas).
  - *Why*: The previous implementation had a background color on the root div and body covering the canvas. Transparent background wrappers allow the glowing WebGL slats to shine through with calibrated opacity (70%).
- **Header Simplification**:
  - *Decision*: Remove `HOME`, `QUESTS`, and `PASSPORT` links.
  - *Why*: Directly aligns with user requirement and matches the reference design in `Image 1` and `Image 5` where the top bar only contains the logo, status/back button, and builder action CTA.
- **Quests Removal & Focus**:
  - *Decision*: Delete `QuestsView.tsx` and purge quest routes from `App.tsx`.
  - *Why*: Reduces cognitive load and ensures 100% adherence to the user's explicit instructions.

---

## 4. Technical Architecture & Data Strategy

### Component & System Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             CodeKrafters App                             │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │               ShaderBackground (WebGL micro-slats wave)            │  │
│  │   - Canvas size sync, mouse ripple, neon pink & amber harmonics   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                         Navigation Header                          │  │
│  │   - [CK] Wordmark | [Wallet Status] [BUILDER NETWORK] [Avatar]     │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│       ┌───────────────────────────────┴───────────────────────────────┐  │
│       ▼                                                               ▼  │
│  ┌─────────────────────────────┐        ┌─────────────────────────────┐  │
│  │      LandingView (Img 1)    │        │    JoinNetworkView (Img 5)  │  │
│  │ - Hero Typography & Kicker  │        │ - Step 01/03 Identity Bar   │  │
│  │ - 4 Holographic HUD Cards   │        │ - Handle & Role Selection   │  │
│  │ - Sticky Connect CTA Banner │        │ - 4 Wallet SIWE Grid        │  │
│  └──────────────┬──────────────┘        │ - Live On-Chain NFT Card    │  │
│                 │                       │ - Campus Chapter Dropdown   │  │
│                 ▼                       └─────────────────────────────┘  │
│  ┌─────────────────────────────┐                                         │
│  │   ConnectWalletModal (3/4)  │                                         │
│  │ - 3 States: Pick/Sign/Auth  │                                         │
│  │ - Radar pulse & Bento stats │                                         │
│  └─────────────────────────────┘                                         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                   FooterTelemetry Status Ribbon                    │  │
│  │   - Sepolia RPC | 98.4k builders | Gas: 14 Gwei | Node Status      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### State Store Structure
- `currentScreen`: `'landing' | 'join'`
- `isWalletModalOpen`: boolean
- `isWalletConnected`: boolean
- `profile`: `BuilderProfile` containing live handle, guild tier role, connected wallet details, GitHub status (+150 XP), discord handle, and minted status.
