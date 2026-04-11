import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  isTextArea?: boolean;
  rows?: number;
}

export const Input: React.FC<InputProps> = ({ label, error, isTextArea, className = '', ...props }) => {
  const Component = isTextArea ? 'textarea' : 'input';
  
  return (
    <div className="w-full space-y-1">
      {label && <label className="block text-sm font-semibold text-gray-700">{label}</label>}
      <Component
        className={`
          w-full px-4 py-2 border rounded-lg outline-none transition-all duration-200
          ${error ? 'border-red-500' : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}
          ${className}
        `}
        {...(props as any)}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
