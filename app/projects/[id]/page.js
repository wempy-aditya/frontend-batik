"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch project detail from API
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/public/${projectId}`);
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
    
    if (projectId) {
      fetchProject();
    }
  }, [projectId, router]);

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
              {["overview", "technologies"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                    activeTab === tab
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-gray-600 hover:text-amber-600"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
