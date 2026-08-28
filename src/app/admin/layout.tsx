import { redirect } from 'next/navigation';
import { getMockSession } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getMockSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="dashboard-container">
      <Sidebar
        role="ADMIN"
        userName={session.name}
        userEmail={session.email}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
