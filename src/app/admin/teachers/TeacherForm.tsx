'use client';

import { useState } from 'react';
import { createTeacher } from './actions';
import styles from './teachers.module.css';

export default function TeacherForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createTeacher(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess('Teacher registered successfully!');
      e.currentTarget.reset();
      setTimeout(() => {
        setIsOpen(false);
        setSuccess('');
      }, 1500);
    }
  };

  return (
    <div className={styles.formContainer}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary"
          id="open-add-teacher-btn"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Register New Teacher</span>
        </button>
      ) : (
        <div className="glass-card">
          <div className={styles.formHeader}>
            <h3>Register New Teacher</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setError('');
                setSuccess('');
              }}
              className={styles.closeBtn}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.gridForm}>
            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Margaret Hamilton"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="e.g. margaret@edumanage.com"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="employeeId">Employee ID *</label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                required
                placeholder="e.g. T104"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select id="department" name="department" required className="form-control">
                <option value="">Select a department</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Arts">Arts</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. +1 555-0104"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Office/Home Address</label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="e.g. 101 Turing Lane, Springfield"
                className="form-control"
              />
            </div>

            <div className={styles.spanFull}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                {loading ? 'Processing...' : 'Register Teacher'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
