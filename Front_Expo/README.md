# 📱 WeCanZ – FrontEnd Mobile App

> **iOS & Android Cross Mobile Platform for Gen-Z Meetups**  
> this mobile app brings WeCanZ into your pocket—delivering instant push notifications, spontaneous on-the-move meetup check-ins, and seamless real-time DMs wherever Gen-Z hangouts happen across the US, UK, and South Korea.

---

## 🛠️ Tech Stack

- **Framework:** React Native (Expo SDK 55) / TypeScript
- **State & Server Data:** TanStack Query (`api-provider.tsx`) /  Custom Domain Hooks (`hooks/`)
- **Real-Time Communication:** Socket.IO Client (`lib/socket.ts`) 
- **Push Notifications & Native Services:** Firebase Cloud Messaging 
- **Localization:** Multi-language support (`hooks/Languages`) 
- **Build & Deployment:** EAS Build & Submit (`eas.json`)

---

## 📂 Project Architecture

```text
Front_Expo/
├── api/                     # Domain-separated API clients, TanStack Query provider, & token handlers
│   ├── auth/                # Authentication & session requests
│   ├── DM/                  # Direct messaging API endpoints
│   ├── friend/              # Friend requests & social graph APIs
│   ├── gathering/           # Z-Meetup CRUD & discovery endpoints
│   ├── spot/                # Z-Spot venue & location APIs
│   ├── user/                # User profile & settings endpoints
│   ├── api-provider.tsx     # Global QueryClient & API context provider
│   ├── client.ts            # Configured HTTP client (Axios / Fetch) with interceptors
│   └── token.ts             # Secure token storage & refresh utilities
├── app/                     # Expo Router file-based navigation screens
│   ├── (auth)/              # Login & Signup flows
│   ├── (tabs)/              # Main bottom tab screens (Meetups, Joined, Spot, Friends, DM, Settings)
│   ├── agreement/           # Terms of service & privacy policy consent screens
│   ├── DM/[id].tsx          # Real-time 1:1 direct message chat room
│   ├── gathering/[id]/      # Meetup detail view & group chat interface
│   ├── joined/done.tsx      # Meetup participation confirmation screen
│   ├── profile/[id].tsx     # Public user profile view
│   └── _layout.tsx          # Root navigation layout & providers
├── assets/                  # App icons, splash screens, and static media
├── components/              # Reusable UI components
├── constants/               # Theme colors, layout constants, and configuration values
├── hooks/                   # Custom React hooks grouped by domain & i18n (`Languages`)
├── lib/
│   └── socket.ts            # WebSocket / Socket.IO client initialization & event listeners
├── types/                   # TypeScript interfaces & DTO types matching backend schemas
├── utils/                   # Helper functions & formatting utilities
├── app.json                 # Expo app configuration (bundle ID, permissions, plugins)
├── eas.json                 # Expo Application Services (EAS) build & submit profiles
├── google-services.json     # Android Firebase configuration
└── GoogleService-Info.plist # iOS Firebase configuration