import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  PhoneCall,
  QrCode,
  CheckCircle2,
  FileCheck2,
  Users,
  HeartHandshake,
  Search,
} from 'lucide-react';

/**
 * FOTOGRAFÍAS INSTITUCIONALES REEMPLAZABLES:
 * Guarda tus fotos originales en `public/terreno/` con estos mismos nombres.
 */
const FOTOS_INSTITUCIONALES = {
  heroBg: {
    local: '/terreno/hero-bg.jpg',
    fallback:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=85',
    alt: 'Cordillera y zona agreste de operación ONG BRE Bío-Bío',
  },
  operativoBosque: {
    local: '/terreno/operativo-bosque.jpg',
    fallback:
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000&q=80',
    alt: 'Unidad de búsqueda y rescate terrestre en bosque',
  },
  reanimacion: {
    local: '/terreno/primeros-auxilios.jpg',
    fallback:
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=900&q=80',
    alt: 'Soporte vital básico y primeros auxilios en terreno',
  },
  cuerdasAltura: {
    local: '/terreno/rescate-altura.jpg',
    fallback:
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80',
    alt: 'Maniobras de cuerdas y rescate técnico en altura',
  },
};

/* Clases reutilizables de Bisel 3D Difuminado (Interior + Exterior suave, sin bordes duros) */
const BEVEL_CARD_WHITE =
  'bg-gradient-to-b from-white via-white to-neutral-50/90 border border-neutral-200/80 shadow-[inset_0_2px_4px_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.05),0_20px_45px_-12px_rgba(15,23,42,0.14),0_6px_16px_-4px_rgba(15,23,42,0.07)]';

const BEVEL_BTN_YELLOW =
  'bg-gradient-to-b from-[#FFD25A] via-[#F2B632] to-[#DDA018] text-[#0A0A0A] shadow-[inset_0_2px_3px_rgba(255,255,255,0.85),inset_0_-4px_8px_rgba(140,88,0,0.45),0_14px_28px_-6px_rgba(242,182,50,0.45),0_6px_12px_-3px_rgba(0,0,0,0.25)]';

const BEVEL_BTN_RED =
  'bg-gradient-to-b from-[#F01436] via-[#D90429] to-[#A3001B] text-white shadow-[inset_0_2px_3px_rgba(255,255,255,0.45),inset_0_-4px_8px_rgba(60,0,10,0.6),0_14px_28px_-6px_rgba(217,4,41,0.5),0_6px_12px_-3px_rgba(0,0,0,0.3)]';

/* Vectores de Especialidades fieles al Pendón Oficial */
const IconoBusqueda = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="15" r="4" />
    <circle cx="18" cy="15" r="4" />
    <path d="M10 15h4M5 11l2-6h3l1 4M19 11l-2-6h-3l-1 4" />
  </svg>
);

const IconoRescateTerreno = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" />
  </svg>
);

const IconoPrimerosAuxilios = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="18" height="13" rx="2.5" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M12 11v5M9.5 13.5h5" />
  </svg>
);

const IconoRescateAltura = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20L20 4" />
    <path d="M7 12c0-2.5 2-4.5 4.5-4.5S16 9.5 16 12s-2 4.5-4.5 4.5" />
    <path d="M17 12c0 2.5-2 4.5-4.5 4.5S8 14.5 8 12" />
  </svg>
);

const IconoEmergencias = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
    <path d="M2 19c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
  </svg>
);

