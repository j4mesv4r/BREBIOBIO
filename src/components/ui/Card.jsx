export default function Card({ children, className = '', title }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && <h3 className="mb-3 text-base font-semibold text-slate-900">{title}</h3>}
      {children}
    </div>
  );
}

