import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function getGradient(name = '') {
  const colors = [['#4f46e5','#06b6d4'],['#7c3aed','#ec4899'],['#059669','#06b6d4'],['#d97706','#ef4444'],['#0ea5e9','#6366f1'],['#10b981','#3b82f6']];
  const idx = (name.charCodeAt(0) || 0) % colors.length;
  return `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`;
}

export default function TutorDetail() {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, rRes] = await Promise.all([
          fetch(`/api/tutors/${id}`),
          fetch(`/api/tutors/${id}/reviews`),
        ]);
        const tData = await tRes.json();
        const rData = await rRes.json();
        if (!tRes.ok || !tData.tutor) { navigate('/tutors'); return; }
        setTutor(tData.tutor);
        setReviews(rData.reviews || []);
      } catch {
        toast.error('Error', 'Could not load tutor profile.');
        navigate('/tutors');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!user || !tutor) return;
    fetch(`/api/bookmarks?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setBookmarked((d.bookmarks || []).some(b => b.tutorId === tutor.id)))
      .catch(() => {});
  }, [user, tutor]);

  const handleBookmark = async () => {
    if (!isLoggedIn) { toast.warning('Login required', 'Please log in to bookmark tutors.'); return; }
    try {
      if (bookmarked) {
        await fetch(`/api/bookmarks/${tutor.id}?userId=${user.id}`, { method: 'DELETE' });
        setBookmarked(false);
        toast.info('Removed', 'Tutor removed from favourites.');
      } else {
        await fetch('/api/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, tutorId: tutor.id }) });
        setBookmarked(true);
        toast.success('Saved!', 'Tutor added to your favourites.');
      }
    } catch { toast.error('Error', 'Could not update bookmark.'); }
  };

  const handleBook = () => {
    if (!isLoggedIn) { toast.warning('Login required', 'Please log in to book a session.'); return; }
    setBooked(true);
    toast.success('Session Requested! 🎉', `We'll notify ${tutor.name} about your booking.`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.warning('Login required', 'Please log in to leave a review.'); return; }
    if (!reviewText.trim()) { toast.warning('Missing text', 'Please write something in your review.'); return; }
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/tutors/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userName: user.name, rating: reviewRating, comment: reviewText }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setReviews(r => [{ id: Date.now(), userName: user.name, rating: reviewRating, comment: reviewText, createdAt: new Date().toISOString() }, ...r]);
      setReviewText('');
      setReviewRating(5);
      toast.success('Review posted!', 'Thanks for sharing your experience.');
    } catch (err) {
      toast.error('Failed', err.message || 'Could not post review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '130px 0 80px', minHeight: '100vh' }}>
      <div className="container">
        <div className="skeleton" style={{ height: 200, marginBottom: 20, borderRadius: 20 }} />
        <div className="detail-grid">
          <div>
            <div className="skeleton" style={{ height: 140, marginBottom: 16, borderRadius: 16 }} />
            <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          </div>
          <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );

  if (!tutor) return null;

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : tutor.rating;
  const gradient = getGradient(tutor.name);

  return (
    <div className="detail-page">
      <div className="container">
        <div className="detail-back">
          <Link to="/tutors" className="btn btn-ghost btn-sm">← Back to Tutors</Link>
        </div>

        <div className="detail-grid">
          {/* Main column */}
          <div className="detail-main">
            {/* Profile header */}
            <div className="profile-header">
              <div className="profile-avatar" style={{ background: gradient }}>{getInitials(tutor.name)}</div>
              <div style={{ flex: 1 }}>
                <h1 className="profile-name">{tutor.name}</h1>
                <div className="profile-sub">🎓 {tutor.subject} Tutor</div>
                <div className="star-row">
                  <StarRating rating={parseFloat(avgRating)} />
                  <span className="rating-num">{avgRating}</span>
                  <span className="rating-count">({reviews.length} reviews)</span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                  <span className="badge badge-success">✅ Verified</span>
                  <span className={`badge ${tutor.mode === 'online' ? 'badge-success' : 'badge-secondary'}`}>{tutor.mode}</span>
                  <span className="badge badge-primary">📍 {tutor.location}</span>
                </div>
              </div>
              <button className={`bookmark-btn${bookmarked ? ' saved' : ''}`} style={{ fontSize: 24 }} onClick={handleBookmark}>
                {bookmarked ? '♥' : '♡'}
              </button>
            </div>

            {/* About */}
            <div className="detail-section">
              <h3>About {tutor.name.split(' ')[0]}</h3>
              <p style={{ lineHeight: 1.75 }}>
                {tutor.name.split(' ')[0]} is an experienced {tutor.subject} tutor based in {tutor.location}, offering {tutor.mode} sessions.
                With a strong academic background and a passion for teaching, {tutor.name.split(' ')[0]} has helped numerous students
                improve their understanding and achieve better results. Sessions are personalized to each student's learning pace and goals.
              </p>
            </div>

            {/* Details */}
            <div className="detail-section">
              <h3>Session Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Subject', value: tutor.subject.charAt(0).toUpperCase() + tutor.subject.slice(1) },
                  { label: 'Location', value: tutor.location },
                  { label: 'Mode', value: tutor.mode },
                  { label: 'Rate', value: `$${tutor.ratePerHour}/hour` },
                  { label: 'Rating', value: `${avgRating} / 5.0` },
                  { label: 'Contact', value: tutor.email || 'Via platform' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--gray-50)', padding: '14px 16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="detail-section">
              <h3>Student Reviews ({reviews.length})</h3>
              {reviews.length === 0 && (
                <div className="empty-state" style={{ padding: '28px 0' }}>
                  <div className="empty-icon">💬</div>
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              )}
              {reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-top">
                    <div className="review-avatar">{getInitials(r.userName || 'U')}</div>
                    <div>
                      <div className="review-name">{r.userName || 'Anonymous'}</div>
                      <StarRating rating={r.rating} />
                    </div>
                    <div className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                  </div>
                  <p className="review-text">{r.comment}</p>
                </div>
              ))}

              {/* Write review */}
              {isLoggedIn && (
                <div className="review-form-card">
                  <h4>Write a Review</h4>
                  <form onSubmit={handleReview}>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Your Rating</label>
                      <StarRating rating={reviewRating} interactive onChange={setReviewRating} size="lg" />
                    </div>
                    <div className="form-group">
                      <textarea
                        className="input"
                        placeholder="Share your experience with this tutor..."
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                      {submittingReview ? 'Posting...' : 'Post Review'}
                    </button>
                  </form>
                </div>
              )}
              {!isLoggedIn && (
                <p className="text-muted mt-8">
                  <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link> to leave a review.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
            <div className="booking-card">
              <div className="booking-rate">${tutor.ratePerHour}<span>/hr</span></div>
              <hr />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Session Type', value: tutor.mode },
                  { label: 'Location', value: tutor.location },
                  { label: 'Availability', value: 'Flexible' },
                  { label: 'Response Time', value: '< 2 hours' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: 'var(--gray-400)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <button
                className={`btn btn-primary`}
                style={{ width: '100%', marginBottom: 10 }}
                onClick={handleBook}
                disabled={booked}
              >
                {booked ? '✓ Session Requested' : '📅 Book a Session'}
              </button>
              <button className={`btn btn-outline${bookmarked ? ' btn-danger' : ''}`} style={{ width: '100%' }} onClick={handleBookmark}>
                {bookmarked ? '♥ Saved' : '♡ Save Tutor'}
              </button>
              <hr />
              <p className="text-muted" style={{ fontSize: 12, textAlign: 'center' }}>
                🔒 Safe & secure. No payment required to enquire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
