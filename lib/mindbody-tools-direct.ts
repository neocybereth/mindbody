// // Direct Mindbody API tools (no MCP dependency)
// import { tool } from "ai";
// import { z } from "zod";
// import {
//   mindbodyFetch,
//   buildQueryString,
//   MindbodyCredentials,
// } from "./mindbody-api";

// export function createMindbodyTools(credentials: MindbodyCredentials) {
//   console.log(
//     "[Mindbody Tools] Creating tools with API key length:",
//     credentials.apiKey?.length
//   );

//   return {
//     // ============================================
//     // CLIENT ENDPOINTS
//     // ============================================

//     getClients: tool({
//       description:
//         "⭐ PRIMARY TOOL - Get a list of clients and their IDs. ALWAYS call this FIRST before using any other client-specific tools. For queries like 'find clients who...' or 'list clients that...', start here to get the client IDs, then use those IDs with other tools. Use searchText to find clients by name, email, or phone. 🔴 IMPORTANT: When user asks for 'new clients' or 'recent clients' or clients from 'last X days/weeks/months', you MUST pass lastModifiedDate parameter with appropriate ISO timestamp (e.g., for last 30 days: new Date(Date.now() - 30*24*60*60*1000).toISOString()). This tool returns client IDs needed for all other client-specific operations.",
//       parameters: z.object({
//         searchText: z
//           .string()
//           .optional()
//           .describe("Search by name, email, or phone"),
//         clientIds: z
//           .array(z.string())
//           .optional()
//           .describe("Specific client IDs to retrieve"),
//         includeInactive: z
//           .boolean()
//           .optional()
//           .describe("If true, includes inactive clients (default: false)"),
//         lastModifiedDate: z
//           .string()
//           .optional()
//           .describe(
//             "Filter for clients created or modified AFTER this date (ISO 8601 format). Use this to find new/recent clients. Example: '2025-11-01T00:00:00Z' returns clients modified after Nov 1, 2025. For last 30 days, calculate: new Date(Date.now() - 30*24*60*60*1000).toISOString()"
//           ),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           offset: params.offset ?? 0,
//           includeInactive: false,
//         });
//         return await mindbodyFetch(
//           `/client/clients${queryString}`,
//           credentials,
//           "getClients",
//           { method: "GET" }
//         );
//       },
//     }),

//     getClientServices: tool({
//       description:
//         "Get services, packages, and memberships for a specific client. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool.",
//       parameters: z.object({
//         clientId: z.coerce
//           .string()
//           .describe("The client's unique ID - REQUIRED"),
//         classId: z.number().optional().describe("Filter by specific class ID"),
//         programIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by program IDs"),
//         sessionTypeIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by session type IDs"),
//         locationIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by location IDs"),
//         visitCount: z
//           .number()
//           .optional()
//           .describe("Number of visits to retrieve"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/client/clientservices${queryString}`,
//           credentials,
//           "getClientServices",
//           { method: "GET" }
//         );
//       },
//     }),

//     getClientCompleteInfo: tool({
//       description:
//         "Get comprehensive information about a specific client including memberships, contracts, and services. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool.",
//       parameters: z.object({
//         clientId: z.coerce
//           .string()
//           .describe("The client's unique ID - REQUIRED"),
//         crossRegionalLookup: z
//           .boolean()
//           .optional()
//           .describe(
//             "If true, retrieves data across multiple sites (default false)"
//           ),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/client/clientcompleteinfo${queryString}`,
//           credentials,
//           "getClientCompleteInfo",
//           { method: "GET" }
//         );
//       },
//     }),

//     getActiveClientMemberships: tool({
//       description:
//         "Get active memberships for a specific client. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool.",
//       parameters: z.object({
//         clientId: z.coerce
//           .string()
//           .describe("The client's unique ID - REQUIRED"),
//         locationId: z.number().optional().describe("Filter by location ID"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/client/activeclientmemberships${queryString}`,
//           credentials,
//           "getActiveClientMemberships",
//           { method: "GET" }
//         );
//       },
//     }),

