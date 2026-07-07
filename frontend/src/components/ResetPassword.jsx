import React, { useState, useEffect } from 'react';

export default function ResetPassword({ onResetSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Extract query parameters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(urlEmail);
    } else {
      setError('Invalid reset link. Missing token or email query parameters.');
    }
  }, []);

  const validatePasswordStrength = (pwd) => {
    // Min 8 characters, at least 1 letter and 1 number
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    return pwd.length >= 8 && hasLetter && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Invalid password reset session. Missing email or token.');
      return;
    }

    if (!password) {
      setError('Password cannot be empty.');
      return;
    }

    if (!validatePasswordStrength(password)) {
      setError('Password is too weak. It must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          token: token,
          password: password,
          confirmPassword: confirmPassword
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Password reset failed.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed. The link might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto' }} className="glass-panel animate-fade-in-up">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '2.5rem', display: 'inline-block', filter: 'drop-shadow(0 0 8px var(--accent-purple))', marginBottom: '16px' }}>🔒</span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
          Create New Password
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {!success 
            ? 'Please enter and confirm your new secure password.'
            : 'Your password has been updated securely.'
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
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Min. 8 chars (letters + numbers)" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required 
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Confirm New Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
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
                Resetting Password...
              </div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-emerald-glow)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', fontSize: '1.8rem', marginBottom: '20px' }}>
            ✓
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '8px' }}>
            Password Changed Successfully
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
            Your account has been updated with the new password. You can now log in to your account.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={onResetSuccess}
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}
