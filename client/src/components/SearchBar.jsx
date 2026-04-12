import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SUBJECTS = [
  { value: '', label: 'All Subjects' },
  { value: 'math', label: '📐 Mathematics' },
  { value: 'science', label: '🔬 Science' },
  { value: 'english', label: '📝 English' },
  { value: 'history', label: '📚 History' },
  { value: 'computer', label: '💻 Computer Science' },
  { value: 'python', label: '🐍 Python' },
  { value: 'languages', label: '🌐 Languages' },
];

const BUDGETS = [
  { value: '', label: 'Any Budget' },
  { value: '15-25', label: '$15 – $25 / hr' },
  { value: '25-35', label: '$25 – $35 / hr' },
  { value: '35-50', label: '$35 – $50 / hr' },
  { value: '50+',   label: '$50+ / hr' },
];

export default function SearchBar({ defaultValues = {}, compact = false }) {
  const navigate = useNavigate();
  const [subject,  setSubject]  = useState(defaultValues.subject  || '');
  const [location, setLocation] = useState(defaultValues.location || '');
  const [budget,   setBudget]   = useState(defaultValues.budget   || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (subject)  params.set('subject', subject);
    if (location) params.set('location', location);
    if (budget)   params.set('budget', budget);
    navigate(`/tutors?${params.toString()}`);
  };

  return (
    <div className={compact ? '' : 'search-box'}>
      <form onSubmit={handleSubmit}>
        <div className="search-row">
          <div className="search-field">
            {!compact && <label>Subject</label>}
            <select className="input" value={subject} onChange={e => setSubject(e.target.value)} aria-label="Subject">
              {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="search-field">
            {!compact && <label>Location</label>}
            <input
              className="input"
              type="text"
              placeholder="City or 'online'"
              value={location}
              onChange={e => setLocation(e.target.value)}
              aria-label="Location"
            />
          </div>

          <div className="search-field">
            {!compact && <label>Budget / Hour</label>}
            <select className="input" value={budget} onChange={e => setBudget(e.target.value)} aria-label="Budget">
              {BUDGETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>

          <div className="search-field" style={{ justifyContent: 'flex-end' }}>
            {!compact && <label style={{ opacity: 0 }}>.</label>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              🔍 Find Tutors
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
