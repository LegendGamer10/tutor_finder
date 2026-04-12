// Tutor card loading skeleton
export default function SkeletonCard() {
  return (
    <div className="tutor-card skeleton-card">
      <div className="tutor-card-header">
        <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton" style={{ height: 16, width: '60%' }} />
          <div className="skeleton" style={{ height: 13, width: '40%' }} />
        </div>
      </div>
      <div className="tutor-card-body">
        <div className="skeleton" style={{ height: 13, marginBottom: 14, width: '50%' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <div className="skeleton" style={{ height: 13, width: '70%' }} />
          <div className="skeleton" style={{ height: 13, width: '55%' }} />
          <div className="skeleton" style={{ height: 13, width: '45%' }} />
        </div>
        <div className="skeleton" style={{ height: 22, width: '35%' }} />
      </div>
      <div className="tutor-card-footer" style={{ gap: 8 }}>
        <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />
        <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />
      </div>
    </div>
  );
}
