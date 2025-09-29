import * as React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Loading...',
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: {
      spinner: 'loading-spinner-small',
      text: 'loading-text-small',
    },
    medium: {
      spinner: 'loading-spinner-medium',
      text: 'loading-text-medium',
    },
    large: {
      spinner: 'loading-spinner-large',
      text: 'loading-text-large',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`loading-container ${className}`}>
      <div className={currentSize.spinner} />
      {text && <div className={currentSize.text}>{text}</div>}
    </div>
  );
};
