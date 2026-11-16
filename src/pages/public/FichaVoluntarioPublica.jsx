import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, FileText, AlertCircle, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function FichaVoluntarioPublica() {
  const { rut } = useParams();
  const [voluntario, setVoluntario] = useState(null);
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarFicha = async () => {
      setLoading(true);

      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('id, rut, nombre_completo, rol, activo')
        .eq('rut', rut)
        .single();

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

    if (rut) cargarFicha();
  }, [rut]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-500">
        Consultando acreditación del voluntario...
      </div>
    );
  }

  if (!voluntario) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-black text-gray-900">
            Voluntario no encontrado
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            No existe un registro activo asociado al RUT <strong>{rut}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="bg-black p-6 text-white">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-600 bg-gray-800 text-2xl font-black">
                {voluntario.nombre_completo?.charAt(0) || 'V'}
              </div>
              <div>
                <h1 className="text-2xl font-black">
                  {voluntario.nombre_completo || 'Voluntario BRE'}
                </h1>
                <p className="text-sm text-gray-400">RUT: {voluntario.rut}</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 self-start rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider sm:self-center">
              <UserCheck size={16} />
              {voluntario.rol}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <ShieldCheck className="text-green-600" size={22} />
            Certificaciones Aprobadas
          </h2>

          {certificados.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              Este miembro no registra certificados aprobados públicamente aún.
            </p>
          ) : (
            <div className="space-y-3">
              {certificados.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {cert.titulo_curso}
                    </h3>
                    <p className="text-sm text-gray-600">{cert.institucion}</p>
                    {cert.fecha_emision && (
                      <p className="mt-1 text-xs text-gray-400">
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
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:underline"
                    >
                      <FileText size={16} /> Ver Documento
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
