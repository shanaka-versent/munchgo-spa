# MunchGo SPA Deployment Guide

This guide provides step-by-step instructions for building and deploying the MunchGo Single Page Application to AWS S3 and CloudFront.

## Overview

The MunchGo SPA deployment follows a modern architecture:

1. **SPA Build**: React + TypeScript compiled to static assets with Vite
2. **S3 Hosting**: Static assets stored in an S3 bucket
3. **CloudFront CDN**: Content delivered via CloudFront for global distribution
4. **Cache Strategy**: 
   - Hashed assets (JS, CSS): 1-year cache (immutable)
   - index.html: No cache (revalidate on each request)

## Prerequisites

Before deploying, ensure you have:

### 1. AWS Account and IAM Permissions

Your AWS IAM user/role needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::BUCKET_NAME",
        "arn:aws:s3:::BUCKET_NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
    }
  ]
}
```

Replace `BUCKET_NAME`, `ACCOUNT_ID`, and `DISTRIBUTION_ID` with your actual values.

### 2. AWS CLI Installed

```bash
# Install AWS CLI (if not already installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Or via Homebrew (macOS)
brew install awscli
```

### 3. AWS Credentials Configured

```bash
# Option 1: Configure credentials interactively
aws configure

# Option 2: Export credentials as environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="ap-southeast-2"

# Option 3: Use IAM roles (recommended for CI/CD)
# Configure OIDC federation with GitHub Actions (see CI/CD section)
```

### 4. Node.js and npm

```bash
node --version  # v20 or higher
npm --version   # 10 or higher
```

## Step 1: Build the SPA

Navigate to the munchgo-spa directory and build the production bundle:

```bash
cd /path/to/munchgo-spa

# Install dependencies (if not already done)
npm install

# Run production build
npm run build

# The `dist/` directory now contains the optimized build
ls -la dist/
```

Output structure:
```
dist/
├── index.html          # Entry point (no cache)
├── assets/             # Hashed JavaScript, CSS, images
│   ├── index-abc123.js
│   ├── index-def456.css
│   └── ...
└── vite.svg
```

## Step 2: Prepare AWS Resources

### Option A: Use Existing Resources (Recommended)

If you already have an S3 bucket and CloudFront distribution set up:

```bash
# Get S3 bucket name
aws s3 ls | grep munchgo

# Get CloudFront distribution ID
aws cloudfront list-distributions --query 'DistributionList.Items[?Comment==`munchgo-spa`].Id' --output text
```

### Option B: Create New AWS Resources

If you need to create new S3 and CloudFront resources:

#### Create S3 Bucket

```bash
# 1. Create bucket (must be globally unique)
BUCKET_NAME="munchgo-spa-$(date +%s)"
aws s3 mb "s3://${BUCKET_NAME}" --region ap-southeast-2

# 2. Enable versioning (recommended)
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled

# 3. Block public access (CloudFront will access via OAI)
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# 4. Enable website hosting (optional, for error pages)
aws s3api put-bucket-website \
  --bucket "$BUCKET_NAME" \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'
```

#### Create CloudFront Distribution

```bash
# Use the Terraform module or AWS Console to create a distribution with:
# - S3 Origin: s3://${BUCKET_NAME}
# - Origin Access Identity (OAI) for S3 bucket access
# - Caching policies:
#   - Default: 24 hours (for index.html)
#   - /assets/*: 1 year (for hashed files)
# - Viewer protocol: HTTPS only
# - WAF: Optional but recommended
```

For detailed IaC setup, refer to `Kong-Konnect-Cloud-Gateway-on-EKS` Terraform code.

## Step 3: Deploy to S3 and CloudFront

### Option A: Manual Deployment (Recommended for testing)

#### Set Environment Variables

```bash
export SPA_BUCKET_NAME="your-bucket-name"
export CLOUDFRONT_DISTRIBUTION_ID="ABCDEFG1234567"
export AWS_REGION="ap-southeast-2"
```

#### Deploy Assets (with long cache)

```bash
# Deploy all files except index.html with 1-year cache headers
aws s3 sync dist/ "s3://${SPA_BUCKET_NAME}/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.json"
```

#### Deploy index.html (no cache)

```bash
# Deploy index.html with no-cache headers
aws s3 cp dist/index.html "s3://${SPA_BUCKET_NAME}/index.html" \
  --cache-control "no-cache, no-store, must-revalidate"
```

#### Invalidate CloudFront Cache

```bash
# Invalidate all paths in CloudFront
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"

# Monitor invalidation status
aws cloudfront list-invalidations \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID"
```

### Option B: Automated Deployment (Using Provided Script)

```bash
# 1. Set environment variables
export SPA_BUCKET_NAME="your-bucket-name"
export CLOUDFRONT_DISTRIBUTION_ID="ABCDEFG1234567"
export AWS_REGION="ap-southeast-2"

# 2. Run the deployment script
./deploy.sh

