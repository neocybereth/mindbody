export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  tool: string;
  args: Record<string, any>;
  result?: any;
  error?: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory: Message[];
}

export interface ChatResponse {
  message: Message;
  toolCalls?: ToolCall[];
}

export interface MindbodyClass {
  id: string;
  name: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  staff?: {
    name: string;
  };
  maxCapacity?: number;
  totalBooked?: number;
}

export interface MindbodyClient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  membershipStatus?: string;
}

