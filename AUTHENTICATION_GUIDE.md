# Mindbody Authentication Guide

## Current Issue

You're seeing this error:
```
Staff identity authentication failed.
Code: DeniedAccess
```

This means your Mindbody staff credentials aren't configured correctly.

## Required Credentials

You need **3 things** from Mindbody:

### 1. API Key (Developer Portal)
Get from: https://developers.mindbodyonline.com/

1. Log into Developer Portal
2. Go to "API Keys"
3. Copy your API key

### 2. Site ID
- Use `-99` for all sites (recommended)
- Or use your specific studio's Site ID

### 3. Staff Credentials (Your Mindbody Account)
**Important:** These are NOT your developer portal credentials!

- **Username:** Your Mindbody staff login username
- **Password:** Your Mindbody staff password (the one you use to log into Mindbody business)

## Configuration

Update your `.env.local`:

```bash
# From Developer Portal
MINDBODY_API_KEY=your_api_key_from_developer_portal

# Site ID (-99 for all sites)
MINDBODY_SITE_ID=-99

# Your Mindbody staff account login (NOT developer portal)
MINDBODY_SOURCE_NAME=your_staff_username
MINDBODY_SOURCE_PASSWORD=your_staff_password

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-xxx
```

## How to Get Staff Credentials

### Option 1: Use Your Staff Account
If you have a Mindbody account at your studio:
- Username = Your email or username
- Password = Your Mindbody password

### Option 2: Create a Staff Account
If you don't have a staff account:
1. Log into Mindbody Business (mindbodyonline.com)
2. Go to **Staff Management**
3. Create a new staff member
4. Note the username and password
5. Make sure they have API access permissions

### Option 3: API Key Only (Limited)
Some endpoints work with just the API key:
- Leave `MINDBODY_SOURCE_NAME` and `MINDBODY_SOURCE_PASSWORD` empty
- Only read-only public endpoints will work
- Most useful features require authentication

## Testing Your Credentials

### Test 1: Check Environment Variables

```bash
# In your terminal
cd /Users/smagin07/Desktop/mindbody
cat .env.local
```

Make sure you see all 3 variables set.

### Test 2: Try the App

```bash
npm run dev
```

Then ask: "Show me today's classes"

**Look for these logs:**
```
[Mindbody API] Getting new access token...
[Mindbody API] Got new access token successfully  ✅ Good!
```

or

```
[Mindbody API] Token error: Staff identity authentication failed  ❌ Bad!
```

## Common Issues

### Issue 1: Wrong Password
**Error:** "Staff identity authentication failed"

**Solution:**
- Make sure you're using your **Mindbody business password**
- NOT your developer portal password
- Try logging into Mindbody business with these credentials first

### Issue 2: No Staff Account
**Error:** "Staff identity authentication failed"

**Solution:**
- Create a staff account in Mindbody
- Or ask your studio owner for staff credentials

### Issue 3: Missing API Permissions
**Error:** "DeniedAccess"

**Solution:**
- Log into Mindbody Business
- Go to Staff Management
- Find your staff account
- Enable "API Access" or "Developer" permissions

### Issue 4: Wrong Site ID
**Error:** API returns empty results

**Solution:**
- Try using `-99` for MINDBODY_SITE_ID
- Or get your specific Site ID from the developer portal

## What Works Without Staff Auth?

With just API key (no SOURCE_NAME/PASSWORD):
- ✅ Some public read endpoints
- ❌ Most useful endpoints (classes, clients, bookings)
- ❌ Any write operations

**Recommendation:** Get proper staff credentials for full functionality.

## API Authentication Flow

### How It Works

1. **First Request:**
   - App sends staff username/password to `/usertoken/issue`
   - Mindbody returns access token
   - Token cached for 23 hours

2. **Subsequent Requests:**
   - App uses cached token
   - No need to re-authenticate

3. **Token Expires:**
   - App automatically gets new token
   - Seamless to the user

### What Gets Sent

```http
POST https://api.mindbodyonline.com/public/v6/usertoken/issue
Headers:
  Content-Type: application/json
  Api-Key: your_api_key
  SiteId: -99
Body:
  {
    "Username": "your_staff_username",
    "Password": "your_staff_password"
  }
```

## Security Notes

### ✅ Secure
- Credentials stored in `.env.local` (not committed to git)
- Token cached to minimize auth requests
- HTTPS encryption for all requests

### ⚠️ Important
- Never commit `.env.local` to git
- Never share your staff password
- Use environment variables in production (Vercel)

## Vercel Deployment

When deploying to Vercel:

1. Go to your project settings
2. Add Environment Variables:
   - `MINDBODY_API_KEY`
   - `MINDBODY_SITE_ID`
   - `MINDBODY_SOURCE_NAME`
   - `MINDBODY_SOURCE_PASSWORD`
   - `OPENROUTER_API_KEY`
3. Redeploy

## Alternative: Service Account

For production, consider creating a dedicated "API Service Account":

1. Create a new staff member in Mindbody
2. Name it "API Service Account" or similar
3. Give minimal required permissions
4. Use those credentials for your app
5. Don't use your personal account

## Still Not Working?

### Step 1: Verify API Key
Log into developer portal and confirm your API key is active.

### Step 2: Test Credentials Manually
Try logging into Mindbody Business with your SOURCE_NAME/PASSWORD.

### Step 3: Check Permissions
Make sure your staff account has API access enabled.

### Step 4: Contact Mindbody Support
If all else fails:
- Email: api@mindbodyonline.com
- Developer Portal: Submit a ticket

## Example .env.local

```bash
# Get from: https://developers.mindbodyonline.com/
MINDBODY_API_KEY=74a8b2c9-3e5f-4d1a-9b7c-2e8f6a4d9c1b

# Use -99 for all sites
MINDBODY_SITE_ID=-99

# Your Mindbody staff login
MINDBODY_SOURCE_NAME=john@yogastudio.com
MINDBODY_SOURCE_PASSWORD=MyMindbodyPassword123

# Get from: https://openrouter.ai/
OPENROUTER_API_KEY=sk-or-v1-abc123...
```

## Quick Test

After configuring, run this:

```bash
npm run dev
```

Then visit http://localhost:3000 and ask:

> "Show me today's classes"

**Expected:**
- You should see a loading animation
- Then AI responds with class information
- Check terminal for `[Mindbody API]` logs

**If you see classes:** ✅ Authentication working!

**If you see error:** ❌ Check credentials again

## Resources

- **Mindbody Developer Portal:** https://developers.mindbodyonline.com/
- **API Documentation:** https://developers.mindbodyonline.com/PublicDocumentation/V6
- **Authentication Guide:** https://developers.mindbodyonline.com/GettingStarted

---

**Need help?** Check the terminal logs - they show exactly what's happening with authentication.

