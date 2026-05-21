import { useState, useEffect, useCallback, useRef } from 'react';
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
const MODES = [
  { value: '', label: 'Any Mode' },
  { value: 'online', label: '🌐 Online' },
  { value: 'in-person', label: '📍 In-Person' },
];
const SORTS = [
  { value: 'rating_desc',  label: '⭐ Highest Rated' },
  { value: 'price_asc',    label: '💰 Price: Low → High' },
  { value: 'price_desc',   label: '💰 Price: High → Low' },
  { value: 'newest',       label: '🆕 Newest First' },
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

  // Local search input state (controlled)
  const [localQ, setLocalQ] = useState('');
  const [localLocation, setLocalLocation] = useState('');
  const searchInputRef = useRef(null);

  // Filters from URL
  const q        = searchParams.get('q')        || '';
  const subject  = searchParams.get('subject')  || '';
  const location = searchParams.get('location') || '';
  const budget   = searchParams.get('budget')   || '';
  const modeQ    = searchParams.get('mode')     || '';

  // Sync local state when URL changes
  useEffect(() => {
    setLocalQ(q);
    setLocalLocation(location);
  }, [q, location]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  const applySearch = () => {
    const p = new URLSearchParams(searchParams);
    if (localQ.trim()) p.set('q', localQ.trim()); else p.delete('q');
    if (localLocation.trim()) p.set('location', localLocation.trim()); else p.delete('location');
    setSearchParams(p);
    setPage(1);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') applySearch();
  };

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q)       params.set('q', q);
      if (subject)  params.set('subject', subject);
      if (location) params.set('location', location);
      if (budget)   params.set('budget', budget);
      if (modeQ)    params.set('mode', modeQ);

      const res = await fetch(`/api/tutors?${params}`);
      const data = await res.json();
      let list = data.tutors || [];

      // Client-side sort
      if (sort === 'rating_desc') list = [...list].sort((a, b) => b.rating - a.rating);
      else if (sort === 'price_asc') list = [...list].sort((a, b) => a.ratePerHour - b.ratePerHour);
      else if (sort === 'price_desc') list = [...list].sort((a, b) => b.ratePerHour - a.ratePerHour);
      else list = [...list].sort((a, b) => b.id - a.id);

      setTutors(list);
    } catch {
      toast.error('Failed to load', 'Could not fetch tutors from server.');
    } finally {
      setLoading(false);
    }
  }, [q, subject, location, budget, modeQ, sort]);

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

  const clearAll = () => { setSearchParams({}); setPage(1); setLocalQ(''); setLocalLocation(''); };

  const paginated = tutors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(tutors.length / PAGE_SIZE);
  const hasFilters = q || subject || location || budget || modeQ;

  return (
    <div className="tutors-page">
      <div className="container">
        <div className="tutors-header">
          <h1>Find Your Perfect Tutor</h1>
          <p>Browse {tutors.length > 0 && !loading ? `${tutors.length} verified` : 'verified'} tutors across all subjects, budgets, and locations.</p>
        </div>

        {/* Search + Filters Bar */}
        <div className="tutors-search-bar">
          {/* Keyword search */}
          <div className="tsb-search-row">
            <div className="tsb-search-field">
              <span className="tsb-search-icon">🔍</span>
              <input
                ref={searchInputRef}
                className="tsb-search-input"
                type="text"
                placeholder="Search by name, subject, or keyword…"
                value={localQ}
                onChange={e => setLocalQ(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Search tutors"
              />
              {localQ && (
                <button className="tsb-clear-x" onClick={() => { setLocalQ(''); const p = new URLSearchParams(searchParams); p.delete('q'); setSearchParams(p); }} aria-label="Clear search">✕</button>
              )}
            </div>
            <div className="tsb-loc-field">
              <span className="tsb-search-icon">📍</span>
              <input
                className="tsb-search-input"
                type="text"
                placeholder="City (e.g. Pune)"
                value={localLocation}
                onChange={e => setLocalLocation(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Location"
              />
            </div>
            <button className="btn btn-primary tsb-submit" onClick={applySearch}>
              Search
            </button>
          </div>

          {/* Filter chips row */}
          <div className="tsb-filters-row">
            <select className="filter-select" value={subject} onChange={e => setFilter('subject', e.target.value)} aria-label="Filter by subject">
              {SUBJECTS.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Subjects'}</option>)}
            </select>

            <select className="filter-select" value={budget} onChange={e => setFilter('budget', e.target.value)} aria-label="Filter by budget">
              {BUDGETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>

            <div className="mode-chips">
              {MODES.map(m => (
                <button key={m.value} className={`filter-chip${modeQ === m.value ? ' active' : ''}`} onClick={() => setFilter('mode', m.value)}>
                  {m.label}
                </button>
              ))}
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="filter-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} aria-label="Sort tutors">
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {hasFilters && (
                <button className="btn btn-ghost btn-sm" onClick={clearAll} style={{ whiteSpace: 'nowrap' }}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active filters tags */}
        {hasFilters && (
          <div className="active-filters">
            {q && <span className="active-tag">🔍 "{q}" <button onClick={() => { setLocalQ(''); setFilter('q', ''); }}>✕</button></span>}
            {subject && <span className="active-tag">📚 {subject} <button onClick={() => setFilter('subject', '')}>✕</button></span>}
            {location && <span className="active-tag">📍 {location} <button onClick={() => { setLocalLocation(''); setFilter('location', ''); }}>✕</button></span>}
            {budget && <span className="active-tag">💰 {budget}/hr <button onClick={() => setFilter('budget', '')}>✕</button></span>}
            {modeQ && <span className="active-tag">🌐 {modeQ} <button onClick={() => setFilter('mode', '')}>✕</button></span>}
          </div>
        )}

        {/* Results meta */}
        {!loading && (
          <div className="results-meta">
            <span>
              {tutors.length === 0 ? 'No tutors found' : <>Showing <strong>{paginated.length}</strong> of <strong>{tutors.length}</strong> tutors</>}
            </span>
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
            <p>Try adjusting your search or clearing some filters to see more results.</p>
            <button className="btn btn-primary mt-16" onClick={clearAll}>Clear All Filters</button>
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
        <div className="tutors-cta-banner">
          <div>
            <h3>Are you a tutor?</h3>
            <p>Join our platform and start earning by sharing your knowledge.</p>
          </div>
          <Link to="/become-tutor" className="btn btn-primary">Apply as Tutor →</Link>
        </div>
      </div>
    </div>
  );
}
