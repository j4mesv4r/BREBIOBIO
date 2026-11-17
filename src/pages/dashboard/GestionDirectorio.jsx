import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  FileText,
  Siren,
  UserCheck,
  Shield,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function GestionDirectorio() {
  const { profile: currentProfile } = useAuth();
  const [tab, setTab] = useState('miembros');
  const [certificados, setCertificados] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [miembros, setMiembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState('');

  const esSuperadmin = currentProfile?.rol?.toLowerCase() === 'superadmin';

  const cargarDatos = async () => {
    setLoading(true);
    setAlerta('');
    const [certsRes, solRes, perfRes] = await Promise.all([
      supabase
        .from('certificados')
        .select('*, perfiles(id, nombre_completo, rut, rol)')
        .order('creado_en', { ascending: false }),
      supabase
        .from('solicitudes_apoyo')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('perfiles')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (!certsRes.error && certsRes.data) setCertificados(certsRes.data);
    if (!solRes.error && solRes.data) setSolicitudes(solRes.data);
    if (!perfRes.error && perfRes.data) setMiembros(perfRes.data);
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const validarCertificado = async (id, estado) => {
    const { error } = await supabase
      .from('certificados')
      .update({ estado_validacion: estado })
      .eq('id', id);

    if (!error) cargarDatos();
  };

  const cambiarRolMiembro = async (miembroObjetivo, nuevoRol) => {
    setAlerta('');
    const rolActualObjetivo = (miembroObjetivo.rol || '').toLowerCase();

    if (!esSuperadmin) {
      if (
        rolActualObjetivo === 'superadmin' ||
        rolActualObjetivo === 'director' ||
        nuevoRol === 'superadmin' ||
        nuevoRol === 'director'
      ) {
        setAlerta(
          'Jerarquía insuficiente: solo el Superadministrador puede asignar o modificar Directores y Superadministradores.'
        );
        return;
      }
    }

    const { error } = await supabase
      .from('perfiles')
      .update({ rol: nuevoRol })
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const toggleModuloUsuario = async (miembroObjetivo, claveModulo) => {
    if (!esSuperadmin) return;
    const actuales = miembroObjetivo.permisos_modulos || {
      central_mando: false,
      inventario: false,
      gestion: false,
    };
    const nuevos = {
      ...actuales,
      [claveModulo]: !actuales[claveModulo],
    };

    const { error } = await supabase
      .from('perfiles')
      .update({ permisos_modulos: nuevos })
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const validarMiembro = async (miembroObjetivo, estadoValidacion) => {
    setAlerta('');
    const rolActualObjetivo = (miembroObjetivo.rol || '').toLowerCase();

    if (
      !esSuperadmin &&
      (rolActualObjetivo === 'superadmin' || rolActualObjetivo === 'director')
    ) {
      setAlerta(
        'Jerarquía insuficiente: solo el Superadministrador puede modificar Directores o Superadministradores.'
      );
      return;
    }

    const { error } = await supabase
      .from('perfiles')
      .update({ estado_validacion: estadoValidacion })
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const actualizarSolicitud = async (id, estado) => {
    const { error } = await supabase
      .from('solicitudes_apoyo')
      .update({ estado })
      .eq('id', id);

    if (!error) cargarDatos();
  };

  return (
    <DashboardLayout
      title="Gestión de Directorio"
      subtitle="Validación de postulantes, asignación de roles y activación de módulos"
      actions={
        <span
          className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${esSuperadmin
              ? 'bg-[#0A0A0A] text-[#F2B632]'
              : 'bg-red-100 text-[#D90429]'
            }`}
        >
          {esSuperadmin ? 'Superadmin' : 'Director'}
        </span>
      }
    >
      {alerta && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border-l-4 border-[#D90429] bg-red-50 p-4 text-xs font-bold text-red-900">
          <AlertTriangle size={18} strokeWidth={2.5} className="shrink-0 text-[#D90429]" />
          <span>{alerta}</span>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border-b border-neutral-200">
        <button
          onClick={() => setTab('miembros')}
          className={`border-b-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${tab === 'miembros'
              ? 'border-[#D90429] text-[#D90429]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
        >
          Miembros y Postulantes (
          {miembros.filter((m) => m.estado_validacion === 'pendiente').length}{' '}
          pendientes)
        </button>
        <button
          onClick={() => setTab('certificados')}
          className={`border-b-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${tab === 'certificados'
              ? 'border-[#D90429] text-[#D90429]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
        >
          Certificados ({certificados.length})
        </button>
        <button
          onClick={() => setTab('solicitudes')}
          className={`border-b-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${tab === 'solicitudes'
              ? 'border-[#D90429] text-[#D90429]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
        >
          Solicitudes de Apoyo ({solicitudes.length})
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm font-bold text-neutral-500">
          Cargando registros...
        </p>
      ) : tab === 'miembros' ? (
        <div className="space-y-4">
          {miembros.map((m) => {
            const rolObjetivo = (m.rol || 'postulante').toLowerCase();
            const protegidoParaDirector =
              !esSuperadmin &&
              (rolObjetivo === 'superadmin' || rolObjetivo === 'director');
            const modulos = m.permisos_modulos || {};

            return (
              <div
                key={m.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-neutral-950">
                        {m.nombre_completo || 'Sin nombre'}
                      </h3>
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-[11px] font-black uppercase ${m.estado_validacion === 'aprobado'
                            ? 'bg-green-100 text-green-700'
                            : m.estado_validacion === 'rechazado'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {m.estado_validacion || 'pendiente'}
                      </span>
                      {m.es_menor_autorizado && (
                        <span className="rounded-lg bg-[#F2B632] px-2.5 py-0.5 text-[11px] font-black uppercase text-black">
                          Menor Autorizado (16-17)
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-neutral-600">
                      RUT: {m.rut || 'No registrado'} · Tel:{' '}
                      {m.telefono || 'Sin teléfono'}
                      {m.especialidad ? ` · Área: ${m.especialidad}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {protegidoParaDirector ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-xs font-black uppercase text-neutral-600">
                        <Lock size={14} strokeWidth={2.5} /> {rolObjetivo} (Protegido)
                      </span>
                    ) : (
                      <>
                        <select
                          aria-label="Asignar rol institucional"
                          value={rolObjetivo}
                          onChange={(e) => cambiarRolMiembro(m, e.target.value)}
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase text-neutral-800"
                        >
                          <option value="postulante">Postulante</option>
                          <option value="colaborador">Colaborador</option>
                          <option value="voluntario">Voluntario</option>
                          {esSuperadmin && (
                            <>
                              <option value="director">Director</option>
                              <option value="superadmin">Superadmin</option>
                            </>
                          )}
                        </select>

                        <button
                          onClick={() => validarMiembro(m, 'aprobado')}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3.5 py-2 text-xs font-black uppercase text-white hover:bg-green-700"
                        >
                          <CheckCircle size={15} strokeWidth={2.5} /> Aprobar
                        </button>

                        <button
                          onClick={() => validarMiembro(m, 'rechazado')}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-3.5 py-2 text-xs font-black uppercase text-white hover:bg-red-700"
                        >
                          <XCircle size={15} strokeWidth={2.5} /> Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Interruptores de Módulos Activables (Solo visible para Superadmin) */}
                {esSuperadmin && rolObjetivo !== 'superadmin' && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                      Módulos Activos:
                    </span>
                    {[
                      { key: 'gestion', label: 'Gestión Directorio' },
                      { key: 'central_mando', label: 'Central de Mando' },
                      { key: 'inventario', label: 'Inventario' },
                    ].map((mod) => {
                      const activo = Boolean(modulos[mod.key]);
                      return (
                        <button
                          key={mod.key}
                          type="button"
                          onClick={() => toggleModuloUsuario(m, mod.key)}
                          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[11px] font-black uppercase transition-colors ${activo
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                              : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                            }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${activo ? 'bg-emerald-600' : 'bg-neutral-400'
                              }`}
                          />
                          {mod.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : tab === 'certificados' ? (
        <div className="space-y-4">
          {certificados.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-500">
              No hay certificados registrados.
            </p>
          ) : (
            certificados.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-neutral-900">
                      {cert.titulo_curso}
                    </h3>
                    <span className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-[11px] font-black uppercase text-neutral-700">
                      {cert.estado_validacion}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-600">
                    {cert.perfiles?.nombre_completo || 'Sin nombre'} (
                    {cert.perfiles?.rut || 'Sin RUT'}) — Rol:{' '}
                    <strong className="uppercase">{cert.perfiles?.rol}</strong>
                  </p>
                  <p className="text-xs text-neutral-400">
                    Institución: {cert.institucion || 'No indicada'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {cert.archivo_url && (
                    <a
                      href={cert.archivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-xs font-black uppercase text-neutral-700 hover:bg-neutral-100"
                    >
                      <FileText size={15} strokeWidth={2.5} /> Ver PDF
                    </a>
                  )}

                  <button
                    onClick={() => validarCertificado(cert.id, 'aprobado')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-black uppercase text-white hover:bg-green-700"
                  >
                    <CheckCircle size={15} strokeWidth={2.5} /> Aprobar
                  </button>

                  <button
                    onClick={() => validarCertificado(cert.id, 'rechazado')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-3 py-2 text-xs font-black uppercase text-white hover:bg-red-700"
                  >
                    <XCircle size={15} strokeWidth={2.5} /> Rechazar
                  </button>

                  {cert.perfiles?.rol === 'postulante' && (
                    <button
                      onClick={() =>
                        cambiarRolMiembro(cert.perfiles, 'voluntario')
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3 py-2 text-xs font-black uppercase text-white hover:bg-neutral-800"
                    >
                      <UserCheck size={15} strokeWidth={2.5} /> Ascender a Voluntario
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-500">
              No hay solicitudes de apoyo recibidas.
            </p>
          ) : (
            solicitudes.map((sol) => (
              <div
                key={sol.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Siren size={20} strokeWidth={2.5} className="text-[#D90429]" />
                    <h3 className="font-black text-neutral-900">
                      {sol.solicitante} — {sol.tipo_apoyo}
                    </h3>
                  </div>
                  <select
                    value={sol.estado}
                    onChange={(e) =>
                      actualizarSolicitud(sol.id, e.target.value)
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-black uppercase"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Atendida">Atendida</option>
                  </select>
                </div>
                <p className="mb-2 text-sm font-medium text-neutral-700">
                  {sol.descripcion}
                </p>
                <p className="text-xs font-semibold text-neutral-500">
                  Contacto: {sol.telefono} · {sol.email}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
}