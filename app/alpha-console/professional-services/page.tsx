'use client';

import { useEffect, useState } from 'react';

interface ProfessionalService {
  id: string;
  name: string;
  description: string;
  short_description: string;
  features: string[];
  category: string;
  display_order: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export default function ProfessionalServicesPage() {
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<ProfessionalService | null>(null);

  // Add state for add/edit form
  const [form, setForm] = useState<any>({
    id: '',
    name: '',
    description: '',
    short_description: '',
    features: [''],
    category: '',
    display_order: 1,
    active: true,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/professional-services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || data);
      } else {
        setError('Failed to fetch professional services');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/professional-services/${id}`, {
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
      trusts: 'bg-indigo-100 text-indigo-800',
      nominees: 'bg-blue-100 text-blue-800',
      office: 'bg-purple-100 text-purple-800',
      compliance: 'bg-red-100 text-red-800',
      licensing: 'bg-green-100 text-green-800',
      immigration: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const openAddModal = () => {
    setForm({
      id: '',
      name: '',
      description: '',
      short_description: '',
      features: [''],
      category: '',
      display_order: services.length + 1,
      active: true,
    });
    setFormError('');
    setShowAddModal(true);
    setEditingService(null);
  };

  const openEditModal = (service: ProfessionalService) => {
    setForm({
      ...service,
      features: service.features.length > 0 ? service.features : ['']
    });
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

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...form.features];
    newFeatures[index] = value;
    setForm((prev: any) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setForm((prev: any) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    if (form.features.length > 1) {
      const newFeatures = form.features.filter((_: any, i: number) => i !== index);
      setForm((prev: any) => ({ ...prev, features: newFeatures }));
    }
  };

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    // Filter out empty features
    const cleanedFeatures = form.features.filter((f: string) => f.trim() !== '');

    try {
      const method = editingService ? 'PATCH' : 'POST';
      const url = editingService ? `/api/admin/professional-services/${editingService.id}` : '/api/admin/professional-services';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          features: cleanedFeatures,
          display_order: Number(form.display_order),
        }),
      });
      if (res.ok) {
        closeModal();
        fetchServices();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to save professional service');
      }
    } catch (e) {
      setFormError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this professional service?')) return;
    try {
      const res = await fetch(`/api/admin/professional-services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
      } else {
        alert('Failed to delete professional service');
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
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Professional Services Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage professional services displayed on the services page
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Add Professional Service
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    Order: {service.display_order}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}
                  >
                    {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {service.description}
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Features:</p>
                  <ul className="text-xs text-gray-600 grid grid-cols-2 gap-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
          </div>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No professional services</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new professional service.
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingService) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingService ? 'Edit Professional Service' : 'Add New Professional Service'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service ID</label>
                  <input
                    name="id"
                    value={form.id}
                    onChange={handleFormChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                    disabled={!!editingService}
                    placeholder="e.g., trust-formation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    name="display_order"
                    type="number"
                    value={form.display_order}
                    onChange={handleFormChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Service Name</label>
                <input name="name" value={form.name} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <input name="short_description" value={form.short_description} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Brief one-line description" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Full Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows={3} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" value={form.category} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                  <option value="">Select category</option>
                  <option value="trusts">Trusts</option>
                  <option value="nominees">Nominees</option>
                  <option value="office">Office</option>
                  <option value="compliance">Compliance</option>
                  <option value="licensing">Licensing</option>
                  <option value="immigration">Immigration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                {form.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 border-gray-300 rounded-md shadow-sm"
                      placeholder={`Feature ${index + 1}`}
                    />
                    {form.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Feature
                </button>
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

              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                  Cancel
                </button>
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