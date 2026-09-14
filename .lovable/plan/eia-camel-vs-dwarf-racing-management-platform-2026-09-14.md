# EIA Camel vs Dwarf Racing — Management Platform

A championship-style racing management app with a full interactive demo dataset, wired to the live API at `https://camelvsdwarf.onrender.com` with automatic fallback to local demo data when the backend is cold or unreachable.

## Look and feel

Warm championship aesthetic: desert sand and ember tones, deep espresso ink, gold accents for podium/victory states. Crisp condensed display headings paired with a clean body face. Status badges everywhere (colour-coded by competitor status, race status, registration state), responsive dialogs, and toast feedback on every action.

## Pages

- **Dashboard (`/`)** — counts of active competitors, teams, upcoming races and pending registrations, next-race spotlight, and a recent activity feed.
- **Competitors (`/competitors`)** — switchable table/card roster, filters for type (Camel, Dwarf, Medium, Other) and status (Active, Injured, Suspended, Retired), create/edit dialog, and a detail view with career stats.
- **Teams (`/teams`)** — team cards with coach, strategy and member count; `/teams/:id` shows the roster with add/remove controls.
- **Races (`/races`)** — race list filtered by status (Draft, Open, Closed, In Progress, Completed, Cancelled) and type (Individual, Team, Mixed).
- **Race detail (`/races/:id`)** — course specs, timeline, confirmed participants, state transition buttons (open, close, start, cancel), results recorder, and a link to the registration queue.
- **Registrations (`/races/:id/registrations`)** — pending queue with approve/reject and a reason note.
- **Standings (`/standings`)** — competitor and team leaderboards with points, victories and race counts.
- **Audit logs (`/audit-logs`)** — filterable record of every action taken.

## Roles

A role switcher in the top bar simulates Administrator, Race Organizer and Viewer. Permissions gate the UI: viewers get read-only screens, organizers manage races and registrations, administrators can do everything including editing competitors and teams.

## Technical notes

- Each page is its own route file under `src/routes/` with unique head metadata.
- A typed data layer (`src/lib/racing/`) holds the domain types, the seeded demo dataset, and an API client pointed at the configured origin. Reads try the API first and fall back to seeded data on error/timeout; writes update local state optimistically and best-effort sync, so the app stays fully interactive while the backend is cold.
- State lives in a React context store over TanStack Query, so mutations (approve, transition, roster edits) reflect instantly across pages and append entries to the audit log.
- Design tokens (colours, gradients, shadows) defined in `src/styles.css`; shadcn components used for dialogs, tables, badges, tabs and selects.
