"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/AuthProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ManageAIModelsPage() {
  const { getUserInfo } = useAuth();
  const [aiModels, setAiModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelToDelete, setModelToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    architecture: '',
    dataset_used: '',
    metrics: '',  // Now a JSON string for flexibility
    model_file_url: '',
    access_level: 'public',
    status: 'draft'
  });

  // Utility function to generate valid slug
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Validate slug format
  const isValidSlug = (slug) => {
    return /^[a-z0-9-]+$/.test(slug) && slug.length > 0;
  };

  // Fetch AI Models
  const fetchAiModels = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      console.log('Token available:', !!token);
      console.log('Making request to /api/ai-models');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/ai-models', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Models response:', data);
      setAiModels(data.data?.data || []);
    } catch (error) {
      console.error('Error fetching AI models:', error);
      setError('Failed to fetch AI models: ' + error.message);
    }
  };

  // Fetch Categories for AI Models
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      console.log('Token available for categories:', !!token);
      console.log('Making request to /api/categories?type=model');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/categories?type=model', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Categories response status:', response.status);
      console.log('Categories response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Categories error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Categories response:', data);
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories: ' + error.message);
    }
  };

  const fetchModelDetail = async (modelId) => {
    try {
      setIsLoadingDetail(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/ai-models/${modelId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || data;
      } else {
        throw new Error('Failed to fetch model details');
      }
    } catch (error) {
      console.error('Error fetching model details:', error);
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchAiModels(), fetchCategories()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      name: '',
      slug: '',
      description: '',
      architecture: '',
      dataset_used: '',
      metrics: '',  // Empty string for new model
      model_file_url: '',
      access_level: 'public',
      status: 'draft'
    });
    setSelectedModel(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleEdit = (model) => {
    setModalMode('edit');
    setSelectedModel(model);
    setFormData({
      name: model.name || '',
      slug: model.slug || '',
      description: model.description || '',
      architecture: model.architecture || '',
      dataset_used: model.dataset_used || '',
      metrics: model.metrics ? JSON.stringify(model.metrics, null, 2) : '',  // Convert object to formatted JSON string
      model_file_url: model.model_file_url || '',
      access_level: model.access_level || 'public',
      status: model.status || 'draft'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleView = async (model) => {
    setModalMode('view');
    setError('');
    setIsModalOpen(true);
    
    // Fetch detail data from API
    const detailData = await fetchModelDetail(model.id);
    if (detailData) {
      setSelectedModel(detailData);
      setFormData({
        name: detailData.name || '',
        slug: detailData.slug || '',
        description: detailData.description || '',
        architecture: detailData.architecture || '',
        dataset_used: detailData.dataset_used || '',
        metrics: detailData.metrics ? JSON.stringify(detailData.metrics, null, 2) : '',  // Convert to JSON string
        model_file_url: detailData.model_file_url || '',
        access_level: detailData.access_level || 'public',
        status: detailData.status || 'draft'
      });
    } else {
      setSelectedModel(model);
      setFormData({
        name: model.name || '',
        slug: model.slug || '',
        description: model.description || '',
        architecture: model.architecture || '',
        dataset_used: model.dataset_used || '',
        metrics: model.metrics ? JSON.stringify(model.metrics, null, 2) : '',  // Convert to JSON string
        model_file_url: model.model_file_url || '',
        access_level: model.access_level || 'public',
        status: model.status || 'draft'
      });
    }
  };

  const openDeleteModal = (model) => {
    setModelToDelete(model);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!modelToDelete) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(`/api/ai-models/${modelToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      await fetchAiModels();
      setIsDeleteModalOpen(false);
      setModelToDelete(null);
    } catch (error) {
      console.error('Error deleting AI model:', error);
      setError('Failed to delete AI model: ' + error.message);
    }
  };

  const handleDelete = (model) => {
    openDeleteModal(model);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === 'view') return;

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.slug.trim()) {
      setError('Slug is required');
      return;
    }

    if (!isValidSlug(formData.slug)) {
      setError('Slug must only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Prepare form data
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        architecture: formData.architecture.trim(),
        dataset_used: formData.dataset_used.trim(),
        model_file_url: formData.model_file_url.trim()
      };

      // Parse metrics JSON if provided
      if (formData.metrics && formData.metrics.trim()) {
        try {
          submitData.metrics = JSON.parse(formData.metrics);
        } catch (e) {
          setError('Invalid JSON in metrics field. Please check your formatting.');
          setIsSubmitting(false);
          return;
        }
      } else {
        submitData.metrics = null;
      }

      // Remove empty fields
      if (!submitData.architecture) delete submitData.architecture;
      if (!submitData.dataset_used) delete submitData.dataset_used;
      if (!submitData.model_file_url) delete submitData.model_file_url;

      const url = modalMode === 'create' ? '/api/ai-models' : `/api/ai-models/${selectedModel.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const result = await response.json();
      console.log('Submit result:', result);

      setIsModalOpen(false);
      await fetchAiModels();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(`Failed to ${modalMode} AI model: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryAssign = async (modelId, categoryIds) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(`/api/ai-models/${modelId}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_ids: categoryIds }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      await fetchAiModels();
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Error assigning categories:', error);
      setError('Failed to assign categories: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      // Auto-generate slug from name
      const generatedSlug = generateSlug(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        slug: generatedSlug
      }));
    } else if (name === 'slug') {
      // Validate and format slug manually entered
      const formattedSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, [name]: formattedSlug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const fetchFilesForPicker = async () => {
    try {
      setIsLoadingFiles(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableFiles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const openFilePicker = () => {
    setIsFilePickerOpen(true);
    fetchFilesForPicker();
  };

  const selectFile = (fileUrl) => {
    const fullUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `${API_BASE_URL}${fileUrl}`;
    setFormData({ ...formData, model_file_url: fullUrl });
    setIsFilePickerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-xl"></div>
            <svg className="absolute inset-0 w-full h-full p-5 text-amber-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-slate-700 font-medium text-lg">Loading AI Models...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
      {/* Page Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                AI Models
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Create, edit, and manage your AI models</p>
            </div>
            <button
              onClick={handleCreate}
              className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add AI Model</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-2xl text-red-700 flex items-start gap-3 shadow-sm">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* AI Models Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {aiModels.map((model) => (
            <div key={model.id} className="group bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg group-hover:text-amber-700 transition-colors">{model.name}</h3>
                  </div>
                  <span className={`ml-2 px-2.5 py-1 text-xs font-semibold rounded-xl ${
                    model.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {model.status}
                  </span>
                </div>
                
                <p className="text-sm text-amber-700 bg-amber-50/80 backdrop-blur-sm px-3 py-1.5 rounded-xl font-mono font-medium mb-3 inline-block">
                  {model.slug}
                </p>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{model.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Architecture:</span>
                    <span className="text-slate-900 font-medium">{model.architecture || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Dataset:</span>
                    <span className="text-slate-900 font-medium truncate ml-2">{model.dataset_used || 'N/A'}</span>
                  </div>
                </div>

                {model.metrics && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 mb-4 border border-amber-100">
                    <p className="text-xs font-bold text-amber-800 mb-2">Metrics</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {model.metrics.accuracy && (
                        <div>
                          <span className="text-amber-600 block">Accuracy</span>
                          <span className="font-bold text-slate-900">{(model.metrics.accuracy * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {model.metrics.f1_score && (
                        <div>
                          <span className="text-amber-600 block">F1 Score</span>
                          <span className="font-bold text-slate-900">{model.metrics.f1_score.toFixed(3)}</span>
                        </div>
                      )}
                      {model.metrics.loss && (
                        <div>
                          <span className="text-amber-600 block">Loss</span>
                          <span className="font-bold text-slate-900">{model.metrics.loss.toFixed(3)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {model.categories && model.categories.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-700 mb-2">Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {model.categories.slice(0, 2).map((category, index) => (
                        <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                          {category}
                        </span>
                      ))}
                      {model.categories.length > 2 && (
                        <span className="text-xs text-slate-500 font-medium">+{model.categories.length - 2} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
                  <span className="bg-slate-100/80 backdrop-blur-sm px-2.5 py-1 rounded-lg font-medium capitalize">
                    {model.access_level}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleView(model)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(model)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-200 font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModel(model);
                      setIsCategoryModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Tags
                  </button>
                  <button
                    onClick={() => handleDelete(model)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {aiModels.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No AI Models Yet</h3>
                <p className="text-slate-600 mb-6">Get started by creating your first AI model</p>
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-medium shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create First AI Model
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {modalMode === 'create' ? 'Create New AI Model' : 
                     modalMode === 'edit' ? 'Edit AI Model' : 'View AI Model'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
                    {error}
                  </div>
                )}

                {modalMode === 'view' ? (
                  isLoadingDetail ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4">
                          <svg className="w-full h-full text-amber-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <p className="text-slate-600 font-medium">Loading model details...</p>
                      </div>
                    </div>
                  ) : selectedModel && (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="bg-gradient-to-r from-slate-50 to-amber-50/50 p-4 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">{selectedModel.name}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 font-mono shadow-sm">{selectedModel.slug}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                            <p className={`inline-block px-4 py-2 rounded-xl font-semibold ${
                              selectedModel.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedModel.status}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Access Level</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 capitalize shadow-sm">{selectedModel.access_level}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Description
                        </label>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          <p className="text-sm text-slate-900 whitespace-pre-wrap">{selectedModel.description || 'No description available'}</p>
                        </div>
                      </div>

                      {/* Model Details */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                          Model Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Architecture</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">{selectedModel.architecture || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dataset Used</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">{selectedModel.dataset_used || 'N/A'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Gallery Count</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm font-bold">{selectedModel.gallery_count || 0} images</p>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      {selectedModel.metrics && Object.keys(selectedModel.metrics).length > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 p-4 rounded-2xl border border-green-200">
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Performance Metrics
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(selectedModel.metrics).map(([key, value]) => (
                              <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                  {key.replace(/_/g, ' ')}
                                </label>
                                <p className="text-gray-900 font-bold text-lg break-words">
                                  {typeof value === 'number' 
                                    ? (key.includes('percent') || key === 'accuracy' || key === 'precision' || key === 'recall' 
                                      ? `${(value * 100).toFixed(2)}%` 
                                      : value.toLocaleString())
                                    : value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Model File URL */}
                      {selectedModel.model_file_url && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Model File URL
                          </label>
                          <a href={selectedModel.model_file_url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-cyan-50 rounded-xl text-blue-600 hover:text-blue-700 shadow-sm break-all text-sm underline border border-cyan-200">
                            {selectedModel.model_file_url}
                          </a>
                        </div>
                      )}

                      {/* Categories */}
                      {selectedModel.categories && selectedModel.categories.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Categories ({selectedModel.categories.length})
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedModel.categories.map((category, index) => (
                              <span key={index} className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                                {typeof category === 'string' ? category : category.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Metadata
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">ID</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 font-mono text-xs shadow-sm">{selectedModel.id}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Creator Name</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">{selectedModel.creator_name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Created At</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">{selectedModel.created_at ? new Date(selectedModel.created_at).toLocaleString() : 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Updated At</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">{selectedModel.updated_at ? new Date(selectedModel.updated_at).toLocaleString() : 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Created By (ID)</label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 font-mono text-xs shadow-sm">{selectedModel.created_by || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                        disabled={modalMode === 'view'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                          formData.slug && !isValidSlug(formData.slug) 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        disabled={modalMode === 'view'}
                        placeholder="auto-generated-from-name"
                      />
                      {formData.slug && !isValidSlug(formData.slug) && modalMode !== 'view' && (
                        <p className="text-red-600 text-xs mt-1">
                          Slug must only contain lowercase letters, numbers, and hyphens
                        </p>
                      )}
                      {modalMode !== 'view' && (
                        <p className="text-gray-500 text-xs mt-1">
                          Auto-generated from name. Only lowercase letters, numbers, and hyphens allowed.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Architecture</label>
                      <input
                        type="text"
                        name="architecture"
                        value={formData.architecture}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        disabled={modalMode === 'view'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dataset Used</label>
                      <input
                        type="text"
                        name="dataset_used"
                        value={formData.dataset_used}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model File URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="model_file_url"
                        value={formData.model_file_url}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        disabled={modalMode === 'view'}
                      />
                      {modalMode !== 'view' && (
                        <button
                          type="button"
                          onClick={openFilePicker}
                          className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium hover:scale-105 flex items-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                            />
                          </svg>
                          Browse
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Performance Metrics (JSON)
                      <span className="text-gray-500 text-xs font-normal ml-2">Optional - Flexible format</span>
                    </label>
                    <textarea
                      name="metrics"
                      value={formData.metrics}
                      onChange={handleInputChange}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
                      disabled={modalMode === 'view'}
                      placeholder={`{\n  "map": 0.528,\n  "map_50": 0.697,\n  "precision": 0.682,\n  "recall": 0.581,\n  "fps": 45,\n  "inference_time_ms": 22,\n  "model_size_mb": 165,\n  "custom_note": "Your custom metric"\n}`}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter valid JSON with any metrics you need (e.g., accuracy, map, precision, recall, fps, loss, etc.)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                      <select
                        name="access_level"
                        value={formData.access_level}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        disabled={modalMode === 'view'}
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        disabled={modalMode === 'view'}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  {modalMode !== 'view' && (
                    <div className="flex gap-4 pt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : (modalMode === 'create' ? 'Create AI Model' : 'Update AI Model')}
                      </button>
                    </div>
                  )}
                </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Assignment Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Assign Categories</h3>
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        onChange={(e) => {
                          const categoryIds = e.target.checked 
                            ? [category.id]
                            : [];
                          if (e.target.checked) {
                            handleCategoryAssign(selectedModel.id, categoryIds);
                          }
                        }}
                      />
                      <span className="ml-3 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>

                {categories.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No categories available</p>
                )}
              </div>
            </div>
          </div>
        )}

      {/* File Picker Modal */}
      {isFilePickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Select Model File</h3>
                <button
                  onClick={() => setIsFilePickerOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {isLoadingFiles ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : availableFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => selectFile(file.file_url)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.filename}</p>
                          <p className="text-sm text-gray-500 truncate">{file.file_type}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p>No files available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center text-slate-900">Delete AI Model?</h2>
            <p className="text-slate-600 mb-2 text-center">
              Are you sure you want to delete
            </p>
            <p className="text-slate-900 font-semibold text-center mb-6">
              "{modelToDelete?.name}"?
            </p>
            <p className="text-red-600 text-sm text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setModelToDelete(null);
                }}
                className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}