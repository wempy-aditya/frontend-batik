'use client';

import { useAuth } from '../../../components/AuthProvider';
import { useState, useEffect } from 'react';

export default function PublicationsPage() {
  const { user, token } = useAuth();
  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    abstract: '',
    authors: [],
    venue: '',
    year: new Date().getFullYear(),
    citations: 0,
    doi: '',
    keywords: [],
    impact: '',
    pages: '',
    volume: '',
    issue: '',
    publisher: '',
    methodology: '',
    results: '',
    conclusions: '',
    pdf_url: '',
    journal_name: '',
    graphical_abstract_url: '',
    access_level: 'public',
    status: 'draft'
  });

  // Form arrays helpers
  const [newAuthor, setNewAuthor] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    console.log('Publications useEffect triggered, token:', !!token);
    if (token) {
      fetchPublications();
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [token, currentPage]);

  const fetchPublications = async () => {
    try {
      console.log('Fetching publications...');
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await fetch(`/api/publications?offset=${offset}&limit=${itemsPerPage}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Publications response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Publications data received:', data);
        console.log('Type of data.data:', typeof data.data);
        console.log('Is data.data an array:', Array.isArray(data.data));
        console.log('Data.data keys (if object):', typeof data.data === 'object' && data.data ? Object.keys(data.data) : 'N/A');
        
        // Try different possible data structures
        let publicationsArray = [];
        if (Array.isArray(data.data)) {
          publicationsArray = data.data;
        } else if (Array.isArray(data.data?.items)) {
          publicationsArray = data.data.items;
        } else if (Array.isArray(data.data?.publications)) {
          publicationsArray = data.data.publications;
        } else if (Array.isArray(data.data?.data)) {
          publicationsArray = data.data.data;
        } else if (Array.isArray(data.items)) {
          publicationsArray = data.items;
        } else if (Array.isArray(data.publications)) {
          publicationsArray = data.publications;
        }
        
        console.log('Final publications array:', publicationsArray);
        console.log('Publications array length:', publicationsArray.length);
        
        setPublications(publicationsArray);
        setTotalCount(data.total_count || 0);
      } else {
        console.error('Publications fetch failed:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Categories response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categories data received:', data);
        setCategories(data.data?.data || []);
      } else {
        console.error('Categories fetch failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      abstract: '',
      authors: [],
      venue: '',
      year: new Date().getFullYear(),
      citations: 0,
      doi: '',
      keywords: [],
      impact: '',
      pages: '',
      volume: '',
      issue: '',
      publisher: '',
      methodology: '',
      results: '',
      conclusions: '',
      pdf_url: '',
      journal_name: '',
      graphical_abstract_url: '',
      access_level: 'public',
      status: 'draft'
    });
    setNewAuthor('');
    setNewKeyword('');
  };

  const generateSlug = (title) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Submitting form data:', formData);
      console.log('Selected publication:', selectedPublication);
      
      // Ensure numeric fields are properly formatted
      const submitData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        year: parseInt(formData.year) || new Date().getFullYear(),
        citations: parseInt(formData.citations) || 0
      };
      
      console.log('Submit data:', submitData);

      const url = selectedPublication ? `/api/publications/${selectedPublication.id}` : '/api/publications';
      const method = selectedPublication ? 'PUT' : 'POST';
      
      console.log('Request URL:', url);
      console.log('Request method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        console.log('Publication saved successfully');
        await fetchPublications();
        setShowCreateModal(false);
        setShowEditModal(false);
        resetForm();
        setSelectedPublication(null);
      } else {
        const errorData = await response.text();
        console.error('Save failed:', response.status, errorData);
        alert(`Save failed: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error saving publication:', error);
      alert('Error saving publication: ' + error.message);
    }
  };

  const handleEdit = (publication) => {
    console.log('Editing publication:', publication);
    setSelectedPublication(publication);
    setFormData({
      title: publication.title || '',
      slug: publication.slug || '',
      abstract: publication.abstract || '',
      authors: publication.authors || [],
      venue: publication.venue || '',
      year: publication.year || new Date().getFullYear(),
      citations: publication.citations || 0,
      doi: publication.doi || '',
      keywords: publication.keywords || [],
      impact: publication.impact || '',
      pages: publication.pages || '',
      volume: publication.volume || '',
      issue: publication.issue || '',
      publisher: publication.publisher || '',
      methodology: publication.methodology || '',
      results: publication.results || '',
      conclusions: publication.conclusions || '',
      pdf_url: publication.pdf_url || '',
      journal_name: publication.journal_name || '',
      graphical_abstract_url: publication.graphical_abstract_url || '',
      access_level: publication.access_level || 'public',
      status: publication.status || 'draft'
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this publication?')) return;

    try {
      console.log('Deleting publication with ID:', id, 'Type:', typeof id, 'Length:', id ? id.length : 'N/A');
      
      if (!id || id === 'undefined' || id === undefined) {
        console.error('Invalid ID passed to handleDelete:', id);
        alert('Error: Invalid publication ID');
        return;
      }
      
      const url = `/api/publications/${id}`;
      console.log('DELETE: Constructed frontend URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        console.log('Publication deleted successfully');
        await fetchPublications();
      } else {
        const errorData = await response.text();
        console.error('Delete failed:', response.status, errorData);
        alert(`Delete failed: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error deleting publication:', error);
      alert('Error deleting publication: ' + error.message);
    }
  };

  const handleAssignCategories = async (categoryIds) => {
    if (!selectedPublication) return;

    try {
      const response = await fetch(`/api/publications/${selectedPublication.id}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_ids: categoryIds }),
      });

      if (response.ok) {
        await fetchPublications();
        setShowCategoryModal(false);
      }
    } catch (error) {
      console.error('Error assigning categories:', error);
    }
  };

  // Array manipulation functions
  const addAuthor = () => {
    if (newAuthor.trim()) {
      setFormData(prev => ({
        ...prev,
        authors: [...prev.authors, newAuthor.trim()]
      }));
      setNewAuthor('');
    }
  };

  const removeAuthor = (index) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  // Filter publications
  const filteredPublications = (Array.isArray(publications) ? publications : []).filter(publication => {
    const matchesSearch = publication.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         publication.abstract?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || publication.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (!token && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-4">Authentication Required</div>
          <p className="text-gray-600">Please log in to access publications management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-700 font-semibold">Loading publications...</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Publications Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your research publications and academic papers</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Add Publication</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Publication
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-amber-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search publications..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <span className="text-sm text-gray-600">
                Total: {filteredPublications.length} publications
              </span>
            </div>
          </div>
        </div>

        {/* Publications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublications.map((publication) => (
            <div key={publication.id} className="bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden group hover:shadow-xl transition-all duration-300">
              {/* Graphical Abstract */}
              {publication.graphical_abstract_url && (
                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={publication.graphical_abstract_url}
                    alt={publication.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-6">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    publication.status === 'published' ? 'bg-green-100 text-green-800' :
                    publication.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {publication.status?.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{publication.year}</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                  {publication.title}
                </h3>

                {/* Abstract */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {publication.abstract}
                </p>

                {/* Authors */}
                {publication.authors && publication.authors.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Authors:</p>
                    <div className="flex flex-wrap gap-1">
                      {publication.authors.slice(0, 3).map((author, index) => (
                        <span key={index} className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                          {author}
                        </span>
                      ))}
                      {publication.authors.length > 3 && (
                        <span className="text-xs text-gray-500">+{publication.authors.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {publication.keywords && publication.keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {publication.keywords.slice(0, 3).map((keyword, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {keyword}
                        </span>
                      ))}
                      {publication.keywords.length > 3 && (
                        <span className="text-xs text-gray-500">+{publication.keywords.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Citations</p>
                    <p className="font-semibold text-gray-900">{publication.citations || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Impact</p>
                    <p className="font-semibold text-gray-900">{publication.impact || 'N/A'}</p>
                  </div>
                </div>

                {/* Journal */}
                {publication.journal_name && (
                  <p className="text-sm text-gray-600 mb-4 italic">
                    {publication.journal_name}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPublication(publication);
                      setShowViewModal(true);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(publication)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPublication(publication);
                      setShowCategoryModal(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a1 1 0 01-1-1V3a1 1 0 011-1z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      console.log('Delete button clicked for publication:', publication);
                      console.log('Publication ID:', publication.id, 'Type:', typeof publication.id);
                      handleDelete(publication.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === i + 1
                    ? 'bg-amber-500 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Publication</h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({...prev, slug: e.target.value}))}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Abstract *</label>
                  <textarea
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    value={formData.abstract}
                    onChange={(e) => setFormData(prev => ({...prev, abstract: e.target.value}))}
                  />
                </div>

                {/* Authors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Authors</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add author name"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addAuthor}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.authors.map((author, index) => (
                      <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {author}
                        <button
                          type="button"
                          onClick={() => removeAuthor(index)}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Publication Details - CREATE MODAL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({...prev, year: parseInt(e.target.value) || new Date().getFullYear()}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Citations</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.citations}
                      onChange={(e) => setFormData(prev => ({...prev, citations: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Impact Factor</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.impact}
                      onChange={(e) => setFormData(prev => ({...prev, impact: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.venue}
                      onChange={(e) => setFormData(prev => ({...prev, venue: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Journal Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.journal_name}
                      onChange={(e) => setFormData(prev => ({...prev, journal_name: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">DOI</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.doi}
                      onChange={(e) => setFormData(prev => ({...prev, doi: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.publisher}
                      onChange={(e) => setFormData(prev => ({...prev, publisher: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pages</label>
                    <input
                      type="text"
                      placeholder="e.g., 123-135"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.pages}
                      onChange={(e) => setFormData(prev => ({...prev, pages: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.volume}
                      onChange={(e) => setFormData(prev => ({...prev, volume: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.issue}
                      onChange={(e) => setFormData(prev => ({...prev, issue: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add keyword"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Research Content */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Methodology</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.methodology}
                      onChange={(e) => setFormData(prev => ({...prev, methodology: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.results}
                      onChange={(e) => setFormData(prev => ({...prev, results: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conclusions</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.conclusions}
                      onChange={(e) => setFormData(prev => ({...prev, conclusions: e.target.value}))}
                    />
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PDF URL</label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.pdf_url}
                      onChange={(e) => setFormData(prev => ({...prev, pdf_url: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Graphical Abstract URL</label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.graphical_abstract_url}
                      onChange={(e) => setFormData(prev => ({...prev, graphical_abstract_url: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Status and Access */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.access_level}
                      onChange={(e) => setFormData(prev => ({...prev, access_level: e.target.value}))}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  >
                    Create Publication
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal - Similar to Create but with update logic */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Publication</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                      setSelectedPublication(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({...prev, slug: e.target.value}))}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Abstract *</label>
                  <textarea
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    value={formData.abstract}
                    onChange={(e) => setFormData(prev => ({...prev, abstract: e.target.value}))}
                  />
                </div>

                {/* Authors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Authors</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add author name"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addAuthor}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.authors.map((author, index) => (
                      <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {author}
                        <button
                          type="button"
                          onClick={() => removeAuthor(index)}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Publication Details - EDIT MODAL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({...prev, year: parseInt(e.target.value) || new Date().getFullYear()}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Citations</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.citations}
                      onChange={(e) => setFormData(prev => ({...prev, citations: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Impact Factor</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.impact}
                      onChange={(e) => setFormData(prev => ({...prev, impact: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.venue}
                      onChange={(e) => setFormData(prev => ({...prev, venue: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Journal Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.journal_name}
                      onChange={(e) => setFormData(prev => ({...prev, journal_name: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">DOI</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.doi}
                      onChange={(e) => setFormData(prev => ({...prev, doi: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.publisher}
                      onChange={(e) => setFormData(prev => ({...prev, publisher: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pages</label>
                    <input
                      type="text"
                      placeholder="e.g., 123-135"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.pages}
                      onChange={(e) => setFormData(prev => ({...prev, pages: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.volume}
                      onChange={(e) => setFormData(prev => ({...prev, volume: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.issue}
                      onChange={(e) => setFormData(prev => ({...prev, issue: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add keyword"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Research Content */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Methodology</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.methodology}
                      onChange={(e) => setFormData(prev => ({...prev, methodology: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.results}
                      onChange={(e) => setFormData(prev => ({...prev, results: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conclusions</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.conclusions}
                      onChange={(e) => setFormData(prev => ({...prev, conclusions: e.target.value}))}
                    />
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PDF URL</label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.pdf_url}
                      onChange={(e) => setFormData(prev => ({...prev, pdf_url: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Graphical Abstract URL</label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.graphical_abstract_url}
                      onChange={(e) => setFormData(prev => ({...prev, graphical_abstract_url: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Status and Access */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={formData.access_level}
                      onChange={(e) => setFormData(prev => ({...prev, access_level: e.target.value}))}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                      setSelectedPublication(null);
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  >
                    Update Publication
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedPublication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Publication Details</h2>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedPublication(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Graphical Abstract */}
                {selectedPublication.graphical_abstract_url && (
                  <div className="text-center">
                    <img
                      src={selectedPublication.graphical_abstract_url}
                      alt={selectedPublication.title}
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )}

                {/* Title and Status */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{selectedPublication.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedPublication.status === 'published' ? 'bg-green-100 text-green-800' :
                      selectedPublication.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedPublication.status?.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-lg text-gray-700 leading-relaxed">{selectedPublication.abstract}</p>
                </div>

                {/* Authors */}
                {selectedPublication.authors && selectedPublication.authors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Authors</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPublication.authors.map((author, index) => (
                        <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                          {author}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Publication Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Publication Information</h3>
                    <div className="space-y-2 text-sm">
                      {selectedPublication.journal_name && (
                        <p><span className="font-medium">Journal:</span> {selectedPublication.journal_name}</p>
                      )}
                      {selectedPublication.venue && (
                        <p><span className="font-medium">Venue:</span> {selectedPublication.venue}</p>
                      )}
                      {selectedPublication.year && (
                        <p><span className="font-medium">Year:</span> {selectedPublication.year}</p>
                      )}
                      {selectedPublication.doi && (
                        <p><span className="font-medium">DOI:</span> {selectedPublication.doi}</p>
                      )}
                      {selectedPublication.publisher && (
                        <p><span className="font-medium">Publisher:</span> {selectedPublication.publisher}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Metrics</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Citations:</span> {selectedPublication.citations || 0}</p>
                      <p><span className="font-medium">Impact Factor:</span> {selectedPublication.impact || 'N/A'}</p>
                      {selectedPublication.pages && (
                        <p><span className="font-medium">Pages:</span> {selectedPublication.pages}</p>
                      )}
                      {selectedPublication.volume && (
                        <p><span className="font-medium">Volume:</span> {selectedPublication.volume}</p>
                      )}
                      {selectedPublication.issue && (
                        <p><span className="font-medium">Issue:</span> {selectedPublication.issue}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                {selectedPublication.keywords && selectedPublication.keywords.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPublication.keywords.map((keyword, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Research Content */}
                {(selectedPublication.methodology || selectedPublication.results || selectedPublication.conclusions) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Research Content</h3>
                    
                    {selectedPublication.methodology && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Methodology</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{selectedPublication.methodology}</p>
                      </div>
                    )}
                    
                    {selectedPublication.results && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Results</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{selectedPublication.results}</p>
                      </div>
                    )}
                    
                    {selectedPublication.conclusions && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Conclusions</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{selectedPublication.conclusions}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Links */}
                {selectedPublication.pdf_url && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Links</h3>
                    <a
                      href={selectedPublication.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Assignment Modal */}
        {showCategoryModal && selectedPublication && (
          <CategoryAssignmentModal
            categories={categories}
            selectedPublication={selectedPublication}
            onAssign={handleAssignCategories}
            onClose={() => setShowCategoryModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Category Assignment Modal Component
function CategoryAssignmentModal({ categories, selectedPublication, onAssign, onClose }) {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign(selectedCategories);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Assign Categories</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {selectedPublication.title}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-gray-900">{category.name}</span>
                {category.description && (
                  <span className="text-sm text-gray-500">- {category.description}</span>
                )}
              </label>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Assign Categories
            </button>
          </div>
        </form>
      </div>
    </div>
        </div>
      </div>
    </div>
  );
}