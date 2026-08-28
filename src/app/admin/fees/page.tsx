import db from '@/lib/db';
import FeeForm from './FeeForm';
import RecordPaymentButton from './RecordPaymentButton';
import styles from './fees.module.css';

export const dynamic = 'force-dynamic';

export default async function FeesAdminPage() {
  const fees = await db.fee.findMany({
    include: {
      student: {
        include: {
          user: true,
          class: true,
        },
      },
    },
    orderBy: {
      dueDate: 'desc',
    },
  });

  const students = await db.student.findMany({
    include: {
      user: true,
      class: true,
    },
    orderBy: {
      user: {
        name: 'asc',
      },
    },
  });

  const studentItems = students.map((s) => ({
    id: s.id,
    name: s.user.name,
    rollNumber: s.rollNumber,
    className: s.class.name,
  }));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="badge badge-success">Paid</span>;
      case 'PENDING':
        return <span className="badge badge-warning">Pending</span>;
      case 'OVERDUE':
        return <span className="badge badge-danger">Overdue</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="section-header">Fee & Invoice Control</h1>
          <p className="section-desc">Issue tuition bills, monitor transaction histories, and record payments.</p>
        </div>
        <FeeForm students={studentItems} />
      </header>

      <section className="glass-card" style={{ padding: '0px' }}>
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{fee.student.user.name}</div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Roll: {fee.student.rollNumber}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info">{fee.student.class.name}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{fee.title}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {formatCurrency(fee.amount)}
                  </td>
                  <td>{fee.dueDate.toLocaleDateString()}</td>
                  <td>{getStatusBadge(fee.status)}</td>
                  <td>
                    {fee.paidAt ? (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {fee.paidAt.toLocaleDateString()}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {(fee.status === 'PENDING' || fee.status === 'OVERDUE') && (
                      <RecordPaymentButton id={fee.id} />
                    )}
                  </td>
                </tr>
              ))}
              {fees.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    No invoices generated yet.
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
