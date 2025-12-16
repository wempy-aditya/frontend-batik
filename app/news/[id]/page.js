"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.id;
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper functions - declared before use
  const getCategory = (article) => {
    if (article.category) return article.category;
    if (article.tags && article.tags.length > 0) return article.tags[0];
    return 'news';
  };

  const getReadTime = (content) => {
    if (!content) return '5 min read';
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Simple markdown to HTML converter
  const renderMarkdown = (markdown) => {
    if (!markdown) return '';

    let html = markdown;

    // Headers (h1-h6)
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

    // Italic *text* or _text_
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" class="text-amber-600 hover:underline">$1</a>');

    // Images ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />');

    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside my-4 space-y-2">$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-amber-500 pl-4 italic my-4">$1</blockquote>');

    // Code blocks ```code```
    html = html.replace(/```(.*?)```/gis, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>');

    // Inline code `code`
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>');

    // Line breaks (double space or \n\n)
    html = html.replace(/\n\n/g, '</p><p class="mb-4">');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
      html = '<p class="mb-4">' + html + '</p>';
    }

    return html;
  };

  // Fetch news detail from API
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/news/public/${newsId}`);
        if (response.ok) {
          const data = await response.json();
          setNews(data);
        } else {
          setNews(null);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews(null);
      } finally {
        setLoading(false);
      }
    };

    if (newsId) {
      fetchNews();
    }
  }, [newsId]);

  // Default fallback news
  const defaultNews = {
    id: 1,
    title: "News Not Found",
    content: "The requested news article could not be found.",
    tags: [],
    creator_name: "Admin",
    created_at: new Date().toISOString(),
    status: "published",
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  // Display logic
  const displayNews = news || defaultNews;

  // Fallback data for reference (not used unless API fails)
  const newsArticles = [
    {
      id: 1,
      title: "AI Vision Lab Launches Advanced Neural Style Transfer Model",
      excerpt:
        "Our new neural style transfer model achieves 60% faster processing times while maintaining exceptional output quality. The breakthrough comes from optimized architecture and innovative training techniques.",
      fullContent: `
        <p>We are thrilled to announce the launch of our latest breakthrough in neural style transfer technology. After months of intensive research and development, our team has successfully created a model that achieves 60% faster processing times while maintaining exceptional output quality.</p>

        <h2>Revolutionary Performance Improvements</h2>
        <p>The key to this advancement lies in our innovative architecture that optimizes the balance between processing speed and image quality. Through careful analysis and optimization of the VGG-19 network, we've identified and eliminated computational bottlenecks that previously limited performance.</p>

        <p>Our optimizations include:</p>
        <ul>
          <li>Streamlined feature extraction layers</li>
          <li>Enhanced gradient computation algorithms</li>
          <li>Adaptive learning rate scheduling</li>
          <li>Memory-efficient processing pipelines</li>
        </ul>

        <h2>Maintaining Quality Standards</h2>
        <p>Despite the significant speed improvements, we've ensured that output quality remains exceptional. Our rigorous testing shows that the new model produces images that are indistinguishable from those generated by previous versions, while processing them in a fraction of the time.</p>

        <h2>Real-World Applications</h2>
        <p>This breakthrough opens up new possibilities for real-time style transfer applications, including:</p>
        <ul>
          <li>Live video processing for content creators</li>
          <li>Interactive art installations</li>
          <li>Mobile applications with on-device processing</li>
          <li>Real-time video conferencing filters</li>
        </ul>

        <h2>Technical Implementation</h2>
        <p>The model utilizes a modified VGG-19 architecture with custom-designed loss functions that better capture stylistic elements while reducing computational overhead. Our training methodology incorporates advanced techniques such as transfer learning and progressive training to achieve optimal results.</p>

        <h2>Availability</h2>
        <p>The new neural style transfer model is now available through our API and will be integrated into our flagship products over the coming weeks. Developers can access detailed documentation and example code on our developer portal.</p>

        <h2>Looking Forward</h2>
        <p>This release represents a significant milestone in our mission to make advanced AI technology accessible and practical for real-world applications. Our team continues to push the boundaries of what's possible in computer vision and image processing.</p>
      `,
      category: "product",
      date: "2024-01-15",
      author: "Dr. Sarah Chen",
      authorRole: "Chief Research Scientist",
      readTime: "5 min read",
      image: "from-amber-500 to-orange-500",
      tags: ["Neural Networks", "Style Transfer", "VGG-19", "Deep Learning"],
    },
    {
      id: 2,
      title: "Research Paper Accepted at CVPR 2024",
      excerpt:
        "Our groundbreaking research on real-time object detection has been accepted for presentation at the Computer Vision and Pattern Recognition conference. This marks our third consecutive year of CVPR publications.",
      fullContent: `
        <p>We are proud to announce that our research paper on real-time object detection has been accepted for presentation at CVPR 2024, one of the most prestigious conferences in computer vision. This achievement marks our third consecutive year of publishing at this premier venue.</p>

        <h2>Research Highlights</h2>
        <p>Our paper introduces a novel approach to real-time object detection that achieves state-of-the-art accuracy while maintaining exceptional processing speeds. The research addresses fundamental challenges in balancing detection accuracy with computational efficiency.</p>

        <h2>Key Contributions</h2>
        <p>The paper presents several significant contributions to the field:</p>
        <ul>
          <li>A new attention mechanism that improves feature extraction</li>
          <li>Optimized anchor-free detection architecture</li>
          <li>Novel training strategies for better generalization</li>
          <li>Comprehensive benchmark results on multiple datasets</li>
        </ul>

        <h2>Performance Achievements</h2>
        <p>Our method achieves remarkable results across various benchmarks, demonstrating significant improvements over existing approaches in both accuracy and speed. The model processes images at 60 FPS on standard GPUs while maintaining competitive accuracy scores.</p>

        <h2>Impact on the Field</h2>
        <p>This research has important implications for numerous applications including autonomous driving, robotics, surveillance systems, and augmented reality. The ability to perform accurate object detection in real-time opens up new possibilities for interactive AI systems.</p>

        <h2>Team Recognition</h2>
        <p>This achievement is the result of collaborative efforts by our talented research team. Special thanks to our co-authors and partners who contributed to this groundbreaking work.</p>

        <h2>Conference Presentation</h2>
        <p>Our team will be presenting the paper at CVPR 2024 in June. We look forward to sharing our findings with the global computer vision community and engaging in discussions about future directions in this exciting field.</p>
      `,
      category: "research",
      date: "2024-01-12",
      author: "Dr. Michael Zhang",
      authorRole: "Senior Research Engineer",
      readTime: "4 min read",
      image: "from-blue-500 to-indigo-500",
      tags: ["CVPR", "Object Detection", "Research", "Computer Vision"],
    },
    {
      id: 3,
      title: "AI Vision Lab Opens New Research Facility",
      excerpt:
        "We're excited to announce the opening of our state-of-the-art research facility in Silicon Valley. The 50,000 sq ft space will house our growing team of AI researchers and engineers.",
      fullContent: `
        <p>Today marks a significant milestone in our company's history as we officially open our new state-of-the-art research facility in Silicon Valley. This 50,000 square foot campus represents our commitment to advancing AI research and innovation.</p>

        <h2>World-Class Facilities</h2>
        <p>The new facility features cutting-edge infrastructure designed specifically for AI research and development. Our space includes dedicated areas for collaboration, experimentation, and innovation.</p>

        <h2>Key Features</h2>
        <ul>
          <li>Advanced GPU computing cluster with 1000+ GPUs</li>
          <li>Collaborative research spaces and innovation labs</li>
          <li>High-speed networking infrastructure</li>
          <li>Specialized imaging and computer vision labs</li>
          <li>Meeting rooms equipped with latest presentation technology</li>
        </ul>

        <h2>Growing Team</h2>
        <p>The facility will accommodate our expanding team of researchers, engineers, and support staff. We're currently hiring for multiple positions across research, engineering, and operations.</p>

        <h2>Community Engagement</h2>
        <p>The new campus will also serve as a hub for community engagement, hosting workshops, seminars, and collaboration events with academic institutions and industry partners.</p>

        <h2>Sustainable Design</h2>
        <p>Environmental sustainability was a key consideration in the facility's design. The building features energy-efficient systems, renewable energy sources, and green building certifications.</p>

        <h2>Future Growth</h2>
        <p>This expansion positions us for continued growth and innovation in AI research. We're excited about the opportunities this new facility brings for advancing the field of computer vision and artificial intelligence.</p>
      `,
      category: "company",
      date: "2024-01-10",
      author: "Emma Rodriguez",
      authorRole: "VP of Operations",
      readTime: "3 min read",
      image: "from-green-500 to-teal-500",
      tags: ["Company News", "Facility", "Expansion", "Silicon Valley"],
    },
    {
      id: 4,
      title: "New Dataset Release: ImageNet-2024",
      excerpt:
        "We're releasing ImageNet-2024, featuring 14.2 million annotated images across 20,000+ categories. This comprehensive dataset represents our largest release to date.",
      fullContent: `
        <p>We are excited to announce the release of ImageNet-2024, the latest and most comprehensive iteration of our flagship dataset. With 14.2 million carefully annotated images spanning over 20,000 categories, this represents our largest and most ambitious dataset release to date.</p>

        <h2>Dataset Overview</h2>
        <p>ImageNet-2024 builds upon years of research and community feedback to deliver the most comprehensive visual recognition dataset available. Each image has been meticulously annotated with multiple types of information including object categories, bounding boxes, and segmentation masks.</p>

        <h2>Key Improvements</h2>
        <ul>
          <li>Expanded category coverage with 5,000 new categories</li>
          <li>Improved annotation quality through enhanced verification</li>
          <li>Better representation of diverse geographical regions</li>
          <li>Enhanced metadata including contextual information</li>
          <li>Support for multi-label classification tasks</li>
        </ul>

        <h2>Quality Assurance</h2>
        <p>Every image in the dataset has undergone rigorous quality control processes. Our team of expert annotators, supported by automated verification systems, ensures the highest standards of accuracy and consistency.</p>

        <h2>Use Cases</h2>
        <p>The dataset is designed to support a wide range of research and development activities:</p>
        <ul>
          <li>Training deep learning models for image classification</li>
          <li>Transfer learning and fine-tuning applications</li>
          <li>Benchmarking new algorithms and architectures</li>
          <li>Educational purposes and research projects</li>
        </ul>

        <h2>Access and Licensing</h2>
        <p>ImageNet-2024 is available for download through our platform. Academic researchers can access the dataset at no cost, while commercial licenses are available for industry applications.</p>

        <h2>Community Impact</h2>
        <p>We believe this dataset will drive significant advances in computer vision research and applications. We're excited to see what the community builds with this resource.</p>
      `,
      category: "product",
      date: "2024-01-08",
      author: "Dr. James Wilson",
      authorRole: "Data Science Lead",
      readTime: "6 min read",
      image: "from-purple-500 to-pink-500",
      tags: ["Dataset", "ImageNet", "Machine Learning", "Computer Vision"],
    },
    {
      id: 5,
      title: "AI Vision Lab Wins Best Innovation Award",
      excerpt:
        "Our facial recognition system with privacy-first design has been recognized with the Best Innovation Award at the Global AI Summit 2024.",
      fullContent: `
        <p>We are honored to announce that our privacy-first facial recognition system has been awarded the Best Innovation Award at the Global AI Summit 2024. This prestigious recognition validates our commitment to developing AI technology that respects user privacy while delivering exceptional performance.</p>

        <h2>Award Significance</h2>
        <p>The Global AI Summit brings together leading researchers, industry experts, and innovators from around the world. Receiving the Best Innovation Award among hundreds of submissions is a testament to the groundbreaking nature of our work.</p>

        <h2>Privacy-First Design</h2>
        <p>Our facial recognition system stands out for its unique approach to privacy protection:</p>
        <ul>
          <li>On-device processing that keeps biometric data local</li>
          <li>Encrypted templates that cannot be reverse-engineered</li>
          <li>User consent and control mechanisms</li>
          <li>Minimal data retention policies</li>
          <li>Transparent operation and audit trails</li>
        </ul>

        <h2>Technical Innovation</h2>
        <p>The system achieves state-of-the-art accuracy while maintaining strict privacy guarantees. Our novel architecture processes facial features in a way that preserves privacy without compromising recognition performance.</p>

        <h2>Real-World Applications</h2>
        <p>The technology is already being deployed in various scenarios including secure authentication, access control, and personalized user experiences. Each application is designed with privacy as a core principle.</p>

        <h2>Industry Recognition</h2>
        <p>This award follows recent recognition from privacy advocacy groups and technology publications. We're proud that our work is resonating with both technical experts and privacy advocates.</p>

        <h2>Future Development</h2>
        <p>Building on this success, we're expanding our privacy-first approach to other AI technologies. Our goal is to demonstrate that powerful AI capabilities and strong privacy protections are not mutually exclusive.</p>
      `,
      category: "company",
      date: "2024-01-05",
      author: "Lisa Anderson",
      authorRole: "Head of Product",
      readTime: "4 min read",
      image: "from-yellow-500 to-orange-500",
      tags: ["Award", "Facial Recognition", "Privacy", "Innovation"],
    },
    {
      id: 6,
      title: "Breakthrough in Medical Image Analysis",
      excerpt:
        "Our AI-powered diagnostic tool achieved 95% accuracy in detecting early-stage cancers from medical imaging. This advancement could revolutionize early disease detection.",
      fullContent: `
        <p>We are proud to announce a major breakthrough in medical image analysis. Our AI-powered diagnostic tool has achieved 95% accuracy in detecting early-stage cancers from medical imaging, potentially revolutionizing early disease detection and improving patient outcomes.</p>

        <h2>Clinical Significance</h2>
        <p>Early detection is crucial for successful cancer treatment. Our system can identify subtle patterns in medical images that may indicate early-stage disease, often before symptoms appear. This capability could significantly improve survival rates and treatment outcomes.</p>

        <h2>Technical Achievement</h2>
        <p>The breakthrough comes from several key innovations:</p>
        <ul>
          <li>Advanced deep learning architecture optimized for medical imaging</li>
          <li>Multi-modal analysis combining different imaging techniques</li>
          <li>Attention mechanisms that focus on relevant image regions</li>
          <li>Robust training on diverse, high-quality medical datasets</li>
        </ul>

        <h2>Validation and Testing</h2>
        <p>The system underwent rigorous validation through multi-center clinical trials involving thousands of medical images. Results were independently verified by board-certified radiologists, confirming the high accuracy and reliability of the system.</p>

        <h2>Clinical Integration</h2>
        <p>We're working closely with healthcare providers to integrate this technology into clinical workflows. The system is designed to assist radiologists, not replace them, providing a second opinion that enhances diagnostic accuracy.</p>

        <h2>Regulatory Approval</h2>
        <p>We're currently pursuing regulatory approvals in multiple jurisdictions. Our goal is to make this life-saving technology available to healthcare providers as quickly as possible while ensuring it meets all safety and efficacy requirements.</p>

        <h2>Ethical Considerations</h2>
        <p>Throughout development, we've prioritized patient privacy, data security, and ethical AI practices. The system includes explainability features that help clinicians understand the basis for its assessments.</p>

        <h2>Future Applications</h2>
        <p>Beyond cancer detection, we're exploring applications of this technology for other diseases and medical conditions. This work represents a significant step toward more effective, accessible healthcare through AI.</p>
      `,
      category: "research",
      date: "2024-01-03",
      author: "Dr. Rachel Kim",
      authorRole: "Medical AI Research Lead",
      readTime: "7 min read",
      image: "from-red-500 to-pink-500",
      tags: ["Medical AI", "Cancer Detection", "Healthcare", "Research"],
    },
    {
      id: 7,
      title: "Upcoming Webinar: Future of Computer Vision",
      excerpt:
        "Join our expert panel discussion on the future of computer vision and AI. Register now for exclusive insights and live Q&A session with our research team.",
      fullContent: `
        <p>Mark your calendars! We're hosting an exclusive webinar featuring our expert panel discussing the future of computer vision and artificial intelligence. This is a unique opportunity to gain insights from leading researchers and engage directly with our team.</p>

        <h2>Event Details</h2>
        <p>Date: February 15, 2024<br>
        Time: 2:00 PM - 4:00 PM PST<br>
        Format: Virtual (Zoom)<br>
        Registration: Free</p>

        <h2>Panel Topics</h2>
        <p>Our experts will cover a range of exciting topics:</p>
        <ul>
          <li>Emerging trends in computer vision technology</li>
          <li>Real-world applications and case studies</li>
          <li>Ethical considerations in AI development</li>
          <li>Future research directions and opportunities</li>
          <li>Career paths in computer vision and AI</li>
        </ul>

        <h2>Featured Speakers</h2>
        <p>Our panel includes distinguished researchers and industry leaders:</p>
        <ul>
          <li>Dr. Sarah Chen - Chief Research Scientist</li>
          <li>Dr. Michael Zhang - Senior Research Engineer</li>
          <li>Dr. Rachel Kim - Medical AI Research Lead</li>
          <li>Dr. James Wilson - Data Science Lead</li>
        </ul>

        <h2>Interactive Q&A</h2>
        <p>The webinar will include an extended Q&A session where attendees can ask questions directly to our panelists. This is your chance to get expert insights on topics that matter to you.</p>

        <h2>Who Should Attend</h2>
        <p>This webinar is ideal for:</p>
        <ul>
          <li>AI researchers and practitioners</li>
          <li>Computer vision enthusiasts</li>
          <li>Students considering careers in AI</li>
          <li>Business leaders exploring AI applications</li>
          <li>Anyone interested in the future of technology</li>
        </ul>

        <h2>Registration</h2>
        <p>Space is limited! Register now to secure your spot. Registered attendees will receive:</p>
        <ul>
          <li>Live access to the webinar</li>
          <li>Recording of the full session</li>
          <li>Downloadable presentation materials</li>
          <li>Certificate of attendance</li>
        </ul>

        <h2>Don't Miss Out</h2>
        <p>This webinar promises to be an enlightening experience. Join us to explore the future of computer vision and discover how AI is transforming our world.</p>
      `,
      category: "events",
      date: "2024-01-02",
      author: "Marketing Team",
      authorRole: "Community Engagement",
      readTime: "2 min read",
      image: "from-indigo-500 to-purple-500",
      tags: ["Webinar", "Events", "Computer Vision", "Panel Discussion"],
    },
    {
      id: 8,
      title: "Partnership with Leading Universities",
      excerpt:
        "AI Vision Lab announces research partnerships with MIT, Stanford, and CMU to advance computer vision research and education.",
      fullContent: `
        <p>We are thrilled to announce strategic research partnerships with three of the world's leading universities: Massachusetts Institute of Technology (MIT), Stanford University, and Carnegie Mellon University (CMU). These collaborations will advance computer vision research and education.</p>

        <h2>Partnership Objectives</h2>
        <p>These partnerships are designed to foster innovation and knowledge exchange between academia and industry. Together, we will pursue ambitious research goals while supporting the next generation of AI researchers.</p>

        <h2>Collaborative Research Programs</h2>
        <p>The partnerships encompass several key areas:</p>
        <ul>
          <li>Joint research projects on fundamental AI challenges</li>
          <li>Shared access to datasets and computing resources</li>
          <li>Co-authored publications and conference presentations</li>
          <li>Technology transfer and commercialization support</li>
        </ul>

        <h2>Educational Initiatives</h2>
        <p>Education is a core focus of these partnerships:</p>
        <ul>
          <li>Guest lectures and seminars by our research team</li>
          <li>Internship programs for graduate students</li>
          <li>Sponsored fellowships and scholarships</li>
          <li>Curriculum development for AI courses</li>
          <li>Workshops and training programs</li>
        </ul>

        <h2>Research Focus Areas</h2>
        <p>Our collaborative research will address critical challenges in:</p>
        <ul>
          <li>Deep learning architecture design</li>
          <li>Efficient AI for edge computing</li>
          <li>Ethical and responsible AI</li>
          <li>Multi-modal learning systems</li>
          <li>AI safety and robustness</li>
        </ul>

        <h2>Student Opportunities</h2>
        <p>Students at partner institutions will benefit from exclusive opportunities including internships, research funding, and access to industry-leading tools and resources.</p>

        <h2>Industry Impact</h2>
        <p>These partnerships strengthen the connection between academic research and real-world applications, accelerating the translation of breakthrough research into practical solutions.</p>

        <h2>Looking Forward</h2>
        <p>We're excited about the possibilities these partnerships create for advancing AI research and education. This is just the beginning of what we hope will be long-lasting and productive collaborations.</p>
      `,
      category: "company",
      date: "2023-12-28",
      author: "John Smith",
      authorRole: "Director of Research Partnerships",
      readTime: "5 min read",
      image: "from-teal-500 to-green-500",
      tags: ["Partnership", "Universities", "Research", "Education"],
    },
    {
      id: 9,
      title: "New API Release: Real-Time Style Transfer",
      excerpt:
        "Developers can now integrate our real-time style transfer capabilities into their applications with our new API. Documentation and SDKs available now.",
      fullContent: `
        <p>We're excited to announce the release of our Real-Time Style Transfer API, enabling developers to easily integrate advanced neural style transfer capabilities into their applications. This powerful API brings artistic image transformation to any platform.</p>

        <h2>API Features</h2>
        <p>The new API offers comprehensive features for style transfer:</p>
        <ul>
          <li>Real-time processing with sub-second response times</li>
          <li>Multiple style models to choose from</li>
          <li>Customizable style intensity controls</li>
          <li>Batch processing capabilities</li>
          <li>Support for various image formats and sizes</li>
        </ul>

        <h2>Developer Experience</h2>
        <p>We've designed the API with developers in mind:</p>
        <ul>
          <li>RESTful architecture for easy integration</li>
          <li>Comprehensive documentation with examples</li>
          <li>SDKs for Python, JavaScript, and Swift</li>
          <li>Interactive API playground for testing</li>
          <li>Detailed error messages and debugging support</li>
        </ul>

        <h2>Performance</h2>
        <p>Our API delivers exceptional performance through:</p>
        <ul>
          <li>Globally distributed edge servers</li>
          <li>Optimized model inference pipelines</li>
          <li>Intelligent caching mechanisms</li>
          <li>Auto-scaling infrastructure</li>
        </ul>

        <h2>Use Cases</h2>
        <p>Developers are already using the API for various applications:</p>
        <ul>
          <li>Photo editing and creative tools</li>
          <li>Social media filters and effects</li>
          <li>Video processing applications</li>
          <li>E-commerce product visualization</li>
          <li>Art and design software</li>
        </ul>

        <h2>Pricing</h2>
        <p>We offer flexible pricing tiers to suit different needs:</p>
        <ul>
          <li>Free tier for development and testing (1,000 requests/month)</li>
          <li>Starter plan for small projects</li>
          <li>Professional plan for production applications</li>
          <li>Enterprise plan with custom limits and SLAs</li>
        </ul>

        <h2>Getting Started</h2>
        <p>Visit our developer portal to access documentation, sign up for an API key, and start building. We also offer free office hours for developers who need assistance.</p>

        <h2>Community Support</h2>
        <p>Join our developer community to share ideas, get help, and showcase your creations. We're excited to see what you'll build with this technology!</p>
      `,
      category: "product",
      date: "2023-12-25",
      author: "Dev Team",
      authorRole: "Engineering",
      readTime: "4 min read",
      image: "from-orange-500 to-red-500",
      tags: ["API", "Style Transfer", "Developer Tools", "Integration"],
    },
    {
      id: 10,
      title: "AI Ethics Workshop Series Announced",
      excerpt:
        "We're launching a quarterly workshop series focused on ethical AI development and responsible computer vision applications.",
      fullContent: `
        <p>We are pleased to announce the launch of our AI Ethics Workshop Series, a quarterly program focused on ethical AI development and responsible deployment of computer vision technologies. This initiative reflects our commitment to advancing AI in a way that benefits society.</p>

        <h2>Workshop Objectives</h2>
        <p>The workshop series aims to:</p>
        <ul>
          <li>Explore ethical implications of AI technologies</li>
          <li>Develop best practices for responsible AI</li>
          <li>Foster dialogue between stakeholders</li>
          <li>Address bias and fairness in AI systems</li>
          <li>Promote transparency and accountability</li>
        </ul>

        <h2>Topics Covered</h2>
        <p>Each workshop will focus on specific themes:</p>
        <ul>
          <li>Privacy in computer vision applications</li>
          <li>Bias detection and mitigation strategies</li>
          <li>Algorithmic fairness and justice</li>
          <li>Transparency and explainability</li>
          <li>Environmental impact of AI</li>
          <li>Governance and regulation</li>
        </ul>

        <h2>Format and Structure</h2>
        <p>Workshops will include:</p>
        <ul>
          <li>Keynote presentations by ethics experts</li>
          <li>Panel discussions with diverse perspectives</li>
          <li>Interactive case study analysis</li>
          <li>Small group breakout sessions</li>
          <li>Practical tools and frameworks</li>
        </ul>

        <h2>Who Should Attend</h2>
        <p>These workshops are designed for:</p>
        <ul>
          <li>AI researchers and developers</li>
          <li>Product managers and executives</li>
          <li>Policy makers and regulators</li>
          <li>Ethics researchers and advocates</li>
          <li>Anyone interested in responsible AI</li>
        </ul>

        <h2>Expert Facilitators</h2>
        <p>Workshops will be led by recognized experts in AI ethics, including academics, industry practitioners, and policy specialists. Participants will benefit from diverse perspectives and deep expertise.</p>

        <h2>Participant Benefits</h2>
        <p>Attendees will:</p>
        <ul>
          <li>Gain practical frameworks for ethical decision-making</li>
          <li>Network with ethics-minded professionals</li>
          <li>Access workshop materials and resources</li>
          <li>Receive certificates of completion</li>
          <li>Join an ongoing community of practice</li>
        </ul>

        <h2>Registration Information</h2>
        <p>The first workshop is scheduled for March 2024. Registration will open in February. Space is limited to ensure meaningful interaction and discussion.</p>

        <h2>Our Commitment</h2>
        <p>This workshop series is part of our broader commitment to developing AI responsibly. We believe that ethical considerations should be integrated into every stage of AI development and deployment.</p>
      `,
      category: "events",
      date: "2023-12-20",
      author: "Dr. Sarah Chen",
      authorRole: "Chief Research Scientist",
      readTime: "3 min read",
      image: "from-cyan-500 to-blue-500",
      tags: ["Ethics", "Workshops", "AI Responsibility", "Events"],
    },
    {
      id: 11,
      title: "Advanced 3D Reconstruction Model Released",
      excerpt:
        "Our latest 3D object reconstruction model can now create detailed 3D models from just 5 images, reducing requirements by 50%.",
      fullContent: `
        <p>We're excited to unveil our latest breakthrough in 3D reconstruction technology. Our new model can create highly detailed 3D models from just 5 images, representing a 50% reduction in image requirements compared to previous methods.</p>

        <h2>Technical Innovation</h2>
        <p>This advancement is powered by several key innovations:</p>
        <ul>
          <li>Novel neural architecture combining multiple geometric cues</li>
          <li>Advanced feature matching across viewpoints</li>
          <li>Implicit surface representation for smooth reconstruction</li>
          <li>Multi-scale processing for capturing fine details</li>
        </ul>

        <h2>Reduced Image Requirements</h2>
        <p>Traditional 3D reconstruction methods required 10 or more images from different angles. Our new approach achieves comparable or better quality with just 5 images, making 3D scanning more practical and accessible.</p>

        <h2>Quality and Accuracy</h2>
        <p>Despite using fewer images, our model produces high-quality 3D reconstructions with:</p>
        <ul>
          <li>Accurate geometry and proportions</li>
          <li>Preserved fine details and textures</li>
          <li>Smooth surfaces without artifacts</li>
          <li>Correct handling of occlusions</li>
        </ul>

        <h2>Applications</h2>
        <p>This technology enables numerous practical applications:</p>
        <ul>
          <li>E-commerce product visualization</li>
          <li>Cultural heritage preservation</li>
          <li>Gaming and virtual reality content creation</li>
          <li>Architecture and construction documentation</li>
          <li>Medical imaging and prosthetics</li>
        </ul>

        <h2>Processing Speed</h2>
        <p>The model processes 5 images in under 30 seconds on standard GPUs, making it practical for real-time applications and high-volume processing.</p>

        <h2>Integration Options</h2>
        <p>The 3D reconstruction model is available through multiple channels:</p>
        <ul>
          <li>Cloud API for on-demand processing</li>
          <li>On-premise deployment for sensitive data</li>
          <li>Mobile SDK for iOS and Android</li>
          <li>Desktop application for content creators</li>
        </ul>

        <h2>Research Foundations</h2>
        <p>This work builds on recent advances in neural radiance fields (NeRF) and geometric deep learning. Our research paper detailing the methodology will be published soon.</p>

        <h2>Future Enhancements</h2>
        <p>We're already working on next-generation capabilities including single-image reconstruction and real-time video-based modeling. Stay tuned for more innovations in 3D computer vision.</p>
      `,
      category: "research",
      date: "2023-12-18",
      author: "Dr. Michael Zhang",
      authorRole: "Senior Research Engineer",
      readTime: "6 min read",
      image: "from-pink-500 to-rose-500",
      tags: [
        "3D Reconstruction",
        "Computer Vision",
        "Neural Networks",
        "Research",
      ],
    },
    {
      id: 12,
      title: "Year in Review: 2023 Achievements",
      excerpt:
        "Looking back at our remarkable achievements in 2023 - from breakthrough research to product launches and community growth.",
      fullContent: `
        <p>As we close out 2023, we want to take a moment to reflect on an extraordinary year of achievements, innovation, and growth. From groundbreaking research to successful product launches, 2023 has been transformative for AI Vision Lab.</p>

        <h2>Research Milestones</h2>
        <p>Our research team achieved remarkable success in 2023:</p>
        <ul>
          <li>Published 15 papers at top-tier conferences (CVPR, ICCV, NeurIPS)</li>
          <li>3 best paper awards at international conferences</li>
          <li>50+ citations for our flagship research papers</li>
          <li>Launched 5 new open-source research projects</li>
        </ul>

        <h2>Product Innovations</h2>
        <p>We delivered several major product releases:</p>
        <ul>
          <li>Neural Style Transfer v2.0 with 60% faster processing</li>
          <li>Real-time Object Detection API</li>
          <li>ImageNet-2024 dataset with 14M images</li>
          <li>Medical Image Analysis platform</li>
          <li>3D Reconstruction toolkit</li>
        </ul>

        <h2>Team Growth</h2>
        <p>Our team expanded significantly:</p>
        <ul>
          <li>Grew from 40 to 75 team members</li>
          <li>Opened new research facility in Silicon Valley</li>
          <li>Established partnerships with MIT, Stanford, and CMU</li>
          <li>Launched internship program with 20 graduate students</li>
        </ul>

        <h2>Industry Recognition</h2>
        <p>We received numerous awards and recognition:</p>
        <ul>
          <li>Best Innovation Award at Global AI Summit</li>
          <li>Top 10 AI Startups by Tech Review</li>
          <li>Privacy Excellence Award for facial recognition system</li>
          <li>Featured in 50+ media publications</li>
        </ul>

        <h2>Community Impact</h2>
        <p>We strengthened our commitment to the AI community:</p>
        <ul>
          <li>Hosted 12 workshops and webinars</li>
          <li>Launched AI Ethics workshop series</li>
          <li>Released 8 open-source tools and libraries</li>
          <li>Engaged 100,000+ developers worldwide</li>
        </ul>

        <h2>Customer Success</h2>
        <p>Our solutions powered innovation for customers:</p>
        <ul>
          <li>Deployed in 500+ production environments</li>
          <li>Processed 2+ billion images</li>
          <li>Achieved 99.9% API uptime</li>
          <li>Customer satisfaction score of 4.8/5</li>
        </ul>

        <h2>Financial Growth</h2>
        <p>We achieved strong business results:</p>
        <ul>
          <li>300% year-over-year revenue growth</li>
          <li>Secured Series B funding of $50M</li>
          <li>Expanded to 15 countries</li>
          <li>Formed strategic partnerships with Fortune 500 companies</li>
        </ul>

        <h2>Looking to 2024</h2>
        <p>We're entering 2024 with ambitious plans and exciting opportunities. Our roadmap includes new research initiatives, product innovations, and continued commitment to responsible AI development.</p>

        <h2>Thank You</h2>
        <p>These achievements wouldn't be possible without our incredible team, supportive partners, and engaged community. Thank you for being part of our journey. Here's to an even more successful 2024!</p>
      `,
      category: "company",
      date: "2023-12-15",
      author: "Emma Rodriguez",
      authorRole: "VP of Operations",
      readTime: "8 min read",
      image: "from-amber-600 to-yellow-500",
      tags: ["Year Review", "Achievements", "Company Milestones", "2023"],
    },
  ];

  // Related articles (from fallback for now)
  const relatedArticles = newsArticles
    .filter((a) => a.id !== newsId && a.category === getCategory(displayNews))
    .slice(0, 3);

  // Not found state
  if (!loading && !news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">Article Not Found</h2>
          <p className="text-gray-500 mb-8">The article you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/news')}
            className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors duration-300"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section
        className="relative py-20 pt-32 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-white/80 mb-8">
            <button
              onClick={() => router.push("/")}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <svg
              className="w-4 h-4 mx-2"
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
            <button
              onClick={() => router.push("/news")}
              className="hover:text-white transition-colors"
            >
              News
            </button>
            <svg
              className="w-4 h-4 mx-2"
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
            <span className="text-white">Article</span>
          </div>

          {/* Article Header */}
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-semibold rounded-full capitalize mb-6">
              {getCategory(displayNews)}
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {displayNews?.title}
            </h1>

            <p className="text-xl text-white/90 mb-8">{displayNews?.excerpt || displayNews?.content?.substring(0, 200) + '...'}</p>

            <div className="flex items-center justify-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(displayNews?.created_at || displayNews?.date || new Date().toISOString())}
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {getReadTime(displayNews?.content) || displayNews?.readTime || '5 min read'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Author Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {(displayNews?.creator_name || displayNews?.author || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {displayNews?.creator_name || displayNews?.author || 'Admin'}
                  </div>
                  <div className="text-gray-600">{displayNews?.authorRole || 'Writer'}</div>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 md:p-12 mb-12">
              <div
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdown(displayNews?.fullContent || displayNews?.content || 'No content available.')
                }}
              />

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Tags:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(displayNews?.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg border border-amber-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Share this article:
                </h3>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Twitter
                  </button>
                  <button className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
                    LinkedIn
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    WhatsApp
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

            {/* Back to News Button */}
            <div className="text-center mb-12">
              <button
                onClick={() => router.push("/news")}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                ← Back to All News
              </button>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Related Articles
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedArticles.map((related) => (
                    <div
                      key={related.id}
                      onClick={() => router.push(`/news/${related.id}`)}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                    >
                      <div
                        className={`h-40 bg-gradient-to-br ${related.image} relative`}
                      >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {related.excerpt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
