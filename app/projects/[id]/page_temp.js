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
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getComplexityColor = (complexity) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-blue-100 text-blue-800',
      hard: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors[complexity] || 'bg-gray-100 text-gray-800';
  };

  const getAccessColor = (access) => {
    return access === 'public' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Thumbnail */}
          {project.thumbnail_url && (
            <div className="w-full h-64 overflow-hidden">
              <img 
                src={project.thumbnail_url} 
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(project.complexity)}`}>
                {project.complexity}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccessColor(project.access_level)}`}>
                {project.access_level}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">{project.description}</p>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Start Date */}
            {project.start_at && (
              <p className="text-sm text-gray-500">
                Started: {new Date(project.start_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "overview"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("technologies")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "technologies"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Technologies
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Full Description */}
                {project.full_description && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">About This Project</h3>
                    <p className="text-gray-700 whitespace-pre-line">{project.full_description}</p>
                  </div>
                )}

                {/* Challenges */}
                {project.challenges && project.challenges.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Challenges</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {project.challenges.map((challenge, idx) => (
                        <li key={idx} className="text-gray-700">{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Achievements */}
                {project.achievements && project.achievements.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Achievements</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {project.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-gray-700">{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Future Work */}
                {project.future_work && project.future_work.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Future Work</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {project.future_work.map((item, idx) => (
                        <li key={idx} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "technologies" && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Technologies Used</h3>
                {project.technologies && project.technologies.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {project.technologies.map((tech, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No technologies listed</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/projects')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    </div>
  );
}
      slug: "neural-style-transfer",
      description:
        "Transform artistic styles using advanced neural networks. Create stunning artwork by combining content and style images through deep learning algorithms powered by VGG-19 architecture.",
      full_description:
        "Neural Style Transfer is a cutting-edge technique that leverages deep convolutional neural networks to create artistic images by combining the content of one image with the style of another. Our implementation uses the VGG-19 architecture, which has been pre-trained on millions of images, allowing it to understand both high-level content and low-level style features. The algorithm optimizes the output image to match the content representation of the original image while simultaneously matching the style representation of the style image. This creates stunning results that appear as if the content image was painted in the style of famous artworks or any other style source.",
      technologies: [
        "TensorFlow",
        "VGG-19",
        "Neural Networks",
        "Style Transfer",
      ],
      thumbnail_url: "https://picsum.photos/720/480?random=1",
      tags: ["AI", "Art", "Computer Vision"],
      complexity: "hard",
      start_at: "2024-01-01T00:00:00Z",
      access_level: "public",
      status: "published",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
      challenges: [
        "Optimizing processing speed for real-time applications",
        "Maintaining high-quality output across diverse style inputs",
        "Balancing content preservation with style transfer intensity",
      ],
      achievements: [
        "Reduced processing time by 60% through optimization",
        "Successfully applied to over 100,000 images",
        "Published research paper at CVPR 2024",
      ],
      future_work: [
        "Implement video style transfer capabilities",
        "Develop mobile application for on-device processing",
        "Explore multi-style blending techniques",
      ],
    },
  ];

  // Use fallback data if API data not available
  const displayProject = project || projects.find((p) => p.id === projectId) || projects[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }
      description:
        "Real-time object detection and instance segmentation using YOLO and Mask R-CNN architectures for precise image analysis with high accuracy rates.",
      fullDescription:
        "Our Object Detection & Segmentation system combines the speed of YOLO (You Only Look Once) with the precision of Mask R-CNN to deliver real-time, pixel-perfect object detection and segmentation. The system can identify multiple objects in complex scenes, classify them accurately, and generate precise segmentation masks for each instance. This dual-architecture approach allows us to achieve both high speed and high accuracy, making it suitable for applications ranging from autonomous vehicles to retail analytics.",
      technologies: ["YOLO", "Mask R-CNN", "OpenCV", "PyTorch"],
      thumbnail: "from-orange-500 to-red-500",
      category: "computer-vision",
      status: "Completed",
      complexity: "Expert",
      duration: "8 months",
      team: 6,
      impact: "Very High",
      startDate: "March 2023",
      challenges: [
        "Handling occlusion and overlapping objects",
        "Achieving real-time performance on edge devices",
        "Training on diverse datasets for robust generalization",
      ],
      achievements: [
        "Achieved 95% mAP on COCO dataset",
        "Deployed in 10+ production environments",
        "Processing speed of 60 FPS on GPU",
      ],
      futureWork: [
        "Implement 3D object detection",
        "Add tracking capabilities for video streams",
        "Optimize for mobile and embedded devices",
      ],
      gallery: [
        { type: "image", gradient: "from-orange-500 to-red-500" },
        { type: "image", gradient: "from-red-500 to-orange-600" },
        { type: "image", gradient: "from-orange-600 to-red-600" },
        { type: "image", gradient: "from-red-400 to-orange-500" },
      ],
    },
    {
      id: 3,
      title: "Image Super-Resolution",
      description:
        "Enhance image quality and resolution using ESRGAN and SRCNN models. Upscale images while preserving fine details and textures with GANs technology.",
      fullDescription:
        "Image Super-Resolution project focuses on enhancing low-resolution images to high-resolution outputs while preserving and even enhancing fine details and textures. Using Enhanced Super-Resolution Generative Adversarial Networks (ESRGAN) and Super-Resolution Convolutional Neural Networks (SRCNN), we can upscale images by 4x or more while maintaining photorealistic quality. The system is particularly effective at reconstructing textures, edges, and fine details that are typically lost in traditional upscaling methods.",
      technologies: ["ESRGAN", "SRCNN", "GANs", "Image Enhancement"],
      thumbnail: "from-yellow-500 to-amber-500",
      category: "enhancement",
      status: "Beta",
      complexity: "Advanced",
      duration: "4 months",
      team: 3,
      impact: "High",
      startDate: "June 2024",
      challenges: [
        "Avoiding over-smoothing and artifacts",
        "Maintaining consistency across different image types",
        "Balancing enhancement with computational efficiency",
      ],
      achievements: [
        "Achieved PSNR of 32.5 dB on benchmark datasets",
        "Successfully upscaled over 50,000 images",
        "Integrated into photo editing pipeline",
      ],
      futureWork: [
        "Implement video super-resolution",
        "Add selective enhancement features",
        "Develop real-time preview capabilities",
      ],
      gallery: [
        { type: "image", gradient: "from-yellow-500 to-amber-500" },
        { type: "image", gradient: "from-amber-500 to-yellow-600" },
        { type: "image", gradient: "from-yellow-400 to-amber-400" },
        { type: "image", gradient: "from-amber-400 to-yellow-500" },
      ],
    },
    {
      id: 4,
      title: "Facial Recognition System",
      description:
        "Advanced facial recognition and analysis with privacy-focused design, emotion detection, and real-time processing capabilities for security applications.",
      fullDescription:
        "Our Facial Recognition System is built with privacy and security at its core. It combines state-of-the-art facial detection, recognition, and emotion analysis capabilities with strict privacy controls and encrypted data handling. The system can process faces in real-time, identify individuals with high accuracy, and analyze emotional states, all while maintaining compliance with privacy regulations like GDPR. The architecture is designed to work efficiently in various lighting conditions and viewing angles.",
      technologies: [
        "OpenCV",
        "Face Recognition",
        "Deep Learning",
        "Privacy AI",
      ],
      thumbnail: "from-amber-600 to-orange-600",
      category: "computer-vision",
      status: "Active",
      complexity: "Expert",
      duration: "10 months",
      team: 5,
      impact: "Very High",
      startDate: "December 2023",
      challenges: [
        "Ensuring privacy and ethical use of facial data",
        "Handling variations in lighting and pose",
        "Reducing bias across different demographics",
      ],
      achievements: [
        "99.2% accuracy on LFW benchmark",
        "GDPR and privacy-compliant implementation",
        "Real-time processing at 30 FPS",
      ],
      futureWork: [
        "Implement liveness detection",
        "Add age and gender estimation features",
        "Develop mask detection capabilities",
      ],
      gallery: [
        { type: "image", gradient: "from-amber-600 to-orange-600" },
        { type: "image", gradient: "from-orange-600 to-amber-700" },
        { type: "image", gradient: "from-amber-500 to-orange-500" },
        { type: "image", gradient: "from-orange-500 to-amber-600" },
      ],
    },
    {
      id: 5,
      title: "Text-to-Image Generator",
      description:
        "Generate high-quality images from text descriptions using diffusion models and transformer architectures. Create art, illustrations, and concept designs from prompts.",
      fullDescription:
        "Text-to-Image Generator leverages cutting-edge diffusion models and transformer architectures to create stunning, high-quality images from natural language descriptions. Built on Stable Diffusion and CLIP technologies, the system understands complex prompts and generates coherent, aesthetically pleasing images that match the description. Users can create anything from photorealistic scenes to artistic illustrations, concept designs, and abstract art simply by describing what they want to see.",
      technologies: ["Stable Diffusion", "CLIP", "Transformers", "PyTorch"],
      thumbnail: "from-red-500 to-orange-500",
      category: "generative-ai",
      status: "Beta",
      complexity: "Expert",
      duration: "12 months",
      team: 8,
      impact: "Very High",
      startDate: "September 2023",
      challenges: [
        "Handling complex and ambiguous prompts",
        "Ensuring consistency in generated outputs",
        "Avoiding copyright and ethical issues",
      ],
      achievements: [
        "Generated over 1 million unique images",
        "Average user rating of 4.7/5 for quality",
        "Integrated with multiple creative platforms",
      ],
      futureWork: [
        "Add style control and customization",
        "Implement image-to-image editing",
        "Develop fine-tuning capabilities for specific styles",
      ],
      gallery: [
        { type: "image", gradient: "from-red-500 to-orange-500" },
        { type: "image", gradient: "from-orange-500 to-red-600" },
        { type: "image", gradient: "from-red-400 to-orange-400" },
        { type: "image", gradient: "from-orange-400 to-red-500" },
      ],
    },
    {
      id: 6,
      title: "Medical Image Analysis",
      description:
        "AI-powered medical imaging analysis for X-rays, MRIs, and CT scans. Detect anomalies, assist diagnosis, and provide detailed medical reports.",
      fullDescription:
        "Medical Image Analysis system is designed to assist healthcare professionals in analyzing medical imaging data including X-rays, MRIs, CT scans, and other DICOM format images. Using deep learning models trained on millions of medical images, the system can detect anomalies, identify potential diseases, and provide quantitative measurements to support clinical decision-making. The system maintains high accuracy while providing explainable AI outputs that help doctors understand the reasoning behind each detection.",
      technologies: ["Medical AI", "DICOM", "3D Analysis", "TensorFlow"],
      thumbnail: "from-orange-600 to-amber-600",
      category: "research",
      status: "In Progress",
      complexity: "Expert",
      duration: "15 months",
      team: 7,
      impact: "Very High",
      startDate: "July 2023",
      challenges: [
        "Ensuring medical accuracy and reliability",
        "Handling diverse imaging modalities",
        "Meeting regulatory requirements for medical AI",
      ],
      achievements: [
        "Achieved 94% sensitivity in lung nodule detection",
        "Collaborated with 5 major hospitals",
        "Reduced diagnosis time by 40%",
      ],
      futureWork: [
        "Expand to additional imaging modalities",
        "Implement treatment planning assistance",
        "Develop longitudinal analysis capabilities",
      ],
      gallery: [
        { type: "image", gradient: "from-orange-600 to-amber-600" },
        { type: "image", gradient: "from-amber-600 to-orange-700" },
        { type: "image", gradient: "from-orange-500 to-amber-500" },
        { type: "image", gradient: "from-amber-500 to-orange-600" },
      ],
    },
    {
      id: 7,
      title: "Automated Video Editing",
      description:
        "Smart video editing using AI for automatic scene detection, transition effects, and content optimization. Perfect for content creators and marketers.",
      fullDescription:
        "Automated Video Editing system revolutionizes video production by using AI to automatically detect scenes, apply transitions, optimize content, and even suggest edits based on the video's narrative flow. The system analyzes video content frame by frame, understands context, identifies key moments, and applies professional editing techniques automatically. Content creators can save hours of manual editing time while maintaining high-quality, engaging output.",
      technologies: ["OpenCV", "Video Processing", "ML", "FFmpeg"],
      thumbnail: "from-yellow-600 to-amber-600",
      category: "enhancement",
      status: "Active",
      complexity: "Advanced",
      duration: "6 months",
      team: 4,
      impact: "High",
      startDate: "February 2024",
      challenges: [
        "Maintaining narrative coherence in automated edits",
        "Handling diverse video formats and qualities",
        "Providing customization while keeping automation simple",
      ],
      achievements: [
        "Reduced editing time by 70% for standard videos",
        "Processed over 10,000 hours of video content",
        "Integrated with popular video platforms",
      ],
      futureWork: [
        "Add AI-generated captions and subtitles",
        "Implement music synchronization",
        "Develop style transfer for videos",
      ],
      gallery: [
        { type: "image", gradient: "from-yellow-600 to-amber-600" },
        { type: "image", gradient: "from-amber-600 to-yellow-700" },
        { type: "image", gradient: "from-yellow-500 to-amber-500" },
        { type: "image", gradient: "from-amber-500 to-yellow-600" },
      ],
    },
    {
      id: 8,
      title: "3D Object Reconstruction",
      description:
        "Reconstruct 3D objects from 2D images using photogrammetry and neural networks. Create detailed 3D models for gaming, AR/VR, and design.",
      fullDescription:
        "3D Object Reconstruction project combines traditional photogrammetry techniques with modern neural networks, particularly Neural Radiance Fields (NeRF), to create highly detailed 3D models from sets of 2D images. The system can reconstruct objects, scenes, and even entire environments with photorealistic textures and accurate geometry. Applications range from gaming asset creation to AR/VR experiences, architectural visualization, and digital preservation of cultural artifacts.",
      technologies: [
        "3D Reconstruction",
        "Photogrammetry",
        "Neural Radiance Fields",
        "Blender",
      ],
      thumbnail: "from-amber-500 to-yellow-500",
      category: "computer-vision",
      status: "Research",
      complexity: "Expert",
      duration: "18 months",
      team: 6,
      impact: "High",
      startDate: "May 2023",
      challenges: [
        "Handling reflective and transparent surfaces",
        "Reducing capture requirements for reconstruction",
        "Optimizing for real-time rendering",
      ],
      achievements: [
        "Reconstructed over 500 objects with high fidelity",
        "Published 2 papers on novel NeRF applications",
        "Reduced image requirements by 50%",
      ],
      futureWork: [
        "Implement single-image 3D reconstruction",
        "Add real-time preview during capture",
        "Develop mobile scanning application",
      ],
      gallery: [
        { type: "image", gradient: "from-amber-500 to-yellow-500" },
        { type: "image", gradient: "from-yellow-500 to-amber-600" },
        { type: "image", gradient: "from-amber-400 to-yellow-400" },
        { type: "image", gradient: "from-yellow-400 to-amber-500" },
      ],
    },
    {
      id: 9,
      title: "AI Art Restoration",
      description:
        "Restore damaged artwork and historical images using advanced inpainting techniques and style-aware neural networks to preserve cultural heritage.",
      fullDescription:
        "AI Art Restoration is dedicated to preserving cultural heritage by using advanced AI techniques to restore damaged or degraded artwork and historical photographs. The system employs sophisticated inpainting algorithms combined with style-aware neural networks that understand artistic techniques and historical context. It can fill in missing parts of paintings, remove damage and age-related degradation, and enhance faded colors while respecting the original artistic intent and historical accuracy.",
      technologies: [
        "Inpainting",
        "Style Transfer",
        "Cultural Heritage AI",
        "Restoration",
      ],
      thumbnail: "from-orange-400 to-amber-400",
      category: "enhancement",
      status: "Active",
      complexity: "Advanced",
      duration: "9 months",
      team: 5,
      impact: "High",
      startDate: "October 2023",
      challenges: [
        "Maintaining historical and artistic authenticity",
        "Handling severe damage and large missing areas",
        "Collaborating with art conservation experts",
      ],
      achievements: [
        "Restored over 200 historical artworks",
        "Partnership with 3 major museums",
        "Featured in cultural preservation conferences",
      ],
      futureWork: [
        "Expand to 3D artifact restoration",
        "Develop collaborative tools for conservators",
        "Add temporal analysis for aging patterns",
      ],
      gallery: [
        { type: "image", gradient: "from-orange-400 to-amber-400" },
        { type: "image", gradient: "from-amber-400 to-orange-500" },
        { type: "image", gradient: "from-orange-300 to-amber-300" },
        { type: "image", gradient: "from-amber-300 to-orange-400" },
      ],
    },
    {
      id: 10,
      title: "Voice-to-Image Synthesis",
      description:
        "Generate images from voice descriptions using multimodal AI. Convert speech to visual content with emotion and tone awareness for creative applications.",
      fullDescription:
        "Voice-to-Image Synthesis represents the next frontier in multimodal AI, allowing users to create images simply by speaking their ideas. The system combines advanced speech recognition with emotion and tone analysis, then uses this rich understanding to generate images that not only match the description but also capture the emotional intent and style suggested by the speaker's voice. This technology opens new possibilities for hands-free creative expression and accessibility.",
      technologies: [
        "Speech Recognition",
        "Multimodal AI",
        "Voice Processing",
        "Image Synthesis",
      ],
      thumbnail: "from-red-400 to-orange-400",
      category: "generative-ai",
      status: "Beta",
      complexity: "Expert",
      duration: "14 months",
      team: 9,
      impact: "High",
      startDate: "August 2023",
      challenges: [
        "Understanding context and implicit descriptions in speech",
        "Mapping vocal tone and emotion to visual attributes",
        "Handling multiple languages and accents",
      ],
      achievements: [
        "Supports 15+ languages with high accuracy",
        "Generated over 100,000 voice-prompted images",
        "85% user satisfaction in creative accuracy",
      ],
      futureWork: [
        "Add real-time voice modulation effects",
        "Implement conversation-based iterative editing",
        "Develop voice-controlled video generation",
      ],
      gallery: [
        { type: "image", gradient: "from-red-400 to-orange-400" },
        { type: "image", gradient: "from-orange-400 to-red-500" },
        { type: "image", gradient: "from-red-300 to-orange-300" },
        { type: "image", gradient: "from-orange-300 to-red-400" },
      ],
    },
    {
      id: 11,
      title: "Drone Image Analysis",
      description:
        "Analyze aerial and drone footage for environmental monitoring, agriculture, and urban planning using computer vision and geospatial AI technologies.",
      fullDescription:
        "Drone Image Analysis system processes aerial imagery from drones and satellites to provide actionable insights for environmental monitoring, precision agriculture, urban planning, and disaster response. Using advanced computer vision and geospatial AI, the system can detect changes over time, classify land use, monitor crop health, identify infrastructure issues, and track environmental indicators. The platform processes large-scale imagery efficiently and provides interactive visualization tools for data exploration.",
      technologies: [
        "Drone AI",
        "Geospatial Analysis",
        "Environmental AI",
        "Satellite Imagery",
      ],
      thumbnail: "from-yellow-400 to-orange-400",
      category: "research",
      status: "In Progress",
      complexity: "Advanced",
      duration: "12 months",
      team: 6,
      impact: "Very High",
      startDate: "November 2023",
      challenges: [
        "Processing massive amounts of high-resolution imagery",
        "Handling varying weather and lighting conditions",
        "Integrating with diverse data sources and formats",
      ],
      achievements: [
        "Analyzed over 1 million square km of terrain",
        "Deployed in 8 agricultural regions",
        "Reduced crop monitoring costs by 60%",
      ],
      futureWork: [
        "Add real-time processing for live drone feeds",
        "Implement predictive analytics for crop yields",
        "Develop disaster prediction capabilities",
      ],
      gallery: [
        { type: "image", gradient: "from-yellow-400 to-orange-400" },
        { type: "image", gradient: "from-orange-400 to-yellow-500" },
        { type: "image", gradient: "from-yellow-300 to-orange-300" },
        { type: "image", gradient: "from-orange-300 to-yellow-400" },
      ],
    },
    {
      id: 12,
      title: "Real-time Style Transfer",
      description:
        "Apply artistic styles to live video feeds and camera streams in real-time. Perfect for live streaming, video calls, and interactive art installations.",
      fullDescription:
        "Real-time Style Transfer brings artistic transformation to live video streams, enabling users to apply various artistic styles to their camera feeds with minimal latency. Unlike traditional style transfer that processes single images, this system is optimized for continuous video processing, maintaining temporal coherence across frames. Applications include live streaming with artistic effects, enhanced video conferencing, virtual production, and interactive art installations where viewers can see themselves transformed in real-time.",
      technologies: [
        "Real-time Processing",
        "Style Transfer",
        "WebRTC",
        "Edge Computing",
      ],
      thumbnail: "from-amber-400 to-red-400",
      category: "generative-ai",
      status: "Active",
      complexity: "Advanced",
      duration: "7 months",
      team: 4,
      impact: "High",
      startDate: "March 2024",
      challenges: [
        "Achieving consistent style across video frames",
        "Maintaining low latency for real-time interaction",
        "Optimizing for various hardware capabilities",
      ],
      achievements: [
        "Achieved 30 FPS on standard webcams",
        "Deployed in 5 interactive art exhibitions",
        "Integrated with major streaming platforms",
      ],
      futureWork: [
        "Add user-customizable style models",
        "Implement multi-person style transfer",
        "Develop mobile AR integration",
      ],
      gallery: [
        { type: "image", gradient: "from-amber-400 to-red-400" },
        { type: "image", gradient: "from-red-400 to-amber-500" },
        { type: "image", gradient: "from-amber-300 to-red-300" },
        { type: "image", gradient: "from-red-300 to-amber-400" },
      ],
    },
  ];

  // Use fallback data if API data not available
  const displayProject = project || projects.find((p) => p.id === projectId) || projects[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!displayProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Project Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The project you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/projects")}
            className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "archived":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
              <div
                onClick={() => (window.location.href = "/")}
                className="hover:text-white transition-colors duration-300 cursor-pointer"
              >
                Home
              </div>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <div
                onClick={() => (window.location.href = "/projects")}
                className="hover:text-white transition-colors duration-300 cursor-pointer"
              >
                Projects
              </div>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="text-white">{displayProject?.title || 'Project'}</span>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Project Header */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Project Icon/Thumbnail */}
              <div className="lg:w-1/3">
                <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl">
                  {displayProject?.thumbnail_url ? (
                    <img
                      src={displayProject.thumbnail_url}
                      alt={displayProject.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500"
                    style={{ display: displayProject?.thumbnail_url ? 'none' : 'flex' }}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-6xl font-bold opacity-50">
                        #{String(displayProject?.id).slice(0, 3) || '1'}
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
                  <span
                    className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(
                      displayProject?.status
                    )}`}
                  >
                    {displayProject?.status ? displayProject.status.charAt(0).toUpperCase() + displayProject.status.slice(1) : 'Published'}
                  </span>
                  <span
                    className={`px-4 py-2 text-sm font-medium rounded-full ${getComplexityColor(
                      displayProject?.complexity
                    )}`}
                  >
                    {displayProject?.complexity ? displayProject.complexity.charAt(0).toUpperCase() + displayProject.complexity.slice(1) : 'Medium'}
                  </span>
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white border border-white/20">
                    {displayProject?.access_level ? displayProject.access_level.charAt(0).toUpperCase() + displayProject.access_level.slice(1) : 'Public'}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                  {displayProject?.title || 'Project Title'}
                </h1>

                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  {displayProject?.description || 'Project description'}
                </p>
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
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Project Overview
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-8">
                    {displayProject?.full_description || displayProject?.description || 'No description available.'}
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Key Achievements
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {displayProject?.achievements?.join(". ") || 'No achievements listed yet'}.
                  </p>
                </div>
              </div>
            )}

            {/* Technologies Tab */}
            {activeTab === "technologies" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Technologies Used
                  </h2>
                  <p className="text-lg text-gray-700 mb-8">
                    This project leverages cutting-edge technologies and
                    frameworks to deliver exceptional results.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {(displayProject?.technologies || []).map((tech, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0"
                        >
                          <span className="text-white font-bold text-lg">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {tech}
                          </h3>
                          <p className="text-gray-600">
                            Essential technology for implementing advanced
                            features and ensuring optimal performance.
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
              Learn more about our work or collaborate with us on similar
              projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div
                onClick={() => (window.location.href = "/contact")}
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                Contact Us
              </div>
              <div
                onClick={() => (window.location.href = "/projects")}
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
              >
                View All Projects
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