//     getActiveClientsMemberships: tool({
//       description:
//         "Get active memberships for multiple clients. ⚠️ REQUIRES clientIds array - You MUST call getClients first to obtain the client IDs before calling this tool.",
//       parameters: z.object({
//         clientIds: z
//           .array(z.coerce.string())
//           .describe("Array of client IDs - REQUIRED"),
//         locationId: z.number().optional().describe("Filter by location ID"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/client/activeclientsmemberships${queryString}`,
//           credentials,
//           "getActiveClientsMemberships",
//           { method: "GET" }
//         );
//       },
//     }),

//     getClientPurchases: tool({
//       description:
//         "Get purchase history for a specific client. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool. Use startDate/endDate to filter purchases within a date range (e.g., last 30 days).",
//       parameters: z.object({
//         clientId: z.coerce
//           .string()
//           .describe("The client's unique ID - REQUIRED"),
//         startDate: z
//           .string()
//           .optional()
//           .describe(
//             "Start date filter (ISO 8601) - only returns purchases on or after this date. Example: '2025-11-01T00:00:00Z'"
//           ),
//         endDate: z
//           .string()
//           .optional()
//           .describe(
//             "End date filter (ISO 8601) - only returns purchases on or before this date. Example: '2025-11-30T23:59:59Z'"
//           ),
//         saleId: z.number().optional().describe("Filter by specific sale ID"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/client/clientpurchases${queryString}`,
//           credentials,
//           "getClientPurchases",
//           { method: "GET" }
//         );
//       },
//     }),

//     getClientSchedule: tool({
//       description:
//         "Get scheduled classes and appointments for a specific client. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool.",
//       parameters: z.object({
//         clientId: z.coerce
//           .string()
//           .describe("The client's unique ID - REQUIRED"),
//         startDate: z.string().optional().describe("Start date (ISO 8601)"),
//         endDate: z.string().optional().describe("End date (ISO 8601)"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/client/clientschedule${queryString}`,
//           credentials,
//           "getClientSchedule",
//           { method: "GET" }
//         );
//       },
//     }),

//     // Add these to your createMindbodyTools function
//     getNonMemberTrialClients: tool({
//       description:
//         "🎯 CONVERSION OPPORTUNITY TOOL - Find non-member clients who used services recently but haven't returned. Perfect for identifying trial clients to convert to memberships. Returns clients who: (1) are NOT current members, (2) visited within the specified recent window, (3) haven't booked/visited again since. Ideal for follow-up outreach and membership sales.",
//       parameters: z.object({
//         recentWindowDays: z
//           .number()
//           .optional()
//           .describe("Look for visits within this many days ago (default: 14)"),
//         minDaysSinceVisit: z
//           .number()
//           .optional()
//           .describe(
//             "Minimum days since their last visit to qualify as 'hasn't come back' (default: 3)"
//           ),
//         includeUpcomingBookings: z
//           .boolean()
//           .optional()
//           .describe(
//             "If true, excludes clients who have future bookings scheduled (default: true)"
//           ),
//         limit: z
//           .number()
//           .optional()
//           .describe("Max clients to analyze (default: 100)"),
//       }),
//       execute: async (params) => {
//         const recentWindowDays = params.recentWindowDays ?? 14;
//         const minDaysSinceVisit = params.minDaysSinceVisit ?? 3;
//         const includeUpcomingBookings = params.includeUpcomingBookings ?? true;
//         const limit = params.limit ?? 100;

//         const now = new Date();
//         const windowStart = new Date(
//           now.getTime() - recentWindowDays * 24 * 60 * 60 * 1000
//         );
//         const cutoffDate = new Date(
//           now.getTime() - minDaysSinceVisit * 24 * 60 * 60 * 1000
//         );

//         // Step 1: Get clients modified/created in the recent window (likely had activity)
//         const clientsResponse = await mindbodyFetch(
//           `/client/clients${buildQueryString({
//             lastModifiedDate: windowStart.toISOString(),
//             includeInactive: false,
//             limit,
//             offset: 0,
//           })}`,
//           credentials,
//           "getNonMemberTrialClients:clients",
//           { method: "GET" }
//         );

//         if (!clientsResponse.Clients || clientsResponse.Clients.length === 0) {
//           return {
//             success: true,
//             totalAnalyzed: 0,
//             nonMemberTrials: [],
//             summary: "No recent clients found to analyze.",
//           };
//         }

