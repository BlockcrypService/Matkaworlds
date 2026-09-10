import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
};

export const Thead = ({ children, className = '' }) => (
  <thead className={`${className}`}>
    {children}
  </thead>
);

export const Tbody = ({ children, className = '' }) => (
  <tbody className={`${className}`}>
    {children}
  </tbody>
);

export const Tr = ({ children, className = '' }) => (
  <tr className={`hover:bg-white/[0.02] transition-colors border-b border-[var(--border-secondary)] last:border-b-0 ${className}`}>
    {children}
  </tr>
);

export const Th = ({ children, className = '', ...props }) => (
  <th className={`py-6 px-6 font-medium text-[var(--text-gray)] bg-[#0E1025] text-sm whitespace-nowrap border-b border-[var(--border-secondary)] ${className}`} {...props}>
    {children}
  </th>
);

export const Td = ({ children, className = '', ...props }) => (
  <td className={`py-4 px-6 text-sm whitespace-nowrap ${className}`} {...props}>
    {children}
  </td>
);

export default Table;
