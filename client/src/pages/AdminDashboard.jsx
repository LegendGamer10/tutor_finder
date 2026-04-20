import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [metrics, setMetrics] = useState({ users: 0, tutors: 0, bookings: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  // For the sake of the demo, we assume the user is an admin if they visit this page logged in.
  // In a real app, this would check user.role === 'admin'.
  useEffect(() => {
    if (!isLoggedIn || !user?.isAdmin) {
      toast.error('Restricted', 'Please log in as an administrator to access the Admin Panel.');
      navigate(isLoggedIn ? '/dashboard' : '/login');
      return;
    }

    fetch('/api/admin/metrics')
      .then(r => r.json())
      .then(d => {
        setMetrics(d.metrics || { users: 0, tutors: 0, bookings: 0, messages: 0 });
        setLoading(false);
      })
      .catch(() => {
        toast.error('Error', 'Could not load admin metrics.');
        setLoading(false);
      });
  }, [isLoggedIn, navigate]);

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}>Loading Admin Panel...</div>;

  return (
    <div style={{ paddingTop: 100, paddingBottom: 60, minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ margin: 0 }}>👑 Admin Control Panel</h1>
          <span className="badge badge-primary">Super Administrator</span>
        </div>

        <div className="dash-stat-row" style={{ marginBottom: 40 }}>
          <div className="dash-stat" style={{ background: '#fff', border: '1px solid var(--gray-200)' }}>
            <div className="dash-stat-num" style={{ color: 'var(--primary)' }}>{metrics.users}</div>
            <div className="dash-stat-label">Total Registered Users</div>
          </div>
          <div className="dash-stat" style={{ background: '#fff', border: '1px solid var(--gray-200)' }}>
            <div className="dash-stat-num" style={{ color: 'var(--success)' }}>{metrics.tutors}</div>
            <div className="dash-stat-label">Active Tutors</div>
          </div>
          <div className="dash-stat" style={{ background: '#fff', border: '1px solid var(--gray-200)' }}>
            <div className="dash-stat-num" style={{ color: 'var(--warning)' }}>{metrics.bookings}</div>
            <div className="dash-stat-label">Total Bookings</div>
          </div>
          <div className="dash-stat" style={{ background: '#fff', border: '1px solid var(--gray-200)' }}>
            <div className="dash-stat-num" style={{ color: '#ec4899' }}>{metrics.messages}</div>
            <div className="dash-stat-label">Messages Sent</div>
          </div>
        </div>

        <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent Activity Card */}
          <div className="dash-card">
             <h3>📊 Platform Health</h3>
             <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
               The platform is operating normally. All backend endpoints including WebSockets are active.
             </p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--success-faint)', borderRadius: 8 }}>
                  <span style={{ fontWeight: 600 }}>Database Status</span>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Online</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--success-faint)', borderRadius: 8 }}>
                  <span style={{ fontWeight: 600 }}>Socket.io Connections</span>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Active</span>
                </div>
             </div>
          </div>

          <div className="dash-card">
            <h3>⚙️ Quick Actions</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Manage platform content directly.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }}>👨‍🏫 Review New Tutor Applications</button>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>💬 Moderate User Messages</button>
              <button className="btn btn-outline btn-danger" style={{ width: '100%', justifyContent: 'flex-start' }}>⚠️ View Reported Accounts</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