//         const clients = clientsResponse.Clients;
//         const BATCH_SIZE = 10;

//         const nonMemberTrials: Array<{
//           clientId: string;
//           firstName: string;
//           lastName: string;
//           email: string;
//           phone: string;
//           createdDate: string | null;
//           visitDate: string;
//           daysSinceVisit: number;
//           servicesUsed: Array<{ name: string; date: string }>;
//           hasUpcomingBooking: boolean;
//           visitCount: number;
//           isNewClient: boolean;
//           recommendedAction: string;
//           conversionPotential: "high" | "medium" | "low";
//         }> = [];

//         // Step 2: Analyze each client
//         for (let i = 0; i < clients.length; i += BATCH_SIZE) {
//           const batch = clients.slice(i, i + BATCH_SIZE);

//           const batchResults = await Promise.all(
//             batch.map(
//               async (client: {
//                 Id: string;
//                 FirstName?: string;
//                 LastName?: string;
//                 Email?: string;
//                 MobilePhone?: string;
//                 HomePhone?: string;
//                 CreationDate?: string;
//               }) => {
//                 try {
//                   // Check for active memberships
//                   const membershipsResponse = await mindbodyFetch(
//                     `/client/activeclientmemberships${buildQueryString({
//                       clientId: client.Id,
//                       limit: 10,
//                       offset: 0,
//                     })}`,
//                     credentials,
//                     `getNonMemberTrialClients:memberships:${client.Id}`,
//                     { method: "GET" }
//                   );

//                   const activeMemberships =
//                     membershipsResponse.ClientMemberships || [];

//                   // Skip if they're already a member
//                   if (activeMemberships.length > 0) {
//                     return null;
//                   }

//                   // Get visit history
//                   const visitsResponse = await mindbodyFetch(
//                     `/client/clientvisits${buildQueryString({
//                       clientId: client.Id,
//                       startDate: windowStart.toISOString(),
//                       limit: 50,
//                       offset: 0,
//                     })}`,
//                     credentials,
//                     `getNonMemberTrialClients:visits:${client.Id}`,
//                     { method: "GET" }
//                   );

//                   const visits = visitsResponse.Visits || [];

//                   // Skip if no visits in the window
//                   if (visits.length === 0) {
//                     return null;
//                   }

//                   // Get the most recent visit
//                   const sortedVisits = visits.sort(
//                     (
//                       a: { StartDateTime: string },
//                       b: { StartDateTime: string }
//                     ) =>
//                       new Date(b.StartDateTime).getTime() -
//                       new Date(a.StartDateTime).getTime()
//                   );

//                   const lastVisit = sortedVisits[0];
//                   const lastVisitDate = new Date(lastVisit.StartDateTime);
//                   const daysSinceVisit = Math.floor(
//                     (now.getTime() - lastVisitDate.getTime()) /
//                       (24 * 60 * 60 * 1000)
//                   );

//                   // Skip if visited too recently (they might still come back naturally)
//                   if (lastVisitDate > cutoffDate) {
//                     return null;
//                   }

//                   // Check for upcoming bookings if requested
//                   let hasUpcomingBooking = false;
//                   if (includeUpcomingBookings) {
//                     const scheduleResponse = await mindbodyFetch(
//                       `/client/clientschedule${buildQueryString({
//                         clientId: client.Id,
//                         startDate: now.toISOString(),
//                         endDate: new Date(
//                           now.getTime() + 30 * 24 * 60 * 60 * 1000
//                         ).toISOString(),
//                         limit: 10,
//                         offset: 0,
//                       })}`,
//                       credentials,
//                       `getNonMemberTrialClients:schedule:${client.Id}`,
//                       { method: "GET" }
//                     );

//                     const upcomingBookings = [
//                       ...(scheduleResponse.Appointments || []),
//                       ...(scheduleResponse.Classes || []),
//                     ];

//                     hasUpcomingBooking = upcomingBookings.length > 0;

//                     // Skip if they already have something booked
//                     if (hasUpcomingBooking) {
//                       return null;
//                     }
//                   }

