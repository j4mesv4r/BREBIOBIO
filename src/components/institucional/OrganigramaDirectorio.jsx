import { Shield } from 'lucide-react';

// Edita aquí los nombres reales cuando lo desees
const DIRECTIVA_ACTUAL = {
  director: {
    cargoInterno: 'Director',
    cargoLegal: 'Presidente Legal · Representante Judicial y Extrajudicial',
    nombre: 'Nombre del Director',
    especialidad: 'Mando Institucional y Protección Civil',
    foto: '/directorio/director.jpg',
    iniciales: 'DIR',
  },
  tesorero: {
    cargoInterno: 'Tesorero',
    cargoLegal: 'Administración Financiera y Patrimonio',
    nombre: 'Nombre del Tesorero',
    especialidad: 'Gestión Contable e Inventario',
    foto: '/directorio/tesorero.jpg',
    iniciales: 'TES',
  },
  secretario: {
    cargoInterno: 'Secretario',
    cargoLegal: 'Ministro de Fe y Registro Oficial',
    nombre: 'Nombre del Secretario',
    especialidad: 'Actas, Gobernanza y Acreditación',
    foto: '/directorio/secretario.jpg',
    iniciales: 'SEC',
  },
  directorOperativo: {
    cargoInterno: 'Director Operativo',
    cargoLegal: 'Designado por el Director · Jefatura de Terreno',
    nombre: 'Nombre del Director Operativo',
    especialidad: 'Despliegue SAR, Rescate y Emergencias',
    foto: '/directorio/director-operativo.jpg',
    iniciales: 'OPE',
  },
};

function TarjetaMando({ persona, variante = 'estandar', badge }) {
  const esPrincipal = variante === 'director';
  const esOperativo = variante === 'operativo';

  return (
    <div className="escena-3d w-full">
      <div
        className={`tarjeta-3d overflow-hidden rounded-xl border-2 transition-colors ${
          esPrincipal
            ? 'sombra-volumetrica-oscura border-red-600 bg-neutral-950 text-white'
            : esOperativo
              ? 'sombra-volumetrica-oscura border-amber-400 bg-neutral-900 text-white'
              : 'sombra-volumetrica-clara border-neutral-900 bg-white text-neutral-950'
        }`}
      >
        {/* Franja Superior */}
        <div
          className={`flex items-center justify-between px-4 py-2 text-[11px] font-black uppercase tracking-widest ${
            esPrincipal
              ? 'bg-red-600 text-white'
              : esOperativo
                ? 'bg-amber-400 text-black'
                : 'bg-neutral-950 text-amber-400'
          }`}
        >
          <span>{badge}</span>
          <Shield size={14} />
        </div>

        {/* Contenedor Fotográfico con Relieve */}
        <div className="flex flex-col items-center p-6 text-center">
          <div
            className={`capa-z-10 mb-4 h-28 w-28 overflow-hidden rounded-full border-4 shadow-xl sm:h-32 sm:w-32 ${
              esPrincipal
                ? 'border-amber-400 bg-neutral-800'
                : esOperativo
                  ? 'border-red-600 bg-neutral-800'
                  : 'border-neutral-950 bg-neutral-100'
            }`}
          >
            <img
              src={persona.foto}
              alt={`${persona.cargoInterno} - O.N.G. BRE BIO BIO`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden h-full w-full items-center justify-center text-2xl font-black tracking-wider text-neutral-400">
              {persona.iniciales}
            </div>
          </div>

          <h3
            className={`capa-z-20 text-xl font-black uppercase tracking-tight ${
              esPrincipal || esOperativo ? 'text-white' : 'text-black'
            }`}
          >
            {persona.cargoInterno}
          </h3>

          <p
            className={`mt-1 text-xs font-extrabold uppercase tracking-wider ${
              esPrincipal
                ? 'text-amber-400'
                : esOperativo
                  ? 'text-red-400'
                  : 'text-red-600'
            }`}
          >
            {persona.cargoLegal}
          </p>

          <div
            className={`my-3.5 h-1 w-12 rounded-full ${
              esPrincipal
                ? 'bg-red-600'
                : esOperativo
                  ? 'bg-amber-400'
                  : 'bg-neutral-900'
            }`}
          />

          <p
            className={`text-base font-black ${
              esPrincipal || esOperativo ? 'text-white' : 'text-neutral-900'
            }`}
          >
            {persona.nombre}
          </p>

          <p
            className={`mt-1 text-xs font-semibold ${
              esPrincipal || esOperativo
                ? 'text-neutral-300'
                : 'text-neutral-600'
            }`}
          >
            {persona.especialidad}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrganigramaDirectorio() {
  return (
    <section className="border-y-2 border-neutral-300 bg-neutral-100 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado de Sección */}
        <div className="mb-16 max-w-3xl">
          <span className="mb-3 inline-block rounded bg-black px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-400">
            Gobernanza y Mando Institucional
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-black sm:text-5xl">
            Directorio Actual
          </h2>
          <p className="mt-3 text-base font-semibold leading-relaxed text-neutral-700 sm:text-lg">
            Estructura directiva constituida conforme a nuestros estatutos
            vigentes, articulando la representación legal con la conducción
            operativa en terreno.
          </p>
        </div>

        {/* =================================================================
            ARQUITECTURA DEL ORGANIGRAMA
        ================================================================= */}
        <div className="relative">
          {/* NIVEL 1: DIRECTORIO ESTATUTARIO (DIRECTOR, TESORERO, SECRETARIO) */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            {/* Columna 1: Tesorero */}
            <div className="order-2 lg:order-1 lg:mt-10">
              <TarjetaMando
                persona={DIRECTIVA_ACTUAL.tesorero}
                badge="Directorio · Finanzas"
              />
            </div>

            {/* Columna 2 (Centro): DIRECTOR (Presidente Legal) */}
            <div className="relative order-1 lg:order-2">
              <TarjetaMando
                persona={DIRECTIVA_ACTUAL.director}
                variante="director"
                badge="Máxima Autoridad · Directorio"
              />

              {/* Línea Conectora Vertical hacia Director Operativo (Desktop) */}
              <div className="hidden flex-col items-center lg:flex">
                <div className="h-12 w-1 bg-red-600" />
                <div className="rounded border-2 border-red-600 bg-black px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400 shadow-md">
                  Designación Directa
                </div>
                <div className="h-10 w-1 bg-red-600" />
              </div>
            </div>

            {/* Columna 3: Secretario */}
            <div className="order-3 lg:mt-10">
              <TarjetaMando
                persona={DIRECTIVA_ACTUAL.secretario}
                badge="Directorio · Ministro de Fe"
              />
            </div>
          </div>

          {/* Conector móvil hacia Director Operativo */}
          <div className="my-4 flex flex-col items-center lg:hidden">
            <div className="h-8 w-1 bg-red-600" />
            <span className="rounded bg-black px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
              Designado por el Director
            </span>
            <div className="h-8 w-1 bg-red-600" />
          </div>

          {/* NIVEL 2: DIRECTOR OPERATIVO (SALE DESDE EL DIRECTOR) */}
          <div className="mx-auto max-w-md">
            <TarjetaMando
              persona={DIRECTIVA_ACTUAL.directorOperativo}
              variante="operativo"
              badge="Mando Táctico y Terreno"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

