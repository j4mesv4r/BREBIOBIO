export default function Card({ children, className = '', title }) {
  return (
    <div
      className={`sombra-volumetrica-clara rounded-xl border-2 border-[#17191D] bg-white p-6 ${className}`}
    >
      {title && (
        <h3 className="mb-4 border-l-4 border-[#C8202F] pl-3 text-base font-black uppercase tracking-tight text-[#17191D]">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