//                   // Get total visit count (all time) to determine if they're truly new
//                   const allVisitsResponse = await mindbodyFetch(
//                     `/client/clientvisits${buildQueryString({
//                       clientId: client.Id,
//                       limit: 100,
//                       offset: 0,
//                     })}`,
//                     credentials,
//                     `getNonMemberTrialClients:allVisits:${client.Id}`,
//                     { method: "GET" }
//                   );

//                   const totalVisits = (allVisitsResponse.Visits || []).length;
//                   const isNewClient = totalVisits <= 2;

//                   // Extract services used
//                   const servicesUsed = sortedVisits
//                     .slice(0, 5)
//                     .map(
//                       (v: {
//                         Name?: string;
//                         ServiceName?: string;
//                         StartDateTime: string;
//                       }) => ({
//                         name: v.Name || v.ServiceName || "Unknown Service",
//                         date: v.StartDateTime,
//                       })
//                     );

//                   // Determine conversion potential
//                   let conversionPotential: "high" | "medium" | "low" = "medium";
//                   let recommendedAction = "";

//                   if (
//                     isNewClient &&
//                     daysSinceVisit >= 3 &&
//                     daysSinceVisit <= 7
//                   ) {
//                     conversionPotential = "high";
//                     recommendedAction = `Hot lead! New client visited ${daysSinceVisit} days ago. Call/text with intro membership offer.`;
//                   } else if (isNewClient && daysSinceVisit > 7) {
//                     conversionPotential = "medium";
//                     recommendedAction = `Follow up needed. New client hasn't returned in ${daysSinceVisit} days. Send 'How was your experience?' message with return incentive.`;
//                   } else if (
//                     totalVisits > 2 &&
//                     daysSinceVisit >= minDaysSinceVisit
//                   ) {
//                     conversionPotential = "medium";
//                     recommendedAction = `Repeat visitor (${totalVisits} visits) not yet a member. Present membership value proposition showing per-visit savings.`;
//                   } else {
//                     conversionPotential = "low";
//                     recommendedAction = `Add to nurture sequence. ${daysSinceVisit} days since last visit.`;
//                   }

//                   // Boost potential if they tried multiple services
//                   if (
//                     servicesUsed.length >= 2 &&
//                     conversionPotential !== "high"
//                   ) {
//                     conversionPotential = "high";
//                     recommendedAction = `Engaged client! Tried ${servicesUsed.length} different services. Perfect candidate for unlimited membership pitch.`;
//                   }

//                   return {
//                     clientId: client.Id,
//                     firstName: client.FirstName || "",
//                     lastName: client.LastName || "",
//                     email: client.Email || "",
//                     phone: client.MobilePhone || client.HomePhone || "",
//                     createdDate: client.CreationDate || null,
//                     visitDate: lastVisit.StartDateTime,
//                     daysSinceVisit,
//                     servicesUsed,
//                     hasUpcomingBooking,
//                     visitCount: totalVisits,
//                     isNewClient,
//                     recommendedAction,
//                     conversionPotential,
//                   };
//                 } catch (error) {
//                   console.error(
//                     `Failed to analyze client ${client.Id}:`,
//                     error
//                   );
//                   return null;
//                 }
//               }
//             )
//           );

//           nonMemberTrials.push(
//             ...batchResults.filter(
//               (r): r is NonNullable<typeof r> => r !== null
//             )
//           );
//         }

//         // Sort by conversion potential and days since visit
//         const potentialOrder = { high: 0, medium: 1, low: 2 };
//         nonMemberTrials.sort((a, b) => {
//           if (
//             potentialOrder[a.conversionPotential] !==
//             potentialOrder[b.conversionPotential]
//           ) {
//             return (
//               potentialOrder[a.conversionPotential] -
//               potentialOrder[b.conversionPotential]
//             );
//           }
//           return a.daysSinceVisit - b.daysSinceVisit; // More recent = higher priority within same potential
//         });

//         const stats = {
//           totalAnalyzed: clients.length,
//           totalNonMemberTrials: nonMemberTrials.length,
//           highPotential: nonMemberTrials.filter(
//             (c) => c.conversionPotential === "high"
//           ).length,
//           mediumPotential: nonMemberTrials.filter(
//             (c) => c.conversionPotential === "medium"
//           ).length,
//           lowPotential: nonMemberTrials.filter(
//             (c) => c.conversionPotential === "low"
//           ).length,
//           newClients: nonMemberTrials.filter((c) => c.isNewClient).length,
//           repeatVisitors: nonMemberTrials.filter((c) => !c.isNewClient).length,
//           avgDaysSinceVisit:
//             nonMemberTrials.length > 0
//               ? (
//                   nonMemberTrials.reduce(
//                     (sum, c) => sum + c.daysSinceVisit,
//                     0
//                   ) / nonMemberTrials.length
//                 ).toFixed(1)
//               : 0,
//         };

