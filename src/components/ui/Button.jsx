export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-[#C8202F] text-white hover:bg-[#a91926]',
    secondary: 'bg-[#17191D] text-white hover:bg-neutral-800',
    tactical: 'bg-[#F2B632] text-[#17191D] hover:bg-[#eab308]',
    outline:
      'border-2 border-[#17191D] bg-white text-[#17191D] hover:bg-neutral-100',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded px-5 py-2.5 text-sm font-bold tracking-wide transition-colors disabled:opacity-50 ${
        variants[variant] || variants.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
