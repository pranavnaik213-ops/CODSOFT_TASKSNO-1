import db from '@/lib/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Fetch stats from DB
  const studentCount = await db.student.count();
  const teacherCount = await db.teacher.count();

  // Calculate average attendance
  const totalAttendance = await db.attendance.count();
  const presentOrLateAttendance = await db.attendance.count({
    where: {
      status: {
        in: ['PRESENT', 'LATE'],
      },
    },
  });
  
  const attendanceRate = totalAttendance > 0 
    ? Math.round((presentOrLateAttendance / totalAttendance) * 100) 
    : 100;

  // Calculate total fees collected
  const feeSum = await db.fee.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: 'PAID',
    },
  });
  const totalFeesCollected = feeSum._sum.amount || 0;

  // Calculate pending fees
  const pendingFeeSum = await db.fee.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: 'PENDING',
    },
  });
  const totalFeesPending = pendingFeeSum._sum.amount || 0;

  // Fetch recent students
  const recentStudents = await db.student.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      class: true,
    },
  });

  // Fetch recent payments
  const recentPayments = await db.fee.findMany({
    take: 4,
    where: { status: 'PAID' },
    orderBy: { paidAt: 'desc' },
    include: {
      student: {
        include: {
          user: true,
        },
      },
    },
  });

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="section-header">Admin Overview</h1>
          <p className="section-desc">Institutional statistics, financial collections, and recent activity logs.</p>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className={styles.statsGrid}>
        {/* Card 1: Students */}
        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Total Students</span>
            <div className={`${styles.iconWrapper} ${styles.blueIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{studentCount}</div>
          <div className={styles.cardSubtext}>Active enrollments this term</div>
        </div>

        {/* Card 2: Teachers */}
        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Teachers</span>
            <div className={`${styles.iconWrapper} ${styles.purpleIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{teacherCount}</div>
          <div className={styles.cardSubtext}>Across 3 departments</div>
        </div>

        {/* Card 3: Attendance */}
        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Avg Attendance</span>
            <div className={`${styles.iconWrapper} ${styles.greenIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{attendanceRate}%</div>
          <div className={styles.cardSubtext}>Present & late vs absent rate</div>
        </div>

        {/* Card 4: Fee Collected */}
        <div className="glass-card">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Fees Collected</span>
            <div className={`${styles.iconWrapper} ${styles.cyanIcon}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className={styles.cardValue}>{formatCurrency(totalFeesCollected)}</div>
          <div className={`${styles.cardSubtext} ${styles.yellowText}`}>
            {formatCurrency(totalFeesPending)} outstanding
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className={styles.detailsGrid}>
        {/* Recent Students Card */}
        <div className="glass-card">
          <h2 className={styles.sectionSubTitle}>Recently Enrolled Students</h2>
          <div className={styles.listWrapper}>
            {recentStudents.map((st) => (
              <div key={st.id} className={styles.listItem}>
                <div className={styles.userBadge}>
                  {st.user.name.charAt(0)}
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{st.user.name}</div>
                  <div className={styles.itemMeta}>Roll: {st.rollNumber} • {st.class.name}</div>
                </div>
                <div className={styles.itemTime}>
                  {st.createdAt.toLocaleDateString()}
                </div>
              </div>
            ))}
            {recentStudents.length === 0 && (
              <p className={styles.emptyState}>No students enrolled recently.</p>
            )}
          </div>
        </div>

        {/* Recent Fee Payments Card */}
        <div className="glass-card">
          <h2 className={styles.sectionSubTitle}>Recent Fee Payments</h2>
          <div className={styles.listWrapper}>
            {recentPayments.map((pay) => (
              <div key={pay.id} className={styles.listItem}>
                <div className={`${styles.payIcon} ${styles.greenBg}`}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{pay.title}</div>
                  <div className={styles.itemMeta}>Paid by {pay.student.user.name}</div>
                </div>
                <div className={styles.itemValue}>{formatCurrency(pay.amount)}</div>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <p className={styles.emptyState}>No fee payments recorded recently.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
