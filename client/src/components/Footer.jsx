import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-text">🎓 StudyBudget</div>
            <p>Making quality education accessible and affordable for every student, everywhere.</p>
            <div className="social-row">
              <a href="#" className="social-btn" aria-label="Facebook">f</a>
              <a href="#" className="social-btn" aria-label="Twitter">t</a>
              <a href="#" className="social-btn" aria-label="Instagram">in</a>
              <a href="#" className="social-btn" aria-label="LinkedIn">li</a>
            </div>
          </div>

          <div className="footer-col">
            <h5>Explore</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/tutors">Find Tutors</Link></li>
              <li><Link to="/become-tutor">Become a Tutor</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Plans</h5>
            <ul>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/pricing">Free Plan</Link></li>
              <li><Link to="/pricing">Pro Plan</Link></li>
              <li><Link to="/pricing">Institution</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Support</h5>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} StudyBudget. All rights reserved. Built with ❤️ for students.</p>
        </div>
      </div>
    </footer>
  );
}
