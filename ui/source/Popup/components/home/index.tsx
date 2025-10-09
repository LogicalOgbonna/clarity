import * as React from 'react';
import './styles.scss';

export const Home = (): React.ReactElement => {
  return (
    <React.Fragment>
      <div className="welcome-section">
        <span className="icon">💬</span>
        <div className="title">Welcome to Clarity</div>
        <div className="subtitle">Making the internet transparent, one privacy policy at a time</div>
      </div>

      <ul className="feature-list">
        <li>
          <div className="feature-icon">📄</div>
          <div className="feature-text">Analyze ToS and Privacy Policy</div>
        </li>
        <li>
          <div className="feature-icon">🔍</div>
          <div className="feature-text">Get instant summaries</div>
        </li>
        <li>
          <div className="feature-icon">🌐</div>
          <div className="feature-text">Multi-language support</div>
        </li>
        <li>
          <div className="feature-icon">💾</div>
          <div className="feature-text">Save chat history</div>
        </li>
      </ul>
    </React.Fragment>
  );
};
