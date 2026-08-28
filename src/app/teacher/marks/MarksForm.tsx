'use client';

import { useState, useEffect } from 'react';
import { createExam, saveExamResults, ExamResultInput } from './actions';
import styles from './marks.module.css';

interface ExamItem {
  id: string;
  name: string;
  maxMarks: number;
  date: Date;
}

interface StudentItem {
  id: string;
  name: string;
  rollNumber: string;
}

interface ResultItem {
  examId: string;
  studentId: string;
  marksObtained: number;
  remarks: string;
}

interface MarksFormProps {
  subjectId: string;
  subjectName: string;
  className: string;
  exams: ExamItem[];
  students: StudentItem[];
  initialResults: ResultItem[];
}

export default function MarksForm({
  subjectId,
  subjectName,
  className,
  exams,
  students,
  initialResults,
}: MarksFormProps) {
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');
  const [showAddExam, setShowAddExam] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examMaxMarks, setExamMaxMarks] = useState('100');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  // local state for grades input
  const [grades, setGrades] = useState<Record<string, { marks: string; remarks: string }>>({});

  // Initialize/Update grades local state when selectedExamId or initialResults change
  useEffect(() => {
    const initial: Record<string, { marks: string; remarks: string }> = {};
    students.forEach((st) => {
      const match = initialResults.find(
        (r) => r.examId === selectedExamId && r.studentId === st.id
      );
      initial[st.id] = {
        marks: match ? String(match.marksObtained) : '',
        remarks: match ? match.remarks : '',
      };
    });
    setGrades(initial);
    setError('');
    setSuccess('');
  }, [selectedExamId, students, initialResults]);

  const handleGradeChange = (studentId: string, marks: string) => {
    // Validate number and range
    if (marks !== '') {
      const num = Number(marks);
      if (isNaN(num)) return;
      if (selectedExam && num > selectedExam.maxMarks) {
        setError(`Marks cannot exceed the maximum limit of ${selectedExam.maxMarks}`);
      } else {
        setError('');
      }
    }
    
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await createExam(subjectId, examName, examDate, Number(examMaxMarks));
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess('Exam scheduled successfully!');
      setExamName('');
      setShowAddExam(false);
      // Wait for page refresh and select the new exam
      setTimeout(() => {
        setSuccess('');
        window.location.reload();
      }, 1000);
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    setError('');
    setSuccess('');

    // Check if any mark exceeds maximum limits
    let hasValidationError = false;
    const resultsPayload: ExamResultInput[] = [];

    for (const studentId of Object.keys(grades)) {
      const g = grades[studentId];
      if (g.marks !== '') {
        const marksNum = Number(g.marks);
        if (selectedExam && marksNum > selectedExam.maxMarks) {
          hasValidationError = true;
          setError(`Validation Error: ${students.find(s => s.id === studentId)?.name}'s marks exceed maximum of ${selectedExam.maxMarks}`);
          break;
        }
        resultsPayload.push({
          studentId,
          marksObtained: marksNum,
          remarks: g.remarks,
        });
      }
    }

    if (hasValidationError) {
      setLoading(false);
      return;
    }

    if (resultsPayload.length === 0) {
      setError('Please enter grades for at least one student.');
      setLoading(false);
      return;
    }

    const res = await saveExamResults(selectedExamId, resultsPayload);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess('Exam scores registered successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className={styles.formContainer}>
      {/* Subject and exam selection header */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div className={styles.controlsRow}>
          <div>
            <h2 className={styles.subjectTitle}>{subjectName}</h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Class: {className} • Manage evaluation results.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="exam-selector" style={{ marginBottom: '4px' }}>Select Exam</label>
              <select
                id="exam-selector"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="form-control"
                style={{ width: '220px' }}
              >
                <option value="">-- Choose Evaluation --</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} (Max: {ex.maxMarks})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddExam(!showAddExam)}
              className="btn btn-secondary"
              id="toggle-add-exam-btn"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule New Exam Form */}
      {showAddExam && (
        <div className="glass-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Schedule Evaluation</h3>
          <form onSubmit={handleCreateExam} className={styles.addExamForm}>
            <div className="form-group">
              <label htmlFor="examName">Exam Title *</label>
              <input
                id="examName"
                type="text"
                required
                placeholder="e.g. Unit Test 2, Lab Practical"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="examDate">Exam Date *</label>
              <input
                id="examDate"
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="examMaxMarks">Max Marks *</label>
              <input
                id="examMaxMarks"
                type="number"
                required
                placeholder="100"
                value={examMaxMarks}
                onChange={(e) => setExamMaxMarks(e.target.value)}
                className="form-control"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: '45px', flex: 1 }}>
                {loading ? 'Creating...' : 'Schedule'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddExam(false)}
                className="btn btn-secondary"
                style={{ height: '45px', flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      {/* Grades Table */}
      {selectedExamId ? (
        <>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>
                      Marks Obtained (Max: {selectedExam ? selectedExam.maxMarks : 100})
                    </th>
                    <th>Remarks / Teacher Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => {
                    const grade = grades[st.id] || { marks: '', remarks: '' };
                    return (
                      <tr key={st.id}>
                        <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                          {st.rollNumber}
                        </td>
                        <td style={{ fontWeight: 500 }}>{st.name}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="0.0"
                              value={grade.marks}
                              onChange={(e) => handleGradeChange(st.id, e.target.value)}
                              className="form-control"
                              style={{ width: '100px', textAlign: 'center' }}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              / {selectedExam ? selectedExam.maxMarks : 100}
                            </span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="e.g. Well written, weak in algebra"
                            value={grade.remarks}
                            onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                            className="form-control"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSaveGrades}
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: '150px' }}
            >
              {loading ? 'Saving...' : 'Save Grades'}
            </button>
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Please select an exam evaluation from the top right or schedule a new one to start inputting grades.
          </p>
        </div>
      )}
    </div>
  );
}
