'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push(data.redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Demo login failed');
      }

      router.push(data.redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className={styles.logoText}>EduManage</span>
        </div>
      </header>

      <div className={styles.heroSection}>
        <h1 className={styles.title}>
          Next-Generation <br />
          <span className={styles.gradientText}>Education Administration</span>
        </h1>
        <p className={styles.subtitle}>
          Manage students, teachers, grades, attendance, and school finances in one integrated, high-fidelity platform.
        </p>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Card: Quick Demo Profiles */}
        <section className={`${styles.glassCard} ${styles.demoSection}`}>
          <h2 className={styles.sectionTitle}>Demo Sign-In</h2>
          <p className={styles.sectionDesc}>Select a pre-configured role below to log in instantly and review the system.</p>

          <div className={styles.demoList}>
            {/* Admin Card */}
            <div className={styles.demoCard} onClick={() => handleDemoLogin('admin@edumanage.com', 'adminpassword')}>
              <div className={`${styles.avatarIcon} ${styles.adminIcon}`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className={styles.demoDetails}>
                <h3>Administrator</h3>
                <p>Manage database, CRUD students/teachers, view finances.</p>
                <span className={styles.demoUser}>Dr. Sarah Jenkins</span>
              </div>
            </div>

            {/* Teacher Card */}
            <div className={styles.demoCard} onClick={() => handleDemoLogin('teacher.smith@edumanage.com', 'teacherpassword')}>
              <div className={`${styles.avatarIcon} ${styles.teacherIcon}`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className={styles.demoDetails}>
                <h3>Teacher</h3>
                <p>Take attendance, assign homework, enter exam scores.</p>
                <span className={styles.demoUser}>John Smith (Mathematics)</span>
              </div>
            </div>

            {/* Student Card */}
            <div className={styles.demoCard} onClick={() => handleDemoLogin('student.alex@edumanage.com', 'studentpassword')}>
              <div className={`${styles.avatarIcon} ${styles.studentIcon}`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className={styles.demoDetails}>
                <h3>Student</h3>
                <p>View exam results, attendance logs, tuition dues status.</p>
                <span className={styles.demoUser}>Alex Rivera (Grade 10-A)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Card: Manual Login */}
        <section className={styles.glassCard}>
          <h2 className={styles.sectionTitle}>Manual Login</h2>
          <p className={styles.sectionDesc}>Enter your school-issued credentials to access your dashboard.</p>

          <form onSubmit={handleLogin} className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="e.g. admin@edumanage.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className={`${styles.submitBtn} btn btn-primary`}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} EduManage Solutions Inc. All rights reserved.</p>
      </footer>
    </main>
  );
}
