'use client';

import { useState } from 'react';
import { markFeePaid } from './actions';

interface RecordPaymentButtonProps {
  id: string;
}

export default function RecordPaymentButton({ id }: RecordPaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!confirm('Mark this invoice as PAID? This will record the current timestamp.')) {
      return;
    }

    setLoading(true);
    const res = await markFeePaid(id);
    setLoading(false);

    if (res?.error) {
      alert(res.error);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="btn btn-primary"
      style={{ padding: '6px 12px', fontSize: '0.82rem', background: 'var(--success-bg)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
    >
      {loading ? 'Processing...' : 'Record Payment'}
    </button>
  );
}
