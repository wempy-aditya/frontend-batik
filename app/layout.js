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
  title: "Riset dan Produk Informatika",
  description:
    "An integrated platform supporting Data Science, Software Engineering, Computer Networks, and Smart Game Development for research, development, and advanced computing innovation.",
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