//         return {
//           success: true,
//           ...stats,
//           summary: `Found ${stats.totalNonMemberTrials} non-member clients who visited in the last ${recentWindowDays} days but haven't returned: ${stats.highPotential} high potential, ${stats.mediumPotential} medium, ${stats.lowPotential} low. ${stats.newClients} are first-time/new clients, ${stats.repeatVisitors} are repeat visitors without memberships.`,
//           nonMemberTrials,
//         };
//       },
//     }),

//     getClientsWithVisits: tool({
//       description:
//         "📊 AGGREGATE TOOL - Get clients AND their visit history in one call. Use this for questions like 'how many new clients returned for a second visit', 'which clients visited more than once', 'client retention', 'repeat visits', etc. This tool automatically fetches visits for ALL matching clients - no need to loop.",
//       parameters: z.object({
//         searchText: z
//           .string()
//           .optional()
//           .describe("Search by name, email, or phone"),
//         clientIds: z
//           .array(z.string())
//           .optional()
//           .describe("Specific client IDs to retrieve"),
//         lastModifiedDate: z
//           .string()
//           .optional()
//           .describe(
//             "Filter for clients created/modified AFTER this date (ISO 8601). For 'new clients in last 30 days': calculate appropriately"
//           ),
//         visitStartDate: z
//           .string()
//           .optional()
//           .describe("Only count visits AFTER this date (ISO 8601)"),
//         visitEndDate: z
//           .string()
//           .optional()
//           .describe("Only count visits BEFORE this date (ISO 8601)"),
//         minVisits: z
//           .number()
//           .optional()
//           .describe(
//             "Filter to clients with at least this many visits (e.g., 2 for 'returned for second visit')"
//           ),
//         maxVisits: z
//           .number()
//           .optional()
//           .describe("Filter to clients with at most this many visits"),
//         includeInactive: z
//           .boolean()
//           .optional()
//           .describe("Include inactive clients (default: false)"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Max number of clients to process (default: 100)"),
//       }),
//       execute: async (params) => {
//         // Step 1: Get clients
//         const clientQueryString = buildQueryString({
//           searchText: params.searchText,
//           clientIds: params.clientIds,
//           lastModifiedDate: params.lastModifiedDate,
//           includeInactive: params.includeInactive ?? false,
//           limit: params.limit ?? 100,
//           offset: 0,
//         });

//         const clientsResponse = await mindbodyFetch(
//           `/client/clients${clientQueryString}`,
//           credentials,
//           "getClientsWithVisits:clients",
//           { method: "GET" }
//         );

//         if (!clientsResponse.Clients || clientsResponse.Clients.length === 0) {
//           return {
//             success: true,
//             totalClientsFound: 0,
//             clientsMatchingCriteria: 0,
//             summary: "No clients found matching the criteria.",
//             clients: [],
//           };
//         }

//         // Step 2: Get visits for ALL clients in parallel (with concurrency limit)
//         const clients = clientsResponse.Clients;
//         const BATCH_SIZE = 10; // Process 10 at a time to avoid rate limits

//         const clientsWithVisits = [];

//         for (let i = 0; i < clients.length; i += BATCH_SIZE) {
//           const batch = clients.slice(i, i + BATCH_SIZE);

//           const batchResults = await Promise.all(
//             batch.map(
//               async (client: {
//                 Id: string;
//                 FirstName?: string;
//                 LastName?: string;
//               }) => {
//                 try {
//                   const visitQueryString = buildQueryString({
//                     clientId: client.Id,
//                     startDate: params.visitStartDate,
//                     endDate: params.visitEndDate,
//                     limit: 200,
//                     offset: 0,
//                   });

//                   const visitsResponse = await mindbodyFetch(
//                     `/client/clientvisits${visitQueryString}`,
//                     credentials,
//                     `getClientsWithVisits:visits:${client.Id}`,
//                     { method: "GET" }
//                   );

