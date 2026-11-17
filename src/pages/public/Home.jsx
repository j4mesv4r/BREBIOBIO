import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  PhoneCall,
  QrCode,
  CheckCircle2,
  FileCheck2,
  HeartHandshake,
  Search,
  Award,
  MapPin,
} from 'lucide-react';

/**
 * FOTOGRAFÍAS INSTITUCIONALES REEMPLAZABLES:
 * Guarda las fotos originales de tu equipo en `public/terreno/` con estos nombres:
 * - `/terreno/equipo-principal.jpg`
 * - `/terreno/operativo-bosque.jpg`
 * - `/terreno/primeros-auxilios.jpg`
 * - `/terreno/rescate-altura.jpg`
 */
const FOTOS_INSTITUCIONALES = {
  equipoHero: {
    local: '/terreno/equipo-principal.jpg',
    fallback:
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1920&q=85',
    alt: 'Equipo operativo de voluntarios ONG BRE Bío-Bío en terreno',
  },
  operativoBosque: {
    local: '/terreno/operativo-bosque.jpg',
    fallback:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85',
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

/* Biseles 3D Difuminados (Interior + Exterior suave) */
const BEVEL_CARD_WHITE =
  'bg-gradient-to-b from-white/95 via-white/95 to-neutral-50/95 backdrop-blur-[2px] border border-neutral-200/90 shadow-[inset_0_2px_4px_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.06),0_20px_45px_-12px_rgba(15,23,42,0.16),0_6px_16px_-4px_rgba(15,23,42,0.08)]';

const BEVEL_BTN_YELLOW =
  'bg-gradient-to-b from-[#FFD25A] via-[#F2B632] to-[#DDA018] text-[#0A0A0A] shadow-[inset_0_2px_3px_rgba(255,255,255,0.85),inset_0_-4px_8px_rgba(140,88,0,0.45),0_14px_28px_-6px_rgba(242,182,50,0.45),0_6px_12px_-3px_rgba(0,0,0,0.25)]';

const BEVEL_BTN_RED =
  'bg-gradient-to-b from-[#F01436] via-[#D90429] to-[#A3001B] text-white shadow-[inset_0_2px_3px_rgba(255,255,255,0.45),inset_0_-4px_8px_rgba(60,0,10,0.6),0_14px_28px_-6px_rgba(217,4,41,0.5),0_6px_12px_-3px_rgba(0,0,0,0.3)]';

/* Vectores de Especialidades del Pendón Oficial */
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

/**
 * MAPA TOPOGRÁFICO EN RELIEVE 3D (POLILÍNEAS NEGRO / ROJO · REGIÓN DEL BIOBÍO)
 * Simula curvas de nivel de elevación (costa del Golfo de Arauco, cuenca del río Biobío
 * y macizos cordilleranos de Antuco/Alto Biobío) con sombra proyectada para efecto 3D.
 */
const MapaRelieveBiobio = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-100/90">
    {/* Retícula Cartográfica UTM */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="utm-grid-biobio" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#0A0A0A" strokeWidth="0.8" />
          <path d="M 60 56 V 64 M 56 60 H 64" stroke="#D90429" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#utm-grid-biobio)" />
    </svg>

    {/* Polilíneas Topográficas de Elevación con Sombra de Relieve 3D */}
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 1200"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Sombra de relieve 3D para las curvas de nivel */}
        <filter id="relieve-3d" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="#0A0A0A" floodOpacity="0.16" />
        </filter>
        <radialGradient id="cota-alta-roja" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D90429" stopOpacity="0.14" />
          <stop offset="65%" stopColor="#D90429" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#D90429" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cota-oscura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0A0A0A" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Volúmenes hipsométricos difuminados (Cordillera del Biobío y Nahuelbuta) */}
      <ellipse cx="1180" cy="280" rx="440" ry="320" fill="url(#cota-alta-roja)" />
      <ellipse cx="260" cy="760" rx="420" ry="300" fill="url(#cota-oscura)" />
      <ellipse cx="1050" cy="960" rx="480" ry="280" fill="url(#cota-alta-roja)" />

      {/* Grupo de Polilíneas Topográficas con Relieve 3D */}
      <g filter="url(#relieve-3d)">
        {/* Cuenca del Río Biobío y Valle Central (Curvas negras de base) */}
        <path
          d="M-60,180 C180,140 310,290 540,240 C790,185 920,60 1180,110 C1320,135 1420,90 1510,120"
          stroke="#0A0A0A"
          strokeOpacity="0.16"
          strokeWidth="1.6"
        />
        <path
          d="M-60,240 C210,195 340,350 580,295 C830,235 960,105 1210,165 C1350,200 1440,155 1510,185"
          stroke="#0A0A0A"
          strokeOpacity="0.2"
          strokeWidth="2"
        />
        {/* Curva Maestra Roja (Cota 1.200m) */}
        <path
          d="M-60,305 C230,255 370,415 620,355 C870,295 1000,160 1245,225 C1375,260 1450,220 1510,250"
          stroke="#D90429"
          strokeOpacity="0.32"
          strokeWidth="2.4"
        />

        {/* Macizo Cordillerano / Sector Antuco - Alto Biobío (Anillos concéntricos en relieve) */}
        <path
          d="M920,240 C990,150 1160,130 1270,200 C1380,270 1390,410 1280,475 C1170,540 990,515 915,430 C855,360 870,305 920,240 Z"
          stroke="#0A0A0A"
          strokeOpacity="0.18"
          strokeWidth="1.8"
        />
        <path
          d="M965,265 C1020,195 1150,180 1240,235 C1325,288 1330,390 1245,440 C1160,490 1020,470 960,405 C915,355 925,315 965,265 Z"
          stroke="#D90429"
          strokeOpacity="0.34"
          strokeWidth="2.3"
        />
        <path
          d="M1015,290 C1055,240 1145,230 1205,270 C1265,310 1270,375 1210,410 C1150,445 1055,430 1012,382 C980,345 985,325 1015,290 Z"
          stroke="#0A0A0A"
          strokeOpacity="0.24"
          strokeWidth="2"
        />
        {/* Cumbre / Cota Máxima Roja */}
        <path
          d="M1065,318 C1090,288 1140,282 1175,305 C1210,328 1212,362 1178,382 C1144,402 1088,392 1063,365 C1045,345 1048,335 1065,318 Z"
          stroke="#D90429"
          strokeOpacity="0.45"
          strokeWidth="2.6"
        />

        {/* Cordillera de Nahuelbuta / Borde Costero Golfo de Arauco (Izquierda / Centro) */}
        <path
          d="M-80,620 C90,540 280,555 410,645 C540,735 530,895 390,975 C250,1055 40,1035 -80,940"
          stroke="#0A0A0A"
          strokeOpacity="0.18"
          strokeWidth="1.8"
        />
        <path
          d="M-60,675 C85,605 245,620 355,695 C465,770 455,890 340,955 C225,1020 55,1000 -60,915"
          stroke="#D90429"
          strokeOpacity="0.3"
          strokeWidth="2.3"
        />
        <path
          d="M-40,730 C75,675 205,685 295,745 C385,805 375,890 285,938 C195,986 60,970 -40,898"
          stroke="#0A0A0A"
          strokeOpacity="0.22"
          strokeWidth="1.9"
        />
        <path
          d="M10,785 C90,745 175,752 235,792 C295,832 288,888 228,918 C168,948 78,938 10,888 Z"
          stroke="#D90429"
          strokeOpacity="0.38"
          strokeWidth="2.4"
        />

        {/* Polilíneas inferiores de elevación continua */}
        <path
          d="M-60,1080 C220,990 480,1140 760,1040 C1040,940 1240,1090 1510,990"
          stroke="#0A0A0A"
          strokeOpacity="0.2"
          strokeWidth="2"
        />
        <path
          d="M-60,1135 C240,1045 500,1190 780,1090 C1060,990 1260,1140 1510,1045"
          stroke="#D90429"
          strokeOpacity="0.32"
          strokeWidth="2.5"
        />
      </g>

      {/* Cotas cartográficas discretas (Nivel Técnico SAR) */}
      <g fill="#0A0A0A" fillOpacity="0.32" fontSize="10" fontWeight="800" fontFamily="monospace">
        <text x="1105" y="348">▲ COTA 2.979m · BIOBÍO</text>
        <text x="135" y="845">▲ NAHUELBUTA · SECTOR OESTE</text>
        <text x="640" y="342" fill="#D90429" fillOpacity="0.45">36°49&apos;S 73°06&apos;W · SAN PEDRO DE LA PAZ</text>
      </g>
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
          1. HERO PRINCIPAL CON FOTOGRAFÍA DEL EQUIPO CLARAMENTE VISIBLE
      ===================================================================== */}
      <section className="relative bg-[#0A0A0A] text-white overflow-hidden shadow-[inset_0_-10px_25px_rgba(0,0,0,0.7),0_25px_50px_-12px_rgba(0,0,0,0.45)]">
        {/* Fotografía de fondo del Equipo con alta visibilidad */}
        <img
          src={FOTOS_INSTITUCIONALES.equipoHero.local}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FOTOS_INSTITUCIONALES.equipoHero.fallback;
          }}
          alt={FOTOS_INSTITUCIONALES.equipoHero.alt}
          className="absolute inset-0 w-full h-full object-cover object-center grayscale contrast-110 brightness-95 opacity-65 pointer-events-none"
        />

        {/* Degradado lateral inteligente */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/95 via-[#0A0A0A]/75 to-[#0A0A0A]/20 pointer-events-none" />
        <div className="hidden lg:block absolute top-0 right-0 w-[36%] h-full bg-gradient-to-b from-[#D90429]/25 via-transparent to-[#0A0A0A]/40 border-l-2 border-[#F2B632]/60 transform -skew-x-12 translate-x-20 pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* Columna Izquierda */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              {/* Insignia de Personalidad Jurídica N° 374054 */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2.5 bg-gradient-to-b from-[#22262E]/95 to-[#121418]/95 backdrop-blur-md px-4 py-2 rounded-2xl ring-1 ring-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_12px_25px_-5px_rgba(0,0,0,0.6)]">
                <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-b from-[#F01436] to-[#B8001F] text-white text-[11px] font-black uppercase tracking-wider">
                  Personalidad Jurídica N° 374054
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wide text-neutral-100">
                  Corporación Ley N° 20.500 · San Pedro de la Paz, Biobío
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm sm:text-base font-black uppercase tracking-[0.25em] text-[#F2B632] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                  Búsqueda · Rescate · Emergencia
                </p>
                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-[1.03] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.95)]">
                  Preparados para responder,{' '}
                  <span className="text-[#F2B632] block mt-1 drop-shadow-[0_6px_18px_rgba(0,0,0,0.9)]">
                    comprometidos con la vida.
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-white/95 font-semibold leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Cuerpo especializado de voluntariado táctico al servicio de la comunidad. Operamos en estrecha colaboración con estamentos públicos y privados en áreas urbanas, rurales y zonas agrestes de difícil acceso.
              </p>

              {/* Botones con Bisel 3D Difuminado */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/postular"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 ${BEVEL_BTN_YELLOW}`}
                >
                  <span>¡Súmate a BRE Bío-Bío!</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </Link>

                <Link
                  to="/apoyo"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 ${BEVEL_BTN_RED}`}
                >
                  <PhoneCall size={18} strokeWidth={2.5} />
                  <span>Solicitar Apoyo</span>
                </Link>
              </div>

              {/* 4 Valores Institucionales */}
              <div className="pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                {['SERVIR', 'APOYAR', 'PREPARAR', 'SALVAR VIDAS'].map((valor) => (
                  <div
                    key={valor}
                    className="bg-black/65 backdrop-blur-md border-l-4 border-[#D90429] px-3.5 py-2.5 rounded-r-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.18),0_8px_20px_-4px_rgba(0,0,0,0.5)]"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                      {valor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Fotografía Destacada del Equipo + Validador de Credencial */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
              <div className="w-full max-w-md bg-gradient-to-b from-white via-white to-neutral-100 text-[#0A0A0A] rounded-3xl p-5 sm:p-6 ring-1 ring-white/90 shadow-[inset_0_2px_5px_rgba(255,255,255,1),inset_0_-6px_14px_rgba(0,0,0,0.08),0_30px_60px_-12px_rgba(0,0,0,0.85)] space-y-5">

                {/* Fotografía del Equipo en Terreno */}
                <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden shadow-[0_12px_25px_-6px_rgba(0,0,0,0.35)] ring-2 ring-[#D90429]">
                  <img
                    src={FOTOS_INSTITUCIONALES.equipoHero.local}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FOTOS_INSTITUCIONALES.equipoHero.fallback;
                    }}
                    alt="Equipo Operativo ONG BRE Bío-Bío"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-[#D90429] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow">
                      Equipo Operativo
                    </span>
                    <span className="bg-[#F2B632] text-[#0A0A0A] px-2.5 py-1 rounded-lg text-[10px] font-black uppercase shadow">
                      PJ N° 374054 · Vigente
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center gap-3 text-white">
                    <div className="w-11 h-11 min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px] rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src="/logo-bre.png"
                        alt="Escudo BRE Bío-Bío"
                        width={40}
                        height={40}
                        className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain block"
                      />
                    </div>
                    <div>
                      <h2 className="text-base font-black uppercase tracking-tight leading-none">
                        O.N.G. BRE BÍO-BÍO
                      </h2>
                      <p className="text-[11px] font-bold text-neutral-200 mt-0.5">
                        San Pedro de la Paz · Región del Biobío
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verificador de Credencial / QR para SENAPRED y Autoridades */}
                <form
                  onSubmit={handleVerificarCredencial}
                  className="bg-neutral-100/95 rounded-2xl p-4 space-y-3 border border-neutral-200/90 shadow-[inset_0_3px_8px_rgba(0,0,0,0.07),inset_0_-1px_2px_rgba(255,255,255,0.9)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
                      <QrCode size={16} className="text-[#D90429]" strokeWidth={2.5} />
                      Validación de Credencial / QR
                    </span>
                    <span className="text-[10px] font-black uppercase bg-[#F2B632]/30 text-[#7A4E00] px-2.5 py-0.5 rounded-md">
                      SENAPRED / Autoridades
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
                      <span>Verificar</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. FRANJA AMARILLA CON BISEL DIFUMINADO Y RESPALDO JURÍDICO
      ===================================================================== */}
      <section className="bg-gradient-to-b from-[#FFD25A] via-[#F2B632] to-[#E0A320] py-7 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-5px_12px_rgba(140,88,0,0.28),0_15px_35px_-10px_rgba(0,0,0,0.18)] relative z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`flex items-center gap-4 rounded-2xl p-4 ${BEVEL_CARD_WHITE}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${BEVEL_BTN_RED}`}>
                <Award size={23} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  Personalidad Jurídica N° 374054
                </p>
                <p className="text-xs font-bold text-neutral-600">
                  Registro Civil · Corporación Vigente Ley N° 20.500
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
                <MapPin size={23} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  San Pedro de la Paz · Biobío
                </p>
                <p className="text-xs font-bold text-neutral-600">
                  Sede institucional con despliegue operativo nacional
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. CUERPO PRINCIPAL SOBRE MAPA TOPOGRÁFICO EN RELIEVE DE LA REGIÓN DEL BIOBÍO
      ===================================================================== */}
      <div className="relative bg-white">
        <MapaRelieveBiobio />

        {/* SECCIÓN ESPECIALIDADES */}
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
              <p className="mt-3 max-w-2xl text-sm sm:text-base font-bold text-neutral-700">
                Unidades operativas entrenadas para intervenir en emergencias urbanas, rurales, alta montaña y desastres naturales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-7">
              {especialidades.map((item, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-3xl p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,1),inset_0_-5px_12px_rgba(217,4,41,0.08),0_28px_55px_-12px_rgba(217,4,41,0.22),0_10px_20px_-5px_rgba(15,23,42,0.1)] ${BEVEL_CARD_WHITE}`}
                >
                  <div
                    className={`absolute top-0 inset-x-0 h-2.5 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] ${item.acento === 'red'
                        ? 'bg-gradient-to-r from-[#F01436] via-[#D90429] to-[#A3001B]'
                        : 'bg-gradient-to-r from-[#FFD25A] via-[#F2B632] to-[#DDA018]'
                      }`}
                  />

                  <div className="pt-2">
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

        {/* SECCIÓN GALERÍA OPERATIVA Y RECLUTAMIENTO (POSTULANTES DESDE LOS 16 AÑOS) */}
        <section className="py-16 lg:py-24 relative z-10 border-t border-neutral-200/70">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

              {/* Mosaico Fotográfico */}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
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

              {/* Tarjeta Biselada de Convocatoria (Postulantes desde los 16 años) */}
              <div className="lg:col-span-5">
                <div className="bg-gradient-to-b from-white via-white to-neutral-50 rounded-3xl p-8 sm:p-10 border border-neutral-200/90 shadow-[inset_0_2px_5px_rgba(255,255,255,1),inset_0_-6px_14px_rgba(217,4,41,0.06),0_28px_60px_-15px_rgba(15,23,42,0.2),0_10px_25px_-8px_rgba(217,4,41,0.12)] space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#D90429] via-[#F2B632] to-[#D90429]" />

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-gradient-to-b from-[#23272F] to-[#0A0A0A] text-[#F2B632] px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md">
                      Admisión de Voluntarios
                    </span>
                    <span className="bg-[#D90429]/10 text-[#D90429] border border-[#D90429]/30 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
                      Desde 16 Años
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-[#0A0A0A]">
                    ¡Súmate a <span className="text-[#D90429]">BRE BÍO-BÍO!</span>
                  </h2>

                  <p className="text-sm font-extrabold uppercase tracking-wide text-[#0A0A0A]">
                    Tu vocación puede convertirse en acción. Pon tus capacidades al servicio de quienes más lo necesitan.
                  </p>

                  <p className="text-sm font-semibold text-neutral-700 leading-relaxed">
                    Convocatoria abierta para personas desde los <strong>16 años</strong>. Los postulantes de <strong>16 y 17 años</strong> pueden incorporarse con <strong>autorización expresa de sus padres o apoderados</strong>, desempeñando labores administrativas u operativas en terreno que no comprometan ni pongan en riesgo su integridad.
                  </p>

                  <ul className="space-y-3 text-xs font-extrabold text-[#0A0A0A]">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-[#D90429] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>
                        <strong>16 y 17 años:</strong> Ingreso con autorización notarial/expresa de padres en apoyo logístico, administrativo o terreno seguro.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-[#D90429] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>
                        <strong>Mayores de 18 años:</strong> Despliegue operativo integral, búsqueda y rescate técnico.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-[#D90429] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>Credencial Oficial con verificación pública vía QR (PJ N° 374054).</span>
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
                <span className="inline-block bg-gradient-to-b from-[#FFD25A] to-[#F2B632] text-[#0A0A0A] px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-md">
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