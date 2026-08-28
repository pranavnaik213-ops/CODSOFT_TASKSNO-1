import db from '@/lib/db';
import StudentForm from './StudentForm';
import DeleteButton from './DeleteButton';
import styles from './students.module.css';

export const dynamic = 'force-dynamic';

export default async function StudentsAdminPage() {
  const students = await db.student.findMany({
    include: {
      user: true,
      class: true,
    },
    orderBy: {
      rollNumber: 'asc',
    },
  });

  const classes = await db.class.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="section-header">Student Management</h1>
          <p className="section-desc">Manage student profiles, enrollment databases, and classroom allocations.</p>
        </div>
        <StudentForm classes={classes} />
      </header>

      <section className="glass-card" style={{ padding: '0px' }}>
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Class</th>
                <th>Parent Details</th>
                <th>Address</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                    {st.rollNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{st.user.name}</div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Gender: {st.gender}
                    </span>
                  </td>
                  <td>{st.user.email}</td>
                  <td>
                    <span className="badge badge-info">{st.class.name}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem' }}>{st.parentName}</div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {st.parentPhone}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {st.address}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <DeleteButton id={st.id} />
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No students currently enrolled in the database.
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
