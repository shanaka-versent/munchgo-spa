# MunchGo SPA Deployment Status

**Date:** March 2, 2026  
**Status:** Ready for Deployment (Prerequisites Required)

## Summary

The MunchGo SPA has been prepared for deployment to AWS S3 and CloudFront. A production-ready build artifact exists in the `dist/` directory, along with comprehensive deployment tooling and documentation.

## Build Status

**Status:** ✓ Build Artifacts Ready

- **Location:** `/sessions/upbeat-charming-keller/mnt/Java-demo/munchgo-spa/dist/`
- **Last Built:** February 15, 2025
- **Contents:**
  - `index.html` - SPA entry point (no cache)
  - `assets/` - Hashed JavaScript, CSS, and media files (immutable)
  - `vite.svg` - Vite logo asset

The build artifacts are ready to deploy to AWS S3. These files were built from the React + TypeScript source code using Vite.

## Deployment Prerequisites

Before proceeding with deployment, ensure you have:

### 1. AWS Account Setup
- AWS Account with appropriate IAM permissions (S3, CloudFront)
- AWS CLI installed and configured
- AWS credentials available (Access Key, Secret Key, or IAM role)

### 2. AWS Resources Required
- **S3 Bucket:** For hosting static SPA assets
  - Name format: `munchgo-spa-[unique-id]`
  - Versioning enabled (recommended)
  - Public access blocked (CloudFront access via OAI)

- **CloudFront Distribution:** For CDN delivery
  - Origin: S3 bucket
  - Origin Access Identity (OAI) configured
  - Custom cache behaviors:
    - `/assets/*`: 1-year cache (immutable)
    - `index.html`: No cache (revalidate)
    - Default: 24-hour cache

### 3. Deployment Tools
- AWS CLI v2+
- Environment variables configured:
  - `SPA_BUCKET_NAME` - S3 bucket name
  - `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID
  - `AWS_REGION` - AWS region (e.g., `ap-southeast-2`)

## Deployment Methods

### Method 1: Manual Deployment (Recommended for Testing)

```bash
cd /sessions/upbeat-charming-keller/mnt/Java-demo/munchgo-spa

# Set environment variables
export SPA_BUCKET_NAME="your-bucket-name"
export CLOUDFRONT_DISTRIBUTION_ID="ABCDEFG1234567"
export AWS_REGION="ap-southeast-2"

# Run deployment commands
aws s3 sync dist/ "s3://${SPA_BUCKET_NAME}/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.json"

aws s3 cp dist/index.html "s3://${SPA_BUCKET_NAME}/index.html" \
  --cache-control "no-cache, no-store, must-revalidate"

aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"
```

### Method 2: Automated Deployment Script

```bash
cd /sessions/upbeat-charming-keller/mnt/Java-demo/munchgo-spa

# Set environment variables
export SPA_BUCKET_NAME="your-bucket-name"
export CLOUDFRONT_DISTRIBUTION_ID="ABCDEFG1234567"
export AWS_REGION="ap-southeast-2"

# Run provided deployment script
./deploy.sh
```

Features:
- Validates all prerequisites
- Deploys assets with 1-year cache headers
- Deploys index.html with no-cache headers
- Creates CloudFront invalidation
- Waits for invalidation completion
- Provides colored status output

### Method 3: GitHub Actions CI/CD (Automated)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
- Triggers on push to `main`
- Builds the SPA automatically
- Deploys to S3 with correct cache headers
- Invalidates CloudFront cache
- Runs E2E smoke tests
- Auto-creates issues on test failures

**To enable:**
1. Add required GitHub Secrets (see `DEPLOYMENT_GUIDE.md`)
2. Configure OIDC federation for AWS
3. Push to `main` branch to trigger deployment

## File Structure

```
munchgo-spa/
├── dist/                          # Production build artifacts
│   ├── index.html                # Entry point (no cache)
│   ├── assets/                   # Hashed assets (1-year cache)
│   │   ├── index-[hash].js
│   │   ├── index-[hash].css
│   │   └── ...
│   └── vite.svg
├── src/                           # Source code
├── e2e/                           # End-to-end tests
├── .github/workflows/
│   └── deploy.yml                 # GitHub Actions CI/CD
├── package.json                   # Dependencies and scripts
├── vite.config.ts                 # Build configuration
├── tsconfig.json                  # TypeScript configuration
├── deploy.sh                      # Automated deployment script
├── DEPLOYMENT_GUIDE.md            # Detailed deployment instructions
├── DEPLOYMENT_STATUS.md           # This file
└── README.md                      # Project documentation
```

## Known Issues and Workarounds

### Node Modules Permission Issues

The `node_modules` directory has file permission restrictions that may prevent clean reinstalls.

**Workaround:** Use the existing `dist/` directory for deployment (which is already built).

If you need to rebuild:
1. Run `npm ci` (clean install from lock file)
2. If that fails, use Docker: `docker run -v $(pwd):/app node:20 sh -c "cd /app && npm ci && npm run build"`

## Next Steps

### For Immediate Deployment

1. **Obtain AWS Resources:**
   - Create S3 bucket and CloudFront distribution (or use existing ones)
   - Ensure you have S3 and CloudFront IAM permissions

2. **Configure Deployment:**
   - Set environment variables: `SPA_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`, `AWS_REGION`
   - Verify AWS credentials are available

3. **Execute Deployment:**
   - Run `./deploy.sh` or use AWS CLI commands directly
   - Verify deployment using provided verification steps

4. **Verify and Test:**
   - Check S3 bucket contents
   - Test CloudFront distribution URL
   - Run E2E tests against live URL

### For Continuous Deployment

1. **Configure GitHub Actions:**
   - Add AWS secrets to repository settings
   - Set up OIDC federation with GitHub
   - Push to `main` to trigger automated deployment

2. **Monitor Deployments:**
   - Watch GitHub Actions workflow runs
   - Review E2E test results
   - Check CloudFront metrics in AWS Console

## Documentation

- **DEPLOYMENT_GUIDE.md** - Complete step-by-step deployment instructions
- **README.md** - Project overview and development setup
- **.github/workflows/deploy.yml** - GitHub Actions workflow definition
- **deploy.sh** - Deployment script with prerequisite validation

## Support Resources

- **AWS S3 Documentation:** https://docs.aws.amazon.com/s3/
- **CloudFront Documentation:** https://docs.aws.amazon.com/cloudfront/
- **GitHub Actions:** https://docs.github.com/actions
- **Infrastructure Repository:** Kong-Konnect-Cloud-Gateway-on-EKS
- **Microservices Repository:** munchgo-microservices

## Summary

The MunchGo SPA is fully prepared for deployment. All build artifacts are ready, deployment tooling is in place, and comprehensive documentation is available. The next step is to configure AWS resources and execute the deployment using one of the provided methods.

For detailed instructions, see **DEPLOYMENT_GUIDE.md**.
