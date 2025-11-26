"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { ErrorDisplay } from "./ErrorDisplay";

// Metric card component for dashboard
function MetricCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${color}`}>{value}</span>
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-4xl ${color} opacity-80`}>{icon}</div>
      </div>
    </div>
  );
}

// Tool call display component
function ToolCallDisplay({ toolCall }: { toolCall: any }) {
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

export default function Chat() {
  const [showDashboard, setShowDashboard] = useState(true);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      onError: (error: Error) => {
        console.error("[Frontend] Chat error:", error);
      },
    });

  // Sample prompts for quick access
  const samplePrompts = [
    { text: "Show me today's classes", icon: "📅" },
    { text: "Find a client by name", icon: "👥" },
    { text: "Who's on the waitlist?", icon: "⏳" },
    { text: "Show me all staff members", icon: "👔" },
    { text: "What are our locations?", icon: "📍" },
    { text: "Show available services", icon: "💼" },
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
                      } as any);
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

            {/* Info Cards */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Available Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Classes"
                  value="📅"
                  icon="📚"
                  color="text-blue-600"
                  subtitle="View schedules & bookings"
                />
                <MetricCard
                  title="Clients"
                  value="👥"
                  icon="📊"
                  color="text-green-600"
                  subtitle="Manage client data"
                />
                <MetricCard
                  title="Staff"
                  value="👔"
                  icon="🗓️"
                  color="text-purple-600"
                  subtitle="Staff schedules & info"
                />
                <MetricCard
                  title="Services"
                  value="💼"
                  icon="📦"
                  color="text-orange-600"
                  subtitle="Packages & offerings"
                />
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
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </div>
                        )}

                        {/* Tool invocations */}
                        {message.toolInvocations?.map((toolCall: any) => (
                          <div key={toolCall.toolCallId} className="my-2">
                            <ToolCallDisplay toolCall={toolCall} />
                          </div>
                        ))}
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
