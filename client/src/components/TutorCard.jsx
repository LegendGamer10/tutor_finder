import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useState } from 'react';

const SUBJECT_EMOJI = {
  math: '📐', mathematics: '📐',
  science: '🔬', physics: '⚛️', chemistry: '🧪',
  english: '📝', history: '📚',
  computer: '💻', python: '🐍',
  languages: '🌐', default: '📖'
};

const MODE_COLOR = {
  online: 'badge-success',
  'in-person': 'badge-secondary',
  both: 'badge-accent',
};

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getGradient(name = '') {
  const colors = [
    ['#4f46e5','#06b6d4'],['#7c3aed','#ec4899'],['#059669','#06b6d4'],
    ['#d97706','#ef4444'],['#0ea5e9','#6366f1'],['#10b981','#3b82f6'],
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`;
}

export default function TutorCard({ tutor, onBookmark, bookmarked }) {
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [bm, setBm] = useState(bookmarked);

  const emoji = SUBJECT_EMOJI[tutor.subject?.toLowerCase()] || SUBJECT_EMOJI.default;
  const initials = getInitials(tutor.name);
  const gradient = getGradient(tutor.name || '');

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      toast.warning('Login required', 'Please log in to save tutors.');
      return;
    }
    setBm(b => !b);
    onBookmark && onBookmark(tutor.id, !bm);
  };

  return (
    <div className="tutor-card">
      <div className="tutor-card-header">
        <div className="tutor-avatar" style={{ background: gradient }}>{initials}</div>
        <div className="tutor-info">
          <div className="tutor-name">{tutor.name}</div>
          <div className="tutor-subject">{emoji} {tutor.subject}</div>
        </div>
        <button className={`bookmark-btn${bm ? ' saved' : ''}`} onClick={handleBookmark} aria-label="Bookmark tutor">
          {bm ? '♥' : '♡'}
        </button>
      </div>

      <div className="tutor-card-body">
        <div className="star-row">
          <StarRating rating={tutor.rating} />
          <span className="rating-num">{Number(tutor.rating).toFixed(1)}</span>
          <span className="rating-count">({tutor.reviewCount ?? '0'} reviews)</span>
        </div>

        <div className="tutor-meta">
          <div className="tutor-meta-item">
            <i>📍</i>
            <span>{tutor.location}</span>
          </div>
          <div className="tutor-meta-item">
            <i>🎓</i>
            <span>{tutor.experience ? `${tutor.experience} yrs experience` : 'Experienced tutor'}</span>
          </div>
          <div className="tutor-meta-item">
            <i>💬</i>
            <span className={`badge ${MODE_COLOR[tutor.mode] || 'badge-primary'}`}>{tutor.mode}</span>
          </div>
        </div>

        <div className="tutor-rate">
          ${tutor.ratePerHour}<span>/hr</span>
        </div>
      </div>

      <div className="tutor-card-footer">
        <Link to={`/tutors/${tutor.id}`} className="btn btn-outline btn-sm">View Profile</Link>
        <Link to={`/tutors/${tutor.id}`} className="btn btn-primary btn-sm">Book Now</Link>
      </div>
    </div>
  );
}