/* Fondo Vectorial Táctico y Zona Agreste Difuminado sobre Blanco */
const FondoTacticoAgreste = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
    {/* Curvas de nivel topográficas y retícula SAR difuminada */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.045]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="sar-grid" width="90" height="90" patternUnits="userSpaceOnUse">
          <path d="M 90 0 L 0 0 0 90" fill="none" stroke="#0A0A0A" strokeWidth="0.9" />
          <circle cx="45" cy="45" r="1.5" fill="#D90429" />
        </pattern>
        <pattern id="topo-agreste" width="500" height="360" patternUnits="userSpaceOnUse">
          <path
            d="M0 90 C 140 30, 320 150, 500 90 M0 190 C 160 120, 310 260, 500 190 M0 290 C 120 230, 360 340, 500 290"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1.4"
            strokeDasharray="8 6"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sar-grid)" />
      <rect width="100%" height="100%" fill="url(#topo-agreste)" />
    </svg>

    {/* Luces volumétricas difuminadas para dar atmósfera 3D al fondo blanco */}
    <div className="absolute top-12 -left-32 w-[480px] h-[480px] rounded-full bg-red-600/[0.06] blur-[110px]" />
    <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-amber-400/[0.09] blur-[110px]" />
    <div className="absolute bottom-24 left-1/3 w-[520px] h-[320px] rounded-full bg-neutral-900/[0.04] blur-[100px]" />

    {/* Silueta de Cordillera y Bosque Agreste en la base */}
    <svg
      className="absolute bottom-0 left-0 w-full h-64 text-neutral-900/[0.04]"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      fill="currentColor"
    >
      <path d="M0,288L120,214L260,268L420,118L580,248L740,86L920,235L1100,108L1280,232L1440,152L1440,320L0,320Z" />
      <path
        d="M0,305L100,255L210,295L360,175L520,285L690,155L860,280L1040,170L1220,285L1370,205L1440,255L1440,320L0,320Z"
        className="text-[#D90429]/[0.035]"
      />
    </svg>
  </div>
);

