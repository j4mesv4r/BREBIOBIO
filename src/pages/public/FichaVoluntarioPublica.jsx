import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, FileText, AlertCircle, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function FichaVoluntarioPublica() {
  const { rut: identificador } = useParams();
  const [voluntario, setVoluntario] = useState(null);
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarFicha = async () => {
      setLoading(true);

      // Consulta pública segura: nunca expone RUT, antecedentes médicos ni datos personales de contacto
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, rol, activo, created_at')
        .eq('id', identificador)
        .eq('activo', true)
        .maybeSingle();

      if (perfilError || !perfil) {
        setVoluntario(null);
        setCertificados([]);
        setLoading(false);
        return;
      }

      setVoluntario(perfil);

      const { data: certs } = await supabase
        .from('certificados')
        .select('id, titulo_curso, institucion, fecha_emision, archivo_url')
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
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm font-bold text-neutral-600">
        Verificando credencial institucional...
      </div>
    );
  }

  if (!voluntario) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-lg border-2 border-[#17191D] bg-white p-8 text-center shadow-[6px_6px_0px_0px_#17191D]">
          <AlertCircle size={48} className="mx-auto mb-4 text-[#C8202F]" />
          <h1 className="text-2xl font-black text-[#17191D]">
            Credencial no encontrada o inactiva
          </h1>
          <p className="mt-2 text-sm font-semibold text-neutral-700">
            El identificador consultado no corresponde a una credencial vigente
            de ONG BRE BÍO-BÍO.
          </p>
        </div>
      </div>
    );
  }

  const codigoInstitucional = `BRE-${voluntario.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-sans">
      <div className="overflow-hidden rounded-lg border-2 border-[#17191D] bg-white shadow-[8px_8px_0px_0px_#17191D]">
        <div className="border-b-4 border-[#C8202F] bg-[#17191D] p-6 text-white">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#F2B632] bg-neutral-900 text-2xl font-black text-white">
                {voluntario.nombre_completo?.charAt(0) || 'V'}
              </div>
              <div>
                <p className="text-xs font-bold text-[#F2B632]">
                  Credencial Verificada · {codigoInstitucional}
                </p>
                <h1 className="text-2xl font-black tracking-tight">
                  {voluntario.nombre_completo || 'Integrante BRE'}
                </h1>
                <p className="text-xs font-semibold text-neutral-400">
                  Emisión:{' '}
                  {new Date(voluntario.created_at).toLocaleDateString('es-CL')}{' '}
                  · Estado: Vigente
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 self-start rounded bg-[#C8202F] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white sm:self-center">
              <UserCheck size={16} />
              {voluntario.rol}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-[#17191D]">
            <ShieldCheck className="text-[#C8202F]" size={22} />
            Certificaciones y Especialidades Aprobadas
          </h2>

          {certificados.length === 0 ? (
            <p className="rounded border-2 border-dashed border-neutral-300 bg-[#F3F4F6] p-6 text-center text-sm font-semibold text-neutral-600">
              Este integrante no registra certificaciones públicas aprobadas
              aún.
            </p>
          ) : (
            <div className="space-y-3">
              {certificados.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col justify-between gap-3 rounded border-2 border-neutral-200 p-4 transition-colors hover:border-[#17191D] sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-black text-[#17191D]">
                      {cert.titulo_curso}
                    </h3>
                    <p className="text-sm font-semibold text-neutral-700">
                      {cert.institucion}
                    </p>
                    {cert.fecha_emision && (
                      <p className="mt-1 text-xs font-bold text-neutral-500">
                        Emitido:{' '}
                        {new Date(cert.fecha_emision).toLocaleDateString(
                          'es-CL'
                        )}
                      </p>
                    )}
                  </div>
                  {cert.archivo_url && (
                    <a
                      href={cert.archivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded bg-[#17191D] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#C8202F]"
                    >
                      <FileText size={14} /> Ver Documento
                    </a>
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