# Script output:
# Prerequisites validated
# Step 1: Deploying hashed assets (long cache - 1 year)
# Step 2: Deploying index.html (no-cache)
# Step 3: Invalidating CloudFront cache
# Step 4: Waiting for CloudFront invalidation to complete
# Deployment completed successfully!
```

### Option C: CI/CD Automated Deployment (GitHub Actions)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:

1. Builds the SPA on every push to `main`
2. Syncs to S3 with appropriate cache headers
3. Invalidates CloudFront cache
4. Runs E2E smoke tests
5. Auto-creates GitHub issues on test failure

**Required GitHub Secrets:**
- `AWS_ROLE_ARN`: IAM role for OIDC federation
- `AWS_REGION`: AWS region (e.g., `ap-southeast-2`)
- `SPA_BUCKET_NAME`: S3 bucket name
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID

**Setup OIDC with GitHub Actions:**

```bash
# 1. Create an IAM OIDC identity provider
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list "1b511abead59c6ce207077c0ef4118f7176cc7d2"

# 2. Create an IAM role for GitHub Actions
aws iam create-role \
  --role-name github-actions-munchgo-spa \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "StringLike": {
            "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/munchgo-spa:*"
          }
        }
      }
    ]
  }'

# 3. Attach S3 and CloudFront policy (see Prerequisites section)

# 4. Add secrets to GitHub repository settings
```

## Step 4: Verify Deployment

### Check S3 Bucket

```bash
# List all objects in the bucket
aws s3 ls "s3://${SPA_BUCKET_NAME}/" --recursive

# Verify cache control headers
aws s3api head-object \
  --bucket "$SPA_BUCKET_NAME" \
  --key "index.html" \
  --query 'CacheControl'

aws s3api head-object \
  --bucket "$SPA_BUCKET_NAME" \
  --key "assets/index-abc123.js" \
  --query 'CacheControl'
```

### Check CloudFront Distribution

```bash
# Get distribution details
aws cloudfront get-distribution \
  --id "$CLOUDFRONT_DISTRIBUTION_ID"

# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --id "INVALIDATION_ID"
```

### Test the Application

```bash
# Get the CloudFront domain name
CLOUDFRONT_URL=$(aws cloudfront get-distribution \
  --id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --query 'Distribution.DomainName' \
  --output text)

echo "Testing at: https://${CLOUDFRONT_URL}"

# Test homepage
curl -I "https://${CLOUDFRONT_URL}/"

# Test API connectivity (should return 403 or similar if gateway not configured)
curl -I "https://${CLOUDFRONT_URL}/api/v1/auth/health"
```

## Troubleshooting

### Issue: Access Denied to S3 Bucket

**Cause:** Insufficient IAM permissions or credentials not configured

**Solution:**
```bash
# Verify credentials
aws sts get-caller-identity

# Verify IAM policy
aws iam get-role-policy \
  --role-name YOUR_ROLE \
  --policy-name YOUR_POLICY_NAME
```

### Issue: CloudFront Returns 403 Forbidden

**Cause:** Origin Access Identity (OAI) not properly configured

**Solution:**
1. Verify OAI in CloudFront distribution settings
2. Check S3 bucket policy allows CloudFront OAI
3. Ensure bucket is not blocking public access (only CloudFront should access)

### Issue: Stale Content in CloudFront

**Cause:** Cache headers not set correctly

**Solution:**
```bash
# Force full invalidation
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"

# Verify new content is cached properly
curl -I "https://${CLOUDFRONT_URL}/" | grep -i cache-control
```

### Issue: Build Fails - Node Modules Permission Issues

**Cause:** File permissions in node_modules directory

**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use npx to bypass node_modules
npx tsc -b && npx vite build
```

## Monitoring and Maintenance

### Enable CloudFront Logging

```bash
aws cloudfront update-distribution \
  --id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --distribution-config '{
    ...
    "Logging": {
      "Enabled": true,
      "IncludeCookies": false,
      "Bucket": "YOUR_LOG_BUCKET.s3.amazonaws.com",
      "Prefix": "cloudfront-logs/"
    }
    ...
  }'
```

### Set Up CloudWatch Metrics

```bash
# Monitor distribution metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value="$CLOUDFRONT_DISTRIBUTION_ID" \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### Automatic Cleanup of Old S3 Versions

```bash
# Enable S3 object expiration policy (optional)
aws s3api put-bucket-lifecycle-configuration \
  --bucket "$SPA_BUCKET_NAME" \
  --lifecycle-configuration '{
    "Rules": [
      {
        "Id": "DeleteOldVersions",
        "Status": "Enabled",
        "NoncurrentVersionExpiration": {
          "NoncurrentDays": 30
        }
      }
    ]
  }'
```

## Related Resources

- **GitHub Actions Workflow:** `.github/workflows/deploy.yml`
- **Deployment Script:** `./deploy.sh`
- **Infrastructure Repository:** [Kong-Konnect-Cloud-Gateway-on-EKS](https://github.com/shanaka-versent/Kong-Konnect-Cloud-Gateway-on-EKS)
- **Microservices Repository:** [munchgo-microservices](https://github.com/shanaka-versent/munchgo-microservices)
- **AWS Documentation:** [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html), [CloudFront Caching](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Caching.html)
