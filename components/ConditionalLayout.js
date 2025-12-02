"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  
  // Check if current path is admin-related (login or dashboard)
  const isAdminPage = pathname?.startsWith('/login') || pathname?.startsWith('/dashboard');

  if (isAdminPage) {
    // For admin pages, just render children without header/footer
    return <>{children}</>;
  }

  // For regular pages, render with header and footer
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}