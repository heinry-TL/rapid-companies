'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderDetails {
  id: number;
  order_id: string;
  stripe_payment_intent_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  billing_name: string;
  billing_address_line1: string;
  billing_address_line2: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
  total_amount: number;
  currency: string;
  payment_status: string;
  payment_method: string;
  applications_count: number;
  services_count: number;
  order_items: any;
  stripe_metadata: any;
  created_at: string;
  paid_at: string;
  updated_at: string;
  items: Array<{
    id: number;
    item_type: string;
    item_name: string;
    jurisdiction_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    currency: string;
    item_metadata: any;
    created_at: string;
  }>;
  applications: Array<{
    id: number;
    jurisdiction_name: string;
    contact_first_name: string;
    contact_last_name: string;
    contact_email: string;
    billing_name: string;
    company_proposed_name: string;
    payment_status: string;
    internal_status: string;
    created_at: string;
  }>;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    // Clean and validate currency code
    const cleanCurrency = (currency || 'GBP').trim().toUpperCase();

    // Validate currency code (should be 3 letters)
    const validCurrency = /^[A-Z]{3}$/.test(cleanCurrency) ? cleanCurrency : 'GBP';

    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: validCurrency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/alpha-console/orders"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Orders
          </Link>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/alpha-console/orders"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Orders
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || 'Order not found'}</p>
          <button
            onClick={fetchOrderDetails}
            className="mt-2 text-red-800 hover:text-red-600 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/alpha-console/orders"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Orders
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.order_id.split('_')[1]}
            </h1>
            <p className="text-sm text-gray-500">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.payment_status)}`}>
          {order.payment_status}
        </span>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.billing_name || order.customer_name || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.customer_email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.customer_phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.payment_method || 'Card'}</dd>
              </div>
            </dl>
          </div>

          {/* Billing Address */}
          {(order.billing_address_line1 || order.billing_city || order.billing_country) && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h2>
              <address className="not-italic text-sm text-gray-900 space-y-1">
                {order.billing_address_line1 && <div>{order.billing_address_line1}</div>}
                {order.billing_address_line2 && <div>{order.billing_address_line2}</div>}
                {(order.billing_city || order.billing_state || order.billing_postal_code) && (
                  <div>
                    {[order.billing_city, order.billing_state, order.billing_postal_code].filter(Boolean).join(', ')}
                  </div>
                )}
                {order.billing_country && <div>{order.billing_country}</div>}
              </address>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                <>
                  {/* Company Formation Applications */}
                  {order.items.filter(item => item.item_type === 'application').length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Company Formation Applications</h3>
                      {order.items.filter(item => item.item_type === 'application').map((item) => (
                        <div key={item.id} className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{item.item_name}</h4>
                            {item.jurisdiction_name && (
                              <p className="text-sm text-gray-500">{item.jurisdiction_name}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Company Formation</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.total_price, item.currency)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Additional Services */}
                  {order.items.filter(item => item.item_type === 'service').length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Services</h3>
                      {order.items.filter(item => item.item_type === 'service').map((item) => (
                        <div key={item.id} className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{item.item_name}</h4>
                            {item.jurisdiction_name && (
                              <p className="text-sm text-gray-500">{item.jurisdiction_name}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Additional Service</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.total_price, item.currency)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : order.order_items && (
                <>
                  {/* Company Formation Applications */}
                  {Array.isArray(order.order_items.applications) && order.order_items.applications.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Company Formation Applications</h3>
                      {order.order_items.applications.map((app: any, idx: number) => {
                        // Ensure correct price extraction
                        const appAmount = typeof app.total_price === 'number'
                          ? app.total_price
                          : typeof app.price === 'number'
                            ? app.price
                            : 0;
                        return (
                          <div key={app.id || idx} className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">Company Formation</h4>
                              {app.jurisdiction_name && (
                                <p className="text-sm text-gray-500">{app.jurisdiction_name}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">Application ID: {app.id}</p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(
                                  appAmount,
                                  app.currency || order.currency
                                )}
                              </div>
                              <div className="text-xs text-gray-500">Qty: 1</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Additional Services */}
                  {Array.isArray(order.order_items.standalone_services) && order.order_items.standalone_services.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Services</h3>
                      {order.order_items.standalone_services.map((svc: any, idx: number) => {
                        const svcAmount = typeof svc.total_price === 'number'
                          ? svc.total_price
                          : typeof svc.price === 'number'
                            ? svc.price
                            : 0;
                        return (
                          <div key={svc.id || idx} className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{svc.name || svc.id}</h4>
                              <p className="text-xs text-gray-400 mt-1">Additional Service</p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(svcAmount, svc.currency || order.currency)}
                              </div>
                              <div className="text-xs text-gray-500">Qty: 1</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(!order.order_items.applications?.length && !order.order_items.standalone_services?.length) && (
                    <p className="text-sm text-gray-500">No items found</p>
                  )}
                </>
              )}
              {(!order.items?.length && (!order.order_items || (!order.order_items.applications?.length && !order.order_items.standalone_services?.length))) && (
                <p className="text-sm text-gray-500">No items found</p>
              )}
            </div>
          </div>

          {/* Related Applications */}
          {order.applications && order.applications.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Formation Applications</h2>
              <div className="space-y-3">
                {order.applications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/alpha-console/applications/${app.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{app.jurisdiction_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {app.company_proposed_name || `${app.contact_first_name} ${app.contact_last_name}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{app.contact_email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.payment_status)}`}>
                          {app.payment_status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{app.internal_status}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          {/* Payment Details */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.total_amount, order.currency)}
                </dd>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <dt className="text-base font-semibold text-gray-900">Total</dt>
                <dd className="text-base font-semibold text-gray-900">
                  {formatCurrency(order.total_amount, order.currency)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Payment Status */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 mt-1.5 bg-blue-500 rounded-full"></div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">Order Created</p>
                  <p className="text-gray-500 text-xs">{formatDate(order.created_at)}</p>
                </div>
              </div>
              {order.paid_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 mt-1.5 bg-green-500 rounded-full"></div>
                  <div className="ml-3">
                    <p className="text-gray-900 font-medium">Payment Received</p>
                    <p className="text-gray-500 text-xs">{formatDate(order.paid_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stripe Info */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Reference</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500 text-xs">Order ID</dt>
                <dd className="text-gray-900 font-mono text-xs break-all">{order.order_id}</dd>
              </div>
              <div>
                <dt className="text-gray-500 text-xs">Payment Intent</dt>
                <dd className="text-gray-900 font-mono text-xs break-all">{order.stripe_payment_intent_id}</dd>
              </div>
              <div>
                <dt className="text-gray-500 text-xs">Items</dt>
                <dd className="text-gray-900">
                  {order.applications_count} Application{order.applications_count !== 1 ? 's' : ''}, {order.services_count} Service{order.services_count !== 1 ? 's' : ''}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}