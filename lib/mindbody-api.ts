// Direct Mindbody API client (no MCP dependency)

const MINDBODY_API_BASE = "https://api.mindbodyonline.com/public/v6";

interface MindbodyCredentials {
  apiKey: string;
  siteId: string;
  sourceName?: string;
  sourcePassword?: string;
  defaultToken?: string;
}

interface TokenInfo {
  token: string;
  expiresAt: Date;
  renewalCount: number;
  isDefault: boolean; // Track if this is a manually provided token
}

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

let tokenInfo: TokenInfo | null = null;

// ============================================
// SERVER-SIDE CACHE (for Mindbody API calls)
// ============================================
// Since React Query only works client-side, we need server-side caching
// for the API route's calls to Mindbody API
const apiCache = new Map<string, CacheEntry>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generates a cache key from the URL and request options
 */
function getCacheKey(url: string, options: RequestInit = {}): string {
  const method = options.method || "GET";
  const body = options.body ? JSON.stringify(options.body) : "";
  return `${method}:${url}:${body}`;
}

/**
 * Gets cached data if available and not expired
 */
function getCachedData(cacheKey: string): unknown | null {
  const entry = apiCache.get(cacheKey);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now > entry.expiresAt) {
    apiCache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

/**
 * Stores data in cache with TTL
 */
function setCachedData(
  cacheKey: string,
  data: unknown,
  ttl: number = DEFAULT_CACHE_TTL
): void {
  const expiresAt = Date.now() + ttl;
  apiCache.set(cacheKey, { data, expiresAt });
}

/**
 * Clears all cached data
 */
export function clearApiCache(): void {
  console.log("[Mindbody API] Clearing all cached data");
  apiCache.clear();
}

/**
 * Cleanup expired cache entries periodically
 */
function cleanupExpiredCache(): void {
  const now = Date.now();
  let removed = 0;
  for (const [key, entry] of apiCache.entries()) {
    if (now > entry.expiresAt) {
      apiCache.delete(key);
      removed++;
    }
  }
  if (removed > 0) {
    console.log(`[Mindbody API] Cleaned up ${removed} expired cache entries`);
  }
}

// Run cache cleanup every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredCache, 10 * 60 * 1000);
}

/**
 * Issues a new staff token from the Mindbody API
 */
async function issueToken(
  credentials: MindbodyCredentials
): Promise<TokenInfo | null> {
  console.log("[Mindbody API] Issuing new staff token...");
  console.log("[Mindbody API] Request details:");
  console.log(
    "[Mindbody API]   API Key:",
    credentials.apiKey ? credentials.apiKey.substring(0, 10) + "..." : "MISSING"
  );
  console.log("[Mindbody API]   Site ID:", credentials.siteId);
  console.log(
    "[Mindbody API]   Username:",
    credentials.sourceName || "MISSING"
  );
  console.log(
    "[Mindbody API]   Password:",
    credentials.sourcePassword
      ? "***" +
          credentials.sourcePassword.substring(
            credentials.sourcePassword.length - 3
          )
      : "MISSING"
  );

  try {
    const response = await fetch(`${MINDBODY_API_BASE}/usertoken/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": credentials.apiKey,
        SiteId: credentials.siteId,
      },
      body: JSON.stringify({
        Username: credentials.sourceName,
        Password: credentials.sourcePassword,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Mindbody API] Token issue failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return null;
    }

    const data = await response.json();

    // Parse the expiration date from the response
    const expiresAt = data.AccessTokenExpiration
      ? new Date(data.AccessTokenExpiration)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours if not provided

    console.log(
      "[Mindbody API] Staff token issued successfully, expires at:",
      expiresAt.toISOString()
    );
    console.log(data.AccessToken, "TOKEN INFFOOOOO");

    return {
      token: data.AccessToken,
      expiresAt,
      renewalCount: 0,
      isDefault: false,
    };
  } catch (error) {
    console.error("[Mindbody API] Failed to issue token:", error);
    return null;
  }
}

/**
 * Renews an existing staff token
 * Can extend token lifetime by 24 hours from current expiration, up to 7 renewals
 */
async function renewToken(
  credentials: MindbodyCredentials,
  currentToken: string
): Promise<TokenInfo | null> {
  console.log("[Mindbody API] Renewing staff token...");

  try {
    const response = await fetch(`${MINDBODY_API_BASE}/usertoken/renew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": credentials.apiKey,
        SiteId: credentials.siteId,
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Mindbody API] Token renewal failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return null;
    }

    const data = await response.json();

    const expiresAt = data.AccessTokenExpiration
      ? new Date(data.AccessTokenExpiration)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    console.log(
      "[Mindbody API] Token renewed successfully, new expiration:",
      expiresAt.toISOString()
    );

    return {
      token: data.AccessToken,
      expiresAt,
      renewalCount: (tokenInfo?.renewalCount || 0) + 1,
      isDefault: false,
    };
  } catch (error) {
    console.error("[Mindbody API] Failed to renew token:", error);
    return null;
  }
}

