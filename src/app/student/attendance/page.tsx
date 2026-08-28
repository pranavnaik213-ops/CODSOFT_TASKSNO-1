import { redirect } from 'next/navigation';
import { getMockSession } from '@/lib/auth';
import db from '@/lib/db';
import styles from './attendance.module.css';

export const dynamic = 'force-dynamic';

export default async function StudentAttendancePage() {
  const session = await getMockSession();
  if (!session) redirect('/');

  const student = await db.student.findUnique({
    where: { userId: session.id },
    include: {
      attendance: {
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  if (!student) {
    return (
      <div className="glass-card">
        <h3>Student profile not found.</h3>
      </div>
    );
  }

  // Calculate statistics
  const total = student.attendance.length;
  const present = student.attendance.filter((a) => a.status === 'PRESENT').length;
  const late = student.attendance.filter((a) => a.status === 'LATE').length;
  const absent = student.attendance.filter((a) => a.status === 'ABSENT').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <span className="badge badge-success">Present</span>;
      case 'LATE':
        return <span className="badge badge-warning">Late</span>;
      case 'ABSENT':
        return <span className="badge badge-danger">Absent</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="section-header">Attendance Register</h1>
          <p className="section-desc">Verify your daily classroom sign-in sheets and punctuality logs.</p>
        </div>
      </header>

      {/* Grid summarizing logs */}
      <div className={styles.statsGrid}>
        <div className="glass-card">
          <h3 className={styles.statTitle}>Total Sessions</h3>
          <div className={styles.statVal}>{total}</div>
        </div>
        <div className="glass-card">
          <h3 className={styles.statTitle}>Present</h3>
          <div className={`${styles.statVal} ${styles.greenText}`}>{present}</div>
        </div>
        <div className="glass-card">
          <h3 className={styles.statTitle}>Late Entries</h3>
          <div className={`${styles.statVal} ${styles.yellowText}`}>{late}</div>
        </div>
        <div className="glass-card">
          <h3 className={styles.statTitle}>Absences</h3>
          <div className={`${styles.statVal} ${styles.redText}`}>{absent}</div>
        </div>
      </div>

      <section className="glass-card" style={{ padding: '0px' }}>
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks / Comments</th>
              </tr>
            </thead>
            <tbody>
              {student.attendance.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>
                    {log.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td>{getStatusBadge(log.status)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {log.remarks || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No comment</span>}
                  </td>
                </tr>
              ))}
              {student.attendance.length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.emptyState}>
                    No attendance logs registered in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
