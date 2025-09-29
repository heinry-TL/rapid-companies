import { Suspense } from 'react';
import DashboardStats from '@/components/alpha-console/DashboardStats';
import RecentApplications from '@/components/alpha-console/RecentApplications';
import RecentOrders from '@/components/alpha-console/RecentOrders';
import QuickActions from '@/components/alpha-console/QuickActions';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to the admin dashboard. Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-32" />}>
        <DashboardStats />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-96" />}>
            <RecentApplications />
          </Suspense>
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Orders */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-64" />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}