# Case Management System

Internal web app for asylum/legal case management offices. Simple, fast, and built for usability.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL
- Prisma ORM
- NextAuth (Credentials provider)

## Features

- **Authentication** - Secure login with Admin/Staff roles
- **Dashboard** - Stats overview with searchable, filterable, sortable clients table
- **Client Management** - Add, edit, delete clients with validation
- **Case Timeline** - Chronological activity log with quick notes
- **Document Upload** - PDF, JPG, PNG support with preview/download
- **Status Tracking** - 9 status stages from intake to closure
- **Dark Mode** - Full dark mode support
- **Responsive** - Desktop-first, mobile usable

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and update:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/case_management?schema=public"
AUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secure `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed with sample data
npm run db:seed
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Default Login Credentials

After seeding:

| Role  | Email              | Password   |
|-------|--------------------|------------|
| Admin | admin@office.local | admin123   |
| Staff | sarah@office.local | staff123   |
| Staff | michael@office.local | staff123 |

**Change these passwords in production.**

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Protected routes
│   │   ├── dashboard/         # Main dashboard
│   │   └── clients/           # Client CRUD
│   │       ├── new/           # Add client form
│   │       └── [id]/          # Client details
│   └── api/
│       ├── auth/[...nextauth]/ # Auth handler
│       ├── clients/           # Clients API (search/filter)
│       └── upload/            # File upload API
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── client-table.tsx       # Searchable clients table
│   ├── client-info-card.tsx   # Client info + edit/delete
│   ├── status-card.tsx        # Status dropdown + progress
│   ├── timeline-section.tsx   # Case timeline + notes
│   ├── documents-section.tsx  # Document upload/list
│   ├── sidebar.tsx            # Navigation sidebar
│   └── theme-provider.tsx     # Dark mode provider
├── lib/
│   ├── db.ts                  # Prisma client singleton
│   ├── auth.ts                # NextAuth config
│   ├── auth-index.ts          # NextAuth exports
│   ├── actions.ts             # Server actions
│   ├── session.ts             # Session helpers
│   └── prisma.ts              # Prisma re-exports
└── middleware.ts              # Route protection
```

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:setup     # Migrate + seed
```

## Client Statuses

1. **New Client** - Initial intake
2. **Gathering Documents** - Collecting evidence
3. **Submitted** - Application filed
4. **Interview Scheduled** - Interview booked
5. **Waiting Decision** - Under review
6. **Appeal** - Appeal filed
7. **Approved** - Case approved
8. **Rejected** - Case denied
9. **Closed** - Case closed

## Security

- Password hashing with bcrypt
- Route protection via middleware
- Role-based access control (Admin/Staff)
- Server-side validation with Zod
- File type and size restrictions
- Audit timestamps on all records

## Production Deployment

1. Set `DATABASE_URL` to your production PostgreSQL
2. Generate a strong `AUTH_SECRET`
3. Set `NEXTAUTH_URL` to your domain
4. Run `npm run build` then `npm run start`
5. Run `npx prisma migrate deploy` for migrations
6. Change default passwords immediately

## License

Internal use only.
