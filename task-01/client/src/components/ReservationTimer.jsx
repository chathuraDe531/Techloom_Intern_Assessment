import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function ReservationTimer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateRemaining = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60 && timeLeft > 0;
  const isExpired = timeLeft === 0;

  // Percentage of 5 minutes (300 seconds) remaining
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / 300) * 100));

  return (
    <div className={`reservation-timer-banner ${isUrgent ? 'urgent' : ''} ${isExpired ? 'expired' : ''}`}>
      <div className="timer-header">
        <div className="timer-title">
          {isUrgent ? (
            <AlertTriangle size={18} className="timer-icon pulse" />
          ) : (
            <Clock size={18} className="timer-icon" />
          )}
          <span>
            {isExpired ? 'Reservation Expired' : 'Stock Reserved for 5 Minutes'}
          </span>
        </div>
        <div className="timer-countdown">
          {isExpired ? (
            <span className="expired-label">00:00 - Stock Returned</span>
          ) : (
            <span className="time-digits">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      <div className="timer-progress-track">
        <div
          className={`timer-progress-fill ${isUrgent ? 'fill-urgent' : ''}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p className="timer-footnote">
        {isExpired
          ? 'Your 5-minute stock hold has expired. Any pending payment will be rejected and items returned to available inventory.'
          : 'Complete payment before this timer expires to secure your reserved items.'}
      </p>
    </div>
  );
}
