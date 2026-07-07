import React, { useState } from 'react';

export default function DigitalTwin({ activeReport, profile }) {
  const [twinFocus, setTwinFocus] = useState('metabolic');

  const getSystemStatus = (val) => {
    if (val >= 85) return { label: 'Optimal', color: 'var(--accent-emerald)' };
    if (val >= 70) return { label: 'Stable', color: 'var(--accent-cyan)' };
    if (val >= 60) return { label: 'Warning', color: '#eab308' };
    return { label: 'Critical', color: 'var(--accent-rose)' };
  };

  const systems = {
    brain: {
      title: 'Cognitive & Neurological Twin Node',
      health: 82,
      details: 'Sleep efficiency at 82%. Cortisol rhythm forecast is balanced. Circadian latency synced.',
      biomarkers: 'Resting sleep: 7.2h | Stress Index: Normal'
    },
    heart: {
      title: 'Cardiovascular Node',
      health: 76,
      details: 'Atherosclerosis risk index: Low. Heart rate variability is optimal. Blood pressure averages stable.',
      biomarkers: 'RHR: 68 BPM | Average BP: 120/80 mmHg'
    },
    kidney: {
      title: 'Renal & Filtration Node',
      health: 90,
      details: 'Glomerular filtration rate (eGFR) and serum creatinine values indicate optimal filtration reserves.',
      biomarkers: 'eGFR: >90 mL/min/1.73m² | BUN: 14 mg/dL'
    },
    metabolic: {
      title: 'Metabolic & Chemical Engine Node',
      health: 68,
      details: 'Suboptimal score due to borderline cholesterol levels. High recovery priority on lipid profile metrics.',
      biomarkers: 'Total Cholesterol: 218 mg/dL | HbA1c: 5.3%'
    }
  };

  const activeNode = systems[twinFocus];
  const systemState = getSystemStatus(activeNode.health);

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title Panel */}
      <div className="glass-panel">
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Biological Digital Twin</span>
        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>Human Model Telemetry</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>A virtual clinical model mapped directly from your metabolic, genomic, and lifestyle indicators.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
        
        {/* Skeleton body panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '400px', justifyContent: 'space-between' }}>
          
          <h4 style={{ fontSize: '1rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', width: '100%', textAlign: 'center' }}>
            Interactive Avatar Model
          </h4>

          {/* SVG Human Avatar */}
          <div style={{ position: 'relative', width: '220px', height: '320px', margin: '20px 0' }}>
            <svg viewBox="0 0 100 150" style={{ width: '100%', height: '100%' }}>
              <defs>
                <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={systemState.color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={systemState.color} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Glowing aura */}
              <circle cx="50" cy="75" r="45" fill="url(#avatarGlow)" />

              {/* Human Outline silhouette */}
              <path 
                d="M 50,20 C 45,20 40,25 40,30 C 40,35 45,40 50,40 C 55,40 60,35 60,30 C 60,25 55,20 50,20 Z M 48,42 C 40,43 35,46 32,55 C 30,60 27,75 25,85 C 24,88 27,90 29,88 C 30,86 33,70 35,62 C 36,60 37,58 38,58 L 38,105 C 38,110 35,120 33,135 C 32,138 35,140 37,138 C 39,135 42,122 45,115 L 48,115 L 48,145 C 48,148 52,148 52,145 L 52,115 L 55,115 C 58,122 61,135 63,138 C 65,140 68,138 67,135 C 65,120 62,110 62,105 L 62,58 C 63,58 64,60 65,62 C 67,70 70,86 71,88 C 73,90 76,88 75,85 C 73,75 70,60 68,55 C 65,46 60,43 52,42 Z" 
                fill="rgba(255,255,255,0.06)" 
                stroke="rgba(255,255,255,0.18)" 
                strokeWidth="1"
              />

              {/* Head / Brain node */}
              <circle cx="50" cy="30" r="5" fill={twinFocus === 'brain' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)'} stroke="var(--accent-purple)" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setTwinFocus('brain')} />
              
              {/* Chest / Heart node */}
              <circle cx="50" cy="55" r="5" fill={twinFocus === 'heart' ? 'var(--accent-rose)' : 'rgba(255,255,255,0.1)'} stroke="var(--accent-rose)" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setTwinFocus('heart')} />

              {/* Lower abdomen / Renal node */}
              <circle cx="50" cy="78" r="5" fill={twinFocus === 'kidney' ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)'} stroke="var(--accent-emerald)" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setTwinFocus('kidney')} />

              {/* Core biological node */}
              <circle cx="50" cy="67" r="5" fill={twinFocus === 'metabolic' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'} stroke="var(--accent-cyan)" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setTwinFocus('metabolic')} />

            </svg>
          </div>

          <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center', padding: '10px 0', borderTop: '1px solid var(--glass-border)' }}>
            {['brain', 'heart', 'metabolic', 'kidney'].map(s => (
              <button 
                key={s} 
                type="button" 
                className="btn" 
                style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '8px', background: twinFocus === s ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', color: twinFocus === s ? '#fff' : 'var(--text-secondary)' }}
                onClick={() => setTwinFocus(s)}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

        </div>

        {/* System Details & Forecast Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Active Node Details */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-purple)', fontWeight: 600 }}>Active System Node</span>
              <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '10px', background: systemState.color + '20', color: systemState.color, border: `1px solid ${systemState.color}30` }}>
                {systemState.label}
              </span>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>{activeNode.title}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System Efficiency</span>
              <strong style={{ fontSize: '0.88rem', color: systemState.color }}>{activeNode.health}%</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Primary Biomarkers</span>
              <strong style={{ fontSize: '0.88rem', color: '#fff' }}>{activeNode.biomarkers}</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Simulated Physiological Description:</span>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', marginTop: '6px', lineHeight: '1.5' }}>{activeNode.details}</p>
            </div>
          </div>

          {/* AI Health Summary & Forecasts */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>🔮 Twin Forecast Predictions</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                <h5 style={{ fontSize: '0.88rem', color: '#fff', marginBottom: '4px' }}>Long-Term Health Forecast</h5>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  At current metabolic indices, your cardiovascular and liver systems are expected to maintain stable homeostatic balance over a 5-year forecast horizon. Lowering Cholesterol will boost longevity index.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                <h5 style={{ fontSize: '0.88rem', color: '#fff', marginBottom: '4px' }}>AI-Generated Biological Summary</h5>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {activeReport ? activeReport.healthSummary : "Onboarding profile logged. Complete a clinical blood biomarker scan to generate full multi-agent physiological forecast paths."}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
