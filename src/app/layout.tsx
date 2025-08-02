import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FlashcardsSidebar } from "@/components/flashcards/FlashcardsSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Interactive Flashcards | Study Platform with Code Editor',
  description: 'Master any subject with interactive flashcards featuring live code execution. Create custom study folders, practice coding, and track your learning progress in real-time.',
  icons: '/favicon.png',
  keywords: [
    'interactive flashcards',
    'code editor',
    'study platform',
    'learning tool',
    'flashcard app',
    'code execution',
    'educational software',
    'study cards',
    'programming practice',
    'Monaco editor',
    'learning progress',
    'study folders'
  ],
  authors: [{ name: 'Bhavishya Sahdev' }],
  openGraph: {
    title: 'Interactive Flashcards | Study Platform with Code Editor',
    description: 'Master any subject with interactive flashcards featuring live code execution. Create custom study folders, practice coding, and track your learning progress in real-time.',
    images: 'https://media.licdn.com/dms/image/v2/D4D03AQELzkUlqIL7IA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1681539369602?e=1757548800&v=beta&t=qqPkLnukNCdXAlqBoVnECW4tSAbeujj3azLjIx0saP8',
    url: 'https://bhavishya.dev/blog',
    type: 'website',
    siteName: 'Bhavishya Sahdev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Flashcards | Study Platform with Code Editor',
    description: 'Master any subject with interactive flashcards featuring live code execution. Create custom study folders, practice coding, and track your learning progress in real-time.',
    images: 'https://media.licdn.com/dms/image/v2/D4D03AQELzkUlqIL7IA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1681539369602?e=1757548800&v=beta&t=qqPkLnukNCdXAlqBoVnECW4tSAbeujj3azLjIx0saP8',
    creator: '@bhavishyasahdev', // Update with your actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-KHB9V83T" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <SidebarProvider>
          <FlashcardsSidebar />
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
