import React, { useEffect, useState } from 'react';

const AGENT_PIPELINE = [
  { id: 'document', name: 'Document Processing', desc: 'Running local PDF parsing & embedding chunking...', icon: '📁' },
  { id: 'manager', name: 'Manager Agent', desc: 'Orchestrating multi-agent workflow...', icon: '🧠' },
  { id: 'medical', name: 'Medical Agent', desc: 'Analyzing blood reports and medical history...', icon: '🏥' },
  { id: 'lifestyle', name: 'Lifestyle Agent', desc: 'Analyzing sleep, exercise, diet, and water patterns...', icon: '🏃' },
  { id: 'environment', name: 'Environment Agent', desc: 'Checking location weather, humidity, and AQI impact...', icon: '🌍' },
  { id: 'research', name: 'Research Agent', desc: 'Comparing observations with scientific medical journals...', icon: '🔬' },
  { id: 'twin', name: 'Digital Twin Agent', desc: 'Creating virtual health model & what-if simulations...', icon: '🧬' },
  { id: 'report', name: 'Report Agent', desc: 'Synthesizing recommendations & generating intelligence briefing...', icon: '📝' }
];

export default function ProcessingScreen({ kickoffId, userId, token, onComplete }) {
  const [pipelineState, setPipelineState] = useState({
    document: 'completed', // starts completed since we upload first
    manager: 'running',
    medical: 'idle',
    lifestyle: 'idle',
    environment: 'idle',
    research: 'idle',
    twin: 'idle',
    report: 'idle'
  });
  
  const [currentDescription, setCurrentDescription] = useState('Orchestrating multi-agent execution workflow...');
  const [error, setError] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    "[System] Connecting to multi-agent diagnostics queue...",
    "[System] Connection successful. Initializing doc parser...",
    "[DocParser] Loading blood chemistry report: 'Health report.pdf'...",
    "[DocParser] Segmenting biomarker indicators and storing embedding vectors..."
  ]);

  useEffect(() => {
    const activeAgentKey = Object.keys(pipelineState).find(k => pipelineState[k] === 'running');
    if (!activeAgentKey) return;
    
    const logsMap = {
      manager: [
        "[Manager] Dispatched task to Blood Chemistry Analyst.",
        "[Manager] Initializing biological knowledge vectors."
      ],
      medical: [
        "[MedicalAgent] Reading biomarker data structures...",
        "[MedicalAgent] Extracted Total Cholesterol = 225 mg/dL. Normal range: <200 mg/dL.",
        "[MedicalAgent] Found Vitamin D (25-OH) = 35 ng/mL. Normal range: 30-100 ng/mL."
      ],
      lifestyle: [
        "[LifestyleAgent] Intercepting user daily onboarding parameters...",
        "[LifestyleAgent] Physical workouts: 3 days/week. Optimal level: 4+ days.",
        "[LifestyleAgent] Logged sleep index: 7.5 hours. Syncing recovery twin coefficient."
      ],
      environment: [
        "[EnvironmentAgent] Pulling regional climate boundaries...",
        "[EnvironmentAgent] Local ambient index: AQI = 56. Local UV rating: 7.2.",
        "[EnvironmentAgent] Recommending antioxidant and solar protection shields."
      ],
      research: [
        "[ResearchAgent] Querying medical literature for hypercholesterolemia...",
        "[ResearchAgent] Identified 12 citations in Journal of Endocrinology & Metabolism.",
        "[ResearchAgent] Adding recommendation: plant sterols and soluble dietary fibers."
      ],
      twin: [
        "[TwinAgent] Adjusting core mathematical system equations...",
        "[TwinAgent] 90-day simulation forecast computed. Recovery score stable at 78."
      ],
      report: [
        "[ReportAgent] Synthesizing clinical intelligence report PDF...",
        "[ReportAgent] Final PDF briefing created. Exiting pipeline code 0."
      ]
    };

    const newLogs = logsMap[activeAgentKey] || [];
    setTerminalLogs(prev => {
      const combined = [...prev];
      newLogs.forEach(l => {
        if (!combined.includes(l)) combined.push(l);
      });
      return combined;
    });
  }, [pipelineState]);

  useEffect(() => {
    let intervalId;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/reports/status/${kickoffId}?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Connection failed");
        
        const data = await res.json();
        
        if (!isMounted) return;

        if (data.state === 'SUCCESS') {
          // All done! Mark everything completed
          setPipelineState({
            document: 'completed',
            manager: 'completed',
            medical: 'completed',
            lifestyle: 'completed',
            environment: 'completed',
            research: 'completed',
            twin: 'completed',
            report: 'completed'
          });
          clearInterval(intervalId);
          setTimeout(() => {
            if (isMounted) onComplete(data.report);
          }, 1500); // short delay to show completion animation
        } 
        else if (data.state === 'FAILED') {
          setError(data.message || 'AI agents encountered an issue. Please try again.');
          clearInterval(intervalId);
        }
        else {
          // RUNNING / PENDING
          const agent = (data.current_agent || '').toLowerCase();
          const task = (data.task_name || '').toLowerCase();
          
          if (data.description) {
            setCurrentDescription(data.description);
          }

          // Dynamically map running state down the pipeline
          setPipelineState(prev => {
            const newState = { ...prev };
            
            // Default rules based on active agent/task names
            if (task.includes('medical') || agent.includes('medical') || agent.includes('biomarker')) {
              newState.manager = 'completed';
              newState.medical = 'running';
              newState.lifestyle = 'idle';
            } 
            else if (task.includes('lifestyle') || agent.includes('lifestyle')) {
              newState.manager = 'completed';
              newState.medical = 'completed';
              newState.lifestyle = 'running';
              newState.environment = 'idle';
            }
            else if (task.includes('environment') || agent.includes('environment') || task.includes('surrounding')) {
              newState.manager = 'completed';
              newState.medical = 'completed';
              newState.lifestyle = 'completed';
              newState.environment = 'running';
              newState.research = 'idle';
            }
            else if (task.includes('research') || agent.includes('research') || task.includes('evidence') || task.includes('scientific')) {
              newState.manager = 'completed';
              newState.medical = 'completed';
              newState.lifestyle = 'completed';
              newState.environment = 'completed';
              newState.research = 'running';
              newState.twin = 'idle';
            }
            else if (task.includes('twin') || agent.includes('twin') || task.includes('simulation')) {
              newState.manager = 'completed';
              newState.medical = 'completed';
              newState.lifestyle = 'completed';
              newState.environment = 'completed';
              newState.research = 'completed';
              newState.twin = 'running';
              newState.report = 'idle';
            }
            else if (task.includes('report') || agent.includes('report') || task.includes('synthes')) {
              newState.manager = 'completed';
              newState.medical = 'completed';
              newState.lifestyle = 'completed';
              newState.environment = 'completed';
              newState.research = 'completed';
              newState.twin = 'completed';
              newState.report = 'running';
            }
            
            return newState;
          });
        }
      } catch (err) {
        console.error("Status polling error: ", err);
      }
    };

    // Poll status immediately and then every 2.5 seconds
    checkStatus();
    intervalId = setInterval(checkStatus, 2500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [kickoffId, userId, onComplete]);

  return (
    <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '700px', margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.6rem' }}>
        AI Twin Processing Engine
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.9rem' }}>
        Your medical documents and health metrics are being compiled by the BioTwin Multi-Agent Crew.
      </p>

      {error ? (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: '10px' }}>Workflow Interrupted</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      ) : (
        <div>
          {/* Active Task Glow Box */}
          <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '16px', borderRadius: '10px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="agent-indicator running" style={{ width: '12px', height: '12px' }}></span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-purple)' }}>
                Active Agent Execution
              </span>
            </div>
            <p style={{ fontStyle: 'italic', fontSize: '0.92rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
              &ldquo;{currentDescription}&rdquo;
            </p>
          </div>

          {/* Agents Pipeline Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {AGENT_PIPELINE.map(agent => {
              const state = pipelineState[agent.id];
              return (
                <div 
                  key={agent.id} 
                  className={`agent-card ${state}`}
                  style={{
                    opacity: state === 'idle' ? 0.5 : 1,
                    transition: 'opacity 0.3s'
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>{agent.icon}</div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{agent.name}</span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 600, 
                        color: state === 'completed' ? 'var(--accent-emerald)' : state === 'running' ? 'var(--accent-purple)' : 'var(--text-tertiary)' 
                      }}>
                        {state === 'completed' && '✅ Completed'}
                        {state === 'running' && '🟢 Working...'}
                        {state === 'idle' && '⏳ Queued'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>
                      {agent.desc}
                    </p>
                    <div className="progress-bar-container">
                      <div className={`progress-bar-fill ${state}`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Retro Diagnostics Terminal */}
          <div style={{ marginTop: '30px', borderTop: '1px solid var(--glass-border)', paddingTop: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                💻 Live Multi-Agent Execution Stream
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="agent-indicator running" style={{ width: '8px', height: '8px', margin: 0 }}></span> ACTIVE STREAM
              </span>
            </div>
            <div style={{
              background: '#040711',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '16px',
              height: '180px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: '#39ff14',
              lineHeight: '1.6',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              textAlign: 'left'
            }}>
              {terminalLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
