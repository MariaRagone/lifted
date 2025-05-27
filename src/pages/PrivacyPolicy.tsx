import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{ maxWidth: '700px', marginBottom: '40px', fontFamily: 'sans-serif', lineHeight: 1.6, padding: '2rem' }}>
      <h1>Privacy Policy for Daily Lift</h1>

      <p><strong>Effective Date:</strong> May 25, 2025</p>

      <p>
        Daily Lift respects your privacy. This policy outlines how we collect, use, and protect your information when using our application.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>Your Google account basic profile (name, email, photo) when signing in</li>
        <li>Fitness data (like steps) from Google Fit, only with your explicit permission</li>
        <li>Your devotional and fitness check-in status</li>
      </ul>

      <h2>2. How We Use Your Data</h2>
      <p>
        We use your data only to support the functionality of the app — including tracking your daily progress, displaying group participation, and showing fitness stats.
      </p>

      <h2>3. Data Sharing</h2>
      <p>
        We do not sell, share, or transfer your personal data to third parties. Data is stored securely using Firebase services.
      </p>

      <h2>4. Your Consent</h2>
      <p>
        By using the app and connecting Google Fit, you consent to the access and use of your data as described here.
      </p>

      <h2>5. Contact</h2>
      <p>
        If you have any questions about this policy, please contact us at{' '}
        <a href="mailto:mariaaksmith@gmail.com">mariaaksmith@gmail.com</a>.
      </p>

      <p>
        This policy may be updated from time to time and changes will be reflected on this page.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
