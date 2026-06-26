<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Build
- `npm run build` — builds the Next.js app
- `npm run dev` — starts dev server with Turbopack
- Always run `npm run build` after making changes to verify no errors

## DB
- `npm run db:setup` — runs migrations + seeds
- `npm run db:migrate` — runs pending migrations
- `npm run db:seed` — seeds the database
- Data pages need `export const dynamic = "force-dynamic"` to prevent build-time DB errors

## Key Conventions
- Prisma client is at `./node_modules/@prisma/client` (generated via postinstall)
- All server actions in `src/lib/actions.ts`
- Auth config in `src/lib/auth.ts` (NextAuth v5 beta, Credentials provider)
- Supabase admin client in `src/lib/supabase-admin.ts`
- Storage bucket name: `documents`
- Document access uses signed URLs (1 year expiry), not public bucket

## Env Vars Required
- DATABASE_URL, DIRECT_URL (PostgreSQL + pooled via Supabase)
- NEXTAUTH_SECRET
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY (لخاصية مسح البطاقة بالذكاء الاصطناعي)
