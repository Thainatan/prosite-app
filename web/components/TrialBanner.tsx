'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { AlertCircle, X } from 'lucide-react';

export default function TrialBanner() {
  const [info, setInfo] = useState<{ plan: string; daysLeftInTrial: number | null } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    apiFetch('/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.plan === 'TRIAL') setInfo({ plan: d.plan, daysLeftInTrial: d.daysLeftInTrial });
      })
      .catch(() => {});
  }, []);

  if (!info || dismissed) return null;

  const expired = info.daysLeftInTrial !== null && info.daysLeftInTrial <= 0;
  const urgency = !expired && info.daysLeftInTrial !== null && info.daysLeftInTrial <= 3;

  return (
    <div style={{
      background: expired ? '#FEF2F2' : urgency ? '#FFFBEB' : '#EFF6FF',
      border: `1px solid ${expired ? '#FECACA' : urgency ? '#FDE68A' : '#BFDBFE'}`,
      borderRadius: 10, padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      margin: '0 0 16px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <AlertCircle size={16} color={expired ? '#EF4444' : urgency ? '#F59E0B' : '#3B82F6'} strokeWidth={2}/>
      <span style={{ flex: 1, fontSize: 13, color: expired ? '#991B1B' : urgency ? '#92400E' : '#1E40AF' }}>
        {expired
          ? 'Your free trial has expired.'
          : `${info.daysLeftInTrial} day${info.daysLeftInTrial === 1 ? '' : 's'} left in your free trial.`}
        {' '}
        <a href="/settings/billing" style={{ fontWeight: 700, color: 'inherit' }}>
          Upgrade now →
        </a>
      </span>
      {!expired && (
        <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#9CA3AF', padding: 0 }}>
          <X size={14}/>
        </button>
      )}
    </div>
  );
}
