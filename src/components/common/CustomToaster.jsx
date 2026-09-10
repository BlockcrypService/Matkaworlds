import React from 'react';
import { Toaster, ToastBar } from 'react-hot-toast';

const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--bg-panel)',
          color: '#fff',
          border: '1px solid var(--border-secondary)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          borderRadius: '16px',
          padding: '14px 20px',
          fontSize: '15px',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            border: '1px solid rgba(16, 185, 129, 0.3)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--color-danger)',
            secondary: '#fff',
          },
          style: {
            border: '1px solid rgba(255, 77, 79, 0.3)',
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div
              className={`flex items-center gap-3 transition-all duration-300 ease-out ${t.visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
                }`}
            >
              {icon}
              <div className="flex-1 text-white/90">{message}</div>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default CustomToaster;
