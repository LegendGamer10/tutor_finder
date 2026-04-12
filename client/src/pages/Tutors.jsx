import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import TutorCard from '../components/TutorCard';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SUBJECTS = ['', 'math', 'science', 'english', 'history', 'computer', 'python', 'languages'];
const BUDGETS = [
  { value: '', label: 'Any Budget' },
  { value: '15-25', label: '$15–$25' },
  { value: '25-35', label: '$25–$35' },
  { value: '35-50', label: '$35–$50' },
  { value: '50+',   label: '$50+' },
];
const MODES = [{ value: '', label: 'Any Mode' }, { value: 'online', label: 'Online' }, { value: 'in-person', label: 'In-Person' }];
const SORTS = [
  { value: 'rating_desc',  label: 'Highest Rated' },
  { value: 'price_asc',    label: 'Price: Low → High' },
  { value: 'price_desc',   label: 'Price: High → Low' },
  { value: 'newest',       label: 'Newest First' },
];

const PAGE_SIZE = 9;

export default function Tutors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('rating_desc');

  // Filters from URL
  const subject  = searchParams.get('subject')  || '';
  const location = searchParams.get('location') || '';
  const budget   = searchParams.get('budget')   || '';
  const modeQ    = searchParams.get('mode')     || '';

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subject)  params.set('subject', subject);
      if (location) params.set('location', location);
      if (budget)   params.set('budget', budget);
      if (modeQ)    params.set('mode', modeQ);

      const res = await fetch(`/api/tutors?${params}`);
      const data = await res.json();
      let list = data.tutors || [];

      // Client-side sort
      if (sort === 'rating_desc') list = list.sort((a, b) => b.rating - a.rating);
      else if (sort === 'price_asc') list = list.sort((a, b) => a.ratePerHour - b.ratePerHour);
      else if (sort === 'price_desc') list = list.sort((a, b) => b.ratePerHour - a.ratePerHour);
      else list = list.sort((a, b) => b.id - a.id);

      setTutors(list);
    } catch {
      toast.error('Failed to load', 'Could not fetch tutors from server.');
    } finally {
      setLoading(false);
    }
  }, [subject, location, budget, modeQ, sort]);

  useEffect(() => { fetchTutors(); }, [fetchTutors]);

  // Load bookmarks
  useEffect(() => {
    if (!user) return;
    fetch(`/api/bookmarks?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setBookmarks(new Set((d.bookmarks || []).map(b => b.tutorId))))
      .catch(() => {});
  }, [user]);

  const handleBookmark = async (tutorId, saving) => {
    if (!user) return;
    try {
      if (saving) {
        await fetch('/api/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, tutorId }) });
        setBookmarks(s => new Set([...s, tutorId]));
        toast.success('Saved!', 'Tutor added to your favourites.');
      } else {
        await fetch(`/api/bookmarks/${tutorId}?userId=${user.id}`, { method: 'DELETE' });
        setBookmarks(s => { const n = new Set(s); n.delete(tutorId); return n; });
        toast.info('Removed', 'Tutor removed from favourites.');
      }
    } catch {
      toast.error('Error', 'Could not update bookmark.');
    }
  };

  const paginated = tutors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(tutors.length / PAGE_SIZE);
  const hasFilters = subject || location || budget || modeQ;

  return (
    <div className="tutors-page">
      <div className="container">
        <div className="tutors-header">
          <h1>Find Your Perfect Tutor</h1>
          <p>Browse verified tutors across all subjects, budgets, and locations.</p>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <select className="sort-select" value={subject} onChange={e => setFilter('subject', e.target.value)} aria-label="Filter by subject" style={{ marginLeft: 0 }}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Subjects'}</option>)}
          </select>

          <input
            className="input" style={{ width: 160, margin: 0 }}
            type="text" placeholder="Location..."
            defaultValue={location}
            onKeyDown={e => e.key === 'Enter' && setFilter('location', e.target.value)}
            onBlur={e => setFilter('location', e.target.value)}
            aria-label="Filter by location"
          />

          <select className="sort-select" value={budget} onChange={e => setFilter('budget', e.target.value)} aria-label="Filter by budget">
            {BUDGETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>

          {MODES.map(m => (
            <button key={m.value} className={`filter-chip${modeQ === m.value ? ' active' : ''}`} onClick={() => setFilter('mode', m.value)}>
              {m.label}
            </button>
          ))}

          <select className="sort-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} aria-label="Sort tutors">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearchParams({}); setPage(1); }}>
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Results meta */}
        {!loading && (
          <div className="results-meta">
            <span>Showing <strong>{paginated.length}</strong> of <strong>{tutors.length}</strong> tutors</span>
            {hasFilters && <span className="badge badge-primary">Filtered results</span>}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="tutors-grid">
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No tutors found</h3>
            <p>Try adjusting or clearing some filters to see more results.</p>
            <button className="btn btn-primary mt-16" onClick={() => { setSearchParams({}); setPage(1); }}>Clear All Filters</button>
          </div>
        ) : (
          <div className="tutors-grid">
            {paginated.map(t => (
              <TutorCard
                key={t.id}
                tutor={t}
                bookmarked={bookmarks.has(t.id)}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
          </div>
        )}

        {/* CTA to become tutor */}
        <div style={{ textAlign: 'center', marginTop: 48, padding: '32px', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ marginBottom: 8 }}>Are you a tutor?</h3>
          <p style={{ marginBottom: 20, color: 'var(--gray-500)' }}>Join our platform and start earning by sharing your knowledge.</p>
          <Link to="/become-tutor" className="btn btn-primary">Apply as Tutor</Link>
        </div>
      </div>
    </div>
  );
}
