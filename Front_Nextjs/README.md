# 🌐 WeCanZ - FrontEnd Web

> **Browser Web Platform for Gen-Z Meetups**  
> this web application offers instant, zero-install access to Z-Meetup browsing, multi-window chat coordination, and Z-Spot discovery, Apple OAuth callback, and legal compliance hub for the WeCanZ community.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router) / TypeScript
- **State & Data Fetching:** TanStack Query (`providers.tsx`) / Custom Domain Hooks (`hooks/`) / Client Stores (`stores/`)
- **Real-Time Communication:** WebSockets / Socket.IO Client (`lib/`)
- **Authentication:** JWT Token Management (`api/token.ts`) / Apple Sign-In Callback (`app/apple-callback`)
- **Localization:** Multi-language support (`hooks/Languages`)
- **Styling:** Tailwind CSS

---

## 📂 Project Architecture

```text
Front_Nextjs/
├── api/                     # Domain-separated API clients & HTTP interceptors
│   ├── auth/                # Authentication & session endpoints
│   ├── DM/                  # Direct messaging API requests
│   ├── friend/              # Friend requests & social graph APIs
│   ├── gathering/           # Z-Meetup CRUD & discovery endpoints
│   ├── spot/                # Z-Spot venue & location APIs
│   ├── user/                # User profile & settings endpoints
│   ├── client.ts            # Configured HTTP client with auth headers
│   └── token.ts             # Token storage & refresh utilities
├── app/                     # Next.js 15 App Router pages & layouts
│   ├── (auth)/              # Agreement, Login, and Signup routes
│   ├── (tabs)/              # Core app views (Meetups, Join/Done, Spot, Friends, DM, Settings)
│   │   ├── dm/              # 1:1 DM list & dynamic chat room (`dm/[id]`)
│   │   ├── friend/          # Friend list & request management
│   │   ├── gathering/[id]/  # Meetup details & real-time group chat (`chat/`)
│   │   ├── join/            # Meetup participation & confirmation (`done/`)
│   │   ├── setting/         # Account & language preferences
│   │   └── spot/            # Z-Spot exploration page
│   ├── apple-callback/      # Apple OAuth redirect & callback handler
│   ├── marketing/           # Product showcase & marketing landing page
│   ├── privacy/             # Privacy Policy page
│   ├── profile/[id]/        # Public user profile page
│   ├── terms/               # Terms of Service page
│   ├── globals.css          # Global stylesheets
│   ├── layout.tsx           # Root HTML layout & metadata
│   └── providers.tsx        # Global context & query providers
├── components/              # Reusable UI components
├── constants/               # App-wide constants & configuration values
├── hooks/                   # Custom React hooks grouped by domain & i18n (`Languages`)
├── lib/                     # Third-party client initializations (WebSocket, utilities)
├── public/                  # Static assets, favicons, and images
├── stores/                  # Global client-side state stores
├── types/                   # TypeScript interfaces & DTO types matching backend schemas
└── utils/                   # Helper functions & formatting utilities
```
