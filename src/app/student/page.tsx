import { redirect } from 'next/navigation';
import { getMockSession } from '@/lib/auth';
import db from '@/lib/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function StudentDashboard() {
  const session = await getMockSession();
  if (!session) redirect('/');

  const student = await db.student.findUnique({
    where: { userId: session.id },
    include: {
      class: {
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
          subjects: {
            include: {
              teacher: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
      attendance: true,
      examResults: {
        include: {
          exam: {
            include: {
              subject: true,
            },
          },
        },
      },
      fees: true,
    },
  });

  if (!student) {
    return (
      <div className="glass-card">
        <h3>Student profile not found.</h3>
      </div>
    );
  }

  // Calculate Attendance Rate
  const totalDays = student.attendance.length;
  const presentOrLate = student.attendance.filter(
    (a) => a.status === 'PRESENT' || a.status === 'LATE'
  ).length;
  const attendanceRate = totalDays > 0 ? Math.round((presentOrLate / totalDays) * 100) : 100;

  // Calculate Grade average (percentage of marks obtained vs max marks)
  let totalObtained = 0;
  let totalPossible = 0;
  student.examResults.forEach((res) => {
    totalObtained += res.marksObtained;
    totalPossible += res.exam.maxMarks;
  });
  const gpaPercentage = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : null;

  // Pending fees details
  const pendingFees = student.fees.filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE');
  const pendingFeesAmount = pendingFees.reduce((sum, f) => sum + f.amount, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="section-header">Student Portal</h1>
          <p className="section-desc">Welcome back, {session.name}. Review your classes, reports, and payments.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Attendance Rate</span>
            <div className={`${styles.iconWrapper} ${styles.blueIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{attendanceRate}%</div>
          <div className={styles.cardSubtext}>Recorded across {totalDays} days</div>
        </div>

        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Cumulative Score</span>
            <div className={`${styles.iconWrapper} ${styles.purpleIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{gpaPercentage !== null ? `${gpaPercentage}%` : 'N/A'}</div>
          <div className={styles.cardSubtext}>Average of exam results</div>
        </div>

        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Tuition Dues</span>
            <div className={`${styles.iconWrapper} ${styles.greenIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{formatCurrency(pendingFeesAmount)}</div>
          <div className={styles.cardSubtext}>{pendingFees.length} outstanding bills</div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className={styles.detailsGrid}>
        {/* Class Subjects & Class Teacher */}
        <div className="glass-card">
          <h2 className={styles.sectionSubtitle}>Classroom Details</h2>
          <div className={styles.classInfoBox}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>My Class</span>
              <span className={styles.infoVal}>{student.class.name}</span>
            </div>
            {student.class.teacher && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Class Teacher</span>
                <span className={styles.infoVal}>{student.class.teacher.user.name}</span>
              </div>
            )}
          </div>

          <h3 className={styles.smallHeading} style={{ marginTop: '20px', marginBottom: '12px' }}>Registered Subjects</h3>
          <div className={styles.subjectsGrid}>
            {student.class.subjects.map((sub) => (
              <div key={sub.id} className={styles.subjectItem}>
                <div style={{ fontWeight: 600 }}>{sub.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Code: {sub.code} • Teacher: {sub.teacher.user.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Summary & Report Cards */}
        <div className="glass-card">
          <h2 className={styles.sectionSubtitle}>Recent Assessments</h2>
          <div className={styles.resultsList}>
            {student.examResults.map((res) => {
              const scorePct = Math.round((res.marksObtained / res.exam.maxMarks) * 100);
              let scoreColor = 'var(--text-primary)';
              if (scorePct >= 90) scoreColor = 'var(--success)';
              else if (scorePct >= 75) scoreColor = 'var(--info)';
              else if (scorePct < 50) scoreColor = 'var(--danger)';

              return (
                <div key={res.id} className={styles.resultRow}>
                  <div className={styles.resultDetails}>
                    <div className={styles.resultTitle}>{res.exam.name}</div>
                    <div className={styles.resultSub}>{res.exam.subject.name} • {res.exam.date.toLocaleDateString()}</div>
                  </div>
                  <div className={styles.resultScore}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: scoreColor }}>
                      {res.marksObtained}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      / {res.exam.maxMarks}
                    </span>
                  </div>
                </div>
              );
            })}
            {student.examResults.length === 0 && (
              <p className={styles.emptyState}>No exam results published yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
