import type { Metadata } from "next";
import { Tajawal, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  weight: ["400", "700"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "HSK 1 — تعلم اللغة الصينية",
  description: "منصة شاملة لتعلم اللغة الصينية للمستوى الأول (HSK 1) للمتحدثين بالعربية",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${tajawal.variable} ${notoSansSC.variable} ${notoSerifSC.variable} antialiased bg-background text-foreground font-arabic`}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
