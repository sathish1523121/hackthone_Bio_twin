import React, { useState, useEffect } from 'react';
import OnboardingWizard from './components/OnboardingWizard';
import MedicalUpload from './components/MedicalUpload';
import ProcessingScreen from './components/ProcessingScreen';
import ReportDashboard from './components/ReportDashboard';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ProfileSection from './components/ProfileSection';
import AboutSection from './components/AboutSection';
import EnvironmentalIntelligence from './components/EnvironmentalIntelligence';
import { supabase } from './supabaseClient';
const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'upload', label: 'Upload', icon: '📤' },
  { id: 'reports', label: 'Reports', icon: '📋' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🏃' },
  { id: 'environment', label: 'Environment', icon: '🌍' },
  { id: 'twin', label: 'Digital Twin', icon: '🧬' },
  { id: 'simulations', label: 'Simulations', icon: '🔮' },
  { id: 'intelligence', label: 'Intelligence Report', icon: '📄' },
  { id: 'comparison', label: 'Comparison', icon: '🔀' },
  { id: 'trends', label: 'Trends', icon: '📈' },
  { id: 'reminders', label: 'Reminders', icon: '🔔' },
  { id: 'settings', label: 'Settings', icon: '⚙' }
];
const BIOMARKER_GLOSSARY = [
  { name: 'Total Cholesterol', range: '< 200 mg/dL', importance: 'High', desc: 'Indicates fatty lipid count in blood. High counts increase arterial plaque risk.', advice: 'Increase soluble fiber (oats, beans), supplement Omega-3, reduce saturated fats.' },
  { name: 'Vitamin D (25-hydroxy)', range: '30 - 100 ng/mL', importance: 'Critical', desc: 'Sustains immune responses, bone density regulation, and hormone synthesis.', advice: 'Get 15-20 min sunlight, consume egg yolks, fatty fish, or take Vitamin D3 supplements.' },
  { name: 'Fasting Glucose', range: '70 - 99 mg/dL', importance: 'High', desc: 'Measures sugar concentration in blood after fasting. Flags pre-diabetes levels.', advice: 'Limit refined carbs/sugars, exercise after meals, optimize sugar cycles.' },
  { name: 'HbA1c', range: '< 5.7%', importance: 'Critical', desc: 'Reflects average blood sugar levels over the past 3 months.', advice: 'Perform regular resistance training, balance carb intake with proteins and healthy fats.' },
  { name: 'LDL Cholesterol', range: '< 100 mg/dL', importance: 'High', desc: 'Known as "bad" cholesterol. Carries cholesterol particles throughout your body.', advice: 'Consume heart-healthy fats (olive oil, avocados, nuts), avoid trans fats.' }
];

