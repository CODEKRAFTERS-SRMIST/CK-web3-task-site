# CodeKrafters Web3 Domain Platform - Feature Specification

Welcome to feature specification document for CodeKrafters task and contributor platform. This document outlines core architecture, streamlined onboarding flow, task management, gamification, and showcase modules required for development.

---

## 1. Onboarding & User Identity (Unified Flow)

To ensure high-quality community of verified builders, CodeKrafters utilizes mandatory multi-step profile completion workflow immediately following initial authentication.

### 1.1 OAuth Login & Authentication
* **Primary Sign-In:** Single sign-on (SSO) via preferred OAuth providers (e.g., GitHub or Google) for quick initial account creation.
* **Session Management:** Secure token-based authentication (JWT/Auth0 or NextAuth) maintaining session state across app.

### 1.2 Mandatory Profile Completion Wizard
Upon first login, users are redirected to mandatory "Complete Your Profile" wizard. They cannot access main platform dashboard until all mandatory fields are submitted:
* **Basic Details:** Full name, display handle, bio, and primary domain interest (e.g., Smart Contracts, Frontend, ZK, Design).
* **Social & Developer Links:** Input fields for GitHub, Twitter/X, and Discord usernames/URLs.
* **Wallet Connection:** Mandatory Web3 wallet connection (MetaMask, Phantom, Backpack) to bind EVM or Solana address to user profile for rewards and credentials.
* **Profile Verification Check:** Validation checks ensuring all URLs are properly formatted and wallet signature is successfully verified.

---

## 2. Task Management & Submissions

core engine for domain heads to distribute work and members to build reputation.

### 2.1 Task Board & Filtering
* **Task Creation Dashboard:** Interface for heads and leads to post tasks with title, description, detailed requirements, tags, reward allocation (XP/tokens), and deadlines.
* **Categorized Discovery:** Filter tasks by domain track (e.g., Solidity, Rust, React, UI/UX), difficulty level (Beginner, Intermediate, Advanced), and status (Open, In Progress, Under Review, Completed).

### 2.2 Submission & Review Pipeline
* **Proof-of-Work Portal:** Dedicated submission modal where members can submit GitHub PR links, live demo URLs, and accompanying notes.
* **Lead Review Interface:** Review dashboard for domain heads to approve, request revisions, or reject submissions with inline feedback comments.

---

## 3. Gamification, Badges & Certifications

Recognizing builder achievements and maintaining healthy community competition.

### 3.1 XP & Dynamic Leaderboard
* **Automated Point System:** Users accumulate XP and points upon successful verification and approval of tasks.
* **Global & Domain Leaderboards:** Real-time rankings displaying top contributors across entire CodeKrafters community or filtered by specific sub-domains.

### 3.2 Badges & Completion Certifications
* **Milestone Badges:** Custom digital badges issued by domain leads for exceptional contributions, hackathon participation, or core skill mastery.
* **Completion Certificates:** Auto-generated verifiable certificates for graduating from specific domain tracks or major project milestones.

---

## 4. Project Showcase & Community Hub

Allowing members to highlight external achievements and collaborate.

### 4.1 Personal & External Project Showcase
* **Showcase Gallery:** dedicated space where developers can display side projects, hackathon entries, or open-source contributions alongside their completed CodeKrafters tasks.
* **Card Metadata:** Project cards featuring title, tech stack tags, live links, GitHub repositories, and preview images.

### 4.2 Community Engagement
* **Upvotes & Feedback:** Peer interaction allowing community members to like, comment on, and review showcased projects.

---

## 5. Suggested Additional Features for Phase 2

* **Squad/Pod Sub-Teams:** Form mini-teams for multi-person bounties or collaborative domain projects.
* **Skill Radar Chart:** Dynamic graphical representation on user profiles visualizing builder competencies across different Web3 pillars.
* **Activity Heatmap:** GitHub-style contribution grid tracking active days on platform.