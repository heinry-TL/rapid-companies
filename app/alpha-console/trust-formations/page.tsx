'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
  settlor_first_name?: string;
  settlor_last_name?: string;
  trustees?: any;
  beneficiaries?: any;
  price: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_id?: string;
  status: 'pending' | 'awaiting_details' | 'in_review' | 'active' | 'completed' | 'cancelled';
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export default function TrustFormationsPage() {
  const [trusts, setTrusts] = useState<TrustFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const fetchTrusts = React.useCallback(async () => {
    try {
      let url = '/api/admin/trust-formations';
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('payment_status', paymentFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTrusts(data.trusts || []);
      } else {
        setError('Failed to fetch trust formations');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter]);

  useEffect(() => {
    fetchTrusts();
  }, [fetchTrusts]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/trust-formations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await fetchTrusts();
      } else {
        setError('Failed to update trust status');
      }
    } catch {
      setError('Network error');
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

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trust Formation Applications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage trust formation services across all jurisdictions
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-gray-900 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all" className="text-gray-900">All Status</option>
            <option value="pending" className="text-gray-900">Pending</option>
            <option value="awaiting_details" className="text-gray-900">Awaiting Details</option>
            <option value="in_review" className="text-gray-900">In Review</option>
            <option value="active" className="text-gray-900">Active</option>
            <option value="completed" className="text-gray-900">Completed</option>
            <option value="cancelled" className="text-gray-900">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="all" className="text-gray-900">All Payments</option>
            <option value="pending" className="text-gray-900">Pending</option>
            <option value="paid" className="text-gray-900">Paid</option>
            <option value="failed" className="text-gray-900">Failed</option>
            <option value="refunded" className="text-gray-900">Refunded</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Trust Formations Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trust Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jurisdiction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trusts.map((trust) => (
                <tr key={trust.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {trust.contact_first_name} {trust.contact_last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trust.contact_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {trust.trust_name || 'Not provided yet'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {trust.trust_type || 'Type TBD'}
                    </div>
                    {!trust.details_provided_now && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        Details pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {trust.jurisdiction}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(trust.price, trust.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={trust.status}
                      onChange={(e) => updateStatus(trust.id, e.target.value)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(trust.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="awaiting_details">Awaiting Details</option>
                      <option value="in_review">In Review</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(trust.payment_status)}`}
                    >
                      {trust.payment_status.charAt(0).toUpperCase() + trust.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(trust.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/alpha-console/trust-formations/${trust.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    {trust.order_id && (
                      <Link
                        href={`/alpha-console/orders/${trust.order_id}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Order
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {trusts.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No trust formations</h3>
            <p className="mt-1 text-sm text-gray-500">
              No trust formation applications found with the current filters.
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Trusts</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{trusts.length}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Awaiting Details</dt>
          <dd className="mt-1 text-3xl font-semibold text-blue-600">
            {trusts.filter(t => t.status === 'awaiting_details').length}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">In Review</dt>
          <dd className="mt-1 text-3xl font-semibold text-purple-600">
            {trusts.filter(t => t.status === 'in_review').length}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">
            {trusts.filter(t => t.status === 'active').length}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {formatCurrency(
              trusts.filter(t => t.payment_status === 'paid').reduce((sum, t) => sum + t.price, 0),
              'GBP'
            )}
          </dd>
        </div>
      </div>
    </div>
  );
}
