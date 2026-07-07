import React from 'react';

const AGENT_INFO = [
  { id: 'document', name: 'Document Processor', role: 'Data Ingestion', desc: 'Extracts raw text from uploaded blood reports, health checkups, or lab results, chunking the data for vector lookup.', icon: '📁' },
  { id: 'manager', name: 'Manager Agent', role: 'Crew Orchestration', desc: 'The central supervisor. Routes work between specialized agents, tracking diagnostics logs and ensuring quality briefings.', icon: '🧠' },
  { id: 'medical', name: 'Medical Analyst', role: 'Biomarker Analysis', desc: 'Inspects specific biomarker readings (e.g. Total Cholesterol, Vitamin D levels) to determine boundary compliance and flag issues.', icon: '🏥' },
  { id: 'lifestyle', name: 'Lifestyle Analyst', role: 'Habit Optimization', desc: 'Evaluates exercise frequency, sleep patterns, hydration levels, and diet against standard physiological restoration parameters.', icon: '🏃' },
  { id: 'environment', name: 'Environment Checker', role: 'Geo-Tracking', desc: 'Queries local temperature, air quality index (AQI), weather patterns, and regional UV levels to calculate physical environment impacts.', icon: '🌍' },
  { id: 'research', name: 'Medical Researcher', role: 'Evidence Validation', desc: 'Validates agent observations against standard scientific publications, ensuring recommendations are backed by clinical trials.', icon: '🔬' },
  { id: 'twin', name: 'Digital Twin Model', role: 'Metabolic Simulation', desc: 'Constructs the mathematical biological model of your twin, enabling what-if simulations for lifestyle and nutrition changes.', icon: '🧬' },
  { id: 'report', name: 'Report Synthesizer', role: 'Briefing Generation', desc: 'Compiles and structures findings from all agents into a unified, readable executive summary with clear health guidelines.', icon: '📝' }
];

export default function AboutSection() {
  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '900px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
          BioTwin AI Core Technology
        </span>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '4px' }}>
          About the Biocomputing Platform
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', marginTop: '10px', lineHeight: '1.6' }}>
          BioTwin AI is an advanced medical intelligence portal that bridges clinical biochemistry and agentic artificial intelligence. 
          By creating a secure, private digital twin of your physiology, it allows you to simulate the cellular impact of daily habit changes before you execute them.
        </p>
      </div>

      {/* Grid: 3 Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        
        <div className="pillar-card pillar-card-cyan">
          <span className="pillar-icon">🔍</span>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-primary)' }}>RAG Vector Database</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            We extract chemical indicators from PDF reports and index them into a local vector database. 
            This enables specialized agents to run high-precision semantic search queries during analysis.
          </p>
        </div>

        <div className="pillar-card pillar-card-emerald">
          <span className="pillar-icon">👥</span>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Agentic Collaboration</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Powered by CrewAI, 8 automated clinical agents coordinate sequentially to analyze data layers (biomarkers, location, environmental statistics) to form a unified health briefing.
          </p>
        </div>

        <div className="pillar-card pillar-card-purple">
          <span className="pillar-icon">🔮</span>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Predictive Simulator</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Ask your biological twin "what-if" metabolic questions (e.g. changes in sleep, exercise, diet) to project biomarker recovery rates and cellular stress levels over 90 days.
          </p>
        </div>

      </div>

      {/* Multi-Agent Crew List */}
      <div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-purple)', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
          🤖 The BioTwin Agentic Crew
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {AGENT_INFO.map(agent => (
            <div key={agent.id} className="agent-card-interactive">
              <span className="agent-icon">{agent.icon}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{agent.name}</h4>
                  <span style={{ fontSize: '0.72rem', background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>
                    {agent.role}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  {agent.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Multi-User Architecture */}
      <div className="security-card">
        <span className="security-icon">🔒</span>
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--accent-cyan)', marginBottom: '4px' }}>Isolated & Secure Health Sandbox</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            We implement strict multi-user cryptographic isolation. Your uploaded documents, parsed text chunks, and health models are only queried when authorized by your active Supabase secure JWT session token. No health metrics are shared, pooled, or used for public foundation model training.
          </p>
        </div>
      </div>

    </div>
  );
}

