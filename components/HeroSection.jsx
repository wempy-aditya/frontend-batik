"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const HeroSection = () => {
  const [hoverButton, setHoverButton] = useState(null);
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C7A3C' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent leading-tight">
                Integrated Informatics
                <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Innovation Platform
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
                Explore Data Science, Software Engineering, Computer Networks,
                and Smart Game Development in a unified environment designed for
                research, innovation, and real-world applications.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => router.push("/projects")}
                onMouseEnter={() => setHoverButton("explore")}
                onMouseLeave={() => setHoverButton(null)}
                className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Explore Projects</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      hoverButton === "explore" ? "translate-x-1" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Main Mockup Container */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                {/* Mock UI Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full flex-1 max-w-32"></div>
                </div>

                {/* Mock Gallery Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    "/data_science.png",
                    "/software_development.png",
                    "/computer_network.png",
                    "/smart_game.png",
                  ].map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                    >
                      <Image
                        src={src}
                        alt={`Batik Sample ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                    </div>
                  ))}
                </div>

                {/* Mock Controls */}
                <div className="space-y-3">
                  <div className="h-3 bg-white/20 rounded-full w-3/4"></div>
                  <div className="h-3 bg-white/20 rounded-full w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-purple-500/30 rounded-lg flex-1"></div>
                    <div className="h-8 bg-pink-500/30 rounded-lg w-16"></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements around mockup */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-60 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-sm opacity-60 animate-bounce delay-1000"></div>
              <div className="absolute top-1/2 -right-8 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-sm opacity-60 animate-bounce delay-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