//                   const visits = visitsResponse.Visits || [];

//                   return {
//                     clientId: client.Id,
//                     firstName: client.FirstName,
//                     lastName: client.LastName,
//                     visitCount: visits.length,
//                     visits: visits.slice(0, 10), // Include first 10 visits for detail
//                     firstVisitDate:
//                       visits.length > 0
//                         ? visits[visits.length - 1]?.StartDateTime
//                         : null,
//                     lastVisitDate:
//                       visits.length > 0 ? visits[0]?.StartDateTime : null,
//                   };
//                 } catch (error) {
//                   console.error(
//                     `Failed to get visits for client ${client.Id}:`,
//                     error
//                   );
//                   return {
//                     clientId: client.Id,
//                     firstName: client.FirstName,
//                     lastName: client.LastName,
//                     visitCount: 0,
//                     visits: [],
//                     error: "Failed to fetch visits",
//                   };
//                 }
//               }
//             )
//           );

//           clientsWithVisits.push(...batchResults);
//         }

//         // Step 3: Apply visit count filters
//         let filteredClients = clientsWithVisits;

//         if (params.minVisits !== undefined) {
//           filteredClients = filteredClients.filter(
//             (c) => c.visitCount >= params.minVisits!
//           );
//         }

//         if (params.maxVisits !== undefined) {
//           filteredClients = filteredClients.filter(
//             (c) => c.visitCount <= params.maxVisits!
//           );
//         }

//         // Step 4: Calculate statistics
//         const stats = {
//           totalClientsFound: clients.length,
//           clientsMatchingCriteria: filteredClients.length,
//           clientsWithZeroVisits: clientsWithVisits.filter(
//             (c) => c.visitCount === 0
//           ).length,
//           clientsWithOneVisit: clientsWithVisits.filter(
//             (c) => c.visitCount === 1
//           ).length,
//           clientsWithMultipleVisits: clientsWithVisits.filter(
//             (c) => c.visitCount >= 2
//           ).length,
//           averageVisitsPerClient:
//             clientsWithVisits.length > 0
//               ? (
//                   clientsWithVisits.reduce((sum, c) => sum + c.visitCount, 0) /
//                   clientsWithVisits.length
//                 ).toFixed(2)
//               : 0,
//           totalVisitsAllClients: clientsWithVisits.reduce(
//             (sum, c) => sum + c.visitCount,
//             0
//           ),
//         };

//         // Generate a human-readable summary
//         const summary =
//           params.minVisits === 2
//             ? `${stats.clientsWithMultipleVisits} out of ${
//                 stats.totalClientsFound
//               } clients (${(
//                 (stats.clientsWithMultipleVisits / stats.totalClientsFound) *
//                 100
//               ).toFixed(1)}%) returned for a second visit.`
//             : `Found ${stats.clientsMatchingCriteria} clients matching criteria out of ${stats.totalClientsFound} total.`;

//         return {
//           success: true,
//           ...stats,
//           summary,
//           clients: filteredClients,
//         };
//       },
//     }),

//     getClientVisits: tool({
//       description:
//         "Get visit history for a specific client. ⚠️ REQUIRES clientId - You MUST call getClients first to obtain the clientId before calling this tool.",
//       parameters: z.object({
//         clientId: z.coerce
//           .string()
//           .describe("The client's unique ID - REQUIRED"),
//         startDate: z.string().optional().describe("Start date (ISO 8601)"),
//         endDate: z.string().optional().describe("End date (ISO 8601)"),
//         unpaidsOnly: z
//           .boolean()
//           .optional()
//           .describe("If true, returns only unpaid visits (default: false)"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/client/clientvisits${queryString}`,
//           credentials,
//           "getClientVisits",
//           { method: "GET" }
//         );
//       },
//     }),

//     getContactLogs: tool({
//       description:
//         "Get contact logs for clients. Optionally filter by clientId (if filtering by client, call getClients first to get the clientId).",
//       parameters: z.object({
//         clientId: z.coerce.string().optional().describe("Filter by client ID"),
//         staffIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by staff IDs"),
//         startDate: z.string().optional().describe("Start date (ISO 8601)"),
//         endDate: z.string().optional().describe("End date (ISO 8601)"),
//         typeIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by contact type IDs"),
//         subtypeIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by contact subtype IDs"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/client/contactlogs${queryString}`,
//           credentials,
//           "getContactLogs",
//           { method: "GET" }
//         );
//       },
//     }),

