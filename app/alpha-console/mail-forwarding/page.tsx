'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
  created_at: Date;
  updated_at: Date;
}

export default function MailForwardingPage() {
  const [mailForwarding, setMailForwarding] = useState<MailForwarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const fetchMailForwarding = React.useCallback(async () => {
    try {
      let url = '/api/admin/mail-forwarding';
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('payment_status', paymentFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMailForwarding(data.mailForwarding || []);
      } else {
        setError('Failed to fetch mail forwarding services');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter]);

  useEffect(() => {
    fetchMailForwarding();
  }, [fetchMailForwarding]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/mail-forwarding/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await fetchMailForwarding();
      } else {
        setError('Failed to update mail forwarding status');
      }
    } catch {
      setError('Network error');
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

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      weekly: 'bg-blue-100 text-blue-800',
      biweekly: 'bg-purple-100 text-purple-800',
      monthly: 'bg-green-100 text-green-800',
    };
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Mail Forwarding Services</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage mail forwarding services across all jurisdictions
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="all" className="text-gray-900">All Status</option>
            <option value="pending" className="text-gray-900">Pending</option>
            <option value="active" className="text-gray-900">Active</option>
            <option value="suspended" className="text-gray-900">Suspended</option>
            <option value="cancelled" className="text-gray-900">Cancelled</option>
            <option value="completed" className="text-gray-900">Completed</option>
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

      {/* Mail Forwarding Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jurisdiction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
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
              {mailForwarding.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {service.entity_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {service.entity_type === 'company' ? 'Company' : 'Individual'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {service.contact_person}
                      </div>
                      <div className="text-sm text-gray-500">
                        {service.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {service.jurisdiction}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFrequencyBadge(service.forwarding_frequency)}`}>
                      {service.forwarding_frequency.charAt(0).toUpperCase() + service.forwarding_frequency.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(service.price, service.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={service.status}
                      onChange={(e) => updateStatus(service.id, e.target.value)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(service.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(service.payment_status)}`}
                    >
                      {service.payment_status.charAt(0).toUpperCase() + service.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(service.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/alpha-console/mail-forwarding/${service.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    {service.order_id && (
                      <Link
                        href={`/alpha-console/orders/${service.order_id}`}
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

        {mailForwarding.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No mail forwarding services</h3>
            <p className="mt-1 text-sm text-gray-500">
              No mail forwarding services found with the current filters.
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Services</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{mailForwarding.length}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
          <dd className="mt-1 text-3xl font-semibold text-yellow-600">
            {mailForwarding.filter(s => s.status === 'pending').length}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">
            {mailForwarding.filter(s => s.status === 'active').length}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Suspended</dt>
          <dd className="mt-1 text-3xl font-semibold text-orange-600">
            {mailForwarding.filter(s => s.status === 'suspended').length}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {formatCurrency(
              mailForwarding.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.price, 0),
              'GBP'
            )}
          </dd>
        </div>
      </div>
    </div>
  );
}
