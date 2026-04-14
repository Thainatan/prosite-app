# ProSite — Remodeling Management SaaS

## Stack
- Frontend: Next.js 16 + TypeScript + Tailwind (web/)
- Backend: NestJS + Prisma (api/)
- Database: Supabase PostgreSQL
- Deploy: Vercel (web) + Railway (api)

## URLs
- Frontend: https://prosite-app-you9.vercel.app
- API: https://prosite-app-production.up.railway.app
- GitHub: https://github.com/Thainatan/prosite-app

## Database
- Supabase project: ibhxlmphcutixtbxygej
- Password: ProSite2024
- Connection: postgresql://postgres.ibhxlmphcutixtbxygej:ProSite2024@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

## Auth
- JWT stored in localStorage as 'prosite_token' AND cookie 'prosite_token'
- Login: POST /auth/login returns { token, user }
- All API calls use apiFetch() from web/lib/api.ts with Bearer token

## Colors
- Background: #F8F6F3
- Sidebar: #1C2B3A (navy)
- Primary: #E8834A (orange)
- Cards: #FFFFFF
- Border: #E8E4DF

## Known Issues
- 3 orphaned `schedule_events` rows with empty tenantId (pre-isolation test data). Invisible to all tenants, no app impact. Fix: run `DELETE FROM schedule_events WHERE "tenantId" = '';` in Supabase SQL Editor (postgres MCP is read-only, API can't reach them due to tenant filtering).

## Rules
- ALWAYS use apiFetch() never raw fetch()
- ALWAYS use Lucide React icons never emojis
- ALWAYS run npm run build before committing
- ALWAYS run npx tsc --noEmit in api/ before committing

## Completed Features (V1)
- Multi-tenant architecture with tenant isolation
- PWA: manifest.json, sw.js service worker, offline page, install prompt in sidebar
- Mobile responsive: hamburger menu, slide-in sidebar, full-screen modals, 44px touch targets
- Quote → Approve → Project + Invoice auto-creation flow
- Task creation with schedule calendar view
- Settings: company info, branding
- Team member invite with roles
- Subcontractor management + project assignment
- Reports: win rate, outstanding balance, projects by status
- Promo Code system: admin CRUD at /promo, public validate endpoint, register page field with ?code= URL pre-fill, billing page apply flow. Seeds PARTNER90 (90d), BETA2026 (180d), FREEPARTNER (FREE_FOREVER), ENTERPRISE90 (90d Enterprise) on API startup

## API Notes
- POST /tasks requires startDateTime + endDateTime as ISO strings (not date/startTime)
- POST /quotes uses 'items' array field (not 'lineItems')
- Quote approve is triggered via the UI Approve button (no /approve REST endpoint)

## Super Admin Panel
- Login: admin@prosite.com — password stored in project memory
- Role: SUPER_ADMIN (assigned in JWT at login time, not stored in DB)
- Routes: /admin/* — completely separate layout from regular app
- /admin/dashboard — platform overview: stats, charts, alerts, recent signups
- /admin/tenants — all companies with search/filter/sort, inline extend/suspend
- /admin/tenants/:id — company detail: stats, activity timeline, team, plan management
- /admin/promo — promo code CRUD + usage detail with tenant info, copy register link
- /admin/reports — revenue/signups charts, plan distribution, top 10 companies
- API: GET/PATCH /admin/tenants/:id, GET /admin/overview, GET /admin/reports
- Admin Panel link appears in regular sidebar only for SUPER_ADMIN role
- Guard: req.user.role === 'SUPER_ADMIN' (checked per-endpoint)
- ADMIN_EMAIL env var (defaults to admin@prosite.com)

## Beta Launch
- Launched: April 2026
- Outreach templates: web/public/beta-launch.md
- Install guide: /install page
- Personalized invite links: /invite/[CODE] (validates promo code, redirects to /register?code=CODE)
- Home page: removed placeholder stats, fixed dead /partner link → mailto
- Login page: Forgot password → mailto:support@prositeapp.com
- Support email: support@prositeapp.com

## Status
- V1: 100% complete — Beta launched April 2026
- V2: Not started

## Roles
ADMIN, OFFICE_MANAGER, PROJECT_MANAGER, FIELD_TECH, SUBCONTRACTOR, SUPER_ADMIN (JWT only)

## API Endpoints
/clients, /quotes, /projects, /invoices, /tasks, /subcontractors, /team, /settings, /auth, /reports, /change-orders, /promo

## Promo Code Notes
- POST /promo/validate — public, no auth required. Returns { valid, type, trialDays, plan, description }
- POST /promo/apply — authenticated, applies code to current user's tenant
- Admin CRUD: GET/POST /promo, PATCH/DELETE /promo/:id, GET /promo/:id/usage
- Types: TRIAL_EXTENSION (extends planExpiresAt), FREE_FOREVER (plan='FREE_FOREVER', no expiry), DISCOUNT_PERCENT, DISCOUNT_FIXED
- DB tables: promo_codes, promo_code_usages
