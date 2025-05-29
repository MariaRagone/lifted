import React from 'react';
import './About.css';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const AboutPage: React.FC = () => {
  return (
    <div className="about-container">
      <Logo size={200}/>
      <h1 className="about-heading">📖 About Daily Lift</h1>
      <p className="about-subheading">
      Your daily devotional & fitness companion. Strengthen your faith, energize your body, and lift up your community.
      </p>
     

      <section className="about-section">
        <h2 className="section-title">What is Daily Lift?</h2>
        <ul className="section-list">
          <li><strong>🙏 Prayer:</strong> Start your day with guided fitness devotionals that strengthen your body and spirit.</li>
          <li><strong>🏅 Fitness Challenges:</strong> Follow short workouts or log your own.</li>
          <li><strong>🧘‍♀️ Rest Days:</strong> Enjoy intentional rest through prayer and reflection.</li>
          <li><strong>📊 Streak Tracking:</strong> Stay motivated with visual progress tracking.</li>
          <li><strong>💛 Lift Circles:</strong> Join groups to stay accountable and motivated and cheer each other on.</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="section-title">Why It Matters</h2>
        <p className="section-text">
          We believe consistent spiritual and physical habits change lives. Daily Lift helps you:
        </p>
        <ul className="section-bullets">
          <li>Build discipline with grace</li>
          <li>Grow in your walk with God</li>
          <li>Stay active with simple movement goals</li>
          <li>Be part of a loving, accountable community</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="section-title">Who Is It For?</h2>
        <ul className="section-bullets">
          <li>Busy moms and dads trying to squeeze in some self-care</li>
          <li>Friends who want to stay spiritually connected</li>
          <li>Small groups looking for daily accountability</li>
          <li>Anyone seeking to honor God with their body and soul</li>
        </ul>
      </section>

      <Link to="/login" className="btn-primary">
      Get Started
    </Link>
    </div>
  );
};

export default AboutPage;
