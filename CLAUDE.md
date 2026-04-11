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
- None (all V1 issues resolved)

## Rules
- ALWAYS use apiFetch() never raw fetch()
- ALWAYS use Lucide React icons never emojis
- ALWAYS run npm run build before committing
- ALWAYS run npx tsc --noEmit in api/ before committing

## Status
- V1: 85% complete
- V2: Not started

## Roles
ADMIN, OFFICE_MANAGER, PROJECT_MANAGER, FIELD_TECH, SUBCONTRACTOR

## API Endpoints
/clients, /quotes, /projects, /invoices, /tasks, /subcontractors, /team, /settings, /auth, /reports, /change-orders
