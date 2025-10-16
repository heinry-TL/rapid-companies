"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Jurisdiction {
    id: number;
    name: string;
    country_code: string;
    flag_url: string;
    description: string;
    formation_price: number;
    currency: string;
    vat_applicable?: boolean;
    processing_time: string;
    features: string[];
    status: string;
}

export default function EditJurisdictionPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Partial<Jurisdiction & { features: string }>>({});

    useEffect(() => {
        if (id) fetchJurisdiction();
        // eslint-disable-next-line
    }, [id]);

    const fetchJurisdiction = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/jurisdictions/${id}`);
            if (res.ok) {
                const data = await res.json();
                setJurisdiction(data.jurisdiction);
                setForm({ ...data.jurisdiction, features: (data.jurisdiction.features || []).join(", ") });
            } else {
                setError("Failed to fetch jurisdiction");
            }
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/jurisdictions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    features: form.features ? form.features.split(",").map((f: string) => f.trim()).filter((f: string) => f.length > 0) : [],
                }),
            });
            if (res.ok) {
                router.push("/alpha-console/jurisdictions");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update jurisdiction");
            }
        } catch {
            setError("Network error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!jurisdiction) return <div className="p-8">Jurisdiction not found.</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-sm rounded-lg border border-gray-200 p-8 mt-8">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Edit Jurisdiction</h1>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input name="name" value={form.name || ""} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Country Code</label>
                    <input name="country_code" value={form.country_code || ""} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Flag URL</label>
                    <input name="flag_url" value={form.flag_url || ""} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" value={form.description || ""} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" rows={3} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Formation Price</label>
                    <input name="formation_price" type="number" value={form.formation_price || ""} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <input name="currency" value={form.currency || ""} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">VAT Applicable</label>
                    <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="vat_applicable"
                                value="true"
                                checked={form.vat_applicable === true}
                                onChange={(e) => setForm((prev) => ({ ...prev, vat_applicable: true }))}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">Yes (show +VAT)</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="vat_applicable"
                                value="false"
                                checked={form.vat_applicable === false || form.vat_applicable === undefined}
                                onChange={(e) => setForm((prev) => ({ ...prev, vat_applicable: false }))}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">No</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Processing Time</label>
                    <input name="processing_time" value={form.processing_time || ""} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Features (comma separated)</label>
                    <input name="features" value={form.features || ""} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" value={form.status || "active"} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => router.push("/alpha-console/jurisdictions")} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
