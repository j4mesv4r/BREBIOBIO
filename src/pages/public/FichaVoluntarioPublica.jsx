import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  Download,
  Eye,
  AlertCircle,
  Droplets,
  AlertTriangle,
  Calendar,
  BadgeCheck,
  Compass,
  EyeOff,
  Award,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizarRutSinFormato(valor = '') {
  return valor.replace(/[^0-9kK]/g, '').toUpperCase();
}

function resolverFuncionAreaPublica(voluntario) {
  const rol = (voluntario?.rol || 'voluntario').toLowerCase();
  const cargos = Array.isArray(voluntario?.cargos_operativos)
    ? voluntario.cargos_operativos.map((c) => String(c).toLowerCase())
    : [];

  const etiquetasCargo = {
    tesorero: 'Tesorero',
    secretario: 'Secretaría',
    do: 'Dirección Operativa',
    dos: 'Dirección Operativa',
    jc: 'Jefe de Cuadrilla',
    lem: 'Prehospitalario',
    prehospitalario: 'Prehospitalario',
    instructor: 'Instrucción',
    operativo: 'Operativo',
  };

  const cargosMapeados = cargos.map((c) => etiquetasCargo[c]).filter(Boolean);
  if (cargosMapeados.length > 0) {
    return Array.from(new Set(cargosMapeados)).join(' · ');
  }

  if (rol === 'superadmin') {
    return 'Operativo - Administrativo';
  }

  if (rol === 'director') {
    return 'Directorio';
  }

  const funcionTexto = (voluntario?.funcion || '').trim();
  if (
    funcionTexto &&
    !/superadmin|postulante|usuario/i.test(funcionTexto)
  ) {
    return funcionTexto;
  }

  return 'Búsqueda y Rescate';
}

