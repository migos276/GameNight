import React from 'react';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => {
  return (
    <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex justify-between items-center animate-fadeIn">
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-300 hover:text-red-100 text-xl leading-none font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
