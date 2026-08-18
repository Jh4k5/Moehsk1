import type { Metadata } from "next";
import { Cairo, Tajawal, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { PaywallProvider } from "@/lib/paywall-context";
import { LangController } from "@/components/LangController";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "جسر إلى الصين — تعلّم اللغة الصينية",
  description:
    "منصة عربية لتعلّم اللغة الصينية من الصفر حتى HSK 3: مفردات وقواعد وكتابة الحروف ونطق ومحادثات، بمسار متدرّج يبدأ من أول درس.",
  icons: {
    icon: [{ url: "/brand/app-icon.svg", type: "image/svg+xml" }],
    apple: "/brand/app-icon.svg",
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
        className={`${cairo.variable} ${tajawal.variable} ${notoSansSC.variable} antialiased bg-background text-foreground font-arabic`}
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