//     // ============================================
//     // APPOINTMENT ENDPOINTS
//     // ============================================

//     getScheduleItems: tool({
//       description:
//         "Get schedule items for appointments. Use to see appointment availability.",
//       parameters: z.object({
//         startDate: z.string().optional().describe("Start date (ISO 8601)"),
//         endDate: z.string().optional().describe("End date (ISO 8601)"),
//         staffIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by staff IDs"),
//         sessionTypeIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by session type IDs"),
//         locationIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by location IDs"),
//         ignorePrepFinishTimes: z
//           .boolean()
//           .optional()
//           .describe("If true, ignores prep and finish times (default: false)"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/appointment/scheduleitems${queryString}`,
//           credentials,
//           "getScheduleItems",
//           { method: "GET" }
//         );
//       },
//     }),

//     getActiveSessionTimes: tool({
//       description:
//         "Get active session times for appointments. Use to see available appointment slots.",
//       parameters: z.object({
//         scheduleId: z.number().optional().describe("Filter by schedule ID"),
//         sessionTypeIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by session type IDs"),
//         startDate: z.string().optional().describe("Start date (ISO 8601)"),
//         endDate: z.string().optional().describe("End date (ISO 8601)"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/appointment/activesessiontimes${queryString}`,
//           credentials,
//           "getActiveSessionTimes",
//           { method: "GET" }
//         );
//       },
//     }),

//     // ============================================
//     // SALE ENDPOINTS
//     // ============================================

//     getSales: tool({
//       description:
//         "Get sales transaction history. Use to see what was sold and when.",
//       parameters: z.object({
//         saleId: z.number().optional().describe("Filter by specific sale ID"),
//         startSaleDate: z
//           .string()
//           .optional()
//           .describe("Start date for sale transactions (ISO 8601)"),
//         endSaleDate: z
//           .string()
//           .optional()
//           .describe("End date for sale transactions (ISO 8601)"),
//         startSaleDateTime: z
//           .string()
//           .optional()
//           .describe("Start datetime for sale transactions (ISO 8601)"),
//         endSaleDateTime: z
//           .string()
//           .optional()
//           .describe("End datetime for sale transactions (ISO 8601)"),
//         paymentMethodId: z
//           .number()
//           .optional()
//           .describe("Filter by payment method ID"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/sale/sales${queryString}`,
//           credentials,
//           "getSales",
//           { method: "GET" }
//         );
//       },
//     }),

//     getTransactions: tool({
//       description:
//         "Get financial transaction records. Use to see payment transactions. Note: If you need to filter by specific client(s), call getClients first to obtain client IDs, then use the clientId parameter.",
//       parameters: z.object({
//         transactionId: z
//           .number()
//           .optional()
//           .describe("Filter by specific transaction ID"),
//         clientId: z.coerce.string().optional().describe("Filter by client ID"),
//         startDate: z
//           .string()
//           .optional()
//           .describe("Start date for transactions (ISO 8601)"),
//         endDate: z
//           .string()
//           .optional()
//           .describe("End date for transactions (ISO 8601)"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/sale/transactions${queryString}`,
//           credentials,
//           "getTransactions",
//           { method: "GET" }
//         );
//       },
//     }),

//     getServices: tool({
//       description:
//         "Get available services for sale (appointments, sessions, etc.).",
//       parameters: z.object({
//         serviceIds: z
//           .array(z.coerce.string())
//           .optional()
//           .describe("Filter by specific service IDs"),
//         programIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by program IDs"),
//         sessionTypeIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by session type IDs"),
//         locationIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by location IDs"),
//         staffIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by staff IDs"),
//         hideRelatedPrograms: z
//           .boolean()
//           .optional()
//           .describe("If true, hides related programs (default: false)"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/sale/services${queryString}`,
//           credentials,
//           "getServices",
//           { method: "GET" }
//         );
//       },
//     }),

