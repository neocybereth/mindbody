// Default model for OpenRouter
export const DEFAULT_MODEL = "openai/gpt-oss-20b:free";

// Format dates for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format time for display
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Format datetime for display
export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

// Calculate date ranges
export function getDateRange(period: "today" | "tomorrow" | "week" | "month") {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "tomorrow":
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "week":
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      break;
    case "month":
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 30);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
