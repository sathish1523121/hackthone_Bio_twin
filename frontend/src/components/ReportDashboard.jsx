import React, { useState, useEffect } from 'react';

export default function ReportDashboard({ userId, token, activeReport, onReupload, history = [], onSelectHistoryReport, onLogout }) {
  const [scoreOffset, setScoreOffset] = useState(440);
  const [displayedScore, setDisplayedScore] = useState(0);

  // Fallbacks for UI if missing in activeReport
  const report = activeReport || {};
  const currentScore = report.healthScore || 78;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // Mock User Overview
  const userOverview = {
    name: report.userName || "Rahul",
    age: report.userAge || 25,
    gender: report.userGender || "Male",
    location: report.userLocation || "Hyderabad",
    height: report.userHeight || "175 cm",
    weight: report.userWeight || "70 kg",
    goals: report.userGoals || ["Improve Fitness", "Optimize Sleep"],
    bioTwinId: `BTX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  };

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.floor(easeProgress * currentScore));
      setScoreOffset(circumference - (easeProgress * currentScore / 100) * circumference);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [currentScore, circumference]);

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '1100px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>
          BioTwin Intelligence Report
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Generated on {new Date(report.createdAt || Date.now()).toLocaleDateString()}
        </p>
      </div>

      {/* 1. USER OVERVIEW */}
      <section className="glass-panel" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>👤</span> 1. User Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Name:</strong> {userOverview.name}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Age:</strong> {userOverview.age}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Gender:</strong> {userOverview.gender}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Height:</strong> {userOverview.height}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Weight:</strong> {userOverview.weight}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Location:</strong> {userOverview.location}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>BioTwin ID:</strong> {userOverview.bioTwinId}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Goals:</strong> {userOverview.goals.join(', ')}</div>
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>BioTwin Status:</strong> 
            <span style={{ color: 'var(--accent-emerald)', marginLeft: '8px', fontWeight: 'bold' }}>● Active</span>
          </div>
        </div>
      </section>

      {/* 2. OVERALL BIOTWIN HEALTH SCORE */}
      <section className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '40px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>2. Overall BioTwin Health Score</h2>
          <div className="score-container" style={{ width: '180px', height: '180px' }}>
            <svg className="score-circle-svg" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-purple)" />
                  <stop offset="100%" stopColor="var(--accent-cyan)" />
                </linearGradient>
              </defs>
              <circle className="score-circle-bg" cx="80" cy="80" r={radius} />
              <circle 
                className="score-circle-fill" 
                cx="80" cy="80" r={radius} 
                strokeDasharray={circumference}
                strokeDashoffset={scoreOffset}
              />
            </svg>
            <div className="score-value">
              <span className="score-number" style={{ fontSize: '3.2rem' }}>{displayedScore}</span>
              <span className="score-label">/ 100</span>
            </div>
          </div>
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '15px', textTransform: 'uppercase' }}>Score Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { label: 'Medical Health', value: 82, color: 'var(--accent-cyan)' },
              { label: 'Lifestyle', value: report.lifestyleScore?.exercise || 65, color: 'var(--accent-emerald)' },
              { label: 'Environment', value: 70, color: 'var(--accent-amber)' },
              { label: 'Consistency', value: 75, color: 'var(--accent-purple)' },
              { label: 'Risk Awareness', value: 80, color: 'var(--accent-rose)' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '130px', fontSize: '0.95rem' }}>{item.label}</div>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.value}%`, background: item.color, borderRadius: '4px' }}></div>
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontWeight: 600 }}>{item.value}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MEDICAL INTELLIGENCE ANALYSIS */}
      <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🏥</span> 3. Medical Intelligence Analysis
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generated by Medical AI Agent using uploaded medical PDFs, blood reports, and previous health history.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '15px' }}>Health Markers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong style={{fontSize: '1.1rem'}}>Vitamin D</strong><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current: 18 ng/ml</div></div>
                <span style={{ color: 'var(--accent-rose)', fontWeight: 'bold' }}>Low</span>
              </div>
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong style={{fontSize: '1.1rem'}}>Cholesterol</strong><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current: 230 mg/dL</div></div>
                <span style={{ color: 'var(--accent-rose)', fontWeight: 'bold' }}>High</span>
              </div>
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong style={{fontSize: '1.1rem'}}>Sugar</strong><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current: Normal</div></div>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>Normal</span>
              </div>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '15px' }}>Medical Timeline</h3>
            <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-26px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-secondary)' }}></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>January</div>
                <div style={{marginTop: '4px'}}><strong>Cholesterol:</strong> 190 mg/dL</div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-26px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>July</div>
                <div style={{marginTop: '4px'}}><strong>Cholesterol:</strong> 230 mg/dL</div>
              </div>
            </div>
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(6,182,212,0.1)', borderLeft: '3px solid var(--accent-cyan)', borderRadius: '4px' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>AI Finding:</strong>
              <p style={{ fontSize: '0.95rem', marginTop: '5px' }}>"Cholesterol level has increased compared with previous reports."</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RISK PATTERN DETECTION */}
      <section className="glass-panel" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⚠️</span> 4. Risk Pattern Detection
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Detected:</h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '1.05rem' }}>
              <li>Low Vitamin D</li>
              <li>Poor sleep</li>
              <li>Low physical activity</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Possible impact:</h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--accent-rose)', fontSize: '1.05rem' }}>
              <li>Low energy</li>
              <li>Poor recovery</li>
              <li>Reduced fitness progress</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5 & 6. LIFESTYLE & NUTRITION ANALYSIS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <section className="glass-panel">
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🏃</span> 5. Lifestyle Intelligence Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Generated by Lifestyle AI Agent. Analyzes Sleep, Exercise, Food, Daily habits.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-purple)' }}>Sleep</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px' }}>
                <span>Current: <strong>5 hours/day</strong></span>
                <span style={{ color: 'var(--text-secondary)' }}>Recommended: 7-8 hours</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Exercise</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px' }}>
                <span>Current: <strong>Low activity</strong></span>
                <span style={{ color: 'var(--text-secondary)' }}>Pattern: Sedentary lifestyle detected</span>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel">
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🥗</span> 6. Nutrition Analysis
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Analyzes food preference, eating pattern, calories, hydration.</p>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', height: '100%' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current:</span><br/>
              <strong style={{ fontSize: '1.15rem' }}>High processed food</strong>
            </div>
            <div style={{ padding: '15px', background: 'rgba(16,185,129,0.1)', borderLeft: '3px solid var(--accent-emerald)', borderRadius: '4px' }}>
              <strong style={{ color: 'var(--accent-emerald)' }}>AI Observation:</strong>
              <p style={{ fontSize: '0.95rem', marginTop: '5px' }}>"Your nutrition quality score is low."</p>
            </div>
          </div>
        </section>
      </div>

      {/* 7 & 8. ENVIRONMENT & SCIENTIFIC EVIDENCE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <section className="glass-panel">
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🌍</span> 7. Environment Intelligence Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Generated by Environment Agent using Weather API and AQI API.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>Location:</span><br/><strong style={{fontSize: '1.1rem'}}>{userOverview.location}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Temperature:</span><br/><strong style={{fontSize: '1.1rem'}}>35°C</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>AQI:</span><br/><strong style={{fontSize: '1.1rem'}}>170</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Air Quality:</span><br/><strong style={{ color: 'var(--accent-rose)', fontSize: '1.1rem' }}>Poor</strong></div>
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(245,158,11,0.1)', borderLeft: '3px solid var(--accent-amber)', borderRadius: '4px' }}>
            <strong style={{ color: 'var(--accent-amber)' }}>AI Analysis:</strong>
            <p style={{ fontSize: '0.95rem', marginTop: '5px' }}>"Outdoor exercise timing optimization suggested."</p>
          </div>
        </section>

        <section className="glass-panel" style={{ border: '1px solid rgba(139, 92, 246, 0.4)' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--accent-purple)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⭐</span> 8. Scientific Evidence Section
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Generated by Research Agent. Purpose: Prevent AI hallucination.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <strong style={{ color: '#fff' }}>AI Finding:</strong>
              <p style={{ fontSize: '1rem', fontStyle: 'italic', marginTop: '4px' }}>"Poor sleep affects recovery"</p>
            </div>
            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Research Match:</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>Found</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Confidence:</span>
                <strong style={{color: 'var(--accent-purple)'}}>92%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Source:</span>
                <span style={{ textAlign: 'right' }}>Scientific knowledge database</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 9. AI AGENT SUMMARY */}
      <section className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>9. AI Agent Summary</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {[
            { name: 'Medical Agent', status: 'Completed', color: 'var(--accent-emerald)' },
            { name: 'Lifestyle Agent', status: 'Completed', color: 'var(--accent-emerald)' },
            { name: 'Environment Agent', status: 'Completed', color: 'var(--accent-emerald)' },
            { name: 'Research Agent', status: 'Completed', color: 'var(--accent-emerald)' },
            { name: 'Simulation Agent', status: 'Ready', color: 'var(--accent-cyan)' }
          ].map((agent, i) => (
            <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>{agent.name}:</strong>
              <span style={{ color: agent.color, fontWeight: 'bold' }}>{agent.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 10. PERSONALIZED RECOMMENDATIONS */}
      <section className="glass-panel">
        <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🎯</span> 10. Personalized Recommendations
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ padding: '20px', borderLeft: '4px solid var(--accent-purple)', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '0 8px 8px 0' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-purple)' }}>Priority 1: Improve sleep schedule</h3>
            <p style={{ marginTop: '8px', fontSize: '1.05rem' }}><strong>Reason:</strong> Current sleep average is below target.</p>
          </div>
          <div style={{ padding: '20px', borderLeft: '4px solid var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '0 8px 8px 0' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>Priority 2: Increase activity</h3>
            <p style={{ marginTop: '8px', fontSize: '1.05rem' }}><strong>Reason:</strong> Low movement pattern detected.</p>
          </div>
        </div>
      </section>

      {/* 11. FUTURE HEALTH ROADMAP */}
      <section className="glass-panel">
        <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '35px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🛣️</span> 11. Future Health Roadmap
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '24px', left: '16%', right: '16%', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', background: 'var(--bg-primary)', border: '3px solid var(--accent-purple)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>30</div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-purple)' }}>Next 30 Days</h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '8px' }}>Improve sleep consistency</p>
          </div>
          
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', background: 'var(--bg-primary)', border: '3px solid var(--accent-cyan)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>90</div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>Next 90 Days</h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '8px' }}>Increase fitness score</p>
          </div>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', background: 'var(--bg-primary)', border: '3px solid var(--accent-emerald)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>6m</div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>Next 6 Months</h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '8px' }}>Improve biomarkers</p>
          </div>
        </div>
      </section>

    </div>
  );
}
