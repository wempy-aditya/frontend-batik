"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (isMoreDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsMoreDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    checkAuth();

    // Listen for storage changes (logout from dashboard)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("storage", checkAuth);
    };
  }, [isMoreDropdownOpen]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Datasets", path: "/datasets" },
    { name: "Publications", path: "/publications" },
  ];

  const moreItems = [
    { name: "News", path: "/news" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path) => pathname === path;
  const isMoreActive = () => moreItems.some(item => pathname === item.path);

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
          <div className="hidden xl:flex items-center gap-2">
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
            
            {/* More Dropdown */}
            <div className="relative dropdown-container">
              <div
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-300 flex items-center gap-1 ${
                  isMoreActive()
                    ? isScrolled
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                      : "bg-white/20 backdrop-blur-sm text-white"
                    : isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
              >
                More
                <svg className={`w-4 h-4 transition-transform duration-200 ${isMoreDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Dropdown Menu */}
              {isMoreDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {moreItems.map((item) => (
                    <div
                      key={item.path}
                      onClick={() => {
                        router.push(item.path);
                        setIsMoreDropdownOpen(false);
                      }}
                      className={`px-4 py-2.5 cursor-pointer transition-all duration-200 ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden xl:flex items-center gap-3">
            {/* <button
              // onClick={() => router.push("/demo")}
              onClick={() => router.push("/test-api")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                isScrolled
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl"
                  : "bg-white text-amber-900 hover:bg-amber-50"
              }`}
            >
              Create Batik
            </button> */}

            {isAuthenticated ? (
              <button
                onClick={() => router.push("/dashboard")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  isScrolled
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  isScrolled
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Admin Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`xl:hidden p-2 rounded-lg transition-colors duration-300 ${
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
          className={`xl:hidden overflow-y-auto transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-[calc(100vh-5rem)] pb-6" : "max-h-0"
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
            
            {/* More Section in Mobile */}
            <div className={`px-4 py-2 font-semibold text-xs ${isScrolled ? "text-gray-500" : "text-white/70"}`}>
              MORE
            </div>
            {moreItems.map((item) => (
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

            {isAuthenticated ? (
              <button
                onClick={() => {
                  router.push("/dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  router.push("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Admin Login
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
