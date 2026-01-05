# RosterSync - Application Overview

## 📌 What is RosterSync?

**RosterSync** is a premium AI-powered SaaS application designed for sports media professionals. It uses **Google Gemini 1.5 Flash** with real-time web grounding to extract verified sports rosters from the internet and format them for **Iconik MAM** (Media Asset Management) systems.

---

## 🔄 How It Works

### User Workflow

```
1. User enters a team query (e.g., "Liverpool FC 2024")
         ↓
2. Gemini AI searches the web (Google Search grounding)
         ↓
3. AI extracts & verifies player names from official sources
         ↓
4. Data is normalized (remove diacritics, sort alphabetically)
         ↓
5. User reviews, edits, and saves the roster
         ↓
6. User exports to:
   • CSV file (for spreadsheets/broadcast graphics)
   • Iconik JSON (direct API sync to MAM)
```

### Core Features

| Feature | Description |
|---------|-------------|
| **AI Extraction** | Real-time Google Search grounding via Gemini 1.5 Flash |
| **Multi-Source Verification** | Cross-references official team sites and league databases |
| **Iconik Integration** | Direct API sync or JSON export for metadata fields |
| **Zero-Knowledge Security** | Client-side AES-256 encryption for Iconik credentials |
| **Roster Library** | Save, rename, merge, and manage multiple rosters |
| **Activity Logging** | Track all actions (extractions, exports, logins) |
| **Premium UI** | Glassmorphism, dark mode, dynamic animations |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |

### Backend / Services
| Technology | Purpose |
|------------|---------|
| **Vercel** | Hosting & serverless functions |
| **Google Gemini AI** | Roster extraction with web grounding |
| **Supabase** | PostgreSQL database + Auth |
| **Resend** | Transactional email (demo/support notifications) |

### Security
| Technology | Purpose |
|------------|---------|
| **CryptoJS** | Client-side AES-256 encryption |
| **Local Storage** | Master encryption key (never leaves browser) |

---

## 📁 Folder Structure

```
rostersyncv5/
├── api/                        # Vercel Serverless Functions
│   ├── gate.ts                 # Iconik API proxy (connection & sync)
│   ├── notify.ts               # Email notifications (demo/support)
│   ├── iconik-proxy.ts         # Legacy proxy (deprecated)
│   └── iconik.ts               # Legacy endpoint (deprecated)
│
├── components/                 # React UI Components
│   ├── ActivityPage.tsx        # Activity log viewer
│   ├── AuthModal.tsx           # Login/signup modal
│   ├── CommandHub.tsx          # Search input component
│   ├── Dashboard.tsx           # Main dashboard view
│   ├── DatabaseSetupModal.tsx  # Supabase table setup guide
│   ├── DeleteConfirmationModal.tsx
│   ├── DemoRequestModal.tsx    # Book demo form
│   ├── ExtractionAnimation.tsx # AI processing animation
│   ├── LandingPage.tsx         # Public marketing page
│   ├── LoadingIndicator.tsx    # Generic loader
│   ├── MergeModal.tsx          # Merge rosters from seasons
│   ├── RosterPage.tsx          # Roster viewer/editor (main workspace)
│   ├── SaveConflictModal.tsx   # Duplicate name handler
│   ├── SettingsPage.tsx        # Iconik credentials config
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── SupportModal.tsx        # Support ticket form
│   ├── WorkflowVideoModal.tsx  # Tutorial video player
│   ├── Workspace.tsx           # Legacy roster table
│   └── icons.tsx               # Centralized icon exports
│
├── services/                   # Business Logic & API Clients
│   ├── cryptoService.ts        # Client-side encryption/decryption
│   ├── geminiService.ts        # Google Gemini AI integration
│   ├── iconikFormatter.ts      # Format roster to Iconik JSON schema
│   ├── iconikService.ts        # Iconik API client (via proxy)
│   └── supabaseService.ts      # Supabase client (auth, rosters, logs)
│
├── App.tsx                     # Main application component
├── index.tsx                   # React entry point
├── index.html                  # HTML shell + loading screen
├── index.css                   # Premium design system (animations, glass effects)
├── types.ts                    # TypeScript interfaces
├── constants.ts                # App constants
├── i18n.ts                     # Internationalization config
├── locales.ts                  # Translation strings
├── vite.config.ts              # Vite build configuration
├── vercel.json                 # Vercel deployment config
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

---

## 🗄 Database Structure (Supabase)

### Tables

#### `saved_rosters`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users |
| `team_name` | text | Display name of the roster |
| `sport` | text | Sport type (Football, Basketball, etc.) |
| `player_names` | text[] | Array of player names (searchable) |
| `data` | jsonb | Full ExtractionResult object |
| `created_at` | timestamptz | Creation timestamp |

#### `activity_logs`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users |
| `timestamp` | timestamptz | When the action occurred |
| `action` | text | Action type (Extraction, Export, Login, etc.) |
| `details` | text | Human-readable description |
| `status` | text | OK, ERR, or WARN |

#### `demo` (Demo Requests)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `full_name` | text | Requester's name |
| `work_email` | text | Requester's email |
| `phone` | text | Phone number |
| `company` | text | Company name |
| `notes` | text | Additional notes |
| `created_at` | timestamptz | Request timestamp |

#### `support_tickets`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `full_name` | text | User's name |
| `email` | text | User's email |
| `message` | text | Support message |
| `created_at` | timestamptz | Ticket timestamp |

---

## 🔐 Security Model

### Zero-Knowledge Credential Storage

```
User enters Iconik credentials
         ↓
