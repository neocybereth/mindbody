# Project Structure

## Complete File Tree

```
mindbody/
├── 📱 app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts           ✨ NEW: AI-powered streaming chat API
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx                  Updated: Metadata
│   └── page.tsx                    Updated: Uses Chat component
│
├── 🎨 components/
│   └── Chat.tsx                    ✨ NEW: Beautiful UI with useChat hook
│
├── 🛠️ lib/
│   ├── mcp-client.ts              Existing: MCP server connection
│   ├── mindbody-tools.ts          ✨ NEW: AI SDK tool definitions
│   ├── types.ts                   Existing: TypeScript types
│   └── utils.ts                   ✨ NEW: Utility functions
│
├── 📜 scripts/
│   └── setup.sh                    Updated: Includes OpenRouter setup
│
├── 📚 Documentation/
│   ├── AI_SDK_MIGRATION.md        ✨ NEW: AI features guide
│   ├── CHANGES_SUMMARY.md         ✨ NEW: What was built
│   ├── INSTALLATION.md            ✨ NEW: Setup instructions
│   ├── PROJECT_STRUCTURE.md       ✨ NEW: This file
│   ├── GETTING_STARTED.md         Existing: Getting started guide
│   ├── PROJECT_OVERVIEW.md        Existing: Technical details
│   ├── QUICKSTART.md              Existing: 5-minute guide
│   ├── README.md                  Updated: AI features
│   └── SETUP.md                   Existing: Detailed setup
│
├── 📦 Configuration/
│   ├── .env.example               ✨ NEW: Updated with OpenRouter
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json               Updated: AI SDK dependencies
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   └── yarn.lock
│
└── 🖼️ public/
    ├── file.svg
    ├── globe.svg
    ├── next.svg
    ├── vercel.svg
    └── window.svg
```

## Key Files Explained

### 🤖 Backend (AI & API)

#### `app/api/chat/route.ts` ✨ NEW
**The heart of the AI system**

```typescript
- Uses OpenRouter with Claude 3.5 Sonnet
- Streaming responses via streamText()
- AI intelligently selects Mindbody tools
- Handles errors and edge cases
- 30-second max duration
```

**What it does:**
1. Receives chat messages from frontend
2. Validates credentials (Mindbody + OpenRouter)
3. Initializes MCP connection
4. Calls AI with tools available
5. Streams response back to user

#### `lib/mindbody-tools.ts` ✨ NEW
**Tool definitions for AI**

```typescript
- 15+ Mindbody tools adapted for AI SDK
- Zod schemas for type safety
- Clear descriptions for AI understanding
- Executes MCP tool calls
```

**Tools included:**
- Classes: getClasses, getClassDescriptions, addClientToClass, etc.
- Clients: getClients, addClient, updateClient, getClientVisits
- Staff: getStaff, getStaffAppointments
- Locations: getLocations, getSites
- Services: getServices, getPackages

#### `lib/mcp-client.ts`
**MCP server connection**

```typescript
- Singleton client instance
- Stdio transport to MindbodyMCP
- Connection management
- Tool execution wrapper
```

#### `lib/utils.ts` ✨ NEW
**Helper functions**

```typescript
- Date/time formatting
- Date range calculations
- Utility functions
```

### 🎨 Frontend (UI & UX)

#### `components/Chat.tsx` ✨ NEW
**Main chat interface**

```typescript
- useChat hook from @ai-sdk/react
- Streaming message display
- Tool call badges
- Dashboard with quick actions
- Metric cards
- Sample prompts
- Loading states
- Error handling
```

**Features:**
- Beautiful gradient design
- Animated loading dots
- Tool call visualization
- Responsive layout
- Toggle dashboard view

#### `app/page.tsx`
**Main page (simplified)**

```typescript
import Chat from "@/components/Chat";
export default function Home() {
  return <Chat />;
}
```

### 📦 Dependencies

#### New Packages (AI SDK)

```json
{
  "@ai-sdk/openai": "^1.0.0",    // OpenRouter integration
  "@ai-sdk/react": "^1.0.0",     // React hooks
  "ai": "^4.0.0"                  // Core SDK
}
```

#### Existing Packages

