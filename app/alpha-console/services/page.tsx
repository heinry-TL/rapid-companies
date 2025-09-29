'use client';

import { useEffect, useState } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  currency: string;
  note: string;
  category: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Add state for add/edit form
  const [form, setForm] = useState<any>({
    id: '',
    name: '',
    description: '',
    base_price: '',
    currency: 'GBP',
    note: '',
    category: '',
    active: true,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || data);
      } else {
        setError('Failed to fetch services');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (response.ok) {
        await fetchServices();
      } else {
        setError('Failed to update service status');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      banking: 'bg-green-100 text-green-800',
      nominees: 'bg-blue-100 text-blue-800',
      office: 'bg-purple-100 text-purple-800',
      documentation: 'bg-yellow-100 text-yellow-800',
      consultation: 'bg-orange-100 text-orange-800',
      trust: 'bg-indigo-100 text-indigo-800',
      compliance: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const openAddModal = () => {
    setForm({
      id: '',
      name: '',
      description: '',
      base_price: '',
      currency: 'GBP',
      note: '',
      category: '',
      active: true,
    });
    setFormError('');
    setShowAddModal(true);
    setEditingService(null);
  };

  const openEditModal = (service: Service) => {
    setForm({ ...service });
    setFormError('');
    setEditingService(service);
    setShowAddModal(false);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingService(null);
    setFormError('');
  };

  const handleFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const method = editingService ? 'PATCH' : 'POST';
      const url = editingService ? `/api/admin/services/${editingService.id}` : '/api/admin/services';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          base_price: Number(form.base_price),
        }),
      });
      if (res.ok) {
        closeModal();
        fetchServices();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to save service');
      }
    } catch (e) {
      setFormError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
      } else {
        alert('Failed to delete service');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage additional services, pricing, and availability
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Add Service
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {service.name}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}
                >
                  {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                </span>
              </div>
              <button
                onClick={() => toggleStatus(service.id, service.active)}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${service.active
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                {service.active ? (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Active
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Inactive
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {service.description}
            </p>

            <div className="flex justify-between items-center">
              <div className="text-lg font-bold text-gray-900">
                {service.currency} {service.base_price.toLocaleString()}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(service)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No services</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new service.
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingService) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input name="name" value={form.name} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Price</label>
                <input name="base_price" type="number" value={form.base_price} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select name="currency" value={form.currency} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Note</label>
                <textarea name="note" value={form.note} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows={2} placeholder="Pricing notes or conditions" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" value={form.category} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                  <option value="">Select category</option>
                  <option value="banking">Banking</option>
                  <option value="nominees">Nominees</option>
                  <option value="office">Office</option>
                  <option value="documentation">Documentation</option>
                  <option value="consultation">Consultation</option>
                  <option value="trust">Trust</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                  {saving ? (editingService ? 'Saving...' : 'Adding...') : (editingService ? 'Save Changes' : 'Add Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}