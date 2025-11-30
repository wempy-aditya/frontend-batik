"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Datasets", path: "/datasets" },
    { name: "Publications", path: "/publications" },
    { name: "Features", path: "/features" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Datasets", path: "/datasets" },
    { name: "Publications", path: "/publications" },
    { name: "Features", path: "/features" },
    { name: "Creator Studio", path: "/test-api" },
    { name: "Advanced Studio", path: "/advanced-batik" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:block">
              <div
                className={`text-xl font-bold transition-colors duration-300 ${
                  isScrolled ? "text-gray-900" : "text-white"
                }`}
              >
                AI Vision
              </div>
              <div
                className={`text-xs transition-colors duration-300 ${
                  isScrolled ? "text-gray-600" : "text-gray-300"
                }`}
              >
                Image Processing Platform
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <div
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-300 ${
                  isActive(item.path)
                    ? isScrolled
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                      : "bg-white/20 backdrop-blur-sm text-white"
                    : isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {item.name}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              // onClick={() => router.push("/demo")}
              onClick={() => router.push("/test-api")}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                isScrolled
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl"
                  : "bg-white text-amber-900 hover:bg-amber-50"
              }`}
            >
              Create Batik
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
              isScrolled
                ? "text-gray-900 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-96 pb-6" : "max-h-0"
          }`}
        >
          <div className="space-y-2 pt-4">
            {navItems.map((item) => (
              <div
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium cursor-pointer transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                    : isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/10 backdrop-blur-sm"
                }`}
              >
                {item.name}
              </div>
            ))}
            <button
              onClick={() => {
                //router.push("/demo");
                router.push("/test-api");
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold shadow-lg"
            >
              Create Batik
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
