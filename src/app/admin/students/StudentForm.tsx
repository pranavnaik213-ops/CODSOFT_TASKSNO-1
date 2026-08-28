'use client';

import { useState } from 'react';
import { createStudent } from './actions';
import styles from './students.module.css';

interface ClassItem {
  id: string;
  name: string;
}

interface StudentFormProps {
  classes: ClassItem[];
}

export default function StudentForm({ classes }: StudentFormProps) {
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
    const result = await createStudent(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess('Student enrolled successfully!');
      e.currentTarget.reset();
      // Delay closing panel slightly so user sees success message
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
          id="open-add-student-btn"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Enroll New Student</span>
        </button>
      ) : (
        <div className="glass-card">
          <div className={styles.formHeader}>
            <h3>Enroll New Student</h3>
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
                placeholder="e.g. Liam Johnson"
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
                placeholder="e.g. liam@edumanage.com"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number *</label>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                required
                placeholder="e.g. 1025"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="classId">Assigned Class *</label>
              <select id="classId" name="classId" required className="form-control">
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select id="gender" name="gender" required className="form-control">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue="2011-01-01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentName">Parent Name</label>
              <input
                id="parentName"
                name="parentName"
                type="text"
                placeholder="e.g. Sarah Johnson"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentPhone">Parent Phone</label>
              <input
                id="parentPhone"
                name="parentPhone"
                type="tel"
                placeholder="e.g. +1 555-0987"
                className="form-control"
              />
            </div>

            <div className={`${styles.spanFull} form-group`}>
              <label htmlFor="address">Home Address</label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="e.g. 789 Elm St, Springfield"
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
                {loading ? 'Processing...' : 'Enroll Student'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
