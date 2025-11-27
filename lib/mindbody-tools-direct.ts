// Direct Mindbody API tools (no MCP dependency)
import { tool } from "ai";
import { z } from "zod";
import {
  mindbodyFetch,
  buildQueryString,
  MindbodyCredentials,
} from "./mindbody-api";

export function createMindbodyTools(credentials: MindbodyCredentials) {
  console.log(
    "[Mindbody Tools] Creating tools with API key length:",
    credentials.apiKey?.length
  );

  return {
    // ============================================
    // CLIENT ENDPOINTS
    // ============================================

    getClients: tool({
      description:
        "⭐ PRIMARY TOOL - Get a list of clients and their IDs. ALWAYS call this FIRST before using any other client-specific tools. For queries like 'find clients who...' or 'list clients that...', start here to get the client IDs, then use those IDs with other tools. Use searchText to find clients by name, email, or phone. 🔴 IMPORTANT: When user asks for 'new clients' or 'recent clients' or clients from 'last X days/weeks/months', you MUST pass lastModifiedDate parameter with appropriate ISO timestamp (e.g., for last 30 days: new Date(Date.now() - 30*24*60*60*1000).toISOString()). This tool returns client IDs needed for all other client-specific operations.",
      parameters: z.object({
        searchText: z
          .string()
          .optional()
          .describe("Search by name, email, or phone"),
        clientIds: z
          .array(z.string())
          .optional()
          .describe("Specific client IDs to retrieve"),
        includeInactive: z
          .boolean()
          .optional()
          .describe("If true, includes inactive clients (default: false)"),
        lastModifiedDate: z
          .string()
          .optional()
          .describe(
            "Filter for clients created or modified AFTER this date (ISO 8601 format). Use this to find new/recent clients. Example: '2025-11-01T00:00:00Z' returns clients modified after Nov 1, 2025. For last 30 days, calculate: new Date(Date.now() - 30*24*60*60*1000).toISOString()"
          ),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          offset: params.offset ?? 0,
          includeInactive: false,
        });
        return await mindbodyFetch(
          `/client/clients${queryString}`,
          credentials,
          "getClients",
          { method: "GET" }
        );
      },
    }),

    getClientServices: tool({
      description:
        "Get services, packages, and memberships for a specific client. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool.",
      parameters: z.object({
        clientId: z.string().describe("The client's unique ID - REQUIRED"),
        classId: z.number().optional().describe("Filter by specific class ID"),
        programIds: z
          .array(z.number())
          .optional()
          .describe("Filter by program IDs"),
        sessionTypeIds: z
          .array(z.number())
          .optional()
          .describe("Filter by session type IDs"),
        locationIds: z
          .array(z.number())
          .optional()
          .describe("Filter by location IDs"),
        visitCount: z
          .number()
          .optional()
          .describe("Number of visits to retrieve"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/client/clientservices${queryString}`,
          credentials,
          "getClientServices",
          { method: "GET" }
        );
      },
    }),

    getClientCompleteInfo: tool({
      description:
        "Get comprehensive information about a specific client including memberships, contracts, and services. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool.",
      parameters: z.object({
        clientId: z.string().describe("The client's unique ID - REQUIRED"),
        crossRegionalLookup: z
          .boolean()
          .optional()
          .describe(
            "If true, retrieves data across multiple sites (default false)"
          ),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/client/clientcompleteinfo${queryString}`,
          credentials,
          "getClientCompleteInfo",
          { method: "GET" }
        );
      },
    }),

    getActiveClientMemberships: tool({
      description:
        "Get active memberships for a specific client. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool.",
      parameters: z.object({
        clientId: z.string().describe("The client's unique ID - REQUIRED"),
        locationId: z.number().optional().describe("Filter by location ID"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/client/activeclientmemberships${queryString}`,
          credentials,
          "getActiveClientMemberships",
          { method: "GET" }
        );
      },
    }),

    getActiveClientsMemberships: tool({
      description:
        "Get active memberships for multiple clients. ⚠️ REQUIRES clientIds array - You MUST call getClients first to obtain the client IDs before calling this tool.",
      parameters: z.object({
        clientIds: z
          .array(z.string())
          .describe("Array of client IDs - REQUIRED"),
        locationId: z.number().optional().describe("Filter by location ID"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/client/activeclientsmemberships${queryString}`,
          credentials,
          "getActiveClientsMemberships",
          { method: "GET" }
        );
      },
    }),

    getClientPurchases: tool({
      description:
        "Get purchase history for a specific client. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool. Use startDate/endDate to filter purchases within a date range (e.g., last 30 days).",
      parameters: z.object({
        clientId: z.string().describe("The client's unique ID - REQUIRED"),
        startDate: z
          .string()
          .optional()
          .describe(
            "Start date filter (ISO 8601) - only returns purchases on or after this date. Example: '2025-11-01T00:00:00Z'"
          ),
        endDate: z
          .string()
          .optional()
          .describe(
            "End date filter (ISO 8601) - only returns purchases on or before this date. Example: '2025-11-30T23:59:59Z'"
          ),
        saleId: z.number().optional().describe("Filter by specific sale ID"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/client/clientpurchases${queryString}`,
          credentials,
          "getClientPurchases",
          { method: "GET" }
        );
      },
    }),

    getClientSchedule: tool({
      description:
        "Get scheduled classes and appointments for a specific client. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool.",
      parameters: z.object({
        clientId: z.string().describe("The client's unique ID - REQUIRED"),
        startDate: z.string().optional().describe("Start date (ISO 8601)"),
        endDate: z.string().optional().describe("End date (ISO 8601)"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/client/clientschedule${queryString}`,
          credentials,
          "getClientSchedule",
          { method: "GET" }
        );
      },
    }),

    getClientVisits: tool({
      description:
        "Get visit history for a specific client. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool.",
      parameters: z.object({
        clientId: z.string().describe("The client's unique ID - REQUIRED"),
        startDate: z.string().optional().describe("Start date (ISO 8601)"),
        endDate: z.string().optional().describe("End date (ISO 8601)"),
        unpaidsOnly: z
          .boolean()
          .optional()
          .describe("If true, returns only unpaid visits (default: false)"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/client/clientvisits${queryString}`,
          credentials,
          "getClientVisits",
          { method: "GET" }
        );
      },
    }),

    getContactLogs: tool({
      description:
        "Get contact logs for clients. Optionally filter by clientId (if filtering by client, call getClients first to get the clientId).",
      parameters: z.object({
        clientId: z.string().optional().describe("Filter by client ID"),
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by staff IDs"),
        startDate: z.string().optional().describe("Start date (ISO 8601)"),
        endDate: z.string().optional().describe("End date (ISO 8601)"),
        typeIds: z
          .array(z.number())
          .optional()
          .describe("Filter by contact type IDs"),
        subtypeIds: z
          .array(z.number())
          .optional()
          .describe("Filter by contact subtype IDs"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/client/contactlogs${queryString}`,
          credentials,
          "getContactLogs",
          { method: "GET" }
        );
      },
    }),

    // ============================================
    // APPOINTMENT ENDPOINTS
    // ============================================

    getScheduleItems: tool({
      description:
        "Get schedule items for appointments. Use to see appointment availability.",
      parameters: z.object({
        startDate: z.string().optional().describe("Start date (ISO 8601)"),
        endDate: z.string().optional().describe("End date (ISO 8601)"),
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by staff IDs"),
        sessionTypeIds: z
          .array(z.number())
          .optional()
          .describe("Filter by session type IDs"),
        locationIds: z
          .array(z.number())
          .optional()
          .describe("Filter by location IDs"),
        ignorePrepFinishTimes: z
          .boolean()
          .optional()
          .describe("If true, ignores prep and finish times (default: false)"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/appointment/scheduleitems${queryString}`,
          credentials,
          "getScheduleItems",
          { method: "GET" }
        );
      },
    }),

    getActiveSessionTimes: tool({
      description:
        "Get active session times for appointments. Use to see available appointment slots.",
      parameters: z.object({
        scheduleId: z.number().optional().describe("Filter by schedule ID"),
        sessionTypeIds: z
          .array(z.number())
          .optional()
          .describe("Filter by session type IDs"),
        startDate: z.string().optional().describe("Start date (ISO 8601)"),
        endDate: z.string().optional().describe("End date (ISO 8601)"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/appointment/activesessiontimes${queryString}`,
          credentials,
          "getActiveSessionTimes",
          { method: "GET" }
        );
      },
    }),

    // ============================================
    // SALE ENDPOINTS
    // ============================================

    getSales: tool({
      description:
        "Get sales transaction history. Use to see what was sold and when.",
      parameters: z.object({
        saleId: z.number().optional().describe("Filter by specific sale ID"),
        startSaleDate: z
          .string()
          .optional()
          .describe("Start date for sale transactions (ISO 8601)"),
        endSaleDate: z
          .string()
          .optional()
          .describe("End date for sale transactions (ISO 8601)"),
        startSaleDateTime: z
          .string()
          .optional()
          .describe("Start datetime for sale transactions (ISO 8601)"),
        endSaleDateTime: z
          .string()
          .optional()
          .describe("End datetime for sale transactions (ISO 8601)"),
        paymentMethodId: z
          .number()
          .optional()
          .describe("Filter by payment method ID"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/sale/sales${queryString}`,
          credentials,
          "getSales",
          { method: "GET" }
        );
      },
    }),

    getTransactions: tool({
      description:
        "Get financial transaction records. Use to see payment transactions. Note: If you need to filter by specific client(s), call getClients first to obtain client IDs, then use the clientId parameter.",
      parameters: z.object({
        transactionId: z
          .number()
          .optional()
          .describe("Filter by specific transaction ID"),
        clientId: z.string().optional().describe("Filter by client ID"),
        startDate: z
          .string()
          .optional()
          .describe("Start date for transactions (ISO 8601)"),
        endDate: z
          .string()
          .optional()
          .describe("End date for transactions (ISO 8601)"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/sale/transactions${queryString}`,
          credentials,
          "getTransactions",
          { method: "GET" }
        );
      },
    }),

    getServices: tool({
      description:
        "Get available services for sale (appointments, sessions, etc.).",
      parameters: z.object({
        serviceIds: z
          .array(z.string())
          .optional()
          .describe("Filter by specific service IDs"),
        programIds: z
          .array(z.number())
          .optional()
          .describe("Filter by program IDs"),
        sessionTypeIds: z
          .array(z.number())
          .optional()
          .describe("Filter by session type IDs"),
        locationIds: z
          .array(z.number())
          .optional()
          .describe("Filter by location IDs"),
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by staff IDs"),
        hideRelatedPrograms: z
          .boolean()
          .optional()
          .describe("If true, hides related programs (default: false)"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/sale/services${queryString}`,
          credentials,
          "getServices",
          { method: "GET" }
        );
      },
    }),

    getProducts: tool({
      description:
        "Get products available for sale. Use to see retail items offered.",
      parameters: z.object({
        productIds: z
          .array(z.string())
          .optional()
          .describe("Filter by specific product IDs"),
        categoryIds: z
          .array(z.string())
          .optional()
          .describe("Filter by category IDs"),
        subCategoryIds: z
          .array(z.number())
          .optional()
          .describe("Filter by subcategory IDs"),
        locationIds: z
          .array(z.number())
          .optional()
          .describe("Filter by location IDs"),
        searchText: z.string().optional().describe("Search products by text"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/sale/products${queryString}`,
          credentials,
          "getProducts",
          { method: "GET" }
        );
      },
    }),

    getProductsInventory: tool({
      description:
        "Get inventory levels for products. Use to check product stock levels.",
      parameters: z.object({
        productIds: z
          .array(z.string())
          .optional()
          .describe("Filter by specific product IDs"),
        locationIds: z
          .array(z.number())
          .optional()
          .describe("Filter by location IDs"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/sale/productsinventory${queryString}`,
          credentials,
          "getProductsInventory",
          { method: "GET" }
        );
      },
    }),

    getPackages: tool({
      description:
        "Get available class packages and pricing. Use to see package options clients can purchase.",
      parameters: z.object({
        packageIds: z
          .array(z.string())
          .optional()
          .describe("Filter by specific package IDs"),
        sellOnline: z
          .boolean()
          .optional()
          .describe(
            "Filter packages available for online sale (default: false)"
          ),
        locationIds: z
          .array(z.number())
          .optional()
          .describe("Filter by location IDs"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/sale/packages${queryString}`,
          credentials,
          "getPackages",
          { method: "GET" }
        );
      },
    }),

    // ============================================
    // SITE ENDPOINTS
    // ============================================

    getMemberships: tool({
      description:
        "Get available membership types and pricing. Use to see membership options offered.",
      parameters: z.object({
        membershipIds: z
          .array(z.number())
          .optional()
          .describe("Filter by specific membership IDs"),
        locationIds: z
          .array(z.number())
          .optional()
          .describe("Filter by location IDs"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/site/memberships${queryString}`,
          credentials,
          "getMemberships",
          { method: "GET" }
        );
      },
    }),

    getSessionTypes: tool({
      description:
        "Get session types for appointments and services. Use to see what types of sessions are available.",
      parameters: z.object({
        sessionTypeIds: z
          .array(z.number())
          .optional()
          .describe("Filter by specific session type IDs"),
        programIds: z
          .array(z.number())
          .optional()
          .describe("Filter by program IDs"),
        onlineOnly: z
          .boolean()
          .optional()
          .describe("Filter online-only sessions (default: false)"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 100)"),
        offset: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString({
          ...params,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        });
        return await mindbodyFetch(
          `/site/sessiontypes${queryString}`,
          credentials,
          "getSessionTypes",
          { method: "GET" }
        );
      },
    }),

    // ============================================
    // USER TOKEN ENDPOINTS
    // Note: These are already handled by the mindbody-api.ts file
    // but including them here for completeness
    // ============================================

    issueUserToken: tool({
      description:
        "Issue a new user token for authentication. Requires username and password.",
      parameters: z.object({
        username: z.string().describe("Username for authentication - REQUIRED"),
        password: z.string().describe("Password for authentication - REQUIRED"),
      }),
      execute: async ({ username, password }) => {
        return await mindbodyFetch(
          `/usertoken/issue`,
          credentials,
          "issueUserToken",
          {
            method: "POST",
            body: JSON.stringify({
              Username: username,
              Password: password,
            }),
          }
        );
      },
    }),

    renewUserToken: tool({
      description:
        "Renew an existing user token. The current token is automatically used from the authentication context.",
      parameters: z.object({}),
      execute: async () => {
        return await mindbodyFetch(
          `/usertoken/renew`,
          credentials,
          "renewUserToken",
          {
            method: "POST",
          }
        );
      },
    }),
  };
}
