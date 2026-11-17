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
  const fotoPrincipal = fotosTerreno[0] || null;
  const galeriaMostrar = fotosTerreno;

  const especialidades = [
    {
      icon: Compass,
      titulo: 'Búsqueda Especializada',
      descripcion:
        'Rastreo sistemático y georreferenciado de personas extraviadas en zonas agrestes y urbanas.',
    },
    {
      icon: Shield,
      titulo: 'Rescate en Terreno',
      descripcion:
        'Extracción segura, estabilización y evacuación bajo estándares de protección civil.',
    },
    {
      icon: HeartPulse,
      titulo: 'Primeros Auxilios',
      descripcion:
        'Atención prehospitalaria inmediata en el punto del incidente antes del traslado médico.',
    },
    {
      icon: Mountain,
      titulo: 'Rescate en Altura',
      descripcion:
        'Maniobras técnicas con cuerdas, anclajes y polipastos en pendientes y estructuras.',
    },
    {
      icon: Flame,
      titulo: 'Emergencias y Desastres',
      descripcion:
        'Despliegue rápido ante terremotos, inundaciones, incendios forestales y remociones.',
    },
  ];

  return (
    <div className="overflow-x-hidden bg-white font-sans text-[#17191D]">
      {/* 1. Portada Principal */}
      <section className="border-b-4 border-[#F2B632] bg-[#17191D] text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
            {/* Mensaje Institucional */}
            <div className="space-y-7 lg:col-span-7">
              <div className="inline-flex items-center rounded bg-[#C8202F] px-4 py-1.5 text-xs font-bold tracking-wide text-white shadow-md">
                O.N.G. BRE BIO BIO · Región del Biobío
              </div>

              <h1 className="max-w-2xl text-4xl font-black leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Preparados para responder, comprometidos con la vida.
              </h1>

              <p className="max-w-xl text-base font-semibold leading-relaxed text-neutral-300 sm:text-lg">
                Organización No Gubernamental de carácter técnico especializada
                en prevención, búsqueda, rescate y gestión de emergencias.
              </p>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Link
                  to="/apoyo"
                  className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#C8202F] px-7 py-4 text-sm font-bold tracking-wide text-white shadow-lg transition-colors hover:bg-[#a91926]"
                >
                  <Building2 size={18} />
                  <span>Solicitar Apoyo Institucional</span>
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/postular"
                  className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#F2B632] px-7 py-4 text-sm font-bold tracking-wide text-[#17191D] shadow-lg transition-colors hover:bg-[#eab308]"
                >
                  <UserPlus size={18} />
                  <span>Postular como Voluntario</span>
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-neutral-800 pt-6 text-xs font-bold tracking-wide text-neutral-300">
                <span className="flex items-center gap-2">
                  <FileCheck2 size={16} className="text-[#C8202F]" />
                  Personalidad Jurídica Ley N° 20.500
                </span>
                <span className="flex items-center gap-2">
                  <Shield size={16} className="text-[#F2B632]" />
                  Cobertura Regional y Nacional
                </span>
              </div>
            </div>

            {/* Tarjeta Visual Focal 3D */}
            <div className="escena-3d lg:col-span-5">
              <div className="tarjeta-3d sombra-volumetrica-oscura overflow-hidden rounded-2xl border-2 border-neutral-800 bg-[#17191D]">
                <div className="relative flex h-80 items-center justify-center bg-neutral-900 sm:h-96">
                  {fotoPrincipal ? (
                    <>
                      <img
                        src={fotoPrincipal}
                        alt="Operaciones ONG BRE BÍO-BÍO"
                        className="h-full w-full object-cover"
                      />
                      <div className="capa-z-20 absolute right-4 top-4 h-16 w-16 rounded-full border-2 border-[#C8202F] bg-white p-0.5 shadow-2xl">
                        <img
                          src="/logo-bre.png"
                          alt="Emblema oficial ONG BRE BÍO-BÍO"
                          className="h-full w-full rounded-full object-contain"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center p-8 text-center">
                      <img
                        src="/logo-bre.png"
                        alt="Emblema oficial ONG BRE BÍO-BÍO"
                        className="mb-4 h-40 w-40 object-contain"
                      />
                      <p className="text-sm font-bold tracking-wide text-neutral-300">
                        Búsqueda · Rescate · Emergencia
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-[#C8202F] bg-[#17191D]/95 px-6 py-4">
                    <span className="text-xs font-extrabold tracking-wide text-white">
                      SERVICIO Y VOCACIÓN
                    </span>
                    <span className="text-xs font-extrabold tracking-wide text-[#F2B632]">
                      Biobío · Chile
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Especialidades Operativas */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 max-w-2xl border-l-4 border-[#C8202F] pl-5">
            <h2 className="text-3xl font-black tracking-tight text-[#17191D] sm:text-4xl">
              Nuestras Especialidades
            </h2>
            <p className="mt-2 text-base font-semibold text-neutral-700">
              Células operativas entrenadas para intervenir con eficacia en
              emergencias, catástrofes y rescates complejos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {especialidades.map((esp) => {
              const IconComponent = esp.icon;
              return (
                <div
                  key={esp.titulo}
                  className="flex h-full flex-col justify-between rounded-xl border-2 border-[#17191D] bg-white p-8 shadow-[6px_6px_0px_0px_#17191D]"
                >
                  <div>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border-b-4 border-[#C8202F] bg-[#17191D] text-[#F2B632]">
                      <IconComponent size={24} />
                    </div>
                    <h3 className="mb-2.5 text-xl font-black text-[#17191D]">
                      {esp.titulo}
                    </h3>
                    <p className="text-sm font-semibold leading-relaxed text-neutral-700">
                      {esp.descripcion}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Bloque de Acreditación */}
            <div className="flex h-full flex-col justify-between rounded-xl border-2 border-[#17191D] bg-[#C8202F] p-8 text-white shadow-[6px_6px_0px_0px_#17191D]">
              <div>
                <h3 className="mb-3 text-2xl font-black leading-tight">
                  Personal Auditado y Certificado
                </h3>
                <p className="text-sm font-semibold leading-relaxed text-white/95">
                  Estructura formal con Directorio, Comisión de Ética y
                  validación documental de cada voluntario activo.
                </p>
              </div>
              <Link
                to="/nosotros"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#17191D] px-5 py-3.5 text-xs font-bold tracking-wide text-white transition-colors hover:bg-neutral-800"
              >
                <span>Ver Estatutos</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Directorio Actual */}
      <OrganigramaDirectorio />

      {/* 4. Actividad en Terreno */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="border-l-4 border-[#F2B632] pl-5">
              <h2 className="text-3xl font-black tracking-tight text-[#17191D] sm:text-4xl">
                Actividad en Terreno
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border-2 border-[#17191D] bg-neutral-50 px-4 py-2 text-xs font-bold text-[#17191D]">
              <Camera size={16} className="text-[#C8202F]" />
              <span>Despliegues y Simulacros</span>
            </div>
          </div>

          {galeriaMostrar.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-[#F3F4F6] p-10 text-center">
              <Camera size={32} className="mx-auto mb-3 text-[#C8202F]" />
              <p className="text-sm font-bold text-[#17191D]">
                Archivo fotográfico institucional en preparación
              </p>
              <p className="mt-1 text-xs font-semibold text-neutral-600">
                Las fotografías oficiales de operaciones y simulacros en{' '}
                <code>src/assets/terreno/</code> se mostrarán automáticamente
                aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {galeriaMostrar.map((src, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-xl border-2 border-[#17191D] bg-[#17191D] shadow-md"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={src}
                      alt={`Operación ONG BRE BÍO-BÍO #${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-[#F2B632] bg-[#17191D]/90 px-4 py-2.5">
                      <span className="text-xs font-bold text-white">
                        ONG BRE BÍO-BÍO
                      </span>
                      <span className="text-xs font-bold text-[#F2B632]">
                        Registro #{String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Canales de Acción Directa */}
      <section className="border-t-4 border-[#C8202F] bg-[#17191D] py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="flex h-full flex-col justify-between rounded-2xl border-2 border-neutral-800 bg-neutral-900 p-10">
              <div>
                <p className="mb-2 text-xs font-bold text-[#F2B632]">
                  Empresas · Municipios · Organismos
                </p>
                <h3 className="mb-4 text-2xl font-black sm:text-3xl">
                  Solicitar Apoyo Técnico u Operativo
                </h3>
                <p className="mb-8 max-w-prose text-sm font-semibold leading-relaxed text-neutral-300 sm:text-base">
                  Coordina apoyo en emergencias, cobertura preventiva,
                  simulacros o capacitación en primeros auxilios para tu
                  organización.
                </p>
              </div>
              <Link
                to="/apoyo"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8202F] px-6 py-4 text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#a91926]"
              >
                <span>Ingresar Solicitud Institucional</span>
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="flex h-full flex-col justify-between rounded-2xl border-2 border-[#F2B632] bg-[#F2B632] p-10 text-[#17191D]">
              <div>
                <p className="mb-2 text-xs font-bold text-[#17191D]">
                  Reclutamiento Oficial
                </p>
                <h3 className="mb-4 text-2xl font-black sm:text-3xl">
                  Postulación de Voluntarios
                </h3>
                <p className="mb-8 max-w-prose text-sm font-bold leading-relaxed text-[#17191D] sm:text-base">
                  Integra una institución organizada y preparada. Inicia tu
                  proceso formal, acredita tus conocimientos y fórmate en
                  terreno.
                </p>
              </div>
              <Link
                to="/postular"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#17191D] px-6 py-4 text-sm font-bold tracking-wide text-white transition-colors hover:bg-neutral-800"
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
