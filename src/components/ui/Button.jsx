export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-[#DC2626] text-white hover:bg-red-700',
    secondary: 'bg-[#1E3A8A] text-white hover:bg-blue-900',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

