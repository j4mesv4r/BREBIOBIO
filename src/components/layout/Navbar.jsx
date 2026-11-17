import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Menu, X, ChevronRight, UserCheck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Institución y Estatutos', path: '/nosotros' },
    { name: 'Solicitar Apoyo', path: '/apoyo' },
    { name: 'Postulación', path: '/postular' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[#C8202F] bg-[#17191D] shadow-xl shadow-black/30">
      {/* Franja Superior de Respaldo Legal */}
      <div className="hidden border-b border-neutral-800 bg-black/40 md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-xs font-semibold tracking-wide text-neutral-300 sm:px-6 lg:px-8">
          <span>O.N.G. BRE BIO BIO · Personalidad Jurídica Ley N° 20.500</span>
          <span className="text-[#F2B632]">
            Región del Biobío · Despliegue Nacional
          </span>
        </div>
      </div>

      {/* Navegación Principal */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Identidad Oficial */}
          <Link to="/" className="flex shrink-0 items-center gap-3.5">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-800 bg-white shadow-md">
              <img
                src="/logo-bre.png"
                alt="Escudo Oficial O.N.G. BRE BIO BIO"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden h-full w-full flex-col items-center justify-center bg-white text-[11px] font-black leading-none text-black">
                <span>ONG</span>
                <span className="text-red-600">BRE</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-black uppercase leading-none tracking-tight text-white sm:text-xl">
                ONG BRE <span className="text-red-600">BIO BIO</span>
              </span>
              <span className="mt-1 text-[11px] font-extrabold uppercase leading-none tracking-[0.16em] text-amber-400">
                Búsqueda · Rescate · Emergencia
              </span>
            </div>
          </Link>

          {/* Enlaces Desktop */}
          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`border-b-2 py-2 text-xs font-extrabold uppercase tracking-wider transition-colors ${
                  isActive(link.path)
                    ? 'border-amber-400 text-white'
                    : 'border-transparent text-neutral-300 hover:border-neutral-600 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Botones de Acción */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {user ? (
              <Link
                to="/mi-perfil"
                className="inline-flex items-center gap-2 rounded border-2 border-neutral-700 bg-neutral-900 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors hover:bg-neutral-800"
              >
                <UserCheck size={16} className="text-amber-400" />
                <span>
                  {profile?.nombre_completo?.split(' ')[0] || 'Mi Panel'}
                </span>
                <ChevronRight size={15} className="text-neutral-400" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded border-2 border-neutral-700 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:border-white"
                >
                  Intranet
                </Link>
                <Link
                  to="/apoyo"
                  className="inline-flex items-center gap-2 rounded bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/60 transition-colors hover:bg-red-700"
                >
                  <ShieldAlert size={16} />
                  <span>Solicitar Apoyo</span>
                </Link>
              </>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
            className="rounded p-2 text-white transition-colors hover:bg-neutral-800 lg:hidden"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="space-y-2 border-t border-neutral-800 bg-neutral-950 px-4 pb-6 pt-3 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded px-4 py-3 text-xs font-black uppercase tracking-wider ${
                isActive(link.path)
                  ? 'bg-red-600 text-white'
                  : 'text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="grid grid-cols-1 gap-2.5 border-t border-neutral-800 pt-3">
            {user ? (
              <Link
                to="/mi-perfil"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded bg-amber-400 py-3 text-xs font-black uppercase tracking-wider text-black"
              >
                <UserCheck size={16} /> Ir a Mi Panel
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded border-2 border-neutral-700 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-white"
                >
                  Acceso Intranet
                </Link>
                <Link
                  to="/apoyo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded bg-red-600 py-3 text-xs font-black uppercase tracking-wider text-white"
                >
                  <ShieldAlert size={16} /> Solicitar Apoyo Técnico
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
