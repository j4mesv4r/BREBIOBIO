import { Link } from 'react-router-dom';
import { fotosTerreno } from '../../utils/galeriaAutomatica';
import {
  Compass,
  Shield,
  HeartPulse,
  Mountain,
  Flame,
  Building2,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  Camera,
} from 'lucide-react';

export default function Home() {
  // Imágenes de respaldo solo si aún no has puesto fotos en src/assets/terreno/
  const respaldoFotos = [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=1400',
    'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=1400',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=1400',
  ];

  const fotoPrincipal = fotosTerreno[0] || respaldoFotos[0];
  const galeriaMostrar =
    fotosTerreno.length > 0 ? fotosTerreno : respaldoFotos;

  const especialidades = [
    {
      icon: Compass,
      codigo: 'AREA-01',
      titulo: 'Búsqueda Especializada',
      descripcion:
        'Rastreo sistemático y georreferenciado de personas extraviadas en zonas agrestes, rurales y urbanas de difícil acceso.',
    },
    {
      icon: Shield,
      codigo: 'AREA-02',
      titulo: 'Rescate en Terreno',
      descripcion:
        'Extracción segura, estabilización y evacuación en escenarios complejos bajo estándares de protección civil.',
    },
    {
      icon: HeartPulse,
      codigo: 'AREA-03',
      titulo: 'Primeros Auxilios Avanzados',
      descripcion:
        'Atención prehospitalaria inmediata en el punto del incidente para estabilizar pacientes críticos antes del traslado.',
    },
    {
      icon: Mountain,
      codigo: 'AREA-04',
      titulo: 'Rescate en Altura',
      descripcion:
        'Maniobras técnicas con sistemas de cuerdas, anclajes y polipastos en pendientes pronunciadas, quebradas y estructuras.',
    },
    {
      icon: Flame,
      codigo: 'AREA-05',
      titulo: 'Emergencias y Desastres',
      descripcion:
        'Despliegue rápido frente a terremotos, inundaciones, incendios forestales y remociones en masa en coordinación estatal.',
    },
  ];

  const ambitosEstatutarios = [
    {
      numero: '01',
      titulo: 'Búsqueda y Rescate',
      detalle:
        'Operaciones urbanas y rurales, desastres naturales y zonas de difícil acceso incluyendo montañas, cuevas y cuerpos de agua.',
    },
    {
      numero: '02',
      titulo: 'Prevención y Preparación',
      detalle:
        'Programas de capacitación, simulacros de emergencia para comunidades y empresas, y diseño de planes de seguridad.',
    },
    {
      numero: '03',
      titulo: 'Respuesta Rápida',
      detalle:
        'Movilización inmediata de equipos de rescate en estrecha coordinación con organismos gubernamentales y municipales.',
    },
    {
      numero: '04',
      titulo: 'Asistencia Humanitaria',
      detalle:
        'Apoyo logístico, distribución de suministros esenciales y soporte psicológico y social a comunidades afectadas.',
    },
  ];

  return (
    <div className="bg-white font-sans text-neutral-950">
      {/* =====================================================================
          1. PORTADA PRINCIPAL (HERO EDITORIAL CORPORATIVO)
      ===================================================================== */}
      <section className="border-b-4 border-amber-400 bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Columna Izquierda: Posicionamiento Institucional */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-block rounded bg-red-600 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-md shadow-red-950/70">
                Protección Civil · Búsqueda y Rescate · Biobío
              </div>

              <h1 className="text-4xl font-black uppercase leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Preparados para responder,{' '}
                <span className="text-amber-400">
                  comprometidos con la vida.
                </span>
              </h1>

              <p className="max-w-2xl text-base font-semibold leading-relaxed text-neutral-200 sm:text-lg">
                Organización No Gubernamental de carácter técnico dedicada a la
                prevención, búsqueda, rescate y gestión de emergencias. Operamos
                con disciplina, equipamiento especializado y coordinación
                interinstitucional.
              </p>

              {/* Acciones Principales */}
              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Link
                  to="/apoyo"
                  className="inline-flex items-center justify-center gap-2.5 rounded bg-red-600 px-7 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/60 transition-colors hover:bg-red-700 sm:text-sm"
                >
                  <Building2 size={18} />
                  <span>Solicitar Apoyo Institucional</span>
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/postular"
                  className="inline-flex items-center justify-center gap-2.5 rounded bg-amber-400 px-7 py-4 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-950/40 transition-colors hover:bg-amber-300 sm:text-sm"
                >
                  <UserPlus size={18} />
                  <span>Postular como Voluntario</span>
                </Link>
              </div>

              {/* Acreditación Jurídica */}
              <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-neutral-800 pt-6 text-xs font-extrabold uppercase tracking-wider text-neutral-300">
                <div className="flex items-center gap-2">
                  <FileCheck2 size={17} className="text-red-500" />
                  <span>Constituida bajo Ley N° 20.500</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={17} className="text-amber-400" />
                  <span>Sin fines de lucro · Carácter Técnico</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Fotografía Real en Terreno + Ficha Operativa */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-lg border-2 border-neutral-800 bg-neutral-900 shadow-2xl shadow-black">
                <div className="relative h-72 bg-neutral-800 sm:h-80">
                  <img
                    src={fotoPrincipal}
                    alt="Operaciones O.N.G. BRE BIO BIO en terreno"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-red-600 bg-black/90 px-5 py-3">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      O.N.G. BRE BIO BIO
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Servicio y Vocación
                    </span>
                  </div>
                </div>

                <div className="space-y-3 bg-neutral-900 p-6">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 text-xs">
                    <span className="font-bold uppercase text-neutral-400">
                      Jurisdicción Base
                    </span>
                    <span className="font-black text-white">
                      Región del Biobío, Chile
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 text-xs">
                    <span className="font-bold uppercase text-neutral-400">
                      Alcance Operativo
                    </span>
                    <span className="font-black text-amber-400">
                      Regional y Nacional
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase text-neutral-400">
                      Estándar de Personal
                    </span>
                    <span className="font-black text-white">
                      Evaluado y Acreditado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. INDICADORES INSTITUCIONALES (CONTRASTE NEGRO / ROJO / AMARILLO)
      ===================================================================== */}
      <section className="border-b-2 border-neutral-800 bg-neutral-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div className="border-l-4 border-red-600 pl-4">
              <p className="text-2xl font-black uppercase text-white sm:text-3xl">
                5 Áreas
              </p>
              <p className="mt-0.5 text-xs font-extrabold uppercase tracking-wider text-neutral-300">
                Especialidades Técnicas
              </p>
            </div>
            <div className="border-l-4 border-amber-400 pl-4">
              <p className="text-2xl font-black uppercase text-white sm:text-3xl">
                24 / 7
              </p>
              <p className="mt-0.5 text-xs font-extrabold uppercase tracking-wider text-neutral-300">
                Disponibilidad de Activación
              </p>
            </div>
            <div className="border-l-4 border-red-600 pl-4">
              <p className="text-2xl font-black uppercase text-white sm:text-3xl">
                100%
              </p>
              <p className="mt-0.5 text-xs font-extrabold uppercase tracking-wider text-neutral-300">
                Personal Auditado
              </p>
            </div>
            <div className="border-l-4 border-amber-400 pl-4">
              <p className="text-2xl font-black uppercase text-white sm:text-3xl">
                Chile
              </p>
              <p className="mt-0.5 text-xs font-extrabold uppercase tracking-wider text-neutral-300">
                Cobertura Nacional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. ESPECIALIDADES OPERATIVAS (BASE BLANCA Y SOMBRAS ARQUITECTÓNICAS)
      ===================================================================== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 border-l-4 border-red-600 pl-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
              Capacidades Técnicas
            </span>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
              Nuestras Especialidades
            </h2>
            <p className="mt-2 max-w-2xl text-base font-semibold text-neutral-800">
              Células operativas entrenadas bajo protocolos estandarizados para
              intervenir con eficacia en emergencias, catástrofes y rescates
              complejos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {especialidades.map((esp) => {
              const IconComponent = esp.icon;
              return (
                <div
                  key={esp.codigo}
                  className="flex flex-col justify-between rounded-lg border-2 border-neutral-950 bg-white p-7 shadow-[6px_6px_0px_0px_#0a0a0a] transition-all hover:border-red-600 hover:shadow-[6px_6px_0px_0px_#dc2626]"
                >
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded border-b-4 border-red-600 bg-black text-amber-400">
                        <IconComponent size={24} />
                      </div>
                      <span className="rounded border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-neutral-950">
                        {esp.codigo}
                      </span>
                    </div>

                    <h3 className="mb-2.5 text-xl font-black uppercase text-black">
                      {esp.titulo}
                    </h3>
                    <p className="text-sm font-semibold leading-relaxed text-neutral-800">
                      {esp.descripcion}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 text-xs font-black uppercase text-neutral-900">
                    <span>Estándar Operativo BRE</span>
                    <span className="h-2.5 w-2.5 bg-red-600" />
                  </div>
                </div>
              );
            })}

            {/* Tarjeta Institucional en Rojo */}
            <div className="flex flex-col justify-between rounded-lg border-2 border-black bg-red-600 p-7 text-white shadow-[6px_6px_0px_0px_#0a0a0a]">
              <div>
                <span className="mb-5 inline-block rounded bg-black px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-400">
                  Acreditación Oficial
                </span>
                <h3 className="mb-3 text-2xl font-black uppercase leading-tight">
                  Personal Evaluado y Certificado
                </h3>
                <p className="text-sm font-semibold leading-relaxed text-white">
                  Cada miembro activo cumple un proceso formal de postulación,
                  instrucción técnica y validación documental auditada por
                  nuestro Directorio.
                </p>
              </div>
              <Link
                to="/nosotros"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded bg-black px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-900"
              >
                <span>Ver Estructura Institucional</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. GALERÍA AUTOMÁTICA DE ACTIVIDAD EN TERRENO
      ===================================================================== */}
      <section className="border-y-2 border-neutral-300 bg-neutral-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="border-l-4 border-amber-500 pl-5">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-800">
                Registro Operativo
              </span>
              <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
                Despliegue y Capacitación en Terreno
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded border-2 border-neutral-900 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-900 shadow-sm">
              <Camera size={16} className="text-red-600" />
              <span>Archivo Fotográfico Institucional</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {galeriaMostrar.map((src, idx) => (
              <div
                key={idx}
                className="group overflow-hidden rounded-lg border-2 border-neutral-950 bg-white shadow-lg shadow-neutral-950/15"
              >
                <div className="relative h-64 overflow-hidden bg-neutral-900">
                  <img
                    src={src}
                    alt={`Registro operativo O.N.G. BRE BIO BIO #${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-amber-400 bg-neutral-950/90 px-4 py-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-white">
                      O.N.G. BRE BIO BIO
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                      Reg. #{String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. MARCO ESTATUTARIO Y GOBERNANZA (ARTÍCULO CUARTO)
      ===================================================================== */}
      <section className="bg-neutral-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-5">
              <span className="inline-block rounded bg-amber-400 px-3 py-1 text-xs font-black uppercase tracking-widest text-black">
                Gobernanza y Respaldo Legal
              </span>
              <h2 className="text-3xl font-black uppercase leading-tight sm:text-4xl">
                Organización Formal y Compromiso Comunitario
              </h2>
              <p className="text-base font-semibold leading-relaxed text-neutral-200">
                Regida por el Título XXXIII del Libro Primero del Código Civil y
                la Ley N° 20.500. Nuestra estructura contempla Directorio,
                Comisión Revisora de Cuentas y Comisión de Ética para garantizar
                transparencia y probidad.
              </p>

              <ul className="space-y-3 pt-2 text-sm font-bold text-white">
                <li className="flex items-center gap-3">
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-amber-400"
                  />
                  <span>
                    Colaboración directa con Estamentos Públicos y Privados
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-amber-400"
                  />
                  <span>
                    Sin fines de lucro ni afiliación político-partidista
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-amber-400"
                  />
                  <span>
                    Investigación y desarrollo en técnicas de rescate
                  </span>
                </li>
              </ul>

              <div className="pt-4">
                <Link
                  to="/nosotros"
                  className="inline-flex items-center gap-2 rounded bg-white px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-colors hover:bg-neutral-200"
                >
                  <span>Conocer Estatutos y Directorio</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
              {ambitosEstatutarios.map((amb) => (
                <div
                  key={amb.numero}
                  className="rounded-lg border-2 border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/70"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded bg-red-600 px-2.5 py-1 text-xs font-black text-white">
                      {amb.numero}
                    </span>
                    <h3 className="text-lg font-black uppercase text-white">
                      {amb.titulo}
                    </h3>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-neutral-300">
                    {amb.detalle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. CANALES DE ACCIÓN DIRECTA
      ===================================================================== */}
      <section className="border-t-4 border-red-600 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Canal Institucional */}
            <div className="flex flex-col justify-between rounded-lg border-2 border-black bg-neutral-950 p-9 text-white shadow-[8px_8px_0px_0px_#dc2626]">
              <div>
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-red-500">
                  Empresas · Municipios · Organismos
                </span>
                <h3 className="mb-4 text-2xl font-black uppercase sm:text-3xl">
                  Solicitar Apoyo Técnico u Operativo
                </h3>
                <p className="mb-8 text-sm font-semibold leading-relaxed text-neutral-200 sm:text-base">
                  Coordina apoyo en emergencias, cobertura preventiva,
                  simulacros o capacitación en primeros auxilios y gestión de
                  riesgos para tu institución.
                </p>
              </div>
              <Link
                to="/apoyo"
                className="inline-flex items-center justify-center gap-2 rounded bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700"
              >
                <span>Ingresar Solicitud Institucional</span>
                <ArrowRight size={17} />
              </Link>
            </div>

            {/* Canal Postulantes */}
            <div className="flex flex-col justify-between rounded-lg border-2 border-black bg-amber-400 p-9 text-black shadow-[8px_8px_0px_0px_#0a0a0a]">
              <div>
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-neutral-900">
                  Reclutamiento Oficial
                </span>
                <h3 className="mb-4 text-2xl font-black uppercase sm:text-3xl">
                  Postulación de Voluntarios y Colaboradores
                </h3>
                <p className="mb-8 text-sm font-bold leading-relaxed text-neutral-950 sm:text-base">
                  Integra una institución organizada y preparada. Inicia tu
                  proceso formal de postulación, acredita tus certificaciones y
                  fórmate en terreno.
                </p>
              </div>
              <Link
                to="/postular"
                className="inline-flex items-center justify-center gap-2 rounded bg-black px-6 py-4 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-900"
              >
                <span>Postular a O.N.G. BRE BIO BIO</span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
