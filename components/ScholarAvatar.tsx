'use client';

import { useState } from 'react';
import { PERIODS } from '@/lib/constants';

const HONORIFIC = /^(רבן|רבי|רב|מר|מרי|אבא|בית)\s+/;

function initial(nameHe: string): string {
  const stripped = nameHe.replace(HONORIFIC, '').trim();
  return (stripped[0] || nameHe[0] || '?');
}

interface Props {
  nameHe: string;
  period: string;
  imageUrl?: string | null;
  size?: number;
  rounded?: 'full' | 'xl';
  className?: string;
}

/** Scholar image with graceful period-monogram fallback (no invented faces). */
export function ScholarAvatar({ nameHe, period, imageUrl, size = 64, rounded = 'xl', className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  const p = PERIODS[period as keyof typeof PERIODS];
  const hex = p?.colorHex || '#8a8172';
  const radius = rounded === 'full' ? '9999px' : '0.75rem';
  const showImg = imageUrl && !failed;

  return (
    <div
      className={`shrink-0 overflow-hidden flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: showImg ? '#fff' : `${hex}14`,
        border: `2px solid ${hex}40`,
      }}
      aria-hidden={!showImg}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt={nameHe}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span className="font-display font-bold leading-none" style={{ color: hex, fontSize: size * 0.44 }}>
          {initial(nameHe)}
        </span>
      )}
    </div>
  );
}
