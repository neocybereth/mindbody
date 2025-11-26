# Troubleshooting Guide

## Common Errors & Solutions

### 1. "Invalid arguments for tool getClientVisits: clientId is required"

**Error:**
```
Invalid input: expected string, received undefined
path: ["clientId"]
```

**What it means:** The AI tried to get client visit history without knowing which client.

**Solution:** The AI should now ask you which client you want. If it doesn't, try:
- "Show me visit history for client Sarah Johnson" (includes client name)
- "Find Sarah Johnson, then show her visits" (explicit two-step)

**Why it happens:** `getClientVisits` requires a specific client ID, but the AI was trying to call it with just dates.

**Fixed in latest version:** The AI now knows to ask for clarification or search for the client first.

---

### 2. "Staff identity authentication failed"

**Error:**
```
[Mindbody API] Token error: {"Error":{"Message":"Staff identity authentication failed.","Code":"DeniedAccess"}}
```

**What it means:** Your Mindbody staff credentials are incorrect or missing.

**Solution:**

1. Check your `.env.local` file:
```bash
MINDBODY_SOURCE_NAME=your_mindbody_username
MINDBODY_SOURCE_PASSWORD=your_mindbody_password
```

2. These are your **Mindbody business login credentials**, NOT your developer portal password.

3. Test them by logging into Mindbody Business: https://clients.mindbodyonline.com/

4. If you don't have staff credentials, see `AUTHENTICATION_GUIDE.md`

---

### 3. "OpenRouter API key not configured"

**Error:**
```
OpenRouter API key not configured
```

**Solution:**

1. Get an API key from https://openrouter.ai/
2. Add to `.env.local`:
```bash
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```
3. Restart server: `npm run dev`

---

### 4. Frontend shows "An error occurred"

**What to check:**

1. **Look at terminal logs** - The real error is there
2. **Check `.env.local` exists** - All required variables set
3. **Restart dev server** - `npm run dev` after changes
4. **Check browser console** - May show additional details

**Common causes:**
- Missing environment variables
- Invalid Mindbody credentials  
- Network/API issues
- Tool validation errors (like missing IDs)

---

### 5. "Cannot find module '@ai-sdk/openai'"

**Error:**
```
Module not found: Can't resolve '@ai-sdk/openai'
```

**Solution:**
```bash
npm install
```

Make sure all dependencies are installed.

---

### 6. Empty Results from Mindbody API

**Symptoms:**
- "No classes found"
- "No clients found"
- Empty arrays returned

**What to check:**

1. **Site ID**: Try `-99` for all sites:
```bash
MINDBODY_SITE_ID=-99
```

2. **Date ranges**: Make sure dates are valid
```javascript
// Today's classes
startDateTime: 2025-11-26T00:00:00
endDateTime: 2025-11-26T23:59:59
```

3. **Authentication**: Some endpoints require staff credentials

4. **Data exists**: Check in Mindbody that the data actually exists

---

### 7. AI Keeps Trying Invalid Tool Calls

**Symptoms:**
- AI repeatedly calls tools with missing parameters
- Same error multiple times
- Tool validation keeps failing

**Solutions:**

1. **Restart dev server** to pick up latest prompt changes
```bash
# Stop server (Ctrl+C)
npm run dev
```

2. **Be more specific** in your query:
- ❌ "Show me visits" (AI doesn't know which client)
- ✅ "Show me visits for Sarah Johnson"

3. **Use two-step queries**:
- "First find client Sarah Johnson"
- Then: "Now show her visit history"

4. **Check `app/api/chat/route.ts`** - System prompt may need adjustment

---

### 8. Server Won't Start

**Error:**
```
Port 3000 is already in use
```

**Solution:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

---

### 9. Changes Not Reflecting

**If your code changes aren't showing:**

1. **Hard refresh browser** - `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Clear Next.js cache**:
```bash
rm -rf .next
npm run dev
```
3. **Check you saved the file** - VSCode shows a dot if unsaved
4. **Restart dev server** - Some changes require restart

---

### 10. TypeScript Errors in IDE

**If VSCode shows type errors:**

1. **Restart TypeScript server**:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
   - Type "TypeScript: Restart TS Server"
   - Press Enter

2. **Check tsconfig.json** exists and is valid

3. **Reinstall dependencies**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Debugging Tips

### Enable Verbose Logging

The app already logs extensively. Check terminal for:
- `[Chat API]` - API route logs
- `[Mindbody API]` - Mindbody API calls
- `[Mindbody Tools]` - Tool execution

### Check Environment Variables

```bash
# View your .env.local
cat .env.local

# Or check in Node
node -e "console.log(require('dotenv').config())"
```

### Test Individual Components

1. **Test OpenRouter**:
```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer sk-or-v1-YOUR_KEY"
```

2. **Test Mindbody API**:
```bash
curl https://api.mindbodyonline.com/public/v6/site/sites \
  -H "Api-Key: YOUR_KEY" \
  -H "SiteId: -99"
```

### Read Full Error Stack

When an error occurs, check terminal for the FULL stack trace - it shows exactly where the error happened.

---

## Quick Fixes

### Fix 1: Fresh Start
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Fix 2: Check All Credentials
```bash
grep -E "API_KEY|SOURCE_NAME|SOURCE_PASSWORD" .env.local
```

### Fix 3: Reset Database (if applicable)
Usually not needed, but if caching issues:
```bash
# Clear any cached tokens
rm -rf .next/cache
```

---

## Still Having Issues?

### Step 1: Check Documentation
- `CURRENT_STATUS.md` - Current state and next steps
- `AUTHENTICATION_GUIDE.md` - Credential issues
- `DIRECT_API_MIGRATION.md` - Technical details

### Step 2: Check Terminal Output
The terminal shows detailed logs of what's happening. Look for:
- Red error messages
- Tool call details
- API responses

### Step 3: Check Browser Console
Press `F12` and look at:
- Console tab for JavaScript errors
- Network tab for failed requests

### Step 4: Common Patterns

**Pattern:** AI tries to do something without required info
**Fix:** Be more specific in your questions

**Pattern:** Authentication keeps failing
**Fix:** Double-check credentials are for Mindbody business, not developer portal

**Pattern:** No data returned
**Fix:** Check site ID, try `-99` for all sites

---

## Emergency Reset

If nothing works:

```bash
# 1. Stop server
# Press Ctrl+C

# 2. Clean everything
rm -rf node_modules .next package-lock.json

# 3. Reinstall
npm install

# 4. Check environment
cat .env.local  # Make sure all keys are set

# 5. Start fresh
npm run dev
```

---

## Getting Help

When asking for help, include:

1. **Error message** from terminal (full stack trace)
2. **Your query** to the AI
3. **Environment** (check `.env.local` has required vars - don't share actual keys!)
4. **What you tried** already
5. **Logs** from terminal showing the issue

---

**Most issues are solved by:**
1. Checking `.env.local` has all required variables
2. Restarting the dev server
3. Being more specific in queries to the AI

