"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState([]);
  const [loadingContributors, setLoadingContributors] = useState(false);

  // Fetch project detail from API
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/public/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProject();
    }
  }, [id, router]);

  // Fetch contributors when Contributors tab is active
  useEffect(() => {
    const fetchContributors = async () => {
      if (activeTab === 'contributors' && id && contributors.length === 0) {
        setLoadingContributors(true);
        try {
          const response = await fetch(`/api/contributors/project/${id}/contributors`);
          if (response.ok) {
            const data = await response.json();
            setContributors(data.data || []);
          }
        } catch (error) {
          console.error('Error fetching contributors:', error);
          setContributors([]);
        } finally {
          setLoadingContributors(false);
        }
      }
    };
    
    fetchContributors();
  }, [activeTab, id, contributors.length]);

  // Helper functions for status and complexity colors
  const getStatusColor = (status) => {
    const colors = {
      published: 'bg-green-100 text-green-800 border-green-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      archived: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status?.toLowerCase()] || 'bg-green-100 text-green-800 border-green-200';
  };

  const getComplexityColor = (complexity) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors[complexity?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Project Not Found</h2>
            <button
              onClick={() => router.push('/projects')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-amber-200">
              <button
                onClick={() => router.push('/')}
                className="hover:text-white transition-colors duration-300"
              >
                Home
              </button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button
                onClick={() => router.push('/projects')}
                className="hover:text-white transition-colors duration-300"
              >
                Projects
              </button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white">{project.title}</span>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Project Header */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Project Thumbnail */}
              <div className="lg:w-1/3">
                <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl">
                  {project.thumbnail_url ? (
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500"
                    style={{ display: project.thumbnail_url ? 'none' : 'flex' }}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-6xl font-bold opacity-50">
                        #{String(project.id).slice(0, 3)}
                      </div>
                    </div>
                    {/* Floating Particles */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-8 right-12 w-3 h-3 bg-white rounded-full animate-bounce"></div>
                      <div className="absolute top-20 right-24 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="absolute top-12 right-8 w-2.5 h-2.5 bg-white rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="lg:w-2/3">
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`px-4 py-2 text-sm font-medium rounded-full ${getComplexityColor(project.complexity)}`}>
                    {project.complexity}
                  </span>
                  <span className={`px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white border border-white/20`}>
                    {project.access_level}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                  {project.title}
                </h1>

                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  {project.description}
                </p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm border border-white/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Start Date */}
                {project.start_at && (
                  <p className="text-sm text-amber-200">
                    Started: {new Date(project.start_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          {/* Tabs */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-4 border-b-2 border-gray-200">
              {["overview", "technologies", "demo", "contributors"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                    activeTab === tab
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-gray-600 hover:text-amber-600"
                  }`}
                >
                  {tab === "demo" ? "Demo Project" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {project.full_description && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Overview</h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-8">{project.full_description}</p>
                  </div>
                )}

                {project.challenges && project.challenges.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Challenges</h3>
                    <ul className="space-y-3">
                      {project.challenges.map((challenge, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold mt-1">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 flex-1">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.achievements && project.achievements.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Achievements</h3>
                    <ul className="space-y-3">
                      {project.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <svg className="flex-shrink-0 w-6 h-6 text-green-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700 flex-1">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.future_work && project.future_work.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Future Work</h3>
                    <ul className="space-y-3">
                      {project.future_work.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <svg className="flex-shrink-0 w-6 h-6 text-blue-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span className="text-gray-700 flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Technologies Tab */}
            {activeTab === "technologies" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Technologies Used</h2>
                  <p className="text-lg text-gray-700 mb-8">
                    This project leverages cutting-edge technologies and frameworks to deliver exceptional results.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {(project.technologies || []).map((tech, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{tech}</h3>
                          <p className="text-gray-600">
                            Essential technology for implementing advanced features and ensuring optimal performance.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Tab */}
            {activeTab === "demo" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Demo</h2>
                  <p className="text-lg text-gray-700 mb-8">
                    Experience the project in action through our live demo or prototype.
                  </p>
                </div>

                {project.demo_url && Array.isArray(project.demo_url) && project.demo_url.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {project.demo_url.length} Demo Link{project.demo_url.length > 1 ? 's' : ''} Available
                          </h3>
                          <p className="text-sm text-gray-600">Click any link below to access the demos</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {project.demo_url.map((url, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:from-amber-500 group-hover:to-orange-500 transition-all duration-300">
                                <span className="text-amber-600 group-hover:text-white font-bold text-lg">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Demo {index + 1}
                              </h4>
                              <p className="text-xs text-gray-500 mb-3 truncate" title={url}>
                                {url}
                              </p>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open Demo
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Demo Not Available</h3>
                    <p className="text-gray-500">No demo link has been provided for this project yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contributors Tab */}
            {activeTab === "contributors" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Contributors</h2>
                  <p className="text-lg text-gray-700 mb-8">
                    Meet the talented team members who contributed to this project.
                  </p>
                </div>

                {loadingContributors ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading contributors...</p>
                  </div>
                ) : contributors.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {contributors.map((contributor, index) => (
                      <div
                        key={`${contributor.id}-${index}`}
                        className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          {/* Profile Image */}
                          <div className="flex-shrink-0">
                            {contributor.profile_image ? (
                              <img
                                src={contributor.profile_image}
                                alt={contributor.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-amber-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl font-bold"
                              style={{ display: contributor.profile_image ? 'none' : 'flex' }}
                            >
                              {contributor.name.charAt(0).toUpperCase()}
                            </div>
                          </div>

                          {/* Contributor Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{contributor.name}</h3>
                            <p className="text-sm text-amber-600 font-semibold mb-2">{contributor.role_in_project}</p>
                            <p className="text-sm text-gray-600 mb-1">{contributor.role}</p>
                            {contributor.bio && (
                              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{contributor.bio}</p>
                            )}

                            {/* Social Links */}
                            <div className="flex flex-wrap gap-2">
                              {contributor.github_url && (
                                <a
                                  href={contributor.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                  </svg>
                                  GitHub
                                </a>
                              )}
                              {contributor.linkedin_url && (
                                <a
                                  href={contributor.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                  </svg>
                                  LinkedIn
                                </a>
                              )}
                              {contributor.website_url && (
                                <a
                                  href={contributor.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs rounded-full transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                  </svg>
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Contributors Found</h3>
                    <p className="text-gray-500">No contributors have been assigned to this project yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Interested in This Project?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Learn more about our work or collaborate with us on similar projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/contact')}
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                Contact Us
              </button>
              <button
                onClick={() => router.push('/projects')}
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                View All Projects
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
