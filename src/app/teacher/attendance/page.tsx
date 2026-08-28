import { redirect } from 'next/navigation';
import { getMockSession } from '@/lib/auth';
import db from '@/lib/db';
import AttendanceForm from './AttendanceForm';
import Link from 'next/link';
import styles from './attendance.module.css';

export const dynamic = 'force-dynamic';

interface AttendancePageProps {
  searchParams: Promise<{
    classId?: string;
    date?: string;
  }>;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const session = await getMockSession();
  if (!session) redirect('/');

  const params = await searchParams;
  const classId = params.classId;
  const dateStr = params.date || new Date().toISOString().split('T')[0];

  const teacher = await db.teacher.findUnique({
    where: { userId: session.id },
    include: {
      subjects: {
        include: {
          class: true,
        },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="glass-card">
        <h3>Teacher profile not found.</h3>
      </div>
    );
  }

  // Get unique classes taught
  const classMap = new Map();
  teacher.subjects.forEach((sub) => {
    classMap.set(sub.class.id, sub.class);
  });
  const classesTaught = Array.from(classMap.values());

  // If no classId is selected, show class selector screen
  if (!classId) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className="section-header">Attendance Register</h1>
            <p className="section-desc">Select a class section below to take or modify student attendance logs.</p>
          </div>
        </header>

        <div className={styles.classesList}>
          {classesTaught.map((cls) => (
            <div key={cls.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{cls.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Manage daily attendance register
                </p>
              </div>
              <Link href={`/teacher/attendance?classId=${cls.id}`} className="btn btn-primary">
                Open Register
              </Link>
            </div>
          ))}
          {classesTaught.length === 0 && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>You are not currently assigned to any classes.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Verify they teach this class
  const selectedClass = classesTaught.find((cls) => cls.id === classId);
  if (!selectedClass) {
    return (
      <div className="glass-card">
        <h3>Access Denied</h3>
        <p>You do not teach this class section.</p>
        <Link href="/teacher/attendance" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Selector
        </Link>
      </div>
    );
  }

  // Fetch students in this class
  const students = await db.student.findMany({
    where: { classId },
    include: {
      user: true,
    },
    orderBy: {
      rollNumber: 'asc',
    },
  });

  // Fetch existing attendance logs for the chosen date
  const parsedDate = new Date(dateStr);
  parsedDate.setHours(0, 0, 0, 0);

  const existingLogs = await db.attendance.findMany({
    where: {
      classId,
      date: parsedDate,
    },
  });

  // Map students with their initial status
  const studentsWithAttendance = students.map((st) => {
    const log = existingLogs.find((l) => l.studentId === st.id);
    return {
      id: st.id,
      name: st.user.name,
      rollNumber: st.rollNumber,
      initialStatus: log?.status || 'PRESENT',
      initialRemarks: log?.remarks || '',
    };
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="section-header">Attendance Register</h1>
          <p className="section-desc">Class: {selectedClass.name} • Selected Date: {dateStr}</p>
        </div>
        <Link href="/teacher/attendance" className="btn btn-secondary">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Choose Class</span>
        </Link>
      </header>

      <AttendanceForm
        classId={classId}
        className={selectedClass.name}
        initialDate={dateStr}
        students={studentsWithAttendance}
      />
    </div>
  );
}
