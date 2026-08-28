'use client';

import { useState } from 'react';
import { deleteTeacher } from './actions';

interface DeleteButtonProps {
  id: string;
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this teacher? This will unlink them from all subjects and classes they teach.')) {
      return;
    }

    setLoading(true);
    const res = await deleteTeacher(id);
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
