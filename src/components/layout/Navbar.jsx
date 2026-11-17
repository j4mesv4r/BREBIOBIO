import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, UserCheck, UserPlus } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Institución', path: '/nosotros' },
    { name: 'Apoyo', path: '/apoyo' },
    { name: 'Postular', path: '/postular' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#C8202F] text-white shadow-xl border-b-4 border-[#F2B632]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">

          {/* Identidad Oficial */}
          <Link to="/" className="flex shrink-0 items-center gap-3.5 group">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-md">
              <img
                src="/logo-bre.png"
                alt="Escudo Oficial O.N.G. BRE BIO BIO"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-black uppercase leading-none tracking-tight text-white sm:text-xl">
                ONG BRE <span className="text-[#F2B632]">BIO BIO</span>
              </span>
              <span className="mt-1 text-[10px] font-black uppercase leading-none tracking-[0.16em] text-neutral-100">
                Búsqueda · Rescate · Emergencia[cite: 16]
              </span>
            </div>
          </Link>

          {/* Enlaces Desktop (Letras blancas, negrita y contenedor redondeado) */}
          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all ${isActive(link.path)
                    ? 'bg-black text-[#F2B632] shadow-inner border border-[#F2B632]/50'
                    : 'text-white hover:bg-black/20'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Botones de Acción (Amarillo táctico y negro) */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {user ? (
              <Link
                to="/mi-perfil"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#F2B632] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-md transition-all hover:bg-[#e0a628] border-2 border-black"
              >
                <UserCheck size={18} strokeWidth={2.5} />
                <span>{profile?.nombre_completo?.split(' ')[0] || 'Mi Panel'}</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl bg-black/30 hover:bg-black/50 border border-white/40 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-all shadow-sm"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#F2B632] hover:bg-[#e0a628] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-md border-2 border-black transition-all"
                >
                  <UserPlus size={18} strokeWidth={2.5} />
                  <span>Registrarse</span>
                </Link>
              </>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
            className="rounded-xl p-2 text-white transition-colors hover:bg-black/20 lg:hidden"
          >
            {mobileMenuOpen ? <X size={26} strokeWidth={2.5} /> : <Menu size={26} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="space-y-2 border-t border-white/20 bg-[#a61924] px-4 pb-6 pt-3 lg:hidden shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider ${isActive(link.path)
                  ? 'bg-black text-[#F2B632]'
                  : 'text-white hover:bg-black/20'
                }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="grid grid-cols-1 gap-2.5 border-t border-white/20 pt-3">
            {user ? (
              <Link
                to="/mi-perfil"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F2B632] py-3 text-xs font-black uppercase tracking-wider text-black border-2 border-black"
              >
                <UserCheck size={18} strokeWidth={2.5} /> Mi Panel
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-2xl bg-black/40 py-3 text-center text-xs font-black uppercase tracking-wider text-white"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F2B632] py-3 text-xs font-black uppercase tracking-wider text-black border-2 border-black"
                >
                  <UserPlus size={18} strokeWidth={2.5} /> Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}