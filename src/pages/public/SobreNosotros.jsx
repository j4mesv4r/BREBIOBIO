import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Eye,
  Download,
  HeartHandshake,
  Send,
  FileText,
  CheckCircle2,
  User,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MEMORIAS_ANUALES = [
  {
    anio: '2025',
    titulo: 'Memoria Anual Institucional 2025',
    portada: '/memorias/portada-2025.png',
    pdf: '/memorias/memoria-2025.pdf',
  },
  {
    anio: '2024',
    titulo: 'Memoria Anual Institucional 2024',
    portada: '/memorias/portada-2024.png',
    pdf: '/memorias/memoria-2024.pdf',
  },
];

const obtenerEnlaceDescargaMemoria = (url = '') => {
  const limpio = url.trim();
  const matchDrive = limpio.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchDrive?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${matchDrive[1]}`;
  }
  return limpio;
};

const FondoTopograficoInstitucion = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-35"
    viewBox="0 0 1440 1000"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
  >
    <path
      d="M-80,140 C220,40 460,260 790,150 C1100,45 1290,210 1520,120"
      stroke="#D90429"
      strokeWidth="2"
    />
    <path
      d="M-80,220 C260,115 500,340 830,225 C1140,120 1320,280 1520,195"
      stroke="#F2B632"
      strokeWidth="1.5"
      strokeDasharray="10 8"
    />
    <path
      d="M-80,520 C210,630 520,390 860,540 C1160,670 1330,470 1520,560"
      stroke="#D90429"
      strokeWidth="2.2"
    />
    <path
      d="M-80,610 C250,715 550,480 890,625 C1190,750 1350,555 1520,645"
      stroke="#0A0A0A"
      strokeWidth="1.5"
    />
    <path
      d="M-80,860 C270,760 540,940 870,830 C1170,730 1340,890 1520,810"
      stroke="#D90429"
      strokeWidth="1.8"
      strokeDasharray="8 6"
    />
  </svg>
);

export default function SobreNosotros() {
  const [directorio, setDirectorio] = useState([]);
  const [cfgWeb, setCfgWeb] = useState({});
  const [contacto, setContacto] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });
  const [enviadoContacto, setEnviadoContacto] = useState(false);

  useEffect(() => {
    const cargarConfiguracionWeb = async () => {
      const { data } = await supabase
        .from('configuracion_sitio')
        .select('contenidos_json')
        .eq('id', 1)
        .maybeSingle();

      if (data?.contenidos_json) {
        setCfgWeb(data.contenidos_json);
      }
    };

    cargarConfiguracionWeb();
  }, []);

  useEffect(() => {
    const cargarDirectorio = async () => {
      const { data } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, rol, cargos_operativos, foto_url')
        .eq('estado_validacion', 'aprobado');

      if (Array.isArray(data)) {
        const directivos = data.filter((p) => {
          const r = (p.rol || '').toLowerCase();
          const cs = Array.isArray(p.cargos_operativos)
            ? p.cargos_operativos
            : [];
          return (
            ['superadmin', 'director'].includes(r) ||
            cs.some((c) =>
              ['secretario', 'tesorero', 'do', 'dos', 'lem', 'instructor'].includes(
                c.toLowerCase()
              )
            )
          );
        });
        setDirectorio(directivos);
      }
    };

    cargarDirectorio();
  }, []);

  const obtenerCargoLimpio = (persona) => {
    const r = (persona.rol || '').toLowerCase();
    const cs = Array.isArray(persona.cargos_operativos)
      ? persona.cargos_operativos
      : [];
    const etiquetas = {
      secretario: 'Secretario',
      tesorero: 'Tesorero',
      do: 'Director Operativo',
      dos: 'Director Operativo Suplente',
      lem: 'Líder Equipo Médico',
      instructor: 'Instructor',
      jc: 'Jefe de Cuadrilla',
    };
    const lista = cs.map((c) => etiquetas[c.toLowerCase()] || c.toUpperCase());
    if (r === 'director') lista.unshift('Director');
    if (lista.length === 0 && r === 'superadmin') return 'Administración';
    return lista.join(' · ') || 'Directorio';
  };

  const handleEnviarContacto = async (e) => {
    e.preventDefault();
    await supabase.from('solicitudes_apoyo').insert([
      {
        solicitante: contacto.nombre.trim(),
        email: contacto.email.trim(),
        telefono: 'Contacto Institucional',
        tipo_apoyo: contacto.asunto.trim() || 'Consulta General',
        descripcion: contacto.mensaje.trim(),
        estado: 'Pendiente',
      },
    ]);
    setEnviadoContacto(true);
    setContacto({ nombre: '', email: '', asunto: '', mensaje: '' });
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 font-sans text-white">
      <FondoTopograficoInstitucion />

      {/* 1. MISIÓN Y VISIÓN ÉPICA */}
      <section className="relative z-10 border-b-4 border-[#D90429] bg-neutral-950/90 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-l-4 border-[#F2B632] pl-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F2B632]">
              O.N.G. BRE Bío-Bío · Institución
            </span>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
              Vocación de Rescate,{' '}
              <span className="text-[#D90429]">Fuerza en el Terreno</span>
            </h1>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-neutral-800 bg-neutral-900/95 p-8 shadow-[8px_8px_0px_0px_#dc2626]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-b-4 border-[#D90429] bg-black text-[#F2B632]">
                  <Target size={24} />
                </div>
                <h2 className="text-2xl font-black uppercase text-white">
                  Misión
                </h2>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-neutral-200 sm:text-base">
                {cfgWeb.institucion_mision || 'Proteger y salvar vidas mediante la prevención, cuidado y búsqueda de personas en situaciones de emergencia, en estrecha colaboración con Estamentos Públicos y Privados, a través de la implementación de programas de capacitación, respuesta rápida y asistencia en desastres naturales.'}
              </p>
            </div>

            <div className="rounded-2xl border-2 border-neutral-800 bg-neutral-900/95 p-8 shadow-[8px_8px_0px_0px_#facc15]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-b-4 border-[#F2B632] bg-[#D90429] text-white">
                  <Eye size={24} />
                </div>
                <h2 className="text-2xl font-black uppercase text-white">
                  Visión
                </h2>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-neutral-200 sm:text-base">
                {cfgWeb.institucion_vision || 'Ser líder en la respuesta a emergencias y desastres, reconocida por su eficacia técnica, profesionalismo y compromiso con la seguridad y bienestar de la comunidad, contribuyendo a construir una sociedad más resiliente y preparada.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DIRECTORIO: FOTO DE CREDENCIAL + NOMBRE + CARGO */}
      <section className="relative z-10 bg-white py-16 text-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 border-l-4 border-[#D90429] pl-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#D90429]">
              Conducción Institucional
            </span>
            <h2 className="mt-1 text-3xl font-black uppercase text-neutral-950">
              Directorio
            </h2>
          </div>

          {directorio.length === 0 ? (
            <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-sm font-semibold text-neutral-600">
              Nómina directiva en actualización.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {directorio.map((persona) => (
                <div
                  key={persona.id}
                  className="overflow-hidden rounded-2xl border-2 border-neutral-950 bg-white shadow-[6px_6px_0px_0px_#0a0a0a]"
                >
                  <div className="flex h-56 w-full items-center justify-center overflow-hidden bg-neutral-900">
                    {persona.foto_url ? (
                      <img
                        src={persona.foto_url}
                        alt={persona.nombre_completo}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <User size={52} className="text-neutral-500" />
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-base font-black text-neutral-950">
                      {persona.nombre_completo}
                    </h3>
                    <p className="mt-1 text-xs font-black uppercase tracking-wider text-[#D90429]">
                      {obtenerCargoLimpio(persona)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. MEMORIAS ANUALES PDF CON PORTADA */}
      <section className="relative z-10 border-t border-neutral-800 bg-neutral-950/95 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 border-l-4 border-[#F2B632] pl-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#F2B632]">
              Documentos Oficiales
            </span>
            <h2 className="mt-1 text-3xl font-black uppercase text-white">
              Memorias Anuales
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(Array.isArray(cfgWeb.memorias) && cfgWeb.memorias.length > 0
              ? cfgWeb.memorias
              : MEMORIAS_ANUALES
            ).map((mem, idx) => {
              const portadaUrl = mem.portada || mem.portada_url || '';
              const descargaUrl = obtenerEnlaceDescargaMemoria(
                mem.pdf || mem.descarga_url || ''
              );
              const esDrive = descargaUrl.includes('drive.google.com');

              return (
                <div
                  key={`${mem.anio}-${idx}`}
                  className="overflow-hidden rounded-2xl border-2 border-neutral-800 bg-neutral-900 shadow-xl"
                >
                  <div className="relative flex h-56 w-full items-center justify-center overflow-hidden bg-neutral-800">
                    <FileText size={48} className="text-neutral-500" />
                    {portadaUrl && (
                      <img
                        src={portadaUrl}
                        alt={`Portada ${mem.titulo}`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <span className="rounded bg-[#F2B632] px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
                      Memoria {mem.anio}
                    </span>
                    <h3 className="mt-2 text-base font-black text-white">
                      {mem.titulo}
                    </h3>
                    <a
                      href={descargaUrl}
                      {...(esDrive
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : { download: true })}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D90429] px-4 py-2.5 text-xs font-black uppercase text-white transition-colors hover:bg-red-700"
                    >
                      <Download size={15} /> Descargar PDF
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. DONACIONES Y FORMULARIO DE CONTACTO GENERAL */}
      <section className="relative z-10 bg-white py-16 text-neutral-950">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="flex flex-col justify-between rounded-2xl border-2 border-neutral-950 bg-neutral-950 p-8 text-white shadow-[8px_8px_0px_0px_#facc15]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded bg-[#F2B632] px-3 py-1 text-xs font-black uppercase text-black">
                <HeartHandshake size={15} /> Aporte Institucional
              </span>
              <h2 className="mt-4 text-3xl font-black uppercase">
                Donaciones
              </h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-neutral-300">
                {cfgWeb.institucion_donaciones_texto || 'Respalda nuestras operaciones de búsqueda, rescate, botiquines prehospitalarios, comunicaciones y capacitación de voluntarios.'}
              </p>
            </div>

            <div className="mt-8">
              <Link
                to="/apoyo"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F2B632] px-6 py-4 text-xs font-black uppercase tracking-wider text-black transition-colors hover:bg-amber-300"
              >
                <HeartHandshake size={18} /> Realizar Donación
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-neutral-950 bg-neutral-50 p-8 shadow-[8px_8px_0px_0px_#0a0a0a]">
            <h2 className="text-2xl font-black uppercase text-neutral-950">
              Contacto General
            </h2>
            <p className="mt-1 text-xs font-bold text-neutral-600">
              Escríbenos para consultas institucionales o información general.
            </p>

            {enviadoContacto && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border-l-4 border-emerald-600 bg-emerald-50 p-3 text-xs font-bold text-emerald-900">
                <CheckCircle2 size={16} />
                <span>Mensaje enviado correctamente.</span>
              </div>
            )}

            <form onSubmit={handleEnviarContacto} className="mt-5 space-y-3.5">
              <input
                type="text"
                required
                value={contacto.nombre}
                onChange={(e) =>
                  setContacto({ ...contacto, nombre: e.target.value })
                }
                placeholder="Nombre completo"
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold"
              />
              <input
                type="email"
                required
                value={contacto.email}
                onChange={(e) =>
                  setContacto({ ...contacto, email: e.target.value })
                }
                placeholder="Correo electrónico"
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold"
              />
              <input
                type="text"
                required
                value={contacto.asunto}
                onChange={(e) =>
                  setContacto({ ...contacto, asunto: e.target.value })
                }
                placeholder="Asunto"
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold"
              />
              <textarea
                rows="3"
                required
                value={contacto.mensaje}
                onChange={(e) =>
                  setContacto({ ...contacto, mensaje: e.target.value })
                }
                placeholder="Escribe tu mensaje..."
                className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D90429] px-5 py-3 text-xs font-black uppercase text-white hover:bg-red-700"
              >
                <Send size={15} /> Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}