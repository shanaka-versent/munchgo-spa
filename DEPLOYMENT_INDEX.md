# MunchGo SPA Deployment - Quick Index

Complete deployment preparation for the MunchGo Single Page Application to AWS S3 and CloudFront.

## Getting Started

Start here based on your situation:

### Option 1: Quick Deployment (5-10 minutes)
If you have AWS resources already set up:
1. Read: [Quick Start](#quick-start)
2. Run: `./deploy.sh`
3. Verify: Check CloudFront URL

### Option 2: Complete Guide (30+ minutes)
If you need step-by-step instructions:
1. Read: **DEPLOYMENT_GUIDE.md** (comprehensive guide)
2. Create AWS resources (S3 bucket, CloudFront)
3. Configure credentials
4. Execute deployment

### Option 3: CI/CD Automation (GitHub Actions)
For continuous deployment:
1. Read: **DEPLOYMENT_GUIDE.md** - CI/CD section
2. Configure GitHub Secrets
3. Push to main branch
4. Automatic deployment triggered

## Quick Start

```bash
# 1. Set environment variables
export SPA_BUCKET_NAME="your-bucket-name"
export CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"
export AWS_REGION="ap-southeast-2"

# 2. Run deployment script
./deploy.sh

# 3. Check your CloudFront URL
https://your-cloudfront-domain.cloudfront.net
```

## Build Status

- **Status**: Ready for deployment
- **Location**: `dist/` directory
- **Size**: ~344 KB (optimized)
- **Files**: 
  - `index.html` (459 bytes)
  - `assets/index-*.css` (25 KB)
  - `assets/index-*.js` (318 KB)

## Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **DEPLOYMENT_GUIDE.md** | Complete step-by-step guide | 20-30 min |
| **DEPLOYMENT_STATUS.md** | Status overview & quick reference | 5-10 min |
| **deploy.sh** | Automated deployment script | N/A (run it) |
| **README.md** | Project overview | 10 min |
| **.github/workflows/deploy.yml** | CI/CD workflow | 5-10 min |

## Deployment Methods

### Method 1: Automated Script (Easiest)
```bash
./deploy.sh
```
- Validates prerequisites
- Deploys with correct cache headers
- Creates CloudFront invalidation
- Shows progress and completion

### Method 2: Manual AWS CLI
```bash
# Deploy assets
aws s3 sync dist/ s3://BUCKET/ --delete --cache-control "public, max-age=31536000, immutable" --exclude "index.html"

# Deploy index.html
aws s3 cp dist/index.html s3://BUCKET/index.html --cache-control "no-cache, no-store, must-revalidate"

# Invalidate cache
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

### Method 3: GitHub Actions (Recommended for Production)
1. Add AWS secrets to GitHub repository settings
2. Push to main branch
3. Automatic deployment triggered

## Prerequisites Checklist

Before deploying:

- [ ] AWS Account
- [ ] S3 Bucket created
- [ ] CloudFront Distribution created
- [ ] IAM permissions configured
- [ ] AWS CLI installed
- [ ] AWS Credentials configured
- [ ] Environment variables set

## What Gets Deployed

```
S3 Bucket (SPA_BUCKET_NAME)
├── index.html                    (no cache - revalidate always)
├── assets/index-BmPMkG0N.css    (1 year cache - immutable)
└── assets/index-D6N9Y2lL.js     (1 year cache - immutable)
        ↓
CloudFront Distribution (CLOUDFRONT_DISTRIBUTION_ID)
        ↓
Global CDN with SSL/TLS
```

## Deployment Workflow

```
1. Source Code (GitHub)
   ↓
2. GitHub Actions (optional)
   - npm install
   - npm run build
   - npm run lint
   ↓
3. Deploy Script / AWS CLI
   - Sync to S3 with cache headers
   - Deploy index.html separately
   - Create CloudFront invalidation
   ↓
4. CloudFront
   - Invalidate all paths
   - Wait for propagation
   ↓
5. Global Delivery
   - Users access via CloudFront
   - Assets cached for 1 year
   - index.html revalidated each request
```

## Verification

After deployment, verify with:

```bash
# Check S3 contents
aws s3 ls s3://BUCKET/ --recursive

# Test CloudFront URL
curl -I https://CLOUDFRONT_DOMAIN/
curl -I https://CLOUDFRONT_DOMAIN/assets/index-*.js

# Check cache headers
curl -I https://CLOUDFRONT_DOMAIN/ | grep -i cache-control

# Run E2E tests (if configured)
BASE_URL=https://CLOUDFRONT_DOMAIN npm test
```

## Support & Resources

### Documentation
- **DEPLOYMENT_GUIDE.md** - Full deployment instructions
- **DEPLOYMENT_STATUS.md** - Status and quick reference
- **README.md** - Project overview and dev setup

### AWS Resources
- [S3 Documentation](https://docs.aws.amazon.com/s3/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [CloudFront Caching Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Caching.html)

### GitHub Resources
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [OIDC in GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)

### Related Repositories
- **Kong-Konnect-Cloud-Gateway-on-EKS** - Infrastructure & IaC
- **munchgo-microservices** - Backend services
- **munchgo-k8s-config** - Kubernetes manifests

## Common Issues

### Issue: AWS CLI Not Found
**Solution:** Install AWS CLI from https://aws.amazon.com/cli/

### Issue: AWS Credentials Not Configured
**Solution:** Run `aws configure` or export environment variables

### Issue: Access Denied to S3
**Solution:** Verify IAM permissions for S3 and CloudFront

### Issue: Cache Headers Not Applied
**Solution:** Verify script deployment or manually set headers in S3

For more troubleshooting, see **DEPLOYMENT_GUIDE.md**

## Files Summary

```
munchgo-spa/
├── dist/                         # Production build artifacts
├── src/                          # TypeScript + React source
├── e2e/                          # End-to-end tests
├── deploy.sh                     # Deployment script (NEW)
├── DEPLOYMENT_GUIDE.md           # Complete guide (NEW)
├── DEPLOYMENT_STATUS.md          # Quick reference (NEW)
├── DEPLOYMENT_INDEX.md           # This file (NEW)
├── README.md                     # Project overview
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Build configuration
└── .github/workflows/
    └── deploy.yml               # CI/CD workflow
```

## Next Steps

1. **Read**: Choose a deployment method above
2. **Prepare**: Ensure all prerequisites are met
3. **Deploy**: Run deployment script or manual commands
4. **Verify**: Test the CloudFront URL
5. **Monitor**: Track GitHub Actions runs (if using CI/CD)

## Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Build Artifacts | ✓ Ready | dist/ verified |
| Deployment Script | ✓ Ready | deploy.sh executable |
| Documentation | ✓ Complete | Comprehensive guides |
| CI/CD Workflow | ✓ Configured | Requires GitHub Secrets |
| AWS Resources | ⚠ Needed | Create S3 + CloudFront |
| Credentials | ⚠ Needed | Configure AWS access |

**Overall Status: Ready for Deployment**

---

**For detailed instructions, see DEPLOYMENT_GUIDE.md**

**For quick reference, see DEPLOYMENT_STATUS.md**
