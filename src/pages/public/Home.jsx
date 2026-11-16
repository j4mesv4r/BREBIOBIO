import { Link } from 'react-router-dom';
import {
  Search,
  ShieldAlert,
  Crosshair,
  Mountain,
  LifeBuoy,
} from 'lucide-react';

export default function Home() {
  const especialidades = [
    {
      icon: Search,
      title: 'BÚSQUEDA',
      desc: 'Localización de personas extraviadas',
    },
    {
      icon: ShieldAlert,
      title: 'RESCATE EN TERRENO',
      desc: 'Operaciones en áreas urbanas y rurales',
    },
    {
      icon: Crosshair,
      title: 'PRIMEROS AUXILIOS',
      desc: 'Atención médica de emergencia inicial',
    },
    {
      icon: Mountain,
      title: 'RESCATE EN ALTURA',
      desc: 'Manejo de cuerdas y extracción',
    },
    {
      icon: LifeBuoy,
      title: 'EMERGENCIAS Y DESASTRES',
      desc: 'Respuesta rápida ante catástrofes',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center bg-black py-24 text-white lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1543333995-a78aea2eee50?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Rescatistas en acción"
            className="h-full w-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        <div className="container relative z-10 mx-auto flex flex-col items-center px-4 text-center">
          <h2 className="mb-2 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-4xl font-black italic tracking-widest text-transparent drop-shadow-lg md:text-6xl">
            BÚSQUEDA · RESCATE · EMERGENCIA
          </h2>
          <div className="mb-6 h-2 w-24 bg-red-600"></div>

          <h3 className="mb-8 max-w-3xl text-xl font-bold italic tracking-wide text-yellow-500 drop-shadow-md md:text-3xl">
            PREPARADOS PARA RESPONDER, COMPROMETIDOS CON LA VIDA
          </h3>

          <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/apoyo"
              className="rounded-full border-2 border-red-600 bg-red-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:bg-red-700"
            >
              Solicitar Apoyo
            </Link>
            <Link
              to="/nosotros"
              className="rounded-full border-2 border-white bg-black/50 px-8 py-3 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-gray-300 hover:bg-white/10"
            >
              Conocer Más
            </Link>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="relative bg-white py-20">
        <div className="absolute left-0 top-0 z-10 w-full -translate-y-full transform overflow-hidden leading-none">
          <svg
            className="relative block h-[40px] w-full"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M1200 120L0 120 0 0 1200 120z" className="fill-white"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4">
          <div className="mb-16 flex justify-center">
            <div className="-skew-x-12 transform border-b-4 border-black bg-red-600 px-10 py-3 text-white shadow-xl">
              <h3 className="skew-x-12 text-2xl font-black italic tracking-wider">
                NUESTRAS ESPECIALIDADES
              </h3>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 text-center md:grid-cols-3 lg:grid-cols-5">
            {especialidades.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group flex cursor-default flex-col items-center"
                >
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-gray-50 shadow-inner transition-all duration-300 group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white">
                    <Icon size={40} strokeWidth={2.5} />
                  </div>
                  <h4 className="mb-2 text-lg font-black">{item.title}</h4>
                  <p className="px-2 text-sm text-gray-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Voluntarios */}
      <section className="relative overflow-hidden bg-gray-900 py-24 text-white">
        <div className="container relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h3 className="mb-6 text-4xl font-bold tracking-wide">
            ¿Tienes vocación de servicio?
          </h3>
          <div className="mx-auto mb-8 h-1 w-16 bg-red-600"></div>
          <p className="mb-10 text-xl leading-relaxed text-gray-300">
            Forma parte de BRE Biobío. Nuestros voluntarios pasan por un riguroso
            proceso de postulación y capacitación técnica continua.
          </p>
          <Link
            to="/postular"
            className="inline-block rounded-full bg-white px-10 py-4 text-lg font-black text-black shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:bg-red-600 hover:text-white hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
          >
            POSTULA AQUÍ
          </Link>
        </div>
      </section>
    </>
  );
}
