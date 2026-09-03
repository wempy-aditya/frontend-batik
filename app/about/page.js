"use client";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/basePath";

export default function AboutPage() {
  const router = useRouter();

  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Lead AI Researcher",
      image: "from-amber-500 via-orange-500 to-red-500",
      description:
        "PhD in Computer Vision with 10+ years experience in deep learning",
      social: { linkedin: "#", twitter: "#", github: "#" },
    },
    {
      name: "Michael Chen",
      role: "Senior ML Engineer",
      image: "from-orange-500 via-amber-500 to-yellow-500",
      description:
        "Specialized in generative models and image processing pipelines",
      social: { linkedin: "#", twitter: "#", github: "#" },
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist",
      image: "from-yellow-500 via-amber-500 to-orange-500",
      description: "Expert in dataset curation and model evaluation",
      social: { linkedin: "#", twitter: "#", github: "#" },
    },
    {
      name: "David Park",
      role: "Product Designer",
      image: "from-red-500 via-orange-500 to-amber-500",
      description: "Creating intuitive interfaces for complex AI systems",
      social: { linkedin: "#", twitter: "#", github: "#" },
    },
  ];

  const values = [
    {
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      title: "Innovation",
      description:
        "Pushing the boundaries of batik research by leveraging AI and machine learning to discover new creative patterns and insights",
    },
    {
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      title: "Excellence in Research",
      description:
        "Providing robust datasets and tools — from batik pattern generators to classification models — to support academic and practical research",
    },
    {
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      title: "Collaboration",
      description:
        "Valuing open collaboration across disciplines, institutions, and cultures to broaden the impact and appreciation of batik art worldwide",
    },
    {
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      title: "Cultural Preservation",
      description:
        "Honoring Indonesia's batik heritage by combining traditional art with modern computational techniques, ensuring cultural wisdom lives on",
    },
  ];

  const milestones = [
    {
      year: "Start",
      event:
        "Batik UMM began as a visionary project to blend cultural heritage with futuristic technology",
    },
    {
      year: "Gen",
      event:
        "Developed AI-based generation of new batik motifs using deep learning models",
    },
    {
      year: "Class",
      event: "Built advanced classification models for batik pattern recognition",
    },
    {
      year: "Retrieval",
      event: "Created pattern retrieval systems for researchers and designers",
    },
    {
      year: "Data",
      event: "Curated extensive batik datasets for academic and creative use",
    },
    {
      year: "Now",
      event:
        "Supporting the batik community with state-of-the-art digital resources, making research accessible and future-ready",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900">

      {/* ── Hero Section ── */}
      <section className="relative py-12 pt-24 md:py-20 md:pt-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-xs md:text-sm text-gray-400 mb-6 md:mb-8">
            <button
              onClick={() => router.push(withBasePath("/"))}
              className="hover:text-amber-400 transition-colors"
            >
              Home
            </button>
            <svg className="w-3 h-3 md:w-4 md:h-4 mx-1.5 md:mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-amber-400">About Us</span>
          </div>

          {/* Title */}
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 md:mb-6">
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400 mr-1.5 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs md:text-sm font-semibold text-amber-200">Our Story</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Tentang Batik UMM
            </h1>
            <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Memberdayakan penelitian dan inovasi pelestarian budaya Batik Nusantara melalui
              kolaborasi dan pemanfaatan teknologi mutakhir.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission Section ── */}
      <section className="py-10 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/10 p-6 md:p-10 lg:p-12">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 text-center">
                Misi Kami
              </h2>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                Di Batik UMM, misi kami adalah mendorong penelitian dan inovasi
                dalam budaya Batik melalui kolaborasi dan teknologi canggih. Kami 
                bertujuan untuk menyediakan alat bantu komprehensif, dataset,
                serta sistem cerdas — termasuk model generatif berbasis AI,
                sistem klasifikasi, dan pencarian pola (retrieval) — guna 
                mendukung peneliti, desainer, serta penggiat budaya dalam 
                mengeksplorasi dan melestarikan motif Batik Nusantara.
              </p>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                Melalui misi ini, kami berupaya melestarikan dan memperluas 
                tradisi luhur Batik dengan mengintegrasikan *deep learning* serta 
                keterlibatan komunitas ke dalam aplikasi digital dan penelitian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values Section ── */}
      <section className="py-10 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-6">Nilai-Nilai Kami</h2>
            <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto">
              Prinsip yang memandu seluruh kegiatan inovasi dan riset kami
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-5 md:p-6 bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={value.icon} />
                  </svg>
                </div>
                <h3 className="text-base md:text-xl font-bold text-white mb-2 md:mb-3">{value.title}</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline Section ── */}
      <section className="py-10 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-6">Perjalanan Kami</h2>
            <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto">
              Tonggak penting dalam perkembangan penelitian Batik UMM
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-4 md:gap-6 mb-6 md:mb-8 group">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-11 h-11 md:w-14 md:h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {milestone.year}
                  </div>
                  {index !== milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-amber-500/50 to-transparent mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-6 md:pb-8 pt-2 md:pt-3">
                  <div className="text-gray-300 text-sm md:text-lg leading-relaxed">{milestone.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section — hidden */}
      <section className="py-20 relative hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">The brilliant minds behind AI Vision</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className={`aspect-square bg-gradient-to-br ${member.image} relative`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-full" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m30 60l30-30h-60l30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: "60px 60px" }}></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <div className="text-amber-400 text-sm mb-3">{member.role}</div>
                    <p className="text-gray-300 text-sm mb-4">{member.description}</p>
                    <div className="flex gap-3">
                      {["linkedin", "twitter", "github"].map((s) => (
                        <a key={s} href={member.social[s]} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors duration-300">
                          <span className="text-white text-xs">{s[0].toUpperCase()}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-10 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl md:rounded-3xl p-7 md:p-12 text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-6">
                Bergabung Bersama Kami
              </h2>
              <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed">
                Jadilah bagian dari komunitas riset Batik. Apakah Anda seorang 
                peneliti, desainer, atau penggiat budaya, selalu ada ruang untuk Anda 
                berkarya bersama kami.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                <button
                  onClick={() => router.push(withBasePath("/contact"))}
                  className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-white text-amber-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
                >
                  Hubungi Kami
                </button>
                <button
                  onClick={() => router.push(withBasePath("/projects"))}
                  className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 text-sm md:text-base"
                >
                  Lihat Proyek
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
