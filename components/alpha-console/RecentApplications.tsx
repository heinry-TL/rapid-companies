import Link from 'next/link';
import { getConnection } from '@/lib/mysql';

async function getRecentApplications() {
  try {
    const db = await getConnection();
    const [rows]: any = await db.execute(`
      SELECT
        a.id,
        a.company_proposed_name,
        a.jurisdiction_name,
        CONCAT(a.contact_first_name, ' ', a.contact_last_name) as full_name,
        a.contact_email,
        a.internal_status,
        a.created_at
      FROM applications a
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    return rows || [];
  } catch (error) {
    console.error('Error fetching recent applications:', error);
    return [];
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'on_hold':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function RecentApplications() {
  const applications = await getRecentApplications();

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Applications</h3>
          <Link
            href="/alpha-console/applications"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View all
          </Link>
        </div>

        {applications.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first application.</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {applications.map((application: any) => (
                <li key={application.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {application.company_proposed_name || `Application #${application.id}`}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {application.full_name} • {application.jurisdiction_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          application.internal_status || 'new'
                        )}`}
                      >
                        {application.internal_status || 'new'}
                      </span>
                      {application.payment_status === 'completed' && (
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}