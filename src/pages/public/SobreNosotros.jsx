import { Target, Eye } from 'lucide-react';

export default function SobreNosotros() {
  return (
    <div className="bg-white">
      <div className="bg-black py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black italic tracking-wider">
            QUIÉNES SOMOS
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 bg-red-600"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mx-auto text-gray-700">
          <p className="mb-12 text-center text-xl font-medium leading-relaxed">
            La O.N.G. BRE BIO BIO es una organización de Derecho Privado sin
            fines de lucro, constituida para proteger y salvar vidas en
            situaciones de emergencia en la Región del Bío Bío.
          </p>

          <div className="mt-16 grid gap-12 md:grid-cols-2">
            <div className="rounded-xl border-t-4 border-red-600 bg-gray-50 p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-3 text-red-600">
                <Target size={32} />
                <h3 className="m-0 text-2xl font-black">NUESTRA MISIÓN</h3>
              </div>
              <p className="leading-relaxed">
                Proteger y salvar vidas mediante la prevención, cuidado y
                búsqueda de personas en situaciones de emergencia, en estrecha
                colaboración con Estamentos Públicos y Privados, a través de la
                implementación de programas de capacitación, respuesta rápida y
                asistencia en desastres naturales.
              </p>
            </div>

            <div className="rounded-xl border-t-4 border-black bg-gray-50 p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-3 text-black">
                <Eye size={32} />
                <h3 className="m-0 text-2xl font-black">NUESTRA VISIÓN</h3>
              </div>
              <p className="leading-relaxed">
                Ser líder en la respuesta a emergencias y desastres, con un
                compromiso férreo a ser reconocida por su eficacia,
                profesionalismo y compromiso con la seguridad y bienestar de la
                comunidad, contribuyendo a crear una sociedad más resiliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

