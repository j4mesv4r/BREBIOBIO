import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Lock, UserCheck } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[#E60026] to-[#B8001F] text-white shadow-[0_12px_30px_rgba(0,0,0,0.45)] border-b-4 border-[#F2B632]">
      {/* Barra superior táctica */}
      <div className="bg-[#0A0A0A] text-white border-b border-white/10 hidden md:block">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-8 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F2B632] animate-pulse" />
            <span>O.N.G. BRE BÍO-BÍO · Ley N° 20.500</span>
          </div>
          <div className="flex items-center gap-5 text-neutral-300">
            <span>SERVIR · APOYAR · PREPARAR · SALVAR VIDAS</span>
            <span className="text-[#F2B632] font-black">BIOBÍO - CHILE</span>
          </div>
        </div>
      </div>

      {/* Contenedor Expansivo */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex h-20 items-center justify-between gap-4">

          {/* Identidad Oficial con tamaño de logo estrictamente bloqueado */}
          <Link to="/" className="flex shrink-0 items-center gap-3.5 group">
            <div className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] shrink-0 rounded-full border-2 border-white bg-white p-0.5 shadow-[0_4px_0_#0A0A0A,0_8px_15px_rgba(0,0,0,0.4)] overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/logo-bre.png"
                alt="Escudo Oficial O.N.G. BRE BÍO-BÍO"
                width={44}
                height={44}
                className="w-11 h-11 max-w-[44px] max-h-[44px] object-contain block"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                ONG BRE <span className="text-[#F2B632]">BÍO-BÍO</span>
              </span>
              <span className="mt-1 text-[10px] font-extrabold uppercase leading-none tracking-[0.18em] text-white/95">
                Búsqueda · Rescate · Emergencia
              </span>
            </div>
          </Link>

          {/* Enlaces Desktop con efecto 3D */}
          <nav className="hidden items-center gap-2.5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${isActive(link.path)
                    ? 'bg-[#0A0A0A] text-[#F2B632] border-2 border-[#F2B632] shadow-[0_4px_0_#000000] -translate-y-0.5'
                    : 'text-white hover:bg-black/25 hover:shadow-inner'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Zona Derecha: Botón 3D + Candado Intranet */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <Link
              to="/postular"
              className="rounded-xl bg-[#F2B632] hover:bg-[#ffbe3b] text-[#0A0A0A] border-2 border-[#0A0A0A] border-b-4 px-5 py-2.5 text-xs font-black uppercase tracking-widest shadow-[0_4px_0_#0A0A0A] active:translate-y-0.5 transition-all"
            >
              ¡Súmate!
            </Link>

            {user ? (
              <Link
                to="/mi-perfil"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#F2B632] border-2 border-[#F2B632] shadow-[0_4px_0_#000] transition-all hover:bg-neutral-900"
                title="Mi Panel Operativo"
              >
                <UserCheck size={18} strokeWidth={2.5} />
                <span>{profile?.nombre_completo?.split(' ')[0] || 'Mi Perfil'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                aria-label="Ingresar a Intranet"
                title="Acceso Intranet"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A0A0A] text-[#F2B632] border-2 border-[#F2B632] shadow-[0_4px_0_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <Lock size={19} strokeWidth={2.5} />
              </Link>
            )}
          </div>

          {/* Botones Móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            {!user && (
              <Link
                to="/login"
                aria-label="Ingresar"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A0A0A] text-[#F2B632] border-2 border-[#F2B632] shadow-[0_3px_0_#000]"
              >
                <Lock size={18} strokeWidth={2.5} />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
              className="rounded-xl bg-[#0A0A0A] border-2 border-white/30 p-2 text-white shadow-[0_3px_0_#000]"
            >
              {mobileMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <div className="space-y-2 border-t-2 border-[#F2B632] bg-[#0A0A0A] px-4 pb-6 pt-4 lg:hidden shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest ${isActive(link.path)
                  ? 'bg-[#D90429] text-white border-l-4 border-[#F2B632]'
                  : 'text-neutral-200 hover:bg-neutral-900'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}