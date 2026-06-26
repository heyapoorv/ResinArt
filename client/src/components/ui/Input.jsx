import { forwardRef } from 'react';

const Input = forwardRef(({
  label, error, className = '', type = 'text', ...props
}, ref) => (
  <div className="flex flex-col gap-xs">
    {label && (
      <label className="font-inter text-label-md text-on-surface-variant uppercase tracking-wider">
        {label}
      </label>
    )}
    <input
      ref={ref}
      type={type}
      className={`w-full bg-transparent border-b border-outline-variant
        focus:border-primary focus:outline-none transition-colors
        font-inter text-body-md py-sm placeholder:text-on-surface-variant/40
        ${error ? 'border-error' : ''} ${className}`}
      {...props}
    />
    {error && (
      <span className="font-inter text-caption text-error">{error}</span>
    )}
  </div>
));
Input.displayName = 'Input';
export default Input;
