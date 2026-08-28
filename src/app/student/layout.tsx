import { redirect } from 'next/navigation';
import { getMockSession } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getMockSession();

  if (!session || session.role !== 'STUDENT') {
    redirect('/');
  }

  return (
    <div className="dashboard-container">
      <Sidebar
        role="STUDENT"
        userName={session.name}
        userEmail={session.email}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
