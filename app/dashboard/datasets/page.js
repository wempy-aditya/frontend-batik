"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/AuthProvider';

export default function ManageDatasetsPage() {
  const { getUserInfo } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    tagline: '',
    samples: 0,
    download_count: 0,
    gradient: '#FF6B6B,#4ECDC4',
    version: '1.0',
    format: 'JSON',
    license: 'MIT',
    citation: '',
    key_features: [],
    use_cases: [],
    technical_specs: {
      type: 'supervised',
      access: 'public',
      format: 'JSON',
      license: 'MIT',
      version: '1.0',
      lastUpdate: new Date().toISOString().split('T')[0]
    },
    statistics: {
      avgImageSize: '512x512',
      qualityScore: 0,
      totalAnnotations: 0,
      avgImagesPerCategory: 0,
      maxImagesPerCategory: 0,
      minImagesPerCategory: 0
    },
    sample_images: [],
    file_url: '',
    source: '',
    size: 0,
    access_level: 'public',
    status: 'draft'
  });
  const [keyFeatureInput, setKeyFeatureInput] = useState('');
  const [useCaseInput, setUseCaseInput] = useState('');
  const [sampleImageInput, setSampleImageInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchDatasets();
    fetchCategories();
  }, []);

  const fetchDatasets = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      
      console.log('Token available:', !!token);
      console.log('Making request to /api/datasets');
      
      const response = await fetch('/api/datasets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Datasets response:', data);
        setDatasets(data.data || []);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch datasets: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setError('Failed to load datasets: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/categories?type=dataset', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const url = modalMode === 'edit' ? `/api/datasets/${selectedDataset.id}` : '/api/datasets';
      const method = modalMode === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchDatasets();
        setIsModalOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save dataset');
      }
    } catch (error) {
      console.error('Error saving dataset:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (datasetId) => {
    if (!confirm('Are you sure you want to delete this dataset?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`/api/datasets/${datasetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchDatasets();
      } else {
        throw new Error('Failed to delete dataset');
      }
    } catch (error) {
      console.error('Error deleting dataset:', error);
      setError('Failed to delete dataset');
    }
  };

  const handleAssignCategories = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`/api/datasets/${selectedDataset.id}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_ids: selectedCategories }),
      });

      if (response.ok) {
        setIsCategoryModalOpen(false);
        setSelectedCategories([]);
        await fetchDatasets(); // Refresh to show updated categories
      } else {
        throw new Error('Failed to assign categories');
      }
    } catch (error) {
      console.error('Error assigning categories:', error);
      setError('Failed to assign categories');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (mode, dataset = null) => {
    setModalMode(mode);
    setSelectedDataset(dataset);
    setError('');
    
    if (mode === 'create') {
      resetForm();
    } else if (dataset) {
      setFormData({
        name: dataset.name || '',
        slug: dataset.slug || '',
        description: dataset.description || '',
        tagline: dataset.tagline || '',
        samples: dataset.samples || 0,
        download_count: dataset.download_count || 0,
        gradient: dataset.gradient || '#FF6B6B,#4ECDC4',
        version: dataset.version || '1.0',
        format: dataset.format || 'JSON',
        license: dataset.license || 'MIT',
        citation: dataset.citation || '',
        key_features: dataset.key_features || [],
        use_cases: dataset.use_cases || [],
        technical_specs: dataset.technical_specs || {
          type: 'supervised',
          access: 'public',
          format: 'JSON',
          license: 'MIT',
          version: '1.0',
          lastUpdate: new Date().toISOString().split('T')[0]
        },
        statistics: dataset.statistics || {
          avgImageSize: '512x512',
          qualityScore: 0,
          totalAnnotations: 0,
          avgImagesPerCategory: 0,
          maxImagesPerCategory: 0,
          minImagesPerCategory: 0
        },
        sample_images: dataset.sample_images || [],
        file_url: dataset.file_url || '',
        source: dataset.source || '',
        size: dataset.size || 0,
        access_level: dataset.access_level || 'public',
        status: dataset.status || 'draft'
      });
    }
    
    setIsModalOpen(true);
  };

  const openCategoryModal = (dataset) => {
    setSelectedDataset(dataset);
    setSelectedCategories([]);
    setIsCategoryModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      tagline: '',
      samples: 0,
      download_count: 0,
      gradient: '#FF6B6B,#4ECDC4',
      version: '1.0',
      format: 'JSON',
      license: 'MIT',
      citation: '',
      key_features: [],
      use_cases: [],
      technical_specs: {
        type: 'supervised',
        access: 'public',
        format: 'JSON',
        license: 'MIT',
        version: '1.0',
        lastUpdate: new Date().toISOString().split('T')[0]
      },
      statistics: {
        avgImageSize: '512x512',
        qualityScore: 0,
        totalAnnotations: 0,
        avgImagesPerCategory: 0,
        maxImagesPerCategory: 0,
        minImagesPerCategory: 0
      },
      sample_images: [],
      file_url: '',
      source: '',
      size: 0,
      access_level: 'public',
      status: 'draft'
    });
    setKeyFeatureInput('');
    setUseCaseInput('');
    setSampleImageInput('');
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleAddKeyFeature = () => {
    if (keyFeatureInput.trim() && !formData.key_features.includes(keyFeatureInput.trim())) {
      setFormData({
        ...formData,
        key_features: [...formData.key_features, keyFeatureInput.trim()]
      });
      setKeyFeatureInput('');
    }
  };

  const handleRemoveKeyFeature = (featureToRemove) => {
    setFormData({
      ...formData,
      key_features: formData.key_features.filter(feature => feature !== featureToRemove)
    });
  };

  const handleAddUseCase = () => {
    if (useCaseInput.trim() && !formData.use_cases.includes(useCaseInput.trim())) {
      setFormData({
        ...formData,
        use_cases: [...formData.use_cases, useCaseInput.trim()]
      });
      setUseCaseInput('');
    }
  };

  const handleRemoveUseCase = (useCaseToRemove) => {
    setFormData({
      ...formData,
      use_cases: formData.use_cases.filter(useCase => useCase !== useCaseToRemove)
    });
  };

  const handleAddSampleImage = () => {
    if (sampleImageInput.trim() && !formData.sample_images.includes(sampleImageInput.trim())) {
      setFormData({
        ...formData,
        sample_images: [...formData.sample_images, sampleImageInput.trim()]
      });
      setSampleImageInput('');
    }
  };

  const handleRemoveSampleImage = (imageToRemove) => {
    setFormData({
      ...formData,
      sample_images: formData.sample_images.filter(image => image !== imageToRemove)
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-red-100 text-red-700'
    };
    return badges[status] || badges.draft;
  };

  const getAccessBadge = (accessLevel) => {
    const badges = {
      public: 'bg-green-100 text-green-700',
      private: 'bg-red-100 text-red-700',
      premium: 'bg-amber-100 text-amber-700'
    };
    return badges[accessLevel] || badges.public;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <svg className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-amber-700 font-semibold">Loading Datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-amber-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Datasets Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your research datasets</p>
          </div>
          <button
            onClick={() => openModal('create')}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Add Dataset</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className="bg-white/95 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Dataset Header */}
              <div className="relative p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{dataset.name}</h3>
                    <p className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded-lg mb-2 font-mono">
                      {dataset.slug}
                    </p>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dataset.description}</p>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(dataset.status)}`}>
                      {dataset.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAccessBadge(dataset.access_level)}`}>
                      {dataset.access_level}
                    </span>
                  </div>
                </div>

                {/* Dataset Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Samples</p>
                    <p className="font-semibold text-gray-900">{dataset.samples?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Size</p>
                    <p className="font-semibold text-gray-900">{formatFileSize(dataset.size || 0)}</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Version</p>
                    <p className="font-semibold text-gray-900">{dataset.version || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Downloads</p>
                    <p className="font-semibold text-gray-900">{dataset.download_count || 0}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Key Features */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Key Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {dataset.key_features?.slice(0, 3).map((feature, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                        {feature}
                      </span>
                    ))}
                    {dataset.key_features?.length > 3 && (
                      <span className="text-xs text-gray-500">+{dataset.key_features.length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Use Cases */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Use Cases:</p>
                  <div className="flex flex-wrap gap-1">
                    {dataset.use_cases?.slice(0, 2).map((useCase, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                        {useCase}
                      </span>
                    ))}
                    {dataset.use_cases?.length > 2 && (
                      <span className="text-xs text-gray-500">+{dataset.use_cases.length - 2} more</span>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>Created: {new Date(dataset.created_at).toLocaleDateString()}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {dataset.format || 'JSON'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('view', dataset)}
                    className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                    title="View Details"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openModal('edit', dataset)}
                    className="flex-1 p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-sm"
                    title="Edit Dataset"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openCategoryModal(dataset)}
                    className="flex-1 p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm"
                    title="Assign Categories"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a1 1 0 01-1-1V3a1 1 0 011-1z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(dataset.id)}
                    className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    title="Delete Dataset"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {datasets.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Datasets Found</h3>
              <p className="text-gray-600 mb-4">Start by creating your first dataset</p>
              <button
                onClick={() => openModal('create')}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Create First Dataset
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Dataset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' && 'Create New Dataset'}
                  {modalMode === 'edit' && 'Edit Dataset'}
                  {modalMode === 'view' && 'Dataset Details'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalMode === 'view' ? (
                <div className="space-y-6">
                  {/* View Mode Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedDataset?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900 font-mono">{selectedDataset?.slug}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Version</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedDataset?.version}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedDataset?.format}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">License</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedDataset?.license}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedDataset?.source}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedDataset?.description}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                    <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedDataset?.tagline}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Key Features</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDataset?.key_features?.map((feature, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Use Cases</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDataset?.use_cases?.map((useCase, index) => (
                        <span key={index} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Samples</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedDataset?.samples?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{formatFileSize(selectedDataset?.size || 0)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Downloads</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedDataset?.download_count}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dataset Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={handleNameChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter dataset name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors font-mono"
                        placeholder="dataset-slug"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors resize-none"
                      placeholder="Enter dataset description..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="Brief tagline for the dataset"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Samples Count *
                      </label>
                      <input
                        type="number"
                        value={formData.samples}
                        onChange={(e) => setFormData({ ...formData, samples: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="50000"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        File Size (bytes) *
                      </label>
                      <input
                        type="number"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="2048000000"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Version *
                      </label>
                      <input
                        type="text"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="1.0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Format *
                      </label>
                      <select
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="JSON">JSON</option>
                        <option value="CSV">CSV</option>
                        <option value="XML">XML</option>
                        <option value="ZIP">ZIP</option>
                        <option value="TXT">TXT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        License *
                      </label>
                      <select
                        value={formData.license}
                        onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="MIT">MIT</option>
                        <option value="Apache 2.0">Apache 2.0</option>
                        <option value="GPL">GPL</option>
                        <option value="BSD">BSD</option>
                        <option value="CC BY">CC BY</option>
                        <option value="CC BY-SA">CC BY-SA</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Source
                      </label>
                      <input
                        type="text"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Research Lab or Organization"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        File URL
                      </label>
                      <input
                        type="url"
                        value={formData.file_url}
                        onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="https://example.com/dataset.zip"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Citation
                    </label>
                    <textarea
                      value={formData.citation}
                      onChange={(e) => setFormData({ ...formData, citation: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors resize-none font-mono"
                      placeholder="@dataset{example_2024, author={Author}, title={Dataset Title}}"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Key Features
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={keyFeatureInput}
                        onChange={(e) => setKeyFeatureInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyFeature())}
                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter key feature and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyFeature}
                        className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.key_features.map((feature, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyFeature(feature)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Use Cases
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={useCaseInput}
                        onChange={(e) => setUseCaseInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUseCase())}
                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter use case and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddUseCase}
                        className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.use_cases.map((useCase, index) => (
                        <span key={index} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {useCase}
                          <button
                            type="button"
                            onClick={() => handleRemoveUseCase(useCase)}
                            className="text-amber-500 hover:text-amber-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Access Level
                      </label>
                      <select
                        value={formData.access_level}
                        onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                      >
                        <option value="public">Public</option>
                        <option value="registered">Registered</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 px-4 py-3 rounded-xl text-white transition-colors ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg'
                      }`}
                    >
                      {isSubmitting ? 'Saving...' : modalMode === 'edit' ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Assignment Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Assign Categories</h2>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                        }
                      }}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.slug}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignCategories}
                  disabled={isSubmitting || selectedCategories.length === 0}
                  className={`flex-1 px-4 py-3 rounded-xl text-white transition-colors ${
                    isSubmitting || selectedCategories.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Categories'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}