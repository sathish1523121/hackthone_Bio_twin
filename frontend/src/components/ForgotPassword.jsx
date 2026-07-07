import React, { useState } from 'react';

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Password reset request failed.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Request failed. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto' }} className="glass-panel animate-fade-in-up">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '2.5rem', display: 'inline-block', filter: 'drop-shadow(0 0 8px var(--accent-purple))', marginBottom: '16px' }}>🔑</span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
          Reset Password
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {!success 
            ? 'Enter your registered email address below, and we will send you a password reset link.' 
            : 'If this email is registered, we have sent a secure password reset link.'
          }
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {!success ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-control" 
              placeholder="user@example.com" 
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required 
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '16px' }}
            disabled={loading}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="agent-indicator running" style={{ width: '14px', height: '14px' }}></div>
                Sending Link...
              </div>
            ) : (
              'Send Password Reset Link'
            )}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-emerald-glow)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', fontSize: '1.8rem', marginBottom: '20px' }}>
            ✓
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '8px' }}>
            Reset Link Sent!
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
            Please check your inbox (and spam folder) for instructions. The reset link is valid for 15 minutes. For local development, check <code>backend/sent_emails.txt</code>.
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', fontSize: '0.85rem' }}>
        <button
          type="button"
          onClick={onBackToLogin}
          style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}