```json
{
  "@modelcontextprotocol/sdk": "^1.23.0",  // MCP client
  "next": "16.0.4",                         // Framework
  "react": "19.2.0",                        // UI library
  "zod": "^4.1.13"                          // Schema validation
}
```

### 📚 Documentation

#### Must Read First

1. **CHANGES_SUMMARY.md** - What was built and how to start
2. **INSTALLATION.md** - Step-by-step setup
3. **AI_SDK_MIGRATION.md** - Understanding the AI features

#### Reference Guides

4. **README.md** - Project overview
5. **QUICKSTART.md** - 5-minute start
6. **SETUP.md** - Detailed configuration
7. **PROJECT_OVERVIEW.md** - Technical architecture

### ⚙️ Configuration

#### `.env.local` (You need to create this!)

```bash
# Mindbody API
MINDBODY_API_KEY=xxx
MINDBODY_SITE_ID=-99
MINDBODY_SOURCE_NAME=xxx
MINDBODY_SOURCE_PASSWORD=xxx

# OpenRouter (NEW!)
OPENROUTER_API_KEY=sk-or-v1-xxx

# Optional
DEFAULT_MODEL=anthropic/claude-3.5-sonnet
```

## Data Flow

```
User types message
    ↓
components/Chat.tsx (useChat hook)
    ↓
POST /api/chat
    ↓
app/api/chat/route.ts
    ↓
OpenRouter (Claude 3.5 Sonnet)
    ↓ (decides which tools to call)
lib/mindbody-tools.ts
    ↓
lib/mcp-client.ts
    ↓
MindbodyMCP Server (via stdio)
    ↓
Mindbody API (HTTPS)
    ↓
Response flows back (streaming)
    ↓
User sees formatted response
```

## File Sizes

```
app/api/chat/route.ts      3.2 KB   (AI streaming logic)
lib/mindbody-tools.ts     10.0 KB   (15+ tool definitions)
components/Chat.tsx       14.4 KB   (Beautiful UI)
lib/mcp-client.ts          2.5 KB   (MCP connection)
lib/utils.ts               1.6 KB   (Utilities)
lib/types.ts               0.8 KB   (Type definitions)
```

**Total new code: ~32 KB** (super lightweight!)

## Changes from Original

### ✅ Added

- AI-powered chat with OpenRouter
- Streaming responses
- 15+ Mindbody tool definitions
- Beautiful Cortex-inspired UI
- Dashboard with quick actions
- Tool call badges
- Comprehensive documentation
- Setup scripts

### ❌ Removed

- Simple intent detection logic
- Manual tool selection
- QuickActions component (integrated)
- Old tools API route

### 📝 Updated

- package.json (AI SDK dependencies)
- README.md (AI features)
- Chat component (useChat hook)
- Environment setup

## Quick Commands

### Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Setup environment
npm run setup
```

### Deployment

```bash
# Deploy to Vercel
vercel

# Or push to GitHub and deploy via Vercel UI
git push origin main
```

## What's Next?

### Immediate (Required)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get API keys:**
   - Mindbody: https://developers.mindbodyonline.com/
   - OpenRouter: https://openrouter.ai/

3. **Configure `.env.local`:**
   ```bash
   npm run setup
   # Then edit .env.local with your keys
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

### Optional (Customization)

5. **Change AI model** (in `.env.local`)
6. **Add more tools** (in `lib/mindbody-tools.ts`)
7. **Customize UI** (in `components/Chat.tsx`)
8. **Adjust AI behavior** (in `app/api/chat/route.ts`)

### Future (Enhancement)

9. **Deploy to production** (Vercel recommended)
10. **Add authentication** (NextAuth.js)
11. **Add analytics** (Vercel Analytics)
12. **Add more features** (Your ideas!)

## Support

### Documentation
- **Setup:** INSTALLATION.md
- **Features:** AI_SDK_MIGRATION.md
- **Overview:** README.md

### External Resources
- **AI SDK:** https://sdk.vercel.ai/docs
- **OpenRouter:** https://openrouter.ai/docs
- **Mindbody API:** https://developers.mindbodyonline.com/
- **MindbodyMCP:** https://github.com/vespo92/MindbodyMCP

### Issues
Create an issue in your repository or check the docs above.

---

**Your AI-powered Mindbody assistant is ready to go!** 🚀

Run `npm install` → Add your keys → `npm run dev` → Start chatting!

