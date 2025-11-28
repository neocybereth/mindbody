"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ClientDetail = {
  idx: number;
  mindbody_client_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile_phone: string | null;
  home_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  status: string;
  has_active_membership: boolean;
  is_active: boolean;
  is_prospect: boolean;
  creation_date: string;
  birth_date: string | null;
  gender: string | null;
  referred_by: string | null;
  total_visits: number;
  visits_last_30_days: number;
  visits_last_90_days: number;
  visits_last_365_days: number;
  days_since_last_visit: number | null;
  lifetime_value: string;
  total_purchases: number;
  days_as_client: number;
  visit_frequency: string | null;
  visits?: Array<{
    ClassId?: number;
    ClassName?: string;
    StartDateTime?: string;
    StaffName?: string;
    LocationName?: string;
  }>;
  purchases?: Array<{
    SaleDateTime?: string;
    PurchasedItems?: Array<{
      Name?: string;
      Quantity?: number;
      AmountPaid?: number;
    }>;
  }>;
  services?: Array<{
    Name?: string;
    Count?: number;
    Remaining?: number;
    ActiveDate?: string;
    ExpirationDate?: string;
    PaymentDate?: string;
  }>;
  memberships?: Array<{
    Name?: string;
    ActiveDate?: string;
    ExpirationDate?: string;
    PaymentDate?: string;
  }>;
};

