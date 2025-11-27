import { tool } from "ai";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

// ============================================
// HELPER: Error Handler
// ============================================
function handleSupabaseError(error: unknown, context: string) {
  if (error) {
    console.error(`[${context}] Supabase error:`, error);
    throw new Error(`Database error in ${context}: ${JSON.stringify(error)}`);
  }
}

// ============================================
// SHARED FILTER SCHEMA
// ============================================
const clientFiltersSchema = z.object({
  // Membership
  membership_status: z
    .enum(["member", "non-member", "any"])
    .optional()
    .describe("Filter by membership status"),

  // Visit Recency
  days_since_last_visit_min: z
    .number()
    .optional()
    .describe(
      "Minimum days since last visit (e.g., 30 = hasn't visited in 30+ days)"
    ),
  days_since_last_visit_max: z
    .number()
    .optional()
    .describe("Maximum days since last visit"),

  // Visit Counts
  visits_last_30_days_min: z.number().optional(),
  visits_last_30_days_max: z.number().optional(),
  visits_last_90_days_min: z.number().optional(),
  visits_last_90_days_max: z.number().optional(),
  visits_last_365_days_min: z.number().optional(),
  visits_last_365_days_max: z.number().optional(),
  total_visits_min: z.number().optional(),
  total_visits_max: z.number().optional(),

  // Revenue
  lifetime_value_min: z.number().optional(),
  lifetime_value_max: z.number().optional(),
  total_purchases_min: z.number().optional(),
  total_purchases_max: z.number().optional(),

  // Client Age
  days_as_client_min: z
    .number()
    .optional()
    .describe("Minimum days since signup (e.g., 30 = client for 30+ days)"),
  days_as_client_max: z
    .number()
    .optional()
    .describe(
      "Maximum days since signup (e.g., 30 = new clients in last 30 days)"
    ),

  // Status
  is_active: z.boolean().optional(),
  is_prospect: z.boolean().optional(),
  status: z.string().optional().describe("e.g., 'Non-Member', 'Member'"),
  visit_frequency: z
    .string()
    .optional()
    .describe("e.g., 'prospect', 'regular', 'occasional'"),

  // Contact Info
  has_email: z.boolean().optional(),
  has_phone: z.boolean().optional(),

  // Acquisition
  referred_by: z.string().optional(),
  created_after: z.string().optional().describe("ISO date string"),
  created_before: z.string().optional().describe("ISO date string"),
});

type ClientFilters = z.infer<typeof clientFiltersSchema>;

// ============================================
// HELPER: Apply Filters to Query
// ============================================
function applyClientFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filters: ClientFilters
) {
  // Membership Status
  if (filters.membership_status === "member") {
    query = query.eq("has_active_membership", true);
  } else if (filters.membership_status === "non-member") {
    query = query.eq("has_active_membership", false);
  }

  // Visit Recency
  if (filters.days_since_last_visit_min !== undefined) {
    query = query.gte(
      "days_since_last_visit",
      filters.days_since_last_visit_min
    );
  }
  if (filters.days_since_last_visit_max !== undefined) {
    query = query.lte(
      "days_since_last_visit",
      filters.days_since_last_visit_max
    );
  }

  // Visit Counts - 30 days
  if (filters.visits_last_30_days_min !== undefined) {
    query = query.gte("visits_last_30_days", filters.visits_last_30_days_min);
  }
  if (filters.visits_last_30_days_max !== undefined) {
    query = query.lte("visits_last_30_days", filters.visits_last_30_days_max);
  }

  // Visit Counts - 90 days
  if (filters.visits_last_90_days_min !== undefined) {
    query = query.gte("visits_last_90_days", filters.visits_last_90_days_min);
  }
  if (filters.visits_last_90_days_max !== undefined) {
    query = query.lte("visits_last_90_days", filters.visits_last_90_days_max);
  }

  // Visit Counts - 365 days
  if (filters.visits_last_365_days_min !== undefined) {
    query = query.gte("visits_last_365_days", filters.visits_last_365_days_min);
  }
  if (filters.visits_last_365_days_max !== undefined) {
    query = query.lte("visits_last_365_days", filters.visits_last_365_days_max);
  }

  // Total Visits
  if (filters.total_visits_min !== undefined) {
    query = query.gte("total_visits", filters.total_visits_min);
  }
  if (filters.total_visits_max !== undefined) {
    query = query.lte("total_visits", filters.total_visits_max);
  }

  // Revenue
  if (filters.lifetime_value_min !== undefined) {
    query = query.gte("lifetime_value", filters.lifetime_value_min);
  }
  if (filters.lifetime_value_max !== undefined) {
    query = query.lte("lifetime_value", filters.lifetime_value_max);
  }
  if (filters.total_purchases_min !== undefined) {
    query = query.gte("total_purchases", filters.total_purchases_min);
  }
  if (filters.total_purchases_max !== undefined) {
    query = query.lte("total_purchases", filters.total_purchases_max);
  }

  // Client Age
  if (filters.days_as_client_min !== undefined) {
    query = query.gte("days_as_client", filters.days_as_client_min);
  }
  if (filters.days_as_client_max !== undefined) {
    query = query.lte("days_as_client", filters.days_as_client_max);
  }

  // Status fields
  if (filters.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  }
  if (filters.is_prospect !== undefined) {
    query = query.eq("is_prospect", filters.is_prospect);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.visit_frequency) {
    query = query.eq("visit_frequency", filters.visit_frequency);
  }

  // Contact Info
  if (filters.has_email === true) {
    query = query.not("email", "is", null);
  } else if (filters.has_email === false) {
    query = query.is("email", null);
  }
  if (filters.has_phone === true) {
    query = query.or("mobile_phone.not.is.null,home_phone.not.is.null");
  }

  // Acquisition
  if (filters.referred_by) {
    query = query.eq("referred_by", filters.referred_by);
  }
  if (filters.created_after) {
    query = query.gte("creation_date", filters.created_after);
  }
  if (filters.created_before) {
    query = query.lte("creation_date", filters.created_before);
  }

  return query;
}

