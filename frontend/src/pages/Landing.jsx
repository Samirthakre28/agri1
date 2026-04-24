import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <>
      {/* Navigation */}
      <header className="main-head">
        <div className="container">
          <nav>
            <Link className="logo" to="/">
              <span className="material-symbols-outlined">agriculture</span> AgriContract
            </Link>
            <div className="auth-links">
              <Link className="btn btn-secondary" to="/login" style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}>Login</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content fade-in">
            <h1>Secure your crops <span style={{ color: 'var(--primary)' }}>before you grow</span></h1>
            <p>Connect directly with buyers, fix your price early, and eliminate uncertainty. Join the future of trust-based agriculture.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/login?mode=signup">Get Started</Link>
              <Link className="btn btn-secondary" to="/login">Login</Link>
            </div>
          </div>
          <div className="hero-image fade-in">
            <img alt="Farmer and Buyer Partnership" src="/assets/hero.png"/>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <h2>Why AgriContract?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <span className="material-symbols-outlined">handshake</span>
              </div>
              <h3>Guaranteed Buyers</h3>
              <p>Stop worrying about where to sell. We connect you with verified institutional buyers before harvest.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <h3>Fixed Pricing</h3>
              <p>Lock in your prices early. Protect your profits from unpredictable market volatility and price drops.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <h3>Secure Contracts</h3>
              <p>Legally binding digital agreements backed by smart protocols. Transparent, fair, and reliable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" style={{ background: 'var(--white)' }}>
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-num">1</div>
              <div className="feature-icon" style={{ marginBottom: '1rem', width: '60px', height: '60px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>inventory_2</span>
              </div>
              <h3>List your crop</h3>
              <p>Share details about what you're growing and your expected yield.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <div className="feature-icon" style={{ marginBottom: '1rem', width: '60px', height: '60px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>local_shipping</span>
              </div>
              <h3>Receive offers</h3>
              <p>Get competitive price offers from buyers across the country.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <div className="feature-icon" style={{ marginBottom: '1rem', width: '60px', height: '60px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>gavel</span>
              </div>
              <h3>Secure your contract</h3>
              <p>Pick the best offer and sign the agreement digitally in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta">
            <h2>Start securing your harvest today</h2>
            <p>Join thousands of farmers and buyers who are building a more stable future for agriculture.</p>
            <Link className="btn btn-primary" to="/login?mode=signup">Sign Up Now</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <span className="material-symbols-outlined">agriculture</span>
            AgriContract
          </div>
          <div className="footer-links">
            <Link to="#">About</Link>
            <Link to="#">Contact</Link>
            <Link to="#">Terms</Link>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '1rem' }}>&copy; 2026 AgriContract. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
