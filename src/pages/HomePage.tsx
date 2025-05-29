import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

type HomePageProps = {
  currentUser?: any; 
};

const HomePage: React.FC<HomePageProps> = ({ currentUser }) => {
  return (
    <main className="home-wrapper">
      <section className="hero-section">
        <h1 className="home-title">📖 Daily Lift</h1>
        <p className="home-subtitle">Your daily devotional & fitness companion.</p>
        <p className="home-tagline">Strengthen your faith, energize your body, and lift up your community.</p>
        {!currentUser && (
          <div className="cta-buttons">
            <Link to="/about" className="btn-primary">About</Link>
            <Link to="/privacy" className="btn-secondary">Privacy Policy</Link>
          </div>
        )}
      </section>

      <section className="features-section">
        <h2>What is Daily Lift?</h2>
        <ul className="features-list">
          <li>🙏 <strong>Prayer</strong>: Guided fitness devotionals to strengthen body and spirit.</li>
          <li>🏅 <strong>Fitness Challenges</strong>: Short workouts or log your own routines.</li>
          <li>🧘‍♀️ <strong>Rest Days</strong>: Intentional rest through prayer and reflection.</li>
          <li>📊 <strong>Streak Tracking</strong>: Visualize your progress and stay motivated.</li>
          <li>💛 <strong>Lift Circles</strong>: Join groups to stay accountable and cheer each other on.</li>
        </ul>
      </section>

      <section className="why-section">
        <h2>Why It Matters</h2>
        <p>We believe consistent spiritual and physical habits change lives. Daily Lift helps you:</p>
        <ul>
          <li>🌿 Build discipline with grace</li>
          <li>📖 Grow in your walk with God</li>
          <li>🏃‍♀️ Stay active with simple movement goals</li>
          <li>🤝 Be part of a loving, accountable community</li>
        </ul>
      </section>

      <section className="audience-section">
        <h2>Who Is It For?</h2>
        <ul>
          <li>👨‍👩‍👧 Busy moms and dads trying to squeeze in some self-care</li>
          <li>👯‍♀️ Friends who want to stay spiritually connected</li>
          <li>⛪ Small groups looking for daily accountability</li>
          <li>🕊️ Anyone seeking to honor God with their body and soul</li>
        </ul>
      </section>

      <section className="final-cta">
        <h2>Ready to Start?</h2>
        {!currentUser ? (
          <Link to="/signup" className="btn-primary">Get Started</Link>
        ) : (
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        )}
      </section>
    </main>
  );
};

export default HomePage;
