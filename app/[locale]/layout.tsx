import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Metadata } from "next";
import config from "@/config";
import { Analytics } from "@vercel/analytics/react";
import SiteChrome from "@/components/site/SiteChrome";
import { SITE_BRAND } from "@/components/site/constants";
import "./globals.css";
import "@/styles/image-site.css";
import "@/styles/image-pricing.css";
import "@/styles/site-bridge.css";

export const metadata: Metadata = {
  title: SITE_BRAND.seoTitle,
  description: SITE_BRAND.seoDescription,
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: SITE_BRAND.seoTitle,
    description: SITE_BRAND.seoDescription,
    url: config.WebUrl,
    siteName: SITE_BRAND.name,
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_BRAND.seoTitle,
    description: SITE_BRAND.seoDescription,
  },
  keywords: [
    "gpt image",
    "批量绘画",
    "CobabaAi",
    "nano-banana",
    "图像 API",
  ],
  robots: "index, follow",
  alternates: {
    canonical: config.WebUrl,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} className="site-image" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Instrument+Serif:ital@0;1&family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+SC:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#fff9f4" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider>
            <SiteChrome>{children}</SiteChrome>
          </NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
