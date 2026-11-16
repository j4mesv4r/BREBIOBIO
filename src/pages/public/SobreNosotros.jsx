import { Link } from 'react-router-dom';
import OrganigramaDirectorio from '../../components/institucional/OrganigramaDirectorio';
import {
  Target,
  Eye,
  Scale,
  Users,
  ShieldCheck,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

export default function SobreNosotros() {
  const organos = [
    {
      icon: Users,
      codigo: 'ORG-01',
      titulo: 'Directorio Ejecutivo',
      desc: 'Órgano colegiado encargado de la dirección estratégica, representación legal, coordinación interinstitucional y supervisión operativa de la ONG.',
    },
    {
      icon: ShieldCheck,
      codigo: 'ORG-02',
      titulo: 'Comisión de Ética',
      desc: 'Vela por el cumplimiento estricto de los estatutos, la disciplina en terreno, el código de conducta y la probidad de todos los miembros.',
    },
    {
      icon: Scale,
      codigo: 'ORG-03',
      titulo: 'Comisión Revisora de Cuentas',
      desc: 'Audita la gestión financiera, el inventario logístico y la rendición de cuentas conforme a los principios de transparencia sin fines de lucro.',
    },
  ];

  return (
    <div className="bg-white font-sans text-neutral-950">
      {/* Cabecera Institucional */}
      <section className="border-b-4 border-amber-400 bg-neutral-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-l-4 border-red-600 pl-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Marco Jurídico · Ley N° 20.500
            </span>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Institución y Estatutos
            </h1>
            <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-neutral-300">
              La O.N.G. BRE BIO BIO es una persona jurídica de Derecho Privado
              sin fines de lucro, regida por el Título XXXIII del Libro Primero
              del Código Civil y la Ley N° 20.500, dedicada a proteger y salvar
              vidas en la Región del Biobío y a nivel nacional.
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border-2 border-neutral-950 bg-white p-8 shadow-[6px_6px_0px_0px_#dc2626]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded border-b-4 border-red-600 bg-black text-amber-400">
                  <Target size={22} />
                </div>
                <h2 className="text-2xl font-black uppercase text-black">
                  Nuestra Misión
                </h2>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-neutral-800 sm:text-base">
                Proteger y salvar vidas mediante la prevención, cuidado y
                búsqueda de personas en situaciones de emergencia, en estrecha
                colaboración con Estamentos Públicos y Privados, a través de la
                implementación de programas de capacitación, respuesta rápida y
                asistencia en desastres naturales.
              </p>
            </div>

            <div className="rounded-lg border-2 border-neutral-950 bg-neutral-950 p-8 text-white shadow-[6px_6px_0px_0px_#facc15]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded border-b-4 border-amber-400 bg-red-600 text-white">
                  <Eye size={22} />
                </div>
                <h2 className="text-2xl font-black uppercase text-white">
                  Nuestra Visión
                </h2>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-neutral-200 sm:text-base">
                Ser líder en la respuesta a emergencias y desastres, reconocida
                por su eficacia técnica, profesionalismo y compromiso con la
                seguridad y bienestar de la comunidad, contribuyendo a construir
                una sociedad más resiliente y preparada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gobernanza y Transparencia */}
      <section className="border-y-2 border-neutral-300 bg-neutral-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 border-l-4 border-red-600 pl-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
              Estructura Estatutaria
            </span>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-black">
              Gobernanza y Control Interno
            </h2>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {organos.map((org, idx) => {
              const Icon = org.icon;
              return (
                <div key={org.codigo} className="escena-3d">
                  <div
                    className={`${
                      idx % 2 === 0
                        ? 'tarjeta-3d'
                        : 'tarjeta-3d tarjeta-3d-inversa'
                    } sombra-volumetrica-clara h-full rounded-lg border-2 border-neutral-950 bg-white p-7 hover:border-red-600`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="capa-z-10 flex h-11 w-11 items-center justify-center rounded border-b-4 border-red-600 bg-black text-amber-400">
                        <Icon size={22} />
                      </div>
                      <span className="rounded border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-xs font-black uppercase tracking-widest text-neutral-900">
                        {org.codigo}
                      </span>
                    </div>
                    <h3 className="capa-z-10 mb-2 text-lg font-black uppercase text-black">
                      {org.titulo}
                    </h3>
                    <p className="text-sm font-semibold leading-relaxed text-neutral-700">
                      {org.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-lg border-2 border-black bg-white p-7 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <FileCheck2 size={28} className="mt-0.5 shrink-0 text-red-600" />
              <div>
                <h4 className="text-base font-black uppercase text-black">
                  Acreditación de Personal en Terreno
                </h4>
                <p className="text-sm font-semibold text-neutral-700">
                  Cualquier institución o ciudadano puede verificar las
                  certificaciones vigentes de un voluntario mediante su ficha
                  pública por RUT.
                </p>
              </div>
            </div>
            <Link
              to="/apoyo"
              className="inline-flex shrink-0 items-center gap-2 rounded bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700"
            >
              <span>Solicitar Apoyo</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <OrganigramaDirectorio />
    </div>
  );
}
