'use client';
import { useAuth } from '../../../components/AuthProvider';
import { useState, useEffect } from 'react';

export default function PublicationsPage() {
  const { getUserInfo } = useAuth();
  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    abstract: '',
    authors: [],
    publication_date: '',
    journal_name: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    keywords: [],
    access_level: 'public',
    status: 'draft',
    file_url: ''
  });
  const [authorInput, setAuthorInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchPublications();
    fetchCategories();
  }, []);

  const fetchPublications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/publications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPublications(data.data?.data || []);
      } else {
        throw new Error('Failed to fetch publications');
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
      setError('Failed to load publications');
      // Use mock data for now
      setPublications([
        {
          id: 1,
          title: "Deep Learning Approaches for Batik Pattern Recognition",
          slug: "deep-learning-batik-pattern-recognition",
          abstract: "This research explores the application of deep learning techniques in recognizing and classifying traditional batik patterns...",
          authors: ["Dr. Ahmad Rahman", "Prof. Siti Nurhaliza"],
          publication_date: "2024-03-15",
          journal_name: "Journal of Cultural Heritage Computing",
          volume: "12",
          issue: "3",
          pages: "245-260",
          doi: "10.1234/jchc.2024.03.15",
          keywords: ["batik", "deep learning", "pattern recognition", "cultural heritage"],
          access_level: "public",
          status: "published",
          file_url: "https://example.com/paper1.pdf",
          created_at: "2024-03-01T00:00:00Z"
        },
        {
          id: 2,
          title: "Preserving Traditional Batik Through Digital Documentation",
          slug: "preserving-batik-digital-documentation",
          abstract: "A comprehensive study on digitizing traditional batik motifs for cultural preservation and education...",
          authors: ["Dr. Maya Sari"],
          publication_date: "2024-02-20",
          journal_name: "Digital Heritage Quarterly",
          volume: "8",
          issue: "1",
          pages: "12-25",
          doi: "10.5678/dhq.2024.02.20",
          keywords: ["digital preservation", "batik", "cultural documentation"],
          access_level: "public",
          status: "published",
          file_url: "https://example.com/paper2.pdf",
          created_at: "2024-02-01T00:00:00Z"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/categories?type=publication', {
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
      const url = modalMode === 'edit' ? `/api/publications/${selectedPublication.id}` : '/api/publications';
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
        await fetchPublications();
        setIsModalOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save publication');
      }
    } catch (error) {
      console.error('Error saving publication:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (publicationId) => {
    if (!confirm('Are you sure you want to delete this publication?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`/api/publications/${publicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchPublications();
      } else {
        throw new Error('Failed to delete publication');
      }
    } catch (error) {
      console.error('Error deleting publication:', error);
      setError('Failed to delete publication');
    }
  };

  const handleAssignCategories = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`/api/publications/${selectedPublication.id}/categories`, {
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

  const openModal = (mode, publication = null) => {
    setModalMode(mode);
    setSelectedPublication(publication);
    setError('');
    
    if (mode === 'create') {
      resetForm();
    } else if (publication) {
      setFormData({
        title: publication.title,
        slug: publication.slug,
        abstract: publication.abstract || '',
        authors: publication.authors || [],
        publication_date: publication.publication_date || '',
        journal_name: publication.journal_name || '',
        volume: publication.volume || '',
        issue: publication.issue || '',
        pages: publication.pages || '',
        doi: publication.doi || '',
        keywords: publication.keywords || [],
        access_level: publication.access_level || 'public',
        status: publication.status || 'draft',
        file_url: publication.file_url || ''
      });
    }
    
    setIsModalOpen(true);
  };

  const openCategoryModal = (publication) => {
    setSelectedPublication(publication);
    setSelectedCategories([]);
    setIsCategoryModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      abstract: '',
      authors: [],
      publication_date: '',
      journal_name: '',
      volume: '',
      issue: '',
      pages: '',
      doi: '',
      keywords: [],
      access_level: 'public',
      status: 'draft',
      file_url: ''
    });
    setAuthorInput('');
    setKeywordInput('');
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

  const handleAddAuthor = () => {
    if (authorInput.trim() && !formData.authors.includes(authorInput.trim())) {
      setFormData({
        ...formData,
        authors: [...formData.authors, authorInput.trim()]
      });
      setAuthorInput('');
    }
  };

  const handleRemoveAuthor = (authorToRemove) => {
    setFormData({
      ...formData,
      authors: formData.authors.filter(author => author !== authorToRemove)
    });
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(keyword => keyword !== keywordToRemove)
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
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <svg className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-amber-700 font-semibold">Loading Publications...</p>
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
            onClick={() => openModal('create')}
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Publications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {publications.map((publication) => (
            <div
              key={publication.id}
              className="bg-white/95 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{publication.title}</h3>
                    <p className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mb-2 font-mono">
                      {publication.slug}
                    </p>
                    <div className="text-sm text-gray-600 mb-2">
                      <p className="font-semibold">{publication.journal_name}</p>
                      {publication.volume && publication.issue && (
                        <p>Vol. {publication.volume}, Issue {publication.issue}</p>
                      )}
                      {publication.pages && <p>Pages: {publication.pages}</p>}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(publication.status)}`}>
                      {publication.status}
                    </span>
                  </div>
                </div>

                {/* Authors */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Authors:</p>
                  <div className="flex flex-wrap gap-1">
                    {publication.authors?.slice(0, 2).map((author, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                        {author}
                      </span>
                    ))}
                    {publication.authors?.length > 2 && (
                      <span className="text-xs text-gray-500">+{publication.authors.length - 2} more</span>
                    )}
                  </div>
                </div>

                {/* Keywords */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {publication.keywords?.slice(0, 3).map((keyword, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                        {keyword}
                      </span>
                    ))}
                    {publication.keywords?.length > 3 && (
                      <span className="text-xs text-gray-500">+{publication.keywords.length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>Published: {new Date(publication.publication_date).toLocaleDateString()}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {publication.access_level}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('view', publication)}
                    className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                    title="View Details"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openModal('edit', publication)}
                    className="flex-1 p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-sm"
                    title="Edit Publication"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openCategoryModal(publication)}
                    className="flex-1 p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm"
                    title="Assign Categories"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a1 1 0 01-1-1V3a1 1 0 011-1z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(publication.id)}
                    className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    title="Delete Publication"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {publications.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Publications Found</h3>
              <p className="text-gray-600 mb-4">Start by creating your first publication</p>
              <button
                onClick={() => openModal('create')}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Create First Publication
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Publication Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' && 'Create New Publication'}
                  {modalMode === 'edit' && 'Edit Publication'}
                  {modalMode === 'view' && 'Publication Details'}
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
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedPublication?.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900 font-mono">{selectedPublication?.slug}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Journal</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedPublication?.journal_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Publication Date</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedPublication?.publication_date}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Volume & Issue</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">
                        Vol. {selectedPublication?.volume}, Issue {selectedPublication?.issue}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pages</label>
                      <p className="p-3 bg-gray-50 rounded-xl text-gray-900">{selectedPublication?.pages}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">DOI</label>
                    <p className="p-3 bg-gray-50 rounded-xl text-gray-900 font-mono">{selectedPublication?.doi}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Authors</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPublication?.authors?.map((author, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {author}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Keywords</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPublication?.keywords?.map((keyword, index) => (
                        <span key={index} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Abstract</label>
                    <div className="p-4 bg-gray-50 rounded-xl max-h-64 overflow-y-auto">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedPublication?.abstract}</p>
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
                        placeholder="Enter publication title"
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
                        placeholder="publication-slug"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Journal Name *
                      </label>
                      <input
                        type="text"
                        value={formData.journal_name}
                        onChange={(e) => setFormData({ ...formData, journal_name: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Journal name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Publication Date
                      </label>
                      <input
                        type="date"
                        value={formData.publication_date}
                        onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Volume
                      </label>
                      <input
                        type="text"
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Issue
                      </label>
                      <input
                        type="text"
                        value={formData.issue}
                        onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pages
                      </label>
                      <input
                        type="text"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="245-260"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      DOI
                    </label>
                    <input
                      type="text"
                      value={formData.doi}
                      onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors font-mono"
                      placeholder="10.1234/journal.2024.01.01"
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
                      placeholder="https://example.com/paper.pdf"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Abstract *
                    </label>
                    <textarea
                      value={formData.abstract}
                      onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors resize-none"
                      placeholder="Enter publication abstract..."
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Authors
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={authorInput}
                        onChange={(e) => setAuthorInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAuthor())}
                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter author name and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddAuthor}
                        className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.authors.map((author, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {author}
                          <button
                            type="button"
                            onClick={() => handleRemoveAuthor(author)}
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
                      Keywords
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter keyword and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword, index) => (
                        <span key={index} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
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