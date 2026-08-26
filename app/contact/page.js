"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamic import for Map component to avoid SSR issues
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-64 md:h-96 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 flex items-center justify-center">
      <div className="text-white text-sm">Loading map...</div>
    </div>
  ),
});

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", category: "general", message: "" });
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      title: "Email",
      content: "aguseko@umm.ac.id",
      link: "mailto:aguseko@umm.ac.id",
    },
    {
      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      title: "Telepon",
      content: "(0341) 464318, ext 252",
      link: "tel:(0341)464318",
    },
    {
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
      title: "Kantor",
      content: "Jl. Raya Tlogomas No.246, Jawa Timur 65144, Indonesia",
      link: "#",
    },
    {
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "Jam Kerja",
      content: "Senin - Jumat: 8:00 - 16:00 WIB",
      link: "#",
    },
  ];

  const faqs = [
    {
      question: "How can I access your datasets?",
      answer: "All our datasets are available through our platform. Simply create an account and browse our dataset collection.",
    },
    {
      question: "Do you offer enterprise solutions?",
      answer: "Yes, we provide customized enterprise solutions. Contact our sales team to discuss your specific needs.",
    },
    {
      question: "Can I contribute to your research?",
      answer: "Absolutely! We welcome collaboration. Reach out to our research team to explore partnership opportunities.",
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
            <button onClick={() => router.push("/")} className="hover:text-amber-400 transition-colors">
              Home
            </button>
            <svg className="w-3 h-3 md:w-4 md:h-4 mx-1.5 md:mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-amber-400">Hubungi Kami</span>
          </div>

          {/* Title */}
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 md:mb-6">
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400 mr-1.5 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs md:text-sm font-semibold text-amber-200">Hubungi Kami</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Hubungi Kami
            </h1>
            <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Punya pertanyaan atau ingin berkolaborasi dalam proyek Batik? Kami 
              ingin mendengarnya dari Anda.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact Info Cards ── */}
      <section className="py-8 md:py-12 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-16">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.link}
                className="p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={info.icon} />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-bold text-white mb-1 md:mb-2">{info.title}</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">{info.content}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Map Section ── */}
      <section className="py-8 md:py-12 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/10 p-5 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
                Kunjungi Kantor Kami
              </h3>
              <MapComponent />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
