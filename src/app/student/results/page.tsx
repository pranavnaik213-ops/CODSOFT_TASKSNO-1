import { redirect } from 'next/navigation';
import { getMockSession } from '@/lib/auth';
import db from '@/lib/db';
import styles from './results.module.css';

export const dynamic = 'force-dynamic';

export default async function StudentResultsPage() {
  const session = await getMockSession();
  if (!session) redirect('/');

  const student = await db.student.findUnique({
    where: { userId: session.id },
    include: {
      examResults: {
        include: {
          exam: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: {
          exam: {
            date: 'desc',
          },
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

  // Calculate cumulative average score
  let totalObtained = 0;
  let totalPossible = 0;
  student.examResults.forEach((res) => {
    totalObtained += res.marksObtained;
    totalPossible += res.exam.maxMarks;
  });
  
  const averagePercentage = totalPossible > 0 
    ? Math.round((totalObtained / totalPossible) * 100) 
    : null;

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return { letter: 'A+', color: 'var(--success)' };
    if (percentage >= 80) return { letter: 'A', color: 'var(--success)' };
    if (percentage >= 70) return { letter: 'B', color: 'var(--info)' };
    if (percentage >= 60) return { letter: 'C', color: 'var(--warning)' };
    if (percentage >= 50) return { letter: 'D', color: 'var(--warning)' };
    return { letter: 'F', color: 'var(--danger)' };
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="section-header">Academic Report Card</h1>
          <p className="section-desc">View published exam results, grading breakdowns, and teacher remarks.</p>
        </div>
      </header>

      {/* GPA Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Cumulative Evaluation</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Overall performance compiled across all graded coursework.
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          {averagePercentage !== null ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: getLetterGrade(averagePercentage).color }}>
                {getLetterGrade(averagePercentage).letter}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                ({averagePercentage}%)
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No grades issued
            </span>
          )}
        </div>
      </div>

      <section className="glass-card" style={{ padding: '0px' }}>
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Evaluation</th>
                <th>Date</th>
                <th>Score Obtained</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {student.examResults.map((res) => {
                const pct = Math.round((res.marksObtained / res.exam.maxMarks) * 100);
                const gradeInfo = getLetterGrade(pct);

                return (
                  <tr key={res.id}>
                    <td>
                      <span className="badge badge-info">{res.exam.subject.code}</span>
                      <div style={{ fontWeight: 600, marginTop: '4px' }}>{res.exam.subject.name}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{res.exam.name}</td>
                    <td>{res.exam.date.toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{res.marksObtained}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {res.exam.maxMarks}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{pct}%</td>
                    <td>
                      <span className="badge" style={{ background: 'none', border: `1px solid ${gradeInfo.color}`, color: gradeInfo.color, padding: '4px 10px', fontSize: '0.8rem', width: '38px', justifyContent: 'center' }}>
                        {gradeInfo.letter}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                      {res.remarks || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No comment</span>}
                    </td>
                  </tr>
                );
              })}
              {student.examResults.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No academic records or exam scores registered yet.
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
