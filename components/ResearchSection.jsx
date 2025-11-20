"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ResearchSection = () => {
  const [hoveredPaper, setHoveredPaper] = useState(null);
  const router = useRouter();

  const publications = [
    {
      id: 1,
      title: "Attention-Based Neural Networks for Image Classification: A Comprehensive Survey",
      abstract: "This paper presents a comprehensive survey of attention mechanisms in neural networks for image classification tasks. We analyze various attention architectures, including spatial attention, channel attention, and self-attention mechanisms, providing insights into their effectiveness across different datasets and computational requirements.",
      authors: ["Dr. Sarah Chen", "Prof. Michael Rodriguez", "Dr. Elena Kovač"],
      venue: "IEEE Transactions on Pattern Analysis and Machine Intelligence",
      year: 2024,
      citations: 127,
      category: "Survey Paper",
      doi: "10.1109/TPAMI.2024.3156789",
      keywords: ["Attention Mechanisms", "Deep Learning", "Image Classification", "Neural Networks"],
      status: "Published"
    },
    {
      id: 2,
      title: "Generative Adversarial Networks for High-Resolution Image Synthesis: Recent Advances",
      abstract: "We explore recent developments in generative adversarial networks (GANs) for creating high-resolution, photorealistic images. Our work introduces a novel progressive training strategy that significantly improves training stability and output quality while reducing computational costs by 40%.",
      authors: ["Dr. James Park", "Dr. Lisa Wang", "Prof. David Thompson"],
      venue: "Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)",
      year: 2024,
      citations: 89,
      category: "Conference Paper",
      doi: "10.1109/CVPR.2024.00892",
      keywords: ["GANs", "Image Synthesis", "Deep Learning", "Computer Vision"],
      status: "Published"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.5'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3Cpath d='M10 0v20'/%3E%3Cpath d='M0 10h20'/%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '20px 20px'
             }}
        ></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-slate-200 mb-6">
            <svg className="w-4 h-4 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">Research Publications</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Latest Research
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore cutting-edge research contributions advancing the field of 
            computer vision and artificial intelligence.
          </p>
        </div>

        {/* Publications Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {publications.map((paper) => (
            <div
              key={paper.id}
              className="group relative"
              onMouseEnter={() => setHoveredPaper(paper.id)}
              onMouseLeave={() => setHoveredPaper(null)}
            >
              {/* Paper Card */}
              <div className={`relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 transition-all duration-500 transform hover:-translate-y-1 ${
                hoveredPaper === paper.id ? 'shadow-2xl scale-102' : ''
              }`}>
                
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-2">
                        {paper.category}
                      </span>
                      <div className="text-sm text-gray-600">{paper.year}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{paper.citations}</div>
                    <div className="text-xs text-gray-500">Citations</div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                  {paper.title}
                </h3>

                {/* Abstract */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {paper.abstract}
                </p>

                {/* Authors */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Authors:</div>
                  <div className="flex flex-wrap gap-2">
                    {paper.authors.map((author, index) => (
                      <span
                        key={index}
                        className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full"
                      >
                        {author}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Venue */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Published in:</div>
                  <div className="text-sm text-gray-600 font-medium">{paper.venue}</div>
                </div>

                {/* Keywords */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Keywords:</div>
                  <div className="flex flex-wrap gap-2">
                    {paper.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* DOI */}
                <div className="text-xs text-gray-500 mb-6 font-mono">
                  DOI: {paper.doi}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className={`flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 transform ${
                    hoveredPaper === paper.id ? 'scale-105 shadow-lg' : 'hover:scale-105'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Read Publication</span>
                    </div>
                  </button>
                  
                  <button className="py-3 px-4 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Research Stats */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Research Impact
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">25+</div>
              <div className="text-sm text-gray-600">Publications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">1.2K</div>
              <div className="text-sm text-gray-600">Total Citations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">15</div>
              <div className="text-sm text-gray-600">Conference Papers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">10</div>
              <div className="text-sm text-gray-600">Journal Articles</div>
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button 
            onClick={() => window.location.href = '/publications'}
            className="group inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-gray-50"
          >
            <span>View All Publications</span>
            <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResearchSection;
