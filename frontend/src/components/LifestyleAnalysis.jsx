import React, { useState, useEffect } from 'react';

export default function LifestyleAnalysis({ userId }) {
  const [inputs, setInputs] = useState({
    occupation: 'Software Engineer',
    workingHours: '8-10 hours',
    sleepHabits: '6-7 hours, irregular',
    foodHabits: 'Balanced, occasional fast food',
    exercise: '1-2 times/week',
    smoking: 'Non-smoker',
    alcohol: 'Occasional social',
    screenTime: '8+ hours/day',
    stressLevel: 'Moderate',
    travelFrequency: 'Rarely'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const storageKey = `biotwin_lifestyle_${userId}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setResult(JSON.parse(saved));
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      // Custom heuristic calculation for Lifestyle Score
      let score = 85;
      const positive = [];
      const negative = [];
      const recommendations = [];

      // Check smoking
      if (inputs.smoking === 'Smoker') {
        score -= 15;
        negative.push("Active Nicotine Intake: Causes systemic arterial stiffness and inflammation.");
        recommendations.push("Join a smoking cessation program and consider nicotine replacement therapy.");
      } else {
        positive.push("Non-smoker: Optimal lung capacity and arterial elasticity levels maintained.");
      }

      // Check alcohol
      if (inputs.alcohol === 'Heavy') {
        score -= 10;
        negative.push("Heavy Alcohol consumption: Interrupted REM cycles and liver strain.");
        recommendations.push("Limit alcohol consumption to under 2 drinks per week to support liver detox pathways.");
      } else {
        positive.push("Controlled alcohol habits: Minimal toxic burden on metabolic processes.");
      }

      // Check sleep
      if (inputs.sleepHabits.includes("irregular") || inputs.sleepHabits.includes("5-6") || inputs.sleepHabits.includes("less")) {
        score -= 8;
        negative.push("Suboptimal Sleep Patterns: High morning cortisol levels leading to metabolic stress.");
        recommendations.push("Establish a consistent bedtime routine to secure 7.5+ hours of sleep nightly.");
      } else {
        positive.push("Healthy sleep latency: Adequate nightly brain waste clearance (glymphatic sync).");
      }

      // Check screen time
      if (inputs.screenTime.includes("8+") || inputs.screenTime.includes("10+")) {
        score -= 5;
        negative.push("Elevated Screen Exposure: Risk of digital eye strain and circadian misalignment.");
        recommendations.push("Implement the 20-20-20 rule and wear blue light filters during late-evening screen sessions.");
      } else {
        positive.push("Regulated Screen Time: Reduced exposure to high-energy visible light.");
      }

      // Check exercise
      if (inputs.exercise.includes("None") || inputs.exercise.includes("Rarely")) {
        score -= 10;
        negative.push("Sedentary Tendencies: Suboptimal cardiovascular conditioning and insulin sensitivity.");
        recommendations.push("Incorporate 150 minutes of moderate aerobic exercises weekly (e.g. brisk walking).");
      } else {
        positive.push("Regular exercise commitment: Good cardiovascular recovery and mitochondrial output.");
      }

      // Check stress
      if (inputs.stressLevel === 'High') {
        score -= 8;
        negative.push("Chronic High Stress: Elevation in vascular tone and constant sympathetic dominance.");
        recommendations.push("Incorporate 10-15 minutes of box breathing or guided meditation daily.");
      } else {
        positive.push("Stress resilience: Healthy autonomic nervous balance.");
      }

      // Generic additions if lists are too short
      if (positive.length === 0) positive.push("Adaptive physiological baseline.");
      if (negative.length === 0) negative.push("No severe negative lifestyle indicators flagged.");
      if (recommendations.length === 0) recommendations.push("Maintain current healthy habits and track monthly blood counts.");

      score = Math.max(40, Math.min(100, score));

      const analysisResult = {
        score,
        risk: score < 65 ? 'High Risk' : score < 80 ? 'Moderate Risk' : 'Low Risk',
        positive,
        negative,
        recommendations,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(analysisResult));
      setResult(analysisResult);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      <div className="glass-panel">
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Lifestyle Agent</span>
        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>Biological Habits Auditor</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Enter lifestyle information to model and assess long-term metabolic health profiles.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
        
        {/* Form Inputs */}
        <form onSubmit={handleAnalyze} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '1.05rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Habits Parameters</h4>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Occupation</label>
            <input type="text" name="occupation" value={inputs.occupation} onChange={handleInputChange} className="form-control" placeholder="Software Developer, Doctor, etc." required />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Working Hours</label>
            <select name="workingHours" value={inputs.workingHours} onChange={handleInputChange} className="form-control">
              <option>Flexible / Under 6 hours</option>
              <option>6-8 hours</option>
              <option>8-10 hours</option>
              <option>Over 10 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Sleep Habits</label>
            <select name="sleepHabits" value={inputs.sleepHabits} onChange={handleInputChange} className="form-control">
              <option>7-8 hours, consistent</option>
              <option>6-7 hours, irregular</option>
              <option>5-6 hours, late bedtimes</option>
              <option>Less than 5 hours, highly interrupted</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Food Habits</label>
            <select name="foodHabits" value={inputs.foodHabits} onChange={handleInputChange} className="form-control">
              <option>Healthy organic, high protein/fiber</option>
              <option>Balanced, occasional fast food</option>
              <option>Irregular, frequent processed food</option>
              <option>High sugar, fast food dominance</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Exercise Frequency</label>
            <select name="exercise" value={inputs.exercise} onChange={handleInputChange} className="form-control">
              <option>Daily/4+ times a week</option>
              <option>2-3 times/week</option>
              <option>1-2 times/week</option>
              <option>None / Rarely</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Smoking Habits</label>
            <select name="smoking" value={inputs.smoking} onChange={handleInputChange} className="form-control">
              <option>Non-smoker</option>
              <option>Former Smoker</option>
              <option>Smoker</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Alcohol Habits</label>
            <select name="alcohol" value={inputs.alcohol} onChange={handleInputChange} className="form-control">
              <option>None / Abstain</option>
              <option>Occasional social</option>
              <option>Frequent social (2-3x / week)</option>
              <option>Heavy</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Daily Screen Time</label>
            <select name="screenTime" value={inputs.screenTime} onChange={handleInputChange} className="form-control">
              <option>Under 4 hours/day</option>
              <option>4-6 hours/day</option>
              <option>6-8 hours/day</option>
              <option>8+ hours/day</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Stress Level</label>
            <select name="stressLevel" value={inputs.stressLevel} onChange={handleInputChange} className="form-control">
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Travel Frequency</label>
            <select name="travelFrequency" value={inputs.travelFrequency} onChange={handleInputChange} className="form-control">
              <option>Rarely</option>
              <option>Monthly</option>
              <option>Weekly / Constant commuter</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Analyzing habits...' : '🤖 Trigger AI Lifestyle Audit'}
          </button>
        </form>

        {/* Audit Result Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {loading && (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <div className="agent-indicator running" style={{ width: '40px', height: '40px', marginBottom: '20px' }}></div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Orchestrating AI Habits Analysis Agent...</p>
            </div>
          )}

          {!loading && !result && (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem', marginBottom: '15px' }}>📋</span>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>Waiting for habits submission</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px' }}>Submit your daily details on the left. The AI agent will compute your biological score and risk factors.</p>
            </div>
          )}

          {result && (
            <div className="glass-panel animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* Score card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Audited Lifestyle score</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.score >= 80 ? 'var(--accent-emerald)' : result.score >= 65 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>{result.score}/100</div>
                </div>
                <div style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  background: result.risk === 'Low Risk' ? 'rgba(16,185,129,0.1)' : result.risk === 'Moderate Risk' ? 'rgba(245,158,11,0.1)' : 'rgba(244,63,94,0.1)',
                  color: result.risk === 'Low Risk' ? 'var(--accent-emerald)' : result.risk === 'Moderate Risk' ? 'var(--accent-amber)' : 'var(--accent-rose)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: `1px solid ${result.risk === 'Low Risk' ? 'rgba(16,185,129,0.2)' : result.risk === 'Moderate Risk' ? 'rgba(245,158,11,0.2)' : 'rgba(244,63,94,0.2)'}`
                }}>
                  {result.risk}
                </div>
              </div>

              {/* Positive habits list */}
              <div>
                <h5 style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', marginBottom: '8px' }}>🟢 Positive Habits</h5>
                <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.positive.map((p, idx) => <li key={idx}>{p}</li>)}
                </ul>
              </div>

              {/* Negative habits list */}
              <div>
                <h5 style={{ fontSize: '0.9rem', color: 'var(--accent-rose)', marginBottom: '8px' }}>🔴 Areas of Concern</h5>
                <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.negative.map((n, idx) => <li key={idx}>{n}</li>)}
                </ul>
              </div>

              {/* Action items */}
              <div style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.15)', padding: '16px', borderRadius: '10px' }}>
                <h5 style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', marginBottom: '8px' }}>💡 Personalized Recommendations</h5>
                <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.4' }}>
                  {result.recommendations.map((r, idx) => <li key={idx}>{r}</li>)}
                </ul>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
