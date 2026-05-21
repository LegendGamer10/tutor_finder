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
  const [query,    setQuery]    = useState(defaultValues.q        || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (subject)      params.set('subject', subject);
    if (location.trim()) params.set('location', location.trim());
    if (budget)       params.set('budget', budget);
    navigate(`/tutors?${params.toString()}`);
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          className="input"
          type="text"
          placeholder="Search by name or subject…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, margin: 0 }}
          aria-label="Search tutors"
        />
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
      </form>
    );
  }

  return (
    <div className="search-box">
      <form onSubmit={handleSubmit}>
        {/* Keyword row */}
        <div className="search-keyword-row">
          <div className="search-keyword-field">
            <span className="search-keyword-icon">🔍</span>
            <input
              className="search-keyword-input"
              type="text"
              placeholder="Search by tutor name, subject, or keyword…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search tutors"
            />
          </div>
          <button type="submit" className="btn btn-primary search-submit-btn">
            Find Tutors
          </button>
        </div>

        {/* Filters row */}
        <div className="search-filters-row">
          <div className="search-field">
            <label>Subject</label>
            <select className="input" value={subject} onChange={e => setSubject(e.target.value)} aria-label="Subject">
              {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="search-field">
            <label>Location</label>
            <input
              className="input"
              type="text"
              placeholder="City (e.g. Mumbai)"
              value={location}
              onChange={e => setLocation(e.target.value)}
              aria-label="Location"
            />
          </div>

          <div className="search-field">
            <label>Budget / Hour</label>
            <select className="input" value={budget} onChange={e => setBudget(e.target.value)} aria-label="Budget">
              {BUDGETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}
