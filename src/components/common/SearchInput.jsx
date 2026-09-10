import React from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({
  placeholder = "Search...",
  value,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6C9CF7] pointer-events-none">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent border border-[var(--border-secondary)] hover:border-white/20 text-white placeholder-gray-500 text-sm rounded-full py-3.5 pt-4 pl-12 pr-6 focus:outline-none focus:border-white/30 transition-colors"
        {...props}
      />
    </div>
  );
};

export default SearchInput;
