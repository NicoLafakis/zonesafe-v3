# ZoneSafe v3 - MUTCD Safety Plan Generator

Professional-grade traffic control plan generation made simple. Create MUTCD-compliant safety plans in minutes without specialized training.

## Overview

ZoneSafe is a web-based application that democratizes access to professional-grade traffic control plans for road work operations. It eliminates the complexity of Manual on Uniform Traffic Control Devices (MUTCD) compliance through an intelligent, wizard-driven interface.

## Features

- **Intelligent Plan Generation**: AI-powered plan creation using OpenAI GPT-5-mini and Anthropic Claude Haiku
- **100% MUTCD Compliant**: Follows FHWA MUTCD 11th Edition (December 2023)
- **Zero Training Required**: Simple wizard interface for novice users
- **6 Work Type Categories**:
  - Roadway/Pavement Work
  - Shoulder Work
  - Intersection Work
  - Bridge Work
  - Roadside/Utility Work
  - Mobile Operations
- **Mobile-First Design**: Optimized for on-site use in outdoor conditions
- **Location Intelligence**: Integrated HERE Maps and Google Roads API
- **Weather-Aware**: OpenWeather API integration for site conditions

## Tech Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Routing**: React Router DOM 6.26
- **Icons**: Lucide React
- **Styling**: Inline styles with design system

### Backend (Coming Soon)
- Node.js/Express API
- MySQL Database
- OpenAI API (GPT-5-mini)
- Anthropic Claude API (Haiku 4.5)
- HERE Maps API
- Google Roads API
- OpenWeather API
- Google OAuth

## Project Structure

```
zonesafe-v3/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── pages/             # Page components
│   │   ├── LandingPage.tsx
│   │   ├── MyPlans.tsx
│   │   ├── CreatePlan.tsx
│   │   ├── ViewPlan.tsx
│   │   ├── HelpSupport.tsx
│   │   └── Settings.tsx
│   ├── lib/               # Core libraries
│   │   └── mutcd-calculation-engine.ts
│   ├── hooks/             # Custom React hooks (future)
│   ├── types/             # TypeScript type definitions (future)
│   ├── styles/            # Design system & global styles
│   │   ├── theme.ts
│   │   └── global.css
│   ├── App.tsx            # Main app component with routing
│   ├── main.tsx           # App entry point
│   └── vite-env.d.ts      # Vite environment types
├── docs/                  # Documentation & references
│   ├── APPLICATION_ABSTRACT.md
│   ├── COLOR_PALETTE.css
│   ├── work_type-*.md
│   └── MUTCD PDF reference
├── assets/                # Static assets
│   └── ZoneSafe-v3.png
├── public/                # Public static files
├── index.html             # HTML entry point
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zonesafe-v3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys (see Environment Variables section below)

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## Environment Variables

The application requires the following environment variables (see `.env.example`):

```env
# OpenAI API (GPT-5-mini for plan generation)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Claude API (Claude Haiku for regulatory interpretation)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# HERE Maps API (Location intelligence)
VITE_HERE_MAPS_API_KEY=your_here_maps_api_key_here

# Google Roads API (Road data)
VITE_GOOGLE_ROADS_API_KEY=your_google_roads_api_key_here

# OpenWeather API (Weather conditions)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Google OAuth (Authentication)
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here

# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000
```

## Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Aerospace Orange** | `#FF4F0F` | Primary CTAs, active states, safety emphasis |
| **Floral White** | `#FFFBF1` | Page background (outdoor-readable) |
| **Mustard Yellow** | `#FFDB4C` | Secondary accents, step indicators |
| **Davy's Gray** | `#4E4B4B` | Primary text, neutral elements |
| **Pure White** | `#FFFFFF` | Cards, modals, header background |

### Typography

- **Font Family**: System font stack (cross-platform)
- **Base Size**: 18px (optimized for outdoor viewing)
- **Headings**: Bold, tight line height
- **Body**: Regular, relaxed line height

## Current Status

### ✅ Completed (Option 1: Full Project Setup)

- [x] Vite + React + TypeScript project initialized
- [x] Project folder structure created
- [x] React Router with basic routes configured
- [x] Design system and theme configuration
- [x] MUTCD calculation engine integrated
- [x] Landing page component (built from scratch using design reference)
- [x] Header and Footer components
- [x] Placeholder pages (My Plans, Create Plan, View Plan, Help, Settings)
- [x] Environment variables template
- [x] .gitignore configured
- [x] TypeScript compilation verified
- [x] Production build tested successfully

### 🚧 Next Steps (Future Development)

- [ ] Implement wizard/multi-step flow for plan creation
- [ ] Add map drawing interface
- [ ] Integrate AI APIs (OpenAI, Claude)
- [ ] Build plan visualization and PDF export
- [ ] Set up backend API and database
- [ ] Implement Google OAuth authentication
- [ ] Add plan history and management
- [ ] Integrate location APIs (HERE Maps, Google Roads)
- [ ] Add weather API integration
- [ ] Implement data caching and intelligence system

## MUTCD Calculation Engine

The core calculation engine (`src/lib/mutcd-calculation-engine.ts`) implements MUTCD 11th Edition formulas for:

- **Taper Calculations**: Merging, shifting, shoulder, one-lane two-way, downstream
- **Buffer Spaces**: Longitudinal, lateral, stopping sight distance
- **Sign Placement**: Advance warning distances, height requirements
- **Channelizing Devices**: Spacing requirements for tapers and tangents
- **Arrow Boards**: Type determination and placement
- **Flagger Stations**: Location and illumination requirements
- **Lane Width Requirements**: Duration-based minimums
- **Pedestrian Accommodations**: ADA compliance
- **Bicycle Accommodations**: Facility detours and shared lanes
- **Warning Lights**: Type and flash rate requirements
- **High Visibility Apparel**: Class requirements

### Usage Example

```typescript
import { calculateWorkZoneRequirements } from '@/lib/mutcd-calculation-engine'

const input = {
  speedLimit: 55,
  laneCount: 2,
  closedLanes: [1],
  roadType: 'rural',
  workType: 'roadway_pavement',
  duration: 'short_term',
  // ... additional parameters
}

const results = calculateWorkZoneRequirements(input)
console.log(results.tapers, results.bufferSpaces, results.signPlacement)
```

## Contributing

Please read the `APPLICATION_ABSTRACT.md` in the `docs/` folder for comprehensive design guidelines and project philosophy.

## License

Proprietary - All rights reserved

## Support

For questions or issues, please contact the development team or refer to the documentation in the `docs/` folder.

---

**Built with safety in mind** 🚧