export default function ClientPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientDetail() {
      try {
        const response = await fetch(`/api/client/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch client details");
        }
        const data = await response.json();
        if (data.found) {
          setClient(data.client);
        } else {
          setError("Client not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchClientDetail();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || "Client not found"}
          </h2>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover:shadow-lg transition-all"
              >
                <span className="text-white text-xl">←</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {client.first_name} {client.last_name}
                </h1>
                <p className="text-xs text-gray-500">
                  Client ID: {client.mindbody_client_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {client.has_active_membership ? (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                  ✓ Active Member
                </span>
              ) : (
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm">
                  Non-Member
                </span>
              )}
              <span
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  client.is_active
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {client.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm text-gray-600 mb-1">Lifetime Value</div>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(client.lifetime_value)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm text-gray-600 mb-1">Total Visits</div>
            <div className="text-3xl font-bold text-purple-600">
              {client.total_visits}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {client.visits_last_30_days} in last 30 days
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm text-gray-600 mb-1">Client Since</div>
            <div className="text-xl font-bold text-indigo-600">
              {client.days_as_client} days
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(client.creation_date)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm text-gray-600 mb-1">Last Visit</div>
            <div className="text-xl font-bold text-pink-600">
              {client.days_since_last_visit !== null
                ? `${client.days_since_last_visit} days ago`
                : "Never"}
            </div>
          </div>
        </div>

        {/* Contact & Personal Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📞</span>
              Contact Information
            </h2>
            <div className="space-y-3">
              {client.email && (
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
              )}
              {client.mobile_phone && (
                <div>
                  <div className="text-sm text-gray-600">Mobile Phone</div>
                  <a
                    href={`tel:${client.mobile_phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {client.mobile_phone}
                  </a>
                </div>
              )}
              {client.home_phone && (
                <div>
                  <div className="text-sm text-gray-600">Home Phone</div>
                  <a
                    href={`tel:${client.home_phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {client.home_phone}
                  </a>
                </div>
              )}
              {(client.address_line1 || client.city) && (
                <div>
                  <div className="text-sm text-gray-600">Address</div>
                  <div className="text-gray-800">
                    {client.address_line1}
                    {client.address_line2 && <div>{client.address_line2}</div>}
                    {client.city && (
                      <div>
                        {client.city}
                        {client.state && `, ${client.state}`}{" "}
                        {client.postal_code}
                      </div>
                    )}
                    {client.country && <div>{client.country}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>👤</span>
              Personal Information
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="text-gray-800">{client.status}</div>
              </div>
              {client.birth_date && (
                <div>
                  <div className="text-sm text-gray-600">Date of Birth</div>
                  <div className="text-gray-800">
                    {formatDate(client.birth_date)}
                  </div>
                </div>
              )}
              {client.gender && (
                <div>
                  <div className="text-sm text-gray-600">Gender</div>
                  <div className="text-gray-800">{client.gender}</div>
                </div>
              )}
              {client.referred_by && (
                <div>
                  <div className="text-sm text-gray-600">Referred By</div>
                  <div className="text-gray-800">{client.referred_by}</div>
                </div>
              )}
              {client.visit_frequency && (
                <div>
                  <div className="text-sm text-gray-600">Visit Frequency</div>
                  <div className="text-gray-800 capitalize">
                    {client.visit_frequency}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visit Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span>
            Visit Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {client.visits_last_30_days}
              </div>
              <div className="text-sm text-gray-600">Last 30 Days</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {client.visits_last_90_days}
              </div>
              <div className="text-sm text-gray-600">Last 90 Days</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {client.visits_last_365_days}
              </div>
              <div className="text-sm text-gray-600">Last 365 Days</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">
                {client.total_visits}
              </div>
              <div className="text-sm text-gray-600">All Time</div>
            </div>
          </div>
        </div>

        {/* Active Services / Class Cards */}
        {client.services && client.services.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📦</span>
              Active Services & Class Cards
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Remaining
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Active Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Expiration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {client.services.map((service, idx) => {
                    const remaining = service.Remaining || 0;
                    const total = service.Count || 0;
                    const usagePercent =
                      total > 0 ? ((total - remaining) / total) * 100 : 0;
                    const expirationDate = service.ExpirationDate
                      ? new Date(service.ExpirationDate)
                      : null;
                    const daysUntilExpiration = expirationDate
                      ? Math.ceil(
                          (expirationDate.getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null;

                    return (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">
                            {service.Name || "Unknown"}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${usagePercent}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 text-gray-700">
                          {total}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`font-semibold ${
                              remaining === 0
                                ? "text-red-600"
                                : remaining <= 2
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {remaining}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm">
                          {formatDate(service.ActiveDate || null)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>{formatDate(service.ExpirationDate || null)}</div>
                          {daysUntilExpiration !== null && (
                            <div
                              className={`text-xs ${
                                daysUntilExpiration < 0
                                  ? "text-red-600"
                                  : daysUntilExpiration <= 30
                                  ? "text-orange-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {daysUntilExpiration < 0
                                ? "Expired"
                                : `${daysUntilExpiration} days left`}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Memberships */}
        {client.memberships && client.memberships.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💳</span>
              Memberships
            </h2>
            <div className="space-y-3">
              {client.memberships.map((membership, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="font-semibold text-gray-800">
                    {membership.Name || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 grid grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">Active:</span>{" "}
                      {formatDate(membership.ActiveDate || null)}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span>{" "}
                      {formatDate(membership.ExpirationDate || null)}
                    </div>
                    <div>
                      <span className="font-medium">Payment:</span>{" "}
                      {formatDate(membership.PaymentDate || null)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Visits */}
        {client.visits && client.visits.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🏃</span>
              Recent Visits
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Class
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Instructor
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {client.visits.slice(0, 10).map((visit, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-800">
                        {visit.ClassName || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm">
                        {visit.StartDateTime
                          ? new Date(visit.StartDateTime).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {visit.StaffName || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {visit.LocationName || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {client.visits.length > 10 && (
                <div className="text-center text-gray-500 text-sm mt-4">
                  Showing 10 of {client.visits.length} visits
                </div>
              )}
            </div>
          </div>
        )}

        {/* Purchase History */}
        {client.purchases && client.purchases.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💰</span>
              Purchase History ({client.total_purchases} total)
            </h2>
            <div className="space-y-3">
              {client.purchases.slice(0, 10).map((purchase, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-600">
                      {purchase.SaleDateTime
                        ? new Date(purchase.SaleDateTime).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )
                        : "Unknown date"}
                    </div>
                  </div>
                  {purchase.PurchasedItems && (
                    <div className="space-y-1">
                      {purchase.PurchasedItems.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-800">
                            {item.Name} × {item.Quantity || 1}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(item.AmountPaid || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {client.purchases.length > 10 && (
                <div className="text-center text-gray-500 text-sm">
                  Showing 10 of {client.purchases.length} purchases
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

