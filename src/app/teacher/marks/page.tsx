import { redirect } from 'next/navigation';
import { getMockSession } from '@/lib/auth';
import db from '@/lib/db';
import MarksForm from './MarksForm';
import Link from 'next/link';
import styles from './marks.module.css';

export const dynamic = 'force-dynamic';

interface MarksPageProps {
  searchParams: Promise<{
    subjectId?: string;
  }>;
}

export default async function MarksPage({ searchParams }: MarksPageProps) {
  const session = await getMockSession();
  if (!session) redirect('/');

  const params = await searchParams;
  const subjectId = params.subjectId;

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

  // If no subjectId is selected, show list of subjects
  if (!subjectId) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className="section-header">Academic Grading Control</h1>
            <p className="section-desc">Select a subject curriculum below to record exam results and quiz scores.</p>
          </div>
        </header>

        <div className={styles.subjectsList}>
          {teacher.subjects.map((sub) => (
            <div key={sub.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-info">{sub.code}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '6px' }}>{sub.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Class: {sub.class.name}
                </p>
              </div>
              <Link href={`/teacher/marks?subjectId=${sub.id}`} className="btn btn-primary">
                Open Gradebook
              </Link>
            </div>
          ))}
          {teacher.subjects.length === 0 && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>You are not currently assigned to any subjects.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Verify they teach this subject
  const selectedSubject = teacher.subjects.find((sub) => sub.id === subjectId);
  if (!selectedSubject) {
    return (
      <div className="glass-card">
        <h3>Access Denied</h3>
        <p>You do not teach this subject.</p>
        <Link href="/teacher/marks" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Selector
        </Link>
      </div>
    );
  }

  // Fetch all exams scheduled for this subject
  const exams = await db.exam.findMany({
    where: { subjectId },
    orderBy: { date: 'desc' },
  });

  // Fetch students in the subject's class
  const students = await db.student.findMany({
    where: { classId: selectedSubject.classId },
    include: {
      user: true,
    },
    orderBy: {
      rollNumber: 'asc',
    },
  });

  const studentItems = students.map((st) => ({
    id: st.id,
    name: st.user.name,
    rollNumber: st.rollNumber,
  }));

  // Fetch all exam results for these exams
  const examIds = exams.map((e) => e.id);
  const examResults = await db.examResult.findMany({
    where: {
      examId: {
        in: examIds,
      },
    },
  });

  const formattedResults = examResults.map((r) => ({
    examId: r.examId,
    studentId: r.studentId,
    marksObtained: r.marksObtained,
    remarks: r.remarks || '',
  }));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="section-header">Academic Grading Control</h1>
          <p className="section-desc">Subject: {selectedSubject.name} • Class: {selectedSubject.class.name}</p>
        </div>
        <Link href="/teacher/marks" className="btn btn-secondary">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Choose Subject</span>
        </Link>
      </header>

      <MarksForm
        subjectId={subjectId}
        subjectName={selectedSubject.name}
        className={selectedSubject.class.name}
        exams={exams}
        students={studentItems}
        initialResults={formattedResults}
      />
    </div>
  );
}
