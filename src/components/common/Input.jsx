import React from 'react';

const Input = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  className = '',
  suffix,
  ...props
}) => {
  return (
    <div className="relative w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        className={`
          w-full bg-transparent border border-[var(--border-secondary)] 
          rounded-full py-3.5 pt-4 text-sm text-white placeholder-[var(--text-gray)] 
          outline-none focus:border-[var(--border-primary)] transition-colors
          pl-5 ${suffix ? 'pr-16' : 'pr-5'}
          ${className}
        `}
        {...props}
      />
      {suffix && (
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-gradient-2)]">
          {suffix}
        </span>
      )}
    </div>
  );
};

export default Input;
