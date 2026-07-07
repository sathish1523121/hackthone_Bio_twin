import React, { useState, useEffect } from 'react';

export default function DailyTracker({ userId }) {
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const [todayLog, setTodayLog] = useState({
    sleepHours: 7,
    sleepQuality: 'Good',
    waterIntake: 1.5,
    meals: '',
    calories: 2000,
    fruitsServings: 2,
    vegetablesServings: 3,
    proteinGrams: 80,
    steps: 8000,
    exerciseMinutes: 30,
    heartRate: 70,
    bloodPressure: '120/80',
    bloodSugar: 90,
    mood: 'Good',
    stressLevel: 'Moderate',
    energyLevel: 'High',
    weight: 70,
    medication: '',
    symptoms: '',
    notes: ''
  });

  const storageKey = `biotwin_tracker_logs_${userId}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setLogs(parsed);
      calculateStreak(parsed);
      
      // Load today's log if it already exists
      const todayStr = new Date().toDateString();
      const existing = parsed.find(l => new Date(l.date).toDateString() === todayStr);
      if (existing) {
        setTodayLog(existing);
      }
    } else {
      setStreak(0);
    }
  }, [userId]);

  const calculateStreak = (parsedLogs) => {
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort logs descending by date
    const sorted = [...parsedLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sorted.length === 0) {
      setStreak(0);
      return;
    }

    let lastDate = new Date(sorted[0].date);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      setStreak(0);
      return;
    }

    currentStreak = 1;
    let prevDate = lastDate;

    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].date);
      currentDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.ceil((prevDate - currentDate) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        currentStreak++;
        prevDate = currentDate;
      } else if (dayDiff > 1) {
        break; // Streak broken
      }
    }
    setStreak(currentStreak);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setTodayLog(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updatedLog = {
      ...todayLog,
      date: new Date().toISOString()
    };

    let updatedLogs = [...logs];
    const todayStr = new Date().toDateString();
    const existingIndex = logs.findIndex(l => new Date(l.date).toDateString() === todayStr);

    if (existingIndex >= 0) {
      updatedLogs[existingIndex] = updatedLog;
    } else {
      updatedLogs = [updatedLog, ...updatedLogs];
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
    calculateStreak(updatedLogs);
    alert("Daily metrics successfully saved and integrated with Biological Twin!");
  };

  // Mock aggregates
  const totalWater = logs.reduce((sum, l) => sum + (l.waterIntake || 0), 0);
  const avgSteps = logs.length ? Math.round(logs.reduce((sum, l) => sum + (l.steps || 0), 0) / logs.length) : 0;
  const avgSleep = logs.length ? (logs.reduce((sum, l) => sum + (l.sleepHours || 0), 0) / logs.length).toFixed(1) : 0;

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title Panel */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Health Tracker</span>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>Command Center Logs</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Log metrics to sync real-time biological telemetry.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-purple-glow)', border: '1px solid rgba(139,92,246,0.3)', padding: '10px 16px', borderRadius: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>🔥</span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{streak} Days</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Current Streak</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        
        {/* Logger Form */}
        <form onSubmit={handleSave} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📝 Today's Health Log
          </h4>

          {/* Form Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Sleep Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h5 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>🛌 Sleep & Recovery</h5>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Sleep Duration (Hours)</label>
                <input type="number" step="0.5" name="sleepHours" value={todayLog.sleepHours} onChange={handleInputChange} className="form-control" min="0" max="24" required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Sleep Quality</label>
                <select name="sleepQuality" value={todayLog.sleepQuality} onChange={handleInputChange} className="form-control">
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </div>
            </div>

            {/* Hydration & Nutrition */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h5 style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)' }}>🥗 Hydration & Nutrition</h5>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Water Intake (Liters)</label>
                <input type="number" step="0.1" name="waterIntake" value={todayLog.waterIntake} onChange={handleInputChange} className="form-control" min="0" max="10" required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Calories (kcal)</label>
                <input type="number" name="calories" value={todayLog.calories} onChange={handleInputChange} className="form-control" min="0" required />
              </div>
            </div>

            {/* Nutrition Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h5 style={{ fontSize: '0.9rem', color: 'var(--accent-purple)' }}>🍎 Nutritional Breakdown</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Fruits (Servings)</label>
                  <input type="number" name="fruitsServings" value={todayLog.fruitsServings} onChange={handleInputChange} className="form-control" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Veg (Servings)</label>
                  <input type="number" name="vegetablesServings" value={todayLog.vegetablesServings} onChange={handleInputChange} className="form-control" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Protein (Grams)</label>
                <input type="number" name="proteinGrams" value={todayLog.proteinGrams} onChange={handleInputChange} className="form-control" min="0" />
              </div>
            </div>

            {/* Vital Signs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h5 style={{ fontSize: '0.9rem', color: 'var(--accent-rose)' }}>❤️ Vital Biomarkers</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Heart Rate (BPM)</label>
                  <input type="number" name="heartRate" value={todayLog.heartRate} onChange={handleInputChange} className="form-control" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Sugar (mg/dL)</label>
                  <input type="number" name="bloodSugar" value={todayLog.bloodSugar} onChange={handleInputChange} className="form-control" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Blood Pressure (Sys/Dia)</label>
                <input type="text" name="bloodPressure" value={todayLog.bloodPressure} onChange={handleInputChange} className="form-control" placeholder="120/80" />
              </div>
            </div>

            {/* Activity & Energy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h5 style={{ fontSize: '0.9rem', color: 'var(--accent-amber)' }}>🏃 Physical & Mental</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Steps Walked</label>
                  <input type="number" name="steps" value={todayLog.steps} onChange={handleInputChange} className="form-control" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Exercise (Min)</label>
                  <input type="number" name="exerciseMinutes" value={todayLog.exerciseMinutes} onChange={handleInputChange} className="form-control" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Energy Level</label>
                <select name="energyLevel" value={todayLog.energyLevel} onChange={handleInputChange} className="form-control">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            {/* Notes & Others */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h5 style={{ fontSize: '0.9rem', color: '#fff' }}>🗒️ Notes & Meds</h5>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Active Medications</label>
                <input type="text" name="medication" value={todayLog.medication} onChange={handleInputChange} className="form-control" placeholder="Aspirin 81mg, etc." />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Symptoms logged</label>
                <input type="text" name="symptoms" value={todayLog.symptoms} onChange={handleInputChange} className="form-control" placeholder="Headache, Fatigue, etc." />
              </div>
            </div>

          </div>

          <div className="form-group">
            <label className="form-label">Meals consumed today</label>
            <input type="text" name="meals" value={todayLog.meals} onChange={handleInputChange} className="form-control" placeholder="Breakfast: Oats, Lunch: Salad, Dinner: Salmon..." />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea name="notes" value={todayLog.notes} onChange={handleInputChange} className="form-control" style={{ minHeight: '60px', padding: '10px' }} placeholder="Any extra information on sleep interruption, stress factors..." />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '10px 24px', fontSize: '0.9rem' }}>
            💾 Save Daily Log Telemetry
          </button>
        </form>

        {/* Analytics Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>📈 Tracker Metrics Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Logs Recorded</span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{logs.length} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg. Sleep Duration</span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{avgSleep} Hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg. Daily Steps</span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{avgSteps.toLocaleString()} steps</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Water Intake</span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{totalWater.toFixed(1)} L</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>🗓️ Recent Logs History</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
              {logs.map((log, index) => (
                <div key={index} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--glass-border)', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '6px' }}>
                    <span>{new Date(log.date).toLocaleDateString()}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Mood: {log.mood}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    <div>Sleep: <strong>{log.sleepHours}h</strong> ({log.sleepQuality})</div>
                    <div>Water: <strong>{log.waterIntake}L</strong></div>
                    <div>Steps: <strong>{log.steps}</strong></div>
                    <div>Exercise: <strong>{log.exerciseMinutes} min</strong></div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>No daily history logs found. Start logging today!</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