/**
 * Gets a valid access token, issuing a new one or renewing if necessary
 * Returns null if staff credentials are not provided or authentication fails
 */
async function getAccessToken(
  credentials: MindbodyCredentials
): Promise<string | null> {
  // If a default token is provided in env vars, use it
  if (credentials.defaultToken) {
    if (!tokenInfo || !tokenInfo.isDefault) {
      console.log(
        "[Mindbody API] Using default token from environment variable"
      );
      console.log(
        "[Mindbody API] ⚠️  Note: Token expiration cannot be validated for manually provided tokens"
      );
      tokenInfo = {
        token: credentials.defaultToken,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Assume valid for a year
        renewalCount: 0,
        isDefault: true,
      };
    }
    console.log(tokenInfo.token, "TOKEN INFFOOOOO");
    return tokenInfo.token;
  }

  // If no staff credentials provided, skip authentication (API key only)
  if (!credentials.sourceName || !credentials.sourcePassword) {
    console.log(
      "[Mindbody API] No staff credentials provided, using API key only"
    );
    return null;
  }

  const now = Date.now();
  const renewalThreshold = 60 * 60 * 1000; // Renew if expiring within 1 hour

  // Check if we have a valid cached token
  if (
    tokenInfo &&
    !tokenInfo.isDefault &&
    tokenInfo.expiresAt.getTime() > now + renewalThreshold
  ) {
    console.log(
      "[Mindbody API] Using cached token (expires:",
      tokenInfo.expiresAt.toISOString(),
      ")"
    );
    return tokenInfo.token;
  }

  // If token exists but is expiring soon, try to renew it (up to 7 renewals)
  if (
    tokenInfo &&
    !tokenInfo.isDefault &&
    tokenInfo.renewalCount < 7 &&
    tokenInfo.expiresAt.getTime() > now
  ) {
    console.log(
      `[Mindbody API] Token expiring soon, attempting renewal (${tokenInfo.renewalCount}/7)...`
    );
    const renewed = await renewToken(credentials, tokenInfo.token);
    if (renewed) {
      tokenInfo = renewed;
      return tokenInfo.token;
    }
    console.warn("[Mindbody API] Token renewal failed, will issue new token");
  }

  // Issue a new token
  console.log(
    "[Mindbody API] Attempting to issue new token with provided credentials..."
  );
  const newToken = await issueToken(credentials);
  if (newToken) {
    tokenInfo = newToken;
    return tokenInfo.token;
  }

  console.error("[Mindbody API] ❌ Staff authentication failed!");
  console.error("[Mindbody API] Please verify your credentials:");
  console.error(
    "[Mindbody API]   - MINDBODY_SOURCE_NAME should be your staff username/email"
  );
  console.error(
    "[Mindbody API]   - MINDBODY_SOURCE_PASSWORD should be your staff password"
  );
  console.error(
    "[Mindbody API]   - MINDBODY_SITE_ID should match your location"
  );
  console.error("[Mindbody API] ");
  console.error(
    "[Mindbody API] Alternatively, set MINDBODY_STAFF_TOKEN to use a pre-generated token"
  );

  return null;
}

