export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const variants = {
    primary:
      'border-2 border-[#17191D] bg-[#C8202F] text-white shadow-[3px_3px_0px_0px_#17191D] hover:bg-[#a91926]',
    secondary:
      'border-2 border-[#17191D] bg-[#17191D] text-white shadow-[3px_3px_0px_0px_#C8202F] hover:bg-neutral-800',
    tactical:
      'border-2 border-[#17191D] bg-[#F2B632] text-[#17191D] shadow-[3px_3px_0px_0px_#17191D] hover:bg-[#eab308]',
    outline:
      'border-2 border-[#17191D] bg-white text-[#17191D] shadow-[3px_3px_0px_0px_#17191D] hover:bg-[#F3F4F6]',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all active:translate-y-0.5 disabled:opacity-50 ${
        variants[variant] || variants.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
