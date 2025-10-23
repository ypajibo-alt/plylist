import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const tubiStans = localFont({
  src: [
    {
      path: '../public/fonts/TubiStansBlack.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../public/fonts/TubiStans-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/TubiStansVariable.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-tubi',
  display: 'swap',
});

const inter = localFont({
  src: '../public/fonts/InterVariable.ttf',
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Tubi Playlist Builder",
  description: "Create and share your custom Tubi playlists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${tubiStans.variable} ${inter.variable}`}>
      <body className="font-inter">{children}</body>
    </html>
  );
}

