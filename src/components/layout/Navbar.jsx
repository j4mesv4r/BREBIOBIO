import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Lock, UserCheck, Shield } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-[#C8202F] text-white shadow-2xl border-b-4 border-[#F2B632]">
      {/* Franja superior táctica negra */}
      <div className="bg-[#0A0A0A] text-white border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F2B632] animate-pulse" />
            <span>O.N.G. BRE BÍO-BÍO · Ley N° 20.500</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-300">
            <span>SERVIR · APOYAR · PREPARAR · SALVAR VIDAS</span>
            <span className="text-[#F2B632] font-black">BIOBÍO - CHILE</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">

          {/* Identidad Oficial */}
          <Link to="/" className="flex shrink-0 items-center gap-3.5 group">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white p-0.5 shadow-lg group-hover:border-[#F2B632] transition-colors">
              <img
                src="/logo-bre.png"
                alt="Escudo Oficial O.N.G. BRE BÍO-BÍO"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-black uppercase leading-none tracking-tight text-white">
                ONG BRE <span className="text-[#F2B632]">BÍO-BÍO</span>
              </span>
              <span className="mt-1 text-[10px] font-extrabold uppercase leading-none tracking-[0.18em] text-white/90">
                Búsqueda · Rescate · Emergencia
              </span>
            </div>
          </Link>

          {/* Enlaces Desktop (1 palabra, bold, alto contraste) */}
          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${isActive(link.path)
                    ? 'bg-[#0A0A0A] text-[#F2B632] shadow-lg border-2 border-[#F2B632]'
                    : 'text-white hover:bg-black/25'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Acceso Intranet: Icono de Candado Discreto y Táctico */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <Link
              to="/postular"
              className="rounded-xl bg-[#F2B632] hover:bg-[#e0a829] text-[#0A0A0A] border-2 border-[#0A0A0A] px-5 py-2.5 text-xs font-black uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5"
            >
              ¡Súmate!
            </Link>

            {user ? (
              <Link
                to="/mi-perfil"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#F2B632] border-2 border-[#F2B632] shadow-md transition-all hover:bg-neutral-900"
                title="Mi Panel Operativo"
              >
                <UserCheck size={18} strokeWidth={2.5} />
                <span>{profile?.nombre_completo?.split(' ')[0] || 'Mi Perfil'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                aria-label="Ingresar a Intranet"
                title="Acceso Interno / Intranet"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A0A0A] text-[#F2B632] border-2 border-white/40 hover:border-[#F2B632] shadow-lg transition-all hover:scale-105"
              >
                <Lock size={19} strokeWidth={2.5} />
              </Link>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            {!user && (
              <Link
                to="/login"
                aria-label="Ingresar"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A0A0A] text-[#F2B632] border border-white/30"
              >
                <Lock size={18} strokeWidth={2.5} />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
              className="rounded-xl bg-black/25 p-2 text-white hover:bg-black/40"
            >
              {mobileMenuOpen ? <X size={26} strokeWidth={2.5} /> : <Menu size={26} strokeWidth={2.5} />}
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
                  ? 'bg-[#C8202F] text-white border-l-4 border-[#F2B632]'
                  : 'text-neutral-200 hover:bg-neutral-900'
                }`}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <Link
              to="/mi-perfil"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F2B632] py-3 text-xs font-black uppercase tracking-widest text-black"
            >
              <UserCheck size={18} strokeWidth={2.5} /> Mi Perfil
            </Link>
          )}
        </div>
      )}
    </header>
  );
}