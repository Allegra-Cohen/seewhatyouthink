import type { Metadata } from "next";
import { Lato, EB_Garamond } from "next/font/google";
import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: "See what you think",
  description: "Allegra Cohen's blog",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "See what you think",
    description: "Allegra Cohen's blog",
    images: [{ url: "https://seewhatuthink.com/drawings/blog_picture.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} ${garamond.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
