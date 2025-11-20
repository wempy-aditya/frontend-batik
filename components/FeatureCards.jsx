"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FeatureCards = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const router = useRouter();

  const features = [
    {
      id: 1,
      title: "Image Retrieval",
      description: "Find similar images instantly using advanced computer vision algorithms and deep learning models.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/10 to-orange-500/10"
    },
    {
      id: 2,
      title: "Image Classification",
      description: "AI-powered scene understanding with state-of-the-art neural networks for accurate categorization.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/10 to-red-500/10"
    },
    {
      id: 3,
      title: "Generative AI",
      description: "Create new visuals from your prompts using cutting-edge diffusion models and neural networks.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      gradient: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-500/10 to-amber-500/10"
    },
    {
      id: 4,
      title: "Model Zoo & Research",
      description: "Explore benchmarks, experiments, and research papers from the latest in computer vision.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: "from-amber-600 to-orange-600",
      bgGradient: "from-amber-600/10 to-orange-600/10"
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.3'%3E%3Cpath d='M0 0h40v40H0zm40 40h40v40H40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full text-sm font-medium text-amber-700 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Powerful AI Features
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Advanced
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              AI Capabilities
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Unlock the full potential of artificial intelligence with our comprehensive suite of 
            image processing tools designed for researchers, developers, and creators.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group relative"
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Main Card */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-6 hover:scale-105 h-full">
                
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                
                {/* Animated Border Glow */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-30 blur-sm transition-all duration-700 scale-105`}></div>
                
                {/* Content */}
                <div className="relative z-10 space-y-6">
                  {/* Icon Container */}
                  <div className="relative">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-700`}>
                      {feature.icon}
                    </div>
                    {/* Icon Glow Effect */}
                    <div className={`absolute inset-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-700`}></div>
                    
                    {/* Simple Floating Particles */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-700">
                      <div className={`w-3 h-3 bg-gradient-to-r ${feature.gradient} rounded-full animate-bounce`}></div>
                    </div>
                    <div className="absolute -bottom-1 -left-1 opacity-0 group-hover:opacity-100 transition-all duration-700">
                      <div className={`w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full animate-pulse`}></div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-500">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center">
                      <span className={`text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent transition-all duration-500 group-hover:translate-x-1`}>
                        Learn More
                      </span>
                      <svg className="w-4 h-4 ml-2 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Feature Number */}
                    <div className={`w-8 h-8 bg-gradient-to-r ${feature.gradient} text-white text-sm font-bold rounded-full flex items-center justify-center opacity-20 group-hover:opacity-100 transition-all duration-500`}>
                      {feature.id}
                    </div>
                  </div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-700 transform rotate-12 group-hover:rotate-0">
                  <div className={`w-3 h-3 bg-gradient-to-r ${feature.gradient} rounded-full`}></div>
                </div>

                {/* Bottom Highlight Line */}
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-32 h-1 bg-gradient-to-r ${feature.gradient} rounded-full transition-all duration-700`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center relative z-50 mt-10">
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'orange', 
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'inline-block',
            color: 'white',
            fontWeight: 'bold'
          }}
          onClick={() => {
            alert('Test button clicked!');
            window.location.href = '/features';
          }}>
            Click Me - Explore All Features
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
