import React, { useState, useEffect } from 'react';

export default function VerifyEmail({ email, onVerificationSuccess, onBackToSignup }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  
  // Resend cooldown timer (60 seconds)
  const [resendCooldown, setResendCooldown] = useState(60);

  // 60-second resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setResendSuccess('');

    try {
      const res = await fetch('http://localhost:8000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          otp: otp
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Invalid verification code.');
      }

      const data = await res.json();
      setResendSuccess('Email verified successfully!');
      
      setTimeout(() => {
        onVerificationSuccess(data.token, data.user);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Verification check failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError('');
    setResendSuccess('');
    
    try {
      const res = await fetch('http://localhost:8000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase()
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to resend code.');
      }

      setResendSuccess('A new 6-digit verification code has been sent to your email.');
      setResendCooldown(60); // Cooldown for resending
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '40px auto' }} className="glass-panel animate-fade-in-up">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '2.5rem', display: 'inline-block', filter: 'drop-shadow(0 0 8px var(--accent-cyan))', marginBottom: '16px' }}>✉️</span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
          Verify Your Email
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginTop: '10px' }}>
          We sent a 6-digit verification code to <br />
          <strong style={{ color: 'var(--accent-cyan)' }}>{email}</strong>
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {resendSuccess && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
          {resendSuccess}
        </div>
      )}

      <form onSubmit={handleSubmitOtp}>
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Verification OTP Code</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="123456" 
            maxLength={6}
            value={otp}
            onChange={(e) => {
              // only allow digits
              const val = e.target.value.replace(/\D/g, '');
              setOtp(val);
              setError('');
            }}
            required 
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontFamily: 'monospace' }}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '16px', position: 'relative' }}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div className="agent-indicator running" style={{ width: '14px', height: '14px' }}></div>
              Verifying Code...
            </div>
          ) : (
            'Verify OTP & Access Twin'
          )}
        </button>
      </form>

      <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-tertiary)', border: '1px solid var(--glass-border)', marginBottom: '20px', lineHeight: '1.4' }}>
        💡 <strong>Note:</strong> Check your spam folder if you do not see the verification email. For local development, check the <code>backend/sent_emails.txt</code> file in your workspace.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', fontSize: '0.85rem' }}>
        <button
          type="button"
          onClick={handleResend}
          style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? 'var(--text-tertiary)' : 'var(--accent-cyan)', textDecoration: resendCooldown > 0 ? 'none' : 'underline', cursor: resendCooldown > 0 ? 'default' : 'pointer', fontSize: '0.85rem', padding: 0 }}
          disabled={resendCooldown > 0 || resendLoading}
        >
          {resendLoading ? 'Resending...' : resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
        </button>

        <button
          type="button"
          onClick={onBackToSignup}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
        >
          Back to Signup
        </button>
      </div>
    </div>
  );
}
