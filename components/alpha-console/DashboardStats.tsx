import { getConnection } from '@/lib/mysql';

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
}

async function getStats() {
  try {
    const db = await getConnection();

    // Get total applications count
    const [applicationsResult]: any = await db.execute(
      'SELECT COUNT(*) as total FROM applications'
    );
    const totalApplications = applicationsResult[0]?.total || 0;

    // Get applications this month
    const [monthlyApplicationsResult]: any = await db.execute(
      'SELECT COUNT(*) as total FROM applications WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())'
    );
    const monthlyApplications = monthlyApplicationsResult[0]?.total || 0;

    // Get order statistics from new orders table (handle case where table doesn't exist)
    let orderStats = { total_orders: 0, paid_orders: 0, total_revenue: 0 };
    let monthlyOrderStats = { total_orders: 0, paid_orders: 0, revenue: 0 };

    try {
      const [orderStatsResult]: any = await db.execute(`
        SELECT
          COUNT(*) as total_orders,
          COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue
        FROM orders
      `);
      orderStats = orderStatsResult[0] || orderStats;

      // Get orders this month
      const [monthlyOrdersResult]: any = await db.execute(`
        SELECT
          COUNT(*) as total_orders,
          COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
        FROM orders
        WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `);
      monthlyOrderStats = monthlyOrdersResult[0] || monthlyOrderStats;
    } catch (ordersTableError) {
      console.log('Orders table not found, using default values. Run the SQL script to create the orders table.');
      // Keep default values
    }

    // Get total jurisdictions
    const [jurisdictionsResult]: any = await db.execute(
      'SELECT COUNT(*) as total FROM jurisdictions'
    );
    const totalJurisdictions = jurisdictionsResult[0]?.total || 0;

    await db.end();

    return {
      totalApplications,
      monthlyApplications,
      totalOrders: orderStats.total_orders,
      paidOrders: orderStats.paid_orders,
      totalRevenue: orderStats.total_revenue,
      monthlyOrders: monthlyOrderStats.total_orders,
      monthlyRevenue: monthlyOrderStats.revenue,
      totalJurisdictions,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalApplications: 0,
      monthlyApplications: 0,
      totalOrders: 0,
      paidOrders: 0,
      totalRevenue: 0,
      monthlyOrders: 0,
      monthlyRevenue: 0,
      totalJurisdictions: 0,
    };
  }
}

export default async function DashboardStats() {
  const stats = await getStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards: StatCard[] = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: `${formatCurrency(stats.monthlyRevenue)} this month`,
      changeType: stats.monthlyRevenue > 0 ? 'increase' : 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      title: 'Paid Orders',
      value: stats.paidOrders,
      change: `${stats.monthlyOrders} this month`,
      changeType: stats.monthlyOrders > 0 ? 'increase' : 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      change: `${stats.monthlyApplications} this month`,
      changeType: stats.monthlyApplications > 0 ? 'increase' : 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Jurisdictions',
      value: stats.totalJurisdictions,
      change: 'Available',
      changeType: 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase'
                          ? 'text-green-600'
                          : stat.changeType === 'decrease'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {stat.changeType === 'increase' && (
                        <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {stat.changeType === 'decrease' && (
                        <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="sr-only">{stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}