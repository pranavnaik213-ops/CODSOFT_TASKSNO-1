import { redirect } from 'next/navigation';
import { getMockSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function TeacherDashboard() {
  const session = await getMockSession();

  if (!session) {
    redirect('/');
  }

  // Fetch teacher's subjects and classes
  const teacher = await db.teacher.findUnique({
    where: { userId: session.id },
    include: {
      subjects: {
        include: {
          class: {
            include: {
              students: true,
            },
          },
          exams: true,
        },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="glass-card">
        <h3>Teacher profile not found.</h3>
        <p>Please contact the administrator to resolve this issue.</p>
      </div>
    );
  }

  // Calculate stats
  const subjectCount = teacher.subjects.length;
  
  // Unique classes taught
  const classMap = new Map();
  teacher.subjects.forEach((sub) => {
    classMap.set(sub.class.id, sub.class);
  });
  const classesTaught = Array.from(classMap.values());
  const classCount = classesTaught.length;

  // Total students taught
  let totalStudents = 0;
  classesTaught.forEach((cls) => {
    totalStudents += cls.students.length;
  });

  // Total exams conducted by this teacher
  let totalExams = 0;
  teacher.subjects.forEach((sub) => {
    totalExams += sub.exams.length;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="section-header">Teacher Dashboard</h1>
          <p className="section-desc">Welcome back, {session.name}. Monitor your classes, attendance files, and exams.</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className={styles.statsGrid}>
        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Classes Taught</span>
            <div className={`${styles.iconWrapper} ${styles.blueIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{classCount}</div>
          <div className={styles.cardSubtext}>Active class sections</div>
        </div>

        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Subjects Taught</span>
            <div className={`${styles.iconWrapper} ${styles.purpleIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{subjectCount}</div>
          <div className={styles.cardSubtext}>Assigned curriculums</div>
        </div>

        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Total Students</span>
            <div className={`${styles.iconWrapper} ${styles.greenIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{totalStudents}</div>
          <div className={styles.cardSubtext}>Enrolled across your classes</div>
        </div>

        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Scheduled Exams</span>
            <div className={`${styles.iconWrapper} ${styles.cyanIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{totalExams}</div>
          <div className={styles.cardSubtext}>Evaluations on database</div>
        </div>
      </div>

      {/* Class Taught Detail Lists */}
      <h2 className={styles.sectionSubtitle}>Your Academic Classes</h2>
      <div className={styles.classesGrid}>
        {teacher.subjects.map((sub) => (
          <div key={sub.id} className="glass-card">
            <div className={styles.classCardHeader}>
              <div>
                <span className="badge badge-info">{sub.code}</span>
                <h3 className={styles.className}>{sub.class.name}</h3>
              </div>
              <span className={styles.subjectName}>{sub.name}</span>
            </div>

            <div className={styles.classCardBody}>
              <div className={styles.statLine}>
                <span className={styles.statLabel}>Enrolled Students</span>
                <span className={styles.statVal}>{sub.class.students.length}</span>
              </div>
              <div className={styles.statLine}>
                <span className={styles.statLabel}>Exams Configured</span>
                <span className={styles.statVal}>{sub.exams.length}</span>
              </div>
            </div>

            <div className={styles.classCardFooter}>
              <Link href={`/teacher/attendance?classId=${sub.class.id}`} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Attendance</span>
              </Link>
              <Link href={`/teacher/marks?subjectId=${sub.id}`} className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Grading</span>
              </Link>
            </div>
          </div>
        ))}
        {teacher.subjects.length === 0 && (
          <div className="glass-card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>You are not currently assigned to teach any subjects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
