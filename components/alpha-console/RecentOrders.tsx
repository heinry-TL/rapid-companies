import Link from 'next/link';
import { getConnection } from '@/lib/mysql';

interface OrderRow {
  id: number;
  company_proposed_name: string;
  jurisdiction_name: string;
  jurisdiction_price: number;
  jurisdiction_currency: string;
  full_name: string;
  company_name?: string;
  formation_fee?: number;
  created_at: string;
}

async function getRecentOrders() {
  try {
    const db = await getConnection();
    const [rows] = await db.execute(`
      SELECT
        a.id,
        a.company_proposed_name,
        a.jurisdiction_name,
        a.jurisdiction_price,
        a.jurisdiction_currency,
        CONCAT(a.contact_first_name, ' ', a.contact_last_name) as full_name,
        a.created_at
      FROM applications a
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    return (rows as OrderRow[]) || [];
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
}

export default async function RecentOrders() {
  const orders = await getRecentOrders();

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Orders</h3>
          <Link
            href="/alpha-console/orders"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">Orders will appear here once payments are completed.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order: OrderRow) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.company_name || `Order #${order.id}`}
                        </div>
                        <div className="text-sm text-gray-500">{order.jurisdiction_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        £{order.formation_fee?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}