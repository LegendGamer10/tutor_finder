import { Link } from 'react-router-dom';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    desc: 'Perfect for students just getting started',
    features: [
      { text: 'Browse all tutor profiles', ok: true },
      { text: 'Unlimited search & filters', ok: true },
      { text: 'View tutor reviews', ok: true },
      { text: 'Save up to 5 tutors', ok: true },
      { text: 'Book unlimited sessions', ok: false },
      { text: 'Priority tutor matching', ok: false },
      { text: 'Session reminders & tracking', ok: false },
    ],
    cta: 'Get Started Free',
    ctaTo: '/register',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro Student',
    price: 9,
    period: 'month',
    desc: 'For serious students who want more',
    features: [
      { text: 'Everything in Free', ok: true },
      { text: 'Book unlimited sessions', ok: true },
      { text: 'Save unlimited tutors', ok: true },
      { text: 'Session reminders & tracking', ok: true },
      { text: 'Priority tutor matching', ok: true },
      { text: 'Monthly progress reports', ok: true },
      { text: 'Dedicated support', ok: false },
    ],
    cta: 'Start Pro Plan',
    ctaTo: '/register',
    popular: true,
  },
  {
    id: 'institution',
    name: 'Institution',
    price: 49,
    period: 'month',
    desc: 'For schools and coaching centres',
    features: [
      { text: 'Everything in Pro', ok: true },
      { text: 'Up to 50 student accounts', ok: true },
      { text: 'Admin dashboard', ok: true },
      { text: 'Bulk session booking', ok: true },
      { text: 'Dedicated account manager', ok: true },
      { text: 'Custom branding options', ok: true },
      { text: 'Priority support & SLA', ok: true },
    ],
    cta: 'Contact Sales',
    ctaTo: '/contact',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="pricing-page">
      <div className="container">
        <div className="section-header">
          <p className="overline">Transparent Pricing</p>
          <h1>Simple, Honest Pricing</h1>
          <p>No hidden fees. No surprises. Start free and upgrade when you need more.</p>
        </div>

        <div className="pricing-grid">
          {plans.map(plan => (
            <div key={plan.id} className={`price-card${plan.popular ? ' popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="price-name">{plan.name}</h3>
              <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 0 }}>{plan.desc}</p>
              <div className="price-amount">
                {plan.price === 0 ? 'Free' : <><sup>$</sup>{plan.price}</>}
              </div>
              <div className="price-period">{plan.price === 0 ? 'No credit card required' : `/ ${plan.period}`}</div>

              <ul className="price-list">
                {plan.features.map(f => (
                  <li key={f.text} className={f.ok ? '' : 'disabled'}>
                    <i>{f.ok ? '✓' : '✕'}</i>
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link to={plan.ctaTo} className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ mini */}
        <div style={{ maxWidth: 620, margin: '72px auto 0', textAlign: 'center' }}>
          <h3 style={{ marginBottom: 8 }}>Have questions about pricing?</h3>
          <p style={{ marginBottom: 24 }}>We're happy to help. Reach out to our team anytime.</p>
          <Link to="/contact" className="btn btn-outline">Talk to Us</Link>
        </div>
      </div>
    </div>
  );
}
