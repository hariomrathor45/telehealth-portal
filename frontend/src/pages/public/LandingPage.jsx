import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaUserMd, FaShieldAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { HiOutlineSearch, HiOutlineClipboardCheck, HiOutlineSparkles, HiOutlineArrowRight } from 'react-icons/hi';
import authService from '../../services/authService';
import doctorApi from '../../services/doctorApi';
import ThemeToggle from '../../components/common/ThemeToggle';
import '../../styles/landing.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          authService.getSpecializations(),
          doctorApi.getApprovedDoctors({ limit: 4 })
        ]);
        setSpecializations(specRes.data || []);
        setFeaturedDoctors(docRes.data?.doctors || []);
      } catch (err) {
        console.warn('Landing data load:', err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="landing-wrapper">
      {/* Navigation */}
      <nav className="landing-nav">
        <Link to="/" className="landing-brand">
          <div className="landing-brand-icon">
            <FaHeartbeat />
          </div>
          <span>Tele<span style={{ color: '#38bdf8' }}>Health</span></span>
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ThemeToggle />
          <Link to="/login" className="btn-hero-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            Sign In
          </Link>
          <Link to="/register/patient" className="btn-hero-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero-content">
          <div>
            <div className="landing-badge">
              <HiOutlineSparkles /> Smart Priority Triage Engine
            </div>
            <h1 className="landing-title">
              Urgency-Driven <span>Telehealth</span> Consultations
            </h1>
            <p className="landing-subtitle">
              Experience the next-generation medical portal where patient consultations are prioritized by clinical urgency rather than first-come-first-served queues.
            </p>
            <div className="landing-actions">
              <button onClick={() => navigate('/login')} className="btn-hero-primary">
                Start Smart Consultation <HiOutlineArrowRight />
              </button>
              <button onClick={() => navigate('/register/doctor')} className="btn-hero-secondary">
                <FaUserMd /> Join as a Doctor
              </button>
            </div>
          </div>

          {/* Interactive Priority Queue Demo Card */}
          <div className="priority-preview-card">
            <div className="priority-preview-header">
              <div>
                <h4 className="queue-preview-title">Live Priority Queue Demo</h4>
                <p className="queue-preview-subtitle">Intelligent queue sorting based on triage score</p>
              </div>
              <span className="badge badge-success" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Active Engine</span>
            </div>

            <div className="queue-preview-item very-high">
              <div>
                <div className="queue-preview-patient-name">Patient #104 (Chest Pain & Dyspnea)</div>
                <div className="queue-preview-patient-meta">Waited: 4 mins • Cardiovascular triage</div>
              </div>
              <span className="badge badge-danger">CRITICAL (92)</span>
            </div>

            <div className="queue-preview-item high">
              <div>
                <div className="queue-preview-patient-name">Patient #102 (Acute High Fever & Spasm)</div>
                <div className="queue-preview-patient-meta">Waited: 12 mins • Pediatric triage</div>
              </div>
              <span className="badge badge-warning">HIGH (74)</span>
            </div>

            <div className="queue-preview-item medium">
              <div>
                <div className="queue-preview-patient-name">Patient #098 (Persistent Joint Swelling)</div>
                <div className="queue-preview-patient-meta">Waited: 20 mins • Orthopedic triage</div>
              </div>
              <span className="badge badge-info">MEDIUM (48)</span>
            </div>

            <div className="queue-preview-item low">
              <div>
                <div className="queue-preview-patient-name">Patient #095 (Mild Skin Rash)</div>
                <div className="queue-preview-patient-meta">Waited: 25 mins • Dermatology triage</div>
              </div>
              <span className="badge badge-neutral">LOW (20)</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3 Core USPs */}
      <section className="landing-section">
        <div className="section-header">
          <div className="section-tag">Core Innovations</div>
          <h2 className="section-title">Why Smart Priority-Based Telehealth?</h2>
          <p className="section-subtitle">
            Addressing critical waiting times in telemedicine through intelligent decision-support triage.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <HiOutlineClipboardCheck />
            </div>
            <h3 className="feature-title">1. Smart Priority Assessment</h3>
            <p className="feature-desc">
              Patients submit symptoms, duration, and severity. Our rule-based decision engine estimates urgency scores (0–100) and priority levels (LOW to VERY HIGH).
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaShieldAlt />
            </div>
            <h3 className="feature-title">2. Admin-Verified Doctors</h3>
            <p className="feature-desc">
              Every doctor is thoroughly verified by administrators before activation. License numbers and degree certificates are checked to protect patient safety.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaClock />
            </div>
            <h3 className="feature-title">3. Urgency-Aware Queue</h3>
            <p className="feature-desc">
              Doctors receive an intelligently ordered queue based on urgency and waiting time, preventing delay for critical cases while avoiding starvation for routine visits.
            </p>
          </div>
        </div>
      </section>

      {/* Clinical Departments */}
      <section className="landing-section landing-section-alt">
        <div className="section-header">
          <div className="section-tag">Specialties</div>
          <h2 className="section-title">Explore Medical Departments</h2>
          <p className="section-subtitle">
            Connect with certified specialists across diverse medical disciplines.
          </p>
        </div>

        <div className="departments-grid">
          {specializations.slice(0, 10).map((spec) => (
            <div key={spec._id || spec.name} className="department-card">
              <div className="department-icon">🩺</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{spec.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Specialist Care</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Disclaimer Banner */}
      <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 24px' }}>
        <div className="disclaimer-banner">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <FaExclamationTriangle size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Academic Healthcare Prototype Notice:</strong> This system is a consultation-support and urgency-prioritization prototype. It does not diagnose diseases or replace licensed medical diagnosis. For life-threatening medical emergencies, please contact your nearest hospital emergency room immediately.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer" style={{ marginTop: '60px' }}>
        <div className="footer-inner">
          <div>
            <div className="landing-brand" style={{ marginBottom: 12 }}>
              <div className="landing-brand-icon" style={{ width: 32, height: 32, fontSize: '1rem' }}>
                <FaHeartbeat />
              </div>
              <span style={{ fontSize: '1.25rem' }}>Tele<span style={{ color: '#38bdf8' }}>Health</span></span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, maxWidth: 320 }}>
              Smart Priority-Based Telehealth Portal System. Designed for rapid triage, verified medical consultations, and centralized records.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#f8fafc', marginBottom: 12 }}>Portals</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem' }}>
              <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Patient Login</Link>
              <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Doctor Login</Link>
              <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Admin Control</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#f8fafc', marginBottom: 12 }}>Registration</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem' }}>
              <Link to="/register/patient" style={{ color: '#94a3b8', textDecoration: 'none' }}>Patient Signup</Link>
              <Link to="/register/doctor" style={{ color: '#94a3b8', textDecoration: 'none' }}>Doctor Signup</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#f8fafc', marginBottom: 12 }}>Technology</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem', color: '#94a3b8' }}>
              <span>React 19 + Vite</span>
              <span>Node.js Express REST</span>
              <span>MongoDB & Mongoose</span>
              <span>Rule-Based Priority AI</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 30, fontSize: '0.8125rem', color: '#64748b' }}>
          © 2026 TeleHealth Portal System — Cornerstone B.Tech CSE Project.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
