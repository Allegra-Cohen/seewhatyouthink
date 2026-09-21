import type { Metadata } from "next";
import { Lato, EB_Garamond } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_OG_IMAGE } from "@/lib/site";

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
  // Lets pages use relative URLs for canonical links and preview images.
  metadataBase: new URL(SITE_URL),
  // Pages that set a title get " · See what you think" after it; the rest show the bare name.
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.png",
  },
  authors: [{ name: "Allegra A. Beal Cohen" }],
  // Posts replace this with their own card — see lib/post-metadata.ts.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [SITE_OG_IMAGE.url],
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
