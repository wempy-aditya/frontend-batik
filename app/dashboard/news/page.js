"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/components/AuthProvider';

export default function NewsPage() {
  return (
    <ProtectedRoute>
      <NewsContent />
    </ProtectedRoute>
  );
}

function NewsContent() {
  const router = useRouter();
  const { getUserInfo } = useAuth();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedNews, setSelectedNews] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    thumbnail_url: '',
    tags: [],
    access_level: 'public',
    status: 'draft'
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/news', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNews(data.data?.data || []);
      } else {
        throw new Error('Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to load news');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/categories', {
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
      const url = modalMode === 'edit' ? `/api/news/${selectedNews.id}` : '/api/news';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchNews();
        setIsModalOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save news');
      }
    } catch (error) {
      console.error('Error saving news:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (newsId) => {
    if (!confirm('Are you sure you want to delete this news?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`/api/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchNews();
      } else {
        throw new Error('Failed to delete news');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      setError('Failed to delete news');
    }
  };

  const handleAssignCategories = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`/api/news/${selectedNews.id}/categories`, {
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

  const openModal = (mode, newsItem = null) => {
    setModalMode(mode);
    setSelectedNews(newsItem);
    setError('');
    
    if (mode === 'create') {
      resetForm();
    } else if (newsItem) {
      setFormData({
        title: newsItem.title,
        slug: newsItem.slug,
        content: newsItem.content || '',
        thumbnail_url: newsItem.thumbnail_url || '',
        tags: newsItem.tags || [],
        access_level: newsItem.access_level || 'public',
        status: newsItem.status || 'draft'
      });
    }
    
    setIsModalOpen(true);
  };

  const openCategoryModal = (newsItem) => {
    setSelectedNews(newsItem);
    setSelectedCategories([]);
    setIsCategoryModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      thumbnail_url: '',
      tags: [],
      access_level: 'public',
      status: 'draft'
    });
    setTagInput('');
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-red-100 text-red-700'
    };
    return badges[status] || badges.draft;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-amber-700 font-semibold">Loading News...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-amber-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">News Management</h1>
                <p className="text-xs sm:text-sm text-gray-600">Manage news articles and posts</p>
              </div>
            </div>

            <button
              onClick={() => openModal('create')}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Add News</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {news.map((newsItem) => (
            <div
              key={newsItem.id}
              className="bg-white/95 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100">
                {newsItem.thumbnail_url ? (
                  <img 
                    src={newsItem.thumbnail_url} 
                    alt={newsItem.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-16 h-16 text-amber-600/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(newsItem.status)}`}>
                    {newsItem.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{newsItem.title}</h3>
                    <p className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mb-2 font-mono">
                      {newsItem.slug}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {newsItem.tags?.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                  {newsItem.tags?.length > 3 && (
                    <span className="text-xs text-gray-500">+{newsItem.tags.length - 3} more</span>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>Created: {new Date(newsItem.created_at).toLocaleDateString()}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {newsItem.access_level}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('view', newsItem)}
                    className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                    title="View Details"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openModal('edit', newsItem)}
                    className="flex-1 p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-sm"
                    title="Edit News"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openCategoryModal(newsItem)}
                    className="flex-1 p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm"
                    title="Assign Categories"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a1 1 0 01-1-1V3a1 1 0 011-1z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(newsItem.id)}
                    className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    title="Delete News"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {news.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No News Found</h3>
              <p className="text-gray-600 mb-4">Start by creating your first news article</p>
              <button
                onClick={() => openModal('create')}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Create First News
              </button>
            </div>
          )}
        </div>
      </main>

      {/* News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' && 'Create New News'}
                  {modalMode === 'edit' && 'Edit News'}
                  {modalMode === 'view' && 'News Details'}
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedNews?.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900 font-mono">{selectedNews?.slug}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <p className={`p-3 rounded-xl text-center font-semibold ${getStatusBadge(selectedNews?.status)}`}>
                        {selectedNews?.status}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Access Level</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900 capitalize">{selectedNews?.access_level}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail URL</label>
                    <p className="p-3 bg-gray-50 rounded-xl text-gray-900 break-all">{selectedNews?.thumbnail_url || 'No thumbnail'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedNews?.tags?.map((tag, index) => (
                        <span key={index} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      )) || <span className="text-gray-500">No tags</span>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                    <div className="p-4 bg-gray-50 rounded-xl max-h-64 overflow-y-auto">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">{selectedNews?.content || 'No content'}</pre>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Created At</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{new Date(selectedNews?.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Updated At</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">
                        {selectedNews?.updated_at ? new Date(selectedNews.updated_at).toLocaleString() : 'Never updated'}
                      </p>
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
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter news title"
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
                        placeholder="news-slug"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors resize-none font-mono"
                      placeholder="Enter content in markdown format..."
                      rows={8}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Supports markdown formatting</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
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
                        <option value="private">Private</option>
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