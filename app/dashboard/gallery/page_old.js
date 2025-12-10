'use client';

import { useState, useEffect } from 'react';

export default function GalleryManagement() {
  const [galleries, setGalleries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentGallery, setCurrentGallery] = useState(null);
  const [viewGallery, setViewGallery] = useState(null);
  const [galleryToDelete, setGalleryToDelete] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  
  const [formData, setFormData] = useState({
    prompt: '',
    image_url: '',
    extra_metadata: '',
    model_id: ''
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryGalleryId, setCategoryGalleryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchGalleries();
    fetchCategories();
    fetchModels();
  }, [offset]);

  const fetchGalleries = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      console.log('Fetching galleries with offset:', offset, 'limit:', limit);
      
      const response = await fetch(`/api/gallery?offset=${offset}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Gallery response status:', response.status);
      
      const data = await response.json();
      console.log('Gallery response data:', data);
      
      if (response.ok) {
        // Extract gallery data from nested structure
        let galleryData = [];
        
        // Response structure: {data: {data: [...], total_count: N}, offset, limit}
        if (data.data && data.data.data) {
          galleryData = data.data.data;
        } else if (data.data && Array.isArray(data.data)) {
          galleryData = data.data;
        } else if (data.results) {
          galleryData = data.results;
        } else if (Array.isArray(data)) {
          galleryData = data;
        }
        
        console.log('Gallery data extracted:', galleryData);
        setGalleries(Array.isArray(galleryData) ? galleryData : []);
        setTotalCount(data.total_count || 0);
        setHasMore(galleryData.length === limit);
      } else {
        console.error('Failed to fetch galleries:', data);
        alert('Failed to fetch galleries');
        setGalleries([]);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
      alert('Error fetching galleries');
      setGalleries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/categories?type=gallery', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const categoryData = Array.isArray(data) ? data : (data.data || []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/ai-models?offset=0&limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const modelData = Array.isArray(data) ? data : (data.data || []);
        setModels(Array.isArray(modelData) ? modelData : []);
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  };

  const fetchGalleryDetail = async (id) => {
    setIsLoadingDetail(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/gallery/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('Gallery detail response:', data);
      
      if (response.ok) {
        // Handle nested data structure
        const detailData = data.data?.data || data.data || data;
        console.log('Gallery detail extracted:', detailData);
        setViewGallery(detailData);
        setShowViewModal(true);
      } else {
        alert('Failed to fetch gallery details: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching gallery details:', error);
      alert('Error fetching gallery details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleOpenModal = (gallery = null) => {
    if (gallery) {
      setCurrentGallery(gallery);
      setFormData({
        prompt: gallery.prompt || '',
        image_url: gallery.image_url || '',
        extra_metadata: gallery.extra_metadata ? JSON.stringify(gallery.extra_metadata, null, 2) : '',
        model_id: gallery.model_id || ''
      });
    } else {
      setCurrentGallery(null);
      setFormData({
        prompt: '',
        image_url: '',
        extra_metadata: '',
        model_id: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentGallery(null);
    setFormData({
      prompt: '',
      image_url: '',
      extra_metadata: '',
      model_id: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('access_token');
      
      // Parse extra_metadata if it's a string
      let metadata = formData.extra_metadata;
      if (typeof metadata === 'string' && metadata.trim()) {
        try {
          metadata = JSON.parse(metadata);
        } catch (err) {
          alert('Invalid JSON format for extra metadata');
          return;
        }
      } else if (!metadata || metadata.trim() === '') {
        metadata = {};
      }

      const payload = {
        prompt: formData.prompt,
        image_url: formData.image_url,
        extra_metadata: metadata,
        model_id: formData.model_id ? parseInt(formData.model_id) : null
      };

      const url = currentGallery ? `/api/gallery/${currentGallery.id}` : '/api/gallery';
      const method = currentGallery ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(currentGallery ? 'Gallery updated successfully' : 'Gallery created successfully');
        handleCloseModal();
        fetchGalleries();
      } else {
        alert(data.error || 'Failed to save gallery');
      }
    } catch (error) {
      console.error('Error saving gallery:', error);
      alert('Error saving gallery');
    }
  };

  const handleDelete = async () => {
    if (!galleryToDelete) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/gallery/${galleryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok || response.status === 204) {
        alert('Gallery deleted successfully');
        setShowDeleteModal(false);
        setGalleryToDelete(null);
        fetchGalleries();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete gallery');
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      alert('Error deleting gallery');
    }
  };

  const handleOpenDeleteModal = (gallery) => {
    setGalleryToDelete(gallery);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setGalleryToDelete(null);
  };

  const handleOpenCategoryModal = (gallery) => {
    setCategoryGalleryId(gallery.id);
    // Handle both string array and object array
    const categoryIds = gallery.categories?.map(cat => {
      if (typeof cat === 'string') {
        // Find category id by name
        const found = categories.find(c => c.name === cat);
        return found?.id;
      }
      return cat.id;
    }).filter(Boolean) || [];
    setSelectedCategories(categoryIds);
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setCategoryGalleryId(null);
    setSelectedCategories([]);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSaveCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/gallery/${categoryGalleryId}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category_ids: selectedCategories
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Categories updated successfully');
        handleCloseCategoryModal();
        fetchGalleries();
      } else {
        alert(data.error || 'Failed to update categories');
      }
    } catch (error) {
      console.error('Error updating categories:', error);
      alert('Error updating categories');
    }
  };

  // Filter galleries based on search
  const filteredGalleries = galleries.filter(gallery => {
    const matchesSearch = !searchTerm || 
      (gallery.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       gallery.model_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Gallery Management
          </h1>
          <p className="text-gray-600">Manage AI-generated batik gallery images</p>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by prompt or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md"
            >
              + Add New Gallery Item
            </button>
          </div>
        </div>

        {/* Gallery Table */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            <p className="mt-4 text-gray-600">Loading galleries...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGalleries.map((gallery) => (
                      <tr key={gallery.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                            {gallery.image_url ? (
                              <img
                                src={gallery.image_url}
                                alt={gallery.prompt || 'Gallery'}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3C/svg%3E';
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{gallery.prompt || 'No prompt'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{gallery.model_name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {gallery.categories?.slice(0, 2).map((cat, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                {typeof cat === 'string' ? cat : cat.name}
                              </span>
                            ))}
                            {gallery.categories?.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                +{gallery.categories.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {gallery.created_at ? new Date(gallery.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => fetchGalleryDetail(gallery.id)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenModal(gallery)}
                              className="text-amber-600 hover:text-amber-900 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenCategoryModal(gallery)}
                              className="text-purple-600 hover:text-purple-900 transition-colors"
                              title="Manage Categories"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(gallery)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredGalleries.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-4 text-gray-600">No gallery items found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{offset + 1}</span> to <span className="font-medium">{Math.min(offset + limit, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center px-4 py-2 text-sm text-gray-700">
                    Page {Math.floor(offset / limit) + 1} of {totalPages}
                  </div>
                  <button
                    onClick={() => setOffset(offset + limit)}
                    disabled={!hasMore || offset + limit >= totalCount}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {currentGallery ? 'Edit Gallery Item' : 'Add New Gallery Item'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt *
                  </label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    rows="4"
                    required
                    placeholder="Enter the generation prompt..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    required
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Metadata (JSON)
                  </label>
                  <textarea
                    value={formData.extra_metadata}
                    onChange={(e) => setFormData({ ...formData, extra_metadata: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent font-mono text-sm"
                    rows="6"
                    placeholder='{"steps": 50, "guidance_scale": 7.5, "seed": 12345}'
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional. Enter valid JSON for generation parameters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model
                  </label>
                  <select
                    value={formData.model_id}
                    onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  >
                    <option value="">-- Select Model (Optional) --</option>
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.model_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all"
                  >
                    {currentGallery ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Gallery Detail
              </h2>

              {isLoadingDetail ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                  <p className="mt-4 text-gray-600">Loading details...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {viewGallery.image_url ? (
                      <img
                        src={viewGallery.image_url}
                        alt={viewGallery.prompt || 'Gallery image'}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image Available
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
                      <p className="text-gray-900">{viewGallery.id}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                      <p className="text-gray-900">{viewGallery.creator_name || viewGallery.created_by || 'N/A'}</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Prompt</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{viewGallery.prompt || 'N/A'}</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Image URL</label>
                      <a 
                        href={viewGallery.image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {viewGallery.image_url}
                      </a>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">AI Model</label>
                      <p className="text-gray-900">
                        {viewGallery.model_name || (viewGallery.model_id ? `Model ID: ${viewGallery.model_id}` : 'N/A')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {viewGallery.categories?.length > 0 ? (
                          viewGallery.categories.map((cat, index) => (
                            <span key={index} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                              {typeof cat === 'string' ? cat : cat.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-900">No categories</p>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Extra Metadata</label>
                      <pre className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto text-sm">
                        {viewGallery.extra_metadata 
                          ? JSON.stringify(viewGallery.extra_metadata, null, 2)
                          : 'No metadata'}
                      </pre>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                      <p className="text-gray-900">
                        {viewGallery.created_at ? new Date(viewGallery.created_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Updated At</label>
                      <p className="text-gray-900">
                        {viewGallery.updated_at ? new Date(viewGallery.updated_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this gallery item? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Assignment Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Assign Categories
            </h2>
            
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-600"
                    />
                    <span className="text-gray-700">{category.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No categories available</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveCategories}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all"
              >
                Save
              </button>
              <button
                onClick={handleCloseCategoryModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
