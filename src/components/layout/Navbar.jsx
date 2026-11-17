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
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[#E60026] via-[#C8102E] to-[#9E001A] text-white shadow-[inset_0_2px_3px_rgba(255,255,255,0.35),inset_0_-4px_8px_rgba(0,0,0,0.4),0_15px_35px_-5px_rgba(0,0,0,0.45)] border-b-2 border-[#F2B632]/80">
      {/* Franja superior táctica con bisel interior */}
      <div className="bg-gradient-to-r from-[#0A0A0A] via-[#16181D] to-[#0A0A0A] text-white shadow-[inset_0_-2px_6px_rgba(0,0,0,0.8)] hidden md:block">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-8 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F2B632] shadow-[0_0_8px_#F2B632] animate-pulse" />
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

          {/* Identidad Oficial con cápsula biselada */}
          <Link to="/" className="flex shrink-0 items-center gap-3.5 group">
            <div className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] shrink-0 rounded-full bg-white p-0.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_6px_rgba(0,0,0,0.25),0_8px_20px_rgba(0,0,0,0.45)] overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/logo-bre.png"
                alt="Escudo Oficial O.N.G. BRE BÍO-BÍO"
                width={44}
                height={44}
                className="w-11 h-11 max-w-[44px] max-h-[44px] object-contain block"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
                ONG BRE <span className="text-[#F2B632]">BÍO-BÍO</span>
              </span>
              <span className="mt-1 text-[10px] font-extrabold uppercase leading-none tracking-[0.18em] text-white/95">
                Búsqueda · Rescate · Emergencia
              </span>
            </div>
          </Link>

          {/* Enlaces Desktop con bisel difuminado interior/exterior */}
          <nav className="hidden items-center gap-3 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-200 ${isActive(link.path)
                    ? 'bg-gradient-to-b from-[#1F2229] to-[#0A0A0A] text-[#F2B632] shadow-[inset_0_2px_3px_rgba(255,255,255,0.2),inset_0_-3px_6px_rgba(0,0,0,0.8),0_8px_20px_-4px_rgba(0,0,0,0.5)] ring-1 ring-[#F2B632]/50'
                    : 'text-white hover:bg-black/20 hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Botón ¡Súmate! + Icono de Candado con Bisel 3D */}
          <div className="hidden shrink-0 items-center gap-3.5 lg:flex">
            <Link
              to="/postular"
              className="rounded-2xl bg-gradient-to-b from-[#FFD05B] via-[#F2B632] to-[#D99B16] text-[#0A0A0A] px-5 py-2.5 text-xs font-black uppercase tracking-widest shadow-[inset_0_2px_3px_rgba(255,255,255,0.75),inset_0_-3px_6px_rgba(140,90,0,0.45),0_10px_22px_-4px_rgba(0,0,0,0.45)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              ¡Súmate!
            </Link>

            {user ? (
              <Link
                to="/mi-perfil"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-[#23272F] to-[#0A0A0A] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#F2B632] shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-3px_6px_rgba(0,0,0,0.7),0_10px_20px_-5px_rgba(0,0,0,0.5)] ring-1 ring-white/15 transition-all hover:-translate-y-0.5"
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
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b from-[#23272F] to-[#0A0A0A] text-[#F2B632] shadow-[inset_0_2px_3px_rgba(255,255,255,0.22),inset_0_-3px_6px_rgba(0,0,0,0.8),0_10px_20px_-4px_rgba(0,0,0,0.5)] ring-1 ring-white/20 hover:ring-[#F2B632]/70 hover:-translate-y-0.5 transition-all"
              >
                <Lock size={19} strokeWidth={2.5} />
              </Link>
            )}
          </div>

          {/* Controles Móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            {!user && (
              <Link
                to="/login"
                aria-label="Ingresar"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#23272F] to-[#0A0A0A] text-[#F2B632] shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_6px_15px_rgba(0,0,0,0.4)]"
              >
                <Lock size={18} strokeWidth={2.5} />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
              className="rounded-xl bg-black/30 p-2 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_6px_15px_rgba(0,0,0,0.35)]"
            >
              {mobileMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <div className="space-y-2 border-t border-white/15 bg-gradient-to-b from-[#14161A] to-[#0A0A0A] px-4 pb-6 pt-4 lg:hidden shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest ${isActive(link.path)
                  ? 'bg-gradient-to-r from-[#D90429] to-[#9E001A] text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]'
                  : 'text-neutral-200 hover:bg-white/5'
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