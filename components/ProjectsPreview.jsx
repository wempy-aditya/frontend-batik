"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ProjectsPreview = () => {
  const [hoveredProject, setHoveredProject] = useState(null);
  const router = useRouter();

  const projects = [
    {
      id: 1,
      title: "Neural Style Transfer",
      description: "Transform artistic styles using advanced neural networks. Create stunning artwork by combining content and style images through deep learning algorithms.",
      technologies: ["TensorFlow", "VGG-19", "Neural Networks", "Style Transfer"],
      thumbnail: "from-amber-500 to-orange-500",
      category: "Generative AI",
      status: "Active"
    },
    {
      id: 2,
      title: "Object Detection & Segmentation",
      description: "Real-time object detection and instance segmentation using YOLO and Mask R-CNN architectures for precise image analysis.",
      technologies: ["YOLO", "Mask R-CNN", "OpenCV", "PyTorch"],
      thumbnail: "from-orange-500 to-red-500",
      category: "Computer Vision",
      status: "Completed"
    },
    {
      id: 3,
      title: "Image Super-Resolution",
      description: "Enhance image quality and resolution using ESRGAN and SRCNN models. Upscale images while preserving fine details and textures.",
      technologies: ["ESRGAN", "SRCNN", "GANs", "Image Enhancement"],
      thumbnail: "from-yellow-500 to-amber-500",
      category: "Enhancement",
      status: "Beta"
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}
        ></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-sm font-semibold text-amber-200">Featured Projects</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
              Innovative
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              AI Projects
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Discover our cutting-edge research and development projects showcasing 
            the latest advances in computer vision and machine learning.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-3 gap-10">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="group relative"
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              {/* Project Card */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-700 transform hover:-translate-y-8 hover:scale-105 group">
                
                {/* Glowing Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${project.thumbnail} rounded-3xl opacity-0 group-hover:opacity-30 blur-sm transition-all duration-700 scale-105`}></div>
                
                {/* Thumbnail/Hero Image */}
                <div className="relative h-64 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.thumbnail} transition-all duration-700 group-hover:scale-110`}>
                    {/* Animated Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                  </div>
                  
                  {/* Simple Overlay */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-4 right-8 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="absolute top-12 right-16 w-1 h-1 bg-white rounded-full animate-bounce"></div>
                    <div className="absolute top-8 right-4 w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-6 left-6">
                    <span className={`px-4 py-2 text-sm font-bold rounded-full text-white backdrop-blur-md border border-white/30 shadow-lg ${
                      project.status === 'Active' ? 'bg-green-500/70' :
                      project.status === 'Completed' ? 'bg-blue-500/70' :
                      'bg-orange-500/70'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-6 right-6">
                    <span className="px-4 py-2 text-sm font-medium text-white bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                      {project.category}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-200 transition-colors duration-500">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-8 group-hover:text-gray-200 transition-colors duration-500">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 text-xs font-semibold text-amber-200 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => window.location.href = `/projects/${project.id}`}
                    className={`w-full py-4 px-6 bg-gradient-to-r ${project.thumbnail} text-white font-bold rounded-2xl transition-all duration-300 hover:opacity-90 cursor-pointer`}
                    style={{ 
                      zIndex: 9999,
                      position: 'relative',
                      pointerEvents: 'auto'
                    }}
                  >
                    <span className="flex items-center justify-center gap-3">
                      <span>Explore Project</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-700">
                  <div className={`w-4 h-4 bg-gradient-to-r ${project.thumbnail} rounded-full animate-pulse`}></div>
                </div>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200">
                  <div className={`w-2 h-2 bg-gradient-to-r ${project.thumbnail} rounded-full animate-bounce`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center mt-20">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = '/projects';
            }}
            onMouseOver={() => console.log('Projects button hovered')}
            className="px-12 py-6 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-2xl border border-white/20 transition-all duration-300 hover:bg-white/20 cursor-pointer"
            style={{ 
              zIndex: 9999,
              position: 'relative',
              pointerEvents: 'auto',
              border: 'none',
              outline: 'none'
            }}
          >
            <span className="flex items-center gap-3">
              View All Projects
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsPreview;
