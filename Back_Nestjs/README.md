# ⚙️ WeCanZ - Backend Server

> **Backend API & Real-Time Engine for Gen-Z Meetups**  
> This server powers meetup creation, real-time group and direct messaging, friend connections, and local Z-Spot discovery with low-latency synchronization, secure authentication, and media storage.

---

## 🛠️ Tech Stack

- **Framework:** NestJS 11 (TypeScript)
- **Database & ORM:** PostgreSQL / Prisma 
- **Real-Time Communication:** WebSockets (`chat.gateway.ts`) 
- **Authentication & Security:** JWT / Custom Guards & Decorators
- **Object Storage:** Cloudflare R2 (`utils/r2.provider.ts`) 

---

## 📂 Project Architecture

```text
Back_Nestjs/
├── prisma/
│   ├── migrations/          # Database migration history
│   ├── prisma.module.ts     # Global Prisma module
│   ├── prisma.service.ts    # Database client lifecycle management
│   ├── schema.prisma        # Database schema definitions
│   └── seed.ts              # Initial database seeding script
├── src/
│   ├── auth/                # Authentication, JWT strategies, guards, and custom decorators
│   ├── chat/                # WebSocket gateway, 1:1 direct chat, and gathering group chat
│   ├── commercial/          # Z-Spot exploration & commercial/local venue listings
│   ├── friendship/          # Friend requests, connections, and social graph management
│   ├── gathering/           # Z-Meetup creation, discovery, and lifecycle management
│   ├── participant/         # Meetup participation requests, approvals, and member tracking
│   ├── report/              # User and content moderation / reporting system
│   ├── user/                # User profiles, preferences, and account management
│   ├── app.module.ts        # Root application module
│   └── main.ts              # Application entry point
├── utils/
│   └── r2.provider.ts       # Cloudflare R2 storage integration provider
└── test.http                # REST Client API test scenarios
```
