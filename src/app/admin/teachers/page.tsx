import db from '@/lib/db';
import TeacherForm from './TeacherForm';
import DeleteButton from './DeleteButton';
import styles from './teachers.module.css';

export const dynamic = 'force-dynamic';

export default async function TeachersAdminPage() {
  const teachers = await db.teacher.findMany({
    include: {
      user: true,
      subjects: {
        include: {
          class: true,
        },
      },
    },
    orderBy: {
      employeeId: 'asc',
    },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="section-header">Teacher Registry</h1>
          <p className="section-desc">Manage institutional departments, teaching credentials, and class subject assignments.</p>
        </div>
        <TeacherForm />
      </header>

      <section className="glass-card" style={{ padding: '0px' }}>
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Assigned Classes & Subjects</th>
                <th>Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((te) => (
                <tr key={te.id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                    {te.employeeId}
                  </td>
                  <td style={{ fontWeight: 600 }}>{te.user.name}</td>
                  <td>{te.user.email}</td>
                  <td>
                    <span className="badge badge-warning">{te.department}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {te.subjects.map((sub) => (
                        <span key={sub.id} className="badge badge-info" style={{ textTransform: 'none', fontSize: '0.72rem' }}>
                          {sub.class.name}: {sub.name}
                        </span>
                      ))}
                      {te.subjects.length === 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          No subjects assigned yet
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.88rem' }}>{te.phone}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {te.address}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <DeleteButton id={te.id} />
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No teachers registered in the database.
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
