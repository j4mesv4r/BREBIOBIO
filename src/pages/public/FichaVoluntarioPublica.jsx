import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  BadgeCheck,
  AlertTriangle,
  FileText,
  User,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function FichaVoluntarioPublica() {
  const { rut } = useParams(); // Recibe el código BRE-XXXXXX o RUT
  const [perfil, setPerfil] = useState(null);
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarVoluntario = async () => {
      setLoading(true);
      const paramLimpio = decodeURIComponent(rut || '').trim();

      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .or(
          `codigo_credencial.ilike.${paramLimpio},rut.ilike.${paramLimpio}`
        )
        .maybeSingle();

      if (!error && data) {
        setPerfil(data);

        const { data: certs } = await supabase
          .from('certificados')
          .select('*')
          .eq('perfil_id', data.id)
          .eq('estado_validacion', 'aprobado');

        if (certs) setCertificados(certs);
      }
      setLoading(false);
    };

    buscarVoluntario();
  }, [rut]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-xs font-black uppercase tracking-widest text-neutral-600">
        Verificando credencial institucional...
      </div>
    );
  }

  if (!perfil || perfil.estado_validacion !== 'aprobado') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border-2 border-[#D90429] bg-white p-8 text-center shadow-lg">
          <AlertTriangle size={48} className="mx-auto mb-3 text-[#D90429]" />
          <h1 className="text-lg font-black uppercase text-neutral-950">
            Credencial No Vigente o No Encontrada
          </h1>
          <p className="mt-2 text-xs text-neutral-600">
            El código consultado no corresponde a un miembro activo autorizado
            de la O.N.G. BRE Bío-Bío.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-[#0A0A0A] px-5 py-2.5 text-xs font-black uppercase text-[#F2B632]"
          >
            Volver al Portal Institucional
          </Link>
        </div>
      </div>
    );
  }

  const vis = perfil.visibilidad_publica || {
    foto_url: true,
    rut: true,
    especialidad: true,
    tipo_sangre: true,
    certificados: true,
    vigencia: true,
    telefono: false,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="overflow-hidden rounded-2xl border-2 border-[#0A0A0A] bg-white shadow-xl">
        {/* Cabecera Oficial de Fiscalización */}
        <div className="bg-[#0A0A0A] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded bg-[#F2B632] px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
              <ShieldCheck size={13} /> Verificación Oficial · Ley N° 20.500
            </span>
            <span className="font-mono text-xs font-black text-[#F2B632]">
              {perfil.codigo_credencial}
            </span>
          </div>
          <h1 className="mt-2 text-xl font-black uppercase">
            O.N.G. BRE Bío-Bío · Ficha de Acreditación
          </h1>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {vis.foto_url && (
              <div className="h-32 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-neutral-100">
                {perfil.foto_url ? (
                  <img
                    src={perfil.foto_url}
                    alt={perfil.nombre_completo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={40} className="m-auto mt-8 text-neutral-400" />
                )}
              </div>
            )}

            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-2xl font-black text-neutral-950">
                {perfil.nombre_completo}
              </h2>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="rounded-lg bg-[#D90429] px-3 py-1 text-xs font-black uppercase text-white">
                  {perfil.rol}
                </span>
                {vis.vigencia && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-800">
                    <BadgeCheck size={14} /> Acreditación Vigente
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-neutral-100 pt-4 text-xs sm:grid-cols-2">
            {vis.rut && (
              <div className="rounded-xl bg-neutral-50 p-3">
                <span className="block font-black uppercase text-neutral-400">
                  RUT
                </span>
                <strong className="text-sm text-neutral-900">
                  {perfil.rut}
                </strong>
              </div>
            )}

            {vis.especialidad && (
              <div className="rounded-xl bg-neutral-50 p-3">
                <span className="block font-black uppercase text-neutral-400">
                  Especialidad Operativa
                </span>
                <strong className="text-sm text-neutral-900">
                  {perfil.especialidad || 'Rescate y Emergencias'}
                </strong>
              </div>
            )}

            {vis.tipo_sangre && (
              <div className="rounded-xl bg-red-50 p-3">
                <span className="block font-black uppercase text-red-400">
                  Grupo Sanguíneo
                </span>
                <strong className="text-sm text-[#D90429]">
                  {perfil.tipo_sangre || 'No informado'}
                </strong>
              </div>
            )}

            {vis.telefono && (
              <div className="rounded-xl bg-neutral-50 p-3">
                <span className="block font-black uppercase text-neutral-400">
                  Teléfono Institucional
                </span>
                <strong className="text-sm text-neutral-900">
                  {perfil.telefono || 'No público'}
                </strong>
              </div>
            )}
          </div>

          {vis.certificados && certificados.length > 0 && (
            <div className="border-t border-neutral-100 pt-4">
              <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-black uppercase text-neutral-800">
                <FileText size={15} className="text-[#D90429]" /> Capacitaciones
                Validadas por Directorio
              </h3>
              <div className="space-y-2">
                {certificados.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-neutral-200 px-3.5 py-2 text-xs"
                  >
                    <strong className="text-neutral-900">
                      {c.titulo_curso}
                    </strong>{' '}
                    <span className="text-neutral-500">({c.institucion})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}