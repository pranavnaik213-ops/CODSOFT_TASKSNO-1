'use client';

import { useState } from 'react';
import { deleteStudent } from './actions';

interface DeleteButtonProps {
  id: string;
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this student? All their grade records, attendance sheets, and invoices will be permanently deleted.')) {
      return;
    }

    setLoading(true);
    const res = await deleteStudent(id);
    setLoading(false);

    if (res?.error) {
      alert(res.error);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-danger"
      style={{ padding: '6px 12px', fontSize: '0.82rem' }}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
