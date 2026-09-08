import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'ExamSetu - National Exam & Opportunity Intelligence Platform',
  description:
    'Authoritative, continuously verified intelligence on Indian examinations (CBSE, MPBSE, NEET, JEE, UPSC, SSC, CUET) and Government Scholarships. Zero clickbait, 100% official sources.',
  keywords: [
    'ExamSetu',
    'NEET 2027',
    'JEE Main 2027',
    'CBSE Class 12 Board Exam Date',
    'MP Board 12th Result',
    'UPSC CSE Notification',
    'NSP Scholarship Portal',
    'Indian Government Jobs',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://examsetu.in'),
  openGraph: {
    title: 'ExamSetu - India’s Exam & Opportunity Intelligence Platform',
    description: 'Verified exam dates, admit cards, results, and scholarship deadlines direct from official conducting bodies.',
    url: 'https://examsetu.in',
    siteName: 'ExamSetu',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
