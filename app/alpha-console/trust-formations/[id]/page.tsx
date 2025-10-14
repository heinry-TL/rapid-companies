"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Trustee {
  title?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: any;
  idType?: string;
  idNumber?: string;
}

interface Beneficiary {
  title?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  relationship?: string;
  benefitType?: string;
  percentage?: number;
}

interface TrustFormation {
  id: number;
  details_provided_now: boolean;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
  trust_name?: string;
  trust_type?: string;
  jurisdiction: string;
  trust_purpose?: string;
  settlor_title?: string;
  settlor_first_name?: string;
  settlor_last_name?: string;
  settlor_email?: string;
  settlor_phone?: string;
  settlor_date_of_birth?: string;
  settlor_nationality?: string;
  settlor_address_line1?: string;
  settlor_address_line2?: string;
  settlor_city?: string;
  settlor_state?: string;
  settlor_postal_code?: string;
  settlor_country?: string;
  settlor_id_type?: string;
  settlor_id_number?: string;
  trustees?: Trustee[];
  beneficiaries?: Beneficiary[];
  additional_notes?: string;
  special_instructions?: string;
  price: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_id?: string;
  status: 'pending' | 'awaiting_details' | 'in_review' | 'active' | 'completed' | 'cancelled';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export default function TrustFormationDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [trust, setTrust] = useState<TrustFormation | null>(null);
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
    if (id) fetchTrust();
    // eslint-disable-next-line
  }, [id]);

  const fetchTrust = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trust-formations/${id}`);
      if (res.ok) {
        const data = await res.json();

        // Parse JSONB fields if they are strings
        const trustData = {
          ...data.trust,
          trustees: typeof data.trust.trustees === 'string'
            ? JSON.parse(data.trust.trustees)
            : (data.trust.trustees || []),
          beneficiaries: typeof data.trust.beneficiaries === 'string'
            ? JSON.parse(data.trust.beneficiaries)
            : (data.trust.beneficiaries || [])
        };

        setTrust(trustData);
        setForm({
          status: trustData.status || "pending",
          admin_notes: trustData.admin_notes || "",
        });
      } else {
        setError("Failed to fetch trust formation");
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
      const res = await fetch(`/api/admin/trust-formations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setTrust(data.trust);
        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update trust formation");
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
      awaiting_details: 'bg-blue-100 text-blue-800',
      in_review: 'bg-purple-100 text-purple-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error && !trust) return <div className="p-8 text-red-500">{error}</div>;
  if (!trust) return <div className="p-8">Trust formation not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/alpha-console/trust-formations"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Back to Trust Formations
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Trust Formation #{trust.id}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Submitted {new Date(trust.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trust.status)}`}
          >
            {trust.status.replace('_', ' ').toUpperCase()}
          </span>
          {!trust.details_provided_now && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Details Pending
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900">{trust.contact_first_name} {trust.contact_last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{trust.contact_email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{trust.contact_phone}</p>
            </div>
          </div>
        </div>

        {/* Trust Information */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Trust Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Trust Name</label>
              <p className="text-gray-900">{trust.trust_name || 'Not provided yet'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Trust Type</label>
              <p className="text-gray-900">{trust.trust_type || 'Not provided yet'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Jurisdiction</label>
              <p className="text-gray-900">{trust.jurisdiction}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Price</label>
              <p className="text-gray-900">{formatCurrency(trust.price, trust.currency)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Payment Status</label>
              <p className="text-gray-900">{trust.payment_status.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Purpose */}
      {trust.trust_purpose && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Trust Purpose</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{trust.trust_purpose}</p>
        </div>
      )}

      {/* Settlor Information */}
      {trust.settlor_first_name && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Settlor Information</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{trust.settlor_title} {trust.settlor_first_name} {trust.settlor_last_name}</p>
              </div>
              {trust.settlor_email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{trust.settlor_email}</p>
                </div>
              )}
              {trust.settlor_phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{trust.settlor_phone}</p>
                </div>
              )}
              {trust.settlor_date_of_birth && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900">{new Date(trust.settlor_date_of_birth).toLocaleDateString()}</p>
                </div>
              )}
              {trust.settlor_nationality && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Nationality</label>
                  <p className="text-gray-900">{trust.settlor_nationality}</p>
                </div>
              )}
            </div>
            {trust.settlor_address_line1 && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">
                    {trust.settlor_address_line1}
                    {trust.settlor_address_line2 && <><br />{trust.settlor_address_line2}</>}
                    <br />
                    {trust.settlor_city}, {trust.settlor_state} {trust.settlor_postal_code}
                    <br />
                    {trust.settlor_country}
                  </p>
                </div>
                {trust.settlor_id_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID Type</label>
                    <p className="text-gray-900">{trust.settlor_id_type}: {trust.settlor_id_number}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trustees */}
      {trust.trustees && Array.isArray(trust.trustees) && trust.trustees.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Trustees ({trust.trustees.length})</h2>
          <div className="space-y-4">
            {trust.trustees.map((trustee: Trustee, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900">{trustee.title} {trustee.firstName} {trustee.lastName}</h3>
                {trustee.email && <p className="text-sm text-gray-600">Email: {trustee.email}</p>}
                {trustee.phone && <p className="text-sm text-gray-600">Phone: {trustee.phone}</p>}
                {trustee.nationality && <p className="text-sm text-gray-600">Nationality: {trustee.nationality}</p>}
                {trustee.idType && <p className="text-sm text-gray-600">{trustee.idType}: {trustee.idNumber}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beneficiaries */}
      {trust.beneficiaries && Array.isArray(trust.beneficiaries) && trust.beneficiaries.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Beneficiaries ({trust.beneficiaries.length})</h2>
          <div className="space-y-4">
            {trust.beneficiaries.map((beneficiary: Beneficiary, index: number) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-gray-900">{beneficiary.title} {beneficiary.firstName} {beneficiary.lastName}</h3>
                {beneficiary.relationship && <p className="text-sm text-gray-600">Relationship: {beneficiary.relationship}</p>}
                {beneficiary.benefitType && <p className="text-sm text-gray-600">Benefit Type: {beneficiary.benefitType}</p>}
                {beneficiary.percentage && <p className="text-sm text-gray-600">Percentage: {beneficiary.percentage}%</p>}
                {beneficiary.nationality && <p className="text-sm text-gray-600">Nationality: {beneficiary.nationality}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Notes */}
      {(trust.additional_notes || trust.special_instructions) && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
          {trust.additional_notes && (
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-500">Additional Notes</label>
              <p className="text-gray-900 whitespace-pre-wrap mt-1">{trust.additional_notes}</p>
            </div>
          )}
          {trust.special_instructions && (
            <div>
              <label className="text-sm font-medium text-gray-500">Special Instructions</label>
              <p className="text-gray-900 whitespace-pre-wrap mt-1">{trust.special_instructions}</p>
            </div>
          )}
        </div>
      )}

      {/* Admin Management */}
      <form onSubmit={handleSave} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Management</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="awaiting_details">Awaiting Details</option>
              <option value="in_review">In Review</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
              placeholder="Add internal notes about this trust formation..."
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end space-x-2">
            <Link
              href="/alpha-console/trust-formations"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Back to Trust Formations
            </Link>
            {trust.order_id && (
              <Link
                href={`/alpha-console/orders/${trust.order_id}`}
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
