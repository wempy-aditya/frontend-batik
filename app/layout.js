import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Vision Lab - Advanced Image Processing Platform",
  description:
    "Experience Image Retrieval, Classification, and Generative AI — all in one place. Unlock the power of cutting-edge computer vision technology.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
