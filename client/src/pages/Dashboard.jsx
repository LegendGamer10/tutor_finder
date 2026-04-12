import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TutorCard from '../components/TutorCard';

export default function Dashboard() {
  const { user, updateUser, logout, isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkTutors, setBookmarkTutors] = useState([]);
  const [loadingBm, setLoadingBm] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => { if (!isLoggedIn) navigate('/login'); }, [isLoggedIn]);

  useEffect(() => {
    if (tab === 'saved' && user) {
      setLoadingBm(true);
      fetch(`/api/bookmarks?userId=${user.id}`)
        .then(r => r.json())
        .then(async d => {
          const bmList = d.bookmarks || [];
          setBookmarks(bmList);
          const tutors = await Promise.all(
            bmList.map(b => fetch(`/api/tutors/${b.tutorId}`).then(r => r.json()).then(d => d.tutor).catch(() => null))
          );
          setBookmarkTutors(tutors.filter(Boolean));
        })
        .catch(() => toast.error('Error', 'Could not load saved tutors.'))
        .finally(() => setLoadingBm(false));
    }
  }, [tab, user]);

  const handleRemoveBookmark = async (tutorId) => {
    await fetch(`/api/bookmarks/${tutorId}?userId=${user.id}`, { method: 'DELETE' });
    setBookmarkTutors(t => t.filter(t => t.id !== tutorId));
    toast.info('Removed', 'Tutor removed from saved list.');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) { toast.warning('Missing fields', 'Name and email are required.'); return; }
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      updateUser({ name: profileForm.name, email: profileForm.email });
      toast.success('Profile updated!', 'Your changes have been saved.');
    } catch (err) {
      toast.error('Failed', err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out', 'See you next time!');
    navigate('/');
  };

  if (!user) return null;

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-grid">
          {/* Sidebar */}
          <div className="dash-sidebar">
            <div style={{ textAlign: 'center', padding: '12px 0 20px', borderBottom: '1px solid var(--gray-100)', marginBottom: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>{initials}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>{user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{user.email}</div>
            </div>
            <ul className="dash-nav">
              {[
                { id: 'overview', label: '🏠 Overview' },
                { id: 'saved',    label: '♥ Saved Tutors'},
                { id: 'profile',  label: '⚙️ Edit Profile'},
              ].map(item => (
                <li key={item.id}>
                  <a href="#" className={tab === item.id ? 'active' : ''} onClick={e => { e.preventDefault(); setTab(item.id); }}>{item.label}</a>
                </li>
              ))}
              <li style={{ marginTop: 12 }}>
                <a href="#" onClick={e => { e.preventDefault(); handleLogout(); }} style={{ color: 'var(--error)' }}>🚪 Logout</a>
              </li>
            </ul>
          </div>

          {/* Content */}
          <div className="dash-content">
            {/* Overview tab */}
            {tab === 'overview' && (
              <div className="dash-card">
                <h2>👋 Welcome, {user.name.split(' ')[0]}!</h2>
                <div className="dash-stat-row">
                  <div className="dash-stat">
                    <div className="dash-stat-num">{bookmarks.length || '—'}</div>
                    <div className="dash-stat-label">Saved Tutors</div>
                  </div>
                  <div className="dash-stat">
                    <div className="dash-stat-num">0</div>
                    <div className="dash-stat-label">Sessions Done</div>
                  </div>
                  <div className="dash-stat">
                    <div className="dash-stat-num">0</div>
                    <div className="dash-stat-label">Reviews Given</div>
                  </div>
                </div>
                <p style={{ marginBottom: 20, fontSize: 14 }}>
                  You're logged in as <strong>{user.email}</strong>. Explore tutors and save your favourites here.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link to="/tutors" className="btn btn-primary btn-sm">Find Tutors</Link>
                  <button className="btn btn-outline btn-sm" onClick={() => setTab('saved')}>View Saved</button>
                </div>
              </div>
            )}

            {/* Saved Tutors tab */}
            {tab === 'saved' && (
              <div className="dash-card">
                <h2>♥ Saved Tutors</h2>
                {loadingBm ? (
                  <div style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading saved tutors…</div>
                ) : bookmarkTutors.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">♡</div>
                    <h3>No saved tutors yet</h3>
                    <p>Browse tutors and click the ♡ icon to save them here.</p>
                    <Link to="/tutors" className="btn btn-primary mt-16">Browse Tutors</Link>
                  </div>
                ) : (
                  <div className="tutors-grid">
                    {bookmarkTutors.map(t => (
                      <TutorCard key={t.id} tutor={t} bookmarked onBookmark={(id, saving) => !saving && handleRemoveBookmark(id)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile tab */}
            {tab === 'profile' && (
              <div className="dash-card">
                <h2>⚙️ Edit Profile</h2>
                <form onSubmit={handleSaveProfile} style={{ maxWidth: 420 }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input className="input" type="text" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input className="input" type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: 13, color: 'var(--gray-500)', marginBottom: 18 }}>
                    ⚠️ Password changes are not supported in the demo version.
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
