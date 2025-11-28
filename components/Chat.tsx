"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { ErrorDisplay } from "./ErrorDisplay";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";

// Tool call display component
function ToolCallDisplay({
  toolCall,
}: {
  toolCall: { toolName: string; toolCallId: string };
}) {
  const getToolInfo = (toolName: string) => {
    const toolInfo: Record<
      string,
      { icon: string; color: string; label: string }
    > = {
      getClasses: {
        icon: "📅",
        color: "bg-blue-50 text-blue-700",
        label: "Classes",
      },
      getClassDescriptions: {
        icon: "📚",
        color: "bg-purple-50 text-purple-700",
        label: "Class Types",
      },
      getClients: {
        icon: "👥",
        color: "bg-green-50 text-green-700",
        label: "Clients",
      },
      addClient: {
        icon: "➕",
        color: "bg-teal-50 text-teal-700",
        label: "Add Client",
      },
      updateClient: {
        icon: "✏️",
        color: "bg-yellow-50 text-yellow-700",
        label: "Update Client",
      },
      getClientVisits: {
        icon: "📊",
        color: "bg-indigo-50 text-indigo-700",
        label: "Visit History",
      },
      addClientToClass: {
        icon: "🎫",
        color: "bg-pink-50 text-pink-700",
        label: "Book Class",
      },
      removeClientFromClass: {
        icon: "❌",
        color: "bg-red-50 text-red-700",
        label: "Cancel Booking",
      },
      getWaitlistEntries: {
        icon: "⏳",
        color: "bg-orange-50 text-orange-700",
        label: "Waitlist",
      },
      getStaff: {
        icon: "👔",
        color: "bg-cyan-50 text-cyan-700",
        label: "Staff",
      },
      getLocations: {
        icon: "📍",
        color: "bg-emerald-50 text-emerald-700",
        label: "Locations",
      },
      getServices: {
        icon: "💼",
        color: "bg-violet-50 text-violet-700",
        label: "Services",
      },
      getPackages: {
        icon: "📦",
        color: "bg-fuchsia-50 text-fuchsia-700",
        label: "Packages",
      },
      getStaffAppointments: {
        icon: "🗓️",
        color: "bg-rose-50 text-rose-700",
        label: "Appointments",
      },
      getSites: {
        icon: "🏢",
        color: "bg-amber-50 text-amber-700",
        label: "Site Info",
      },
      addClientArrival: {
        icon: "✅",
        color: "bg-lime-50 text-lime-700",
        label: "Check-in",
      },
    };

    return (
      toolInfo[toolName] || {
        icon: "🔧",
        color: "bg-gray-50 text-gray-700",
        label: toolName,
      }
    );
  };

  const info = getToolInfo(toolCall.toolName);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${info.color} font-medium`}
    >
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </div>
  );
}

// Client search result type
type ClientSearchResult = {
  idx: number;
  mindbody_client_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile_phone: string | null;
  status: string;
};

export default function Chat() {
  const router = useRouter();
  const [showDashboard, setShowDashboard] = useState(true);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientSearchResults, setClientSearchResults] = useState<
    ClientSearchResult[]
  >([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      onError: (error: Error) => {
        console.error("[Frontend] Chat error:", error);
      },
    });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for clients
  useEffect(() => {
    const searchClients = async () => {
      if (clientSearchQuery.trim().length < 2) {
        setClientSearchResults([]);
        setShowClientDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/search-clients?q=${encodeURIComponent(clientSearchQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setClientSearchResults(data.clients || []);
          setShowClientDropdown(true);
        }
      } catch (error) {
        console.error("Client search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchClients, 300);
    return () => clearTimeout(debounce);
  }, [clientSearchQuery]);

  const handleClientSelect = (client: ClientSearchResult) => {
    setClientSearchQuery("");
    setShowClientDropdown(false);
    router.push(`/client/${client.idx}`);
  };

  // Sample prompts for quick access - focused on data insights
  const samplePrompts = [
    { text: "Show me our executive summary", icon: "📋" },
    { text: "Find clients at risk of churning", icon: "⚠️" },
    { text: "Who are our high-value non-members?", icon: "💎" },
    { text: "Show clients with expiring class cards", icon: "⏰" },
    { text: "Compare members vs non-members", icon: "⚖️" },
    { text: "Analyze our signup trends", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Mindbody Assistant
                </h1>
                <p className="text-xs text-gray-500">Powered by AI & MCP</p>
              </div>
            </div>
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              {showDashboard ? "Hide" : "Show"} Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Section */}
        {showDashboard && messages.length === 0 && (
          <div className="mb-8 space-y-6">
            {/* Welcome Card */}
            <div className="bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
              <h2 className="text-3xl font-bold mb-2">
                Welcome to Your Studio Dashboard
              </h2>
              <p className="text-blue-100">
                Ask me anything about your Mindbody data, or use the quick
                prompts below to get started.
              </p>
            </div>

            {/* Client Search */}
            <div className="mb-6" ref={searchRef}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔍 Search Clients
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-base bg-white shadow-sm"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {showClientDropdown && clientSearchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto">
                    {clientSearchResults.map((client) => (
                      <button
                        key={client.idx}
                        onClick={() => handleClientSelect(client)}
                        className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {client.first_name} {client.last_name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {client.email && (
                                <div className="flex items-center gap-1">
                                  <span>📧</span>
                                  <span>{client.email}</span>
                                </div>
                              )}
                              {client.mobile_phone && (
                                <div className="flex items-center gap-1">
                                  <span>📱</span>
                                  <span>{client.mobile_phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {client.status}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showClientDropdown && clientSearchResults.length === 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-6 text-center text-gray-500">
                    No clients found matching &ldquo;{clientSearchQuery}&rdquo;
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleInputChange({
                        target: { value: prompt.text },
                      } as React.ChangeEvent<HTMLInputElement>);
                      setShowDashboard(false);
                    }}
                    className="bg-white rounded-xl p-4 hover:shadow-lg transition-all text-left group border border-gray-100"
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {prompt.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {prompt.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Messages Container */}
          <div className="h-[500px] overflow-y-auto p-6 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Start a Conversation
                  </h3>
                  <p className="text-gray-600">
                    Ask me anything about your Mindbody data!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-3xl rounded-2xl px-6 py-4 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "bg-white shadow-md text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold">
                          {message.role === "user" ? "You" : "Assistant"}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {/* Text content */}
                        {message.content && (
                          <div
                            className={`prose prose-sm max-w-none ${
                              message.role === "user"
                                ? "prose-invert text-white! *:text-white!"
                                : "prose-slate"
                            }`}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                table: ({ children }) => (
                                  <div className="my-4 overflow-x-auto rounded-lg shadow-lg border border-gray-200 max-w-full">
                                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    {children}
                                  </thead>
                                ),
                                th: ({ children }) => (
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    {children}
                                  </th>
                                ),
                                tbody: ({ children }) => (
                                  <tbody className="divide-y divide-gray-200">
                                    {children}
                                  </tbody>
                                ),
                                tr: ({ children }) => (
                                  <tr className="hover:bg-blue-50 transition-colors">
                                    {children}
                                  </tr>
                                ),
                                td: ({ children }) => (
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {children}
                                  </td>
                                ),
                                h1: ({ children }) => (
                                  <h1
                                    className={`text-2xl font-bold mb-3 mt-6 ${
                                      message.role === "user"
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2
                                    className={`text-xl font-bold mb-2 mt-5 ${
                                      message.role === "user"
                                        ? "text-white"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3
                                    className={`text-lg font-semibold mb-2 mt-4 ${
                                      message.role === "user"
                                        ? "text-white"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p
                                    className={`mb-3 leading-relaxed ${
                                      message.role === "user"
                                        ? "text-white"
                                        : ""
                                    }`}
                                  >
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul
                                    className={`list-disc list-inside space-y-1 mb-3 ${
                                      message.role === "user"
                                        ? "text-white"
                                        : ""
                                    }`}
                                  >
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol
                                    className={`list-decimal list-inside space-y-1 mb-3 ${
                                      message.role === "user"
                                        ? "text-white"
                                        : ""
                                    }`}
                                  >
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li
                                    className={
                                      message.role === "user"
                                        ? "text-white"
                                        : "text-gray-700"
                                    }
                                  >
                                    {children}
                                  </li>
                                ),
                                strong: ({ children }) => (
                                  <strong
                                    className={`font-bold ${
                                      message.role === "user"
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em
                                    className={`italic ${
                                      message.role === "user"
                                        ? "text-white"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {children}
                                  </em>
                                ),
                                code: ({ children, className }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code
                                      className={
                                        message.role === "user"
                                          ? "px-1.5 py-0.5 bg-white/20 text-white rounded text-xs font-mono"
                                          : "px-1.5 py-0.5 bg-gray-100 text-pink-600 rounded text-xs font-mono"
                                      }
                                    >
                                      {children}
                                    </code>
                                  ) : (
                                    <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-3">
                                      {children}
                                    </code>
                                  );
                                },
                                blockquote: ({ children }) => (
                                  <blockquote
                                    className={
                                      message.role === "user"
                                        ? "border-l-4 border-white/50 bg-white/10 pl-4 py-2 italic text-white my-3 rounded-r-lg"
                                        : "border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 italic text-gray-700 my-3 rounded-r-lg"
                                    }
                                  >
                                    {children}
                                  </blockquote>
                                ),
                                hr: () => (
                                  <hr
                                    className={
                                      message.role === "user"
                                        ? "my-6 border-white/30"
                                        : "my-6 border-gray-300"
                                    }
                                  />
                                ),
                                a: ({ children, href }) => (
                                  <a
                                    href={href}
                                    className={
                                      message.role === "user"
                                        ? "text-white underline font-medium hover:text-white/80"
                                        : "text-blue-600 hover:text-blue-800 underline font-medium"
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}

                        {/* Tool invocations */}
                        {message.toolInvocations?.map(
                          (toolCall: {
                            toolName: string;
                            toolCallId: string;
                          }) => (
                            <div key={toolCall.toolCallId} className="my-2">
                              <ToolCallDisplay toolCall={toolCall} />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-md rounded-2xl px-6 py-4 max-w-3xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-800">
                          Assistant
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-pink-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm">
                          Analyzing your Mindbody data...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <ErrorDisplay error={error} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about classes, clients, staff, or anything..."
                className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-base"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