//     getProducts: tool({
//       description:
//         "Get products available for sale. Use to see retail items offered.",
//       parameters: z.object({
//         productIds: z
//           .array(z.coerce.string())
//           .optional()
//           .describe("Filter by specific product IDs"),
//         categoryIds: z
//           .array(z.coerce.string())
//           .optional()
//           .describe("Filter by category IDs"),
//         subCategoryIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by subcategory IDs"),
//         locationIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by location IDs"),
//         searchText: z.string().optional().describe("Search products by text"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/sale/products${queryString}`,
//           credentials,
//           "getProducts",
//           { method: "GET" }
//         );
//       },
//     }),

//     getProductsInventory: tool({
//       description:
//         "Get inventory levels for products. Use to check product stock levels.",
//       parameters: z.object({
//         productIds: z
//           .array(z.coerce.string())
//           .optional()
//           .describe("Filter by specific product IDs"),
//         locationIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by location IDs"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/sale/productsinventory${queryString}`,
//           credentials,
//           "getProductsInventory",
//           { method: "GET" }
//         );
//       },
//     }),

//     getPackages: tool({
//       description:
//         "Get available class packages and pricing. Use to see package options clients can purchase.",
//       parameters: z.object({
//         packageIds: z
//           .array(z.coerce.string())
//           .optional()
//           .describe("Filter by specific package IDs"),
//         sellOnline: z
//           .boolean()
//           .optional()
//           .describe(
//             "Filter packages available for online sale (default: false)"
//           ),
//         locationIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by location IDs"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/sale/packages${queryString}`,
//           credentials,
//           "getPackages",
//           { method: "GET" }
//         );
//       },
//     }),

//     // ============================================
//     // SITE ENDPOINTS
//     // ============================================

//     getMemberships: tool({
//       description:
//         "Get available membership types and pricing. Use to see membership options offered.",
//       parameters: z.object({
//         membershipIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by specific membership IDs"),
//         locationIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by location IDs"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/site/memberships${queryString}`,
//           credentials,
//           "getMemberships",
//           { method: "GET" }
//         );
//       },
//     }),

//     getSessionTypes: tool({
//       description:
//         "Get session types for appointments and services. Use to see what types of sessions are available.",
//       parameters: z.object({
//         sessionTypeIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by specific session type IDs"),
//         programIds: z
//           .array(z.number())
//           .optional()
//           .describe("Filter by program IDs"),
//         onlineOnly: z
//           .boolean()
//           .optional()
//           .describe("Filter online-only sessions (default: false)"),
//         limit: z
//           .number()
//           .optional()
//           .describe("Maximum number of results (default: 100)"),
//         offset: z
//           .number()
//           .optional()
//           .describe("Pagination offset (default: 0)"),
//       }),
//       execute: async (params) => {
//         const queryString = buildQueryString({
//           ...params,
//           limit: params.limit ?? 100,
//           offset: params.offset ?? 0,
//         });
//         return await mindbodyFetch(
//           `/site/sessiontypes${queryString}`,
//           credentials,
//           "getSessionTypes",
//           { method: "GET" }
//         );
//       },
//     }),

//     // ============================================
//     // USER TOKEN ENDPOINTS
//     // Note: These are already handled by the mindbody-api.ts file
//     // but including them here for completeness
//     // ============================================

//     issueUserToken: tool({
//       description:
//         "Issue a new user token for authentication. Requires username and password.",
//       parameters: z.object({
//         username: z.string().describe("Username for authentication - REQUIRED"),
//         password: z.string().describe("Password for authentication - REQUIRED"),
//       }),
//       execute: async ({ username, password }) => {
//         return await mindbodyFetch(
//           `/usertoken/issue`,
//           credentials,
//           "issueUserToken",
//           {
//             method: "POST",
//             body: JSON.stringify({
//               Username: username,
//               Password: password,
//             }),
//           }
//         );
//       },
//     }),

//     renewUserToken: tool({
//       description:
//         "Renew an existing user token. The current token is automatically used from the authentication context.",
//       parameters: z.object({}),
//       execute: async () => {
//         return await mindbodyFetch(
//           `/usertoken/renew`,
//           credentials,
//           "renewUserToken",
//           {
//             method: "POST",
//           }
//         );
//       },
//     }),
//   };
// }
