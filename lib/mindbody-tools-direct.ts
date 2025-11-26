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
    // CLASS MANAGEMENT
    // ============================================
    getClasses: tool({
      description:
        "Get a list of classes with optional filters. Use this to show class schedules, find specific types of classes, or check availability. Returns class details including time, location, instructor, and capacity. Always specify a reasonable limit to avoid timeouts.",
      parameters: z.object({
        startDateTime: z
          .string()
          .optional()
          .describe("Start date/time in ISO format (YYYY-MM-DDTHH:mm:ss)"),
        endDateTime: z
          .string()
          .optional()
          .describe("End date/time in ISO format (YYYY-MM-DDTHH:mm:ss)"),
        classDescriptionIds: z
          .array(z.number())
          .optional()
          .describe("Filter by class description IDs"),
        locationIds: z
          .array(z.number())
          .optional()
          .describe("Filter by location IDs"),
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by staff IDs"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 50)"),
      }),
      execute: async (params) => {
        // Set default limit to prevent timeouts
        const paramsWithLimit = {
          ...params,
          limit: params.limit || 50,
        };
        const queryString = buildQueryString(paramsWithLimit);
        return await mindbodyFetch(
          `/class/classes${queryString}`,
          credentials,
          "getClasses",
          { method: "GET" }
        );
      },
    }),

    getClassDescriptions: tool({
      description:
        "Get descriptions of available class types (e.g., Yoga, Pilates, HIIT). Use this to learn about different class offerings and their details.",
      parameters: z.object({
        classDescriptionIds: z
          .array(z.number())
          .optional()
          .describe("Specific class description IDs to retrieve"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/class/classdescriptions${queryString}`,
          credentials,
          "getClassDescriptions",
          { method: "GET" }
        );
      },
    }),

    getWaitlistEntries: tool({
      description:
        "Get waitlist entries for classes. Use this to see who's waiting for full classes.",
      parameters: z.object({
        classIds: z
          .array(z.number())
          .optional()
          .describe("Filter by specific class IDs"),
        clientIds: z
          .array(z.string())
          .optional()
          .describe("Filter by client IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/class/waitlistentries${queryString}`,
          credentials,
          "getWaitlistEntries",
          { method: "GET" }
        );
      },
    }),

    addClientToClass: tool({
      description:
        "Book a client into a specific class. Use this to register someone for a class. IMPORTANT: First use getClients to find the client ID, and getClasses to find the class ID.",
      parameters: z.object({
        clientId: z
          .string()
          .describe("The client's unique ID (get from getClients first)"),
        classId: z
          .number()
          .describe("The class ID to book (get from getClasses first)"),
        test: z
          .boolean()
          .optional()
          .describe("Test mode - don't actually book (default: false)"),
        sendEmail: z
          .boolean()
          .optional()
          .describe("Send confirmation email to client (default: true)"),
      }),
      execute: async ({ clientId, classId, test, sendEmail }) => {
        return await mindbodyFetch(
          `/class/addclienttoclass`,
          credentials,
          "addClientToClass",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: clientId,
              ClassId: classId,
              Test: test || false,
              SendEmail: sendEmail !== false,
            }),
          }
        );
      },
    }),

    // ============================================
    // CLIENT MANAGEMENT
    // ============================================
    getClients: tool({
      description:
        "Search for clients by name, email, or other criteria. Use this to find client information, contact details, and membership status. Always specify a reasonable limit (e.g., 25-100) to avoid timeouts.",
      parameters: z.object({
        searchText: z
          .string()
          .optional()
          .describe("Search by name, email, or phone"),
        clientIds: z
          .array(z.string())
          .optional()
          .describe("Specific client IDs to retrieve"),
        limit: z
          .number()
          .optional()
          .describe(
            "Maximum number of results (default: 25, max recommended: 100)"
          ),
      }),
      execute: async (params) => {
        // Set default limit to prevent timeouts with large datasets
        const paramsWithLimit = {
          ...params,
          limit: params.limit || 25,
        };
        const queryString = buildQueryString(paramsWithLimit);
        return await mindbodyFetch(
          `/client/clients${queryString}`,
          credentials,
          "getClients",
          { method: "GET" }
        );
      },
    }),

    addClient: tool({
      description:
        "Register a new client in the system. Use this to create a new client account with their basic information.",
      parameters: z.object({
        firstName: z.string().describe("Client's first name"),
        lastName: z.string().describe("Client's last name"),
        email: z.string().optional().describe("Client's email address"),
        mobilePhone: z
          .string()
          .optional()
          .describe("Client's mobile phone number"),
        birthDate: z
          .string()
          .optional()
          .describe("Client's birth date (YYYY-MM-DD)"),
      }),
      execute: async ({
        firstName,
        lastName,
        email,
        mobilePhone,
        birthDate,
      }) => {
        return await mindbodyFetch(
          `/client/addclient`,
          credentials,
          "addClient",
          {
            method: "POST",
            body: JSON.stringify({
              FirstName: firstName,
              LastName: lastName,
              Email: email,
              MobilePhone: mobilePhone,
              BirthDate: birthDate,
            }),
          }
        );
      },
    }),

    updateClient: tool({
      description:
        "Update an existing client's information. Use this to modify client details like name, email, or phone. IMPORTANT: You must first use getClients to find the client and get their ID.",
      parameters: z.object({
        clientId: z
          .string()
          .describe(
            "The client's unique ID (required - get this from getClients first)"
          ),
        firstName: z.string().optional().describe("Updated first name"),
        lastName: z.string().optional().describe("Updated last name"),
        email: z.string().optional().describe("Updated email address"),
        mobilePhone: z.string().optional().describe("Updated mobile phone"),
      }),
      execute: async ({
        clientId,
        firstName,
        lastName,
        email,
        mobilePhone,
      }) => {
        return await mindbodyFetch(
          `/client/updateclient`,
          credentials,
          "updateClient",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: clientId,
              FirstName: firstName,
              LastName: lastName,
              Email: email,
              MobilePhone: mobilePhone,
            }),
          }
        );
      },
    }),

    getClientVisits: tool({
      description:
        "Get a specific client's visit history and attendance record. This tool shows which classes a client has attended. You MUST provide a clientId - if you don't have it, use getClients tool first to search for the client by name or email.",
      parameters: z.object({
        clientId: z
          .string()
          .describe(
            "The client's unique ID - REQUIRED. Get this from getClients tool first by searching for the client's name."
          ),
        startDate: z
          .string()
          .optional()
          .describe("Start date for visit history (YYYY-MM-DD)"),
        endDate: z
          .string()
          .optional()
          .describe("End date for visit history (YYYY-MM-DD)"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        if (!params.clientId) {
          return {
            error:
              "clientId is required. Please use the getClients tool first to find the client and get their ID.",
            suggestion:
              "Try: getClients with searchText parameter to find the client, then use their ID here.",
          };
        }
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientvisits${queryString}`,
          credentials,
          "getClientVisits",
          { method: "GET" }
        );
      },
    }),

    addClientArrival: tool({
      description:
        "Check in a client for a class or appointment. Use this to mark attendance when a client arrives. IMPORTANT: You must first use getClients to find the client and get their ID.",
      parameters: z.object({
        clientId: z
          .string()
          .describe(
            "The client's unique ID (required - get this from getClients first)"
          ),
        classId: z
          .number()
          .optional()
          .describe("The class ID (if checking into a class)"),
      }),
      execute: async ({ clientId, classId }) => {
        return await mindbodyFetch(
          `/client/addclientarrival`,
          credentials,
          "addClientArrival",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: clientId,
              ClassId: classId,
            }),
          }
        );
      },
    }),

    // ============================================
    // STAFF MANAGEMENT
    // ============================================
    getStaff: tool({
      description:
        "Get information about staff members and instructors. Use this to see who works at the studio, their bios, and specialties.",
      parameters: z.object({
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Specific staff IDs to retrieve"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/staff/staff${queryString}`,
          credentials,
          "getStaff",
          { method: "GET" }
        );
      },
    }),

    // ============================================
    // LOCATION & SITE
    // ============================================
    getLocations: tool({
      description:
        "Get studio locations and facility information. Use this to see where the business operates, addresses, and amenities.",
      parameters: z.object({
        locationIds: z
          .array(z.number())
          .optional()
          .describe("Specific location IDs to retrieve"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/locations${queryString}`,
          credentials,
          "getLocations",
          { method: "GET" }
        );
      },
    }),

    getSites: tool({
      description:
        "Get site/business information including name, logo, and configuration. Use this to get business details.",
      parameters: z.object({}),
      execute: async () => {
        return await mindbodyFetch(`/site/sites`, credentials, "getSites", {
          method: "GET",
        });
      },
    }),

    // ============================================
    // SERVICES & PRODUCTS
    // ============================================
    getServices: tool({
      description:
        "Get available services offered by the business (appointments, sessions, etc.). Use this to see what services are available for purchase.",
      parameters: z.object({
        serviceIds: z
          .array(z.string())
          .optional()
          .describe("Specific service IDs to retrieve"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/services${queryString}`,
          credentials,
          "getServices",
          { method: "GET" }
        );
      },
    }),

    getPackages: tool({
      description:
        "Get available class packages and pricing. Use this to see package options clients can purchase (e.g., 10-class pack).",
      parameters: z.object({
        packageIds: z
          .array(z.string())
          .optional()
          .describe("Specific package IDs to retrieve"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/packages${queryString}`,
          credentials,
          "getPackages",
          { method: "GET" }
        );
      },
    }),

    // ============================================
    // APPOINTMENTS
    // ============================================
    getActiveSessionTimes: tool({
      description: "Get active session times for appointments.",
      parameters: z.object({
        scheduleId: z.number().optional().describe("Schedule ID to filter by"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/appointment/activesessiontimes${queryString}`,
          credentials,
          "getActiveSessionTimes",
          { method: "GET" }
        );
      },
    }),

    getAppointmentAddOns: tool({
      description: "Get add-ons available for appointments.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/appointment/addons${queryString}`,
          credentials,
          "getAppointmentAddOns",
          { method: "GET" }
        );
      },
    }),

    getAppointmentOptions: tool({
      description: "Get appointment options and settings.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/appointment/appointmentoptions${queryString}`,
          credentials,
          "getAppointmentOptions",
          { method: "GET" }
        );
      },
    }),

    getAvailableDates: tool({
      description: "Get available dates for scheduling appointments.",
      parameters: z.object({
        startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
        endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by staff IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/appointment/availabledates${queryString}`,
          credentials,
          "getAvailableDates",
          { method: "GET" }
        );
      },
    }),

    getBookableItems: tool({
      description: "Get items that can be booked for appointments.",
      parameters: z.object({
        sessionTypeIds: z
          .array(z.number())
          .optional()
          .describe("Session type IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/appointment/bookableitems${queryString}`,
          credentials,
          "getBookableItems",
          { method: "GET" }
        );
      },
    }),

    getScheduleItems: tool({
      description: "Get schedule items for appointments.",
      parameters: z.object({
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/appointment/scheduleitems${queryString}`,
          credentials,
          "getScheduleItems",
          { method: "GET" }
        );
      },
    }),

    getStaffAppointments: tool({
      description:
        "Get appointments for staff members. Use this to see scheduled appointments and availability.",
      parameters: z.object({
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by specific staff IDs"),
        startDate: z
          .string()
          .optional()
          .describe("Start date (YYYY-MM-DDTHH:mm:ss)"),
        endDate: z
          .string()
          .optional()
          .describe("End date (YYYY-MM-DDTHH:mm:ss)"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/appointment/staffappointments${queryString}`,
          credentials,
          "getStaffAppointments",
          { method: "GET" }
        );
      },
    }),

    getUnavailabilities: tool({
      description: "Get staff unavailabilities for scheduling.",
      parameters: z.object({
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by staff IDs"),
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/appointment/unavailabilities${queryString}`,
          credentials,
          "getUnavailabilities",
          { method: "GET" }
        );
      },
    }),

    addAppointment: tool({
      description: "Schedule a new appointment.",
      parameters: z.object({
        staffId: z.number().describe("Staff member ID"),
        sessionTypeId: z.number().describe("Session type ID"),
        startDateTime: z.string().describe("Start date/time (ISO format)"),
        clientId: z.string().describe("Client ID"),
        notes: z.string().optional().describe("Appointment notes"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/appointment/addappointment`,
          credentials,
          "addAppointment",
          {
            method: "POST",
            body: JSON.stringify({
              StaffId: params.staffId,
              SessionTypeId: params.sessionTypeId,
              StartDateTime: params.startDateTime,
              ClientId: params.clientId,
              Notes: params.notes,
            }),
          }
        );
      },
    }),

    addAppointmentAddOn: tool({
      description: "Add an add-on to an existing appointment.",
      parameters: z.object({
        appointmentId: z.number().describe("Appointment ID"),
        addOnId: z.number().describe("Add-on ID to add"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/appointment/addappointmentaddon`,
          credentials,
          "addAppointmentAddOn",
          {
            method: "POST",
            body: JSON.stringify({
              AppointmentId: params.appointmentId,
              AddOnId: params.addOnId,
            }),
          }
        );
      },
    }),

    addMultipleAppointments: tool({
      description: "Schedule multiple appointments at once.",
      parameters: z.object({
        appointments: z
          .array(
            z.object({
              staffId: z.number(),
              sessionTypeId: z.number(),
              startDateTime: z.string(),
              clientId: z.string(),
            })
          )
          .describe("Array of appointments to create"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/appointment/addmultipleappointments`,
          credentials,
          "addMultipleAppointments",
          {
            method: "POST",
            body: JSON.stringify({
              Appointments: params.appointments.map((apt) => ({
                StaffId: apt.staffId,
                SessionTypeId: apt.sessionTypeId,
                StartDateTime: apt.startDateTime,
                ClientId: apt.clientId,
              })),
            }),
          }
        );
      },
    }),

    updateAvailability: tool({
      description: "Update staff availability for appointments.",
      parameters: z.object({
        availabilityId: z.number().describe("Availability ID to update"),
        startDateTime: z.string().optional().describe("New start date/time"),
        endDateTime: z.string().optional().describe("New end date/time"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/appointment/updateavailability`,
          credentials,
          "updateAvailability",
          {
            method: "PUT",
            body: JSON.stringify({
              AvailabilityId: params.availabilityId,
              StartDateTime: params.startDateTime,
              EndDateTime: params.endDateTime,
            }),
          }
        );
      },
    }),

    addAvailabilities: tool({
      description: "Add new availability windows for staff.",
      parameters: z.object({
        staffId: z.number().describe("Staff member ID"),
        availabilities: z
          .array(
            z.object({
              startDateTime: z.string(),
              endDateTime: z.string(),
            })
          )
          .describe("Availability time windows"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/appointment/addavailabilities`,
          credentials,
          "addAvailabilities",
          {
            method: "POST",
            body: JSON.stringify({
              StaffId: params.staffId,
              Availabilities: params.availabilities.map((a) => ({
                StartDateTime: a.startDateTime,
                EndDateTime: a.endDateTime,
              })),
            }),
          }
        );
      },
    }),

    updateAppointment: tool({
      description: "Update an existing appointment.",
      parameters: z.object({
        appointmentId: z.number().describe("Appointment ID to update"),
        startDateTime: z.string().optional().describe("New start date/time"),
        staffId: z.number().optional().describe("New staff ID"),
        notes: z.string().optional().describe("Updated notes"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/appointment/updateappointment`,
          credentials,
          "updateAppointment",
          {
            method: "POST",
            body: JSON.stringify({
              AppointmentId: params.appointmentId,
              StartDateTime: params.startDateTime,
              StaffId: params.staffId,
              Notes: params.notes,
            }),
          }
        );
      },
    }),

    removeFromAppointmentWaitlist: tool({
      description: "Remove a client from an appointment waitlist.",
      parameters: z.object({
        waitlistEntryId: z.number().describe("Waitlist entry ID to remove"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/appointment/removefromwaitlist?waitlistEntryId=${params.waitlistEntryId}`,
          credentials,
          "removeFromAppointmentWaitlist",
          { method: "DELETE" }
        );
      },
    }),

    deleteAvailability: tool({
      description: "Delete a staff availability window.",
      parameters: z.object({
        availabilityId: z.number().describe("Availability ID to delete"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/appointment/deleteavailability?availabilityId=${params.availabilityId}`,
          credentials,
          "deleteAvailability",
          { method: "DELETE" }
        );
      },
    }),

    deleteAppointmentAddOn: tool({
      description: "Delete an add-on from an appointment.",
      parameters: z.object({
        appointmentId: z.number().describe("Appointment ID"),
        addOnId: z.number().describe("Add-on ID to remove"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/appointment/deleteappointmentaddon?appointmentId=${params.appointmentId}&addOnId=${params.addOnId}`,
          credentials,
          "deleteAppointmentAddOn",
          { method: "DELETE" }
        );
      },
    }),

    // ============================================
    // CLASS MANAGEMENT (CONTINUED)
    // ============================================
    getClassSchedules: tool({
      description: "Get class schedules and recurring class information.",
      parameters: z.object({
        classScheduleIds: z
          .array(z.number())
          .optional()
          .describe("Specific schedule IDs"),
        locationIds: z
          .array(z.number())
          .optional()
          .describe("Filter by location"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/class/classschedules${queryString}`,
          credentials,
          "getClassSchedules",
          { method: "GET" }
        );
      },
    }),

    getClassVisits: tool({
      description:
        "Get visit records for specific classes or clients. IMPORTANT: You must provide either a classId (to see who attended a class) OR a clientId (to see which classes a client attended). Do not call this without at least one of these filters.",
      parameters: z.object({
        classId: z
          .number()
          .optional()
          .describe("Specific class ID to see attendance for that class"),
        clientId: z
          .string()
          .optional()
          .describe("Specific client ID to see their visit history"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 50)"),
      }),
      execute: async (params) => {
        // Validate that at least one filter is provided
        if (!params.classId && !params.clientId) {
          return {
            error: "Either classId or clientId is required for getClassVisits.",
            suggestion:
              "Use getClasses to find a class ID, or use getClients to find a client ID first, then call getClassVisits with that ID.",
          };
        }

        const paramsWithLimit = {
          ...params,
          limit: params.limit || 50,
        };
        const queryString = buildQueryString(paramsWithLimit);
        return await mindbodyFetch(
          `/class/classvisits${queryString}`,
          credentials,
          "getClassVisits",
          { method: "GET" }
        );
      },
    }),

    getCourses: tool({
      description: "Get course information for multi-session classes.",
      parameters: z.object({
        courseIds: z
          .array(z.number())
          .optional()
          .describe("Specific course IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/class/courses${queryString}`,
          credentials,
          "getCourses",
          { method: "GET" }
        );
      },
    }),

    getSemesters: tool({
      description: "Get semester information for course scheduling.",
      parameters: z.object({
        semesterIds: z
          .array(z.number())
          .optional()
          .describe("Specific semester IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/class/semesters${queryString}`,
          credentials,
          "getSemesters",
          { method: "GET" }
        );
      },
    }),

    addClassSchedule: tool({
      description: "Create a new recurring class schedule.",
      parameters: z.object({
        classDescriptionId: z.number().describe("Class description/type ID"),
        staffId: z.number().describe("Instructor ID"),
        locationId: z.number().describe("Location ID"),
        startTime: z.string().describe("Start time"),
        endTime: z.string().describe("End time"),
        daysOfWeek: z
          .array(z.number())
          .describe("Days of week (0=Sunday, 6=Saturday)"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/class/addclassschedule`,
          credentials,
          "addClassSchedule",
          {
            method: "POST",
            body: JSON.stringify({
              ClassDescriptionId: params.classDescriptionId,
              StaffId: params.staffId,
              LocationId: params.locationId,
              StartTime: params.startTime,
              EndTime: params.endTime,
              DaysOfWeek: params.daysOfWeek,
            }),
          }
        );
      },
    }),

    cancelSingleClass: tool({
      description: "Cancel a single instance of a class.",
      parameters: z.object({
        classId: z.number().describe("Class ID to cancel"),
        sendClientEmail: z
          .boolean()
          .optional()
          .describe("Notify enrolled clients"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/class/cancelsingleclass`,
          credentials,
          "cancelSingleClass",
          {
            method: "POST",
            body: JSON.stringify({
              ClassId: params.classId,
              SendClientEmail: params.sendClientEmail,
            }),
          }
        );
      },
    }),

    removeClientFromClass: tool({
      description: "Remove a client from a booked class.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        classId: z.number().describe("Class ID"),
        sendEmail: z.boolean().optional().describe("Send confirmation email"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/class/removeclientfromclass`,
          credentials,
          "removeClientFromClass",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              ClassId: params.classId,
              SendEmail: params.sendEmail,
            }),
          }
        );
      },
    }),

    removeClientsFromClasses: tool({
      description: "Remove multiple clients from classes in batch.",
      parameters: z.object({
        removals: z
          .array(
            z.object({
              clientId: z.string(),
              classId: z.number(),
            })
          )
          .describe("Array of client-class pairs to remove"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/class/removeclientsfromclasses`,
          credentials,
          "removeClientsFromClasses",
          {
            method: "POST",
            body: JSON.stringify({
              Removals: params.removals.map((r) => ({
                ClientId: r.clientId,
                ClassId: r.classId,
              })),
            }),
          }
        );
      },
    }),

    removeFromClassWaitlist: tool({
      description: "Remove a client from a class waitlist.",
      parameters: z.object({
        waitlistEntryId: z.number().describe("Waitlist entry ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/class/removefromwaitlist`,
          credentials,
          "removeFromClassWaitlist",
          {
            method: "POST",
            body: JSON.stringify({
              WaitlistEntryId: params.waitlistEntryId,
            }),
          }
        );
      },
    }),

    substituteClassTeacher: tool({
      description: "Substitute the teacher for a class.",
      parameters: z.object({
        classId: z.number().describe("Class ID"),
        substituteStaffId: z.number().describe("New staff/instructor ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/class/substituteclassteacher`,
          credentials,
          "substituteClassTeacher",
          {
            method: "POST",
            body: JSON.stringify({
              ClassId: params.classId,
              SubstituteStaffId: params.substituteStaffId,
            }),
          }
        );
      },
    }),

    updateClassSchedule: tool({
      description: "Update a recurring class schedule.",
      parameters: z.object({
        classScheduleId: z.number().describe("Class schedule ID"),
        staffId: z.number().optional().describe("New instructor ID"),
        startTime: z.string().optional().describe("New start time"),
        endTime: z.string().optional().describe("New end time"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/class/updateclassschedule`,
          credentials,
          "updateClassSchedule",
          {
            method: "POST",
            body: JSON.stringify({
              ClassScheduleId: params.classScheduleId,
              StaffId: params.staffId,
              StartTime: params.startTime,
              EndTime: params.endTime,
            }),
          }
        );
      },
    }),

    updateClassScheduleNotes: tool({
      description: "Update notes for a class schedule.",
      parameters: z.object({
        classScheduleId: z.number().describe("Class schedule ID"),
        notes: z.string().describe("Updated notes"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/class/updateclassschedulenotes`,
          credentials,
          "updateClassScheduleNotes",
          {
            method: "PATCH",
            body: JSON.stringify({
              ClassScheduleId: params.classScheduleId,
              Notes: params.notes,
            }),
          }
        );
      },
    }),

    // ============================================
    // CLIENT MANAGEMENT (CONTINUED)
    // ============================================
    getActiveClientMemberships: tool({
      description: "Get active memberships for a specific client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/activeclientmemberships${queryString}`,
          credentials,
          "getActiveClientMemberships",
          { method: "GET" }
        );
      },
    }),

    getActiveClientsMemberships: tool({
      description: "Get active memberships for multiple clients.",
      parameters: z.object({
        clientIds: z.array(z.string()).describe("Array of client IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/activeclientsmemberships${queryString}`,
          credentials,
          "getActiveClientsMemberships",
          { method: "GET" }
        );
      },
    }),

    getClientAccountBalances: tool({
      description: "Get account balance information for clients.",
      parameters: z.object({
        clientIds: z.array(z.string()).describe("Client IDs to check"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientaccountbalances${queryString}`,
          credentials,
          "getClientAccountBalances",
          { method: "GET" }
        );
      },
    }),

    getClientCompleteInfo: tool({
      description: "Get complete detailed information for a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientcompleteinfo${queryString}`,
          credentials,
          "getClientCompleteInfo",
          { method: "GET" }
        );
      },
    }),

    getClientContracts: tool({
      description: "Get contract information for clients.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientcontracts${queryString}`,
          credentials,
          "getClientContracts",
          { method: "GET" }
        );
      },
    }),

    getDirectDebitInfo: tool({
      description: "Get direct debit/payment information for a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/directdebitinfo${queryString}`,
          credentials,
          "getDirectDebitInfo",
          { method: "GET" }
        );
      },
    }),

    deleteDirectDebitInfo: tool({
      description: "Delete direct debit information for a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/directdebitinfo?clientId=${params.clientId}`,
          credentials,
          "deleteDirectDebitInfo",
          { method: "DELETE" }
        );
      },
    }),

    getClientDuplicates: tool({
      description: "Find potential duplicate client records.",
      parameters: z.object({
        firstName: z.string().optional().describe("First name to search"),
        lastName: z.string().optional().describe("Last name to search"),
        email: z.string().optional().describe("Email to search"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientduplicates${queryString}`,
          credentials,
          "getClientDuplicates",
          { method: "GET" }
        );
      },
    }),

    getClientFormulaNotes: tool({
      description: "Get formula notes for a client (SOAP notes, etc.).",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientformulanotes${queryString}`,
          credentials,
          "getClientFormulaNotes",
          { method: "GET" }
        );
      },
    }),

    getClientIndexes: tool({
      description: "Get client index values (custom categorizations).",
      parameters: z.object({
        clientId: z.string().optional().describe("Client ID"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientindexes${queryString}`,
          credentials,
          "getClientIndexes",
          { method: "GET" }
        );
      },
    }),

    getClientPurchases: tool({
      description: "Get purchase history for a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        startDate: z.string().optional().describe("Start date filter"),
        endDate: z.string().optional().describe("End date filter"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientpurchases${queryString}`,
          credentials,
          "getClientPurchases",
          { method: "GET" }
        );
      },
    }),

    getClientReferralTypes: tool({
      description:
        "Get available referral types for tracking how clients found you.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientreferraltypes${queryString}`,
          credentials,
          "getClientReferralTypes",
          { method: "GET" }
        );
      },
    }),

    getClientRewards: tool({
      description: "Get rewards/loyalty points for clients.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientrewards${queryString}`,
          credentials,
          "getClientRewards",
          { method: "GET" }
        );
      },
    }),

    updateClientRewards: tool({
      description: "Update client rewards/loyalty points.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        points: z.number().describe("Points to add or subtract"),
        reason: z.string().optional().describe("Reason for adjustment"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/updateclientrewards`,
          credentials,
          "updateClientRewards",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              Points: params.points,
              Reason: params.reason,
            }),
          }
        );
      },
    }),

    getClientSchedule: tool({
      description:
        "Get upcoming scheduled classes and appointments for a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientschedule${queryString}`,
          credentials,
          "getClientSchedule",
          { method: "GET" }
        );
      },
    }),

    getClientServices: tool({
      description: "Get services purchased/available for a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/clientservices${queryString}`,
          credentials,
          "getClientServices",
          { method: "GET" }
        );
      },
    }),

    getContactLogs: tool({
      description:
        "Get contact/communication logs for clients. Optionally filter by client ID or date range.",
      parameters: z.object({
        clientId: z.string().optional().describe("Filter by client ID"),
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results (default: 50)"),
      }),
      execute: async (params) => {
        const paramsWithLimit = {
          ...params,
          limit: params.limit || 50,
        };
        const queryString = buildQueryString(paramsWithLimit);
        return await mindbodyFetch(
          `/client/contactlogs${queryString}`,
          credentials,
          "getContactLogs",
          { method: "GET" }
        );
      },
    }),

    getContactLogTypes: tool({
      description: "Get available contact log types.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/contactlogtypes${queryString}`,
          credentials,
          "getContactLogTypes",
          { method: "GET" }
        );
      },
    }),

    getCrossRegionalClientAssociations: tool({
      description: "Get client associations across different regions/sites.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/crossregionalclientassociations${queryString}`,
          credentials,
          "getCrossRegionalClientAssociations",
          { method: "GET" }
        );
      },
    }),

    getCustomClientFields: tool({
      description: "Get custom field definitions for clients.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/client/customclientfields${queryString}`,
          credentials,
          "getCustomClientFields",
          { method: "GET" }
        );
      },
    }),

    getRequiredClientFields: tool({
      description: "Get required fields for client registration.",
      parameters: z.object({}),
      execute: async () => {
        return await mindbodyFetch(
          `/client/requiredclientfields`,
          credentials,
          "getRequiredClientFields",
          { method: "GET" }
        );
      },
    }),

    addClientDirectDebitInfo: tool({
      description: "Add direct debit/payment information for a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        accountNumber: z.string().describe("Bank account number"),
        routingNumber: z.string().describe("Bank routing number"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/addclientdirectdebitinfo`,
          credentials,
          "addClientDirectDebitInfo",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              AccountNumber: params.accountNumber,
              RoutingNumber: params.routingNumber,
            }),
          }
        );
      },
    }),

    addFormulaNoteToClient: tool({
      description: "Add a formula note (SOAP note, etc.) to a client record.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        note: z.string().describe("Note content"),
        appointmentId: z
          .number()
          .optional()
          .describe("Associated appointment ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/addformulanote`,
          credentials,
          "addFormulaNoteToClient",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              Note: params.note,
              AppointmentId: params.appointmentId,
            }),
          }
        );
      },
    }),

    addContactLog: tool({
      description: "Add a contact log entry for client communication tracking.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        contactLogTypeId: z.number().describe("Contact log type ID"),
        text: z.string().describe("Log entry text"),
        contactDate: z.string().optional().describe("Date of contact"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/addcontactlog`,
          credentials,
          "addContactLog",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              ContactLogTypeId: params.contactLogTypeId,
              Text: params.text,
              ContactDate: params.contactDate,
            }),
          }
        );
      },
    }),

    mergeClient: tool({
      description: "Merge two client records into one.",
      parameters: z.object({
        sourceClientId: z
          .string()
          .describe("Client ID to merge from (will be deleted)"),
        targetClientId: z
          .string()
          .describe("Client ID to merge into (will remain)"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/mergeclient`,
          credentials,
          "mergeClient",
          {
            method: "POST",
            body: JSON.stringify({
              SourceClientId: params.sourceClientId,
              TargetClientId: params.targetClientId,
            }),
          }
        );
      },
    }),

    sendAutoEmail: tool({
      description: "Send an automated email template to a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        emailTemplateId: z.number().describe("Email template ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/sendautoemail`,
          credentials,
          "sendAutoEmail",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              EmailTemplateId: params.emailTemplateId,
            }),
          }
        );
      },
    }),

    sendPasswordResetEmail: tool({
      description: "Send a password reset email to a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/sendpasswordresetemail`,
          credentials,
          "sendPasswordResetEmail",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
            }),
          }
        );
      },
    }),

    suspendContract: tool({
      description: "Suspend a client contract temporarily.",
      parameters: z.object({
        contractId: z.number().describe("Contract ID"),
        suspendDate: z.string().describe("Suspension start date"),
        resumeDate: z.string().optional().describe("Suspension end date"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/suspendcontract`,
          credentials,
          "suspendContract",
          {
            method: "POST",
            body: JSON.stringify({
              ContractId: params.contractId,
              SuspendDate: params.suspendDate,
              ResumeDate: params.resumeDate,
            }),
          }
        );
      },
    }),

    terminateContract: tool({
      description: "Terminate a client contract permanently.",
      parameters: z.object({
        contractId: z.number().describe("Contract ID"),
        terminateDate: z.string().describe("Termination date"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/terminatecontract`,
          credentials,
          "terminateContract",
          {
            method: "POST",
            body: JSON.stringify({
              ContractId: params.contractId,
              TerminateDate: params.terminateDate,
            }),
          }
        );
      },
    }),

    updateClientContractAutopays: tool({
      description: "Update autopay settings for a client contract.",
      parameters: z.object({
        contractId: z.number().describe("Contract ID"),
        autopayEnabled: z.boolean().describe("Enable or disable autopay"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/updateclientcontractautopays`,
          credentials,
          "updateClientContractAutopays",
          {
            method: "POST",
            body: JSON.stringify({
              ContractId: params.contractId,
              AutopayEnabled: params.autopayEnabled,
            }),
          }
        );
      },
    }),

    updateClientService: tool({
      description: "Update a service associated with a client.",
      parameters: z.object({
        clientServiceId: z.number().describe("Client service ID"),
        activeDate: z.string().optional().describe("New active date"),
        expirationDate: z.string().optional().describe("New expiration date"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/updateclientservice`,
          credentials,
          "updateClientService",
          {
            method: "POST",
            body: JSON.stringify({
              ClientServiceId: params.clientServiceId,
              ActiveDate: params.activeDate,
              ExpirationDate: params.expirationDate,
            }),
          }
        );
      },
    }),

    updateClientVisit: tool({
      description: "Update a client visit record.",
      parameters: z.object({
        visitId: z.number().describe("Visit ID"),
        makeUp: z.boolean().optional().describe("Mark as makeup visit"),
        signedIn: z.boolean().optional().describe("Mark as signed in"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/updateclientvisit`,
          credentials,
          "updateClientVisit",
          {
            method: "POST",
            body: JSON.stringify({
              VisitId: params.visitId,
              MakeUp: params.makeUp,
              SignedIn: params.signedIn,
            }),
          }
        );
      },
    }),

    updateContactLog: tool({
      description: "Update an existing contact log entry.",
      parameters: z.object({
        contactLogId: z.number().describe("Contact log ID"),
        text: z.string().optional().describe("Updated text"),
        contactDate: z.string().optional().describe("Updated date"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/updatecontactlog`,
          credentials,
          "updateContactLog",
          {
            method: "POST",
            body: JSON.stringify({
              ContactLogId: params.contactLogId,
              Text: params.text,
              ContactDate: params.contactDate,
            }),
          }
        );
      },
    }),

    uploadClientDocument: tool({
      description: "Upload a document to a client's file.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        fileName: z.string().describe("File name"),
        fileContent: z.string().describe("Base64 encoded file content"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/uploadclientdocument`,
          credentials,
          "uploadClientDocument",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              FileName: params.fileName,
              FileContent: params.fileContent,
            }),
          }
        );
      },
    }),

    uploadClientPhoto: tool({
      description: "Upload a photo for a client profile.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        imageData: z.string().describe("Base64 encoded image data"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/uploadclientphoto`,
          credentials,
          "uploadClientPhoto",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              ImageData: params.imageData,
            }),
          }
        );
      },
    }),

    deleteClientFormulaNot: tool({
      description: "Delete a formula note from a client record.",
      parameters: z.object({
        formulaNoteId: z.number().describe("Formula note ID to delete"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/clientformulanote?formulaNoteId=${params.formulaNoteId}`,
          credentials,
          "deleteClientFormulaNot",
          { method: "DELETE" }
        );
      },
    }),

    deleteContactLog: tool({
      description: "Delete a contact log entry.",
      parameters: z.object({
        contactLogId: z.number().describe("Contact log ID to delete"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/client/contactlog?contactLogId=${params.contactLogId}`,
          credentials,
          "deleteContactLog",
          { method: "DELETE" }
        );
      },
    }),

    // ============================================
    // CROSS SITE
    // ============================================
    copyCreditCard: tool({
      description: "Copy credit card information across sites for a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        sourceSiteId: z.string().describe("Source site ID"),
        targetSiteId: z.string().describe("Target site ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/crosssite/copycreditcard`,
          credentials,
          "copyCreditCard",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              SourceSiteId: params.sourceSiteId,
              TargetSiteId: params.targetSiteId,
            }),
          }
        );
      },
    }),

    // ============================================
    // ENROLLMENT
    // ============================================
    getEnrollments: tool({
      description: "Get enrollment information for courses and programs.",
      parameters: z.object({
        enrollmentIds: z
          .array(z.number())
          .optional()
          .describe("Specific enrollment IDs"),
        clientId: z.string().optional().describe("Filter by client"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/enrollment/enrollments${queryString}`,
          credentials,
          "getEnrollments",
          { method: "GET" }
        );
      },
    }),

    addClientToEnrollment: tool({
      description: "Enroll a client in a course or program.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        enrollmentId: z.number().describe("Enrollment ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/enrollment/addclienttoenrollment`,
          credentials,
          "addClientToEnrollment",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              EnrollmentId: params.enrollmentId,
            }),
          }
        );
      },
    }),

    addEnrollmentSchedule: tool({
      description: "Add a schedule to an enrollment.",
      parameters: z.object({
        enrollmentId: z.number().describe("Enrollment ID"),
        startDate: z.string().describe("Start date"),
        endDate: z.string().describe("End date"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/enrollment/addenrollmentschedule`,
          credentials,
          "addEnrollmentSchedule",
          {
            method: "POST",
            body: JSON.stringify({
              EnrollmentId: params.enrollmentId,
              StartDate: params.startDate,
              EndDate: params.endDate,
            }),
          }
        );
      },
    }),

    updateEnrollmentSchedule: tool({
      description: "Update an enrollment schedule.",
      parameters: z.object({
        enrollmentScheduleId: z.number().describe("Enrollment schedule ID"),
        startDate: z.string().optional().describe("New start date"),
        endDate: z.string().optional().describe("New end date"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/enrollment/updateenrollmentschedule`,
          credentials,
          "updateEnrollmentSchedule",
          {
            method: "POST",
            body: JSON.stringify({
              EnrollmentScheduleId: params.enrollmentScheduleId,
              StartDate: params.startDate,
              EndDate: params.endDate,
            }),
          }
        );
      },
    }),

    // ============================================
    // PAYROLL
    // ============================================
    getCommissions: tool({
      description: "Get commission information for staff.",
      parameters: z.object({
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by staff IDs"),
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/payroll/commissions${queryString}`,
          credentials,
          "getCommissions",
          { method: "GET" }
        );
      },
    }),

    getScheduledServiceEarnings: tool({
      description: "Get earnings from scheduled services for payroll.",
      parameters: z.object({
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by staff IDs"),
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/payroll/scheduledserviceearnings${queryString}`,
          credentials,
          "getScheduledServiceEarnings",
          { method: "GET" }
        );
      },
    }),

    getTimeCards: tool({
      description: "Get time card information for staff payroll.",
      parameters: z.object({
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by staff IDs"),
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/payroll/timecards${queryString}`,
          credentials,
          "getTimeCards",
          { method: "GET" }
        );
      },
    }),

    getTips: tool({
      description: "Get tip information for staff.",
      parameters: z.object({
        staffIds: z
          .array(z.number())
          .optional()
          .describe("Filter by staff IDs"),
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/payroll/tips${queryString}`,
          credentials,
          "getTips",
          { method: "GET" }
        );
      },
    }),

    // ============================================
    // PICK A SPOT
    // ============================================
    getPickASpotClassList: tool({
      description: "Get list of classes with spot/seat selection enabled.",
      parameters: z.object({
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/pickaspot/classlist${queryString}`,
          credentials,
          "getPickASpotClassList",
          { method: "GET" }
        );
      },
    }),

    getPickASpotClass: tool({
      description: "Get detailed spot/seat information for a specific class.",
      parameters: z.object({
        classId: z.number().describe("Class ID"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/pickaspot/class${queryString}`,
          credentials,
          "getPickASpotClass",
          { method: "GET" }
        );
      },
    }),

    getReservation: tool({
      description: "Get spot/seat reservation details.",
      parameters: z.object({
        reservationId: z.number().describe("Reservation ID"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/pickaspot/reservation${queryString}`,
          credentials,
          "getReservation",
          { method: "GET" }
        );
      },
    }),

    updateReservation: tool({
      description: "Update an existing spot/seat reservation.",
      parameters: z.object({
        reservationId: z.number().describe("Reservation ID"),
        spotNumber: z.number().optional().describe("New spot number"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/pickaspot/reservation`,
          credentials,
          "updateReservation",
          {
            method: "PUT",
            body: JSON.stringify({
              ReservationId: params.reservationId,
              SpotNumber: params.spotNumber,
            }),
          }
        );
      },
    }),

    createReservation: tool({
      description:
        "Create a new spot/seat reservation for a client in a class.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        classId: z.number().describe("Class ID"),
        spotNumber: z.number().describe("Spot number to reserve"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/pickaspot/reservation`,
          credentials,
          "createReservation",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              ClassId: params.classId,
              SpotNumber: params.spotNumber,
            }),
          }
        );
      },
    }),

    deleteReservation: tool({
      description: "Delete a spot/seat reservation.",
      parameters: z.object({
        reservationId: z.number().describe("Reservation ID to delete"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/pickaspot/reservation?reservationId=${params.reservationId}`,
          credentials,
          "deleteReservation",
          { method: "DELETE" }
        );
      },
    }),

    // ============================================
    // SALE
    // ============================================
    getAcceptedCardTypes: tool({
      description: "Get accepted credit card types for payments.",
      parameters: z.object({}),
      execute: async () => {
        return await mindbodyFetch(
          `/sale/acceptedcardtypes`,
          credentials,
          "getAcceptedCardTypes",
          { method: "GET" }
        );
      },
    }),

    getAlternativePaymentMethods: tool({
      description: "Get alternative payment methods available.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/alternativepaymentmethods${queryString}`,
          credentials,
          "getAlternativePaymentMethods",
          { method: "GET" }
        );
      },
    }),

    getContracts: tool({
      description: "Get available contracts for purchase.",
      parameters: z.object({
        contractIds: z
          .array(z.string())
          .optional()
          .describe("Specific contract IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/contracts${queryString}`,
          credentials,
          "getContracts",
          { method: "GET" }
        );
      },
    }),

    getCustomPaymentMethods: tool({
      description: "Get custom payment methods configured for the site.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/custompaymentmethods${queryString}`,
          credentials,
          "getCustomPaymentMethods",
          { method: "GET" }
        );
      },
    }),

    getGiftCardBalance: tool({
      description: "Check the balance of a gift card.",
      parameters: z.object({
        giftCardId: z.string().describe("Gift card ID or number"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/giftcardbalance${queryString}`,
          credentials,
          "getGiftCardBalance",
          { method: "GET" }
        );
      },
    }),

    getGiftCards: tool({
      description: "Get gift card information.",
      parameters: z.object({
        giftCardIds: z
          .array(z.string())
          .optional()
          .describe("Specific gift card IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/giftcards${queryString}`,
          credentials,
          "getGiftCards",
          { method: "GET" }
        );
      },
    }),

    updateProducts: tool({
      description: "Update product information.",
      parameters: z.object({
        productId: z.string().describe("Product ID"),
        name: z.string().optional().describe("Updated name"),
        price: z.number().optional().describe("Updated price"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/products`,
          credentials,
          "updateProducts",
          {
            method: "PUT",
            body: JSON.stringify({
              ProductId: params.productId,
              Name: params.name,
              Price: params.price,
            }),
          }
        );
      },
    }),

    getProductsInventory: tool({
      description: "Get inventory levels for products.",
      parameters: z.object({
        productIds: z
          .array(z.string())
          .optional()
          .describe("Specific product IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/productsinventory${queryString}`,
          credentials,
          "getProductsInventory",
          { method: "GET" }
        );
      },
    }),

    getPurchaseContractStatus: tool({
      description: "Get the status of a contract purchase.",
      parameters: z.object({
        purchaseId: z.string().describe("Purchase ID"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/purchasecontractstatus${queryString}`,
          credentials,
          "getPurchaseContractStatus",
          { method: "GET" }
        );
      },
    }),

    getSales: tool({
      description: "Get sales transaction history.",
      parameters: z.object({
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        saleIds: z.array(z.number()).optional().describe("Specific sale IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/sales${queryString}`,
          credentials,
          "getSales",
          { method: "GET" }
        );
      },
    }),

    updateServices: tool({
      description: "Update service information.",
      parameters: z.object({
        serviceId: z.string().describe("Service ID"),
        name: z.string().optional().describe("Updated name"),
        price: z.number().optional().describe("Updated price"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/services`,
          credentials,
          "updateServices",
          {
            method: "PUT",
            body: JSON.stringify({
              ServiceId: params.serviceId,
              Name: params.name,
              Price: params.price,
            }),
          }
        );
      },
    }),

    getTransactions: tool({
      description: "Get financial transaction records.",
      parameters: z.object({
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        transactionIds: z
          .array(z.number())
          .optional()
          .describe("Specific transaction IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/sale/transactions${queryString}`,
          credentials,
          "getTransactions",
          { method: "GET" }
        );
      },
    }),

    checkoutShoppingCart: tool({
      description: "Process a shopping cart checkout.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        cartItems: z
          .array(
            z.object({
              itemId: z.string(),
              itemType: z.string(),
              quantity: z.number(),
            })
          )
          .describe("Items in cart"),
        paymentInfo: z
          .object({
            amount: z.number(),
            method: z.string(),
          })
          .describe("Payment information"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/checkoutshoppingcart`,
          credentials,
          "checkoutShoppingCart",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              CartItems: params.cartItems.map((item) => ({
                ItemId: item.itemId,
                ItemType: item.itemType,
                Quantity: item.quantity,
              })),
              PaymentInfo: {
                Amount: params.paymentInfo.amount,
                Method: params.paymentInfo.method,
              },
            }),
          }
        );
      },
    }),

    completeCheckoutShoppingCartUsingAlternativePayments: tool({
      description:
        "Complete a shopping cart checkout using alternative payment methods.",
      parameters: z.object({
        cartId: z.string().describe("Shopping cart ID"),
        paymentToken: z.string().describe("Alternative payment token"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/completecheckoutshoppingcartusingalternativepayments`,
          credentials,
          "completeCheckoutShoppingCartUsingAlternativePayments",
          {
            method: "POST",
            body: JSON.stringify({
              CartId: params.cartId,
              PaymentToken: params.paymentToken,
            }),
          }
        );
      },
    }),

    initiateCheckoutShoppingCartUsingAlternativePayments: tool({
      description:
        "Initiate a shopping cart checkout with alternative payment methods.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        cartItems: z
          .array(
            z.object({
              itemId: z.string(),
              itemType: z.string(),
            })
          )
          .describe("Items in cart"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/initiatecheckoutshoppingcartusingalternativepayments`,
          credentials,
          "initiateCheckoutShoppingCartUsingAlternativePayments",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              CartItems: params.cartItems.map((item) => ({
                ItemId: item.itemId,
                ItemType: item.itemType,
              })),
            }),
          }
        );
      },
    }),

    initiatePurchaseContractUsingAlternativePayments: tool({
      description:
        "Initiate a contract purchase using alternative payment methods.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        contractId: z.string().describe("Contract ID to purchase"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/initiatepurchasecontractusingalternativepayments`,
          credentials,
          "initiatePurchaseContractUsingAlternativePayments",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              ContractId: params.contractId,
            }),
          }
        );
      },
    }),

    purchaseAccountCredit: tool({
      description: "Purchase account credit for a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        amount: z.number().describe("Credit amount"),
        paymentInfo: z
          .object({
            method: z.string(),
          })
          .describe("Payment information"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/purchaseaccountcredit`,
          credentials,
          "purchaseAccountCredit",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              Amount: params.amount,
              PaymentInfo: {
                Method: params.paymentInfo.method,
              },
            }),
          }
        );
      },
    }),

    purchaseContract: tool({
      description: "Purchase a contract for a client.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        contractId: z.string().describe("Contract ID to purchase"),
        startDate: z.string().optional().describe("Contract start date"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/purchasecontract`,
          credentials,
          "purchaseContract",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              ContractId: params.contractId,
              StartDate: params.startDate,
            }),
          }
        );
      },
    }),

    purchaseGiftCard: tool({
      description: "Purchase a gift card.",
      parameters: z.object({
        amount: z.number().describe("Gift card amount"),
        recipientEmail: z.string().optional().describe("Recipient email"),
        purchaserClientId: z.string().describe("Purchaser client ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/purchasegiftcard`,
          credentials,
          "purchaseGiftCard",
          {
            method: "POST",
            body: JSON.stringify({
              Amount: params.amount,
              RecipientEmail: params.recipientEmail,
              PurchaserClientId: params.purchaserClientId,
            }),
          }
        );
      },
    }),

    returnSale: tool({
      description: "Process a return/refund for a sale.",
      parameters: z.object({
        saleId: z.number().describe("Sale ID to return"),
        returnItems: z
          .array(
            z.object({
              itemId: z.string(),
              quantity: z.number(),
            })
          )
          .describe("Items to return"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/returnsale`,
          credentials,
          "returnSale",
          {
            method: "POST",
            body: JSON.stringify({
              SaleId: params.saleId,
              ReturnItems: params.returnItems.map((item) => ({
                ItemId: item.itemId,
                Quantity: item.quantity,
              })),
            }),
          }
        );
      },
    }),

    updateProductPrice: tool({
      description: "Update the price of a product.",
      parameters: z.object({
        productId: z.string().describe("Product ID"),
        newPrice: z.number().describe("New price"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/updateproductprice`,
          credentials,
          "updateProductPrice",
          {
            method: "POST",
            body: JSON.stringify({
              ProductId: params.productId,
              NewPrice: params.newPrice,
            }),
          }
        );
      },
    }),

    updateSaleDate: tool({
      description: "Update the date of a sale transaction.",
      parameters: z.object({
        saleId: z.number().describe("Sale ID"),
        newDate: z.string().describe("New sale date"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/sale/saledate`,
          credentials,
          "updateSaleDate",
          {
            method: "PUT",
            body: JSON.stringify({
              SaleId: params.saleId,
              NewDate: params.newDate,
            }),
          }
        );
      },
    }),

    // ============================================
    // SITE MANAGEMENT (CONTINUED)
    // ============================================
    getActivationCode: tool({
      description: "Get activation code for client registration.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/activationcode${queryString}`,
          credentials,
          "getActivationCode",
          { method: "GET" }
        );
      },
    }),

    getCategories: tool({
      description: "Get product and service categories.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/categories${queryString}`,
          credentials,
          "getCategories",
          { method: "GET" }
        );
      },
    }),

    getGenders: tool({
      description: "Get available gender options for client profiles.",
      parameters: z.object({}),
      execute: async () => {
        return await mindbodyFetch(`/site/genders`, credentials, "getGenders", {
          method: "GET",
        });
      },
    }),

    getLiabilityWaiver: tool({
      description: "Get liability waiver information.",
      parameters: z.object({
        waiverId: z.number().optional().describe("Specific waiver ID"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/liabilitywaiver${queryString}`,
          credentials,
          "getLiabilityWaiver",
          { method: "GET" }
        );
      },
    }),

    getMemberships: tool({
      description: "Get available membership types and pricing.",
      parameters: z.object({
        membershipIds: z
          .array(z.number())
          .optional()
          .describe("Specific membership IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/memberships${queryString}`,
          credentials,
          "getMemberships",
          { method: "GET" }
        );
      },
    }),

    getMobileProviders: tool({
      description: "Get mobile phone providers for SMS.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/mobileproviders${queryString}`,
          credentials,
          "getMobileProviders",
          { method: "GET" }
        );
      },
    }),

    getPaymentTypes: tool({
      description: "Get available payment types.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/paymenttypes${queryString}`,
          credentials,
          "getPaymentTypes",
          { method: "GET" }
        );
      },
    }),

    getPrograms: tool({
      description: "Get available programs and their details.",
      parameters: z.object({
        programIds: z
          .array(z.number())
          .optional()
          .describe("Specific program IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/programs${queryString}`,
          credentials,
          "getPrograms",
          { method: "GET" }
        );
      },
    }),

    getPromoCodes: tool({
      description: "Get promotional codes.",
      parameters: z.object({
        promoCodeIds: z
          .array(z.string())
          .optional()
          .describe("Specific promo code IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/promocodes${queryString}`,
          credentials,
          "getPromoCodes",
          { method: "GET" }
        );
      },
    }),

    getProspectStages: tool({
      description: "Get prospect stages for lead management.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/prospectstages${queryString}`,
          credentials,
          "getProspectStages",
          { method: "GET" }
        );
      },
    }),

    getRelationships: tool({
      description: "Get relationship types for client relationships.",
      parameters: z.object({
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/relationships${queryString}`,
          credentials,
          "getRelationships",
          { method: "GET" }
        );
      },
    }),

    getResourceAvailabilities: tool({
      description: "Get availability for bookable resources.",
      parameters: z.object({
        resourceIds: z
          .array(z.number())
          .optional()
          .describe("Specific resource IDs"),
        startDate: z.string().optional().describe("Start date"),
        endDate: z.string().optional().describe("End date"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/resourceavailabilities${queryString}`,
          credentials,
          "getResourceAvailabilities",
          { method: "GET" }
        );
      },
    }),

    getResources: tool({
      description: "Get bookable resources (equipment, rooms, etc.).",
      parameters: z.object({
        resourceIds: z
          .array(z.number())
          .optional()
          .describe("Specific resource IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/resources${queryString}`,
          credentials,
          "getResources",
          { method: "GET" }
        );
      },
    }),

    getSessionTypes: tool({
      description: "Get session types for appointments and services.",
      parameters: z.object({
        sessionTypeIds: z
          .array(z.number())
          .optional()
          .describe("Specific session type IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/site/sessiontypes${queryString}`,
          credentials,
          "getSessionTypes",
          { method: "GET" }
        );
      },
    }),

    addClientIndex: tool({
      description: "Add a client index value (custom categorization).",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        indexId: z.number().describe("Index ID"),
        valueId: z.number().describe("Value ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/site/addclientindex`,
          credentials,
          "addClientIndex",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              IndexId: params.indexId,
              ValueId: params.valueId,
            }),
          }
        );
      },
    }),

    addPromoCode: tool({
      description: "Create a new promotional code.",
      parameters: z.object({
        code: z.string().describe("Promo code string"),
        discountPercent: z.number().optional().describe("Discount percentage"),
        discountAmount: z.number().optional().describe("Discount amount"),
        expirationDate: z.string().optional().describe("Expiration date"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/site/addpromocode`,
          credentials,
          "addPromoCode",
          {
            method: "POST",
            body: JSON.stringify({
              Code: params.code,
              DiscountPercent: params.discountPercent,
              DiscountAmount: params.discountAmount,
              ExpirationDate: params.expirationDate,
            }),
          }
        );
      },
    }),

    deactivatePromoCode: tool({
      description: "Deactivate a promotional code.",
      parameters: z.object({
        promoCodeId: z.string().describe("Promo code ID to deactivate"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/site/deactivatepromocode`,
          credentials,
          "deactivatePromoCode",
          {
            method: "POST",
            body: JSON.stringify({
              PromoCodeId: params.promoCodeId,
            }),
          }
        );
      },
    }),

    updateClientIndex: tool({
      description: "Update a client index value.",
      parameters: z.object({
        clientId: z.string().describe("Client ID"),
        indexId: z.number().describe("Index ID"),
        valueId: z.number().describe("New value ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/site/updateclientindex`,
          credentials,
          "updateClientIndex",
          {
            method: "POST",
            body: JSON.stringify({
              ClientId: params.clientId,
              IndexId: params.indexId,
              ValueId: params.valueId,
            }),
          }
        );
      },
    }),

    // ============================================
    // STAFF MANAGEMENT (CONTINUED)
    // ============================================
    getStaffImageURL: tool({
      description: "Get the image URL for a staff member.",
      parameters: z.object({
        staffId: z.number().describe("Staff ID"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/staff/staffimageurl${queryString}`,
          credentials,
          "getStaffImageURL",
          { method: "GET" }
        );
      },
    }),

    getSalesReps: tool({
      description: "Get sales representatives information.",
      parameters: z.object({
        staffIds: z.array(z.number()).optional().describe("Specific staff IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/staff/salesreps${queryString}`,
          credentials,
          "getSalesReps",
          { method: "GET" }
        );
      },
    }),

    getStaffSessionTypes: tool({
      description: "Get session types that staff members can provide.",
      parameters: z.object({
        staffIds: z.array(z.number()).optional().describe("Specific staff IDs"),
        limit: z.number().optional().describe("Maximum number of results"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/staff/staffsessiontypes${queryString}`,
          credentials,
          "getStaffSessionTypes",
          { method: "GET" }
        );
      },
    }),

    getStaffPermissions: tool({
      description: "Get permissions for staff members.",
      parameters: z.object({
        staffId: z.number().describe("Staff ID"),
      }),
      execute: async (params) => {
        const queryString = buildQueryString(params);
        return await mindbodyFetch(
          `/staff/staffpermissions${queryString}`,
          credentials,
          "getStaffPermissions",
          { method: "GET" }
        );
      },
    }),

    addStaff: tool({
      description: "Add a new staff member.",
      parameters: z.object({
        firstName: z.string().describe("First name"),
        lastName: z.string().describe("Last name"),
        email: z.string().optional().describe("Email address"),
        mobilePhone: z.string().optional().describe("Mobile phone"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(`/staff/addstaff`, credentials, "addStaff", {
          method: "POST",
          body: JSON.stringify({
            FirstName: params.firstName,
            LastName: params.lastName,
            Email: params.email,
            MobilePhone: params.mobilePhone,
          }),
        });
      },
    }),

    assignStaffSessionType: tool({
      description: "Assign a session type to a staff member.",
      parameters: z.object({
        staffId: z.number().describe("Staff ID"),
        sessionTypeId: z.number().describe("Session type ID"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/staff/assignstaffsessiontype`,
          credentials,
          "assignStaffSessionType",
          {
            method: "POST",
            body: JSON.stringify({
              StaffId: params.staffId,
              SessionTypeId: params.sessionTypeId,
            }),
          }
        );
      },
    }),

    addStaffAvailability: tool({
      description: "Add availability schedule for a staff member.",
      parameters: z.object({
        staffId: z.number().describe("Staff ID"),
        startDateTime: z.string().describe("Start date/time"),
        endDateTime: z.string().describe("End date/time"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/staff/addstaffavailability`,
          credentials,
          "addStaffAvailability",
          {
            method: "POST",
            body: JSON.stringify({
              StaffId: params.staffId,
              StartDateTime: params.startDateTime,
              EndDateTime: params.endDateTime,
            }),
          }
        );
      },
    }),

    updateStaff: tool({
      description: "Update staff member information.",
      parameters: z.object({
        staffId: z.number().describe("Staff ID"),
        firstName: z.string().optional().describe("Updated first name"),
        lastName: z.string().optional().describe("Updated last name"),
        email: z.string().optional().describe("Updated email"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/staff/updatestaff`,
          credentials,
          "updateStaff",
          {
            method: "POST",
            body: JSON.stringify({
              StaffId: params.staffId,
              FirstName: params.firstName,
              LastName: params.lastName,
              Email: params.email,
            }),
          }
        );
      },
    }),

    updateStaffPermissions: tool({
      description: "Update permissions for a staff member.",
      parameters: z.object({
        staffId: z.number().describe("Staff ID"),
        permissions: z.array(z.string()).describe("Array of permission codes"),
      }),
      execute: async (params) => {
        return await mindbodyFetch(
          `/staff/updatestaffpermissions`,
          credentials,
          "updateStaffPermissions",
          {
            method: "POST",
            body: JSON.stringify({
              StaffId: params.staffId,
              Permissions: params.permissions,
            }),
          }
        );
      },
    }),
  };
}
