import type { Metadata } from "next";
import { Tajawal, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { PaywallProvider } from "@/lib/paywall-context";
import { LangController } from "@/components/LangController";

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
  title: "Jisr — تعلم اللغة الصينية",
  description: "منصة جِسر لتعلم اللغة الصينية للمستوى الأول (HSK 1) للمتحدثين بالعربية",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark') { document.documentElement.classList.add('dark'); document.documentElement.classList.remove('light'); }
              else { document.documentElement.classList.add('light'); document.documentElement.classList.remove('dark'); }
            } catch(e) { document.documentElement.classList.add('light'); }
            try {
              var s = JSON.parse(localStorage.getItem('hsk-learning-storage')||'{}');
              var lang = (s && s.state && s.state.lang) || 'ar';
              document.documentElement.lang = lang;
              document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
              document.documentElement.classList.add(lang === 'en' ? 'lang-en' : 'lang-ar');
            } catch(e) {}
          })();
        ` }} />
      </head>
      <body
        className={`${tajawal.variable} ${notoSansSC.variable} ${notoSerifSC.variable} antialiased bg-background text-foreground font-arabic`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <PaywallProvider>
            <LangController />
            {children}
          </PaywallProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
