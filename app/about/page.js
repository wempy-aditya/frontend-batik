"use client";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Lead AI Researcher",
      image: "from-amber-500 via-orange-500 to-red-500",
      description:
        "PhD in Computer Vision with 10+ years experience in deep learning",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      name: "Michael Chen",
      role: "Senior ML Engineer",
      image: "from-orange-500 via-amber-500 to-yellow-500",
      description:
        "Specialized in generative models and image processing pipelines",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist",
      image: "from-yellow-500 via-amber-500 to-orange-500",
      description: "Expert in dataset curation and model evaluation",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      name: "David Park",
      role: "Product Designer",
      image: "from-red-500 via-orange-500 to-amber-500",
      description: "Creating intuitive interfaces for complex AI systems",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
  ];

  const values = [
    {
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      title: "Innovation",
      description:
        "Pushing the boundaries of what's possible with AI and computer vision technology",
    },
    {
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      title: "Collaboration",
      description:
        "Building partnerships with researchers and institutions worldwide",
    },
    {
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "Quality",
      description:
        "Maintaining highest standards in research, development, and deployment",
    },
    {
      icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "Open Science",
      description:
        "Contributing to the global AI community through open-source projects",
    },
  ];

  const milestones = [
    {
      year: "2020",
      event: "Founded with a vision to democratize AI image processing",
    },
    {
      year: "2021",
      event: "Released first open-source dataset with 50K+ annotated images",
    },
    {
      year: "2022",
      event: "Reached 100K+ active users and 500+ research citations",
    },
    {
      year: "2023",
      event: "Launched advanced generative models and processing pipeline",
    },
    {
      year: "2024",
      event: "Partnered with 50+ universities and research institutions",
    },
    {
      year: "2025",
      event: "Expanded to 1M+ users with enterprise-grade solutions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900">
      {/* Hero Section */}
      <section className="relative py-20 pt-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-400 mb-8">
            <button
              onClick={() => router.push("/")}
              className="hover:text-amber-400 transition-colors"
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
            <span className="text-amber-400">About Us</span>
          </div>

          {/* Title */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <svg
                className="w-4 h-4 text-amber-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-semibold text-amber-200">
                Our Story
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About AI Vision
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're building the future of AI-powered image processing and
              computer vision, making advanced technology accessible to
              researchers and developers worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                We believe that advanced AI technology should be accessible to
                everyone. Our mission is to democratize computer vision and
                image processing by providing cutting-edge tools, comprehensive
                datasets, and educational resources to researchers, developers,
                and organizations worldwide.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Through continuous innovation and collaboration with the global
                AI community, we're pushing the boundaries of what's possible
                with artificial intelligence, making it easier for everyone to
                build intelligent visual systems.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl">
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m30 60l30-30h-60l30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: "60px 60px",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Our Values</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={value.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Our Journey</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Key milestones in our evolution
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 mb-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {milestone.year.slice(2)}
                  </div>
                  {index !== milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-amber-500/50 to-transparent mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="text-amber-400 font-bold text-lg mb-2">
                    {milestone.year}
                  </div>
                  <div className="text-gray-300 text-lg">{milestone.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 relative hidden">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The brilliant minds behind AI Vision
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  {/* Avatar */}
                  <div
                    className={`aspect-square bg-gradient-to-br ${member.image} relative`}
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m30 60l30-30h-60l30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                          backgroundSize: "60px 60px",
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {member.name}
                    </h3>
                    <div className="text-amber-400 text-sm mb-3">
                      {member.role}
                    </div>
                    <p className="text-gray-300 text-sm mb-4">
                      {member.description}
                    </p>

                    {/* Social Links */}
                    <div className="flex gap-3">
                      <a
                        href={member.social.linkedin}
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors duration-300"
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                      <a
                        href={member.social.twitter}
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors duration-300"
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                        </svg>
                      </a>
                      <a
                        href={member.social.github}
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors duration-300"
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Be part of the AI revolution. Whether you're a researcher,
              developer, or enthusiast, there's a place for you in our
              community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.push("/contact")}
                className="px-8 py-4 bg-white text-amber-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Get In Touch
              </button>
              <button
                onClick={() => router.push("/projects")}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                View Projects
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