CryptoJS encrypts with AES-256 (client-side)
         ↓
Encrypted blob saved to Supabase
         ↓
Master key stored ONLY in localStorage

⚠️ RosterSync servers NEVER see plaintext credentials
⚠️ Clearing browser cache deletes the master key
```

---

## 🌐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` or `API_KEY` | ✅ | Google Gemini API key |
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous API key |
| `RESEND_API_KEY` | Optional | Resend email API key (for notifications) |

---

## 📊 Data Flow Diagram

```
┌─────────────┐     HTTPS      ┌─────────────────┐
│    User     │ ─────────────► │  Vercel Edge    │
│  (Browser)  │ ◄───────────── │  (React SPA)    │
└─────────────┘                └────────┬────────┘
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 │                      │                      │
                 ▼                      ▼                      ▼
        ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
        │  Gemini 1.5    │    │    Supabase    │    │   Iconik API   │
        │  Flash (AI)    │    │   (Postgres)   │    │   (via proxy)  │
        │  + Google      │    │                │    │                │
        │    Search      │    │  • Auth        │    │  • Test conn   │
        └────────────────┘    │  • Rosters     │    │  • Sync roster │
                              │  • Logs        │    └────────────────┘
                              └────────────────┘
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables:
   - `API_KEY` (Gemini)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 📝 Key TypeScript Interfaces

```typescript
interface Player {
    name: string;
    position: string;
}

interface ExtractionResult {
    teamName: string;
    sport: string;
    players: Player[];
    verifiedSources: string[];
    verificationNotes: string;
    meta?: {
        model: string;
        totalTokens: number;
        promptTokens: number;
        candidatesTokens: number;
        latencyMs: number;
    };
}

interface SavedRoster {
    id: string;
    user_id: string;
    team_name: string;
    sport: string;
    player_names: string[];
    data: ExtractionResult;
    created_at: string;
}

interface ActivityLog {
    id: string;
    user_id: string;
    timestamp: string;
    action: 'Extraction' | 'Export' | 'Deletion' | 'Login' | 'Logout' | 'Modification';
    details: string;
    status: 'OK' | 'ERR' | 'WARN';
}
```

---

*Document generated: January 5, 2026*
