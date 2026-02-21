"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Halaman-halaman yang tidak punya hero section gelap
  // Header akan selalu solid (tidak transparan) di halaman-halaman ini
  const solidHeaderPages = [
    "/pdf-viewer",
    // Tambahkan halaman lain yang membutuhkan header solid di sini
  ];

  // Cek apakah halaman saat ini membutuhkan header solid
  const needsSolidHeader = solidHeaderPages.some((page) =>
    pathname?.startsWith(page),
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      setIsAuthenticated(!!token);
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (isMoreDropdownOpen && !event.target.closest(".dropdown-container")) {
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Datasets", path: "/datasets" },
    { name: "Publications", path: "/publications" },
    { name: "Capstone", path: "/capstone" },
  ];

  const moreItems = [
    { name: "News", path: "/news" },
    { name: "PDF Viewer", path: "/pdf-viewer" },
    // { name: "Batik Inpainting", path: "/inpainting" },
    // { name: "Batik ControlNet", path: "/controlnet" },
    // { name: "Batik IP-Adapter", path: "/ip-adapter" },
    // { name: "Batik Multi-ControlNet", path: "/multi-controlnet" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path) => pathname === path;
  const isMoreActive = () => moreItems.some((item) => pathname === item.path);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isMobileMenuOpen
            ? "bg-white shadow-lg"
            : isScrolled || needsSolidHeader
              ? "bg-white/95 backdrop-blur-lg shadow-lg"
              : "bg-transparent"
        }`}
      >
        <nav className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              onClick={() => router.push("/")}
              className="flex items-center gap-3 cursor-pointer group z-50"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden transform group-hover:scale-110 transition-transform duration-300 shadow-lg bg-white">
                  <Image
                    src="/logo_rispro.png"
                    alt="RISPRO Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <div
                  className={`text-xl font-bold transition-colors duration-300 ${
                    isMobileMenuOpen || isScrolled || needsSolidHeader
                      ? "text-gray-900"
                      : "text-white"
                  }`}
                >
                  RISPRO
                </div>
                <div
                  className={`text-xs transition-colors duration-300 ${
                    isMobileMenuOpen || isScrolled || needsSolidHeader
                      ? "text-gray-600"
                      : "text-gray-300"
                  }`}
                ></div>
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
                      ? isScrolled || needsSolidHeader
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                        : "bg-white/20 backdrop-blur-sm text-white"
                      : isScrolled || needsSolidHeader
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
                      ? isScrolled || needsSolidHeader
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                        : "bg-white/20 backdrop-blur-sm text-white"
                      : isScrolled || needsSolidHeader
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-white hover:bg-white/10"
                  }`}
                >
                  More
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isMoreDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
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
              {isAuthenticated ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                    isScrolled || needsSolidHeader
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                    isScrolled || needsSolidHeader
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Masuk
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`xl:hidden p-2 rounded-lg transition-all duration-300 z-50 ${
                isMobileMenuOpen
                  ? "bg-gray-100 text-gray-900"
                  : isScrolled || needsSolidHeader
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
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-20 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-40 xl:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto px-6 py-6">
          <div className="space-y-2">
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
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </div>
            ))}

            {/* More Section in Mobile */}
            <div className="px-4 py-2 font-semibold text-xs text-gray-500 mt-4">
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
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </div>
            ))}

            <div className="pt-4 space-y-3 border-t border-gray-200 mt-4">
              <button
                onClick={() => {
                  router.push("/test-api");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Batik
              </button>

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all duration-300"
                >
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    router.push("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all duration-300"
                >
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Masuk
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
