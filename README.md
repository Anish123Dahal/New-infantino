# INFANTINO OUT — petition and voting platform

A full-stack, privacy-conscious public campaign application built with Next.js 15, strict TypeScript, PostgreSQL/Prisma, Redis and BullMQ. The visual system is original. **Counters start at zero and display accepted stored activity only**—the project never seeds or fabricates popularity.

## Included

- Responsive SSR shell and interactive campaign experience, signature modal, secure public vote, recent anonymized activity, aggregate statistics, country participation, updates and legal pages
- PostgreSQL schema with UUIDs, foreign keys, uniqueness guarantees, audit/fraud records, daily rollups and query indexes
- Redis rate limits and cached counters with database fallback; verified-counter updates use atomic `INCR`
- Pending → email-verified signature lifecycle; encrypted PII and keyed hashes for duplicate checks
- Turnstile server verification in production; IP and device signals are one-way hashed
- Admin credentials, Argon2 password hashes, signed HTTP-only same-site sessions and protected dashboard API
- Health/readiness endpoints, Docker, Compose, Kubernetes HPA and CI
- Queue worker stubs with concrete daily aggregation; email/fraud providers plug into isolated jobs
- SEO metadata, Open Graph, sitemap, robots, semantic markup and image optimization

## Run locally

Prerequisites: Node 22+, Docker and Docker Compose.

```bash
cp .env.example .env
# Replace JWT_SECRET and HASH_PEPPER; set admin credentials.
docker compose up -d postgres redis
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. Admin is at `/admin`. Without SMTP in development, a one-click local verification control appears after signing. Production never returns verification tokens in API responses.

To run all containers, first migrate and seed the database, then:

```bash
docker compose up --build
```

## Critical flows

### Signature

1. Client sends validated consent, PII, CAPTCHA token and idempotency key.
2. WAF/Turnstile and Redis rate limits reject obvious abuse.
3. API encrypts name/email, computes keyed hashes and writes `Signature(PENDING)` plus token in one PostgreSQL transaction.
4. Unique `(campaignId,emailHash)` is the final race-safe duplicate guard.
5. Email is queued; user verifies token.
6. Verification transaction marks the record `VERIFIED`; only then is Redis atomically incremented.
7. If Redis is down, the write still succeeds and reads fall back to an indexed PostgreSQL count. A reconciliation/aggregation job restores Redis.

### Vote

`POST /api/votes` validates option membership, CAPTCHA/rate limit and email-derived voter hash. PostgreSQL uniquely constrains `(campaignId,voterHash)`. The client cannot submit counts. Results aggregate only `ACCEPTED` rows.

Run tests:

```bash
npm test
npm run build
```

## API

Public:
- `GET /api/campaign`
- `GET /api/campaign/stats`
- `POST /api/signatures`
- `GET /api/signatures/recent`
- `POST /api/auth/verify-email`
- `POST /api/votes`
- `GET /api/votes/results`
- `GET /api/health`, `GET /api/ready`

All errors use `{ "error": { "code", "message", "details?" } }`. Admin routes require the signed session cookie and every future mutation must write `AuditLog` in the same transaction.

## Production architecture

```text
Browser → Cloudflare DNS/CDN/WAF/Turnstile → regional load balancer
        → stateless Next web/API pods → Redis Cluster (cache, rate limits, BullMQ)
                                     → PgBouncer → PostgreSQL primary
                                                 ↘ read replicas / analytics store
        → worker autoscaling → email, rollups, fraud, analytics
```

Recommended AWS mapping: Cloudflare or CloudFront + AWS WAF, ALB, EKS/ECS, ElastiCache Redis, RDS PostgreSQL Multi-AZ with PgBouncer/RDS Proxy, SQS/BullMQ workers, SES, S3, Secrets Manager, CloudWatch and Sentry/OpenTelemetry. Keep the app stateless. Use multi-zone nodes, pod disruption budgets and separate worker scaling.

### CDN policy

- Cache immutable `/_next/static/*` and images for one year.
- Cache campaign/stats/results at the edge for 5–60 seconds with stale-while-revalidate.
- Never cache POST, admin, session or verification responses.
- Purge campaign metadata after admin publication.

### Database/counter operations

Use PgBouncer transaction pooling. Direct writes only to primary; send non-critical reporting to replicas. Partition very large `Signature`, `Vote`, `AuditLog` and `FraudEvent` tables by campaign/time when volume warrants. Redis counters are a serving layer, not the source of truth. Run reconciliation jobs and alert on Redis/PostgreSQL drift. Removing a verified fraudulent signature must update PostgreSQL and counter in an audited operation.

### Failure policy

- PostgreSQL unavailable: reject writes with 503; never acknowledge an uncommitted signature.
- Redis unavailable: rate limiting degrades to WAF limits, reads fall back to database, and committed writes remain valid.
- Email/analytics/fraud unavailable: durable jobs retry with exponential backoff/dead-letter handling; signature request remains successful.
- Time-bound external calls (Turnstile: 3 seconds), configure ingress timeouts and circuit breakers, use idempotency on retries.

## Security launch checklist

1. Set strong Secrets Manager values; never bake `.env` into images.
2. Enforce HTTPS/HSTS at edge; restrict origin to CDN/ALB.
3. Configure Turnstile keys—production intentionally fails closed if absent.
4. Configure SMTP/SES and enqueue `send-verification-email` after commit (transactional outbox is recommended at multi-region scale).
5. Add CSRF tokens to future cookie-authenticated admin mutations, strict origin checks and step-up 2FA.
6. Use KMS envelope encryption rather than the included app-key AES helper if compliance requires key rotation.
7. Complete DPIA, controller identity/contact details and region-specific consent language before launch.
8. Load test POST and counter reconciliation separately; test bot, replay and shared-IP scenarios.

## Internationalization

The locale selector UI is prepared in the header. For launch, route copy through `next-intl` dictionaries for `en`, `es`, `fr`, `pt`, `de`, `it`, `ar`, `hi`, and `ne`; add RTL layout tests for Arabic and localized legal review. This repository intentionally avoids shipping machine-translated legal text as approved copy.

## Honest limitations / launch integrations

This repository contains working database-backed petition, verification, voting, authentication, caching and admin overview flows. Provider-specific SMTP delivery, full 2FA enrollment, traffic analytics, map tiles and a complete admin CRUD suite require operator accounts/policy decisions and are represented by secure extension points rather than fake implementations. Do not claim production readiness until those providers, retention rules, legal identity, backups, restore drills and load tests are configured.
