import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
}) => {
  const spinner = (
    <div className={`${sizeClasses[size]} border-4 border-dark-700 border-t-primary-500 rounded-full animate-spin`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-900 bg-opacity-50 z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center items-center">{spinner}</div>;
};

export default LoadingSpinner;
