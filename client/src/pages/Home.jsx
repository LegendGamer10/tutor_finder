import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const features = [
  { icon: '💰', title: 'Budget-Friendly', desc: 'Find tutors from just $15/hour. Real quality education without breaking the bank.' },
  { icon: '✅', title: 'Verified Tutors', desc: 'Every tutor is reviewed, background-checked, and verified before joining our platform.' },
  { icon: '🗓️', title: 'Flexible Scheduling', desc: 'Book sessions that fit your life — evenings, weekends, or last-minute prep sessions.' },
  { icon: '💻', title: 'Online & In-Person', desc: 'Choose your preferred format. Online for convenience or in-person for focused learning.' },
];

const testimonials = [
  { text: 'StudyBudget helped me go from a C to an A in Calculus in just 6 weeks. My tutor was incredible and so affordable!', name: 'Priya Sharma', label: 'Engineering Student', init: 'PS' },
  { text: 'I found a Python tutor within hours. He explained concepts better than my college professor, honestly.', name: 'Rahul Mehta', label: 'CS Student', init: 'RM' },
  { text: 'As a parent, I love how transparent the pricing is. My daughter improved her English grades tremendously.', name: 'Anita Desai', label: 'Parent', init: 'AD' },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-tag">🎓 Trusted by 500+ students across India</div>
              <h1 className="hero-title">Find Affordable Tutors That Fit Your Budget</h1>
              <p className="hero-sub">
                Connect with verified, passionate tutors across every subject — all at rates that make sense for students.
              </p>

              <SearchBar />

              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-num">500+</div>
                  <div className="stat-label">Students Helped</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">50+</div>
                  <div className="stat-label">Verified Tutors</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">4.7★</div>
                  <div className="stat-label">Avg. Rating</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">$15</div>
                  <div className="stat-label">Starting Rate</div>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hero-visual">
              <div className="hero-card-stack">
                <div className="hero-main-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>AJ</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', fontFamily: 'Poppins, sans-serif' }}>Alice Johnson</div>
                      <div style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600 }}>📐 Mathematics</div>
                    </div>
                    <div style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>★ 4.9</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {['Calculus','Algebra','Statistics'].map(t => (
                      <span key={t} style={{ background: 'rgba(79,70,229,.09)', color: '#4f46e5', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#4f46e5', fontFamily: 'Poppins,sans-serif' }}>$20<span style={{ fontSize: 13, fontWeight: 400, color: '#9ca3af' }}>/hr</span></div>
                    <button className="btn btn-primary btn-sm">Book Now</button>
                  </div>
                </div>
                <div className="hero-float-card top-right">
                  <div className="float-icon" style={{ background: 'rgba(16,185,129,.1)' }}>✅</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Session Booked!</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Today, 4:00 PM</div>
                  </div>
                </div>
                <div className="hero-float-card bottom-left">
                  <div className="float-icon" style={{ background: 'rgba(245,158,11,.1)' }}>⭐</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>4.8 / 5.0</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>128 reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <p className="overline">Why StudyBudget</p>
            <h2>Everything You Need to Succeed</h2>
            <p>A complete platform designed around students' real needs — affordable, flexible, and effective.</p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (mini) ── */}
      <section style={{ padding: 'var(--section-pad)', background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="section-header">
            <p className="overline">Simple Process</p>
            <h2>Get Started in 3 Simple Steps</h2>
          </div>
          <div className="steps-list">
            {[
              { n: 1, icon: '🔍', title: 'Search & Filter', desc: 'Browse tutors by subject, location, and price. Use filters to find your perfect match.' },
              { n: 2, icon: '📅', title: 'Book a Session', desc: 'View profiles, check reviews, and book your first session directly — no middlemen.' },
              { n: 3, icon: '📈', title: 'Start Learning', desc: 'Connect online or meet in person. Track your progress and level up your grades.' },
            ].map(s => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <p className="overline">Student Stories</p>
            <h2>What Our Students Say</h2>
            <p>Real results from real students. Here's what the StudyBudget community is saying.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map(t => (
              <div key={t.name} className="testimonial-card">
                <div style={{ color: '#f59e0b', fontSize: 18, marginBottom: 12 }}>★★★★★</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.init}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-label">{t.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <h2>Ready to Start Your Learning Journey?</h2>
            <p>Join hundreds of students already learning smarter with StudyBudget.</p>
            <div className="cta-btns">
              <Link to="/tutors" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)' }}>Browse Tutors</Link>
              <Link to="/become-tutor" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,.6)', color: '#fff' }}>Become a Tutor</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
