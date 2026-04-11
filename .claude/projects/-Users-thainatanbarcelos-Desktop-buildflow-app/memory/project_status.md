---
name: ProSite Project Status
description: Current state of ProSite V1, what was fixed, what's deployed
type: project
---

All 4 CLAUDE.md "Known Issues" were fixed in commit 4002265 (clients dropdowns, tasks on calendar, Nominatim fallback, auth persistence). CLAUDE.md has been updated to reflect this.

**Why:** These were V1 bugs tracked as known issues; now fully resolved.

**How to apply:** The known issues section in CLAUDE.md is now clean. Any new bugs should be added there.

Additional fixes in commit fd016e2 (2026-04-10):
- `middleware.ts` renamed to `proxy.ts` — Next.js 16 renamed the Middleware convention to Proxy. Export is now `proxy` not `middleware`.
- Removed dead code: `web/app/(app)/components/ClientAutocomplete.tsx` (had `onSelect` prop; all pages use `web/components/ClientAutocomplete.tsx` with `onChange` prop)
- Replaced emoji icons (🖨 in quotes/page.tsx, 📅 in projects/page.tsx) with Lucide `<Printer>` and `<Calendar>` icons

DB tables use lowercase names: `clients`, `estimates` (not "quotes"), `schedule_events` (not "tasks"). The API maps them to `/quotes` and `/tasks` endpoints transparently.
