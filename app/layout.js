import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ConditionalLayout from "../components/ConditionalLayout";
import { AuthProvider } from "../components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Batik AI Studio",
  description:
    "Integrated platform for Batik pattern AI research, generative models, and creative computing — Data Science, Computer Vision, and Software Engineering.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
