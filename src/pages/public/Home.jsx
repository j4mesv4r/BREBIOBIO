import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Compass,
  HeartPulse,
  Mountain,
  Flame,
  Building2,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  Radio,
  Award,
  FileCheck2,
  Users
} from 'lucide-react';

export default function Home() {
  const especialidades = [
    {
      icon: Compass,
      titulo: 'Búsqueda Especializada',
      descripcion: 'Rastreo sistemático y georreferenciado de personas extraviadas en zonas agrestes, rurales y urbanas de difícil acceso.',
      tag: 'Operaciones SAR'
    },
    {
      icon: Shield,
      titulo: 'Rescate en Terreno',
      descripcion: 'Extracción segura, estabilización y evacuación en escenarios complejos bajo estándares internacionales de protección civil.',
      tag: 'Intervención'
    },
    {
      icon: HeartPulse,
      titulo: 'Primeros Auxilios Avanzados',
      descripcion: 'Atención prehospitalaria inmediata en el punto del incidente para estabilizar pacientes críticos antes del traslado médico.',
      tag: 'Soporte Vital'
    },
    {
      icon: Mountain,
      titulo: 'Rescate en Altura',
      descripcion: 'Maniobras técnicas con sistemas de cuerdas, anclajes y polipastos en pendientes pronunciadas, acantilados y estructuras.',
      tag: 'Rescate Vertical'
    },
    {
      icon: Flame,
      titulo: 'Emergencias y Desastres',
      descripcion: 'Despliegue rápido frente a terremotos, inundaciones, incendios forestales y remociones en masa en coordinación estatal.',
      tag: 'Respuesta Rápida'
    }
  ];

  const pilaresEstatutarios = [
    {
      numero: '01',
      titulo: 'Coordinación Público-Privada',
      texto: 'Actuamos en estrecha colaboración con organismos del Estado, municipios y empresas privadas para potenciar la capacidad de respuesta regional.'
    },
    {
      numero: '02',
      titulo: 'Prevención y Simulacros',
      texto: 'Diseño de planes de emergencia, capacitación técnica y educación comunitaria para construir una sociedad resiliente ante catástrofes.'
    },
    {
      numero: '03',
      titulo: 'Asistencia Humanitaria',
      texto: 'Apoyo logístico, distribución de suministros críticos y contención psicológica y social en terreno para comunidades afectadas.'
    },
    {
      numero: '04',
      titulo: 'Investigación y Tecnología',
      texto: 'Desarrollo e implementación de nuevas metodologías, protocolos operativos y equipamiento táctico junto a instituciones académicas.'
    }
  ];

  return (
    <div className="bg-zinc-950 text-white selection:bg-red-600 selection:text-white">

      {/* =====================================================================
          1. HERO SECTION CORPORATIVO DE ALTO IMPACTO
      ===================================================================== */}
      <section className="relative min-h-[92vh] flex items-center pt-28 pb-20 overflow-hidden">
        {/* Imagen de fondo con overlay dramático */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=2070"
            alt="Operaciones de rescate en montaña Biobío"
            className="w-full h-full object-cover object-center opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/60" />
          {/* Acento rojo sutil */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Columna Izquierda: Mensaje Principal */}
            <div className="lg:col-span-8 space-y-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">
                  Organización No Gubernamental · Región del Biobío, Chile
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] uppercase">
                Preparados para <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-amber-500">Responder</span>,<br />
                Comprometidos con la <span className="underline decoration-red-600 decoration-4 underline-offset-8">Vida</span>.
              </h1>

              <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl leading-relaxed font-normal">
                Institución técnica de prevención, búsqueda, rescate y protección civil. Operamos con rigor profesional, disciplina operativa y vocación de servicio en escenarios de emergencia y desastres naturales.
              </p>

              {/* Botones de Acción Corporativos */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/apoyo"
                  className="inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-[0_10px_35px_rgba(220,38,38,0.45)] hover:shadow-[0_15px_40px_rgba(220,38,38,0.65)] transition-all group"
                >
                  <Building2 size={20} />
                  <span>Solicitar Apoyo Institucional</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/postular"
                  className="inline-flex items-center justify-center gap-3 bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider backdrop-blur-sm transition-all"
                >
                  <UserPlus size={20} className="text-amber-400" />
                  <span>Postular como Voluntario</span>
                </Link>
              </div>

              {/* Sellos de Respaldo */}
              <div className="pt-6 border-t border-zinc-800/80 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FileCheck2 size={16} className="text-red-500" />
                  <span>Constituida bajo Ley N° 20.500</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-amber-500" />
                  <span>Estándares de Protección Civil</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio size={16} className="text-emerald-500" />
                  <span>Despliegue Regional y Nacional</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Ejecutiva de Identidad */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

                <div className="flex flex-col items-center text-center">
                  <div className="w-36 h-36 rounded-full bg-white p-1 border-4 border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.35)] mb-6">
                    <img
                      src="/logo-bre.png"
                      alt="Escudo BRE Biobío"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>

                  <span className="text-xs font-black tracking-[0.25em] text-amber-400 uppercase mb-1">
                    Servicio y Vocación
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-wide uppercase mb-3">
                    O.N.G. BRE BIOBÍO
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    Equipo multidisciplinario certificado en rescate técnico, atención prehospitalaria y gestión integral del riesgo de desastres.
                  </p>

                  <div className="w-full space-y-2.5 text-left bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-semibold">Jurisdicción Base</span>
                      <span className="text-white font-bold">Región del Biobío, Chile</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-semibold">Cobertura Operativa</span>
                      <span className="text-emerald-400 font-bold">Territorio Nacional</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-semibold">Carácter Institucional</span>
                      <span className="text-white font-bold">Técnico · Sin Fines de Lucro</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. BARRA DE MÉTRICAS Y CAPACIDAD OPERATIVA
      ===================================================================== */}
      <section className="bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border-l-2 border-red-600 pl-4">
              <p className="text-3xl sm:text-4xl font-black text-white">5 Áreas</p>
              <p className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider mt-1">
                Especialidades de Rescate
              </p>
            </div>
            <div className="border-l-2 border-amber-500 pl-4">
              <p className="text-3xl sm:text-4xl font-black text-white">24 / 7</p>
              <p className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider mt-1">
                Disponibilidad de Activación
              </p>
            </div>
            <div className="border-l-2 border-red-600 pl-4">
              <p className="text-3xl sm:text-4xl font-black text-white">100%</p>
              <p className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider mt-1">
                Personal Evaluado y Acreditado
              </p>
            </div>
            <div className="border-l-2 border-amber-500 pl-4">
              <p className="text-3xl sm:text-4xl font-black text-white">Biobío</p>
              <p className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider mt-1">
                Base Operativa con Alcance Nacional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. NUESTRAS 5 ESPECIALIDADES OPERATIVAS (ESTÉTICA AFICHE OFICIAL)
      ===================================================================== */}
      <section className="py-24 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-red-500 font-black text-xs uppercase tracking-[0.25em]">
                Capacidades Técnicas
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-2">
                Nuestras Especialidades
              </h2>
            </div>
            <p className="text-zinc-400 max-w-xl text-sm sm:text-base leading-relaxed">
              Contamos con células operativas entrenadas para intervenir con precisión técnica en entornos agrestes, urbanos y catástrofes de gran magnitud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {especialidades.map((esp, index) => {
              const IconComponent = esp.icon;
              return (
                <div
                  key={index}
                  className="group bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600/60 rounded-2xl p-8 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-950 border-2 border-amber-500/80 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-500 transition-colors shadow-lg">
                        <IconComponent size={28} />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-zinc-950 text-zinc-400 border border-zinc-800">
                        {esp.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white uppercase tracking-wide mb-3 group-hover:text-red-400 transition-colors">
                      {esp.titulo}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {esp.descripcion}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-800/60 flex items-center text-xs font-bold text-zinc-300 uppercase tracking-wider group-hover:text-white">
                    <span>Protocolo Estándar BRE</span>
                    <ArrowRight size={14} className="ml-2 text-red-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}

            {/* Tarjeta 6: Verificación de Credenciales */}
            <div className="bg-gradient-to-br from-red-950/60 via-zinc-900 to-zinc-900 border border-red-800/40 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white mb-6 shadow-lg">
                  <Award size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wide mb-3">
                  Transparencia y Acreditación
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Cada integrante activo de BRE Biobío cuenta con ficha digital verificable, certificaciones auditadas por el Directorio y registro de especialidades.
                </p>
              </div>
              <Link
                to="/nosotros"
                className="mt-8 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400 hover:text-amber-300"
              >
                <span>Conocer Estructura Institucional</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. PILARES CORPORATIVOS Y ESTATUTARIOS
      ===================================================================== */}
      <section className="py-24 bg-white text-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            <div className="lg:col-span-5 space-y-6">
              <span className="text-red-600 font-black text-xs uppercase tracking-[0.25em]">
                Gobernanza y Compromiso
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight">
                Rigor Técnico al Servicio de la Comunidad
              </h2>
              <p className="text-zinc-600 text-base leading-relaxed">
                Más allá de la respuesta en terreno, BRE Biobío opera bajo una estructura formal con Directorio, Comisión de Ética y Comisión Revisora de Cuentas, garantizando seriedad institucional ante organismos públicos y empresas privadas.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm font-bold text-zinc-800">
                  <CheckCircle2 size={20} className="text-red-600 shrink-0" />
                  <span>Sin fines de lucro ni afiliación político-partidista</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-zinc-800">
                  <CheckCircle2 size={20} className="text-red-600 shrink-0" />
                  <span>Capacitación continua y simulacros certificados</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-zinc-800">
                  <CheckCircle2 size={20} className="text-red-600 shrink-0" />
                  <span>Convenios de cooperación con municipios y empresas</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/nosotros"
                  className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
                >
                  <span>Ver Misión, Visión y Estatutos</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pilaresEstatutarios.map((pilar) => (
                <div
                  key={pilar.numero}
                  className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-7 hover:shadow-xl transition-shadow"
                >
                  <span className="text-3xl font-black text-red-600/25 block mb-3">
                    {pilar.numero}
                  </span>
                  <h3 className="text-lg font-black text-zinc-900 uppercase mb-2">
                    {pilar.titulo}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {pilar.texto}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          5. CALL TO ACTION DUAL (EMPRESAS/MUNICIPIOS VS VOLUNTARIOS)
      ===================================================================== */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Bloque Organizaciones y Empresas */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl" />
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-red-500 mb-4">
                  <Building2 size={16} /> Alianzas y Operaciones
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase mb-4">
                  ¿Representas a una Institución, Municipio o Empresa?
                </h3>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
                  Solicita apoyo operativo en emergencias, cobertura preventiva en eventos de alto riesgo, capacitaciones en primeros auxilios o desarrollo de planes de contingencia.
                </p>
              </div>
              <Link
                to="/apoyo"
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-xl transition-all"
              >
                <span>Canal de Solicitud Institucional</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Bloque Postulantes y Voluntarios */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-4">
                  <Users size={16} /> Reclutamiento Oficial
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase mb-4">
                  ¿Tienes Vocación de Servicio y Disciplina Operativa?
                </h3>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
                  Integra nuestras filas iniciando tu proceso formal como Postulante o Colaborador. Accede a formación especializada, entrenamiento en terreno y acreditación oficial.
                </p>
              </div>
              <Link
                to="/postular"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-xl transition-all"
              >
                <span>Iniciar Proceso de Postulación</span>
                <ArrowRight size={18} />
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}