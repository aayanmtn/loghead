# Loghead Cloud

The self-hostable web platform for **Loghead** — ingest, search, and explore logs with AI-powered semantic search.

## Tech Stack

| Technology | Description |
| :--- | :--- |
| **Next.js 16 (App Router)** | React framework with standalone Docker output |
| **React 19** | UI library |
| **Tailwind CSS 4** | Utility-first CSS |
| **better-auth** | Authentication (email/password, OAuth) |
| **PostgreSQL** | Primary database |
| **Stripe** | Billing and subscriptions |
| **Docker** | Containerized deployment |

## Getting Started

### Prerequisites

- Node.js v20+
- yarn 4 (`corepack enable`)
- Docker + Docker Compose (for services)
- A PostgreSQL database
- A Stripe account (for billing)

### Environment Variables

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/loghead?sslmode=disable

# Auth
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_BASE_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
```

### Local Development (with hot reload)

Start just the backing services (PostgreSQL + Stripe CLI):

```bash
yarn docker:dev
```

Then in a separate terminal, run the Next.js dev server:

```bash
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000).

On first run, migrate the database:

```bash
yarn docker:migrate
```

### Production (Docker)

```bash
yarn docker:prod
```

Or detached:

```bash
yarn docker:prod:detach
```

## Scripts

| Command | Description |
| :--- | :--- |
| `yarn dev` | Start Next.js dev server with hot reload |
| `yarn build` | Build for production |
| `yarn docker:dev` | Start PostgreSQL + Stripe CLI containers |
| `yarn docker:dev:detach` | Same, detached |
| `yarn docker:dev:down` | Stop dev services |
| `yarn docker:migrate` | Run DB migrations against local Docker postgres |
| `yarn docker:prod` | Build and start full production Docker stack |
| `yarn docker:prod:detach` | Same, detached |
| `yarn docker:prod:down` | Stop production stack |
| `yarn db:migrate` | Run migrations against `DATABASE_URL` |

## Project Structure

```
app/
├── api/
│   ├── avatars/[filename]/   # Serves uploaded avatars
│   ├── billing/              # Stripe subscription endpoints
│   ├── webhooks/stripe/      # Stripe webhook handler
│   └── ...
├── (dashboard)/              # Authenticated app pages
└── ...
docker-compose.dev.yml        # Dev services: PostgreSQL + Stripe CLI
docker-compose.prod.yml       # Production: full stack
Dockerfile                    # Multi-stage build (standalone output)
start.sh                      # Container entrypoint
```

## Docker Architecture

- **Dev**: `docker-compose.dev.yml` runs only PostgreSQL and the Stripe CLI. The Next.js app runs locally via `yarn dev` for hot reload. Stripe webhooks are forwarded to `http://host.docker.internal:3000`.
- **Prod**: `docker-compose.prod.yml` builds the full stack including the Next.js app as a standalone Docker image (~566MB).

### Avatar Storage

Uploaded avatars are written to `/app/public/avatars/` inside the container. In production this should be mounted as a named volume for persistence. Avatars are served via `/api/avatars/[filename]` (Next.js standalone does not serve `public/` statically).

### Database Migrations

Migrations use the `better-auth` CLI. In production, run migrations before deploying:

```bash
DATABASE_URL=<your-db-url> BETTER_AUTH_BASE_URL=<your-url> npx @better-auth/cli@latest migrate --yes
```

---

&copy; 2025 Loghead / Onvo AI. All rights reserved.