export default function FichaVoluntarioPublica() {
  const { rut: identificador } = useParams();
  const [voluntario, setVoluntario] = useState(null);
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarFicha = async () => {
      setLoading(true);
      const idLimpio = decodeURIComponent(identificador || '').trim();

      let perfil = null;

      if (UUID_REGEX.test(idLimpio)) {
        const { data } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', idLimpio)
          .maybeSingle();
        perfil = data;
      }

      if (!perfil) {
        const { data } = await supabase
          .from('perfiles')
          .select('*')
          .or(`codigo_credencial.ilike.${idLimpio},rut.ilike.${idLimpio}`)
          .maybeSingle();
        perfil = data;
      }

      if (!perfil && /^BRE-/i.test(idLimpio)) {
        const prefijo = idLimpio.replace(/^BRE-/i, '').replace(/[^0-9]/g, '');
        if (prefijo.length >= 4) {
          const { data: candidatos } = await supabase
            .from('perfiles')
            .select('*')
            .not('rut', 'is', null);

          perfil =
            (candidatos || []).find((p) =>
              normalizarRutSinFormato(p.rut).startsWith(prefijo)
            ) || null;
        }
      }

      if (!perfil) {
        const rutBuscado = normalizarRutSinFormato(idLimpio);
        if (rutBuscado.length >= 7) {
          const { data: candidatos } = await supabase
            .from('perfiles')
            .select('*')
            .not('rut', 'is', null);

          perfil =
            (candidatos || []).find(
              (p) => normalizarRutSinFormato(p.rut) === rutBuscado
            ) || null;
        }
      }

      if (!perfil) {
        setVoluntario(null);
        setCertificados([]);
        setLoading(false);
        return;
      }

      setVoluntario(perfil);

      const { data: certs } = await supabase
        .from('certificados')
        .select(
          'id, titulo_curso, institucion, fecha_emision, archivo_url, especialidad_vinculada'
        )
        .eq('perfil_id', perfil.id)
        .eq('estado_validacion', 'aprobado')
        .order('fecha_emision', { ascending: false });

      setCertificados(certs || []);
      setLoading(false);
    };

    if (identificador) cargarFicha();
  }, [identificador]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm font-extrabold uppercase tracking-wider text-[#17191D]">
        Verificando credencial oficial en terreno...
      </div>
    );
  }

  if (!voluntario) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 font-sans">
        <div className="rounded-xl border-2 border-[#17191D] bg-white p-8 text-center shadow-[6px_6px_0px_0px_#17191D]">
          <AlertCircle size={48} className="mx-auto mb-4 text-[#C8202F]" />
          <h1 className="text-2xl font-black uppercase text-[#17191D]">
            Credencial no encontrada o inactiva
          </h1>
          <p className="mt-2 text-sm font-semibold text-neutral-700">
            El identificador{' '}
            <strong className="text-[#17191D]">{identificador}</strong> no
            corresponde a un voluntario activo en ONG BRE BÍO-BÍO.
          </p>
        </div>
      </div>
    );
  }

  const digitosRut = normalizarRutSinFormato(voluntario.rut || '');
  const idInstitucional =
    voluntario.codigo_credencial ||
    (digitosRut.length >= 6
      ? `BRE-${digitosRut.slice(0, 6)}`
      : `BRE-${voluntario.id.slice(0, 4).toUpperCase()}`);

  const fechaEmision = voluntario.fecha_emision_credencial
    ? new Date(voluntario.fecha_emision_credencial).toLocaleDateString('es-CL')
    : voluntario.creado_en
      ? new Date(voluntario.creado_en).toLocaleDateString('es-CL')
      : 'Vigente';

  const fechaVigencia = voluntario.fecha_vigencia_credencial
    ? new Date(voluntario.fecha_vigencia_credencial).toLocaleDateString('es-CL')
    : 'Vigente · Anual';

  const esActivo =
    voluntario.activo !== false &&
    (voluntario.estado_validacion === 'aprobado' ||
      (voluntario.rol || '').toLowerCase() === 'superadmin');

  const mostrarAntecedentes =
    voluntario.mostrar_antecedentes_publicos !== false;

  const especialidadesValidadas = Array.isArray(
    voluntario.especialidades_validadas
  )
    ? voluntario.especialidades_validadas
    : [];

  const esMujer = voluntario.genero === 'femenino';
  const rolEtiqueta =
    (voluntario.rol || '').toLowerCase() === 'superadmin' ||
      (voluntario.rol || '').toLowerCase() === 'voluntario'
      ? esMujer
        ? 'VOLUNTARIA'
        : 'VOLUNTARIO'
      : (voluntario.rol || 'VOLUNTARIO').toUpperCase();

  const funcionAreaTexto = resolverFuncionAreaPublica(voluntario);

  return (
    <div className="min-h-[80vh] bg-[#F3F4F6] px-4 py-10 font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="overflow-hidden rounded-xl border-2 border-[#17191D] bg-white shadow-[8px_8px_0px_0px_#17191D]">
          <div className="relative overflow-hidden border-b-4 border-[#F2B632] bg-[#17191D] px-6 py-5 text-white">
            <div className="absolute -right-8 -top-8 h-36 w-52 -skew-x-12 bg-[#C8202F]" />
            <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white p-0.5">
                  <img
                    src="/logo-bre.png"
                    alt="Emblema oficial ONG BRE BÍO-BÍO"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-black uppercase tracking-wider sm:text-xl">
                    ONG BRE BÍO-BÍO
                  </h1>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#F2B632]">
                    Búsqueda · Rescate · Emergencia
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start rounded border-2 border-white bg-[#17191D] px-3.5 py-1.5 sm:self-center">
                <BadgeCheck
                  size={18}
                  className={esActivo ? 'text-[#F2B632]' : 'text-neutral-400'}
                />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  {esActivo ? 'CREDENCIAL VÁLIDA' : 'EN VALIDACIÓN'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-12 md:p-8">
            <div className="flex flex-col items-center md:col-span-4">
              <div className="h-48 w-40 overflow-hidden rounded-lg border-4 border-[#17191D] bg-[#F3F4F6] shadow-md">
                {voluntario.foto_url ? (
                  <img
                    src={voluntario.foto_url}
                    alt={voluntario.nombre_completo || 'Voluntario BRE'}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <img
                    src={
                      esMujer
                        ? '/avatar-femenino.png'
                        : '/avatar-masculino.png'
                    }
                    alt={voluntario.nombre_completo || 'Voluntario BRE'}
                    className="h-full w-full object-cover object-top"
                  />
                )}
              </div>

              <div className="mt-4 w-full max-w-[190px] rounded border-2 border-[#17191D] bg-[#17191D] px-3 py-2 text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#F2B632]">
                  ID Institucional
                </p>
                <p className="text-base font-black tracking-wider text-white">
                  {idInstitucional}
                </p>
              </div>
            </div>

            <div className="space-y-5 md:col-span-8">
              <div className="border-b-2 border-neutral-200 pb-4">
                <span className="inline-block rounded bg-[#C8202F] px-3 py-0.5 text-xs font-black uppercase tracking-widest text-white">
                  {rolEtiqueta}
                </span>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#17191D] sm:text-3xl">
                  {voluntario.nombre_completo || 'Voluntario BRE'}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-sm font-extrabold text-neutral-700">
                  <Compass size={16} className="text-[#C8202F]" />
                  <span>{funcionAreaTexto}</span>
                </p>
              </div>

              {mostrarAntecedentes ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded border-2 border-neutral-200 bg-[#F3F4F6] p-3.5">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                      RUT
                    </p>
                    <p className="mt-0.5 text-base font-black text-[#17191D]">
                      {voluntario.rut || 'No registrado'}
                    </p>
                  </div>

                  <div className="rounded border-2 border-neutral-200 bg-[#F3F4F6] p-3.5">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                      Comuna / Región
                    </p>
                    <p className="mt-0.5 text-sm font-black text-[#17191D]">
                      {voluntario.comuna || 'Biobío'} ·{' '}
                      {voluntario.region || 'Región del Biobío'}
                    </p>
                  </div>

                  <div className="rounded border-2 border-[#C8202F] bg-red-50 p-3.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#C8202F]">
                      <Droplets size={13} /> Grupo Sanguíneo
                    </p>
                    <p className="mt-0.5 text-base font-black text-[#17191D]">
                      {voluntario.tipo_sangre || 'No especificado'}
                    </p>
                  </div>

                  <div className="rounded border-2 border-[#F2B632] bg-amber-50 p-3.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#17191D]">
                      <AlertTriangle size={13} className="text-[#C8202F]" />{' '}
                      Antecedentes / Alergias
                    </p>
                    <p className="mt-0.5 text-sm font-black text-[#17191D]">
                      {voluntario.alergias || 'Ninguna conocida'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border-2 border-neutral-300 bg-neutral-100 p-4 text-xs font-bold text-neutral-700">
                  <EyeOff size={18} className="shrink-0 text-neutral-500" />
                  <span>
                    Los antecedentes personales detallados se encuentran ocultos
                    por configuración de privacidad.
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 rounded border-2 border-[#17191D] bg-[#17191D] px-4 py-3 text-white">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Calendar size={15} className="text-[#F2B632]" />
                  <span>Emisión: {fechaEmision}</span>
                </div>
                <div className="text-xs font-black uppercase tracking-wider text-[#F2B632]">
                  Vigencia: {fechaVigencia}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Especialidades Validadas */}
        <div className="rounded-xl border-2 border-[#17191D] bg-white p-6 shadow-[6px_6px_0px_0px_#17191D] md:p-8">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black uppercase text-[#17191D]">
            <Award className="text-[#C8202F]" size={22} />
            Especialidades Validadas por el Directorio
          </h3>

          {especialidadesValidadas.length === 0 ? (
            <p className="rounded border-2 border-dashed border-neutral-300 bg-[#F3F4F6] p-4 text-xs font-bold text-neutral-600">
              Sin especialidades validadas registradas aún.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {especialidadesValidadas.map((esp) => (
                <span
                  key={esp}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#17191D] px-3.5 py-1.5 text-xs font-black uppercase text-[#F2B632]"
                >
                  <ShieldCheck size={14} /> {esp}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cursos y Certificaciones */}
        <div className="rounded-xl border-2 border-[#17191D] bg-white p-6 shadow-[6px_6px_0px_0px_#17191D] md:p-8">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-black uppercase text-[#17191D]">
            <ShieldCheck className="text-[#C8202F]" size={22} />
            Cursos y Certificaciones Aprobadas
          </h3>

          {certificados.length === 0 ? (
            <p className="rounded border-2 border-dashed border-neutral-300 bg-[#F3F4F6] p-6 text-center text-sm font-semibold text-neutral-600">
              No hay cursos aprobados publicados en esta ficha aún.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {certificados.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4"
                >
                  <div>
                    <h4 className="font-black uppercase text-[#17191D]">
                      {cert.titulo_curso}
                    </h4>
                    <p className="text-xs font-bold text-neutral-600">
                      {cert.institucion || 'Institución acreditadora'}
                    </p>
                    {cert.especialidad_vinculada && (
                      <p className="mt-1 text-[11px] font-black uppercase text-[#C8202F]">
                        Especialidad: {cert.especialidad_vinculada}
                      </p>
                    )}
                    {cert.fecha_emision && (
                      <p className="mt-1 text-xs font-semibold text-neutral-500">
                        Emitido:{' '}
                        {new Date(cert.fecha_emision).toLocaleDateString(
                          'es-CL'
                        )}
                      </p>
                    )}
                  </div>

                  {cert.archivo_url && (
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={cert.archivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#17191D] px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
                      >
                        <Eye size={14} /> Visualizar en Línea
                      </a>
                      <a
                        href={cert.archivo_url}
                        download
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8202F] px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700"
                      >
                        <Download size={14} /> Descargar
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}