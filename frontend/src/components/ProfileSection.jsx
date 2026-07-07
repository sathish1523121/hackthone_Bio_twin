import React, { useState } from 'react';

const GOAL_OPTIONS = [
  "Improve fitness",
  "Better sleep",
  "Weight management",
  "Improve lifestyle",
  "General health tracking"
];

export default function ProfileSection({ userId, token, initialProfile, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: initialProfile?.name || '',
    age: initialProfile?.age || '',
    gender: initialProfile?.gender || 'Male',
    height: initialProfile?.height || '',
    weight: initialProfile?.weight || '',
    location: initialProfile?.location || '',
    healthGoals: initialProfile?.healthGoals || [],
    sleepHours: initialProfile?.sleepHours || '7',
    sleepQuality: initialProfile?.sleepQuality || 'Good',
    exerciseLevel: initialProfile?.exerciseLevel || 'Moderately Active',
    workoutFrequency: initialProfile?.workoutFrequency || '3-4 times/week',
    diet: initialProfile?.diet || 'Balanced',
    waterIntake: initialProfile?.waterIntake || '2-3L',
    stressLevel: initialProfile?.stressLevel || 'Normal',
    existingConditions: initialProfile?.existingConditions || 'None',
    allergies: initialProfile?.allergies || 'None',
    currentMedications: initialProfile?.currentMedications || 'None'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalToggle = (goal) => {
    setFormData(prev => {
      const goals = prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter(g => g !== goal)
        : [...prev.healthGoals, goal];
      return { ...prev, healthGoals: goals };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (userId === 'demo-user') {
      setTimeout(() => {
        setSuccessMsg('Health profile updated successfully! Re-synced with biological twin.');
        setTimeout(() => {
          onSaveSuccess(formData);
        }, 1200);
      }, 800);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          ...formData
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update health profile');
      }

      const data = await res.json();
      setSuccessMsg('Health profile updated successfully! Re-synced with biological twin.');
      setTimeout(() => {
        onSaveSuccess(data.profile);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '850px', margin: '30px auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-purple)', fontWeight: 600 }}>
            Configure Twin Settings
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your Health Profile
          </h2>
        </div>
        <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={onCancel}>
          Cancel & Close
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* Form Sections Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          
          {/* Column 1: Basic Info & Lifestyle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              👤 Basic Details
            </h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" name="age" className="form-control" value={formData.age} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="text" name="height" className="form-control" value={formData.height} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="text" name="weight" className="form-control" value={formData.weight} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location (City, Country)</label>
              <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} required />
            </div>

            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginTop: '10px' }}>
              🎯 Health Goals
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GOAL_OPTIONS.map(goal => {
                const isSelected = formData.healthGoals.includes(goal);
                return (
                  <div 
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <span>{goal}</span>
                    {isSelected && <span style={{ color: 'var(--accent-purple)' }}>✔</span>}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Column 2: Habits & Medical */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              🏃 Habits & Lifestyle
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Sleep Hours / Night</label>
                <input type="number" name="sleepHours" className="form-control" value={formData.sleepHours} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Sleep Quality</label>
                <select name="sleepQuality" className="form-control" value={formData.sleepQuality} onChange={handleChange}>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Exercise Level</label>
                <select name="exerciseLevel" className="form-control" value={formData.exerciseLevel} onChange={handleChange}>
                  <option>Sedentary</option>
                  <option>Lightly Active</option>
                  <option>Moderately Active</option>
                  <option>Very Active</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stress Level</label>
                <select name="stressLevel" className="form-control" value={formData.stressLevel} onChange={handleChange}>
                  <option>Low</option>
                  <option>Normal</option>
                  <option>Moderate</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Diet Pattern</label>
                <select name="diet" className="form-control" value={formData.diet} onChange={handleChange}>
                  <option>Balanced</option>
                  <option>Vegetarian</option>
                  <option>Vegan</option>
                  <option>Ketogenic</option>
                  <option>Low Cholesterol</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Daily Water Intake</label>
                <select name="waterIntake" className="form-control" value={formData.waterIntake} onChange={handleChange}>
                  <option>&lt; 1.5L</option>
                  <option>1.5L - 2L</option>
                  <option>2L - 3L</option>
                  <option>&gt; 3L</option>
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginTop: '10px' }}>
              🩺 Medical Overview
            </h3>

            <div className="form-group">
              <label className="form-label">Existing Conditions</label>
              <input type="text" name="existingConditions" className="form-control" value={formData.existingConditions} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Allergies</label>
              <input type="text" name="allergies" className="form-control" value={formData.allergies} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Current Medications</label>
              <input type="text" name="currentMedications" className="form-control" value={formData.currentMedications} onChange={handleChange} />
            </div>

          </div>

        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ minWidth: '150px' }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="agent-indicator running" style={{ width: '12px', height: '12px' }}></span>
                <span>Saving Profile...</span>
              </div>
            ) : (
              'Save & Sync Twin'
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