// ============================================
// MAIN EXPORT: Create Supabase Tools
// ============================================
export function createSupabaseTools(supabase: SupabaseClient) {
  return {
    // ============================================
    // TOOL 1: SEARCH CLIENTS
    // Flexible client search with composable filters
    // ============================================
    searchClients: tool({
      description: `🔍 FLEXIBLE CLIENT SEARCH - Find clients using any combination of filters.
      
COMMON USE CASES:
- At-risk clients: { days_since_last_visit_min: 30, visits_last_365_days_min: 1 }
- New clients: { days_as_client_max: 30 }
- High-value non-members: { membership_status: "non-member", lifetime_value_min: 500 }
- Engaged prospects: { total_visits_min: 2, membership_status: "non-member" }
- Lost contacts: { has_email: false, has_phone: false, lifetime_value_min: 1 }`,

      parameters: z.object({
        // Text search
        search_text: z
          .string()
          .optional()
          .describe("Search by name, email, or phone"),

        // Flexible filters
        filters: clientFiltersSchema.optional(),

        // Output control
        return_fields: z
          .array(z.string())
          .optional()
          .describe("Specific fields to return. Default: core fields"),
        order_by: z
          .string()
          .optional()
          .default("lifetime_value")
          .describe("Field to sort by"),
        order_direction: z.enum(["asc", "desc"]).optional().default("desc"),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }),

      execute: async (params) => {
        // Default fields if not specified
        const defaultFields = [
          "id",
          "full_name",
          "email",
          "mobile_phone",
          "status",
          "has_active_membership",
          "total_visits",
          "visits_last_30_days",
          "days_since_last_visit",
          "lifetime_value",
          "days_as_client",
          "referred_by",
        ].join(",");

        const selectFields = params.return_fields?.join(",") || defaultFields;

        let query = supabase
          .from("clients")
          .select(selectFields, { count: "exact" });

        // Text search
        if (params.search_text) {
          const term = params.search_text;
          query = query.or(
            `full_name.ilike.%${term}%,email.ilike.%${term}%,mobile_phone.ilike.%${term}%,home_phone.ilike.%${term}%`
          );
        }

        // Apply all filters
        if (params.filters) {
          query = applyClientFilters(query, params.filters);
        }

        // Ordering
        query = query.order(params.order_by!, {
          ascending: params.order_direction === "asc",
        });

        // Pagination
        query = query.range(params.offset!, params.offset! + params.limit! - 1);

        const { data, count, error } = await query;
        handleSupabaseError(error, "searchClients");

        return {
          clients: data,
          total_count: count,
          returned_count: data?.length || 0,
          filters_applied: params.filters,
        };
      },
    }),

    // ============================================
    // TOOL 2: AGGREGATE CLIENTS
    // Calculate metrics across segments
    // ============================================
    aggregateClients: tool({
      description: `📊 AGGREGATE METRICS - Calculate counts, averages, and totals for client segments.

COMMON USE CASES:
- "How many active members?" → metrics: ["count"], filters: { membership_status: "member" }
- "Revenue by referral source" → metrics: ["total_ltv", "avg_ltv"], group_by: "referred_by"
- "Weekly signup trends" → group_by: "creation_week"
- "Engagement by membership" → group_by: "membership_status"`,

      parameters: z.object({
        metrics: z
          .array(
            z.enum([
              "count",
              "total_visits",
              "avg_visits",
              "total_ltv",
              "avg_ltv",
              "avg_days_since_visit",
              "contactable_count",
              "member_count",
            ])
          )
          .optional()
          .default(["count", "avg_ltv", "avg_visits"]),

        filters: clientFiltersSchema.optional(),

        group_by: z
          .enum([
            "status",
            "has_active_membership",
            "referred_by",
            "visit_frequency",
            "gender",
            "state",
            "creation_week",
            "creation_month",
          ])
          .optional()
          .describe("Group results by this field"),
      }),

      execute: async (params) => {
        // If grouping, we need to fetch and aggregate in JS
        // Supabase doesn't support GROUP BY directly in the client

        let query = supabase.from("clients").select(
          `
          status,
          has_active_membership,
          referred_by,
          visit_frequency,
          gender,
          state,
          creation_date,
          total_visits,
          lifetime_value,
          days_since_last_visit,
          email,
          mobile_phone
        `
        );

        if (params.filters) {
          query = applyClientFilters(query, params.filters);
        }

        const { data, error } = await query;
        handleSupabaseError(error, "aggregateClients");

        if (!data || data.length === 0) {
          return { summary: "No clients match the filters", data: [] };
        }

        // Helper to calculate metrics for a group
        const calculateMetrics = (clients: typeof data) => {
          const count = clients.length;
          const totalVisits = clients.reduce(
            (sum, c) => sum + (c.total_visits || 0),
            0
          );
          const totalLtv = clients.reduce(
            (sum, c) => sum + parseFloat(c.lifetime_value || "0"),
            0
          );
          const contactable = clients.filter(
            (c) => c.email || c.mobile_phone
          ).length;
          const members = clients.filter((c) => c.has_active_membership).length;
          const avgDaysSinceVisit =
            clients.reduce(
              (sum, c) => sum + (c.days_since_last_visit || 0),
              0
            ) / (count || 1);

          return {
            count,
            total_visits: totalVisits,
            avg_visits: Math.round((totalVisits / count) * 10) / 10,
            total_ltv: Math.round(totalLtv * 100) / 100,
            avg_ltv: Math.round((totalLtv / count) * 100) / 100,
            avg_days_since_visit: Math.round(avgDaysSinceVisit),
            contactable_count: contactable,
            contactable_pct: Math.round((contactable / count) * 100),
            member_count: members,
            member_pct: Math.round((members / count) * 100),
          };
        };

        // No grouping - return overall metrics
        if (!params.group_by) {
          return {
            overall: calculateMetrics(data),
            total_clients: data.length,
          };
        }

        // Group the data
        const groups: Record<string, typeof data> = {};

        for (const client of data) {
          let groupKey: string;

          if (params.group_by === "creation_week") {
            const date = new Date(client.creation_date);
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - date.getDay());
            groupKey = startOfWeek.toISOString().split("T")[0];
          } else if (params.group_by === "creation_month") {
            const date = new Date(client.creation_date);
            groupKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
          } else if (params.group_by === "has_active_membership") {
            groupKey = client.has_active_membership ? "Member" : "Non-Member";
          } else {
            groupKey = String(client[params.group_by] || "Unknown");
          }

          if (!groups[groupKey]) groups[groupKey] = [];
          groups[groupKey].push(client);
        }

        // Calculate metrics for each group
        const results = Object.entries(groups)
          .map(([group, clients]) => ({
            group,
            ...calculateMetrics(clients),
          }))
          .sort((a, b) => b.count - a.count);

        return {
          grouped_by: params.group_by,
          groups: results,
          total_groups: results.length,
          total_clients: data.length,
        };
      },
    }),

    // ============================================
    // TOOL 3: QUERY CLIENT SERVICES
    // Extract data from nested services JSON
    // ============================================
    queryClientServices: tool({
      description: `📦 QUERY SERVICES/CLASS CARDS - Search client services including expiration dates and usage.

COMMON USE CASES:
- Expiring soon: { expiring_within_days: 30 }
- Unused packages: { is_fully_unused: true }
- Low remaining: { remaining_max: 2 }
- Specific service: { service_name_contains: "Class Card" }`,

      parameters: z.object({
        service_filters: z
          .object({
            expiring_within_days: z
              .number()
              .optional()
              .describe("Services expiring within N days from now"),
            expiring_after_days: z
              .number()
              .optional()
              .describe("Services expiring more than N days from now"),
            has_remaining: z
              .boolean()
              .optional()
              .describe("Has at least 1 class/session remaining"),
            remaining_min: z.number().optional(),
            remaining_max: z.number().optional(),
            is_fully_unused: z
              .boolean()
              .optional()
              .describe("Remaining equals total (never used)"),
            service_name_contains: z.string().optional(),
          })
          .optional(),

        client_filters: clientFiltersSchema.optional(),

        order_by: z
          .enum(["expiration_date", "remaining", "client_name"])
          .optional()
          .default("expiration_date"),
        limit: z.number().optional().default(50),
      }),

      execute: async (params) => {
        // Fetch clients with services
        let query = supabase
          .from("clients")
          .select(
            "id, full_name, email, mobile_phone, lifetime_value, services"
          )
          .neq("services", "[]");

        if (params.client_filters) {
          query = applyClientFilters(query, params.client_filters);
        }

        const { data: clients, error } = await query;
        handleSupabaseError(error, "queryClientServices");

        if (!clients) return { services: [], count: 0 };

        const now = new Date();
        const results: Array<{
          client_id: string;
          full_name: string;
          email: string | null;
          mobile_phone: string | null;
          service_name: string;
          total_classes: number;
          remaining_classes: number;
          usage_pct: number;
          active_date: string;
          expiration_date: string;
          days_until_expiration: number;
          payment_date: string;
        }> = [];

        for (const client of clients) {
          let services: Array<{
            Name?: string;
            Count?: number;
            Remaining?: number;
            ActiveDate?: string;
            ExpirationDate?: string;
            PaymentDate?: string;
          }> = [];

          try {
            services =
              typeof client.services === "string"
                ? JSON.parse(client.services)
                : client.services || [];
          } catch {
            continue;
          }

          for (const svc of services) {
            const expirationDate = svc.ExpirationDate
              ? new Date(svc.ExpirationDate)
              : null;
            const daysUntilExpiration = expirationDate
              ? Math.ceil(
                  (expirationDate.getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            const total = svc.Count || 0;
            const remaining = svc.Remaining || 0;
            const isFullyUnused = remaining === total && total > 0;

            // Apply service filters
            const sf = params.service_filters;
            if (sf) {
              if (
                sf.expiring_within_days !== undefined &&
                (daysUntilExpiration === null ||
                  daysUntilExpiration > sf.expiring_within_days ||
                  daysUntilExpiration < 0)
              ) {
                continue;
              }
              if (
                sf.expiring_after_days !== undefined &&
                daysUntilExpiration !== null &&
                daysUntilExpiration <= sf.expiring_after_days
              ) {
                continue;
              }
              if (sf.has_remaining === true && remaining <= 0) continue;
              if (sf.has_remaining === false && remaining > 0) continue;
              if (
                sf.remaining_min !== undefined &&
                remaining < sf.remaining_min
              )
                continue;
              if (
                sf.remaining_max !== undefined &&
                remaining > sf.remaining_max
              )
                continue;
              if (sf.is_fully_unused === true && !isFullyUnused) continue;
              if (sf.is_fully_unused === false && isFullyUnused) continue;
              if (
                sf.service_name_contains &&
                !svc.Name?.toLowerCase().includes(
                  sf.service_name_contains.toLowerCase()
                )
              ) {
                continue;
              }
            }

            results.push({
              client_id: client.id,
              full_name: client.full_name,
              email: client.email,
              mobile_phone: client.mobile_phone,
              service_name: svc.Name || "Unknown",
              total_classes: total,
              remaining_classes: remaining,
              usage_pct:
                total > 0 ? Math.round(((total - remaining) / total) * 100) : 0,
              active_date: svc.ActiveDate || "",
              expiration_date: svc.ExpirationDate || "",
              days_until_expiration: daysUntilExpiration || 999,
              payment_date: svc.PaymentDate || "",
            });
          }
        }

        // Sort
        if (params.order_by === "expiration_date") {
          results.sort(
            (a, b) => a.days_until_expiration - b.days_until_expiration
          );
        } else if (params.order_by === "remaining") {
          results.sort((a, b) => a.remaining_classes - b.remaining_classes);
        } else if (params.order_by === "client_name") {
          results.sort((a, b) => a.full_name.localeCompare(b.full_name));
        }

        return {
          services: results.slice(0, params.limit),
          total_count: results.length,
          filters_applied: params.service_filters,
        };
      },
    }),

    // ============================================
    // TOOL 4: GET CLIENT DETAIL
    // Full details for a specific client
    // ============================================
    getClientDetail: tool({
      description: `👤 GET CLIENT DETAIL - Retrieve complete information about a specific client.

Use when: User asks about a specific person by name, email, or ID.`,

      parameters: z.object({
        search_by: z
          .enum(["id", "mindbody_client_id", "email", "name"])
          .describe("How to find the client"),
        search_value: z.string().describe("The value to search for"),
        include_json_data: z
          .boolean()
          .optional()
          .default(true)
          .describe("Include visits, purchases, services, memberships JSON"),
      }),

      execute: async (params) => {
        let query = supabase.from("clients").select("*");

        switch (params.search_by) {
          case "id":
            query = query.eq("id", params.search_value);
            break;
          case "mindbody_client_id":
            query = query.eq("mindbody_client_id", params.search_value);
            break;
          case "email":
            query = query.ilike("email", params.search_value);
            break;
          case "name":
            query = query.ilike("full_name", `%${params.search_value}%`);
            break;
        }

        const { data, error } = await query.limit(1).single();
        handleSupabaseError(error, "getClientDetail");

        if (!data) {
          return { found: false, message: "Client not found" };
        }

        // Parse JSON fields if requested
        const parsedData = { ...data };
        if (params.include_json_data) {
          const jsonFields = [
            "visits",
            "purchases",
            "memberships",
            "services",
            "contact_logs",
          ];
          for (const field of jsonFields) {
            if (typeof parsedData[field] === "string") {
              try {
                parsedData[field] = JSON.parse(parsedData[field]);
              } catch {
                // Keep as string if parse fails
              }
            }
          }
        } else {
          // Remove large JSON fields
          delete parsedData.visits;
          delete parsedData.purchases;
          delete parsedData.services;
          delete parsedData.memberships;
          delete parsedData.contact_logs;
          delete parsedData.raw_client_data;
        }

        return {
          found: true,
          client: parsedData,
        };
      },
    }),

    // ============================================
    // TOOL 5: COMPARE SEGMENTS
    // Side-by-side segment comparison
    // ============================================
    compareSegments: tool({
      description: `⚖️ COMPARE SEGMENTS - Compare metrics between two client segments.

COMMON USE CASES:
- Members vs Non-Members
- New clients vs Established clients
- High-value vs Low-value
- Google referrals vs Other sources`,

      parameters: z.object({
        segment_a: z.object({
          name: z.string().describe("Label for segment A"),
          filters: clientFiltersSchema,
        }),
        segment_b: z.object({
          name: z.string().describe("Label for segment B"),
          filters: clientFiltersSchema,
        }),
      }),

      execute: async (params) => {
        const fetchSegment = async (filters: ClientFilters) => {
          let query = supabase.from("clients").select(
            `
            total_visits,
            lifetime_value,
            days_since_last_visit,
            has_active_membership,
            email,
            mobile_phone
          `
          );

          query = applyClientFilters(query, filters);
          const { data, error } = await query;
          handleSupabaseError(error, "compareSegments");
          return data || [];
        };

        const [segmentA, segmentB] = await Promise.all([
          fetchSegment(params.segment_a.filters),
          fetchSegment(params.segment_b.filters),
        ]);

        const calcStats = (data: typeof segmentA) => {
          const count = data.length;
          if (count === 0)
            return {
              count: 0,
              avg_ltv: 0,
              total_ltv: 0,
              avg_visits: 0,
              avg_days_since_visit: null,
              membership_rate: 0,
              contactable_rate: 0,
            };

          const totalLtv = data.reduce(
            (sum, c) => sum + parseFloat(c.lifetime_value || "0"),
            0
          );
          const totalVisits = data.reduce(
            (sum, c) => sum + (c.total_visits || 0),
            0
          );
          const members = data.filter((c) => c.has_active_membership).length;
          const contactable = data.filter(
            (c) => c.email || c.mobile_phone
          ).length;
          const daysSum = data.reduce(
            (sum, c) => sum + (c.days_since_last_visit || 0),
            0
          );

          return {
            count,
            avg_ltv: Math.round((totalLtv / count) * 100) / 100,
            total_ltv: Math.round(totalLtv * 100) / 100,
            avg_visits: Math.round((totalVisits / count) * 10) / 10,
            avg_days_since_visit: Math.round(daysSum / count),
            membership_rate: Math.round((members / count) * 100),
            contactable_rate: Math.round((contactable / count) * 100),
          };
        };

        const statsA = calcStats(segmentA);
        const statsB = calcStats(segmentB);

        // Calculate differences
        const diff = {
          count: statsA.count - statsB.count,
          avg_ltv: Math.round((statsA.avg_ltv - statsB.avg_ltv) * 100) / 100,
          avg_visits:
            Math.round((statsA.avg_visits - statsB.avg_visits) * 10) / 10,
          membership_rate: statsA.membership_rate - statsB.membership_rate,
        };

        return {
          segment_a: { name: params.segment_a.name, ...statsA },
          segment_b: { name: params.segment_b.name, ...statsB },
          difference: diff,
          insight:
            statsA.avg_ltv > statsB.avg_ltv
              ? `${params.segment_a.name} has $${diff.avg_ltv} higher average LTV`
              : `${params.segment_b.name} has $${Math.abs(
                  diff.avg_ltv
                )} higher average LTV`,
        };
      },
    }),

    // ============================================
    // TOOL 6: COHORT ANALYSIS
    // Analyze by signup cohort
    // ============================================
    cohortAnalysis: tool({
      description: `📈 COHORT ANALYSIS - Analyze client behavior by signup date cohorts.

Use for: Tracking if onboarding/conversion is improving over time.`,

      parameters: z.object({
        cohort_period: z
          .enum(["day", "week", "month"])
          .optional()
          .default("week"),
        lookback_periods: z
          .number()
          .optional()
          .default(12)
          .describe("How many periods to analyze"),
        filters: clientFiltersSchema.optional(),
      }),

      execute: async (params) => {
        const now = new Date();
        let startDate: Date;

        switch (params.cohort_period) {
          case "day":
            startDate = new Date(
              now.getTime() - params.lookback_periods! * 24 * 60 * 60 * 1000
            );
            break;
          case "week":
            startDate = new Date(
              now.getTime() - params.lookback_periods! * 7 * 24 * 60 * 60 * 1000
            );
            break;
          case "month":
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - params.lookback_periods!);
            break;
        }

        let query = supabase
          .from("clients")
          .select(
            `
            creation_date,
            total_visits,
            lifetime_value,
            has_active_membership,
            email,
            mobile_phone
          `
          )
          .gte("creation_date", startDate.toISOString());

        if (params.filters) {
          query = applyClientFilters(query, params.filters);
        }

        const { data, error } = await query;
        handleSupabaseError(error, "cohortAnalysis");

        if (!data || data.length === 0) {
          return { cohorts: [], message: "No data in date range" };
        }

        // Group by cohort
        const cohorts: Record<
          string,
          {
            clients: typeof data;
            period: string;
          }
        > = {};

        for (const client of data) {
          const date = new Date(client.creation_date);
          let cohortKey: string;

          switch (params.cohort_period) {
            case "day":
              cohortKey = date.toISOString().split("T")[0];
              break;
            case "week":
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              cohortKey = weekStart.toISOString().split("T")[0];
              break;
            case "month":
              cohortKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}`;
              break;
          }

          if (!cohorts[cohortKey]) {
            cohorts[cohortKey] = { clients: [], period: cohortKey };
          }
          cohorts[cohortKey].clients.push(client);
        }

        // Calculate metrics per cohort
        const results = Object.entries(cohorts)
          .map(([period, { clients }]) => {
            const count = clients.length;
            const returned = clients.filter((c) => c.total_visits >= 2).length;
            const members = clients.filter(
              (c) => c.has_active_membership
            ).length;
            const totalLtv = clients.reduce(
              (sum, c) => sum + parseFloat(c.lifetime_value || "0"),
              0
            );

            return {
              cohort: period,
              new_clients: count,
              returned_clients: returned,
              return_rate_pct: Math.round((returned / count) * 100),
              converted_to_member: members,
              membership_conversion_pct: Math.round((members / count) * 100),
              total_ltv: Math.round(totalLtv * 100) / 100,
              avg_ltv: Math.round((totalLtv / count) * 100) / 100,
            };
          })
          .sort((a, b) => b.cohort.localeCompare(a.cohort));

        return {
          cohort_period: params.cohort_period,
          cohorts: results,
          total_cohorts: results.length,
          summary: {
            avg_return_rate:
              Math.round(
                (results.reduce((sum, c) => sum + c.return_rate_pct, 0) /
                  results.length) *
                  10
              ) / 10,
            avg_membership_conversion:
              Math.round(
                (results.reduce(
                  (sum, c) => sum + c.membership_conversion_pct,
                  0
                ) /
                  results.length) *
                  10
              ) / 10,
          },
        };
      },
    }),

    // ============================================
    // TOOL 7: EXECUTIVE SUMMARY
    // Quick overview dashboard metrics
    // ============================================
    getExecutiveSummary: tool({
      description: `📋 EXECUTIVE SUMMARY - Get a quick overview of key business metrics.

Returns: Total clients, members, revenue, engagement stats, and health indicators.`,

      parameters: z.object({
        include_trends: z
          .boolean()
          .optional()
          .default(false)
          .describe("Include 30-day trend comparisons (not yet implemented)"),
      }),

      execute: async () => {
        const { data, error } = await supabase.from("clients").select(`
          total_visits,
          visits_last_30_days,
          visits_last_90_days,
          lifetime_value,
          has_active_membership,
          days_since_last_visit,
          days_as_client,
          is_prospect,
          email,
          mobile_phone,
          creation_date
        `);

        handleSupabaseError(error, "getExecutiveSummary");

        if (!data || data.length === 0) {
          return { message: "No client data found" };
        }

        const total = data.length;
        const members = data.filter((c) => c.has_active_membership).length;
        const prospects = data.filter((c) => c.is_prospect).length;
        const activeRecently = data.filter(
          (c) => c.visits_last_30_days > 0
        ).length;
        const atRisk = data.filter(
          (c) =>
            c.total_visits > 0 &&
            c.days_since_last_visit !== null &&
            c.days_since_last_visit > 30
        ).length;
        const contactable = data.filter(
          (c) => c.email || c.mobile_phone
        ).length;
        const newLast30 = data.filter((c) => c.days_as_client <= 30).length;

        const totalLtv = data.reduce(
          (sum, c) => sum + parseFloat(c.lifetime_value || "0"),
          0
        );
        const totalVisits = data.reduce(
          (sum, c) => sum + (c.total_visits || 0),
          0
        );

        const summary = {
          total_clients: total,
          active_members: members,
          member_rate_pct: Math.round((members / total) * 100),
          prospects: prospects,
          active_last_30_days: activeRecently,
          active_rate_pct: Math.round((activeRecently / total) * 100),
          at_risk_clients: atRisk,
          churn_risk_pct: Math.round(
            (atRisk / Math.max(total - prospects, 1)) * 100
          ),
          new_clients_30_days: newLast30,
          contactable: contactable,
          contactable_pct: Math.round((contactable / total) * 100),
          total_revenue: Math.round(totalLtv * 100) / 100,
          avg_ltv: Math.round((totalLtv / total) * 100) / 100,
          total_visits: totalVisits,
          avg_visits: Math.round((totalVisits / total) * 10) / 10,
        };

        return {
          summary,
          health_indicators: {
            membership_health:
              summary.member_rate_pct > 30
                ? "Good"
                : summary.member_rate_pct > 15
                ? "Fair"
                : "Needs Attention",
            engagement_health:
              summary.active_rate_pct > 40
                ? "Good"
                : summary.active_rate_pct > 20
                ? "Fair"
                : "Needs Attention",
            data_quality:
              summary.contactable_pct > 80
                ? "Good"
                : summary.contactable_pct > 50
                ? "Fair"
                : "Poor",
          },
        };
      },
    }),
  };
}
