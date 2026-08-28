import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduManage | Modern Education & Student Management System',
  description: 'A comprehensive digital school administration portal for teachers, students, and administrators to track academic records, attendance, exams, and fee status.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="glow-bg"></div>
        {children}
      </body>
    </html>
  );
}
