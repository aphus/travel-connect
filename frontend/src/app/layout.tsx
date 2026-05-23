import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TripConnect - Kết nối hành trình, chia sẻ trải nghiệm",
  description: "Mạng xã hội du lịch giúp ghép nhóm, lên kế hoạch và đánh giá độ uy tín chuyến đi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-full bg-background antialiased`}>
        {/* Thanh điều hướng Header */}
        <Header />

        {/* Phần nội dung chính của trang web */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Chân trang Footer */}
        <Footer />
      </body>
    </html>
  );
}