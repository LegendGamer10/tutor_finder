import { useState } from 'react';
import { Link } from 'react-router-dom';

const steps = [
  { n: 1, icon: '🔍', title: 'Search & Filter', desc: 'Use our smart search to browse tutors by subject, location, mode, and budget. Powerful filters help you narrow down to the perfect match in seconds.' },
  { n: 2, icon: '📋', title: 'View Profiles', desc: 'Each tutor has a detailed profile with their qualifications, subjects, session mode, hourly rate, and student reviews — everything you need to decide.' },
  { n: 3, icon: '💬', title: 'Book a Session', desc: 'Found your match? Request a session directly. No complex booking process — just click "Book Now" and the tutor will confirm your slot.' },
  { n: 4, icon: '📈', title: 'Learn & Grow', desc: 'Attend your sessions online or in-person. After each session, leave a review to help other students and hold tutors accountable.' },
];

const faqs = [
  { q: 'Is StudyBudget free to use as a student?', a: 'Yes! Browsing tutors, viewing profiles, and contacting tutors are completely free. You only pay when you book a session.' },
  { q: 'How are tutors verified?', a: 'All tutors submit their email and subject expertise. They are reviewed by our team before going live. Student reviews also help maintain quality.' },
  { q: 'Can I book online sessions?', a: 'Absolutely. Many tutors offer online sessions via video call. Just filter by "Online" mode when searching.' },
  { q: 'What if I\'m not satisfied with a session?', a: 'We encourage open communication with tutors. If you have issues, contact us via the Contact page and we\'ll help resolve it.' },
  { q: 'How do I become a tutor?', a: 'Click "Become a Tutor" in the navigation. Fill in the short 2-minute application form, and your profile goes live right away.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: open ? 'var(--primary-faint)' : 'var(--white)' }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: open ? 'var(--primary)' : 'var(--gray-800)' }}>{q}</span>
        <span style={{ color: 'var(--gray-400)', fontSize: 18, flexShrink: 0, marginLeft: 12 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '14px 20px', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)' }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="how-page">
      <div className="container">
        <div className="section-header" style={{ marginBottom: 64 }}>
          <p className="overline">Simple Process</p>
          <h1>How StudyBudget Works</h1>
          <p>From search to session — here's exactly how it works in four easy steps.</p>
        </div>

        {/* Steps */}
        <div className="steps-list" style={{ marginBottom: 80 }}>
          {steps.map(s => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* For Tutors CTA banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px',
          color: '#fff',
          textAlign: 'center',
          marginBottom: 80,
        }}>
          <h2 style={{ color: '#fff', marginBottom: 14 }}>For Tutors — Grow Your Teaching Income</h2>
          <p style={{ color: 'rgba(255,255,255,.85)', maxWidth: 540, margin: '0 auto 28px' }}>
            Apply in 2 minutes, set your own rates, and connect with motivated students in your area or online.
          </p>
          <Link to="/become-tutor" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)' }}>
            Apply as Tutor →
          </Link>
        </div>

        {/* FAQ */}
        <div>
          <div className="section-header" style={{ marginBottom: 36 }}>
            <p className="overline">FAQ</p>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
