import { Link } from 'react-router-dom';
import { fotosTerreno } from '../../utils/galeriaAutomatica';
import OrganigramaDirectorio from '../../components/institucional/OrganigramaDirectorio';
import {
  Compass,
  Shield,
  HeartPulse,
  Mountain,
  Flame,
  Building2,
  UserPlus,
  ArrowRight,
  FileCheck2,
  Camera,
} from 'lucide-react';

export default function Home() {
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
      codigo: '01',
      titulo: 'Búsqueda Especializada',
      descripcion:
        'Rastreo sistemático y georreferenciado de personas extraviadas en zonas agrestes y urbanas.',
    },
    {
      icon: Shield,
      codigo: '02',
      titulo: 'Rescate en Terreno',
      descripcion:
        'Extracción segura, estabilización y evacuación bajo estándares de protección civil.',
    },
    {
      icon: HeartPulse,
      codigo: '03',
      titulo: 'Primeros Auxilios',
      descripcion:
        'Atención prehospitalaria inmediata en el punto del incidente antes del traslado médico.',
    },
    {
      icon: Mountain,
      codigo: '04',
      titulo: 'Rescate en Altura',
      descripcion:
        'Maniobras técnicas con cuerdas, anclajes y polipastos en pendientes y estructuras.',
    },
    {
      icon: Flame,
      codigo: '05',
      titulo: 'Emergencias y Desastres',
      descripcion:
        'Despliegue rápido ante terremotos, inundaciones, incendios forestales y remociones.',
    },
  ];

  return (
    <div className="overflow-x-hidden bg-white font-sans text-neutral-950">
      {/* =====================================================================
          1. PORTADA PRINCIPAL (HERO CON TARJETA 3D EN PERSPECTIVA)
      ===================================================================== */}
      <section className="border-b-4 border-amber-400 bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
            {/* Mensaje Ejecutivo */}
            <div className="space-y-7 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-950/80">
                <span>O.N.G. BRE BIO BIO · Chile</span>
              </div>

              <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Preparados para responder,{' '}
                <span className="block text-amber-400 sm:inline">
                  comprometidos con la vida.
                </span>
              </h1>

              <p className="max-w-xl text-base font-semibold leading-relaxed text-neutral-300 sm:text-lg">
                Organización No Gubernamental de carácter técnico especializada
                en prevención, búsqueda, rescate y gestión de emergencias.
              </p>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Link
                  to="/apoyo"
                  className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-red-600 px-7 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-red-950/70 transition-all hover:-translate-y-0.5 hover:bg-red-700 sm:text-sm"
                >
                  <Building2 size={18} />
                  <span>Solicitar Apoyo Institucional</span>
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/postular"
                  className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-amber-400 px-7 py-4 text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-black/50 transition-all hover:-translate-y-0.5 hover:bg-amber-300 sm:text-sm"
                >
                  <UserPlus size={18} />
                  <span>Postular como Voluntario</span>
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-neutral-800 pt-6 text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                <span className="flex items-center gap-2">
                  <FileCheck2 size={16} className="text-red-500" />
                  Personalidad Jurídica Ley N° 20.500
                </span>
                <span className="flex items-center gap-2">
                  <Shield size={16} className="text-amber-400" />
                  Cobertura Regional y Nacional
                </span>
              </div>
            </div>

            {/* Tarjeta Visual 3D en Perspectiva */}
            <div className="escena-3d lg:col-span-5">
              <div className="tarjeta-3d sombra-volumetrica-oscura overflow-hidden rounded-2xl border-2 border-neutral-800 bg-neutral-900">
                <div className="relative h-80 bg-neutral-800 sm:h-96">
                  <img
                    src={fotoPrincipal}
                    alt="Operaciones O.N.G. BRE BIO BIO"
                    className="h-full w-full object-cover"
                  />
                  {/* Sello flotante en eje Z */}
                  <div className="capa-z-20 absolute right-4 top-4 h-16 w-16 rounded-full border-2 border-red-600 bg-white p-0.5 shadow-2xl">
                    <img
                      src="/logo-bre.png"
                      alt="Escudo BRE"
                      className="h-full w-full rounded-full object-contain"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-red-600 bg-black/90 px-6 py-4">
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                      Servicio y Vocación
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                      Biobío · Chile
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. ESPECIALIDADES OPERATIVAS (TARJETAS 3D DESCOMPRIMIDAS)
      ===================================================================== */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
              Capacidades Técnicas
            </span>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-black sm:text-5xl">
              Nuestras Especialidades
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {especialidades.map((esp, idx) => {
              const IconComponent = esp.icon;
              return (
                <div key={esp.codigo} className="escena-3d">
                  <div
                    className={`${
                      idx % 2 === 0
                        ? 'tarjeta-3d'
                        : 'tarjeta-3d tarjeta-3d-inversa'
                    } sombra-volumetrica-clara flex h-full flex-col justify-between rounded-xl border-2 border-neutral-950 bg-white p-8 hover:border-red-600`}
                  >
                    <div>
                      <div className="mb-6 flex items-center justify-between">
                        <div className="capa-z-10 flex h-14 w-14 items-center justify-center rounded-lg border-b-4 border-red-600 bg-black text-amber-400 shadow-lg">
                          <IconComponent size={26} />
                        </div>
                        <span className="text-sm font-black text-neutral-300">
                          #{esp.codigo}
                        </span>
                      </div>

                      <h3 className="capa-z-10 mb-3 text-xl font-black uppercase text-black">
                        {esp.titulo}
                      </h3>
                      <p className="text-sm font-semibold leading-relaxed text-neutral-700">
                        {esp.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Tarjeta Institucional de Acreditación */}
            <div className="escena-3d">
              <div className="tarjeta-3d sombra-volumetrica-clara flex h-full flex-col justify-between rounded-xl border-2 border-black bg-red-600 p-8 text-white">
                <div>
                  <span className="mb-6 inline-block rounded bg-black px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-400">
                    Estándar Institucional
                  </span>
                  <h3 className="capa-z-10 mb-3 text-2xl font-black uppercase leading-tight">
                    Personal Auditado y Certificado
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-white/95">
                    Estructura formal con Directorio, Comisión de Ética y
                    validación documental de cada voluntario activo.
                  </p>
                </div>
                <Link
                  to="/nosotros"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-900"
                >
                  <span>Ver Estatutos</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. DIRECTORIO ACTUAL Y ORGANIGRAMA CON FOTOGRAFÍAS
      ===================================================================== */}
      <OrganigramaDirectorio />

      {/* =====================================================================
          4. REGISTRO EN TERRENO (GALERÍA AUTOMÁTICA CON RELIEVE 3D)
      ===================================================================== */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                Evidencia Operativa
              </span>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-black sm:text-5xl">
                Actividad en Terreno
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-100 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-900">
              <Camera size={16} className="text-red-600" />
              <span>Despliegues y Simulacros</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {galeriaMostrar.map((src, idx) => (
              <div key={idx} className="escena-3d">
                <div className="tarjeta-3d sombra-volumetrica-clara overflow-hidden rounded-xl border-2 border-neutral-900 bg-neutral-950">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={src}
                      alt={`Operación O.N.G. BRE BIO BIO #${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-amber-400 bg-black/85 px-4 py-2.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-white">
                        O.N.G. BRE BIO BIO
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. CANALES DE ACCIÓN DIRECTA (EMPRESAS/MUNICIPIOS VS VOLUNTARIOS)
      ===================================================================== */}
      <section className="border-t-4 border-red-600 bg-neutral-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="escena-3d">
              <div className="tarjeta-3d sombra-volumetrica-oscura flex h-full flex-col justify-between rounded-2xl border-2 border-neutral-800 bg-neutral-900 p-10 hover:border-red-600">
                <div>
                  <span className="mb-3 block text-xs font-black uppercase tracking-widest text-red-500">
                    Empresas · Municipios · Organismos
                  </span>
                  <h3 className="mb-4 text-2xl font-black uppercase sm:text-3xl">
                    Solicitar Apoyo Técnico u Operativo
                  </h3>
                  <p className="mb-8 text-sm font-semibold leading-relaxed text-neutral-300 sm:text-base">
                    Coordina apoyo en emergencias, cobertura preventiva,
                    simulacros o capacitación en primeros auxilios para tu
                    organización.
                  </p>
                </div>
                <Link
                  to="/apoyo"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700"
                >
                  <span>Ingresar Solicitud Institucional</span>
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            <div className="escena-3d">
              <div className="tarjeta-3d tarjeta-3d-inversa sombra-volumetrica-oscura flex h-full flex-col justify-between rounded-2xl border-2 border-amber-300 bg-amber-400 p-10 text-black">
                <div>
                  <span className="mb-3 block text-xs font-black uppercase tracking-widest text-neutral-900">
                    Reclutamiento Oficial
                  </span>
                  <h3 className="mb-4 text-2xl font-black uppercase sm:text-3xl">
                    Postulación de Voluntarios
                  </h3>
                  <p className="mb-8 text-sm font-bold leading-relaxed text-neutral-950 sm:text-base">
                    Integra una institución organizada y preparada. Inicia tu
                    proceso formal, acredita tus conocimientos y fórmate en
                    terreno.
                  </p>
                </div>
                <Link
                  to="/postular"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-4 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-900"
                >
                  <span>Postular a O.N.G. BRE BIO BIO</span>
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
