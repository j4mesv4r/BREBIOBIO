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
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[#E60026] via-[#C8102E] to-[#A3001B] text-white shadow-[inset_0_2px_3px_rgba(255,255,255,0.35),inset_0_-4px_8px_rgba(0,0,0,0.35),0_12px_30px_-4px_rgba(0,0,0,0.4)] border-b-[3px] border-[#F2B632]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex h-20 items-center justify-between gap-6">

          {/* Identidad Oficial (Logo fijo en 48x48px) */}
          <Link to="/" className="flex shrink-0 items-center gap-3.5 group">
            <div className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] shrink-0 rounded-full bg-white p-0.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_6px_rgba(0,0,0,0.25),0_6px_16px_rgba(0,0,0,0.4)] overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/logo-bre.png"
                alt="Escudo Oficial O.N.G. BRE BÍO-BÍO"
                width={44}
                height={44}
                className="w-11 h-11 max-w-[44px] max-h-[44px] object-contain block"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                ONG BRE <span className="text-[#F2B632]">BÍO-BÍO</span>
              </span>
              <span className="mt-1 text-[11px] font-bold uppercase leading-none tracking-wider text-white/95">
                Búsqueda · Rescate · Emergencia
              </span>
            </div>
          </Link>

          {/* Enlaces Desktop con Tipografía Clara y Corporativa */}
          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-xl px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide transition-all duration-200 ${isActive(link.path)
                    ? 'bg-gradient-to-b from-[#1F2229] to-[#0A0A0A] text-[#F2B632] shadow-[inset_0_2px_3px_rgba(255,255,255,0.2),inset_0_-3px_6px_rgba(0,0,0,0.8),0_6px_16px_-3px_rgba(0,0,0,0.45)] ring-1 ring-[#F2B632]/70'
                    : 'text-white hover:bg-white/15 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Zona Derecha: Botón ¡Súmate! + Candado Intranet */}
          <div className="hidden shrink-0 items-center gap-3.5 lg:flex">
            <Link
              to="/postular"
              className="rounded-xl bg-gradient-to-b from-[#FFD460] via-[#F2B632] to-[#DDA018] text-[#0A0A0A] px-6 py-2.5 text-sm font-black uppercase tracking-wide shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),inset_0_-3px_6px_rgba(140,90,0,0.4),0_8px_20px_-4px_rgba(0,0,0,0.4)] hover:brightness-105 hover:-translate-y-0.5 transition-all"
            >
              ¡Súmate!
            </Link>

            {user ? (
              <Link
                to="/mi-perfil"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#23272F] to-[#0A0A0A] px-4 py-2.5 text-sm font-bold text-[#F2B632] shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-3px_6px_rgba(0,0,0,0.7),0_8px_18px_-4px_rgba(0,0,0,0.5)] ring-1 ring-white/20 transition-all hover:-translate-y-0.5"
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
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#23272F] to-[#0A0A0A] text-[#F2B632] shadow-[inset_0_2px_3px_rgba(255,255,255,0.22),inset_0_-3px_6px_rgba(0,0,0,0.8),0_8px_18px_-4px_rgba(0,0,0,0.5)] ring-1 ring-white/25 hover:ring-[#F2B632] hover:-translate-y-0.5 transition-all"
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
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#23272F] to-[#0A0A0A] text-[#F2B632] shadow-md"
              >
                <Lock size={18} strokeWidth={2.5} />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
              className="rounded-xl bg-black/30 p-2 text-white shadow-md"
            >
              {mobileMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <div className="space-y-1.5 border-t border-white/20 bg-gradient-to-b from-[#16191E] to-[#0A0A0A] px-4 pb-6 pt-3 lg:hidden shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-xl px-4 py-3 text-sm font-extrabold uppercase tracking-wide ${isActive(link.path)
                  ? 'bg-gradient-to-r from-[#D90429] to-[#9E001A] text-white'
                  : 'text-neutral-100 hover:bg-white/10'
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