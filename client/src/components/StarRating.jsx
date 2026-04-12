export default function StarRating({ rating = 0, max = 5, size = 'sm', interactive = false, onChange }) {
  const filled  = Math.floor(rating);
  const hasHalf = rating - filled >= 0.4;
  const empty   = max - filled - (hasHalf ? 1 : 0);

  if (interactive) {
    return (
      <div className="stars" style={{ fontSize: size === 'lg' ? '22px' : '16px', cursor: 'pointer' }}>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`star ${i < Math.round(rating) ? 'filled' : 'empty'}`}
            onClick={() => onChange && onChange(i + 1)}
            style={{ cursor: 'pointer' }}
          >★</span>
        ))}
      </div>
    );
  }

  return (
    <div className="stars">
      {Array.from({ length: filled }, (_, i) => (
        <span key={`f${i}`} className="star filled">★</span>
      ))}
      {hasHalf && <span className="star half">½</span>}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e${i}`} className="star empty">★</span>
      ))}
    </div>
  );
}
