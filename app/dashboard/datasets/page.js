"use client";
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../../components/AuthProvider';

export default function ManageDatasetsPage() {
  return (
    <ProtectedRoute>
      <ManageDatasetsContent />
    </ProtectedRoute>
  );
}

function ManageDatasetsContent() {
  const [datasets, setDatasets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDataset, setEditingDataset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    size: '',
    categories: '',
    access_type: 'Public'
  });

  // Mock data - in real app this would come from API
  useEffect(() => {
    setTimeout(() => {
      setDatasets([
        {
          id: 1,
          name: "Traditional Batik Patterns",
          description: "Comprehensive collection of traditional Indonesian batik patterns",
          size: "2.5 GB",
          categories: "Traditional, Cultural",
          access_type: "Public",
          created_at: "2024-01-15"
        },
        {
          id: 2,
          name: "Modern Batik Designs", 
          description: "Contemporary batik interpretations and modern artistic expressions",
          size: "1.8 GB",
          categories: "Modern, Artistic",
          access_type: "Registered",
          created_at: "2024-02-10"
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingDataset) {
      // Update existing dataset
      setDatasets(datasets.map(dataset => 
        dataset.id === editingDataset.id 
          ? { ...dataset, ...formData, updated_at: new Date().toISOString().split('T')[0] }
          : dataset
      ));
      setEditingDataset(null);
    } else {
      // Add new dataset
      const newDataset = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString().split('T')[0]
      };
      setDatasets([...datasets, newDataset]);
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      size: '',
      categories: '',
      access_type: 'Public'
    });
    setShowAddForm(false);
  };

  const handleEdit = (dataset) => {
    setEditingDataset(dataset);
    setFormData({
      name: dataset.name,
      description: dataset.description,
      size: dataset.size,
      categories: dataset.categories,
      access_type: dataset.access_type
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this dataset?')) {
      setDatasets(datasets.filter(dataset => dataset.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      size: '',
      categories: '',
      access_type: 'Public'
    });
    setEditingDataset(null);
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-amber-700 font-semibold">Loading datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-amber-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="text-amber-600 hover:text-amber-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Datasets</h1>
                <p className="text-gray-600">Add, edit, and manage research datasets</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Dataset
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingDataset ? 'Edit Dataset' : 'Add New Dataset'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dataset Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none"
                      placeholder="Enter dataset name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none h-24 resize-none"
                      placeholder="Enter dataset description"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
                      <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => setFormData({...formData, size: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none"
                        placeholder="e.g., 2.5 GB"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Access Type</label>
                      <select
                        value={formData.access_type}
                        onChange={(e) => setFormData({...formData, access_type: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none"
                        required
                      >
                        <option value="Public">Public</option>
                        <option value="Registered">Registered</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categories</label>
                    <input
                      type="text"
                      value={formData.categories}
                      onChange={(e) => setFormData({...formData, categories: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none"
                      placeholder="e.g., Traditional, Cultural"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      {editingDataset ? 'Update Dataset' : 'Add Dataset'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Datasets Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-amber-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Dataset Collection</h3>
            <p className="text-gray-600 mt-1">Manage your research datasets</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Access</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categories</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {datasets.map((dataset) => (
                  <tr key={dataset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{dataset.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 text-sm max-w-xs truncate">{dataset.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {dataset.size}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        dataset.access_type === 'Public' ? 'bg-green-100 text-green-800' :
                        dataset.access_type === 'Registered' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {dataset.access_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 text-sm">{dataset.categories}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 text-sm">{dataset.created_at}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(dataset)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit dataset"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(dataset.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete dataset"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {datasets.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No datasets found</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first dataset</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Add Your First Dataset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}