export default function Home() {
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const navigate = useNavigate();

  const handleVerificarCredencial = (e) => {
    e.preventDefault();
    if (!codigoVerificacion.trim()) return;
    navigate(`/voluntario/${encodeURIComponent(codigoVerificacion.trim())}`);
  };

  const especialidades = [
    {
      titulo: 'Búsqueda',
      subtitulo: 'Rastreo Agreste y Urbano',
      descripcion:
        'Localización de personas extraviadas en territorios complejos, bosques, alta montaña y entornos naturales o urbanos.',
      icono: <IconoBusqueda />,
      acento: 'red',
    },
    {
      titulo: 'Rescate en Terreno',
      subtitulo: 'Despliegue Táctico',
      descripcion:
        'Extracción y evacuación técnica de víctimas en zonas de difícil acceso con equipamiento certificado y trabajo en equipo.',
      icono: <IconoRescateTerreno />,
      acento: 'yellow',
    },
    {
      titulo: 'Primeros Auxilios',
      subtitulo: 'Soporte Vital y Trauma',
      descripcion:
        'Atención prehospitalaria inmediata, estabilización de pacientes en el punto del incidente y apoyo sanitario.',
      icono: <IconoPrimerosAuxilios />,
      acento: 'red',
    },
    {
      titulo: 'Rescate en Altura',
      subtitulo: 'Sistemas de Cuerdas',
      descripcion:
        'Operaciones verticales en quebradas, laderas y estructuras mediante maniobras de descenso y tracción segura.',
      icono: <IconoRescateAltura />,
      acento: 'yellow',
    },
    {
      titulo: 'Emergencias y Desastres',
      subtitulo: 'Protección Civil',
      descripcion:
        'Respuesta rápida y asistencia humanitaria ante catástrofes naturales, inundaciones, incendios forestales y sismos.',
      icono: <IconoEmergencias />,
      acento: 'red',
    },
  ];

  return (
    <div className="bg-white text-[#0A0A0A] min-h-screen font-sans selection:bg-[#D90429] selection:text-white overflow-x-hidden">

      {/* =====================================================================
          1. HERO EXPANSIVO CON FOTOGRAFÍA EN BLANCO Y NEGRO Y BISEL DIFUMINADO
      ===================================================================== */}
      <section className="relative bg-[#0A0A0A] text-white overflow-hidden shadow-[inset_0_-10px_25px_rgba(0,0,0,0.8),0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        {/* Fotografía de fondo en Blanco y Negro */}
        <img
          src={FOTOS_INSTITUCIONALES.heroBg.local}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FOTOS_INSTITUCIONALES.heroBg.fallback;
          }}
          alt={FOTOS_INSTITUCIONALES.heroBg.alt}
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-35 pointer-events-none"
        />

        {/* Degradados volumétricos suaves */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/90 to-[#0A0A0A]/45 pointer-events-none" />
        <div className="hidden lg:block absolute top-0 right-0 w-[38%] h-full bg-gradient-to-b from-[#D90429]/35 via-[#B8001F]/30 to-transparent border-l border-white/15 transform -skew-x-12 translate-x-20 pointer-events-none backdrop-blur-[2px]" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* Columna Izquierda */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              {/* Píldora institucional con bisel interior/exterior */}
              <div className="inline-flex items-center gap-3 bg-gradient-to-b from-[#22262E] to-[#121418] px-4 py-2 rounded-2xl ring-1 ring-white/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-3px_6px_rgba(0,0,0,0.7),0_12px_25px_-5px_rgba(0,0,0,0.6)]">
                <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-b from-[#F01436] to-[#B8001F] text-white text-[11px] font-black uppercase tracking-widest shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]">
                  Ley N° 20.500
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-100">
                  O.N.G. de Prevención, Desarrollo y Protección Civil
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm sm:text-base font-black uppercase tracking-[0.28em] text-[#F2B632] drop-shadow-[0_2px_8px_rgba(242,182,50,0.3)]">
                  Búsqueda · Rescate · Emergencia
                </p>
                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-[1.02] text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
                  Preparados para responder,{' '}
                  <span className="text-[#F2B632] block mt-1 drop-shadow-[0_6px_20px_rgba(217,4,41,0.55)]">
                    comprometidos con la vida.
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-neutral-200 font-semibold leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Cuerpo especializado de voluntariado táctico al servicio de la comunidad. Operamos en estrecha colaboración con estamentos públicos y privados en áreas urbanas, rurales y zonas agrestes de difícil acceso.
              </p>

              {/* Botones con Bisel 3D Difuminado */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/postular"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 ${BEVEL_BTN_YELLOW}`}
                >
                  <span>¡Súmate a BRE Bío-Bío!</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </Link>

                <Link
                  to="/apoyo"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 ${BEVEL_BTN_RED}`}
                >
                  <PhoneCall size={17} strokeWidth={2.5} />
                  <span>Solicitar Apoyo</span>
                </Link>
              </div>

              {/* 4 Valores con Bisel Interior Suave */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                {['SERVIR', 'APOYAR', 'PREPARAR', 'SALVAR VIDAS'].map((valor) => (
                  <div
                    key={valor}
                    className="bg-gradient-to-b from-white/10 to-white/[0.03] backdrop-blur-sm border-l-4 border-[#D90429] px-3.5 py-2.5 rounded-r-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.18),inset_0_-3px_6px_rgba(0,0,0,0.5),0_8px_20px_-4px_rgba(0,0,0,0.45)]"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                      {valor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Táctica con Bisel Volumétrico Difuminado */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
              <div className="w-full max-w-md bg-gradient-to-b from-white via-white to-neutral-100 text-[#0A0A0A] rounded-3xl p-6 sm:p-7 ring-1 ring-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,1),inset_0_-6px_14px_rgba(0,0,0,0.08),0_30px_60px_-12px_rgba(0,0,0,0.75),0_0_35px_rgba(217,4,41,0.25)] relative overflow-hidden">

                {/* Barra superior rojo intenso biselada */}
                <div className={`px-4 py-2.5 rounded-2xl flex items-center justify-between mb-6 ${BEVEL_BTN_RED}`}>
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Unidad Operativa
                  </span>
                  <span className="bg-gradient-to-b from-[#FFD25A] to-[#F2B632] text-[#0A0A0A] px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.25)]">
                    Activa
                  </span>
                </div>

                {/* Escudo Oficial Fijo a 80x80px con cápsula biselada */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-full bg-white p-1.5 ring-2 ring-[#D90429]/30 shadow-[inset_0_2px_4px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(0,0,0,0.12),0_10px_25px_-5px_rgba(217,4,41,0.3)] flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src="/logo-bre.png"
                      alt="Escudo Oficial ONG BRE Bío-Bío"
                      width={70}
                      height={70}
                      className="w-full h-full max-w-[70px] max-h-[70px] object-contain block"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#D90429]">
                      O.N.G. Oficial
                    </p>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-[#0A0A0A] leading-none mt-0.5">
                      BRE BÍO-BÍO
                    </h2>
                    <p className="text-xs font-bold text-neutral-600 mt-1.5 leading-snug">
                      Personalidad Jurídica Ley N° 20.500 · Región del Biobío, despliegue nacional.
                    </p>
                  </div>
                </div>

                {/* Verificador de Credencial con sombra interior hundida (Bisel Inverso) */}
                <form
                  onSubmit={handleVerificarCredencial}
                  className="bg-neutral-100/90 rounded-2xl p-4 space-y-3 border border-neutral-200/80 shadow-[inset_0_3px_8px_rgba(0,0,0,0.08),inset_0_-1px_2px_rgba(255,255,255,0.9)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
                      <QrCode size={16} className="text-[#D90429]" strokeWidth={2.5} />
                      Validación de Credencial / QR
                    </span>
                    <span className="text-[10px] font-black uppercase bg-[#F2B632]/25 text-[#8A5A00] px-2.5 py-0.5 rounded-md">
                      Autoridades
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codigoVerificacion}
                      onChange={(e) => setCodigoVerificacion(e.target.value)}
                      placeholder="RUT o ID (Ej: BRE-0001)"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-bold text-[#0A0A0A] placeholder:text-neutral-400 shadow-[inset_0_2px_5px_rgba(0,0,0,0.06)] focus:ring-2 focus:ring-[#D90429]/30 focus:border-[#D90429] outline-none"
                    />
                    <button
                      type="submit"
                      className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 ${BEVEL_BTN_RED}`}
                    >
                      <Search size={14} strokeWidth={2.5} />
                      <span>Ver</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. FRANJA TÁCTICA AMARILLA CON BISEL DIFUMINADO
      ===================================================================== */}
      <section className="bg-gradient-to-b from-[#FFD25A] via-[#F2B632] to-[#E0A320] py-7 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-5px_12px_rgba(140,88,0,0.28),0_15px_35px_-10px_rgba(0,0,0,0.18)] relative z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`flex items-center gap-4 rounded-2xl p-4 ${BEVEL_CARD_WHITE}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${BEVEL_BTN_RED}`}>
                <Users size={23} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  Servicio a la Comunidad
                </p>
                <p className="text-xs font-bold text-neutral-600">
                  Prevención de riesgos y educación comunitaria
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-4 rounded-2xl p-4 ${BEVEL_CARD_WHITE}`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#23272F] to-[#0A0A0A] text-[#F2B632] shadow-[inset_0_2px_3px_rgba(255,255,255,0.25),inset_0_-3px_6px_rgba(0,0,0,0.8),0_8px_18px_-4px_rgba(0,0,0,0.4)] flex items-center justify-center shrink-0">
                <Shield size={23} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  Trabajo en Equipo
                </p>
                <p className="text-xs font-bold text-neutral-600">
                  Coordinación con estamentos públicos y privados
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-4 rounded-2xl p-4 ${BEVEL_CARD_WHITE}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${BEVEL_BTN_RED}`}>
                <HeartHandshake size={23} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  Vocación y Compromiso
                </p>
                <p className="text-xs font-bold text-neutral-600">
                  Profesionalismo y ética operativa certificada
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. CUERPO PRINCIPAL CON VECTORES TÁCTICOS / ZONA AGRESTE DIFUMINADOS
      ===================================================================== */}
      <div className="relative bg-white">
        <FondoTacticoAgreste />

        {/* SECCIÓN ESPECIALIDADES (5 Casillas con Bisel Volumétrico Difuminado) */}
        <section className="py-20 lg:py-24 relative z-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">

            <div className="flex flex-col items-center text-center mb-16">
              <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-2xl mb-4 ${BEVEL_BTN_RED}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-[#F2B632] shadow-[0_0_8px_#F2B632]" />
                <span className="text-xs font-black uppercase tracking-[0.25em]">
                  Nuestras Especialidades
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0A0A0A]">
                Ámbitos de Acción Institucional
              </h2>
              <p className="mt-3 max-w-2xl text-sm sm:text-base font-bold text-neutral-600">
                Unidades operativas entrenadas para intervenir en emergencias urbanas, rurales, alta montaña y desastres naturales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-7">
              {especialidades.map((item, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-3xl p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,1),inset_0_-5px_12px_rgba(217,4,41,0.08),0_28px_55px_-12px_rgba(217,4,41,0.22),0_10px_20px_-5px_rgba(15,23,42,0.1)] ${BEVEL_CARD_WHITE}`}
                >
                  {/* Luz superior biselada */}
                  <div
                    className={`
                      absolute top-0 inset-x-0 h-2.5 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]
                      ${item.acento === 'red'
                        ? 'bg-gradient-to-r from-[#F01436] via-[#D90429] to-[#A3001B]'
                        : 'bg-gradient-to-r from-[#FFD25A] via-[#F2B632] to-[#DDA018]'
                      }
                    `}
                  />

                  <div className="pt-2">
                    {/* Medallón con Bisel 3D Interno y Externo */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#23272F] to-[#0A0A0A] text-white ring-2 ring-[#F2B632]/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.25),inset_0_-4px_8px_rgba(0,0,0,0.85),0_12px_24px_-6px_rgba(0,0,0,0.45)] flex items-center justify-center mb-5 group-hover:from-[#F01436] group-hover:to-[#A3001B] transition-all duration-300">
                      {item.icono}
                    </div>

                    <span className="text-[11px] font-black uppercase tracking-widest text-[#D90429] block mb-1">
                      {item.subtitulo}
                    </span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-[#0A0A0A] mb-3">
                      {item.titulo}
                    </h3>
                    <p className="text-xs font-bold text-neutral-600 leading-relaxed">
                      {item.descripcion}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-neutral-700">
                    <span>Unidad Operativa</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D90429] shadow-[0_0_8px_rgba(217,4,41,0.6)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECCIÓN GALERÍA OPERATIVA Y RECLUTAMIENTO CON BISEL DIFUMINADO */}
        <section className="py-16 lg:py-24 relative z-10 border-t border-neutral-200/70">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

              {/* Mosaico Fotográfico con Sombra Difuminada y Bisel Interior */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div className="sm:col-span-2 relative rounded-3xl overflow-hidden ring-1 ring-black/10 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.28)] h-72 sm:h-80 group bg-neutral-900">
                  <img
                    src={FOTOS_INSTITUCIONALES.operativoBosque.local}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FOTOS_INSTITUCIONALES.operativoBosque.fallback;
                    }}
                    alt={FOTOS_INSTITUCIONALES.operativoBosque.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent shadow-[inset_0_2px_6px_rgba(255,255,255,0.25)]" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block ${BEVEL_BTN_RED}`}>
                      Operaciones Terrestres
                    </span>
                    <h4 className="text-xl font-black uppercase mt-2 drop-shadow-md">
                      Despliegue en Zonas Agrestes y Boscosas
                    </h4>
                  </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden ring-1 ring-black/10 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.24)] h-60 group bg-neutral-900">
                  <img
                    src={FOTOS_INSTITUCIONALES.reanimacion.local}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FOTOS_INSTITUCIONALES.reanimacion.fallback;
                    }}
                    alt={FOTOS_INSTITUCIONALES.reanimacion.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent shadow-[inset_0_2px_6px_rgba(255,255,255,0.2)]" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F2B632]">
                      Capacitación Continua
                    </span>
                    <p className="text-base font-black uppercase">
                      Soporte Vital y Trauma
                    </p>
                  </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden ring-1 ring-black/10 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.24)] h-60 group bg-neutral-900">
                  <img
                    src={FOTOS_INSTITUCIONALES.cuerdasAltura.local}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FOTOS_INSTITUCIONALES.cuerdasAltura.fallback;
                    }}
                    alt={FOTOS_INSTITUCIONALES.cuerdasAltura.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent shadow-[inset_0_2px_6px_rgba(255,255,255,0.2)]" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F2B632]">
                      Especialidad Vertical
                    </span>
                    <p className="text-base font-black uppercase">
                      Maniobras de Cuerdas y Altura
                    </p>
                  </div>
                </div>

              </div>

              {/* Tarjeta Biselada de Convocatoria ("¡SÚMATE A BRE BIO BIO!") */}
              <div className="lg:col-span-5">
                <div className="bg-gradient-to-b from-white via-white to-neutral-50 rounded-3xl p-8 sm:p-10 border border-neutral-200/90 shadow-[inset_0_2px_5px_rgba(255,255,255,1),inset_0_-6px_14px_rgba(217,4,41,0.06),0_28px_60px_-15px_rgba(15,23,42,0.2),0_10px_25px_-8px_rgba(217,4,41,0.12)] space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#D90429] via-[#F2B632] to-[#D90429]" />

                  <div className="inline-block bg-gradient-to-b from-[#23272F] to-[#0A0A0A] text-[#F2B632] px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_8px_16px_-4px_rgba(0,0,0,0.3)]">
                    Admisión de Voluntarios
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-[#0A0A0A]">
                    ¡Súmate a <span className="text-[#D90429]">BRE BÍO-BÍO!</span>
                  </h2>

                  <p className="text-sm font-extrabold uppercase tracking-wide text-[#0A0A0A]">
                    Tu vocación puede convertirse en acción. Pon tus capacidades al servicio de quienes más lo necesitan.
                  </p>

                  <p className="text-sm font-semibold text-neutral-600 leading-relaxed">
                    Intégrate como Voluntario Operativo o Colaborador Técnico. Todas las postulaciones y certificaciones son validadas por el Directorio Institucional.
                  </p>

                  <ul className="space-y-3 text-xs font-extrabold text-[#0A0A0A]">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={18} className="text-[#D90429] shrink-0" strokeWidth={2.5} />
                      <span>Credencial Oficial con verificación pública vía QR.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={18} className="text-[#D90429] shrink-0" strokeWidth={2.5} />
                      <span>Programas de entrenamiento y simulacros en terreno.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={18} className="text-[#D90429] shrink-0" strokeWidth={2.5} />
                      <span>Institución regida por el Título XXXIII del Código Civil y Ley N° 20.500.</span>
                    </li>
                  </ul>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
                    <Link
                      to="/postular"
                      className={`flex-1 inline-flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest py-4 px-6 rounded-2xl transition-all hover:-translate-y-0.5 ${BEVEL_BTN_RED}`}
                    >
                      <span>Postular Ahora</span>
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </Link>
                    <Link
                      to="/nosotros"
                      className={`inline-flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest py-4 px-5 rounded-2xl transition-all hover:-translate-y-0.5 ${BEVEL_BTN_YELLOW}`}
                    >
                      <FileCheck2 size={16} strokeWidth={2.5} />
                      <span>Estatutos</span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* BANNER INFERIOR CON BISEL 3D DIFUMINADO */}
        <section className="py-16 relative z-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="bg-gradient-to-r from-[#D90429] via-[#A8001C] to-[#0A0A0A] text-white rounded-3xl p-8 sm:p-12 shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),inset_0_-6px_16px_rgba(0,0,0,0.6),0_25px_55px_-12px_rgba(217,4,41,0.4)] flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center lg:text-left">
                <span className="inline-block bg-gradient-to-b from-[#FFD25A] to-[#F2B632] text-[#0A0A0A] px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.3)]">
                  Coordinación Operativa
                </span>
                <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight pt-1 drop-shadow">
                  ¿Requieres asistencia técnica o apoyo en terreno?
                </h3>
                <p className="text-sm font-bold text-white/90 max-w-2xl">
                  Enlace directo para SENAPRED, municipalidades, organismos públicos y comunidad ante situaciones de emergencia, búsqueda o prevención.
                </p>
              </div>

              <Link
                to="/apoyo"
                className={`shrink-0 inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5 ${BEVEL_BTN_YELLOW}`}
              >
                <PhoneCall size={18} strokeWidth={2.5} />
                <span>Solicitar Apoyo</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}