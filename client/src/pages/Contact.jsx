import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.warning('Missing fields', 'Please fill in all required fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: `[${form.subject}] ${form.message}` }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Message sent! 📬', 'We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Send failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const details = [
    { icon: '📧', label: 'Email Us', value: 'hello@studybudget.com' },
    { icon: '📍', label: 'Location', value: 'Pune, Maharashtra, India' },
    { icon: '🕐', label: 'Response Time', value: 'Within 24 hours' },
  ];

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-grid">
          {/* Info */}
          <div className="contact-info">
            <div style={{ marginBottom: 12 }}><span className="badge badge-primary">📩 Get in Touch</span></div>
            <h2>We'd Love to Hear From You</h2>
            <p>Have a question, feedback, or want to partner with us? Drop us a message and our team will respond promptly.</p>

            {details.map(d => (
              <div key={d.label} className="contact-detail">
                <div className="contact-icon">{d.icon}</div>
                <div>
                  <h4>{d.label}</h4>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--gray-500)' }}>{d.value}</p>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 32, padding: '20px', background: 'var(--primary-faint)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: 8 }}>🎓 Tutor Inquiries</h4>
              <p style={{ fontSize: 14, margin: 0, color: 'var(--gray-600)' }}>
                Want to list yourself as a tutor? Use the <a href="/become-tutor" style={{ color: 'var(--primary)', fontWeight: 600 }}>Become a Tutor</a> page for faster processing.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-card">
            <h3 style={{ marginBottom: 22 }}>Send a Message</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label>Name *</label>
                  <input className="input" type="text" placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input className="input" type="text" placeholder="What's this about?" value={form.subject} onChange={e => set('subject', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea className="input" rows={5} placeholder="Tell us what's on your mind..." value={form.message} onChange={e => set('message', e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending...' : '📤 Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
