import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Menu, X, ChevronRight, UserCheck, Radio } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Institución y Estatutos', path: '/nosotros' },
    { name: 'Solicitar Apoyo Técnico', path: '/apoyo' },
    { name: 'Postulación Voluntariado', path: '/postular' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 py-3 shadow-2xl'
          : 'bg-gradient-to-b from-black/90 via-black/70 to-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Marca e Identidad */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative w-12 h-12 rounded-full bg-white p-0.5 border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.45)] group-hover:scale-105 transition-transform">
              <img
                src="/logo-bre.png"
                alt="Escudo Oficial BRE ONG"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full bg-zinc-900 rounded-full items-center justify-center text-white font-black text-xs">
                BRE
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-xl tracking-wider uppercase">
                  BRE <span className="text-red-600">BIOBÍO</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-red-600/20 text-red-400 border border-red-600/30">
                  <Radio size={10} className="animate-pulse" /> ONG Oficial
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-semibold tracking-widest uppercase">
                Búsqueda · Rescate · Emergencia
              </p>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold tracking-wide transition-colors relative py-1 ${isActive(link.path)
                    ? 'text-white'
                    : 'text-zinc-300 hover:text-white'
                  }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Acciones Corporativas */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link
                to="/mi-perfil"
                className="flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg"
              >
                <UserCheck size={17} className="text-emerald-400" />
                <span>{profile?.nombre_completo?.split(' ')[0] || 'Mi Panel'}</span>
                <ChevronRight size={15} className="text-zinc-400" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-zinc-300 hover:text-white px-4 py-2.5 text-sm font-bold transition-colors"
                >
                  Intranet Miembros
                </Link>
                <Link
                  to="/apoyo"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-extrabold tracking-wide uppercase shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.65)] transition-all"
                >
                  <ShieldAlert size={17} />
                  <span>Activación / Apoyo</span>
                </Link>
              </>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-4 pb-6 space-y-3 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-bold ${isActive(link.path)
                  ? 'bg-red-600/15 text-red-500 border border-red-600/30'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2.5">
            {user ? (
              <Link
                to="/mi-perfil"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm"
              >
                <UserCheck size={18} /> Ir a Mi Panel Operativo
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-lg border border-zinc-700 text-white font-bold text-sm"
                >
                  Acceso Intranet
                </Link>
                <Link
                  to="/apoyo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-extrabold text-sm uppercase"
                >
                  <ShieldAlert size={18} /> Solicitar Apoyo Técnico
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}