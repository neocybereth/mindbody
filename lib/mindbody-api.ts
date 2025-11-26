// Direct Mindbody API client (no MCP dependency)

const MINDBODY_API_BASE = "https://api.mindbodyonline.com/public/v6";

interface MindbodyCredentials {
  apiKey: string;
  siteId: string;
  sourceName?: string;
  sourcePassword?: string;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(
  credentials: MindbodyCredentials
): Promise<string | null> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // If no staff credentials provided, skip authentication (API key only)
  if (!credentials.sourceName || !credentials.sourcePassword) {
    console.log(
      "[Mindbody API] No staff credentials provided, using API key only"
    );
    return null;
  }

  console.log("[Mindbody API] Getting new access token...");

  try {
    const response = await fetch(`${MINDBODY_API_BASE}/usertoken/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": credentials.apiKey,
        SiteId: credentials.siteId,
      },
      body: JSON.stringify({
        Username: credentials.sourceName,
        Password: credentials.sourcePassword,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Mindbody API] Token error:", errorText);
      console.warn(
        "[Mindbody API] Staff authentication failed, falling back to API key only."
      );
      console.warn(
        "[Mindbody API] Note: Some endpoints may require staff credentials."
      );
      return null; // Fall back to API key only
    }

    const data = await response.json();
    cachedToken = data.AccessToken;
    // Tokens typically last 24 hours, cache for 23 hours
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;

    console.log("[Mindbody API] Got new access token successfully");
    return cachedToken;
  } catch (error) {
    console.error("[Mindbody API] Failed to get token:", error);
    console.warn("[Mindbody API] Continuing with API key only");
    return null;
  }
}

async function mindbodyFetch(
  endpoint: string,
  credentials: MindbodyCredentials,
  toolName: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${MINDBODY_API_BASE}${endpoint}`;
  console.log(`[Mindbody API] ${toolName} - Fetching:`, url);

  try {
    const token = await getAccessToken(credentials);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Api-Key": credentials.apiKey,
      SiteId: credentials.siteId,
      ...options.headers,
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
    return data;
  } catch (error) {
    console.error(`[Mindbody API] ${toolName} - Fetch error:`, error);
    throw error;
  }
}

function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v.toString()));
      } else {
        query.append(key, value.toString());
      }
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
}

export function getMindbodyCredentials(): MindbodyCredentials {
  const apiKey = process.env.MINDBODY_API_KEY || "";
  const siteId = process.env.MINDBODY_SITE_ID || "-99";
  const sourceName = process.env.MINDBODY_SOURCE_NAME;
  const sourcePassword = process.env.MINDBODY_SOURCE_PASSWORD;

  if (!apiKey) {
    console.error("[Mindbody API] MINDBODY_API_KEY is not set!");
  }

  if (!sourceName || !sourcePassword) {
    console.warn(
      "[Mindbody API] Staff credentials not provided. Some endpoints may not work. " +
        "Set MINDBODY_SOURCE_NAME and MINDBODY_SOURCE_PASSWORD in .env.local"
    );
  }

  return {
    apiKey,
    siteId,
    sourceName,
    sourcePassword,
  };
}

export { mindbodyFetch, buildQueryString };
export type { MindbodyCredentials };
