import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  PhoneCall,
  QrCode,
  CheckCircle2,
  MapPin,
  FileCheck2,
  Users,
  HeartHandshake,
  Search,
} from 'lucide-react';

/**
 * FOTOGRAFÍAS INSTITUCIONALES REEMPLAZABLES:
 * Cuando tengas las fotos oficiales en tu carpeta `public/terreno/`,
 * simplemente guárdalas con estos nombres (hero-bg.jpg, rescate-1.jpg, etc.)
 * y la página las cargará automáticamente. Mientras tanto, usa el respaldo táctico.
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
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=900&q=80',
    alt: 'Unidad de búsqueda y rescate terrestre en bosque',
  },
  reanimacion: {
    local: '/terreno/primeros-auxilios.jpg',
    fallback:
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=900&q=80',
    alt: 'Capacitación y soporte vital básico en terreno',
  },
  cuerdasAltura: {
    local: '/terreno/rescate-altura.jpg',
    fallback:
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80',
    alt: 'Maniobras de cuerdas y rescate técnico en altura',
  },
};

/* Iconos SVG de trazo grueso fieles al pendón y afiche oficial de BRE BÍO-BÍO */
const IconoBusqueda = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 19L9 7l5 7 3-4 4 9H3z" />
    <circle cx="17" cy="6" r="2" />
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
    <path d="M12 2v3M4.9 4.9l2.1 2.1M19.1 4.9l-2.1 2.1" />
    <path d="M7 17v-5a5 5 0 0 1 10 0v5" />
    <path d="M5 17h14v3H5z" />
  </svg>
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
    <div className="bg-white text-[#0A0A0A] min-h-screen font-sans selection:bg-[#C8202F] selection:text-white">

      {/* =====================================================================
          1. HERO CORPORATIVO CON FONDO FOTOGRÁFICO EN BLANCO Y NEGRO
      ===================================================================== */}
      <section className="relative bg-[#0A0A0A] text-white overflow-hidden border-b-8 border-[#C8202F]">
        {/* Imagen de fondo en Blanco y Negro (Reemplazable) */}
        <img
          src={FOTOS_INSTITUCIONALES.heroBg.local}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FOTOS_INSTITUCIONALES.heroBg.fallback;
          }}
          alt={FOTOS_INSTITUCIONALES.heroBg.alt}
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-35 pointer-events-none"
        />

        {/* Capas de contraste corporativo y corte diagonal rojo/amarillo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/90 to-[#0A0A0A]/40 pointer-events-none" />
        <div
          className="hidden lg:block absolute top-0 right-0 w-1/3 h-full bg-[#C8202F]/20 border-l-4 border-[#F2B632] transform skew-x-[-12deg] translate-x-16 pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Columna Izquierda: Título e Identidad */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              {/* Cinta Superior Táctica */}
              <div className="inline-flex items-center gap-3 bg-[#17191D] border-2 border-[#F2B632] px-4 py-2 rounded-xl shadow-xl">
                <span className="px-2 py-0.5 rounded bg-[#C8202F] text-white text-[10px] font-black uppercase tracking-widest">
                  Ley N° 20.500
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Organización No Gubernamental · Biobío, Chile
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm sm:text-base font-black uppercase tracking-[0.28em] text-[#F2B632]">
                  Búsqueda · Rescate · Emergencia
                </p>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.02] text-white drop-shadow-lg">
                  Preparados para responder,{' '}
                  <span className="text-[#F2B632] block mt-1">
                    comprometidos con la vida.
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-neutral-200 font-semibold leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Cuerpo especializado de voluntariado táctico en prevención, desarrollo y protección civil. Actuamos en estrecha coordinación con organismos públicos y de emergencia para proteger y salvar vidas en áreas urbanas, rurales y agrestes.
              </p>

              {/* Botones Principales con Contraste Negro/Amarillo y Rojo/Blanco */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                <Link
                  to="/postular"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#F2B632] hover:bg-[#e3a826] text-[#0A0A0A] border-2 border-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_25px_rgba(242,182,50,0.35)] transition-all transform hover:-translate-y-0.5"
                >
                  <span>¡Súmate a BRE Bío-Bío!</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </Link>

                <Link
                  to="/apoyo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#C8202F] hover:bg-[#a91926] text-white border-2 border-white/80 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                  <PhoneCall size={17} strokeWidth={2.5} />
                  <span>Solicitar Apoyo</span>
                </Link>
              </div>

              {/* Valores de la Credencial Oficial */}
              <div className="pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                {['SERVIR', 'APOYAR', 'PREPARAR', 'SALVAR VIDAS'].map((valor) => (
                  <div
                    key={valor}
                    className="bg-black/60 border-l-4 border-[#C8202F] px-3 py-2 rounded-r-lg"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                      {valor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Insignia Oficial + Tarjeta Táctica */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative bg-white text-[#0A0A0A] rounded-3xl p-6 sm:p-8 border-4 border-[#F2B632] shadow-[0_25px_60px_rgba(0,0,0,0.65)] max-w-md w-full">
                {/* Franja Superior Roja estilo Credencial */}
                <div className="bg-[#C8202F] text-white px-4 py-2 rounded-xl flex items-center justify-between mb-6 shadow-md">
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Unidad Operativa
                  </span>
                  <span className="bg-[#F2B632] text-[#0A0A0A] px-2.5 py-0.5 rounded text-[10px] font-black uppercase">
                    Activa
                  </span>
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <img
                    src="/logo-bre.png"
                    alt="Escudo Oficial ONG BRE Bío-Bío"
                    className="w-28 h-28 sm:w-32 sm:h-32 object-contain shrink-0 drop-shadow-md"
                  />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#C8202F]">
                      O.N.G. Oficial
                    </p>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-[#0A0A0A] leading-none mt-1">
                      BRE BÍO-BÍO
                    </h2>
                    <p className="text-xs font-bold text-neutral-600 mt-2 leading-snug">
                      Personalidad Jurídica sin fines de lucro · Región del Biobío, despliegue nacional.
                    </p>
                  </div>
                </div>

                {/* Buscador Rápido de Credencial para SENAPRED / Autoridades */}
                <form
                  onSubmit={handleVerificarCredencial}
                  className="bg-neutral-100 border-2 border-neutral-300 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
                      <QrCode size={16} className="text-[#C8202F]" strokeWidth={2.5} />
                      Validación de Credencial / QR
                    </span>
                    <span className="text-[10px] font-extrabold uppercase text-[#C8202F]">
                      Autoridades
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codigoVerificacion}
                      onChange={(e) => setCodigoVerificacion(e.target.value)}
                      placeholder="RUT o ID (Ej: BRE-0001)"
                      className="w-full rounded-xl border-2 border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-[#0A0A0A] placeholder:text-neutral-400 focus:border-[#C8202F] outline-none"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-xl bg-[#0A0A0A] hover:bg-[#C8202F] text-[#F2B632] hover:text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <Search size={15} strokeWidth={2.5} />
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
          2. FRANJA DE PILARES INSTITUCIONALES (Del Afiche Oficial)
      ===================================================================== */}
      <section className="bg-[#F2B632] border-b-4 border-[#0A0A0A] py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x-2 divide-[#0A0A0A]/25 text-center">
            <div className="flex items-center justify-center gap-3 pt-2 md:pt-0">
              <div className="w-11 h-11 rounded-xl bg-[#0A0A0A] text-[#F2B632] flex items-center justify-center shrink-0 shadow">
                <Users size={22} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  Servicio a la Comunidad
                </p>
                <p className="text-xs font-bold text-neutral-900">
                  Prevención, educación y apoyo ciudadano
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 md:pt-0">
              <div className="w-11 h-11 rounded-xl bg-[#C8202F] text-white flex items-center justify-center shrink-0 shadow">
                <Shield size={22} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  Trabajo en Equipo
                </p>
                <p className="text-xs font-bold text-neutral-900">
                  Coordinación con estamentos públicos y privados
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 md:pt-0">
              <div className="w-11 h-11 rounded-xl bg-[#0A0A0A] text-[#F2B632] flex items-center justify-center shrink-0 shadow">
                <HeartHandshake size={22} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  Vocación y Compromiso
                </p>
                <p className="text-xs font-bold text-neutral-900">
                  Profesionalismo y ética operativa en terreno
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. NUESTRAS ESPECIALIDADES (5 Áreas del Pendón Oficial + Semi-Sombra)
      ===================================================================== */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Encabezado con cinta diagonal estilo Pendón */}
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#C8202F] text-white px-6 py-2 rounded-xl border-b-4 border-[#0A0A0A] shadow-lg mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2B632]" />
              <span className="text-xs font-black uppercase tracking-[0.25em]">
                Nuestras Especialidades
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0A0A0A]">
              Ámbitos de Acción Operativa
            </h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base font-bold text-neutral-600">
              Unidades preparadas bajo protocolos estandarizados para responder en áreas urbanas, rurales y zonas agrestes de difícil acceso.
            </p>
          </div>

          {/* Casillas Redondeadas con Semi-Sombra y Bordes de Alto Contraste */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {especialidades.map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-3xl p-6 border-2 border-neutral-200 hover:border-[#0A0A0A] shadow-[0_14px_35px_-10px_rgba(0,0,0,0.16)] hover:shadow-[0_20px_40px_-10px_rgba(200,32,47,0.28)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Barra superior de color institucional */}
                <div
                  className={`absolute top-0 inset-x-0 h-2 ${item.acento === 'red' ? 'bg-[#C8202F]' : 'bg-[#F2B632]'
                    }`}
                />

                <div>
                  {/* Círculo de Icono idéntico al estilo del Pendón Oficial */}
                  <div className="w-16 h-16 rounded-full bg-[#0A0A0A] text-white border-4 border-[#F2B632] flex items-center justify-center mb-5 shadow-lg group-hover:bg-[#C8202F] transition-colors">
                    {item.icono}
                  </div>

                  <span className="text-[11px] font-black uppercase tracking-widest text-[#C8202F] block mb-1">
                    {item.subtitulo}
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#0A0A0A] mb-3">
                    {item.titulo}
                  </h3>
                  <p className="text-xs font-bold text-neutral-600 leading-relaxed">
                    {item.descripcion}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-neutral-200 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#0A0A0A]">
                  <span>Protocolo Activo</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C8202F]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. DESPLIEGUE EN TERRENO (Galería Reemplazable + Llamado a Postular)
      ===================================================================== */}
      <section className="py-20 bg-neutral-100 border-y-2 border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Columna Izquierda: Mosaico de 3 Fotografías con Marcos de Alto Contraste */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Foto Principal Grande */}
              <div className="sm:col-span-2 relative rounded-3xl overflow-hidden border-4 border-[#0A0A0A] shadow-2xl h-72 group bg-neutral-900">
                <img
                  src={FOTOS_INSTITUCIONALES.operativoBosque.local}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FOTOS_INSTITUCIONALES.operativoBosque.fallback;
                  }}
                  alt={FOTOS_INSTITUCIONALES.operativoBosque.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <span className="bg-[#C8202F] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      Operaciones Terrestres
                    </span>
                    <h4 className="text-lg font-black uppercase mt-1.5">
                      Despliegue en Zonas Agrestes y Boscosas
                    </h4>
                  </div>
                </div>
              </div>

              {/* Foto Secundaria 1 */}
              <div className="relative rounded-3xl overflow-hidden border-4 border-[#0A0A0A] shadow-xl h-56 group bg-neutral-900">
                <img
                  src={FOTOS_INSTITUCIONALES.reanimacion.local}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FOTOS_INSTITUCIONALES.reanimacion.fallback;
                  }}
                  alt={FOTOS_INSTITUCIONALES.reanimacion.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#F2B632]">
                    Entrenamiento Continuo
                  </span>
                  <p className="text-sm font-black uppercase">
                    Soporte Vital y RCP
                  </p>
                </div>
              </div>

              {/* Foto Secundaria 2 */}
              <div className="relative rounded-3xl overflow-hidden border-4 border-[#0A0A0A] shadow-xl h-56 group bg-neutral-900">
                <img
                  src={FOTOS_INSTITUCIONALES.cuerdasAltura.local}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FOTOS_INSTITUCIONALES.cuerdasAltura.fallback;
                  }}
                  alt={FOTOS_INSTITUCIONALES.cuerdasAltura.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#F2B632]">
                    Especialidad Técnica
                  </span>
                  <p className="text-sm font-black uppercase">
                    Maniobras de Cuerdas y Altura
                  </p>
                </div>
              </div>

            </div>

            {/* Columna Derecha: Bloque de Reclutamiento idéntico al Afiche "¡SÚMATE A BRE BIO BIO!" */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border-4 border-[#C8202F] shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-6">
                <div className="inline-block bg-[#0A0A0A] text-[#F2B632] px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">
                  Convocatoria Abierta
                </div>

                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-[#0A0A0A]">
                  ¡Súmate a <span className="text-[#C8202F]">BRE BÍO-BÍO!</span>
                </h2>

                <p className="text-sm font-extrabold uppercase tracking-wide text-[#0A0A0A]">
                  Tu vocación puede convertirse en acción. Pon tus capacidades al servicio de quienes más lo necesitan.
                </p>

                <p className="text-sm font-semibold text-neutral-700 leading-relaxed">
                  Buscamos personas mayores de 18 años con espíritu de servicio para integrarse como Voluntarios Operativos o Colaboradores Técnicos. Todas las postulaciones e historiales de capacitación son validados por el Directorio Institucional.
                </p>

                <ul className="space-y-2.5 text-xs font-bold text-[#0A0A0A]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-[#C8202F] shrink-0" strokeWidth={2.5} />
                    <span>Acreditación con Credencial Oficial y Código QR verificable.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-[#C8202F] shrink-0" strokeWidth={2.5} />
                    <span>Capacitación continua, simulacros y operativos en terreno.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-[#C8202F] shrink-0" strokeWidth={2.5} />
                    <span>Estatutos regidos por la Ley N° 20.500 y ética institucional.</span>
                  </li>
                </ul>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/postular"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#C8202F] hover:bg-[#a61926] text-white font-black text-xs uppercase tracking-widest py-4 px-6 rounded-2xl shadow-lg transition-colors"
                  >
                    <span>Postular Ahora</span>
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </Link>
                  <Link
                    to="/nosotros"
                    className="inline-flex items-center justify-center gap-2 bg-[#F2B632] hover:bg-[#e0a628] text-[#0A0A0A] border-2 border-[#0A0A0A] font-black text-xs uppercase tracking-widest py-4 px-5 rounded-2xl transition-colors"
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

      {/* =====================================================================
          5. BANNER DE CONTACTO DIRECTO E INSTITUCIONAL
      ===================================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0A0A0A] text-white rounded-3xl p-8 sm:p-12 border-4 border-[#F2B632] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#F2B632]">
                Coordinación Interinstitucional y Emergencias
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                ¿Requieres asistencia técnica o despliegue operativo?
              </h3>
              <p className="text-sm font-semibold text-neutral-300 max-w-2xl">
                Canal directo para municipios, SENAPRED, organismos de seguridad e instituciones que necesiten apoyo en búsqueda, rescate o prevención.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <Link
                to="/apoyo"
                className="inline-flex items-center gap-2 bg-[#F2B632] hover:bg-[#e0a628] text-[#0A0A0A] px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-white shadow-xl transition-transform hover:-translate-y-0.5"
              >
                <PhoneCall size={18} strokeWidth={2.5} />
                <span>Solicitar Apoyo</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}