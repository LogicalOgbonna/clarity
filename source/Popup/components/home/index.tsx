import * as React from 'react';
import './styles.scss';

export const Home = (): React.ReactElement => {
  return (
    <React.Fragment>
      <div className="welcome-section">
        <span className="icon">💬</span>
        <div className="title">Welcome to Clarity</div>
        <div className="subtitle">Your AI-powered terms analyzer</div>
      </div>

      <ul className="feature-list">
        <li>
          <div className="feature-icon">📄</div>
          <div className="feature-text">Analyze Terms of Service</div>
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

/*
Create a folder called components, inside it, crete a folder called chat and inside it a file index.ts and styles.scss 

Using the information in localStore and sync storage (clarityID in sync storage) and chat_history_${clarityID} in localStoray, fetch the user chat history (consult @index.ts  for more information. 

Should should be an isolated implementation

In the @Popup.tsx file, display
*/