export default function App() {
  // App journey state: 'auth' | 'wizard' | 'upload' | 'processing' | 'dashboard' | 'verify-email' | 'forgot-password' | 'reset-password'
  const [step, setStep] = useState('auth');
  
  // Auth Form tabs: 'login' | 'signup'
  const [authTab, setAuthTab] = useState('login');
  
  // Auth Form Fields
  const [signupData, setSignupData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Logged-in user state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  
  // Loading & error flags
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);

  // Health Profile & report state
  const [profile, setProfile] = useState(null);
  const [uploadedReport, setUploadedReport] = useState(null);
  const [kickoffId, setKickoffId] = useState('');
  const [activeReport, setActiveReport] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [compReportAId, setCompReportAId] = useState('baseline');
  const [compReportBId, setCompReportBId] = useState('');

  // Landing Page Showroom states
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [activeNode, setActiveNode] = useState('core');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [waterLogged, setWaterLogged] = useState(1.2);
  const [remindersState, setRemindersState] = useState([
    { id: 'hydrate', title: 'Hydration Prompt (2.5L goal)', schedule: 'Alarms set every 2 hours during day', enabled: true, category: 'hydration' },
    { id: 'workout', title: 'Workout Reminder (3x weekly)', schedule: 'Alerts set Mon, Wed, Fri at 6:30 PM', enabled: false, category: 'exercise' },
    { id: 'sleep', title: 'Sleep Wind-down (10:30 PM)', schedule: 'Triggers screen dimmer instructions', enabled: true, category: 'sleep' }
  ]);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderSchedule, setNewReminderSchedule] = useState('');
  const [newReminderCategory, setNewReminderCategory] = useState('general');
  const [simulationSliders, setSimulationSliders] = useState({ sleepHours: 7.5, exerciseDays: 3, waterLiters: 2.2, dietType: 'Balanced' });
  const [envData, setEnvData] = useState(null);
  const [envHistory, setEnvHistory] = useState([]);
  const [envLoading, setEnvLoading] = useState(false);
  const [simulationPrediction, setSimulationPrediction] = useState('');
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [twinFocus, setTwinFocus] = useState('metabolic');
  const [biomarkerQuery, setBiomarkerQuery] = useState('');

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const nodeDetails = {
    core: {
      title: "Core Metabolic Twin",
      status: "Active Integration",
      metrics: "DNA & Multi-Biomarker Engine",
      desc: "The central bio-computing engine. Combines all biomarkers, lifestyle indicators, and environment variables into a single predictive model of your overall health.",
      biomarkers: "All System Biomarkers",
      agents: "Manager Agent & Report Synthesizer"
    },
    brain: {
      title: "Cognitive Alignment Node",
      status: "Circadian Sync Active",
      metrics: "Sleep Index: 68/100 | Stress: Moderate",
      desc: "Monitors sleep cycles, REM/Deep latency, and cognitive fatigue markers. Models sleep and recovery dynamics to buffer daily cortisol spikes.",
      biomarkers: "Cortisol, Melatonin, REM Latency",
      agents: "Lifestyle Analyst & Manager Agent"
    },
    heart: {
      title: "Cardiovascular Node",
      status: "Steady Base State",
      metrics: "Resting HR: 62 BPM | VO2: 44 ml/kg/min",
      desc: "Tracks heart rate variability, arterial elasticity markers, and cardiovascular performance trends under physical exercise thresholds.",
      biomarkers: "Heart Rate Variability (HRV), Resting HR, VO2 Max",
      agents: "Medical Analyst"
    },
    blood: {
      title: "Biomarker Chemical Node",
      status: "Review Required",
      metrics: "Vitamin D: 24 ng/mL (Low) | Cholesterol: 218 mg/dL (High)",
      desc: "Extracts lipid profiles, mineral balances, and kidney/liver markers via automated PDF RAG indexing to identify metabolic imbalances.",
      biomarkers: "Total Cholesterol, Vitamin D (25-OH), HbA1c, TSH",
      agents: "Document Processor & Medical Analyst"
    },
    lifestyle: {
      title: "Lifestyle Input Engine",
      status: "Active Logs",
      metrics: "Exercise: 3x/week | Nutrition Compliance: 82%",
      desc: "Integrates sleep hours, nutritional compliance, hydration indices, and caloric expenditure to compute daily metabolic burn rates.",
      biomarkers: "Daily Calories, Active METs, Water Volume",
      agents: "Lifestyle Analyst"
    },
    environment: {
      title: "Environmental Exposure Node",
      status: "Sensors Online",
      metrics: "Pollen: Low | US AQI: 25 | UV Index: 4.5",
      desc: "Measures external physical exposures (ambient temperatures, localized air quality index, solar UV radiation levels) that load cell repair processes.",
      biomarkers: "PM2.5, PM10, UV Exposure Index, Humidity",
      agents: "Environment Checker"
    }
  };

  const handleExploreDemo = () => {
    setUser({ id: 'demo-user', name: 'Alex Carter (Demo User)', email: 'alex.carter@demo.com' });
    setToken('demo-token');
    setProfile({
      userId: "demo-user",
      name: "Alex Carter",
      age: "32",
      gender: "Non-binary",
      height: "178 cm",
      weight: "74 kg",
      location: "San Francisco, CA",
      healthGoals: ["Reduce cholesterol", "Increase Vitamin D", "Improve sleep quality"],
      sleepHours: "6.5",
      sleepQuality: "Fair",
      exerciseLevel: "Moderate",
      workoutFrequency: "3 times/week",
      diet: "Mainly vegetarian",
      waterIntake: "1.5L",
      stressLevel: "Moderate",
      existingConditions: "None",
      allergies: "Seasonal pollen",
      currentMedications: "None"
    });
    
    const demoReports = [
      {
        kickoffId: "demo-report-1",
        createdAt: new Date().toISOString(),
        healthScore: 84,
        healthSummary: "Overall good metabolic health, but shows a pattern of moderate stress and suboptimal sleep affecting recovery. Vitamin D levels are mildly suboptimal, and Total Cholesterol is borderline high, likely influenced by diet and moderate exercise frequency. Correcting hydration and adding target nutrients will yield rapid improvements.",
        medicalAnalysis: "• Total Cholesterol: 218 mg/dL (Borderline High - target is < 200 mg/dL)\n• Vitamin D: 24 ng/mL (Suboptimal - target is > 30 ng/mL)\n• HbA1c: 5.3% (Optimal - healthy glucose regulation)\n• Thyroid TSH: 1.8 uIU/mL (Optimal)\n\nRecommendation: Increase intake of fatty fish/mushrooms or consider 2000 IU Vitamin D3 daily. Replace saturated fats with monounsaturated oils (e.g. olive oil).",
        lifestyleScore: {
          sleep: 68,
          exercise: 75,
          diet: 82
        },
        recommendations: [
          "Incorporate daily morning sunlight exposure or supplement 2000 IU Vitamin D3",
          "Replace dietary saturated fats with monounsaturated oils (olive, avocado)",
          "Optimize sleep schedule to hit 7.5+ hours to reduce stress/cortisol spikes",
          "Increase hydration levels to 2.5L daily to support kidney filtration"
        ],
        environmentImpact: "Air Quality Index (AQI): 42 (Good) in San Francisco, CA. Minimal pollen load today. However, local UV levels suggest limited indoor synthesis of Vitamin D, correlating with the suboptimal 24 ng/mL levels found in the report."
      },
      {
        kickoffId: "demo-report-0",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        healthScore: 76,
        healthSummary: "Initial baseline report showing higher cholesterol levels (234 mg/dL) and low Vitamin D (18 ng/mL) due to low sunlight exposure during winter months.",
        medicalAnalysis: "• Total Cholesterol: 234 mg/dL (High - target is < 200 mg/dL)\n• Vitamin D: 18 ng/mL (Deficient - target is > 30 ng/mL)\n• HbA1c: 5.4% (Normal)\n• Thyroid TSH: 1.9 uIU/mL (Normal)",
        lifestyleScore: {
          sleep: 60,
          exercise: 65,
          diet: 78
        },
        recommendations: [
          "Start Vitamin D supplementation immediately",
          "Perform cardiovascular exercise at least 3 times a week",
          "Audit sleep hygiene for late-night light exposures"
        ],
        environmentImpact: "High seasonal pollen in the region may exacerbate inflammation indicators. Local UV index is low."
      }
    ];
     setReportHistory(demoReports);
     setActiveReport(demoReports[0]);
     setCompReportBId(demoReports[0].kickoffId);
     setCompReportAId(demoReports[1]?.kickoffId || 'baseline');
     setStep('dashboard');
  };

  // Decode custom HS256 JWT in frontend
  const decodeToken = (t) => {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // On page mount, check for persistent session
  useEffect(() => {
    // Check for reset-password token in URL query parameters first
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get('token');
    const resetEmail = params.get('email');
    if (resetToken && resetEmail) {
      setStep('reset-password');
      setSessionChecking(false);
      return;
    }

    const checkInitialSession = async () => {
      const storedToken = localStorage.getItem('biotwin_jwt');
      if (storedToken) {
        const payload = decodeToken(storedToken);
        if (payload && payload.exp * 1000 > Date.now()) {
          const loggedInUser = {
            id: payload.sub,
            name: payload.name || 'User',
            email: payload.email
          };
          setUser(loggedInUser);
          setToken(storedToken);
          await loadUserSessionData(payload.sub, storedToken);
        } else {
          localStorage.removeItem('biotwin_jwt');
          setUser(null);
          setToken('');
          setStep('auth');
        }
      } else {
        setUser(null);
        setToken('');
        setStep('auth');
      }
      setSessionChecking(false);
    };

    checkInitialSession();
  }, []);

  // Fetch environmental status when Environment tab is loaded
  useEffect(() => {
    if (activeTab === 'environment' && user && token) {
      const fetchEnvData = async () => {
        setEnvLoading(true);
        try {
          const headers = { 'Authorization': `Bearer ${token}` };
          const res = await fetch(`http://localhost:8000/api/environment/${user.id}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setEnvData(data);
          }
          const resHist = await fetch(`http://localhost:8000/api/environment/history/${user.id}`, { headers });
          if (resHist.ok) {
            const histData = await resHist.json();
            setEnvHistory(histData);
          }
        } catch (err) {
          console.error("Error loading environment data:", err);
        } finally {
          setEnvLoading(false);
        }
      };
      fetchEnvData();
    }
  }, [activeTab, user, token]);

  // Fetch simulations history when Simulations tab is loaded
  useEffect(() => {
    if (activeTab === 'simulations' && user && token) {
      const fetchSimHistory = async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/reports/simulations/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setSimulationHistory(data);
          }
        } catch (err) {
          console.error("Error loading simulation history:", err);
        }
      };
      fetchSimHistory();
    }
  }, [activeTab, user, token]);

  const handleRunSimulation = async () => {
    if (!user || !token) return;
    setSimulationLoading(true);
    setSimulationPrediction('');
    
    const sleep = simulationSliders.sleepHours;
    const workouts = simulationSliders.exerciseDays;
    const diet = simulationSliders.dietType;
    
    const question = `What happens if I change my sleep to ${sleep} hours, workouts to ${workouts} days, and diet to ${diet}?`;
    
    try {
      const res = await fetch('http://localhost:8000/api/reports/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          reportId: activeReport?.kickoffId || 'latest',
          question: question
        })
      });
      
      if (!res.ok) throw new Error("Simulation pipeline error");
      const data = await res.json();
      setSimulationPrediction(data.prediction);
      
      // Update history list
      setSimulationHistory(prev => [
        {
          question: question,
          prediction: data.prediction,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
      addToast("Virtual Twin model simulation computed!", "success");
    } catch (err) {
      addToast("Failed to run virtual twin simulation", "error");
    } finally {
      setSimulationLoading(false);
    }
  };

  // Fetch user health details and routing history
  const loadUserSessionData = async (uid, accessToken) => {
    let profileFetched = false;
    try {
      const authHeaders = { 'Authorization': `Bearer ${accessToken}` };
      
      // 1. Fetch Profile
      const profileRes = await fetch(`http://localhost:8000/api/profile/${uid}`, { headers: authHeaders });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        profileFetched = true;
        
        // 2. Fetch Reports History
        try {
          const historyRes = await fetch(`http://localhost:8000/api/reports/history/${uid}`, { headers: authHeaders });
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            setReportHistory(historyData);
            
            if (historyData.length > 0) {
              // User has completed reports, show dashboard with latest
              setActiveReport(historyData[0]);
              setCompReportBId(historyData[0].kickoffId);
              setCompReportAId(historyData[1]?.kickoffId || 'baseline');
              setStep('dashboard');
            } else {
              // Profile exists but no reports yet, direct to upload
              setStep('upload');
            }
          } else {
            setStep('upload');
          }
        } catch (historyErr) {
          console.error("Error loading reports history from backend:", historyErr);
          setStep('upload'); // Fallback to upload step if history fetch fails
        }
      } else {
        // No profile found, user must complete wizard
        setStep('wizard');
      }
    } catch (err) {
      console.error("Error loading session health details:", err);
      if (profileFetched) {
        setStep('upload');
      } else {
        setStep('wizard'); 
      }
    }
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    if (signupData.password !== signupData.confirmPassword) {
      setAuthError("Passwords do not match.");
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          password: signupData.password,
          confirmPassword: signupData.confirmPassword
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Signup failed.');
      }

      setStep('verify-email');
    } catch (err) {
      setAuthError(err.message || 'Signup failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Login failed.');
      }

      const data = await res.json();
      const token = data.token;
      const user = data.user;

      localStorage.setItem('biotwin_jwt', token);
      setUser(user);
      setToken(token);
      await loadUserSessionData(user.id, token);
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('biotwin_jwt');
    
    // Clear all local state
    setUser(null);
    setToken('');
    setProfile(null);
    setUploadedReport(null);
    setKickoffId('');
    setActiveReport(null);
    setReportHistory([]);
    setSignupData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    setLoginData({ email: '', password: '' });
    setAuthError('');
    
    setAuthTab('login');
    setStep('auth');
    setShowAuthForm(false);
    setIsEditingProfile(false);
    setActiveTab('home');
    
    window.history.replaceState(null, null, '/');
  };

  const handleVerificationSuccess = async (jwtToken, userDetails) => {
    localStorage.setItem('biotwin_jwt', jwtToken);
    setUser(userDetails);
    setToken(jwtToken);
    await loadUserSessionData(userDetails.id, jwtToken);
  };

  const handleWizardComplete = (userProfile) => {
    setProfile(userProfile);
    setStep('upload');
  };

  const handleUploadSuccess = (reportData) => {
    setUploadedReport(reportData);
  };

  const handleStartGeneration = async (reportData) => {
    try {
      const res = await fetch('http://localhost:8000/api/reports/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          userProfile: profile,
          lifestyleData: {
            sleepHours: profile.sleepHours,
            exerciseLevel: profile.exerciseLevel,
            diet: profile.diet,
            waterIntake: profile.waterIntake,
            stressLevel: profile.stressLevel
          },
          medicalReports: [reportData]
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Workflow kickoff failed");
      }
      
      const data = await res.json();
      setKickoffId(data.kickoff_id);
      setActiveTab('agent');
      setStep('processing');
    } catch (err) {
      alert("Failed to initiate CrewAI agents: " + err.message);
    }
  };

  const handleProcessingComplete = (finalReport) => {
    setActiveReport(finalReport);
    setActiveTab('result');
    if (user) loadUserSessionData(user.id, token);
  };

  // 1. Dashboard View
  const renderDashboardView = () => {
    if (!activeReport) {
      return (
        <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '650px', margin: '40px auto', textAlign: 'center', padding: '50px 40px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>📊</div>
          <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '12px', fontWeight: 800 }}>Twin Analytics Pending</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '30px' }}>
            No digital twin report is available yet. Upload your blood metrics PDF in the <strong>Upload</strong> tab to run your virtual twin model.
          </p>
          <button type="button" className="btn btn-primary" style={{ padding: '10px 24px' }} onClick={() => setActiveTab('upload')}>
            Go to Upload Center
          </button>
        </div>
      );
    }

    const displayedScore = activeReport.healthScore || 78;
    const circumference = 2 * Math.PI * 50;
    const scoreOffset = circumference - (displayedScore / 100) * circumference;

    return (
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Top 4 Metrics Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          
          {/* Card 1: Health Score */}
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.15)', padding: '20px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Health Score</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#fff' }}>{displayedScore}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Overall health index</span>
            </div>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💙</div>
          </div>

          {/* Card 2: Lifestyle Score */}
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.15)', padding: '20px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Lifestyle Score</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#fff' }}>82</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Habits & physical fitness</span>
            </div>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💚</div>
          </div>

          {/* Card 3: Environment */}
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.15)', padding: '20px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Environment</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#fff' }}>56</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Air quality & weather</span>
            </div>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>☀️</div>
          </div>

          {/* Card 4: Risk Score */}
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.15)', padding: '20px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Risk Score</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#fff' }}>15%</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Metabolic health risks</span>
            </div>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🛡️</div>
          </div>

        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '30px' }}>
          
          {/* Left Chart: SVG Health Score Trend */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>📈 Health Score Trend</h3>
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
                <line x1="50" y1="50" x2="450" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="50" y1="100" x2="450" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="50" y1="150" x2="450" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                <text x="20" y="55" fill="var(--text-secondary)" fontSize="10">100</text>
                <text x="25" y="105" fill="var(--text-secondary)" fontSize="10">75</text>
                <text x="25" y="155" fill="var(--text-secondary)" fontSize="10">50</text>

                <polyline 
                  fill="none" 
                  stroke="var(--accent-cyan)" 
                  strokeWidth="3" 
                  points="70,160 180,142 300,128 420,86" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(6,182,212,0.5))' }}
                />

                <circle cx="70" cy="160" r="5" fill="var(--bg-primary)" stroke="var(--accent-cyan)" strokeWidth="2" />
                <circle cx="180" cy="142" r="5" fill="var(--bg-primary)" stroke="var(--accent-cyan)" strokeWidth="2" />
                <circle cx="300" cy="128" r="5" fill="var(--bg-primary)" stroke="var(--accent-cyan)" strokeWidth="2" />
                <circle cx="420" cy="86" r="5" fill="#fff" stroke="var(--accent-cyan)" strokeWidth="3" />

                <text x="50" y="185" fill="var(--text-secondary)" fontSize="10">Week 1</text>
                <text x="160" y="185" fill="var(--text-secondary)" fontSize="10">Week 2</text>
                <text x="280" y="185" fill="var(--text-secondary)" fontSize="10">Week 3</text>
                <text x="405" y="185" fill="var(--text-primary)" fontSize="10" fontWeight="bold">Now</text>
              </svg>
            </div>
          </div>

          {/* Right Chart: SVG Radar (Health Dimensions) */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>🕸️ Health Dimensions</h3>
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 300 240" style={{ width: '100%', height: '100%' }}>
                <polygon points="150,40 230,98 200,192 100,192 70,98" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <polygon points="150,70 210,113 187,184 112,184 90,113" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <polygon points="150,100 190,129 175,176 125,176 110,129" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                <line x1="150" y1="140" x2="150" y2="40" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <line x1="150" y1="140" x2="230" y2="98" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <line x1="150" y1="140" x2="200" y2="192" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <line x1="150" y1="140" x2="100" y2="192" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <line x1="150" y1="140" x2="70" y2="98" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

                <polygon 
                  points="150,55 210,110 185,170 120,165 92,112" 
                  fill="rgba(6,182,212,0.15)" 
                  stroke="var(--accent-cyan)" 
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0px 0px 3px rgba(6,182,212,0.3))' }}
                />

                <text x="135" y="32" fill="var(--text-primary)" fontSize="9" fontWeight="bold">Health</text>
                <text x="235" y="100" fill="var(--text-secondary)" fontSize="9">Lifestyle</text>
                <text x="205" y="205" fill="var(--text-secondary)" fontSize="9">Environment</text>
                <text x="65" y="205" fill="var(--text-secondary)" fontSize="9">Safety</text>
                <text x="35" y="100" fill="var(--text-secondary)" fontSize="9">Activity</text>
              </svg>
            </div>
          </div>

        </div>

        {/* Bottom grid (Recent reports & simulation presets) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* Recent Reports */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>📄 Recent Reports</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', cursor: 'pointer' }} onClick={() => setActiveTab('reports')}>
                View all ➔
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>📄</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Health report.pdf</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Biomarkers parsed</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  analyzed
                </span>
              </div>
            </div>
          </div>

          {/* Simulations Presets */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>🔮 Simulations Presets</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', cursor: 'pointer' }} onClick={() => setActiveTab('simulations')}>
                View all ➔
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div 
                onClick={() => {
                  setSimulationSliders(prev => ({ ...prev, sleepHours: 8.5 }));
                  setActiveTab('simulations');
                }}
                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>What if I sleep 8 hours daily?</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)' }}>➔</span>
              </div>
              <div 
                onClick={() => {
                  setSimulationSliders(prev => ({ ...prev, exerciseDays: 5 }));
                  setActiveTab('simulations');
                }}
                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>What if I increase workouts to 5 days?</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)' }}>➔</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  };

  // 2. Reports View
  const renderReportsView = () => {
    return (
      <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '10px' }}>Historical Reports</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
          Manage your uploaded physiological documentation. Setting a historical report as active recalculates all twin parameters.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reportHistory.length > 0 ? reportHistory.map((report, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>📄</span>
                <div>
                  <h4 style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600 }}>{report.fileName || `Health Report #${idx+1}`}</h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Score: {report.healthScore} | Created on: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: activeReport === report ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)' }}
                onClick={() => {
                  setActiveReport(report);
                  setActiveTab('dashboard');
                }}
              >
                {activeReport === report ? 'Active ✅' : 'Set Active'}
              </button>
            </div>
          )) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No reports recorded. Use the Upload tab to add reports.</p>
          )}
        </div>
      </div>
    );
  };

  // 3. Lifestyle View
  const renderLifestyleView = () => {
    return (
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>🏃 Habits & Lifestyle Tracking</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Daily lifestyle indicators synced with your digital twin.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Water Hydration */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>💧</div>
            <div>
              <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '6px' }}>Hydration Tracker</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Optimal daily intake is 2.5 Liters.</p>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{waterLogged.toFixed(1)} L</div>
            </div>
            
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}
              onClick={() => {
                setWaterLogged(prev => {
                  const val = Math.min(prev + 0.25, 4);
                  addToast(`Water logged: ${val.toFixed(2)}L / 2.5L`, 'success');
                  return val;
                });
              }}
            >
              + 250ml Cup
            </button>
          </div>

          {/* Sleep Quality */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>🛌 Restorative Sleep Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hours logged</span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{profile?.sleepHours || 7} hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quality Rating</span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{profile?.sleepQuality || 'Good'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Exercise Level</span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{profile?.exerciseLevel || 'Moderately Active'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 4. Environment View
  const renderEnvironmentView = () => {
    const temp = envData?.temperature !== undefined ? envData.temperature.toFixed(1) : '24.5';
    const humidity = envData?.humidity !== undefined ? envData.humidity : '65';
    const uv = envData?.uvIndex !== undefined ? envData.uvIndex : 7.2;
    const aqi = envData?.aqi !== undefined ? envData.aqi : 42;
    const location = envData?.location || profile?.location || 'New York, USA';

    // Map AQI status
    let aqiColor = 'var(--accent-emerald)';
    let aqiStatus = 'Good';
    if (aqi > 150) {
      aqiColor = 'var(--accent-rose)';
      aqiStatus = 'Unhealthy';
    } else if (aqi > 100) {
      aqiColor = 'var(--accent-amber)';
      aqiStatus = 'Unhealthy for Sensitive Groups';
    } else if (aqi > 50) {
      aqiColor = '#eab308';
      aqiStatus = 'Moderate';
    }

    // Map UV advice
    let uvColor = 'var(--accent-emerald)';
    let uvStatus = 'Low';
    let uvAdvice = 'No special precautions needed. Normal outdoor activities allowed.';
    if (uv >= 8) {
      uvColor = 'var(--accent-rose)';
      uvStatus = 'Very High / Extreme';
      uvAdvice = 'Minimize outdoor exposure. Applying SPF 50+ sunscreen and wearing protective clothing are critical.';
    } else if (uv >= 6) {
      uvColor = 'var(--accent-amber)';
      uvStatus = 'High';
      uvAdvice = 'Reduce time in the sun. Wear SPF 30+ sunscreen, a wide-brimmed hat, and UV-blocking sunglasses.';
    } else if (uv >= 3) {
      uvColor = '#eab308';
      uvStatus = 'Moderate';
      uvAdvice = 'Moderate exposure risk. Wear SPF 15+ sunscreen and seek shade during midday hours.';
    }

    return (
      <div className="glass-panel animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600, textTransform: 'uppercase' }}>Environmental Impact Index</span>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>🌍 Regional Surrounding Status</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monitoring live metrics for: <strong>{location}</strong></p>
          </div>
          {envLoading && (
            <div className="agent-indicator running" style={{ width: '20px', height: '20px', margin: 0 }}></div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '10px' }}>
          <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>💨</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Air Quality Index (AQI)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: aqiColor, marginTop: '4px' }}>{aqi}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{aqiStatus}</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🌡️</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Local Temperature</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{temp}°C</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Humidity: {humidity}%</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>☀️</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>UV Index Exposure</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: uvColor, marginTop: '4px' }}>{uv.toFixed(1)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{uvStatus}</div>
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', gap: '12px' }}>
          <span style={{ fontSize: '1.3rem' }}>💡</span>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            <strong>Geo-Impact Warning</strong>: {uvAdvice}
          </p>
        </div>

        {/* AQI Trend History Chart */}
        {envHistory && envHistory.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '15px' }}>📈 Environmental Timeline Log</h4>
            <div style={{ height: '180px' }}>
              {(() => {
                const points = envHistory.map((h, i) => {
                  const x = 50 + (i * (400 / Math.max(1, envHistory.length - 1)));
                  // Map AQI 0-150 to Y 150-50
                  const y = 150 - ((h.aqi || 40) / 150) * 100;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
                    <line x1="50" y1="50" x2="450" y2="50" stroke="rgba(255,255,255,0.03)" />
                    <line x1="50" y1="100" x2="450" y2="100" stroke="rgba(255,255,255,0.03)" />
                    <line x1="50" y1="150" x2="450" y2="150" stroke="rgba(255,255,255,0.03)" />
                    {envHistory.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="var(--accent-cyan)"
                        strokeWidth="3.5"
                        points={points}
                        style={{ filter: 'drop-shadow(0px 0px 4px rgba(6,182,212,0.5))' }}
                      />
                    )}
                    {envHistory.map((h, i) => {
                      const x = 50 + (i * (400 / Math.max(1, envHistory.length - 1)));
                      const y = 150 - ((h.aqi || 40) / 150) * 100;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="5" fill="#fff" stroke="var(--accent-cyan)" strokeWidth="2.5" />
                          <text x={x} y={y - 12} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">{h.aqi}</text>
                          <text x={x} y="175" fill="var(--text-secondary)" fontSize="8" textAnchor="middle">
                            {new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </text>
                        </g>
                      );
                    })}
                    <text x="50" y="25" fill="var(--accent-cyan)" fontSize="9" fontWeight="bold">▬ Air Quality Index (AQI) History</text>
                  </svg>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 5. Digital Twin View
  const renderDigitalTwinView = () => {
    const focusColor = twinFocus === 'cardiovascular' ? 'var(--accent-rose)' 
                     : twinFocus === 'cognitive' ? 'var(--accent-cyan)' 
                     : twinFocus === 'endocrine' ? 'var(--accent-amber)' 
                     : 'var(--accent-purple)';

    return (
      <div className="glass-panel animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>🧬 Biological Twin Network Map</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select a physiological node system to examine biological data structures.</p>
          </div>

          {/* Twin Focus Area Pill List */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Metabolic Focus Area:</span>
            {['metabolic', 'cardiovascular', 'cognitive', 'endocrine'].map(f => (
              <button
                key={f}
                type="button"
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: twinFocus === f ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: twinFocus === f ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setTwinFocus(f);
                  if (f === 'metabolic') setActiveNode('core');
                  else if (f === 'cardiovascular') setActiveNode('heart');
                  else if (f === 'cognitive') setActiveNode('brain');
                  else if (f === 'endocrine') setActiveNode('blood');
                  addToast(`Biological focus shifted to: ${f.toUpperCase()}`, 'success');
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', width: '100%', alignItems: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <svg width="340" height="340" viewBox="0 0 200 200">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={focusColor} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={focusColor} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Translucent Human Body Outline */}
              <g opacity="0.3">
                {/* Head */}
                <circle cx="100" cy="28" r="9" fill="rgba(139, 92, 246, 0.08)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1.2" />
                {/* Torso, Arms & Legs Silhouette */}
                <path d="
                  M 96,37 L 104,37
                  M 100,37 L 100,42
                  M 100,42 C 90,43 80,46 74,52
                  C 70,56 70,66 68,90
                  C 67,99 69,103 72,103
                  C 75,103 76,94 76,85
                  C 78,70 82,56 100,56
                  C 118,56 122,70 124,85
                  C 124,94 125,103 128,103
                  C 131,103 133,99 132,90
                  C 130,56 130,46 126,52
                  C 120,46 110,43 100,42
                  
                  M 85,56 C 85,80 87,98 85,112
                  C 84,117 81,120 81,124
                  L 81,180
                  C 81,183 83,185 85,185
                  C 87,185 87,183 87,180
                  L 89,127
                  L 100,127
                  L 111,127
                  L 113,180
                  C 113,183 113,185 115,185
                  C 117,185 119,183 119,180
                  L 119,124
                  C 119,120 116,117 115,112
                  C 113,98 115,80 115,56
                " fill="rgba(139, 92, 246, 0.08)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* Spine Nervous Pathway (Central Conduit) */}
              <line x1="100" y1="37" x2="100" y2="127" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="1.5" className="nerve-line" />
              
              {/* Nerves Branching to Left Arm */}
              <path d="M 100,48 Q 88,52 74,90" fill="none" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.2" className="nerve-line-reverse" />
              
              {/* Nerves Branching to Right Arm */}
              <path d="M 100,48 Q 112,52 126,90" fill="none" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.2" className="nerve-line" />
              
              {/* Nerves Branching to Left Leg */}
              <path d="M 100,127 Q 90,135 84,178" fill="none" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.2" className="nerve-line" />
              
              {/* Nerves Branching to Right Leg */}
              <path d="M 100,127 Q 110,135 116,178" fill="none" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.2" className="nerve-line-reverse" />

              {/* Pentagonal Outer Aura Connections */}
              <polygon className="rotate-center" points="100,28 126,90 115,127 85,127 74,90" fill="none" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1" />

              {/* Heart Glow Background */}
              <circle cx="100" cy="70" r="16" fill="url(#glow)" />

              {/* Heart Icon (Pulsing Vector Heart) */}
              <path 
                d="M 100,68 C 98,64 92,64 92,70 C 92,76 100,81 100,81 C 100,81 108,76 108,70 C 108,64 102,64 100,68 Z" 
                fill="rgba(244, 63, 94, 0.95)" 
                stroke="#fff" 
                strokeWidth="0.5" 
                className="pulse-heart"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveNode('heart')}
              />

              {/* Interactive Node Anchors (Glow Circles) */}
              
              {/* Brain Node (Head) */}
              <circle 
                cx="100" cy="28" r="7" 
                fill="var(--bg-secondary)" 
                stroke={activeNode === 'brain' ? '#fff' : 'var(--accent-cyan)'} 
                strokeWidth="2.2" 
                className={activeNode === 'brain' ? "pulse-brain" : ""}
                style={{ cursor: 'pointer' }} 
                onClick={() => setActiveNode('brain')} 
              />
              <text x="100" y="17" textAnchor="middle" fontSize="8" fill="var(--text-secondary)" fontWeight="bold">Brain</text>

              {/* Heart Node Label (redundant anchor, since click is on heart path too) */}
              <circle 
                cx="100" cy="70" r="5" 
                fill="var(--bg-secondary)" 
                stroke={activeNode === 'heart' ? '#fff' : 'var(--accent-rose)'} 
                strokeWidth="2.2" 
                style={{ cursor: 'pointer' }} 
                onClick={() => setActiveNode('heart')} 
              />
              <text x="120" y="73" textAnchor="start" fontSize="8" fill="var(--text-secondary)" fontWeight="bold">Heart</text>

              {/* Blood Node (Central Torso/Lower spine) */}
              <circle 
                cx="100" cy="105" r="7" 
                fill="var(--bg-secondary)" 
                stroke={activeNode === 'blood' ? '#fff' : 'var(--accent-cyan)'} 
                strokeWidth="2.2" 
                style={{ cursor: 'pointer' }} 
                onClick={() => setActiveNode('blood')} 
              />
              <text x="114" y="108" textAnchor="start" fontSize="8" fill="var(--text-secondary)" fontWeight="bold">Blood</text>

              {/* Lifestyle Node (Left hand/Arm) */}
              <circle 
                cx="72" cy="103" r="7" 
                fill="var(--bg-secondary)" 
                stroke={activeNode === 'lifestyle' ? '#fff' : 'var(--accent-emerald)'} 
                strokeWidth="2.2" 
                style={{ cursor: 'pointer' }} 
                onClick={() => setActiveNode('lifestyle')} 
              />
              <text x="60" y="106" textAnchor="end" fontSize="8" fill="var(--text-secondary)" fontWeight="bold">Lifestyle</text>

              {/* Environment Node (Right hand/Arm) */}
              <circle 
                cx="128" cy="103" r="7" 
                fill="var(--bg-secondary)" 
                stroke={activeNode === 'environment' ? '#fff' : 'var(--accent-amber)'} 
                strokeWidth="2.2" 
                style={{ cursor: 'pointer' }} 
                onClick={() => setActiveNode('environment')} 
              />
              <text x="140" y="106" textAnchor="start" fontSize="8" fill="var(--text-secondary)" fontWeight="bold">Env</text>

            </svg>
          </div>

          <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-purple)', fontWeight: 600 }}>
              Node details
            </span>
            <h4 style={{ fontSize: '1.15rem', color: '#fff', marginTop: '4px', marginBottom: '10px' }}>
              {nodeDetails[activeNode]?.title || 'Physiological Hub'}
            </h4>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', padding: '3px 8px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                Status: {nodeDetails[activeNode]?.status || 'Online'}
              </div>
            </div>

            {nodeDetails[activeNode]?.metrics && (
              <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontWeight: 600 }}>
                ⚡ Telemetry: {nodeDetails[activeNode].metrics}
              </div>
            )}

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '15px' }}>
              {nodeDetails[activeNode]?.desc}
            </p>

            {nodeDetails[activeNode]?.biomarkers && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>🔬 Associated Biomarkers:</span>
                <span style={{ fontSize: '0.8rem', color: '#fff' }}>{nodeDetails[activeNode].biomarkers}</span>
              </div>
            )}

            {nodeDetails[activeNode]?.agents && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>🤖 Monitoring AI Agent(s):</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 500 }}>{nodeDetails[activeNode].agents}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 6. Simulations View
  const renderSimulationsView = () => {
    const sleep = parseFloat(simulationSliders.sleepHours);
    const exercise = parseInt(simulationSliders.exerciseDays);
    const scoreY = 150 - Math.min((sleep * 10) + (exercise * 5), 100);
    const stressY = 40 + Math.max(100 - (sleep * 8) - (exercise * 6), 10);

    return (
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>🔮 Biological Twin Simulation Engine</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Adjust your biological controls to project metabolic adjustments over 90 days.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)', gap: '30px' }}>
          
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Adjust Variables</h4>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Daily Sleep</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{simulationSliders.sleepHours} hrs</span>
              </div>
              <input 
                type="range" 
                min="4" 
                max="10" 
                step="0.5" 
                value={simulationSliders.sleepHours} 
                onChange={(e) => setSimulationSliders(prev => ({ ...prev, sleepHours: e.target.value }))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--accent-emerald)' }}>Workouts / Week</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{simulationSliders.exerciseDays} days</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="7" 
                step="1" 
                value={simulationSliders.exerciseDays} 
                onChange={(e) => setSimulationSliders(prev => ({ ...prev, exerciseDays: e.target.value }))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Daily Hydration</label>
              <select 
                className="form-control" 
                value={simulationSliders.waterLiters} 
                onChange={(e) => setSimulationSliders(prev => ({ ...prev, waterLiters: e.target.value }))}
                style={{ fontSize: '0.85rem', padding: '8px' }}
              >
                <option value="1.2">&lt; 1.5L</option>
                <option value="2.0">1.5L - 2.0L</option>
                <option value="2.5">2.0L - 3.0L</option>
                <option value="3.5">&gt; 3.0L</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Dietary Plan</label>
              <select 
                className="form-control" 
                value={simulationSliders.dietType} 
                onChange={(e) => setSimulationSliders(prev => ({ ...prev, dietType: e.target.value }))}
                style={{ fontSize: '0.85rem', padding: '8px' }}
              >
                <option>Balanced</option>
                <option>Ketogenic</option>
                <option>Vegetarian</option>
                <option>Vegan</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px 16px', fontSize: '0.88rem' }}
              onClick={handleRunSimulation}
              disabled={simulationLoading}
            >
              {simulationLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div className="agent-indicator running" style={{ width: '14px', height: '14px' }}></div>
                  Running Simulation...
                </div>
              ) : (
                '🔮 Compute Digital Twin Simulation'
              )}
            </button>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>📊 Projected Twin Recovery Curve</h4>
            
            <div style={{ height: '240px', marginTop: '10px' }}>
              <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
                <line x1="50" y1="50" x2="450" y2="50" stroke="rgba(255,255,255,0.03)" />
                <line x1="50" y1="100" x2="450" y2="100" stroke="rgba(255,255,255,0.03)" />
                <line x1="50" y1="150" x2="450" y2="150" stroke="rgba(255,255,255,0.03)" />

                <path 
                  d={`M 50,150 Q 200,${(scoreY + 150)/2} 450,${scoreY}`} 
                  fill="none" 
                  stroke="var(--accent-cyan)" 
                  strokeWidth="3.5" 
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(6,182,212,0.5))' }}
                />

                <path 
                  d={`M 50,80 Q 200,${(stressY + 80)/2} 450,${stressY}`} 
                  fill="none" 
                  stroke="var(--accent-rose)" 
                  strokeWidth="2.5" 
                  style={{ strokeDasharray: '4 4' }}
                />

                <circle cx="450" cy={scoreY} r="6" fill="#fff" stroke="var(--accent-cyan)" strokeWidth="3" />
                <circle cx="450" cy={stressY} r="5" fill="var(--bg-primary)" stroke="var(--accent-rose)" strokeWidth="2" />

                <text x="60" y="30" fill="var(--accent-cyan)" fontSize="9" fontWeight="bold">▬ Twin Recovery Index</text>
                <text x="210" y="30" fill="var(--accent-rose)" fontSize="9" fontWeight="bold">- - Cellular Stress</text>
                
                <text x="45" y="195" fill="var(--text-secondary)" fontSize="9">Day 0</text>
                <text x="240" y="195" fill="var(--text-secondary)" fontSize="9">Day 45</text>
                <text x="430" y="195" fill="var(--text-primary)" fontSize="9" fontWeight="bold">Day 90</text>
              </svg>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <strong>Biocomputing Output</strong>: At {simulationSliders.sleepHours} hours sleep and {simulationSliders.exerciseDays} workout days, cellular repair rates increase by {Math.round(100 - scoreY)}%. Cortisol-induced metabolic cell stress decreases significantly by Day 90.
            </p>
          </div>

        </div>

        {/* AI Simulation Insight Outcome Display */}
        {(simulationPrediction || simulationLoading) && (
          <div className="glass-panel" style={{ background: 'rgba(139, 92, 246, 0.03)', borderColor: 'rgba(139, 92, 246, 0.2)', padding: '20px' }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--accent-purple)', marginBottom: '10px' }}>🔮 Simulated AI Predictive Insights</h4>
            {simulationLoading ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>Evaluating metabolic indices and running biological predictions...</p>
            ) : (
              <div 
                style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', textAlign: 'left' }}
                dangerouslySetInnerHTML={{ __html: simulationPrediction.replace(/\n/g, '<br/>') }}
              />
            )}
          </div>
        )}

        {/* Saved Simulation History List */}
        {simulationHistory && simulationHistory.length > 0 && (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>📜 Twin Simulation Log History</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
              {simulationHistory.map((sim, i) => (
                <div key={i} style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Scenario: {sim.question}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{new Date(sim.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div 
                    style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{ __html: sim.prediction.replace(/\n/g, '<br/>') }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 7. Intelligence Report View
  const renderIntelligenceReportView = () => {
    if (!activeReport) return <p>No report compiled yet.</p>;
    return (
      <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-purple)', fontWeight: 600 }}>Clinical AI Briefing</span>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '4px' }}>Clinical Twin Analysis Report</h3>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => {
              addToast("Formatting clinical report for document print...", "success");
              setTimeout(() => {
                window.print();
              }, 600);
            }}
          >
            🖨️ Export PDF Briefing
          </button>
        </div>

        <div>
          <h4 style={{ fontSize: '1.05rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>🧬 Executive Health Summary</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6', background: 'rgba(255,255,255,0.015)', padding: '15px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            {activeReport.healthSummary}
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)', marginBottom: '8px' }}>📋 Clinical Recommendations</h4>
          <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.5' }}>
            {activeReport.recommendations?.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '10px' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '8px' }}>🔬 Scientific Citations</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Citations: Journal of Clinical Endocrinology & Metabolism (JCEM) Ref. #4829, Lancet Diabetes & Endocrinology Vol. 8.
          </p>
        </div>
      </div>
    );
  };

  // 8. Comparison View
  const renderComparisonView = () => {
    if (reportHistory.length === 0) {
      return (
        <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '10px' }}>🔀 Comparative Biomarker Analysis</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Compare biomarker compliance boundaries across historical diagnostic records.
          </p>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
            <span style={{ fontSize: '2.5rem' }}>📤</span>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: '15px 0 8px 0' }}>No Historical Reports Found</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 15px auto', lineHeight: '1.5' }}>
              Upload your blood test reports in the <strong>Upload</strong> section to initialize your virtual twin and start tracking your diagnostic timeline.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setActiveTab('upload')}>
              Upload New Report
            </button>
          </div>
        </div>
      );
    }

    const clinicalBaseline = {
      kickoffId: "baseline-ref",
      createdAt: "Clinical Target Target",
      healthScore: 95,
      healthSummary: "Standard adult healthy metabolic reference target.",
      medicalAnalysis: "• Total Cholesterol: 190 mg/dL (Normal)\n• Vitamin D: 45 ng/mL (Normal)\n• HbA1c: 5.0% (Optimal)\n• Thyroid TSH: 1.5 uIU/mL (Optimal)",
      lifestyleScore: {
        sleep: 85,
        exercise: 85,
        diet: 85
      },
      recommendations: [
        "Maintain current calorie intake matching active daily metabolic load",
        "Keep daily sleep above 7.5 hours"
      ]
    };

    const activeReportA = compReportAId === 'baseline' ? clinicalBaseline : (reportHistory.find(r => r.kickoffId === compReportAId) || reportHistory[1] || reportHistory[0]);
    const activeReportB = reportHistory.find(r => r.kickoffId === compReportBId) || reportHistory[0];

    const scoreA = activeReportA.healthScore;
    const scoreB = activeReportB.healthScore;
    const scoreDelta = scoreB - scoreA;

    const getCholesterolVal = (rep) => {
      if (!rep || !rep.medicalAnalysis) return null;
      const match = rep.medicalAnalysis.match(/cholesterol\s*[:\-]?\s*(\d+)/i);
      return match ? parseInt(match[1]) : (rep.kickoffId === 'baseline-ref' ? 190 : 218);
    };
    
    const getVitaminDVal = (rep) => {
      if (!rep || !rep.medicalAnalysis) return null;
      const match = rep.medicalAnalysis.match(/vitamin\s*d\s*[:\-]?\s*(\d+)/i);
      return match ? parseInt(match[1]) : (rep.kickoffId === 'baseline-ref' ? 45 : 24);
    };

    const cholA = getCholesterolVal(activeReportA);
    const cholB = getCholesterolVal(activeReportB);
    const cholDelta = cholB - cholA;

    const vitDA = getVitaminDVal(activeReportA);
    const vitDB = getVitaminDVal(activeReportB);
    const vitDDelta = vitDB - vitDA;

    const sleepA = activeReportA.lifestyleScore?.sleep || 70;
    const sleepB = activeReportB.lifestyleScore?.sleep || 70;
    
    const exerciseA = activeReportA.lifestyleScore?.exercise || 70;
    const exerciseB = activeReportB.lifestyleScore?.exercise || 70;
    
    const dietA = activeReportA.lifestyleScore?.diet || 70;
    const dietB = activeReportB.lifestyleScore?.diet || 70;

    return (
      <div className="animate-fade-in-up" style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* Intro */}
        <div className="glass-panel">
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Timeline Diagnostics</span>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>🔀 Comparative Biomarker Analysis</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Select any two medical reports below to measure physical marker deviations, lifestyle scores, and health progress.
          </p>
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Compare From (Base):</label>
            <select 
              className="form-control" 
              style={{ fontSize: '0.85rem' }} 
              value={compReportAId} 
              onChange={(e) => setCompReportAId(e.target.value)}
            >
              <option value="baseline">🏥 Clinical Target Reference</option>
              {reportHistory.map(r => (
                <option key={r.kickoffId} value={r.kickoffId}>
                  📄 Report of {new Date(r.createdAt).toLocaleDateString()} ({r.healthScore}/100)
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '14px' }}>➡️</div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Compare To (Current):</label>
            <select 
              className="form-control" 
              style={{ fontSize: '0.85rem' }} 
              value={compReportBId} 
              onChange={(e) => setCompReportBId(e.target.value)}
            >
              {reportHistory.map(r => (
                <option key={r.kickoffId} value={r.kickoffId}>
                  📄 Report of {new Date(r.createdAt).toLocaleDateString()} ({r.healthScore}/100)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Health score comparisons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
          <div className="glass-panel" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Metabolic Score Shift</span>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '15px 0' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{scoreA}</div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Previous</span>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.15)' }}>➔</div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: scoreDelta >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{scoreB}</div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Current</span>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: scoreDelta >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', background: scoreDelta >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)', padding: '4px 12px', borderRadius: '12px', fontWeight: 600, border: scoreDelta >= 0 ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(244,63,94,0.15)' }}>
              {scoreDelta >= 0 ? `▲ Improved by ${scoreDelta} pts` : `▼ Dropped by ${Math.abs(scoreDelta)} pts`}
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-purple)', fontWeight: 600 }}>Comparative Briefing</span>
            <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>📋 AI Progression Summary</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {scoreDelta >= 0 ? (
                `Your metabolic health model is showing positive progression. Correcting nutrient deficiencies (like Vitamin D) and adjusting food habits has boosted cellular restoration efficiency.`
              ) : (
                `Your virtual twin indicates metabolic strain. Suboptimal sleep, high local UV exposure, and dietary shifts are dragging down biomarker compliance scores.`
              )}
            </p>
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '5px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <strong>Log Dates</strong>: {activeReportA.createdAt === "Clinical Target Target" ? "Clinical Target" : new Date(activeReportA.createdAt).toLocaleDateString()} ➔ {new Date(activeReportB.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Biomarkers comparisons */}
        <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '16px' }}>Biomarker</th>
                <th style={{ textAlign: 'center', padding: '16px' }}>Clinical Target Target</th>
                <th style={{ textAlign: 'center', padding: '16px' }}>Previous Reading</th>
                <th style={{ textAlign: 'center', padding: '16px' }}>Current Reading</th>
                <th style={{ textAlign: 'center', padding: '16px' }}>Delta / Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: '#fff' }}>Total Cholesterol</td>
                <td style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>&lt; 200 mg/dL</td>
                <td style={{ textAlign: 'center', padding: '16px' }}>{cholA} mg/dL</td>
                <td style={{ textAlign: 'center', padding: '16px', color: cholB >= 200 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{cholB} mg/dL</td>
                <td style={{ textAlign: 'center', padding: '16px' }}>
                  <span style={{ 
                    color: cholDelta <= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', 
                    fontSize: '0.8rem', 
                    background: cholDelta <= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', 
                    padding: '4px 10px', 
                    borderRadius: '10px',
                    fontWeight: 600 
                  }}>
                    {cholDelta <= 0 ? '' : '+'}{cholDelta} mg/dL
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '16px', fontWeight: 600, color: '#fff' }}>Vitamin D (25-OH)</td>
                <td style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>30 - 100 ng/mL</td>
                <td style={{ textAlign: 'center', padding: '16px' }}>{vitDA} ng/mL</td>
                <td style={{ textAlign: 'center', padding: '16px', color: vitDB < 30 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{vitDB} ng/mL</td>
                <td style={{ textAlign: 'center', padding: '16px' }}>
                  <span style={{ 
                    color: vitDDelta >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', 
                    fontSize: '0.8rem', 
                    background: vitDDelta >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', 
                    padding: '4px 10px', 
                    borderRadius: '10px',
                    fontWeight: 600
                  }}>
                    {vitDDelta >= 0 ? '+' : ''}{vitDDelta} ng/mL
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Lifestyle scoring progress bars */}
        <div className="glass-panel">
          <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '15px' }}>🏃 Lifestyle Score Improvements</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Sleep Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Sleep Quality & Duration Score</span>
                <span style={{ color: 'var(--text-secondary)' }}>{sleepA} ➔ {sleepB}</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${sleepA}%`, background: 'var(--accent-purple-glow)', opacity: 0.5, height: '100%' }}></div>
                <div style={{ width: `${Math.max(0, sleepB - sleepA)}%`, background: 'var(--accent-purple)', height: '100%' }}></div>
                {sleepB < sleepA && <div style={{ width: `${sleepA - sleepB}%`, background: 'var(--accent-rose)', opacity: 0.7, height: '100%' }}></div>}
              </div>
            </div>

            {/* Exercise Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Physical Activity & Workout Score</span>
                <span style={{ color: 'var(--text-secondary)' }}>{exerciseA} ➔ {exerciseB}</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${exerciseA}%`, background: 'var(--accent-cyan)', opacity: 0.4, height: '100%' }}></div>
                <div style={{ width: `${Math.max(0, exerciseB - exerciseA)}%`, background: 'var(--accent-cyan)', height: '100%' }}></div>
                {exerciseB < exerciseA && <div style={{ width: `${exerciseA - exerciseB}%`, background: 'var(--accent-rose)', opacity: 0.7, height: '100%' }}></div>}
              </div>
            </div>

            {/* Diet Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Nutritional Intake compliance</span>
                <span style={{ color: 'var(--text-secondary)' }}>{dietA} ➔ {dietB}</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${dietA}%`, background: 'var(--accent-emerald)', opacity: 0.4, height: '100%' }}></div>
                <div style={{ width: `${Math.max(0, dietB - dietA)}%`, background: 'var(--accent-emerald)', height: '100%' }}></div>
                {dietB < dietA && <div style={{ width: `${dietA - dietB}%`, background: 'var(--accent-rose)', opacity: 0.7, height: '100%' }}></div>}
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  };

  // 9. Trends View
  const renderTrendsView = () => {
    const filteredGlossary = BIOMARKER_GLOSSARY.filter(b => 
      b.name.toLowerCase().includes(biomarkerQuery.toLowerCase()) || 
      b.desc.toLowerCase().includes(biomarkerQuery.toLowerCase())
    );

    return (
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Trend Graph glass-panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>📈 Long-term Physiological Trends</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Select a biomarker to track your metabolic direction.</p>
          
          <div className="form-group" style={{ maxWidth: '200px' }}>
            <select className="form-control" style={{ fontSize: '0.85rem' }}>
              <option>Total Cholesterol</option>
              <option>Vitamin D</option>
              <option>Fasting Glucose</option>
            </select>
          </div>

          <div style={{ height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
              <line x1="50" y1="50" x2="450" y2="50" stroke="rgba(255,255,255,0.03)" />
              <line x1="50" y1="100" x2="450" y2="100" stroke="rgba(255,255,255,0.03)" />
              <line x1="50" y1="150" x2="450" y2="150" stroke="rgba(255,255,255,0.03)" />

              <text x="20" y="55" fill="var(--text-secondary)" fontSize="10">240</text>
              <text x="20" y="105" fill="var(--text-secondary)" fontSize="10">220</text>
              <text x="20" y="155" fill="var(--text-secondary)" fontSize="10">200</text>

              <polyline 
                fill="none" 
                stroke="var(--accent-purple)" 
                strokeWidth="3.5" 
                points="70,110 180,105 300,98 420,52" 
                style={{ filter: 'drop-shadow(0px 0px 4px rgba(139,92,246,0.5))' }}
              />
              <circle cx="70" cy="110" r="5" fill="var(--bg-primary)" stroke="var(--accent-purple)" strokeWidth="2" />
              <circle cx="180" cy="105" r="5" fill="var(--bg-primary)" stroke="var(--accent-purple)" strokeWidth="2" />
              <circle cx="300" cy="98" r="5" fill="var(--bg-primary)" stroke="var(--accent-purple)" strokeWidth="2" />
              <circle cx="420" cy="52" r="5" fill="#fff" stroke="var(--accent-purple)" strokeWidth="3" />

              <text x="50" y="185" fill="var(--text-secondary)" fontSize="9">Report #1</text>
              <text x="160" y="185" fill="var(--text-secondary)" fontSize="9">Report #2</text>
              <text x="280" y="185" fill="var(--text-secondary)" fontSize="9">Report #3</text>
              <text x="400" y="185" fill="var(--text-primary)" fontSize="9" fontWeight="bold">Current</text>
            </svg>
          </div>
        </div>

        {/* Searchable Biomarkers Dictionary */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>📖 Interactive Biomarker Reference Guide</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Browse clinical definitions, optimal boundaries, and biological optimization hints.</p>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search biomarkers (e.g. Cholesterol, Glucose)..." 
              value={biomarkerQuery}
              onChange={(e) => setBiomarkerQuery(e.target.value)}
              style={{ fontSize: '0.9rem', maxWidth: '400px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '10px' }}>
            {filteredGlossary.map((bio, idx) => (
              <div 
                key={idx} 
                style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                onClick={() => addToast(`Optimal limits for ${bio.name} are ${bio.range}`, 'success')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>{bio.name}</h4>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                    {bio.range}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                  {bio.desc}
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', marginTop: '10px', paddingTop: '8px', fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                  💡 <strong>Advice</strong>: {bio.advice}
                </div>
              </div>
            ))}
            {filteredGlossary.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No biomarkers match your search query.</p>
            )}
          </div>
        </div>

      </div>
    );
  };

  // 10. Reminders View
  const renderRemindersView = () => {
    const getCategoryIcon = (cat) => {
      switch (cat) {
        case 'hydration': return '💧';
        case 'exercise': return '🏃';
        case 'sleep': return '😴';
        case 'nutrition': return '🍎';
        case 'medicine': return '💊';
        default: return '🔔';
      }
    };
    
    const getCategoryColor = (cat) => {
      switch (cat) {
        case 'hydration': return 'var(--accent-cyan)';
        case 'exercise': return 'var(--accent-emerald)';
        case 'sleep': return 'var(--accent-purple)';
        case 'nutrition': return 'var(--accent-amber)';
        case 'medicine': return 'var(--accent-rose)';
        default: return 'var(--text-secondary)';
      }
    };

    return (
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>🔔 Lifestyle Alarms & Reminders</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Configure physical reminders to prompt healthier habits that align with your digital twin goals.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '30px' }}>
          {/* Active Reminders List */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              Your Active Reminders ({remindersState.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '450px', paddingRight: '5px' }}>
              {remindersState.map((rem) => (
                <div 
                  key={rem.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '14px 18px', 
                    borderRadius: '10px', 
                    background: 'rgba(255, 255, 255, 0.015)', 
                    border: '1px solid var(--glass-border)',
                    transition: 'var(--transition-smooth)',
                    opacity: rem.enabled ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                      fontSize: '1.4rem', 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '8px', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: `1px solid ${getCategoryColor(rem.category)}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {getCategoryIcon(rem.category)}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600, textDecoration: rem.enabled ? 'none' : 'line-through' }}>
                        {rem.title}
                      </h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {rem.schedule}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox" 
                      checked={rem.enabled} 
                      onChange={() => {
                        const updated = remindersState.map(r => r.id === rem.id ? { ...r, enabled: !r.enabled } : r);
                        setRemindersState(updated);
                        addToast(`Reminder "${rem.title}" ${!rem.enabled ? 'enabled' : 'disabled'}.`, 'success');
                      }}
                      style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--accent-purple)' }}
                    />
                    
                    <button
                      type="button"
                      onClick={() => {
                        const updated = remindersState.filter(r => r.id !== rem.id);
                        setRemindersState(updated);
                        addToast(`Reminder "${rem.title}" deleted.`, 'success');
                      }}
                      style={{
                        background: 'rgba(244, 63, 94, 0.08)',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                        color: 'var(--accent-rose)',
                        borderRadius: '6px',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.8rem',
                        transition: 'var(--transition-smooth)'
                      }}
                      title="Delete Reminder"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {remindersState.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '1.8rem', marginBottom: '10px' }}>📭</p>
                  <p style={{ fontSize: '0.85rem' }}>No reminders configured. Create one on the right!</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Panel */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              Create New Reminder
            </h4>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newReminderTitle.trim()) {
                addToast("Please provide a title for the reminder.", "error");
                return;
              }
              const newReminder = {
                id: `reminder-${Date.now()}`,
                title: newReminderTitle,
                schedule: newReminderSchedule || 'As needed',
                category: newReminderCategory,
                enabled: true
              };
              setRemindersState(prev => [...prev, newReminder]);
              addToast(`Reminder "${newReminderTitle}" created!`, "success");
              
              // Reset fields
              setNewReminderTitle('');
              setNewReminderSchedule('');
              setNewReminderCategory('general');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Reminder Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Take Vitamin D supplement" 
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '10px 14px' }}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Schedule / Frequency</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Daily at 9:00 AM, Every Mon/Wed" 
                  value={newReminderSchedule}
                  onChange={(e) => setNewReminderSchedule(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '10px 14px' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Category & Icon</label>
                <select 
                  className="form-control" 
                  value={newReminderCategory}
                  onChange={(e) => setNewReminderCategory(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '10px 14px' }}
                >
                  <option value="general">🔔 General / Custom Alert</option>
                  <option value="hydration">💧 Hydration / Water Intake</option>
                  <option value="exercise">🏃 Exercise & Workouts</option>
                  <option value="sleep">😴 Sleep & Recovery</option>
                  <option value="nutrition">🍎 Nutrition & Diet</option>
                  <option value="medicine">💊 Supplements & Medication</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginTop: '10px' }}
              >
                ➕ Create Alarm & Sync
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // 11. Settings View
  const renderSettingsView = () => {
    return (
      <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>⚙️ Platform Settings</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Manage your BioTwin credentials and secrets.</p>

        <form onSubmit={(e) => { e.preventDefault(); alert("Credentials saved successfully."); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input type="text" className="form-control" defaultValue={user?.name || ''} style={{ fontSize: '0.9rem' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="text" className="form-control" value={user?.email || ''} readOnly style={{ fontSize: '0.9rem', opacity: 0.7 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Authentication Token</label>
            <input type="password" className="form-control" value="••••••••••••••••••••" readOnly style={{ fontSize: '0.9rem', opacity: 0.7 }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Save Changes</button>
        </form>
      </div>
    );
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardView();
      case 'profile':
        return (
          <ProfileSection 
            userId={user.id}
            token={token}
            initialProfile={profile}
            onSaveSuccess={(updatedProfile) => {
              setProfile(updatedProfile);
              setActiveTab('dashboard');
              setIsEditingProfile(false);
            }}
            onCancel={() => {
              setActiveTab('dashboard');
              setIsEditingProfile(false);
            }}
          />
        );
      case 'home':
      case 'upload':
        return (
          <MedicalUpload 
            userId={user.id} 
            token={token}
            profile={profile} 
            onUploadSuccess={handleUploadSuccess} 
            onStartGeneration={handleStartGeneration} 
          />
        );
      case 'reports':
        return renderReportsView();
      case 'lifestyle':
        return renderLifestyleView();
      case 'environment':
        return (
          <EnvironmentalIntelligence 
            userId={user.id} 
            token={token} 
            initialLocation={profile?.location} 
          />
        );
      case 'twin':
        return renderDigitalTwinView();
      case 'simulations':
        return renderSimulationsView();
      case 'intelligence':
        return renderIntelligenceReportView();
      case 'comparison':
        return renderComparisonView();
      case 'trends':
        return renderTrendsView();
      case 'reminders':
        return renderRemindersView();
      case 'settings':
        return renderSettingsView();
      case 'about':
        return <AboutSection />;
      case 'agent':
        return kickoffId ? (
          <ProcessingScreen 
            kickoffId={kickoffId} 
            userId={user.id} 
            token={token}
            onComplete={handleProcessingComplete} 
          />
        ) : (
          <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '650px', margin: '40px auto', textAlign: 'center', padding: '50px 40px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🤖</div>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '12px', fontWeight: 800 }}>Agent Crew: Standby</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '30px' }}>
              No biological twin analysis is active. Go to the <strong>Upload</strong> tab to upload your blood test report and initiate the CrewAI medical analysis pipeline.
            </p>
            <button type="button" className="btn btn-primary" style={{ padding: '10px 24px' }} onClick={() => setActiveTab('upload')}>
              Go to Upload Center
            </button>
          </div>
        );
      default:
        return renderDashboardView();
    }
  };

  if (sessionChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="agent-indicator running" style={{ width: '40px', height: '40px', marginBottom: '20px' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Restoring secure session...</p>
      </div>
    );
  }

  // DOUBLE LAYOUT STRETCH: Logged-in with Profile (Sleek Sidebar Navigation)
  if (user && profile) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
        <div className="bg-blob bg-blob-purple"></div>
        <div className="bg-blob bg-blob-cyan"></div>
        
        {/* Print Styles Override */}
        <style>{`
          @media print {
            aside, header, button, .btn { display: none !important; }
            main { padding: 0 !important; margin: 0 !important; width: 100% !important; background: #fff !important; color: #000 !important; }
            .glass-panel { border: none !important; box-shadow: none !important; background: transparent !important; backdrop-filter: none !important; color: #000 !important; padding: 10px 0 !important; }
            h2, h3, h4, p, span, li, td, th { color: #000 !important; }
          }
        `}</style>

        {/* Toasts Alert System Container */}
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 1000 }}>
          {toasts.map(toast => (
            <div key={toast.id} className="animate-fade-in-up" style={{
              padding: '12px 20px',
              borderRadius: '8px',
              background: 'rgba(17, 24, 39, 0.95)',
              borderLeft: `4px solid ${toast.type === 'success' ? 'var(--accent-cyan)' : 'var(--accent-rose)'}`,
              boxShadow: 'var(--glass-shadow)',
              color: '#fff',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(12px)'
            }}>
              <span>{toast.type === 'success' ? '🔔' : '⚠️'}</span>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
        
        {/* Left Sidebar */}
        <aside style={{
          width: sidebarCollapsed ? '80px' : '260px',
          borderRight: '1px solid var(--glass-border)',
          background: 'rgba(10, 15, 30, 0.75)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'var(--transition-smooth)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100
        }}>
          {/* Logo & Toggle Header */}
          <div style={{
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--glass-border)'
          }}>
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="floating-logo" style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 5px var(--accent-purple))' }}>🧬</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px', background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  BioTwin <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
                </span>
              </div>
            )}
            {sidebarCollapsed && <span className="floating-logo" style={{ fontSize: '1.8rem' }}>🧬</span>}
            
            <button 
              type="button"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: 0
              }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? '➔' : '«'}
            </button>
          </div>

          {/* Menu Items */}
          <nav style={{ flexGrow: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
            {SIDEBAR_ITEMS.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    width: '100%',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'var(--transition-smooth)'
                  }}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'profile') setIsEditingProfile(true);
                    else setIsEditingProfile(false);
                  }}
                >
                  <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Section & Logout */}
          <div style={{
            padding: '20px 15px',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{user.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                </div>
              </div>
            )}
            
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                background: 'transparent',
                color: 'var(--accent-rose)',
                fontWeight: 600,
                width: '100%',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                cursor: 'pointer',
                fontSize: '0.88rem'
              }}
              onClick={handleLogout}
            >
              <span style={{ fontSize: '1.2rem' }}>🚪</span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
          
          <header style={{
            padding: '20px 40px',
            borderBottom: '1px solid var(--glass-border)',
            background: 'rgba(9, 13, 22, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Welcome, {user.name}</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Your AI-powered health overview</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{
                background: 'var(--accent-purple-glow)',
                color: 'var(--accent-purple)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                {user.id === 'demo-user' ? 'Demo Sandbox Mode' : 'Twin Synchronized'}
              </span>
            </div>
          </header>

          <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
            {renderActiveView()}
          </main>
        </div>
      </div>
    );
  }

  // STANDARD LAYOUT (For Logged-out Landing Page OR Initial Setup Wizard)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-blob bg-blob-purple"></div>
      <div className="bg-blob bg-blob-cyan"></div>
      
      {/* Navigation Header */}
      <header style={{ 
        padding: '16px 40px', 
        borderBottom: '1px solid var(--glass-border)', 
        background: 'rgba(9, 13, 22, 0.6)', 
        backdropFilter: 'blur(16px)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Left Side Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => {
          if (!user) {
            setStep('auth');
            setShowAuthForm(false);
            setActiveTab('home');
          }
        }}>
          <span className="floating-logo" style={{ fontSize: '1.8rem', display: 'inline-block', filter: 'drop-shadow(0 0 5px var(--accent-purple))' }}>🧬</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.5px', background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BioTwin <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
          </span>
        </div>

        {/* Center navigation tabs removed for cleaner single-page landing flow */}

        {/* Right Side: Account Details & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{user.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{user.email}</div>
              </div>
              
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ fontSize: '0.8rem', padding: '6px 12px', border: '1px solid rgba(244, 63, 94, 0.2)', color: 'var(--accent-rose)' }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div>
              {!showAuthForm && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  onClick={() => setShowAuthForm(true)}
                >
                  Sign In / Register
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flexGrow: 1, padding: '20px 40px' }}>
        
        {/* STEP 1: SHOWROOM LANDING PAGE & LOGIN / SIGNUP FLOW */}
        {step === 'auth' && (
          <div>
            {!showAuthForm ? (
              <>
                <div className="animate-fade-in-up" style={{ maxWidth: '1100px', margin: '20px auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '60px', alignItems: 'center' }}>
                
                {/* Landing Pitch Left Side */}
                <div>
                  <span style={{ background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '20px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                    🧬 Next-Gen Medical Intelligence
                  </span>
                  
                  <h1 style={{ fontSize: '3.4rem', fontWeight: 800, lineHeight: '1.1', marginBottom: '20px', background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Simulate Your Health.<br />
                    <span style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Optimize Your Future.</span>
                  </h1>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', marginBottom: '30px', lineHeight: '1.6' }}>
                    BioTwin AI builds a secure, private digital twin of your biology. Upload blood reports, track local environmental factors, and simulate metabolic adjustments in real time using advanced agentic AI.
                  </p>

                  {/* Bullet Highlights */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem', lineHeight: 1 }}>✔</span>
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}><strong>RAG Knowledge Base</strong>: Reads PDF blood chemistry values instantly.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem', lineHeight: 1 }}>✔</span>
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}><strong>Predictive Simulations</strong>: Ask "what-if" health questions and project changes.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem', lineHeight: 1 }}>✔</span>
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}><strong>Multi-Agent Diagnostics</strong>: Watch AI agents coordinate live analyses.</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }} onClick={handleExploreDemo}>
                      🚀 Explore Demo Dashboard
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1.05rem' }} onClick={() => setShowAuthForm(true)}>
                      🔑 Access Secure Portal
                    </button>
                  </div>
                </div>

                {/* Digital Twin Interactive SVG Network Right Side */}
                <div className="glass-panel" style={{ width: '100%', padding: '30px', border: '1px solid rgba(139, 92, 246, 0.2)', boxShadow: '0 8px 32px 0 rgba(139, 92, 246, 0.1)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Digital Twin Visualizer
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="agent-indicator running" style={{ width: '8px', height: '8px' }}></span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Biocomputing Active</span>
                    </div>
                  </div>

                  {/* Connected Nodes Map */}
                  <div style={{ position: 'relative', width: '100%', height: '240px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    
                    <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ cursor: 'default' }}>
                      <defs>
                        <radialGradient id="showroomGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Translucent Human Body Outline */}
                      <g opacity="0.3">
                        <circle cx="100" cy="28" r="9" fill="rgba(139, 92, 246, 0.08)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1.2" />
                        <path d="
                          M 96,37 L 104,37
                          M 100,37 L 100,42
                          M 100,42 C 90,43 80,46 74,52
                          C 70,56 70,66 68,90
                          C 67,99 69,103 72,103
                          C 75,103 76,94 76,85
                          C 78,70 82,56 100,56
                          C 118,56 122,70 124,85
                          C 124,94 125,103 128,103
                          C 131,103 133,99 132,90
                          C 130,56 130,46 126,52
                          C 120,46 110,43 100,42
                          
                          M 85,56 C 85,80 87,98 85,112
                          C 84,117 81,120 81,124
                          L 81,180
                          C 81,183 83,185 85,185
                          C 87,185 87,183 87,180
                          L 89,127
                          L 100,127
                          L 111,127
                          L 113,180
                          C 113,183 113,185 115,185
                          C 117,185 119,183 119,180
                          L 119,124
                          C 119,120 116,117 115,112
                          C 113,98 115,80 115,56
                        " fill="rgba(139, 92, 246, 0.08)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </g>

                      {/* Spine Nervous Pathway (Central Conduit) */}
                      <line x1="100" y1="37" x2="100" y2="127" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="1.5" className="nerve-line" />
                      
                      {/* Nerves Branching to Left Arm */}
                      <path d="M 100,48 Q 88,52 74,90" fill="none" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.2" className="nerve-line-reverse" />
                      
                      {/* Nerves Branching to Right Arm */}
                      <path d="M 100,48 Q 112,52 126,90" fill="none" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.2" className="nerve-line" />
                      
                      {/* Nerves Branching to Left Leg */}
                      <path d="M 100,127 Q 90,135 84,178" fill="none" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.2" className="nerve-line" />
                      
                      {/* Nerves Branching to Right Leg */}
                      <path d="M 100,127 Q 110,135 116,178" fill="none" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.2" className="nerve-line-reverse" />

                      {/* Pentagonal Outer Connections */}
                      <polygon className="rotate-center" points="100,28 126,90 115,127 85,127 74,90" fill="none" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1" />

                      {/* Heart Pulsing */}
                      <path 
                        d="M 100,68 C 98,64 92,64 92,70 C 92,76 100,81 100,81 C 100,81 108,76 108,70 C 108,64 102,64 100,68 Z" 
                        fill="rgba(244, 63, 94, 0.95)" 
                        stroke="#fff" 
                        strokeWidth="0.5" 
                        className="pulse-heart"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setActiveNode('heart')}
                        onClick={() => setActiveNode('heart')}
                      />

                      {/* Brain Node (Head) */}
                      <circle 
                        cx="100" cy="28" r="7" 
                        fill="var(--bg-secondary)" 
                        stroke={activeNode === 'brain' ? '#fff' : 'var(--accent-purple)'} 
                        strokeWidth="2.2" 
                        className={activeNode === 'brain' ? "pulse-brain" : ""}
                        style={{ cursor: 'pointer' }} 
                        onMouseEnter={() => setActiveNode('brain')}
                        onClick={() => setActiveNode('brain')} 
                      />
                      <text x="100" y="17" textAnchor="middle" fontSize="8" fill="var(--text-secondary)" fontWeight="bold">Brain</text>

                      {/* Heart Circle Anchor */}
                      <circle 
                        cx="100" cy="70" r="4" 
                        fill="var(--bg-secondary)" 
                        stroke={activeNode === 'heart' ? '#fff' : 'var(--accent-rose)'} 
                        strokeWidth="2" 
                        style={{ cursor: 'pointer' }} 
                        onMouseEnter={() => setActiveNode('heart')}
                        onClick={() => setActiveNode('heart')} 
                      />
                      <text x="118" y="73" textAnchor="start" fontSize="8" fill="var(--text-secondary)" fontWeight="bold">Heart</text>

                      {/* Core Node (Torso center/Lower spine) */}
                      <circle 
                        cx="100" cy="105" r="9" 
                        fill="var(--bg-secondary)" 
                        stroke={activeNode === 'core' ? '#fff' : 'var(--accent-cyan)'} 
                        strokeWidth="2.5" 
                        style={{ cursor: 'pointer' }} 
                        onMouseEnter={() => setActiveNode('core')}
                        onClick={() => setActiveNode('core')} 
                      />
                      <text x="114" y="108" textAnchor="start" fontSize="8" fill="#fff" fontWeight="bold">🧬 Core</text>

                      {/* Lifestyle Node (Left hand/Arm) */}
                      <circle 
                        cx="72" cy="103" r="7" 
                        fill="var(--bg-secondary)" 
                        stroke={activeNode === 'lifestyle' ? '#fff' : 'var(--accent-emerald)'} 
                        strokeWidth="2.2" 
                        style={{ cursor: 'pointer' }} 
                        onMouseEnter={() => setActiveNode('lifestyle')}
                        onClick={() => setActiveNode('lifestyle')} 
                      />
                      <text x="60" y="106" textAnchor="end" fontSize="8" fill="var(--text-secondary)" fontWeight="bold">Lifestyle</text>

                      {/* Blood Node (Right hand/Arm) */}
                      <circle 
                        cx="128" cy="103" r="7" 
                        fill="var(--bg-secondary)" 
                        stroke={activeNode === 'blood' ? '#fff' : 'var(--accent-cyan)'} 
                        strokeWidth="2.2" 
                        style={{ cursor: 'pointer' }} 
                        onMouseEnter={() => setActiveNode('blood')}
                        onClick={() => setActiveNode('blood')} 
                      />
                      <text x="140" y="106" textAnchor="start" fontSize="8" fill="var(--text-secondary)" fontWeight="bold">Blood</text>

                    </svg>

                  </div>

                  {/* Node Description Details */}
                  <div className="animate-fade-in-up" style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)', minHeight: '120px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                        {nodeDetails[activeNode]?.title || 'Physiological Hub'}
                      </h4>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: activeNode === 'blood' ? 'var(--accent-amber)' : (activeNode === 'core' || activeNode === 'brain' || activeNode === 'lifestyle' ? 'var(--accent-cyan)' : 'var(--text-secondary)'),
                        fontWeight: 600
                      }}>
                        {nodeDetails[activeNode]?.status || 'Online'}
                      </span>
                    </div>
                    
                    {nodeDetails[activeNode]?.metrics && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '8px', fontWeight: 600, background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                        ⚡ Telemetry: {nodeDetails[activeNode].metrics}
                      </div>
                    )}
                    
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '10px' }}>
                      {nodeDetails[activeNode]?.desc}
                    </p>

                    {nodeDetails[activeNode]?.biomarkers && (
                      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '8px', display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>🔬 Biomarkers:</span>
                        <span style={{ color: '#fff' }}>{nodeDetails[activeNode].biomarkers}</span>
                      </div>
                    )}

                    {nodeDetails[activeNode]?.agents && (
                      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '8px', display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>🤖 AI Agent:</span>
                        <span style={{ color: 'var(--accent-purple)', fontWeight: 500 }}>{nodeDetails[activeNode].agents}</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
              
              {/* About Platform Content integrated directly onto single-page landing showroom */}
              <div style={{ marginTop: '60px', borderTop: '1px solid var(--glass-border)', paddingTop: '40px' }}>
                <AboutSection />
              </div>
            </>
            ) : (
              <div className="animate-fade-in-up" style={{ maxWidth: '450px', margin: '40px auto' }}>
                
                <div style={{ marginBottom: '20px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px' }} 
                    onClick={() => setShowAuthForm(false)}
                  >
                    ← Back to Showroom
                  </button>
                </div>

                <div className="glass-panel" style={{ width: '100%' }}>
                  
                  {/* Form Tab Toggles */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', marginBottom: '25px' }}>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ 
                        padding: '8px', 
                        fontSize: '0.9rem', 
                        borderRadius: '6px',
                        background: authTab === 'login' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                        color: authTab === 'login' ? '#fff' : 'var(--text-secondary)',
                        boxShadow: 'none'
                      }}
                      onClick={() => { setAuthTab('login'); setAuthError(''); }}
                    >
                      Login
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ 
                        padding: '8px', 
                        fontSize: '0.9rem', 
                        borderRadius: '6px',
                        background: authTab === 'signup' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                        color: authTab === 'signup' ? '#fff' : 'var(--text-secondary)',
                        boxShadow: 'none'
                      }}
                      onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                    >
                      Create Account
                    </button>
                  </div>

                  {authError && (
                    <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
                      {authError}
                      {authError.includes("already exists") && (
                        <button 
                          type="button" 
                          onClick={() => { setAuthTab('login'); setAuthError(''); }}
                          style={{ display: 'block', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.85rem', padding: '6px 12px', marginTop: '8px', fontWeight: 600 }}
                        >
                          Go To Login
                        </button>
                      )}
                      {authError.includes("No account found") && (
                        <button 
                          type="button" 
                          onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                          style={{ display: 'block', background: 'none', border: 'none', color: 'var(--accent-cyan)', textDecoration: 'underline', marginTop: '6px', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                        >
                          Create New Account
                        </button>
                      )}
                    </div>
                  )}

                  {/* LOGIN VIEW */}
                  {authTab === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="animate-fade-in-up">
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input 
                          type="email" 
                          name="email" 
                          className="form-control" 
                          placeholder="user@example.com" 
                          value={loginData.email} 
                          onChange={handleLoginChange} 
                          required 
                        />
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label className="form-label">Password</label>
                        <input 
                          type="password" 
                          name="password" 
                          className="form-control" 
                          placeholder="••••••••" 
                          value={loginData.password} 
                          onChange={handleLoginChange} 
                          required 
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <a href="#forgot" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setStep('forgot-password'); setAuthError(''); }}>
                          Forgot Password?
                        </a>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={authLoading}>
                        {authLoading ? 'Verifying...' : 'Login & Open Dashboard'}
                      </button>

                      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <span style={{ color: 'var(--accent-cyan)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setAuthTab('signup'); setAuthError(''); }}>
                          Create Account
                        </span>
                      </div>
                    </form>
                  )}

                  {/* SIGNUP VIEW */}
                  {authTab === 'signup' && (
                    <form onSubmit={handleSignupSubmit} className="animate-fade-in-up">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" name="name" className="form-control" placeholder="John Doe" value={signupData.name} onChange={handleSignupChange} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" name="email" className="form-control" placeholder="user@example.com" value={signupData.email} onChange={handleSignupChange} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input type="tel" name="phone" className="form-control" placeholder="+1 (555) 019-2834" value={signupData.phone} onChange={handleSignupChange} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" placeholder="Min. 8 chars (letters + numbers)" value={signupData.password} onChange={handleSignupChange} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" name="confirmPassword" className="form-control" placeholder="••••••••" value={signupData.confirmPassword} onChange={handleSignupChange} required />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={authLoading}>
                        {authLoading ? 'Registering...' : 'Create My Account'}
                      </button>

                      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <span style={{ color: 'var(--accent-cyan)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setAuthTab('login'); setAuthError(''); }}>
                          Login
                        </span>
                      </div>
                    </form>
                  )}

                </div>

              </div>
            )}
          </div>
        )}

        {/* ========================================================
            LOGGED OUT USER FLOW (SUB-PAGES)
           ======================================================== */}
        {!user && (
          <>
            {/* STEP 1.5: EMAIL OTP VERIFICATION */}
            {step === 'verify-email' && (
              <VerifyEmail 
                email={signupData.email || (user && user.email)} 
                onVerificationSuccess={(jwtToken, userDetails) => {
                  handleVerificationSuccess(jwtToken, userDetails);
                }} 
                onBackToSignup={() => {
                  setStep('auth');
                  setAuthTab('signup');
                  setAuthError('');
                }}
              />
            )}

            {/* FORGOT PASSWORD REQUEST PAGE */}
            {step === 'forgot-password' && (
              <ForgotPassword 
                onBackToLogin={() => {
                  setStep('auth');
                  setAuthTab('login');
                  setAuthError('');
                }}
              />
            )}

            {/* RESET PASSWORD PAGE */}
            {step === 'reset-password' && (
              <ResetPassword 
                onResetSuccess={() => {
                  setStep('auth');
                  setAuthTab('login');
                  setAuthError('');
                }}
              />
            )}
          </>
        )}

        {/* ========================================================
            LOGGED IN USER FLOW (ABOUT, PROFILE, WIZARD, UPLOAD, AGENT, RESULT)
           ======================================================== */}
        {user && !profile && (
          /* Force setup wizard onboarding first */
          <OnboardingWizard 
            userId={user.id} 
            token={token}
            defaultName={user.name}
            onComplete={handleWizardComplete} 
          />
        )}

        {user && profile && (
          <>
            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <AboutSection />
            )}

            {/* PROFILE SETTINGS TAB */}
            {activeTab === 'profile' && (
              <ProfileSection 
                userId={user.id}
                token={token}
                initialProfile={profile}
                onSaveSuccess={(updatedProfile) => {
                  setProfile(updatedProfile);
                  setActiveTab('home'); // Go back to Home
                  setIsEditingProfile(false);
                }}
                onCancel={() => {
                  setActiveTab('home'); // Go back to Home
                  setIsEditingProfile(false);
                }}
              />
            )}

            {/* HOME / UPLOAD TAB */}
            {activeTab === 'home' && (
              <MedicalUpload 
                userId={user.id} 
                token={token}
                profile={profile} 
                onUploadSuccess={handleUploadSuccess} 
                onStartGeneration={handleStartGeneration} 
              />
            )}

            {/* AGENT DIAGNOSTICS TAB */}
            {activeTab === 'agent' && (
              kickoffId ? (
                <ProcessingScreen 
                  kickoffId={kickoffId} 
                  userId={user.id} 
                  token={token}
                  onComplete={handleProcessingComplete} 
                />
              ) : (
                <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '650px', margin: '40px auto', textAlign: 'center', padding: '50px 40px' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🤖</div>
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '12px', fontWeight: 800 }}>Agent Crew: Standby</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '30px' }}>
                    No biological twin analysis is active. Go to the <strong>Home</strong> tab to upload your blood test report and initiate the CrewAI medical analysis pipeline.
                  </p>
                  <button type="button" className="btn btn-primary" style={{ padding: '10px 24px' }} onClick={() => setActiveTab('home')}>
                    Go to Upload Center
                  </button>
                </div>
              )
            )}

            {/* RESULT / REPORT TAB */}
            {activeTab === 'result' && (
              activeReport ? (
                <ReportDashboard 
                  userId={user.id} 
                  token={token}
                  activeReport={activeReport} 
                  history={reportHistory}
                  onReupload={() => {
                    if (user.id === 'demo-user') {
                      alert("You are currently exploring in Demo Mode. To upload your own real medical reports, please sign out and register a secure account!");
                    } else {
                      setActiveTab('home');
                    }
                  }} 
                  onLogout={handleLogout}
                />
              ) : (
                <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '650px', margin: '40px auto', textAlign: 'center', padding: '50px 40px' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>📊</div>
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '12px', fontWeight: 800 }}>Twin Briefing Pending</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '30px' }}>
                    No digital twin report is available yet. Upload your blood metrics PDF in the <strong>Home</strong> tab to run your virtual twin model.
                  </p>
                  <button type="button" className="btn btn-primary" style={{ padding: '10px 24px' }} onClick={() => setActiveTab('home')}>
                    Go to Upload Center
                  </button>
                </div>
              )
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer style={{ padding: '20px 40px', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
        BioTwin AI Health Portal &copy; {new Date().getFullYear()}. Prepared for integration with Supabase / Firebase authentication.
      </footer>
    </div>
  );
}
