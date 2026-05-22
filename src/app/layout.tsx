import './globals.css';
import { Providers } from '@/components/providers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StudyPulse - Smart Study Repetition & Analytics',
  description: 'StudyPulse is a smart study reinforcement and progress analytics platform for ICSE Class 10 students.',
  keywords: ['study tracker', 'ICSE Class 10', 'spaced repetition', 'study analytics', 'homework planner', 'tuition log'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
