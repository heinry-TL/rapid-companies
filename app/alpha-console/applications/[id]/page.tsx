"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Director {
    firstName: string;
    lastName: string;
    nationality?: string;
    passportNumber?: string;
    address?: {
        line1: string;
        city: string;
        postcode: string;
    };
}

interface Shareholder {
    firstName: string;
    lastName: string;
    sharePercentage: number;
    nationality?: string;
    passportNumber?: string;
    address?: {
        line1: string;
        city: string;
        postcode: string;
    };
}

interface AdditionalService {
    name: string;
    price: number;
    currency: string;
}

interface Application {
    id: string;
    jurisdiction_id: number;
    jurisdiction_name: string;
    jurisdiction_price: number;
    jurisdiction_currency: string;
    contact_first_name: string;
    contact_last_name: string;
    full_name: string;
    email: string;
    phone: string;
    contact_address_line1: string;
    contact_address_line2?: string;
    contact_city: string;
    contact_county?: string;
    contact_postcode: string;
    contact_country: string;
    company_name: string;
    company_alternative_name?: string;
    company_business_activity: string;
    company_authorized_capital: number;
    company_number_of_shares: number;
    registered_address_line1: string;
    registered_address_line2?: string;
    registered_city: string;
    registered_county?: string;
    registered_postcode: string;
    registered_country: string;
    use_contact_address: boolean;
    company_type: string;
    status: string;
    payment_status: string;
    internal_status: 'new' | 'in_progress' | 'completed' | 'on_hold';
    admin_notes?: string;
    step_completed: number;
    is_complete: boolean;
    directors: Director[];
    shareholders: Shareholder[];
    additional_services: AdditionalService[];
    created_at: string;
    updated_at: string;
    jurisdiction_name_full?: string;
    jurisdiction_description?: string;
}

export default function ApplicationDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<{
        internal_status: string;
        admin_notes: string;
    }>({
        internal_status: '',
        admin_notes: ''
    });

    useEffect(() => {
        if (id) fetchApplication();
        // eslint-disable-next-line
    }, [id]);

    const fetchApplication = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/applications/${id}`);
            if (res.ok) {
                const data = await res.json();
                setApplication(data.application);
                setForm({
                    internal_status: data.application.internal_status || "new",
                    admin_notes: data.application.admin_notes || "",
                });
            } else {
                setError("Failed to fetch application");
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
            const res = await fetch(`/api/admin/applications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const data = await res.json();
                setApplication(data.application);
                // Don't redirect, just show success
                setError("");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update application");
            }
        } catch {
            setError("Network error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!application) return <div className="p-8">Application not found.</div>;

    const getStatusColor = (status: string) => {
        const colors = {
            new: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            on_hold: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <Link
                        href="/alpha-console/applications"
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
                    >
                        ← Back to Applications
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Application Details #{application.id}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Submitted {new Date(application.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.internal_status)}`}
                    >
                        {application.internal_status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Application Progress */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Application Progress</h2>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Steps Completed</span>
                        <span>{application.step_completed}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(application.step_completed / 5) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Started</span>
                        <span>{application.is_complete ? 'Complete' : 'In Progress'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                            <p className="text-gray-900">{application.full_name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="text-gray-900">{application.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Phone</label>
                            <p className="text-gray-900">{application.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Address</label>
                            <p className="text-gray-900">
                                {application.contact_address_line1}
                                {application.contact_address_line2 && <><br />{application.contact_address_line2}</>}
                                <br />
                                {application.contact_city}, {application.contact_county} {application.contact_postcode}
                                <br />
                                {application.contact_country}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Company Information */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Proposed Company Name</label>
                            <p className="text-gray-900">{application.company_name}</p>
                        </div>
                        {application.company_alternative_name && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Alternative Name</label>
                                <p className="text-gray-900">{application.company_alternative_name}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-500">Business Activity</label>
                            <p className="text-gray-900">{application.company_business_activity}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Authorized Capital</label>
                                <p className="text-gray-900">{application.jurisdiction_currency} {application.company_authorized_capital?.toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Number of Shares</label>
                                <p className="text-gray-900">{application.company_number_of_shares?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jurisdiction */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Jurisdiction</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Selected Jurisdiction</label>
                            <p className="text-gray-900">{application.jurisdiction_name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Formation Price</label>
                            <p className="text-gray-900">{application.jurisdiction_currency} {application.jurisdiction_price?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Registered Address */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Registered Address</h2>
                    <div className="space-y-3">
                        {application.use_contact_address ? (
                            <p className="text-gray-900">Same as contact address</p>
                        ) : (
                            <div>
                                <p className="text-gray-900">
                                    {application.registered_address_line1}
                                    {application.registered_address_line2 && <><br />{application.registered_address_line2}</>}
                                    <br />
                                    {application.registered_city}, {application.registered_county} {application.registered_postcode}
                                    <br />
                                    {application.registered_country}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Directors */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Directors</h2>
                {application.directors && application.directors.length > 0 ? (
                    <div className="space-y-4">
                        {application.directors.map((director: Director, index: number) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4">
                                <h3 className="font-medium text-gray-900">{director.firstName} {director.lastName}</h3>
                                <p className="text-sm text-gray-600">Director</p>
                                {director.nationality && <p className="text-sm text-gray-600">Nationality: {director.nationality}</p>}
                                {director.passportNumber && <p className="text-sm text-gray-600">Passport: {director.passportNumber}</p>}
                                {director.address && (
                                    <p className="text-sm text-gray-600">
                                        Address: {director.address.line1}, {director.address.city}, {director.address.postcode}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No directors information provided in this application.</p>
                    </div>
                )}
            </div>

            {/* Shareholders */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shareholders</h2>
                {application.shareholders && application.shareholders.length > 0 ? (
                    <div className="space-y-4">
                        {application.shareholders.map((shareholder: Shareholder, index: number) => (
                            <div key={index} className="border-l-4 border-green-500 pl-4">
                                <h3 className="font-medium text-gray-900">{shareholder.firstName} {shareholder.lastName}</h3>
                                <p className="text-sm text-gray-600">Share Percentage: {shareholder.sharePercentage}%</p>
                                {shareholder.nationality && <p className="text-sm text-gray-600">Nationality: {shareholder.nationality}</p>}
                                {shareholder.passportNumber && <p className="text-sm text-gray-600">Passport: {shareholder.passportNumber}</p>}
                                {shareholder.address && (
                                    <p className="text-sm text-gray-600">
                                        Address: {shareholder.address.line1}, {shareholder.address.city}, {shareholder.address.postcode}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No shareholders information provided in this application.</p>
                    </div>
                )}
            </div>

            {/* Additional Services */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Services</h2>
                {application.additional_services && application.additional_services.length > 0 ? (
                    <div className="space-y-2">
                        {application.additional_services.map((service: AdditionalService, index: number) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                <span className="text-gray-900">{service.name}</span>
                                <span className="text-gray-600">{service.currency} {service.price}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No additional services selected in this application.</p>
                    </div>
                )}
            </div>

            {/* Admin Notes */}
            <form onSubmit={handleSave} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Management</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Internal Status</label>
                        <select
                            name="internal_status"
                            value={form.internal_status || "new"}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                        <textarea
                            name="admin_notes"
                            value={form.admin_notes || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            placeholder="Add internal notes about this application..."
                        />
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <div className="flex justify-end space-x-2">
                        <Link
                            href="/alpha-console/applications"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Back to Applications
                        </Link>
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
