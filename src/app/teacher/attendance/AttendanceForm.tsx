'use client';

import { useState } from 'react';
import { saveAttendance, AttendanceRecordInput } from './actions';
import styles from './attendance.module.css';

interface StudentRecord {
  id: string;
  name: string;
  rollNumber: string;
  initialStatus: string;
  initialRemarks: string;
}

interface AttendanceFormProps {
  classId: string;
  className: string;
  initialDate: string;
  students: StudentRecord[];
}

export default function AttendanceForm({
  classId,
  className,
  initialDate,
  students,
}: AttendanceFormProps) {
  const [date, setDate] = useState(initialDate);
  const [records, setRecords] = useState<Record<string, { status: string; remarks: string }>>(() => {
    const initial: Record<string, { status: string; remarks: string }> = {};
    students.forEach((s) => {
      initial[s.id] = {
        status: s.initialStatus || 'PRESENT',
        remarks: s.initialRemarks || '',
      };
    });
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    // In a real app we'd reload the page or fetch data client-side for the new date
    window.location.href = `/teacher/attendance?classId=${classId}&date=${e.target.value}`;
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const formattedRecords: AttendanceRecordInput[] = Object.keys(records).map((studentId) => ({
      studentId,
      status: records[studentId].status,
      remarks: records[studentId].remarks,
    }));

    const result = await saveAttendance(classId, date, formattedRecords);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess('Attendance sheet saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <div className={styles.controlsRow}>
          <div>
            <h2 className={styles.classTitle}>{className}</h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Take or edit daily attendance records.
            </span>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="attendance-date" style={{ marginBottom: '4px' }}>Date</label>
            <input
              id="attendance-date"
              type="date"
              value={date}
              onChange={handleDateChange}
              className="form-control"
              style={{ width: '180px' }}
            />
          </div>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Status Toggle</th>
                <th>Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => {
                const current = records[st.id] || { status: 'PRESENT', remarks: '' };
                return (
                  <tr key={st.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                      {st.rollNumber}
                    </td>
                    <td style={{ fontWeight: 500 }}>{st.name}</td>
                    <td>
                      <div className={styles.btnToggleGroup}>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, 'PRESENT')}
                          className={`${styles.toggleBtn} ${
                            current.status === 'PRESENT' ? styles.presentActive : ''
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, 'LATE')}
                          className={`${styles.toggleBtn} ${
                            current.status === 'LATE' ? styles.lateActive : ''
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, 'ABSENT')}
                          className={`${styles.toggleBtn} ${
                            current.status === 'ABSENT' ? styles.absentActive : ''
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="e.g. Excused, late entry"
                        value={current.remarks}
                        onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                        className="form-control"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    No students currently enrolled in this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {students.length > 0 && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary"
            style={{ minWidth: '150px' }}
          >
            {loading ? 'Saving Logs...' : 'Save Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}
