# Kong Gateway Issue — Root Cause & Fix

## What Happened

All API endpoints (`/api/v1/auth/*`, `/api/v1/restaurants/*`, etc.) started returning **503 "name resolution failed"** errors. The SPA could load (served from S3/CloudFront) but every API call failed.

## Background: How Kong Config Works

Kong Gateway sits between CloudFront and the microservices in EKS. Its configuration (routes, services, plugins) is managed declaratively via `kong.yaml` using [decK](https://docs.konghq.com/deck/latest/).

The `kong.yaml` file in git uses **placeholder values** instead of real infrastructure hostnames — this prevents secrets and environment-specific values from being committed:

```yaml
# In git (safe to commit):
services:
  - name: auth-service
    host: PLACEHOLDER_NLB_DNS
    port: 443
    protocol: https

plugins:
  - name: openid-connect
    config:
      issuer: PLACEHOLDER_COGNITO_ISSUER
```

```yaml
# What Kong actually needs (real infrastructure values):
services:
  - name: auth-service
    host: k8s-istioing-kongclou-69f90142a1-f015dfcad37e02ef.elb.ap-southeast-2.amazonaws.com
    port: 443
    protocol: https

plugins:
  - name: openid-connect
    config:
      issuer: https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_AbCdEfG
```

### The Normal Deployment Flow

The infrastructure setup script (`02-setup-cloud-gateway.sh`) handles this correctly:

```
1. Read real NLB hostname from kubectl / terraform output
2. Read real Cognito issuer URL from AWS
3. Replace placeholders in kong.yaml with real values
4. Run `deck gateway sync` to push config to Kong Konnect
5. Restore kong.yaml back to placeholders (git clean state)
```

## Root Cause

```
Timeline:

  PR #23 merged ──> CI triggered ──> deck sync ran ──> PLACEHOLDER_NLB_DNS
  to main           automatically     on kong.yaml      pushed to live Kong!
                                      (still had                │
                                       placeholders)            v
                                                        Kong tries to resolve
                                                        "PLACEHOLDER_NLB_DNS"
                                                        in DNS ──> FAILS
                                                                │
                                                                v
                                                        503 on ALL /api/*
                                                        endpoints
```

**A CI pipeline synced `kong.yaml` to the live Kong gateway without replacing the placeholders first.** Kong received a configuration telling it to route traffic to a hostname literally called `PLACEHOLDER_NLB_DNS` — which doesn't exist in DNS.

This happened because:
1. PR #23 was merged, which triggered the CI pipeline
2. The CI pipeline ran `deck gateway sync` as part of the deployment
3. At that point, PR #24 (which added a placeholder guard) hadn't been merged yet
4. So the sync pushed raw placeholder text into the live Kong control plane

## How We Fixed It

### Immediate Fix (manual)

```bash
# 1. Get real values from AWS
export AWS_PROFILE=stax-stax-au1-versent-innovation
export AWS_REGION=ap-southeast-2

NLB_HOST=$(kubectl get svc -n istio-ingress kong-cloud-gateway \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

POOL_ID=$(aws cognito-idp list-user-pools --max-results 10 \
  --query "UserPools[?Name=='munchgo-user-pool'].Id" --output text)

COGNITO_ISSUER="https://cognito-idp.${AWS_REGION}.amazonaws.com/${POOL_ID}"

# 2. Replace placeholders locally (NOT committed to git)
sed -i '' "s|PLACEHOLDER_NLB_DNS|${NLB_HOST}|g" kong.yaml
sed -i '' "s|PLACEHOLDER_COGNITO_ISSUER|${COGNITO_ISSUER}|g" kong.yaml

# 3. Sync real config to Kong Konnect
deck gateway sync kong.yaml \
  --konnect-addr https://au.api.konghq.com \
  --konnect-token-file ~/.kong/konnect-token \
  --konnect-control-plane-name MunchGo

# 4. Restore placeholders (don't commit real values)
git checkout kong.yaml
```

### Permanent Fix (PR #24)

Added a **placeholder guard** in the CI pipeline that prevents syncing if placeholders haven't been replaced:

```bash
# Guard: don't sync placeholders to live Kong
if grep -q "PLACEHOLDER_" deck/kong.yaml; then
  echo "WARNING: kong.yaml still contains placeholders — skipping deck sync"
  echo "Run 02-setup-cloud-gateway.sh to sync with real values"
  exit 0
fi
```

## Why This Is Confusing

The confusion comes from three things that have to stay in sync:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   kong.yaml in Git  │     │   Kong Konnect       │     │   AWS Infrastructure│
│                     │     │   (Live Gateway)     │     │                     │
│  Has PLACEHOLDERS   │     │  Needs REAL values   │     │  Creates real values│
│  (safe for git)     │     │  (NLB host, Cognito) │     │  (terraform apply)  │
└─────────┬───────────┘     └──────────▲──────────┘     └──────────┬──────────┘
          │                            │                            │
          │    02-setup-cloud-gateway.sh                           │
          │    reads real values ───────┼───────── from AWS ───────┘
          │    replaces placeholders    │
          └────── syncs to Kong ────────┘
                  restores placeholders
```

| Design Goal | Trade-off |
|-------------|-----------|
| Don't commit secrets/hostnames to git | kong.yaml must use placeholders |
| Kong needs real infrastructure values | Placeholders must be replaced before every sync |
| CI should automate deployments | CI must either replace placeholders or skip the sync |
| Multiple pipelines can touch Kong | Any pipeline that syncs without replacing = outage |

The core tension: **you can't have a single kong.yaml that's both safe for git AND ready for Kong.** The placeholder replacement step is the bridge between these two states, and if anything bypasses it, you get an outage.

## Lessons Learned

1. **Never sync kong.yaml directly from git** — always go through the setup script that replaces placeholders
2. **Guard CI pipelines** — check for placeholder strings before any `deck sync`
3. **Kong Konnect control plane name matters** — ours is `MunchGo` (not the default `kong-gw-poc` or `default`)
4. **Kong Konnect token** — stored locally at `~/.kong/konnect-token` (chmod 600), never committed to git
5. **The Konnect API endpoint is region-specific** — `https://au.api.konghq.com` for Australia

## Key Files

| File | Location | Purpose |
|------|----------|---------|
| `kong.yaml` | `munchgo-aws-iac/deck/kong.yaml` | Declarative Kong config (with placeholders) |
| `02-setup-cloud-gateway.sh` | `munchgo-aws-iac/scripts/` | Replaces placeholders + syncs to Kong |
| `konnect-token` | `~/.kong/konnect-token` | Kong Konnect PAT (local only, not in git) |
| `deploy.yml` | `munchgo-aws-iac/.github/workflows/` | CI pipeline (now has placeholder guard) |
