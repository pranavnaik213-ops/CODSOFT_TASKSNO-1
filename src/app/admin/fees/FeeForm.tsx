'use client';

import { useState } from 'react';
import { createFeeInvoice } from './actions';
import styles from './fees.module.css';

interface StudentItem {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
}

interface FeeFormProps {
  students: StudentItem[];
}

export default function FeeForm({ students }: FeeFormProps) {
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
    const result = await createFeeInvoice(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess('Invoice created successfully!');
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
          id="open-create-invoice-btn"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Issue New Invoice</span>
        </button>
      ) : (
        <div className="glass-card">
          <div className={styles.formHeader}>
            <h3>Issue Student Invoice</h3>
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

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <div className="form-group">
              <label htmlFor="studentId">Select Student *</label>
              <select id="studentId" name="studentId" required className="form-control">
                <option value="">Choose a student</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} (Roll: {st.rollNumber} - {st.className})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">Invoice Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g. Tuition Fee - Term 2"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (USD) *</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="e.g. 1200.00"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date *</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                required
                defaultValue={new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0]} // +14 days
                className="form-control"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Issuing...' : 'Create Invoice'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
