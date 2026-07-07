import React, { useState } from 'react';

export default function HealthSimulation({ userId, token, activeReport }) {
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, title: 'Exercise increase simulation', date: '2 days ago' },
    { id: 2, title: 'Diet improvement simulation', date: '5 days ago' }
  ]);
  
  const [sliders, setSliders] = useState({
    sleepHours: 8,
    exerciseDays: 3,
    waterLiters: 2.2,
    dietType: 'Balanced'
  });

  const handleSliderSimulation = (e) => {
    e.preventDefault();
    setLoading(true);
    setShowReport(false);
    
    // Simulate backend processing
    setTimeout(() => {
      setLoading(false);
      setShowReport(true);
      setHistory(prev => [
        { id: Date.now(), title: `Sleep improvement simulation (${sliders.sleepHours} hrs)`, date: 'Just now' },
        ...prev
      ]);
    }, 1500);
  };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1100px', margin: '30px auto' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>
          Digital Twin Simulation Report
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          What could happen if you change your routine?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showReport ? '1fr' : '1.2fr 1.8fr', gap: '30px' }}>
        
        {/* Sliders Input Panel - We can make this compact if report is showing, or keep it wide */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: showReport ? 'row' : 'column', gap: '20px', flexWrap: 'wrap', alignItems: showReport ? 'center' : 'stretch', justifyContent: 'space-between' }}>
          <div style={{ width: showReport ? 'auto' : '100%' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff', borderBottom: showReport ? 'none' : '1px solid var(--glass-border)', paddingBottom: showReport ? '0' : '8px' }}>
              Adjust Variables
            </h4>
          </div>
          
          <div style={{ flex: 1, display: 'flex', gap: '20px', flexDirection: showReport ? 'row' : 'column' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Daily Sleep</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{sliders.sleepHours} hrs</span>
              </div>
              <input 
                type="range" min="4" max="10" step="0.5" 
                value={sliders.sleepHours} 
                onChange={(e) => setSliders({...sliders, sleepHours: e.target.value})} 
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--accent-emerald)' }}>Weekly Exercise</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{sliders.exerciseDays} days</span>
              </div>
              <input 
                type="range" min="0" max="7" step="1" 
                value={sliders.exerciseDays} 
                onChange={(e) => setSliders({...sliders, exerciseDays: e.target.value})} 
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>

          <button onClick={handleSliderSimulation} className="btn btn-primary" style={{ width: showReport ? 'auto' : '100%', marginTop: showReport ? '0' : '10px' }} disabled={loading}>
            {loading ? 'Simulating Twin...' : '🔮 Run Simulation'}
          </button>
        </div>

        {/* Show Report UI when loaded */}
        {loading && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="pulse-brain" style={{ fontSize: '3rem', marginBottom: '20px' }}>🧠</div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-purple)' }}>Computing Multiple Agent Simulations...</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Projecting biological outcomes across medical, lifestyle, and environmental models.</p>
          </div>
        )}

        {showReport && !loading && (
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* 1. SIMULATION REQUEST */}
            <section className="glass-panel" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '15px' }}>1. Simulation Request</h2>
              <div style={{ fontSize: '1.1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>User Question:</span> 
                <strong style={{ marginLeft: '10px' }}>Increase sleep from 5 hours → {sliders.sleepHours} hours</strong>
              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* 2. CURRENT STATE */}
              <section className="glass-panel" style={{ border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>2. Current Digital Twin State</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '1.05rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sleep:</span> <strong>5 hours</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Exercise:</span> <strong>Low</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Food:</span> <strong>Average</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{color: 'var(--accent-rose)'}}>Energy Score:</span> <strong style={{color: 'var(--accent-rose)'}}>60%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{color: 'var(--accent-rose)'}}>Recovery Score:</span> <strong style={{color: 'var(--accent-rose)'}}>55%</strong>
                  </div>
                </div>
              </section>

              {/* 3. MODIFIED SCENARIO */}
              <section className="glass-panel" style={{ border: '1px solid rgba(6, 182, 212, 0.4)' }}>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--accent-cyan)', marginBottom: '15px' }}>3. Modified Scenario</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '1.05rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--accent-cyan)' }}>AI changes variable:</span> 
                    <strong>Sleep → {sliders.sleepHours} hours</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: 'var(--text-secondary)' }}>
                    <span>Other factors:</span> 
                    <span>Same</span>
                  </div>
                </div>
              </section>
            </div>

            {/* 4. AI PREDICTION */}
            <section className="glass-panel" style={{ borderTop: '4px solid var(--accent-emerald)' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>📈</span> 4. AI Prediction
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '1.1rem' }}>Energy</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: 'bold' }}>
                    <span style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>60%</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>↓</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>75%</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '1.1rem' }}>Recovery</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: 'bold' }}>
                    <span style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>55%</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>↓</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>78%</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '1.1rem' }}>Lifestyle Score</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: 'bold' }}>
                    <span style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>65%</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>↓</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>80%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. BEFORE VS AFTER COMPARISON */}
            <section className="glass-panel">
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>⚖️</span> 5. Before VS After Comparison
              </h2>
              <div style={{ display: 'flex', gap: '30px', position: 'relative' }}>
                
                <div style={{ flex: 1, padding: '20px', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '12px' }}>
                  <h3 style={{ color: 'var(--accent-rose)', marginBottom: '15px', textAlign: 'center' }}>Before</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1.05rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: 'var(--text-secondary)'}}>Sleep:</span> <strong>5 hrs</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: 'var(--text-secondary)'}}>Activity:</span> <strong>Low</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}><span style={{color: 'var(--text-secondary)'}}>Score:</span> <strong>65</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--accent-cyan)' }}>
                  ➔
                </div>

                <div style={{ flex: 1, padding: '20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                  <h3 style={{ color: 'var(--accent-emerald)', marginBottom: '15px', textAlign: 'center' }}>After Simulation</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1.05rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: 'var(--text-secondary)'}}>Sleep:</span> <strong>{sliders.sleepHours} hrs</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: 'var(--text-secondary)'}}>Activity:</span> <strong>Same</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}><span style={{color: 'var(--text-secondary)'}}>Score:</span> <strong style={{color: 'var(--accent-emerald)'}}>80</strong></div>
                  </div>
                </div>

              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* 6. AGENT OPINIONS */}
              <section className="glass-panel">
                <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '20px' }}>6. Agent Opinions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>Medical Agent:</div>
                    <div style={{ fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', marginTop: '4px' }}>"Better sleep consistency may support recovery."</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: 'bold' }}>Lifestyle Agent:</div>
                    <div style={{ fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', marginTop: '4px' }}>"Routine improvement detected."</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', fontWeight: 'bold' }}>Research Agent:</div>
                    <div style={{ fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', marginTop: '4px' }}>"Evidence supports sleep-health connection."</div>
                  </div>
                </div>
              </section>

              {/* 7. RISK ANALYSIS */}
              <section className="glass-panel">
                <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '20px' }}>7. Risk Analysis</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ padding: '15px', borderLeft: '3px solid var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.05)' }}>
                    <strong style={{ color: 'var(--accent-emerald)', display: 'block', marginBottom: '5px' }}>Positive:</strong>
                    <span>Better recovery and hormone regulation</span>
                  </div>
                  <div style={{ padding: '15px', borderLeft: '3px solid var(--accent-amber)', background: 'rgba(245, 158, 11, 0.05)' }}>
                    <strong style={{ color: 'var(--accent-amber)', display: 'block', marginBottom: '5px' }}>Challenges:</strong>
                    <span>Requires consistent routine and strict bed times</span>
                  </div>
                </div>
              </section>
            </div>

            {/* 8. PERSONALIZED ACTION PLAN */}
            <section className="glass-panel" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>📋</span> 8. Personalized Action Plan
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: '10px' }}>Day 1-7</h3>
                  <p style={{ fontSize: '1.05rem' }}>Sleep 30 minutes earlier</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: '10px' }}>Week 2</h3>
                  <p style={{ fontSize: '1.05rem' }}>Maintain fixed timing</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: '10px' }}>Month 1</h3>
                  <p style={{ fontSize: '1.05rem' }}>Track improvements in daily energy</p>
                </div>
              </div>
            </section>

            {/* 9. SIMULATION HISTORY */}
            <section className="glass-panel">
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🕒</span> 9. Simulation History
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.map((sim, index) => (
                  <div key={sim.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', marginRight: '15px' }}>{index + 1}.</span>
                      <strong style={{ fontSize: '1.05rem' }}>{sim.title}</strong>
                    </div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>{sim.date}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

      </div>

    </div>
  );
}
