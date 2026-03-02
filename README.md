# MunchGo SPA

React + TypeScript + Vite single-page application for the MunchGo food delivery platform. This SPA replaces the monolith Thymeleaf frontend and connects to microservices via an API gateway.

## UI Parity with Monolith

The SPA maintains content parity with the monolith Thymeleaf templates. All page headings, button labels, navigation links, feature card titles, and form element text match the monolith exactly. Only styling and technology differ (TailwindCSS vs Bootstrap, React Router vs server-side rendering, JWT vs session auth).

Known intentional differences (driven by the modernised architecture):

- **Login uses email** instead of username (Cognito identity provider)
- **Register uses role tabs** instead of a dropdown select
- **SPA auto-logs-in** after registration (no redirect to `/login?registered`)
- **No "Remember me" checkbox** (JWT-based auth handles persistence)
- **No admin/users page** (users managed via Cognito console, not DB)
- **No dedicated 403 page** (RequireAuth redirects to `/login`)
- **Order cancel** allowed for APPROVAL_PENDING + APPROVED (monolith: APPROVED only)

The E2E test suite includes a dedicated **UI parity test** (`e2e/tests/09-ui-parity.spec.ts`) that validates content alignment across all pages.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Auth:** Amazon Cognito (JWT)
- **Hosting:** S3 + CloudFront + WAF
- **API Gateway:** Kong

## Development

```bash
npm install
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build → dist/
npm run lint         # ESLint check
```

## E2E Tests

End-to-end tests use [Playwright](https://playwright.dev/) and run against the live CloudFront deployment.

```bash
cd e2e
npm install
npx playwright install --with-deps chromium
npx playwright test              # Headless run
npx playwright test --ui         # Interactive UI mode
npx playwright show-report       # View HTML report after a run
```

Override the target URL with `BASE_URL`:

```bash
BASE_URL=http://localhost:5173 npx playwright test
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs three jobs on push to `main`:

| Job | Description |
|-----|-------------|
| **Build & Lint** | Install dependencies, lint, build production bundle, upload `dist/` artifact |
| **Deploy** | Download artifact, sync to S3, invalidate CloudFront cache (requires `production` environment) |
| **E2E Smoke Tests** | Wait for CloudFront propagation, run Playwright tests, upload report artifact. On failure, auto-creates a GitHub issue with the `e2e-failure` label |

### Required Secrets & Variables

| Name | Type | Description |
|------|------|-------------|
| `AWS_ROLE_ARN` | Secret | IAM role ARN for OIDC federation |
| `AWS_REGION` | Secret | AWS region (e.g. `ap-southeast-2`) |
| `SPA_BUCKET_NAME` | Secret | S3 bucket name for SPA hosting |
| `CLOUDFRONT_DISTRIBUTION_ID` | Secret | CloudFront distribution ID for cache invalidation |
| `CLOUDFRONT_URL` | Variable (optional) | CloudFront URL for e2e tests (falls back to hardcoded default) |
