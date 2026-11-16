import { Link } from 'react-router-dom';
import { ClipboardCheck, ArrowRight } from 'lucide-react';

export default function Postular() {
  return (
    <div className="bg-white">
      <div className="bg-black py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black italic tracking-wider">
            ÚNETE A BRE BIOBÍO
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 bg-red-600"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold">
              El proceso de Voluntariado
            </h2>
            <p className="mb-6 text-lg text-gray-700">
              Ser miembro de BRE Biobío requiere compromiso, disciplina y
              vocación real. Todo aspirante ingresa primero en calidad de{' '}
              <strong>Postulante</strong>, periodo durante el cual podrá
              desarrollarse como Colaborador hasta aprobar su paso definitivo al
              Equipo de Voluntarios.
            </p>

            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <ClipboardCheck className="text-red-600" /> Requisitos Generales
            </h3>
            <ul className="space-y-3 font-medium text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">•</span> Ser mayor de
                18 años.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">•</span> Salud física y
                mental compatible con el trabajo de emergencias.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">•</span> Disposición
                para asistir a capacitaciones y simulacros.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">•</span> Acatar los
                estatutos y normativas de la O.N.G.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-100 p-8 text-center">
            <h3 className="mb-4 text-2xl font-black">¿Estás listo?</h3>
            <p className="mb-8 text-gray-600">
              Al iniciar el registro, crearás tu perfil de Postulante en nuestra
              plataforma. El equipo evaluará tus antecedentes para contactarte.
            </p>
            <Link
              to="/registro"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-red-700"
            >
              Comenzar Registro <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

