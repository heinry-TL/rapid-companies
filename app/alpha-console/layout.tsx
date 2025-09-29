import { headers } from 'next/headers';
import AdminSidebar from '@/components/alpha-console/AdminSidebar';
import AdminHeader from '@/components/alpha-console/AdminHeader';
import { AdminUser } from '@/lib/admin-auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user info from middleware headers
  const headersList = await headers();
  const userHeader = headersList.get('x-admin-user');
  const user: AdminUser | null = userHeader ? JSON.parse(userHeader) : null;

  // If no user, this should be the login page
  if (!user) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col">
        <AdminHeader user={user} />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}