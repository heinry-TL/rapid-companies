"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface MailForwarding {
  id: number;
  entity_type: 'company' | 'individual';
  entity_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  jurisdiction: string;
  forwarding_frequency: 'weekly' | 'biweekly' | 'monthly';
  service_users: string;
  additional_info?: string;
  price: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_id?: string;
  status: 'pending' | 'active' | 'suspended' | 'cancelled' | 'completed';
  admin_notes?: string;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
}

export default function MailForwardingDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [service, setService] = useState<MailForwarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    status: string;
    admin_notes: string;
  }>({
    status: '',
    admin_notes: ''
  });

  useEffect(() => {
    if (id) fetchService();
    // eslint-disable-next-line
  }, [id]);

  const fetchService = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/mail-forwarding/${id}`);
      if (res.ok) {
        const data = await res.json();
        setService(data.mailForwarding);
        setForm({
          status: data.mailForwarding.status || "pending",
          admin_notes: data.mailForwarding.admin_notes || "",
        });
      } else {
        setError("Failed to fetch mail forwarding service");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/mail-forwarding/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setService(data.mailForwarding);
        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update mail forwarding service");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      weekly: 'Weekly',
      biweekly: 'Bi-weekly (Every 2 weeks)',
      monthly: 'Monthly'
    };
    return labels[frequency] || frequency;
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error && !service) return <div className="p-8 text-red-500">{error}</div>;
  if (!service) return <div className="p-8">Mail forwarding service not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/alpha-console/mail-forwarding"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Back to Mail Forwarding
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Mail Forwarding Service #{service.id}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Created {new Date(service.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}
          >
            {service.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entity Information */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Entity Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Entity Type</label>
              <p className="text-gray-900">{service.entity_type === 'company' ? 'Company' : 'Individual'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Entity Name</label>
              <p className="text-gray-900">{service.entity_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Contact Person</label>
              <p className="text-gray-900">{service.contact_person}</p>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{service.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{service.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Forwarding Address</h2>
        <div className="text-gray-900">
          {service.address_line1}
          {service.address_line2 && <><br />{service.address_line2}</>}
          <br />
          {service.city}{service.county && `, ${service.county}`}
          <br />
          {service.postcode}
          <br />
          {service.country}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Details */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Service Details</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Jurisdiction</label>
              <p className="text-gray-900">{service.jurisdiction}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Forwarding Frequency</label>
              <p className="text-gray-900">{getFrequencyLabel(service.forwarding_frequency)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Service Users</label>
              <p className="text-gray-900 whitespace-pre-wrap">{service.service_users}</p>
            </div>
          </div>
        </div>

        {/* Pricing & Payment */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing & Payment</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Price</label>
              <p className="text-gray-900 text-2xl font-semibold">{formatCurrency(service.price, service.currency)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Payment Status</label>
              <p className="text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  service.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                  service.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  service.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {service.payment_status.toUpperCase()}
                </span>
              </p>
            </div>
            {service.order_id && (
              <div>
                <label className="text-sm font-medium text-gray-500">Order ID</label>
                <p className="text-gray-900">
                  <Link
                    href={`/alpha-console/orders/${service.order_id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {service.order_id}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {service.additional_info && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{service.additional_info}</p>
        </div>
      )}

      {/* Admin Management */}
      <form onSubmit={handleSave} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Management</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
            <textarea
              name="admin_notes"
              value={form.admin_notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Add internal notes about this service..."
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end space-x-2">
            <Link
              href="/alpha-console/mail-forwarding"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Back to Mail Forwarding
            </Link>
            {service.order_id && (
              <Link
                href={`/alpha-console/orders/${service.order_id}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                View Order
              </Link>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
