# Cloudflare R2 Audio Hosting Setup

This guide covers setting up private R2 storage for Rigveda audio files with a Worker proxy.

## Overview

- **R2 Bucket**: Stores 10,551 MP3 files (~2.3GB) - remains private
- **Worker**: Proxies requests, validates referer, serves audio
- **Cost**: Free tier covers ~10GB storage + 10M requests/month

## Prerequisites

1. Cloudflare account (free)
2. `wrangler` CLI installed: `npm install -g wrangler`
3. Logged in: `wrangler login`

---

## Step 1: Create R2 Bucket

```bash
# Create the bucket
wrangler r2 bucket create rigveda-audio

# Verify
wrangler r2 bucket list
```

---

## Step 2: Upload Audio Files

Wrangler doesn't support recursive directory uploads. Use **rclone** (recommended) or **AWS CLI**.

### Option A: Using rclone (Recommended)

```bash
# Install rclone
brew install rclone  # macOS
# or: sudo apt install rclone  # Linux

# Configure rclone for Cloudflare R2
rclone config

# When prompted:
# n) New remote
# name> r2
# Storage> s3
# provider> Cloudflare
# access_key_id> (from Cloudflare dashboard > R2 > Manage R2 API Tokens > Create API Token)
# secret_access_key> (from same place)
# region> auto
# endpoint> https://<ACCOUNT_ID>.r2.cloudflarestorage.com
# (leave other options as default)

# Upload all audio files (preserves directory structure)
rclone copy /path/to/rigveda-audio r2:rigveda-audio --progress --transfers=10

# Verify upload
rclone ls r2:rigveda-audio | head -20
```

### Option B: Using AWS CLI

```bash
# Install AWS CLI
brew install awscli  # macOS
# or: pip install awscli

# Configure with R2 credentials
aws configure
# AWS Access Key ID: (from R2 API Token)
# AWS Secret Access Key: (from R2 API Token)
# Default region: auto
# Default output format: json

# Upload using S3-compatible endpoint
aws s3 sync /path/to/rigveda-audio s3://rigveda-audio/ \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com

# Verify
aws s3 ls s3://rigveda-audio/ \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

### Option C: Using wrangler (one file at a time - slow but works)

```bash
cd /path/to/rigveda-audio

# Upload all files using a shell script
find . -name "*.mp3" | while read file; do
  # Remove leading ./ from path
  key="${file#./}"
  echo "Uploading $key..."
  wrangler r2 object put "rigveda-audio/$key" --file="$file"
done
```

**Note:** Option C will take several hours for 10,551 files. Options A and B are much faster with parallel uploads.

---

## Step 3: Deploy the Worker

```bash
cd /Users/hvina/projects/rigveda-sanatana/rigveda-app/cloudflare

# Deploy
wrangler deploy
```

After deployment, you'll get a URL like:
`https://rigveda-audio.<your-subdomain>.workers.dev`

---

## Step 4: Update Your Site

Edit `src/lib/config.ts`:

```typescript
// Change from local:
// export const AUDIO_BASE_URL = '/audio';

// To your Worker URL:
export const AUDIO_BASE_URL = 'https://rigveda-audio.<your-subdomain>.workers.dev';
```

Then rebuild and deploy your site.

---

## Step 5: Configure Allowed Domains

Edit `cloudflare/src/index.ts` and update the `ALLOWED_DOMAINS` array with your actual domain(s):

```typescript
const ALLOWED_DOMAINS = [
  'rigveda.yourdomain.com',
  'your-username.github.io',
  'localhost'  // remove in production if desired
];
```

Redeploy the worker after changes:
```bash
wrangler deploy
```

---

## Verification

Test the worker:

```bash
# Should return 403 (no referer)
curl -I https://rigveda-audio.<your-subdomain>.workers.dev/001/001/001.mp3

# Should return 200 (with valid referer)
curl -I -H "Referer: https://rigveda.yourdomain.com/" \
  https://rigveda-audio.<your-subdomain>.workers.dev/001/001/001.mp3
```

---

## Cost Estimate

| Resource | Free Tier | Your Usage | Cost |
|----------|-----------|------------|------|
| Storage | 10 GB | 2.3 GB | $0 |
| Class A ops (writes) | 1M/month | ~11K (one-time) | $0 |
| Class B ops (reads) | 10M/month | varies | $0* |
| Egress | Unlimited | - | $0 |

*If you exceed 10M reads/month, it's $0.36 per million.

---

## Troubleshooting

### CORS Errors
The worker includes CORS headers. If issues persist, check browser console for specific errors.

### 403 Forbidden
- Check that your site's domain is in `ALLOWED_DOMAINS`
- Verify the referer header is being sent (some privacy extensions block it)

### Audio Not Loading
- Check browser network tab for the actual error
- Verify the file exists: `wrangler r2 object get rigveda-audio/001/001/001.mp3 --file=/tmp/test.mp3`
