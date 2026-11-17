export default function Card({ children, className = '', title }) {
  return (
    <div
      className={`rounded-lg border-2 border-[#17191D] bg-white p-6 shadow-[6px_6px_0px_0px_#17191D] ${className}`}
    >
      {title && (
        <h3 className="mb-3 text-base font-black tracking-tight text-[#17191D]">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
