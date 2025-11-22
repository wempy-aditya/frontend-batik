"use client";
import { useState } from 'react';

export default function PublicationsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [hoveredPaper, setHoveredPaper] = useState(null);

  const categories = [
    { id: 'all', name: 'All Publications', count: 25 },
    { id: 'conference', name: 'Conference Papers', count: 15 },
    { id: 'journal', name: 'Journal Articles', count: 8 },
    { id: 'survey', name: 'Survey Papers', count: 2 }
  ];

  const years = [
    { id: 'all', name: 'All Years', count: 25 },
    { id: '2024', name: '2024', count: 8 },
    { id: '2023', name: '2023', count: 12 },
    { id: '2022', name: '2022', count: 5 }
  ];

  const publications = [
    {
      id: 1,
      title: "Attention-Based Neural Networks for Image Classification: A Comprehensive Survey",
      abstract: "This paper presents a comprehensive survey of attention mechanisms in neural networks for image classification tasks. We analyze various attention architectures, including spatial attention, channel attention, and self-attention mechanisms, providing insights into their effectiveness across different datasets and computational requirements.",
      authors: ["Dr. Sarah Chen", "Prof. Michael Rodriguez", "Dr. Elena Kovač"],
      venue: "IEEE Transactions on Pattern Analysis and Machine Intelligence",
      year: 2024,
      citations: 127,
      category: "survey",
      doi: "10.1109/TPAMI.2024.3156789",
      keywords: ["Attention Mechanisms", "Deep Learning", "Image Classification", "Neural Networks"],
      status: "Published",
      impact: "High",
      pdfSize: "2.4 MB"
    },
    {
      id: 2,
      title: "Generative Adversarial Networks for High-Resolution Image Synthesis: Recent Advances",
      abstract: "We explore recent developments in generative adversarial networks (GANs) for creating high-resolution, photorealistic images. Our work introduces a novel progressive training strategy that significantly improves training stability and output quality while reducing computational costs by 40%.",
      authors: ["Dr. James Park", "Dr. Lisa Wang", "Prof. David Thompson"],
      venue: "Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)",
      year: 2024,
      citations: 89,
      category: "conference",
      doi: "10.1109/CVPR.2024.00892",
      keywords: ["GANs", "Image Synthesis", "Deep Learning", "Computer Vision"],
      status: "Published",
      impact: "High",
      pdfSize: "3.1 MB"
    },
    {
      id: 3,
      title: "Real-Time Object Detection in Autonomous Vehicles Using Optimized YOLO Architecture",
      abstract: "This paper introduces YOLOv5-AV, an optimized version of YOLO specifically designed for autonomous vehicle applications. Our approach achieves 94% mAP on the KITTI dataset while maintaining real-time inference speeds of 45 FPS on edge devices.",
      authors: ["Dr. Maria Santos", "Dr. Kevin Liu", "Prof. Ahmed Hassan"],
      venue: "International Conference on Robotics and Automation (ICRA)",
      year: 2024,
      citations: 156,
      category: "conference",
      doi: "10.1109/ICRA.2024.9561234",
      keywords: ["Object Detection", "YOLO", "Autonomous Vehicles", "Real-time Processing"],
      status: "Published",
      impact: "High",
      pdfSize: "4.2 MB"
    },
    {
      id: 4,
      title: "Transformer-Based Architecture for Medical Image Segmentation",
      abstract: "We propose MedViT, a transformer-based architecture specifically designed for medical image segmentation tasks. Our model achieves state-of-the-art performance on multiple medical imaging benchmarks including brain MRI, cardiac CT, and lung X-ray segmentation.",
      authors: ["Dr. Rachel Green", "Dr. Hiroshi Tanaka", "Prof. Isabella Cruz"],
      venue: "Medical Image Analysis Journal",
      year: 2024,
      citations: 78,
      category: "journal",
      doi: "10.1016/j.media.2024.102567",
      keywords: ["Medical Imaging", "Transformers", "Segmentation", "Healthcare AI"],
      status: "Published",
      impact: "Medium",
      pdfSize: "5.7 MB"
    },
    {
      id: 5,
      title: "Federated Learning for Privacy-Preserving Computer Vision",
      abstract: "This work presents a novel federated learning framework for training computer vision models across distributed datasets while preserving privacy. We demonstrate significant improvements in model accuracy while reducing communication overhead by 60%.",
      authors: ["Dr. Alex Kumar", "Dr. Sophie Martin", "Prof. Chen Wei"],
      venue: "Advances in Neural Information Processing Systems (NeurIPS)",
      year: 2023,
      citations: 203,
      category: "conference",
      doi: "10.5555/nips.2023.0456",
      keywords: ["Federated Learning", "Privacy", "Distributed Systems", "Computer Vision"],
      status: "Published",
      impact: "High",
      pdfSize: "3.8 MB"
    },
    {
      id: 6,
      title: "Self-Supervised Learning for Visual Representation: A Comprehensive Study",
      abstract: "We conduct a comprehensive empirical study of self-supervised learning methods for visual representation learning. Our analysis covers over 15 different approaches and evaluates their performance across multiple downstream tasks.",
      authors: ["Dr. Emma Johnson", "Dr. Roberto Silva", "Prof. Yuki Yamamoto"],
      venue: "International Journal of Computer Vision",
      year: 2023,
      citations: 301,
      category: "journal",
      doi: "10.1007/s11263-023-01789-2",
      keywords: ["Self-Supervised Learning", "Representation Learning", "Computer Vision", "Deep Learning"],
      status: "Published",
      impact: "High",
      pdfSize: "6.3 MB"
    },
    {
      id: 7,
      title: "Neural Style Transfer: From Art to Practical Applications",
      abstract: "This survey explores the evolution of neural style transfer from artistic applications to practical use cases in photography, video processing, and augmented reality. We provide a comprehensive taxonomy of existing methods and identify future research directions.",
      authors: ["Dr. Lucas Brown", "Dr. Priya Sharma", "Prof. Oliver Kim"],
      venue: "ACM Computing Surveys",
      year: 2023,
      citations: 145,
      category: "survey",
      doi: "10.1145/3579832",
      keywords: ["Style Transfer", "Deep Learning", "Computer Graphics", "Visual Arts"],
      status: "Published",
      impact: "Medium",
      pdfSize: "4.9 MB"
    },
    {
      id: 8,
      title: "Efficient 3D Object Detection for Mobile Robotics Applications",
      abstract: "We present LiDAR-Net, a lightweight neural network architecture for 3D object detection optimized for mobile robotics. Our approach achieves comparable accuracy to state-of-the-art methods while reducing computational requirements by 75%.",
      authors: ["Dr. Mark Davis", "Dr. Nina Petrov", "Prof. Jean Dubois"],
      venue: "IEEE Robotics and Automation Letters",
      year: 2023,
      citations: 92,
      category: "journal",
      doi: "10.1109/LRA.2023.3267890",
      keywords: ["3D Object Detection", "Mobile Robotics", "LiDAR", "Edge Computing"],
      status: "Published",
      impact: "Medium",
      pdfSize: "3.5 MB"
    },
    {
      id: 9,
      title: "Vision Transformers for Satellite Image Analysis: A Comparative Study",
      abstract: "This paper provides a comprehensive comparison of various Vision Transformer architectures for satellite image analysis tasks including land use classification, change detection, and object counting. We evaluate performance across multiple satellite imaging datasets.",
      authors: ["Dr. Anna Kowalski", "Dr. Mohammed Al-Rashid", "Prof. Laura Garcia"],
      venue: "Remote Sensing of Environment",
      year: 2023,
      citations: 67,
      category: "journal",
      doi: "10.1016/j.rse.2023.113456",
      keywords: ["Vision Transformers", "Satellite Imagery", "Remote Sensing", "Earth Observation"],
      status: "Published",
      impact: "Medium",
      pdfSize: "7.1 MB"
    },
    {
      id: 10,
      title: "Adversarial Robustness in Deep Learning: Challenges and Solutions",
      abstract: "We investigate the vulnerability of deep learning models to adversarial attacks and propose a novel training methodology that improves robustness while maintaining model accuracy. Our approach is evaluated across multiple domains including image classification and natural language processing.",
      authors: ["Dr. Thomas Anderson", "Dr. Fatima Al-Zahra", "Prof. Dimitri Volkov"],
      venue: "International Conference on Machine Learning (ICML)",
      year: 2023,
      citations: 178,
      category: "conference",
      doi: "10.5555/icml.2023.1234",
      keywords: ["Adversarial Robustness", "Security", "Deep Learning", "Machine Learning"],
      status: "Published",
      impact: "High",
      pdfSize: "4.6 MB"
    },
    {
      id: 11,
      title: "Graph Neural Networks for Social Media Analysis: A Survey",
      abstract: "This survey provides a comprehensive overview of graph neural network applications in social media analysis. We cover user behavior prediction, influence analysis, fake news detection, and community detection, highlighting current challenges and future research directions.",
      authors: ["Dr. Jennifer Lee", "Dr. Carlos Mendez", "Prof. Raj Patel"],
      venue: "ACM Transactions on Social Computing",
      year: 2022,
      citations: 234,
      category: "survey",
      doi: "10.1145/3512345",
      keywords: ["Graph Neural Networks", "Social Media", "Network Analysis", "Social Computing"],
      status: "Published",
      impact: "High",
      pdfSize: "5.2 MB"
    },
    {
      id: 12,
      title: "Quantum Machine Learning for Image Recognition: First Steps",
      abstract: "We explore the application of quantum machine learning algorithms to image recognition tasks. Our hybrid classical-quantum approach shows promising results on small-scale datasets and provides insights into the potential of quantum computing for computer vision.",
      authors: ["Dr. Peter Wu", "Dr. Sarah O'Connor", "Prof. Giovanni Rossi"],
      venue: "Quantum Information Processing",
      year: 2022,
      citations: 89,
      category: "journal",
      doi: "10.1007/s11128-022-03567-8",
      keywords: ["Quantum Computing", "Machine Learning", "Image Recognition", "Quantum Algorithms"],
      status: "Published",
      impact: "Low",
      pdfSize: "2.8 MB"
    }
  ];

  const filteredPublications = publications.filter(paper => {
    const categoryMatch = selectedCategory === 'all' || paper.category === selectedCategory;
    const yearMatch = selectedYear === 'all' || paper.year.toString() === selectedYear;
    return categoryMatch && yearMatch;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'conference': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'journal': return 'bg-green-100 text-green-800 border-green-200';
      case 'survey': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50">
      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3Cpath d='M10 0v20'/%3E%3Cpath d='M0 10h20'/%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="mb-8">
            <div 
              onClick={() => window.location.href = '/'}
              className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-semibold text-gray-200">Complete Research Portfolio</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Research Publications
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Explore our comprehensive collection of research publications advancing the frontiers of 
              artificial intelligence, computer vision, and machine learning.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">25+</div>
                <div className="text-sm text-gray-400">Publications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">1.2K</div>
                <div className="text-sm text-gray-400">Citations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">15</div>
                <div className="text-sm text-gray-400">Conferences</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">8</div>
                <div className="text-sm text-gray-400">Journals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Publications Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-12 space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Filter by Type</h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {category.name}
                    <span className="ml-2 text-sm opacity-75">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Filter by Year</h3>
              <div className="flex flex-wrap gap-3">
                {years.map((year) => (
                  <button
                    key={year.id}
                    onClick={() => setSelectedYear(year.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
                      selectedYear === year.id
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {year.name}
                    <span className="ml-2 text-sm opacity-75">({year.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredPublications.length}</span> publications
            </p>
          </div>

          {/* Publications List */}
          <div className="space-y-6">
            {filteredPublications.map((paper) => (
              <div
                key={paper.id}
                className="group relative"
                onMouseEnter={() => setHoveredPaper(paper.id)}
                onMouseLeave={() => setHoveredPaper(null)}
              >
                {/* Publication Card */}
                <div className={`relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 transition-all duration-500 transform hover:-translate-y-1 ${
                  hoveredPaper === paper.id ? 'shadow-2xl scale-[1.02]' : ''
                }`}>
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(paper.category)}`}>
                          {paper.category === 'conference' ? 'Conference Paper' : 
                           paper.category === 'journal' ? 'Journal Article' : 'Survey Paper'}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getImpactColor(paper.impact)}`}>
                          {paper.impact} Impact
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{paper.citations}</div>
                      <div className="text-sm text-gray-500">Citations</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                        {paper.title}
                      </h3>

                      {/* Abstract */}
                      <p className="text-gray-600 leading-relaxed">
                        {paper.abstract}
                      </p>

                      {/* Authors */}
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">Authors:</div>
                        <div className="flex flex-wrap gap-2">
                          {paper.authors.map((author, index) => (
                            <span
                              key={index}
                              className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
                            >
                              {author}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Keywords */}
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">Keywords:</div>
                        <div className="flex flex-wrap gap-2">
                          {paper.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      {/* Publication Info */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-700">Published in:</div>
                          <div className="text-sm text-gray-600 font-medium">{paper.venue}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-700">Year:</div>
                          <div className="text-sm text-gray-600">{paper.year}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-700">DOI:</div>
                          <div className="text-xs text-gray-500 font-mono break-all">{paper.doi}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-700">PDF Size:</div>
                          <div className="text-sm text-gray-600">{paper.pdfSize}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-3">
                        <button 
                          onClick={() => window.location.href = `/publications/${paper.id}/pdf`}
                          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download PDF</span>
                          </div>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => window.location.href = `/publications/${paper.id}`}
                            className="py-2 px-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => window.location.href = `/publications/${paper.id}/cite`}
                            className="py-2 px-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                          >
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            Cite
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Publication ID */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 text-sm font-bold rounded-full flex items-center justify-center">
                    {paper.id}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Want to Collaborate?
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  Join our research team and contribute to cutting-edge advances in AI and computer vision.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => window.location.href = '/research/collaborate'}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    Research Collaboration
                  </button>
                  <button 
                    onClick={() => window.location.href = '/contact'}
                    className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
