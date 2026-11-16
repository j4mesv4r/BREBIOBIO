import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-red-600 bg-black text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo y Nombre */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-red-600 bg-white font-bold">
            {/* Reemplazar con <img src="URL_LOGO" /> si está disponible */}
            <span className="text-center text-xs font-black leading-tight text-black">
              BRE
              <br />
              ONG
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-wider">
              BRE ONG
            </h1>
            <p className="text-[10px] font-semibold tracking-widest text-red-500">
              BÍO BÍO - CHILE
            </p>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden items-center gap-6 text-sm font-semibold tracking-wide md:flex">
          <Link to="/" className="transition-colors hover:text-red-500">
            INICIO
          </Link>
          <Link to="/nosotros" className="transition-colors hover:text-red-500">
            NOSOTROS
          </Link>
          <Link to="/postular" className="transition-colors hover:text-red-500">
            VOLUNTARIADO
          </Link>
          <Link
            to="/apoyo"
            className="rounded-full bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            SOLICITAR APOYO
          </Link>

          {/* Candado Acceso Interno */}
          <Link
            to="/login"
            className="ml-4 border-l border-gray-700 pl-4 text-gray-400 transition-colors hover:text-white"
            title="Acceso Miembros"
          >
            <Lock size={18} />
          </Link>
        </nav>

        {/* Menú Móvil Toggle */}
        <button
          className="text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir menú"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navegación Móvil */}
      {isOpen && (
        <div className="border-t border-gray-800 bg-gray-900 pb-4 md:hidden">
          <nav className="flex flex-col gap-4 px-4 pt-2 text-sm font-semibold">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block border-b border-gray-800 py-2 hover:text-red-500"
            >
              INICIO
            </Link>
            <Link
              to="/nosotros"
              onClick={() => setIsOpen(false)}
              className="block border-b border-gray-800 py-2 hover:text-red-500"
            >
              NOSOTROS
            </Link>
            <Link
              to="/postular"
              onClick={() => setIsOpen(false)}
              className="block border-b border-gray-800 py-2 hover:text-red-500"
            >
              VOLUNTARIADO
            </Link>
            <Link
              to="/apoyo"
              onClick={() => setIsOpen(false)}
              className="block border-b border-gray-800 py-2 text-red-500"
            >
              SOLICITAR APOYO
            </Link>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 py-2 text-gray-400 hover:text-white"
            >
              <Lock size={16} /> Acceso Interno
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
