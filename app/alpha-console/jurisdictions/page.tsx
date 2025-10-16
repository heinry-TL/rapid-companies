"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface Jurisdiction {
  id: number;
  name: string;
  country_code: string;
  flag_url: string;
  description: string;
  formation_price: number;
  currency: string;
  processing_time: string;
  features: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export default function JurisdictionsPage() {
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  interface AddFormData {
    name: string;
    country_code: string;
    flag_url: string;
    description: string;
    formation_price: string;
    currency: string;
    vat_applicable: string;
    processing_time: string;
    features: string;
    status: string;
  }

  const [addForm, setAddForm] = useState<AddFormData>({
    name: "",
    country_code: "",
    flag_url: "",
    description: "",
    formation_price: "",
    currency: "",
    vat_applicable: "false",
    processing_time: "",
    features: "",
    status: "active",
  });
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchJurisdictions();
  }, []);

  const fetchJurisdictions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/jurisdictions");
      if (res.ok) {
        const data = await res.json();
        setJurisdictions(data.jurisdictions);
      } else {
        setError("Failed to fetch jurisdictions");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this jurisdiction?")) return;
    try {
      const res = await fetch(`/api/admin/jurisdictions/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        alert("Jurisdiction deleted successfully");
        fetchJurisdictions();
      } else {
        alert(`Failed to delete jurisdiction: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Network error: Could not delete jurisdiction");
    }
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch("/api/admin/jurisdictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          vat_applicable: addForm.vat_applicable === "true",
          features: addForm.features.split(",").map((f: string) => f.trim()).filter((f: string) => f.length > 0),
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({
          name: "",
          country_code: "",
          flag_url: "",
          description: "",
          formation_price: "",
          currency: "",
          vat_applicable: "false",
          processing_time: "",
          features: "",
          status: "active",
        });
        fetchJurisdictions();
      } else {
        const data = await res.json();
        setAddError(data.error || "Failed to add jurisdiction");
      }
    } catch {
      setAddError("Network error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jurisdictions Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage jurisdictions, pricing, and availability
          </p>
        </div>
        <button
          ref={addButtonRef}
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Add Jurisdiction
        </button>
      </div>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 overflow-x-auto">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : jurisdictions.length === 0 ? (
          <div>No jurisdictions found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Flag</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jurisdictions.map((j) => (
                <tr key={j.id}>
                  <td className="px-4 py-2">
                    {j.flag_url ? (
                      <img src={j.flag_url} alt={j.name} className="h-6 w-8 object-cover rounded" />
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900">{j.name}</td>
                  <td className="px-4 py-2 text-gray-900">{j.formation_price}</td>
                  <td className="px-4 py-2 text-gray-900">{j.currency}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${j.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{j.status}</span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <Link href={`/alpha-console/jurisdictions/${j.id}`} className="text-blue-600 hover:underline text-sm">Edit</Link>
                    <button onClick={() => handleDelete(j.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Jurisdiction</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input name="name" value={addForm.name} onChange={handleAddChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country Code</label>
                <input name="country_code" value={addForm.country_code} onChange={handleAddChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Flag URL</label>
                <input name="flag_url" value={addForm.flag_url} onChange={handleAddChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={addForm.description} onChange={handleAddChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" 
                  style={{
                    color: '#111827',
                    WebkitTextFillColor: '#111827',
                  }} 
                  rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900"
                  style={{
                    color: '#111827',
                    WebkitTextFillColor: '#111827',
                  }} 
                  >Formation Price</label>
                <input name="formation_price" type="number" value={addForm.formation_price} onChange={handleAddChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <input name="currency" value={addForm.currency} onChange={handleAddChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VAT Applicable</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="vat_applicable"
                      value="true"
                      checked={addForm.vat_applicable === "true"}
                      onChange={handleAddChange}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes (show +VAT)</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="vat_applicable"
                      value="false"
                      checked={addForm.vat_applicable === "false"}
                      onChange={handleAddChange}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Processing Time</label>
                <input name="processing_time" value={addForm.processing_time} onChange={handleAddChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" 
                  style={{
                    color: '#111827',
                    WebkitTextFillColor: '#111827',
                  }} 
                  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Features (comma separated)</label>
                <input name="features" value={addForm.features} onChange={handleAddChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" value={addForm.status} onChange={handleAddChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {addError && <div className="text-red-500 text-sm">{addError}</div>}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" disabled={adding} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                  {adding ? "Adding..." : "Add Jurisdiction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}