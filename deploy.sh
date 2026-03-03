#!/bin/bash
# MunchGo SPA Deployment Script to AWS S3 + CloudFront
# Prerequisites:
#   1. AWS CLI installed and configured with credentials
#   2. SPA_BUCKET_NAME environment variable set
#   3. CLOUDFRONT_DISTRIBUTION_ID environment variable set
#   4. Proper AWS IAM permissions for S3 and CloudFront

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}MunchGo SPA Deployment to AWS S3 + CloudFront${NC}"
echo "=================================================="
echo ""

# Validate prerequisites
if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI not found. Please install AWS CLI.${NC}"
    exit 1
fi

if [ -z "$SPA_BUCKET_NAME" ]; then
    echo -e "${RED}ERROR: SPA_BUCKET_NAME environment variable not set.${NC}"
    exit 1
fi

if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${RED}ERROR: CLOUDFRONT_DISTRIBUTION_ID environment variable not set.${NC}"
    exit 1
fi

# Verify dist directory exists
if [ ! -d "dist" ]; then
    echo -e "${RED}ERROR: dist/ directory not found. Run 'npm run build' first.${NC}"
    exit 1
fi

echo -e "${GREEN}Prerequisites validated${NC}"
echo "S3 Bucket: $SPA_BUCKET_NAME"
echo "CloudFront Distribution ID: $CLOUDFRONT_DISTRIBUTION_ID"
echo ""

# Step 1: Sync assets with long cache headers
echo -e "${YELLOW}Step 1: Deploying hashed assets (long cache - 1 year)${NC}"
aws s3 sync dist/ "s3://${SPA_BUCKET_NAME}/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "*.json" \
    --region "${AWS_REGION:-ap-southeast-2}"
echo -e "${GREEN}Assets deployed successfully${NC}"
echo ""

# Step 2: Deploy index.html with no-cache headers
echo -e "${YELLOW}Step 2: Deploying index.html (no-cache)${NC}"
aws s3 cp dist/index.html "s3://${SPA_BUCKET_NAME}/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --region "${AWS_REGION:-ap-southeast-2}"
echo -e "${GREEN}index.html deployed successfully${NC}"
echo ""

# Step 3: Invalidate CloudFront cache
echo -e "${YELLOW}Step 3: Invalidating CloudFront cache${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" \
    --region "${AWS_REGION:-ap-southeast-2}" \
    --query 'Invalidation.Id' \
    --output text)
echo "Invalidation ID: $INVALIDATION_ID"
echo -e "${GREEN}CloudFront invalidation initiated${NC}"
echo ""

# Step 4: Wait for invalidation to complete
echo -e "${YELLOW}Step 4: Waiting for CloudFront invalidation to complete...${NC}"
aws cloudfront wait invalidation-completed \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --id "$INVALIDATION_ID" \
    --region "${AWS_REGION:-ap-southeast-2}"
echo -e "${GREEN}CloudFront cache invalidation completed${NC}"
echo ""

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo "Your SPA is now live at the CloudFront distribution URL."
