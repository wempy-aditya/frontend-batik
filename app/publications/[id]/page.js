"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function PublicationDetailPage() {
  const params = useParams();
  const publicationId = parseInt(params.id);
  const [activeTab, setActiveTab] = useState('abstract');
  const [selectedCitation, setSelectedCitation] = useState('bibtex');

  // Data publications (sama dengan di halaman publications)
  const publications = [
    {
      id: 1,
      title: "Attention-Based Neural Networks for Image Classification: A Comprehensive Survey",
      abstract: "This paper presents a comprehensive survey of attention mechanisms in neural networks for image classification tasks. We analyze various attention architectures, including spatial attention, channel attention, and self-attention mechanisms, providing insights into their effectiveness across different datasets and computational requirements.",
      fullAbstract: "In recent years, attention mechanisms have emerged as a powerful tool in deep learning, particularly for image classification tasks. This comprehensive survey examines the evolution and application of various attention architectures in neural networks. We provide an in-depth analysis of spatial attention, which focuses on 'where' to attend in the input image; channel attention, which determines 'what' features to emphasize; and self-attention mechanisms, which capture long-range dependencies within the feature maps. Our study covers over 50 different attention-based architectures, evaluating their performance across multiple benchmark datasets including ImageNet, CIFAR-100, and MS-COCO. We discuss the computational trade-offs of different attention mechanisms, providing practical guidelines for selecting appropriate architectures based on application requirements. The survey also identifies current challenges and proposes future research directions in attention-based deep learning.",
      authors: ["Dr. Sarah Chen", "Prof. Michael Rodriguez", "Dr. Elena Kovač"],
      venue: "IEEE Transactions on Pattern Analysis and Machine Intelligence",
      year: 2024,
      citations: 127,
      category: "survey",
      doi: "10.1109/TPAMI.2024.3156789",
      keywords: ["Attention Mechanisms", "Deep Learning", "Image Classification", "Neural Networks"],
      status: "Published",
      impact: "High",
      pdfSize: "2.4 MB",
      pages: "1-24",
      volume: "46",
      issue: "3",
      publisher: "IEEE",
      methodology: "We conducted a comprehensive literature review of attention mechanisms published between 2017 and 2024. We implemented and evaluated 15 representative architectures on three benchmark datasets, measuring accuracy, computational complexity, and inference time.",
      results: "Our experiments show that hybrid attention mechanisms combining spatial and channel attention achieve the best performance, with an average accuracy improvement of 3.2% over baseline models. However, this comes at a computational cost of 15-20% increased inference time.",
      conclusions: "Attention mechanisms significantly enhance the performance of image classification models by enabling them to focus on relevant features. The choice of attention architecture should be guided by the specific requirements of the application, balancing accuracy gains against computational constraints.",
      relatedWork: [
        "Vision Transformers and Self-Attention in Computer Vision",
        "Channel Attention for Efficient Deep Neural Networks",
        "Spatial Attention Mechanisms in CNNs"
      ],
      figures: [
        { id: 1, caption: "Overview of attention mechanism architectures", type: "diagram" },
        { id: 2, caption: "Performance comparison across datasets", type: "chart" },
        { id: 3, caption: "Computational complexity analysis", type: "chart" },
        { id: 4, caption: "Attention visualization examples", type: "heatmap" }
      ],
      funding: "This research was supported by NSF Grant #1234567 and DARPA Contract #ABC-123.",
      acknowledgments: "We thank the anonymous reviewers for their valuable feedback."
    },
    {
      id: 2,
      title: "Generative Adversarial Networks for High-Resolution Image Synthesis: Recent Advances",
      abstract: "We explore recent developments in generative adversarial networks (GANs) for creating high-resolution, photorealistic images. Our work introduces a novel progressive training strategy that significantly improves training stability and output quality while reducing computational costs by 40%.",
      fullAbstract: "Generative Adversarial Networks (GANs) have revolutionized image synthesis, but training them for high-resolution outputs remains challenging due to mode collapse, training instability, and computational demands. This paper introduces ProGAN-X, a novel progressive training strategy that addresses these challenges through adaptive learning rate scheduling, multi-scale discriminator architecture, and feature matching techniques. Our approach generates images up to 2048×2048 resolution with unprecedented photorealism. We demonstrate that our method achieves 40% reduction in training time compared to state-of-the-art approaches while improving image quality metrics (FID score improved by 23%). Extensive experiments on CelebA-HQ, LSUN, and custom high-resolution datasets validate the effectiveness of our approach. We also introduce new evaluation metrics specifically designed for high-resolution image synthesis.",
      authors: ["Dr. James Park", "Dr. Lisa Wang", "Prof. David Thompson"],
      venue: "Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)",
      year: 2024,
      citations: 89,
      category: "conference",
      doi: "10.1109/CVPR.2024.00892",
      keywords: ["GANs", "Image Synthesis", "Deep Learning", "Computer Vision"],
      status: "Published",
      impact: "High",
      pdfSize: "3.1 MB",
      pages: "8921-8930",
      publisher: "IEEE/CVF",
      methodology: "We implemented our progressive training strategy using PyTorch on a cluster of 8 NVIDIA A100 GPUs. Training was conducted on 1.2M images from multiple datasets. We compared our approach against StyleGAN2, StyleGAN3, and other recent GAN architectures.",
      results: "ProGAN-X achieved FID scores of 3.84 on FFHQ, 7.52 on LSUN-Church, demonstrating superior performance. Training time was reduced from 14 days to 8 days for 2048² resolution models. User studies showed 78% preference for our generated images.",
      conclusions: "Our progressive training strategy makes high-resolution GAN training more accessible by reducing computational requirements while improving output quality. This opens new possibilities for practical applications in creative industries.",
      relatedWork: [
        "StyleGAN3: Alias-Free Generative Adversarial Networks",
        "Progressive Growing of GANs for Improved Quality",
        "Analyzing and Improving the Image Quality of StyleGAN"
      ],
      figures: [
        { id: 1, caption: "Progressive training pipeline", type: "diagram" },
        { id: 2, caption: "Generated high-resolution samples", type: "gallery" },
        { id: 3, caption: "FID score comparison", type: "chart" },
        { id: 4, caption: "Training time comparison", type: "chart" }
      ],
      funding: "Supported by NVIDIA Research Grant and NSF Award #7890123.",
      acknowledgments: "Special thanks to the CVPR reviewers and our industry collaborators."
    },
    {
      id: 3,
      title: "Real-Time Object Detection in Autonomous Vehicles Using Optimized YOLO Architecture",
      abstract: "This paper introduces YOLOv5-AV, an optimized version of YOLO specifically designed for autonomous vehicle applications. Our approach achieves 94% mAP on the KITTI dataset while maintaining real-time inference speeds of 45 FPS on edge devices.",
      fullAbstract: "Autonomous vehicles require robust, real-time object detection systems that can operate reliably across diverse environmental conditions. This paper presents YOLOv5-AV, a specialized object detection architecture optimized for autonomous driving scenarios. Our modifications include: (1) a multi-scale feature fusion module designed for detecting objects at varying distances, (2) temporal consistency mechanisms that leverage information from previous frames, (3) attention mechanisms focused on road-relevant regions, and (4) model compression techniques enabling deployment on edge devices. YOLOv5-AV achieves 94.2% mAP on the KITTI benchmark dataset while operating at 45 FPS on NVIDIA Jetson Xavier NX. We demonstrate superior performance in challenging conditions including night driving, adverse weather, and crowded urban environments. Extensive real-world testing across 10,000 km of autonomous driving validates the practical applicability of our approach.",
      authors: ["Dr. Maria Santos", "Dr. Kevin Liu", "Prof. Ahmed Hassan"],
      venue: "International Conference on Robotics and Automation (ICRA)",
      year: 2024,
      citations: 156,
      category: "conference",
      doi: "10.1109/ICRA.2024.9561234",
      keywords: ["Object Detection", "YOLO", "Autonomous Vehicles", "Real-time Processing"],
      status: "Published",
      impact: "High",
      pdfSize: "4.2 MB",
      pages: "3421-3428",
      publisher: "IEEE",
      methodology: "We trained YOLOv5-AV on a combined dataset of 250K annotated images from KITTI, nuScenes, and our proprietary autonomous driving dataset. Testing was performed on NVIDIA Jetson Xavier NX and Orin platforms.",
      results: "YOLOv5-AV achieved 94.2% mAP on KITTI test set, with particularly strong performance on small objects (pedestrians at 50m+). Real-world testing showed 99.1% detection rate for safety-critical objects.",
      conclusions: "YOLOv5-AV demonstrates that specialized architectures optimized for specific domains can significantly outperform general-purpose detectors. Our approach provides a practical solution for deployment in production autonomous vehicles.",
      relatedWork: [
        "YOLOv7: Trainable Bag-of-Freebies for Real-time Object Detection",
        "PointPillars: Fast Encoders for Object Detection from Point Clouds",
        "DETR: End-to-End Object Detection with Transformers"
      ],
      figures: [
        { id: 1, caption: "YOLOv5-AV architecture diagram", type: "diagram" },
        { id: 2, caption: "Detection results in various conditions", type: "gallery" },
        { id: 3, caption: "Performance comparison on KITTI", type: "chart" },
        { id: 4, caption: "Inference time vs accuracy trade-off", type: "chart" }
      ],
      funding: "This work was supported by autonomous vehicle industry partners and DOT Grant #AV2024-89.",
      acknowledgments: "We thank our autonomous vehicle testing partners for data collection support."
    },
    {
      id: 4,
      title: "Transformer-Based Architecture for Medical Image Segmentation",
      abstract: "We propose MedViT, a transformer-based architecture specifically designed for medical image segmentation tasks. Our model achieves state-of-the-art performance on multiple medical imaging benchmarks including brain MRI, cardiac CT, and lung X-ray segmentation.",
      fullAbstract: "Medical image segmentation is crucial for disease diagnosis, treatment planning, and clinical research. While convolutional neural networks have been the dominant approach, recent advances in transformer architectures offer new possibilities for capturing long-range dependencies in medical images. This paper introduces MedViT (Medical Vision Transformer), a specialized transformer architecture designed specifically for medical image segmentation. MedViT incorporates domain-specific inductive biases including: (1) hierarchical feature extraction suited for multi-scale anatomical structures, (2) position-aware attention mechanisms that preserve spatial relationships, (3) uncertainty estimation for clinically meaningful predictions, and (4) efficient training strategies for limited medical datasets. We evaluate MedViT on five benchmark datasets covering brain MRI, cardiac CT, lung X-ray, retinal fundus, and histopathology images. MedViT achieves state-of-the-art performance with Dice scores of 91.3% on BraTS, 94.7% on ACDC cardiac segmentation, and 96.2% on Montgomery chest X-ray datasets. Clinical evaluation with radiologists demonstrates 15% reduction in annotation time and improved diagnostic confidence.",
      authors: ["Dr. Rachel Green", "Dr. Hiroshi Tanaka", "Prof. Isabella Cruz"],
      venue: "Medical Image Analysis Journal",
      year: 2024,
      citations: 78,
      category: "journal",
      doi: "10.1016/j.media.2024.102567",
      keywords: ["Medical Imaging", "Transformers", "Segmentation", "Healthcare AI"],
      status: "Published",
      impact: "Medium",
      pdfSize: "5.7 MB",
      pages: "102567",
      volume: "89",
      publisher: "Elsevier",
      methodology: "We trained MedViT on five medical imaging datasets totaling 45,000 annotated scans. Pre-training was performed on 1.2M unlabeled medical images. Clinical validation involved 12 radiologists from 3 hospitals.",
      results: "MedViT outperformed U-Net, nnU-Net, and TransUNet baselines across all datasets. Average improvement in Dice score was 2.8%. Clinical evaluation showed 92% agreement with expert annotations.",
      conclusions: "MedViT demonstrates that domain-specific transformer architectures can significantly advance medical image segmentation. Integration with clinical workflows shows promise for improving diagnostic efficiency and accuracy.",
      relatedWork: [
        "nnU-Net: Self-adapting Framework for Medical Image Segmentation",
        "TransUNet: Transformers Make Strong Encoders for Medical Image Segmentation",
        "Swin-Unet: Unet-like Pure Transformer for Medical Image Segmentation"
      ],
      figures: [
        { id: 1, caption: "MedViT architecture overview", type: "diagram" },
        { id: 2, caption: "Segmentation results across modalities", type: "gallery" },
        { id: 3, caption: "Quantitative comparison with baselines", type: "chart" },
        { id: 4, caption: "Attention visualization", type: "heatmap" }
      ],
      funding: "Supported by NIH Grant R01-HL123456 and industry partnerships.",
      acknowledgments: "We thank participating hospitals and radiologists for clinical validation."
    },
    {
      id: 5,
      title: "Federated Learning for Privacy-Preserving Computer Vision",
      abstract: "This work presents a novel federated learning framework for training computer vision models across distributed datasets while preserving privacy. We demonstrate significant improvements in model accuracy while reducing communication overhead by 60%.",
      fullAbstract: "Privacy concerns and data regulations increasingly limit the centralized collection of visual data for training computer vision models. Federated learning offers a solution by enabling collaborative model training without sharing raw data. However, existing federated learning approaches face challenges including communication efficiency, non-IID data distributions, and maintaining model performance. This paper presents FedVision, a comprehensive federated learning framework specifically designed for computer vision applications. FedVision introduces: (1) adaptive aggregation strategies that handle non-IID data distributions, (2) efficient gradient compression reducing communication costs by 60%, (3) privacy-preserving augmentation techniques, and (4) Byzantine-robust aggregation protecting against malicious participants. We demonstrate FedVision's effectiveness across image classification, object detection, and semantic segmentation tasks. Experiments on CIFAR-10, ImageNet-100, and COCO datasets with 100-1000 simulated clients show that FedVision achieves 97% of centralized training accuracy while providing strong privacy guarantees. Real-world deployment across 500 edge devices validates practical applicability.",
      authors: ["Dr. Alex Kumar", "Dr. Sophie Martin", "Prof. Chen Wei"],
      venue: "Advances in Neural Information Processing Systems (NeurIPS)",
      year: 2023,
      citations: 203,
      category: "conference",
      doi: "10.5555/nips.2023.0456",
      keywords: ["Federated Learning", "Privacy", "Distributed Systems", "Computer Vision"],
      status: "Published",
      impact: "High",
      pdfSize: "3.8 MB",
      pages: "456-469",
      publisher: "Curran Associates, Inc.",
      methodology: "We simulated federated learning scenarios with 100-1000 clients using realistic non-IID data partitions. Communication costs and privacy were measured using formal differential privacy analysis. Real-world validation used 500 mobile devices.",
      results: "FedVision achieved 97.2% of centralized accuracy on ImageNet-100 with 60% reduction in communication overhead. Privacy guarantees of ε=3.0 differential privacy were maintained throughout training.",
      conclusions: "FedVision demonstrates that federated learning can provide practical privacy-preserving solutions for computer vision without significant accuracy degradation. This enables new applications in healthcare, finance, and other privacy-sensitive domains.",
      relatedWork: [
        "FedAvg: Communication-Efficient Learning of Deep Networks",
        "Advances and Open Problems in Federated Learning",
        "FedProx: Federated Optimization in Heterogeneous Networks"
      ],
      figures: [
        { id: 1, caption: "FedVision framework architecture", type: "diagram" },
        { id: 2, caption: "Communication efficiency comparison", type: "chart" },
        { id: 3, caption: "Accuracy vs privacy trade-off", type: "chart" },
        { id: 4, caption: "Convergence under non-IID data", type: "chart" }
      ],
      funding: "Supported by NSF Award #1928765 and corporate research grants.",
      acknowledgments: "We thank edge device manufacturers for deployment support."
    },
    {
      id: 6,
      title: "Self-Supervised Learning for Visual Representation: A Comprehensive Study",
      abstract: "We conduct a comprehensive empirical study of self-supervised learning methods for visual representation learning. Our analysis covers over 15 different approaches and evaluates their performance across multiple downstream tasks.",
      fullAbstract: "Self-supervised learning has emerged as a powerful paradigm for learning visual representations without manual annotations. However, the proliferation of different methods makes it challenging to understand their relative strengths and trade-offs. This comprehensive study provides a systematic evaluation of 15 prominent self-supervised learning approaches including contrastive methods (SimCLR, MoCo, BYOL), masked image modeling (MAE, BEiT), and clustering-based methods (SwAV, DINO). We evaluate these methods across 8 downstream tasks including image classification, object detection, semantic segmentation, instance segmentation, and fine-grained recognition on 12 datasets. Our analysis reveals that no single method dominates across all tasks, but certain architectural choices and pre-training strategies consistently improve performance. We provide actionable insights for practitioners on selecting appropriate self-supervised methods based on target applications, data characteristics, and computational constraints. Additionally, we release a unified codebase and pre-trained models to facilitate future research.",
      authors: ["Dr. Emma Johnson", "Dr. Roberto Silva", "Prof. Yuki Yamamoto"],
      venue: "International Journal of Computer Vision",
      year: 2023,
      citations: 301,
      category: "journal",
      doi: "10.1007/s11263-023-01789-2",
      keywords: ["Self-Supervised Learning", "Representation Learning", "Computer Vision", "Deep Learning"],
      status: "Published",
      impact: "High",
      pdfSize: "6.3 MB",
      pages: "2789-2845",
      volume: "131",
      issue: "11",
      publisher: "Springer",
      methodology: "We implemented 15 self-supervised methods using identical training protocols. Pre-training used ImageNet-1K (1.2M images). Evaluation covered 8 downstream tasks across 12 datasets. All experiments used ViT-Base architecture for fair comparison.",
      results: "Masked image modeling (MAE) achieved best performance on dense prediction tasks (83.2% mIoU on ADE20K). Contrastive methods (MoCo v3) excelled at classification (84.1% on ImageNet). Hybrid approaches showed promising results across multiple tasks.",
      conclusions: "This comprehensive study provides evidence-based guidelines for selecting self-supervised learning methods. The choice should be guided by downstream task requirements, with masked image modeling preferred for dense prediction and contrastive learning for classification tasks.",
      relatedWork: [
        "A Survey on Contrastive Self-supervised Learning",
        "Masked Autoencoders Are Scalable Vision Learners",
        "Self-supervised Learning: Generative or Contrastive"
      ],
      figures: [
        { id: 1, caption: "Taxonomy of self-supervised methods", type: "diagram" },
        { id: 2, caption: "Performance across downstream tasks", type: "chart" },
        { id: 3, caption: "Computational cost comparison", type: "chart" },
        { id: 4, caption: "Feature space visualization", type: "embedding" }
      ],
      funding: "Funded by European Research Council Grant #802554.",
      acknowledgments: "We acknowledge computational resources provided by partner institutions."
    }
  ];

  const publication = publications.find(p => p.id === publicationId);

  if (!publication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Publication Not Found</h1>
          <p className="text-gray-600 mb-8">The publication you're looking for doesn't exist.</p>
          <div 
            onClick={() => window.location.href = '/publications'}
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            Back to Publications
          </div>
        </div>
      </div>
    );
  }

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

  const citationFormats = {
    bibtex: `@article{${publication.authors[0].split(' ').pop().toLowerCase()}${publication.year}${publication.title.split(' ')[0].toLowerCase()},
  title={${publication.title}},
  author={${publication.authors.join(' and ')}},
  journal={${publication.venue}},
  year={${publication.year}},
  doi={${publication.doi}}
}`,
    apa: `${publication.authors.join(', ')} (${publication.year}). ${publication.title}. ${publication.venue}. https://doi.org/${publication.doi}`,
    mla: `${publication.authors.join(', ')}. "${publication.title}." ${publication.venue}, ${publication.year}. doi:${publication.doi}`,
    chicago: `${publication.authors.join(', ')}. "${publication.title}." ${publication.venue} (${publication.year}). https://doi.org/${publication.doi}`
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
            <div className="flex items-center gap-2 text-gray-300">
              <div 
                onClick={() => window.location.href = '/'}
                className="hover:text-white transition-colors duration-300 cursor-pointer"
              >
                Home
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div 
                onClick={() => window.location.href = '/publications'}
                className="hover:text-white transition-colors duration-300 cursor-pointer"
              >
                Publications
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white truncate max-w-md">
                {publication.title.length > 50 ? publication.title.substring(0, 50) + '...' : publication.title}
              </span>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Publication Header */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Publication Icon */}
              <div className="lg:w-1/4">
                <div className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 shadow-2xl">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <svg className="w-20 h-20 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="text-white text-4xl font-bold opacity-80">{publication.year}</div>
                  </div>
                </div>
              </div>

              {/* Publication Info */}
              <div className="lg:w-3/4">
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getCategoryColor(publication.category)}`}>
                    {publication.category === 'conference' ? 'Conference Paper' : 
                     publication.category === 'journal' ? 'Journal Article' : 'Survey Paper'}
                  </span>
                  <span className={`px-4 py-2 text-sm font-medium rounded-full ${getImpactColor(publication.impact)}`}>
                    {publication.impact} Impact
                  </span>
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white border border-white/20">
                    {publication.citations} Citations
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                  {publication.title}
                </h1>

                {/* Authors */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {publication.authors.map((author, index) => (
                      <span
                        key={index}
                        className="text-sm text-gray-200 bg-white/10 px-4 py-2 rounded-full border border-white/20"
                      >
                        {author}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Publication Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Published In</div>
                    <div className="text-sm font-semibold text-white">{publication.venue}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Year</div>
                    <div className="text-sm font-semibold text-white">{publication.year}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Pages</div>
                    <div className="text-sm font-semibold text-white">{publication.pages}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">PDF Size</div>
                    <div className="text-sm font-semibold text-white">{publication.pdfSize}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-4 border-b-2 border-gray-200">
                  {['abstract', 'content', 'figures', 'references'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                {/* Abstract Tab */}
                {activeTab === 'abstract' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Abstract</h2>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {publication.fullAbstract}
                      </p>
                    </div>

                    {/* Keywords */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {publication.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="text-sm text-purple-700 bg-purple-100 px-4 py-2 rounded-full border border-purple-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Paper Content</h2>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Methodology</h3>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {publication.methodology}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Results</h3>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {publication.results}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Conclusions</h3>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {publication.conclusions}
                      </p>
                    </div>

                    {publication.funding && (
                      <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Funding</h4>
                        <p className="text-gray-700">{publication.funding}</p>
                      </div>
                    )}

                    {publication.acknowledgments && (
                      <div className="bg-green-50 rounded-2xl p-6 border-l-4 border-green-500">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Acknowledgments</h4>
                        <p className="text-gray-700">{publication.acknowledgments}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Figures Tab */}
                {activeTab === 'figures' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Figures & Visualizations</h2>
                      <p className="text-gray-600 mb-8">
                        Key figures and visualizations from the paper
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {publication.figures.map((figure) => (
                        <div 
                          key={figure.id}
                          className="bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-400 transition-all duration-300"
                        >
                          <div className="aspect-video bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl mb-4 flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="text-sm font-semibold text-gray-900 mb-1">Figure {figure.id}</div>
                          <div className="text-sm text-gray-600">{figure.caption}</div>
                          <div className="mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                              {figure.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* References Tab */}
                {activeTab === 'references' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Work</h2>
                      <p className="text-gray-600 mb-8">
                        Key references and related research
                      </p>
                    </div>

                    <div className="space-y-4">
                      {publication.relatedWork.map((work, index) => (
                        <div 
                          key={index}
                          className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{work}</h3>
                              <p className="text-sm text-gray-600">Related research in this area</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.location.href = `/publications/${publication.id}/pdf`}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download PDF</span>
                      </div>
                    </button>

                    <button className="w-full py-3 px-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Save to Library</span>
                      </div>
                    </button>

                    <button className="w-full py-3 px-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        <span>Share</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Citation */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Citation</h3>
                  
                  {/* Citation Format Selector */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.keys(citationFormats).map((format) => (
                      <button
                        key={format}
                        onClick={() => setSelectedCitation(format)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                          selectedCitation === format
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Citation Text */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {citationFormats[selectedCitation]}
                    </pre>
                  </div>

                  <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300">
                    Copy Citation
                  </button>
                </div>

                {/* Publication Details */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Details</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">DOI</div>
                      <div className="text-sm text-blue-600 font-mono break-all">{publication.doi}</div>
                    </div>
                    {publication.volume && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-1">Volume/Issue</div>
                        <div className="text-sm text-gray-600">Vol. {publication.volume}, Issue {publication.issue}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">Publisher</div>
                      <div className="text-sm text-gray-600">{publication.publisher}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">Status</div>
                      <div className="text-sm text-gray-600">{publication.status}</div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Citations</span>
                      <span className="text-2xl font-bold text-blue-600">{publication.citations}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Impact</span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getImpactColor(publication.impact)}`}>
                        {publication.impact}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 rounded-3xl p-12 text-center max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Interested in This Research?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Collaborate with us or explore more publications in related areas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div 
                onClick={() => window.location.href = '/contact'}
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                Contact Authors
              </div>
              <div 
                onClick={() => window.location.href = '/publications'}
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
              >
                View All Publications
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
