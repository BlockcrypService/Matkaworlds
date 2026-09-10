import toast from 'react-hot-toast';

export const showToast = (message, type = "error") => {
  const borderColor = type === 'success' ? 'var(--bg-active-button)' : 'var(--color-danger)';

  toast.custom((t) => (
    <div
      className={`tech-card ${t.visible ? 'animate-enter' : 'animate-leave'}`}
      style={{
        padding: '15px 30px 12px 10px',
        minWidth: '350px',
        display: 'flex',
        borderRadius: "100px",
        gap: '16px',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        background: 'var(--bg-panel)',
        border: `1px solid ${borderColor}`
      }}
    >
      <span className="card-corners"></span>
      <div style={{ fontSize: '20px', flexShrink: 0 }}>
        {type === 'success' ? '✅' : '⚠️'}
      </div>
      <div>
        <p className="mb-0" style={{ color: "white", fontSize: '14px', lineHeight: '1.4' }}>
          {message}
        </p>
      </div>
    </div>
  ), { position: 'top-right', duration: 3000 });
};
