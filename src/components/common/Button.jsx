import React from 'react';
import { ChevronRight } from 'lucide-react';

const Button = ({ children, isIcon = true, className = '', ...props }) => {
  return (
    <button
      className={`group relative flex items-center md:text-sm text-[14px] justify-center w-fit bg-[#f4f7fb] hover:bg-white text-[var(--color-primary)] font-bold px-6 cursor-pointer md:py-3.5 py-3 rounded-full transition-all duration-500 ease-out hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] hover:text-[#1a1e2b] overflow-hidden ${className}`}
      {...props}
    >
      {!isIcon && <span className="pt-1">{children}</span>}
      {isIcon &&
        <div className="relative flex items-center whitespace-nowrap transition-transform duration-500 ease-out group-hover:-translate-x-3">
          <span className="pt-1">{children}</span>
          <div className="absolute left-full ml-3 flex opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 items-center justify-center">
            <ChevronRight size={20} className="stroke-[3] shrink-0 -translate-x-4 group-hover:translate-x-0 transition-transform duration-500 ease-out" />
          </div>
        </div>
      }
    </button>
  );
};

export default Button;
