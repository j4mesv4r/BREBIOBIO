import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';

export default function Postular() {
  const etapas = [
    {
      paso: '01',
      titulo: 'Registro de Postulante',
      desc: 'Crea tu cuenta en la plataforma web e ingresa tus datos de identificación y contacto.',
    },
    {
      paso: '02',
      titulo: 'Acreditación Documental',
      desc: 'Sube tus certificados previos de capacitación, primeros auxilios o experiencia en terreno.',
    },
    {
      paso: '03',
      titulo: 'Evaluación e Instrucción',
      desc: 'El Directorio revisa tu ficha y coordina tu ingreso al ciclo de instrucción como Colaborador.',
    },
  ];

  return (
    <div className="bg-white font-sans text-neutral-950">
      {/* Cabecera */}
      <section className="border-b-4 border-amber-400 bg-neutral-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-l-4 border-red-600 pl-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Reclutamiento Oficial · BRE Biobío
            </span>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Postulación de Voluntarios
            </h1>
            <p className="mt-3 max-w-2xl text-base font-semibold text-neutral-300">
              Todo aspirante ingresa en calidad de Postulante para ser evaluado
              e instruido antes de su acreditación definitiva como Voluntario
              Operativo.
            </p>
          </div>
        </div>
      </section>

      {/* Requisitos y CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="border-l-4 border-red-600 pl-4">
                <h2 className="flex items-center gap-2 text-2xl font-black uppercase text-black">
                  <ClipboardCheck className="text-red-600" size={26} />
                  Requisitos Generales de Ingreso
                </h2>
              </div>

              <ul className="space-y-3 text-sm font-bold text-neutral-800 sm:text-base">
                <li className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <span>Ser mayor de 18 años.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <span>
                    Salud física y mental compatible con operaciones de búsqueda
                    y rescate en terreno.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <span>
                    Disposición formal para asistir a capacitaciones,
                    acuartelamientos y simulacros.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <span>
                    Acatar los estatutos, reglamento interno y código de ética
                    de la O.N.G. BRE BIO BIO.
                  </span>
                </li>
              </ul>

              <div className="grid gap-5 pt-4 sm:grid-cols-3">
                {etapas.map((etapa) => (
                  <div
                    key={etapa.paso}
                    className="rounded-lg border-2 border-neutral-950 bg-neutral-50 p-5"
                  >
                    <span className="inline-block rounded bg-red-600 px-2.5 py-0.5 text-xs font-black text-white">
                      {etapa.paso}
                    </span>
                    <h3 className="mt-3 text-sm font-black uppercase text-black">
                      {etapa.titulo}
                    </h3>
                    <p className="mt-1.5 text-xs font-semibold leading-relaxed text-neutral-700">
                      {etapa.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-lg border-2 border-black bg-amber-400 p-8 text-black shadow-[8px_8px_0px_0px_#0a0a0a]">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-neutral-900">
                  Proceso 100% Digital
                </span>
                <h3 className="mb-4 text-2xl font-black uppercase">
                  Inicia tu Postulación
                </h3>
                <p className="mb-8 text-sm font-bold leading-relaxed text-neutral-950">
                  Al completar el registro crearás tu ficha inicial en la
                  intranet de BRE Biobío. Podrás cargar tus certificaciones y
                  seguir el estado de tu evaluación en línea.
                </p>
                <Link
                  to="/registro"
                  className="inline-flex w-full items-center justify-center gap-2 rounded bg-black px-6 py-4 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-900 sm:text-sm"
                >
                  <UserPlus size={18} />
                  <span>Comenzar Registro</span>
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