async function mindbodyFetch(
  endpoint: string,
  credentials: MindbodyCredentials,
  toolName: string,
  options: RequestInit = {}
): Promise<unknown> {
  const url = `${MINDBODY_API_BASE}${endpoint}`;
  const method = options.method || "GET";

  // Only cache GET requests (not POST, PUT, DELETE, etc.)
  const shouldCache = method === "GET";
  const cacheKey = shouldCache ? getCacheKey(url, options) : "";

  // Check cache first (only for GET requests)
  if (shouldCache) {
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log(
        `[Mindbody API] ${toolName} - ✓ Cache hit (returning cached data)`
      );
      return cachedData;
    }
  }

  console.log(`[Mindbody API] ${toolName} - Fetching:`, url);

  try {
    const token = await getAccessToken(credentials);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "API-Key": credentials.apiKey,
      SiteId: credentials.siteId,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log(`[Mindbody API] ${toolName} - Using authenticated request`);
    } else {
      console.log(`[Mindbody API] ${toolName} - Using API key only`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(
      `[Mindbody API] ${toolName} - Response status:`,
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Mindbody API] ${toolName} - API Error:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      // Provide helpful error messages
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Authentication failed. Please check your Mindbody credentials in .env.local. ` +
            `Make sure MINDBODY_API_KEY, MINDBODY_SOURCE_NAME, and MINDBODY_SOURCE_PASSWORD are correct. ` +
            `Error: ${response.status} - ${errorText}`
        );
      }

      throw new Error(`Mindbody API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(
      `[Mindbody API] ${toolName} - Success, returned:`,
      data.PaginationResponse
        ? `${data.PaginationResponse.TotalResults} results`
        : "data received"
    );

    // Cache the successful response (only for GET requests)
    if (shouldCache) {
      setCachedData(cacheKey, data, DEFAULT_CACHE_TTL);
      console.log(`[Mindbody API] ${toolName} - ✓ Cached for 5 minutes`);
    }

    return data;
  } catch (error) {
    console.error(`[Mindbody API] ${toolName} - Fetch error:`, error);
    throw error;
  }
}

function buildQueryString(
  params: Record<
    string,
    string | number | boolean | Array<string | number> | undefined | null
  >
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, v.toString()));
    } else {
      search.append(key, value.toString());
    }
  });
  const str = search.toString();
  return str ? `?${str}` : "";
}

export function getMindbodyCredentials(): MindbodyCredentials {
  const apiKey = process.env.MINDBODY_API_KEY || "";
  const siteId = process.env.MINDBODY_SITE_ID || "-99";
  const sourceName = process.env.MINDBODY_USERNAME;
  const sourcePassword = process.env.MINDBODY_PASSWORD;
  const defaultToken = process.env.MINDBODY_STAFF_TOKEN;

  if (!apiKey) {
    console.error("[Mindbody API] MINDBODY_API_KEY is not set!");
    throw new Error(
      "MINDBODY_API_KEY is required. Please add it to your .env.local file."
    );
  }

  // Check if using a default token
  if (defaultToken) {
    console.log("[Mindbody API] ✓ Using MINDBODY_STAFF_TOKEN from environment");
    console.log("[Mindbody API]   Site ID:", siteId);
    console.log(
      "[Mindbody API]   Token:",
      defaultToken.substring(0, 20) + "..."
    );
    return {
      apiKey,
      siteId,
      sourceName,
      sourcePassword,
      defaultToken,
    };
  }

  if (!sourceName || !sourcePassword) {
    console.warn(
      "[Mindbody API] ⚠️  Staff credentials not provided. Tool calls require authentication!"
    );
    console.warn("[Mindbody API] Please add to .env.local:");
    console.warn("[Mindbody API]   MINDBODY_SOURCE_NAME=your_username");
    console.warn("[Mindbody API]   MINDBODY_SOURCE_PASSWORD=your_password");
    console.warn("[Mindbody API]   MINDBODY_SITE_ID=your_site_id");
    console.warn("[Mindbody API] ");
    console.warn(
      "[Mindbody API] OR set MINDBODY_STAFF_TOKEN to use a pre-generated token"
    );
  } else {
    console.log("[Mindbody API] ✓ Staff credentials configured");
    console.log("[Mindbody API]   Username:", sourceName);
    console.log("[Mindbody API]   Site ID:", siteId);
  }

  return {
    apiKey,
    siteId,
    sourceName,
    sourcePassword,
    defaultToken,
  };
}

export { mindbodyFetch, buildQueryString };
export type { MindbodyCredentials };
