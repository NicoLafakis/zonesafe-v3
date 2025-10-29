# ZoneSafe v3 — Application Outline

This document is the single source of truth for the app’s architecture, routing, shared state, and key flows. Keep it updated.

## Tech Stack
- Frontend: React 18 + TypeScript, Vite
- Router: react-router-dom v6
- UI: Inline styles via `styles/theme.ts`, `lucide-react` icons
- State: React Context for auth and plan wizard
- Server: Node/Express (see `/server`)

## Top-Level Routes
- `/` → Landing page
- `/work-types` → Work Type Selection (category picker)
- `/plans` → User plans list
- `/plans/new` → Create Plan (wizard)
- `/plans/:planId` → View Plan
- `/plans/:planId/edit` → Edit Plan
- `/help` → Help & Support
- `/settings` → Settings

## Key Flow: Start a New Safety Plan
1. User clicks “Start New Safety Plan” on `/`.
2. Navigates to `/work-types` where six categories are shown:
   - roadway_pavement, shoulder, intersection, bridge, roadside_utility, mobile
3. On selecting a category, navigate to `/plans/new` with React Router `state: { workType }`.
4. `CreatePlan` reads this state on mount, resets the wizard data, and sets `planData.workType`.
5. Wizard proceeds through steps 1–5.
6. A persistent “Back to Categories” control is available on all steps (including step 1) via `WizardLayout`.

## Shared State: Plan Wizard Context
File: `src/contexts/PlanWizardContext.tsx`

Shape:
- `planData: { workType, roadData, workTiming, workZoneDetails, equipment }`
- Updaters: `updateWorkType`, `updateRoadData`, `updateWorkTiming`, `updateWorkZoneDetails`, `updateEquipment`
- Utilities: `resetPlan`, `loadPlan`

Contract:
- `updateWorkType(workType)` sets chosen category.
- `resetPlan()` clears wizard to defaults.
- Consumers should be wrapped in `PlanWizardProvider`.

## Wizard
- Wrapper: `src/components/WizardLayout.tsx`
  - Renders stepper and persistent “← Back to Categories” link to `/work-types`.
- Steps (UI only):
  - `Step1Location`, `Step2Timing`, `Step3Details`, `Step4Equipment`, `Step5Results`
- Page: `src/pages/CreatePlan.tsx`
  - Manages `currentStep` local state
  - On mount, reads `location.state.workType` and sets it via context

## Components
- `Header`, `Footer`, `GoogleMapComponent`, etc.

## Styling
- Centralized in `src/styles/theme.ts` and `src/styles/global.css`.

## Server (brief)
- Express server under `/server` for auth, plans, and users.

## Notes and Conventions
- Use `Link` and `navigate` from react-router for navigation.
- Prefer context updaters over prop drilling.
- Keep accessibility in mind; convert clickable divs to buttons/links where feasible.

## Recent Changes (2025-10-28)
- Added `/work-types` route and page `WorkTypeSelection`.
- Landing page button now routes to `/work-types`.
- Category selection navigates to `/plans/new` with `{ workType }`.
- `PlanWizardContext` now exposes `updateWorkType` and memoizes provider value.
- `WizardLayout` includes a persistent Back to Categories link.
