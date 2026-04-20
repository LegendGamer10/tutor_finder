import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tutors from './pages/Tutors';
import TutorDetail from './pages/TutorDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BecomeTutor from './pages/BecomeTutor';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/tutors"        element={<Tutors />} />
            <Route path="/tutors/:id"    element={<TutorDetail />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/register"      element={<Register />} />
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/become-tutor"  element={<BecomeTutor />} />
            <Route path="/how-it-works"  element={<HowItWorks />} />
            <Route path="/pricing"       element={<Pricing />} />
            <Route path="/contact"       element={<Contact />} />
            <Route path="/admin"         element={<AdminDashboard />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
          <Footer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
      <h1 style={{ fontSize: '3rem', marginBottom: 12 }}>404</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>This page doesn't exist. Let's get you back on track.</p>
      <a href="/" className="btn btn-primary">← Back to Home</a>
    </div>
  );
}
