import React, { useState } from 'react';

const GOAL_OPTIONS = [
  "Improve fitness",
  "Better sleep",
  "Weight management",
  "Improve lifestyle",
  "General health tracking"
];

export default function OnboardingWizard({ userId, token, defaultName = '', onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: defaultName,
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    location: '',
    healthGoals: [],
    sleepHours: '7',
    sleepQuality: 'Good',
    exerciseLevel: 'Moderately Active',
    workoutFrequency: '3-4 times/week',
    diet: 'Balanced',
    waterIntake: '2-3L',
    stressLevel: 'Normal',
    existingConditions: 'None',
    allergies: 'None',
    currentMedications: 'None'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.age || !formData.height || !formData.weight || !formData.location) {
        setError('Please fill in all health details to proceed.');
        return;
      }
    }
    if (currentStep === 2) {
      if (formData.healthGoals.length === 0) {
        setError('Please select at least one health goal.');
        return;
      }
    }
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        throw new Error('Failed to save health profile');
      }

      const data = await res.json();
      onComplete(data.profile);
    } catch (err) {
      setError(err.message || 'Server connection issue. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '650px', margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.8rem' }}>Create Digital Twin Profile</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' }}>
        Complete the wizard to build your initial AI biological model.
      </p>

      {/* Step Indicators */}
      <div className="wizard-steps">
        <div className="wizard-progress-bar" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
        {[1, 2, 3, 4].map(step => (
          <div 
            key={step} 
            className={`wizard-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            onClick={() => step < currentStep && setCurrentStep(step)}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && "Basic Info"}
              {step === 2 && "Goals"}
              {step === 3 && "Lifestyle"}
              {step === 4 && "Medical"}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* STEP 1: Basic Health Information */}
        {currentStep === 1 && (
          <div className="animate-fade-in-up">
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>Step 1: Basic Health Details</h3>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-control" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" name="age" className="form-control" placeholder="30" value={formData.age} onChange={handleChange} required />
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
                <input type="text" name="height" className="form-control" placeholder="175" value={formData.height} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="text" name="weight" className="form-control" placeholder="70" value={formData.weight} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location (City, Country)</label>
              <input type="text" name="location" className="form-control" placeholder="New York, USA" value={formData.location} onChange={handleChange} required />
            </div>
          </div>
        )}

        {/* STEP 2: Health Goals */}
        {currentStep === 2 && (
          <div className="animate-fade-in-up">
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>Step 2: Choose Your Health Goals</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '0.9rem' }}>
              What health outcomes would you like BioTwin AI to prioritize?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {GOAL_OPTIONS.map(goal => {
                const isSelected = formData.healthGoals.includes(goal);
                return (
                  <div 
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      readOnly
                      style={{ cursor: 'pointer', accentColor: 'var(--accent-purple)' }} 
                    />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{goal}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Lifestyle Information */}
        {currentStep === 3 && (
          <div className="animate-fade-in-up">
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>Step 3: Lifestyle Habits</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Average Sleep (Hours)</label>
                <input type="number" name="sleepHours" className="form-control" min="4" max="15" value={formData.sleepHours} onChange={handleChange} />
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
                <label className="form-label">Activity Level</label>
                <select name="exerciseLevel" className="form-control" value={formData.exerciseLevel} onChange={handleChange}>
                  <option>Sedentary</option>
                  <option>Lightly Active</option>
                  <option>Moderately Active</option>
                  <option>Very Active</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Workout Frequency</label>
                <select name="workoutFrequency" className="form-control" value={formData.workoutFrequency} onChange={handleChange}>
                  <option>0 workouts/week</option>
                  <option>1-2 times/week</option>
                  <option>3-4 times/week</option>
                  <option>5+ times/week</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Food Habits (Diet)</label>
                <select name="diet" className="form-control" value={formData.diet} onChange={handleChange}>
                  <option>Balanced</option>
                  <option>High Protein</option>
                  <option>Low Carb</option>
                  <option>Vegetarian</option>
                  <option>Vegan</option>
                  <option>Fast Food / Ketogenic</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Water Intake</label>
                <select name="waterIntake" className="form-control" value={formData.waterIntake} onChange={handleChange}>
                  <option>&lt; 1 Liter</option>
                  <option>1-2 Liters</option>
                  <option>2-3 Liters</option>
                  <option>3+ Liters</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Medical Information */}
        {currentStep === 4 && (
          <div className="animate-fade-in-up">
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>Step 4: Medical Profile</h3>
            
            <div className="form-group">
              <label className="form-label">Existing Conditions</label>
              <textarea name="existingConditions" rows="2" className="form-control" placeholder="E.g. Diabetes, Hypertension, None" value={formData.existingConditions} onChange={handleChange}></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Allergies</label>
              <textarea name="allergies" rows="2" className="form-control" placeholder="E.g. Penicillin, Peanuts, None" value={formData.allergies} onChange={handleChange}></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Current Medications</label>
              <textarea name="currentMedications" rows="2" className="form-control" placeholder="E.g. Atorvastatin 10mg, Metformin, None" value={formData.currentMedications} onChange={handleChange}></textarea>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
          {currentStep > 1 ? (
            <button type="button" className="btn btn-secondary" onClick={handleBack} disabled={loading}>
              &larr; Back
            </button>
          ) : (
            <div></div> // Spacer
          )}

          {currentStep < 4 ? (
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              Next Step &rarr;
            </button>
          ) : (
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? "Creating Profile..." : "Create Health Profile"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
