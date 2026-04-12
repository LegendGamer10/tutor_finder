import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STEPS = ['Personal Info', 'Teaching Details', 'Preview & Submit'];

const SUBJECTS = ['math', 'science', 'english', 'history', 'computer', 'python', 'languages'];
const MODES = ['online', 'in-person', 'both'];

const perks = [
  { icon: '💰', text: 'Set your own rates and schedule' },
  { icon: '🌍', text: 'Reach students in your city or online' },
  { icon: '⭐', text: 'Build a rated profile over time' },
  { icon: '📈', text: 'Grow your student base organically' },
  { icon: '🎓', text: 'Free to apply — no upfront costs' },
];

export default function BecomeTutor() {
  const { isLoggedIn, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    subject: '', location: '', ratePerHour: '', mode: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const next = () => {
    if (step === 0) {
      if (!form.name || !form.email) { toast.warning('Required', 'Please fill in name and email.'); return; }
    }
    if (step === 1) {
      if (!form.subject || !form.location || !form.ratePerHour || !form.mode) {
        toast.warning('Required', 'Please complete all teaching details.'); return;
      }
      if (Number(form.ratePerHour) <= 0) { toast.warning('Invalid rate', 'Rate must be a positive number.'); return; }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/tutors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ratePerHour: Number(form.ratePerHour) }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Application submitted! 🎉', 'Your tutor profile is now live on StudyBudget.');
      navigate('/tutors');
    } catch (err) {
      toast.error('Failed', err.message || 'Could not submit tutor application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="become-page">
      <div className="container">
        <div className="become-grid">
          {/* Left info */}
          <div className="become-info">
            <div style={{ marginBottom: 12 }}>
              <span className="badge badge-primary">🎓 Tutor Application</span>
            </div>
            <h1>Share Your Knowledge, Earn on Your Own Terms</h1>
            <p>Join StudyBudget as a verified tutor. Set your own schedule, rates, and subjects — and start making a difference.</p>
            <ul className="become-perks">
              {perks.map(p => (
                <li key={p.text}>
                  <div className="perk-dot">{p.icon}</div>
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 32, padding: '18px 20px', background: 'var(--primary-faint)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--gray-600)' }}>
                🕐 Takes only <strong>2 minutes</strong> to apply. Your profile goes live immediately after review.
              </p>
            </div>
          </div>

          {/* Right form */}
          <div className="become-form-card">
            {/* Step indicator */}
            <div className="step-indicator">
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? '1' : 'none' }}>
                  <div className={`step-dot${i === step ? ' active' : i < step ? ' complete' : ''}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className={`step-line${i < step ? ' complete' : ''}`} />}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 22, fontWeight: 600 }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </div>

            {/* Step 0: Personal */}
            {step === 0 && (
              <div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="input" type="text" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={next}>Continue →</button>
              </div>
            )}

            {/* Step 1: Teaching */}
            {step === 1 && (
              <div>
                <div className="form-group">
                  <label>Subject *</label>
                  <select className="input" value={form.subject} onChange={e => set('subject', e.target.value)}>
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Location / City *</label>
                  <input className="input" type="text" placeholder="e.g. Pune, Mumbai, or 'Online'" value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Rate Per Hour (USD) *</label>
                  <input className="input" type="number" min="1" placeholder="e.g. 25" value={form.ratePerHour} onChange={e => set('ratePerHour', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Session Mode *</label>
                  <select className="input" value={form.mode} onChange={e => set('mode', e.target.value)}>
                    <option value="">Select mode</option>
                    {MODES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={next}>Continue →</button>
                </div>
              </div>
            )}

            {/* Step 2: Preview */}
            {step === 2 && (
              <div>
                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 14, color: 'var(--gray-700)' }}>Confirm your details</h4>
                  {[
                    { l: 'Name', v: form.name },
                    { l: 'Email', v: form.email },
                    { l: 'Subject', v: form.subject },
                    { l: 'Location', v: form.location },
                    { l: 'Rate', v: `$${form.ratePerHour}/hour` },
                    { l: 'Mode', v: form.mode },
                  ].map(item => (
                    <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 14 }}>
                      <span style={{ color: 'var(--gray-400)' }}>{item.l}</span>
                      <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{item.v}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}>
                  By submitting, you agree to be listed on StudyBudget's tutor directory.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : '🚀 Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
