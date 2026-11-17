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
 * Guarda tus fotos en `public/terreno/` con estos nombres cuando las tengas listas.
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

/* Vectores de Especialidades fieles al Pendón Oficial */
const IconoBusqueda = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="15" r="4" />
    <circle cx="18" cy="15" r="4" />
    <path d="M10 15h4M5 11l2-6h3l1 4M19 11l-2-6h-3l-1 4" />
  </svg>
);

const IconoRescateTerreno = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" />
  </svg>
);

const IconoPrimerosAuxilios = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="18" height="13" rx="2.5" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M12 11v5M9.5 13.5h5" />
  </svg>
);

const IconoRescateAltura = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20L20 4" />
    <path d="M7 12c0-2.5 2-4.5 4.5-4.5S16 9.5 16 12s-2 4.5-4.5 4.5" />
    <path d="M17 12c0 2.5-2 4.5-4.5 4.5S8 14.5 8 12" />
  </svg>
);

const IconoEmergencias = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
    <path d="M2 19c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
  </svg>
);

/* Fondo Vectorial Táctico + Zona Agreste (Topografía + Cordillera + Bosques Difuminados) */
const FondoTacticoAgreste = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
    {/* Retícula táctica y curvas topográficas suaves */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.055]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="tactical-grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#0A0A0A" strokeWidth="1" />
          <circle cx="40" cy="40" r="1.5" fill="#D90429" />
        </pattern>
        <pattern id="topo-lines" width="400" height="400" patternUnits="userSpaceOnUse">
          <path
            d="M0 120 Q 100 60, 200 120 T 400 120 M0 240 Q 120 180, 240 240 T 400 240 M0 340 Q 90 290, 210 340 T 400 340"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tactical-grid)" />
      <rect width="100%" height="100%" fill="url(#topo-lines)" />
    </svg>

    {/* Resplandores tácticos difuminados */}
    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#D90429]/10 blur-3xl" />
    <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-[#F2B632]/15 blur-3xl" />

    {/* Silueta vectorial inferior de Cordillera y Pinos Agrestes */}
    <svg
      className="absolute bottom-0 left-0 w-full h-56 text-neutral-900/[0.045]"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      fill="currentColor"
    >
      <path d="M0,288L120,224L240,272L400,128L560,256L720,96L900,240L1080,112L1260,240L1440,160L1440,320L0,320Z" />
      <path
        d="M0,300L80,260L180,295L340,180L500,290L660,160L840,285L1020,175L1200,290L1360,210L1440,260L1440,320L0,320Z"
        className="text-[#D90429]/[0.04]"
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
          1. HERO EXPANSIVO 3D CON FOTOGRAFÍA EN BLANCO Y NEGRO Y CORTES ROJOS
      ===================================================================== */}
      <section className="relative bg-[#0A0A0A] text-white overflow-hidden border-b-[8px] border-[#D90429] shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        {/* Fotografía de fondo en Blanco y Negro de alto contraste */}
        <img
          src={FOTOS_INSTITUCIONALES.heroBg.local}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FOTOS_INSTITUCIONALES.heroBg.fallback;
          }}
          alt={FOTOS_INSTITUCIONALES.heroBg.alt}
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-35 pointer-events-none"
        />

        {/* Capas de profundidad y franja diagonal estilo Credencial Oficial */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/90 to-[#0A0A0A]/45 pointer-events-none" />
        <div className="hidden lg:block absolute top-0 right-0 w-[38%] h-full bg-gradient-to-b from-[#D90429]/35 to-[#9B001A]/40 border-l-[6px] border-[#F2B632] transform -skew-x-12 translate-x-20 pointer-events-none shadow-[-20px_0_50px_rgba(0,0,0,0.6)]" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* Columna Izquierda: Mensaje Institucional con Relieve */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              <div className="inline-flex items-center gap-3 bg-[#141619] border-2 border-[#F2B632] px-4 py-2 rounded-2xl shadow-[0_6px_0_#000000]">
                <span className="px-2.5 py-0.5 rounded-md bg-[#D90429] text-white text-[11px] font-black uppercase tracking-widest shadow">
                  Ley N° 20.500
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                  O.N.G. de Prevención, Desarrollo y Protección Civil
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm sm:text-base font-black uppercase tracking-[0.28em] text-[#F2B632] drop-shadow">
                  Búsqueda · Rescate · Emergencia
                </p>
                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-[1.02] text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)]">
                  Preparados para responder,{' '}
                  <span className="text-[#F2B632] block mt-1 drop-shadow-[0_4px_0_#B8001F]">
                    comprometidos con la vida.
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-neutral-200 font-semibold leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Cuerpo especializado de voluntariado táctico al servicio de la comunidad. Operamos en estrecha colaboración con estamentos públicos y privados en áreas urbanas, rurales y zonas agrestes de difícil acceso.
              </p>

              {/* Botones 3D con Sombra Sólida */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/postular"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#F2B632] hover:bg-[#ffbe3b] text-[#0A0A0A] border-2 border-[#0A0A0A] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_6px_0_#0A0A0A,0_12px_25px_rgba(242,182,50,0.35)] hover:-translate-y-0.5 active:translate-y-1 transition-all"
                >
                  <span>¡Súmate a BRE Bío-Bío!</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </Link>

                <Link
                  to="/apoyo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-b from-[#E60026] to-[#B8001F] hover:from-[#ff0a33] hover:to-[#c90022] text-white border-2 border-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_6px_0_#0A0A0A,0_12px_25px_rgba(217,4,41,0.45)] hover:-translate-y-0.5 active:translate-y-1 transition-all"
                >
                  <PhoneCall size={17} strokeWidth={2.5} />
                  <span>Solicitar Apoyo</span>
                </Link>
              </div>

              {/* 4 Pilares de la Credencial Oficial con Relieve 3D */}
              <div className="pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                {['SERVIR', 'APOYAR', 'PREPARAR', 'SALVAR VIDAS'].map((valor) => (
                  <div
                    key={valor}
                    className="bg-[#141619] border-l-4 border-[#D90429] border-t border-r border-b border-white/10 px-3.5 py-2.5 rounded-r-xl shadow-[0_4px_0_#000000]"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                      {valor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Credencial 3D con Escudo de Tamaño Controlado */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
              <div className="w-full max-w-md bg-white text-[#0A0A0A] rounded-3xl p-6 sm:p-7 border-4 border-[#0A0A0A] shadow-[0_14px_0_#D90429,0_25px_60px_rgba(0,0,0,0.75)] relative overflow-hidden">

                {/* Barra superior rojo intenso */}
                <div className="bg-gradient-to-r from-[#D90429] to-[#9B001A] text-white px-4 py-2.5 rounded-2xl flex items-center justify-between mb-6 border-2 border-[#0A0A0A] shadow-[0_4px_0_#0A0A0A]">
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Unidad Operativa
                  </span>
                  <span className="bg-[#F2B632] text-[#0A0A0A] border border-[#0A0A0A] px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase">
                    Activa
                  </span>
                </div>

                {/* Escudo Oficial Fijo a 80x80px (Imposible que se desborde) */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-full border-[3px] border-[#D90429] bg-white p-1 shadow-[0_5px_0_#0A0A0A] flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src="/logo-bre.png"
                      alt="Escudo Oficial ONG BRE Bío-Bío"
                      width={72}
                      height={72}
                      className="w-full h-full max-w-[72px] max-h-[72px] object-contain block"
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

                {/* Verificador de Credencial / QR para SENAPRED y Autoridades */}
                <form
                  onSubmit={handleVerificarCredencial}
                  className="bg-neutral-100 border-2 border-[#0A0A0A] rounded-2xl p-4 space-y-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
                      <QrCode size={16} className="text-[#D90429]" strokeWidth={2.5} />
                      Validación de Credencial / QR
                    </span>
                    <span className="text-[10px] font-black uppercase bg-[#F2B632] text-[#0A0A0A] px-2 py-0.5 rounded border border-[#0A0A0A]">
                      Autoridades
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codigoVerificacion}
                      onChange={(e) => setCodigoVerificacion(e.target.value)}
                      placeholder="RUT o ID (Ej: BRE-0001)"
                      className="w-full rounded-xl border-2 border-neutral-400 bg-white px-3 py-2 text-xs font-bold text-[#0A0A0A] placeholder:text-neutral-400 focus:border-[#D90429] outline-none"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-xl bg-[#D90429] hover:bg-[#b8001f] text-white border-2 border-[#0A0A0A] shadow-[0_3px_0_#0A0A0A] px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1"
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
          2. FRANJA TÁCTICA 3D DE VALORES OPERATIVOS
      ===================================================================== */}
      <section className="bg-[#F2B632] border-b-[6px] border-[#0A0A0A] py-6 shadow-[0_10px_25px_rgba(0,0,0,0.12)] relative z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 bg-white/90 border-2 border-[#0A0A0A] rounded-2xl p-4 shadow-[0_5px_0_#0A0A0A]">
              <div className="w-12 h-12 rounded-xl bg-[#D90429] text-white border-2 border-[#0A0A0A] flex items-center justify-center shrink-0 shadow-[0_3px_0_#0A0A0A]">
                <Users size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  Servicio a la Comunidad
                </p>
                <p className="text-xs font-bold text-neutral-700">
                  Prevención de riesgos y educación comunitaria
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/90 border-2 border-[#0A0A0A] rounded-2xl p-4 shadow-[0_5px_0_#0A0A0A]">
              <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] text-[#F2B632] border-2 border-[#0A0A0A] flex items-center justify-center shrink-0 shadow-[0_3px_0_#D90429]">
                <Shield size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  Trabajo en Equipo
                </p>
                <p className="text-xs font-bold text-neutral-700">
                  Coordinación con estamentos públicos y privados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/90 border-2 border-[#0A0A0A] rounded-2xl p-4 shadow-[0_5px_0_#0A0A0A]">
              <div className="w-12 h-12 rounded-xl bg-[#D90429] text-white border-2 border-[#0A0A0A] flex items-center justify-center shrink-0 shadow-[0_3px_0_#0A0A0A]">
                <HeartHandshake size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  Vocación y Compromiso
                </p>
                <p className="text-xs font-bold text-neutral-700">
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

        {/* SECCIÓN ESPECIALIDADES (5 Casillas 3D Expansivas) */}
        <section className="py-20 lg:py-24 relative z-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">

            <div className="flex flex-col items-center text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D90429] to-[#B8001F] text-white px-6 py-2 rounded-xl border-2 border-[#0A0A0A] shadow-[0_5px_0_#0A0A0A] mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F2B632]" />
                <span className="text-xs font-black uppercase tracking-[0.25em]">
                  Nuestras Especialidades
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0A0A0A]">
                Ámbitos de Acción Institucional
              </h2>
              <p className="mt-3 max-w-2xl text-sm sm:text-base font-bold text-neutral-700">
                Unidades operativas entrenadas para intervenir en emergencias urbanas, rurales, alta montaña y desastres naturales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-7">
              {especialidades.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white rounded-3xl p-6 border-2 border-[#0A0A0A] shadow-[0_10px_0_#0A0A0A,0_18px_35px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_0_#D90429,0_22px_45px_rgba(217,4,41,0.22)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Franja superior intensa */}
                  <div
                    className={`absolute top-0 inset-x-0 h-3 border-b-2 border-[#0A0A0A] ${item.acento === 'red' ? 'bg-[#D90429]' : 'bg-[#F2B632]'
                      }`}
                  />

                  <div className="pt-2">
                    {/* Medallón 3D idéntico al Pendón Oficial */}
                    <div className="w-16 h-16 rounded-2xl bg-[#0A0A0A] text-white border-[3px] border-[#F2B632] shadow-[0_5px_0_#D90429] flex items-center justify-center mb-5 group-hover:bg-[#D90429] transition-colors">
                      {item.icono}
                    </div>

                    <span className="text-[11px] font-black uppercase tracking-widest text-[#D90429] block mb-1">
                      {item.subtitulo}
                    </span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-[#0A0A0A] mb-3">
                      {item.titulo}
                    </h3>
                    <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                      {item.descripcion}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t-2 border-neutral-200 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#0A0A0A]">
                    <span>Unidad Operativa</span>
                    <span className="w-3 h-3 rounded-full bg-[#D90429] border border-[#0A0A0A]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECCIÓN GALERÍA OPERATIVA Y RECLUTAMIENTO 3D */}
        <section className="py-16 lg:py-24 relative z-10 border-t-2 border-neutral-200/80">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

              {/* Mosaico Fotográfico con Marcos 3D */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div className="sm:col-span-2 relative rounded-3xl overflow-hidden border-[3px] border-[#0A0A0A] shadow-[0_10px_0_#0A0A0A,0_20px_40px_rgba(0,0,0,0.2)] h-72 sm:h-80 group bg-neutral-900">
                  <img
                    src={FOTOS_INSTITUCIONALES.operativoBosque.local}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FOTOS_INSTITUCIONALES.operativoBosque.fallback;
                    }}
                    alt={FOTOS_INSTITUCIONALES.operativoBosque.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="bg-[#D90429] border border-white text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow">
                      Operaciones Terrestres
                    </span>
                    <h4 className="text-xl font-black uppercase mt-2 drop-shadow">
                      Despliegue en Zonas Agrestes y Boscosas
                    </h4>
                  </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden border-[3px] border-[#0A0A0A] shadow-[0_8px_0_#0A0A0A] h-60 group bg-neutral-900">
                  <img
                    src={FOTOS_INSTITUCIONALES.reanimacion.local}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FOTOS_INSTITUCIONALES.reanimacion.fallback;
                    }}
                    alt={FOTOS_INSTITUCIONALES.reanimacion.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F2B632]">
                      Capacitación Continua
                    </span>
                    <p className="text-base font-black uppercase">
                      Soporte Vital y Trauma
                    </p>
                  </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden border-[3px] border-[#0A0A0A] shadow-[0_8px_0_#0A0A0A] h-60 group bg-neutral-900">
                  <img
                    src={FOTOS_INSTITUCIONALES.cuerdasAltura.local}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FOTOS_INSTITUCIONALES.cuerdasAltura.fallback;
                    }}
                    alt={FOTOS_INSTITUCIONALES.cuerdasAltura.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
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

              {/* Tarjeta 3D de Convocatoria ("¡SÚMATE A BRE BIO BIO!") */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-8 sm:p-10 border-[3px] border-[#0A0A0A] shadow-[0_14px_0_#D90429,0_25px_50px_rgba(0,0,0,0.18)] space-y-6 relative">
                  <div className="inline-block bg-[#0A0A0A] text-[#F2B632] border-2 border-[#F2B632] px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_4px_0_#D90429]">
                    Admisión de Voluntarios
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-[#0A0A0A]">
                    ¡Súmate a <span className="text-[#D90429]">BRE BÍO-BÍO!</span>
                  </h2>

                  <p className="text-sm font-extrabold uppercase tracking-wide text-[#0A0A0A]">
                    Tu vocación puede convertirse en acción. Pon tus capacidades al servicio de quienes más lo necesitan.
                  </p>

                  <p className="text-sm font-semibold text-neutral-700 leading-relaxed">
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
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#E60026] to-[#B8001F] hover:from-[#ff0a33] hover:to-[#c90022] text-white border-2 border-[#0A0A0A] font-black text-xs uppercase tracking-widest py-4 px-6 rounded-2xl shadow-[0_5px_0_#0A0A0A] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
                    >
                      <span>Postular Ahora</span>
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </Link>
                    <Link
                      to="/nosotros"
                      className="inline-flex items-center justify-center gap-2 bg-[#F2B632] hover:bg-[#ffbe3b] text-[#0A0A0A] border-2 border-[#0A0A0A] font-black text-xs uppercase tracking-widest py-4 px-5 rounded-2xl shadow-[0_5px_0_#0A0A0A] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
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

        {/* BANNER INFERIOR 3D DE COORDINACIÓN DE EMERGENCIAS */}
        <section className="py-16 relative z-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="bg-gradient-to-r from-[#D90429] via-[#B8001F] to-[#0A0A0A] text-white rounded-3xl p-8 sm:p-12 border-4 border-[#0A0A0A] shadow-[0_12px_0_#0A0A0A,0_25px_50px_rgba(217,4,41,0.3)] flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center lg:text-left">
                <span className="inline-block bg-[#F2B632] text-[#0A0A0A] border border-[#0A0A0A] px-3 py-1 rounded-lg text-xs font-black uppercase tracking-[0.2em]">
                  Coordinación Operativa
                </span>
                <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight pt-1">
                  ¿Requieres asistencia técnica o apoyo en terreno?
                </h3>
                <p className="text-sm font-bold text-white/90 max-w-2xl">
                  Enlace directo para SENAPRED, municipalidades, organismos públicos y comunidad ante situaciones de emergencia, búsqueda o prevención.
                </p>
              </div>

              <Link
                to="/apoyo"
                className="shrink-0 inline-flex items-center gap-2.5 bg-[#F2B632] hover:bg-[#ffbe3b] text-[#0A0A0A] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-[#0A0A0A] shadow-[0_6px_0_#0A0A0A] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
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