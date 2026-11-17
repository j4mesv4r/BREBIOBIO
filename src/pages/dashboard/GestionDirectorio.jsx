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
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
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

    // Protección en interfaz: un Director no puede tocar Superadmins ni nombrar/cambiar Directores
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

  const validarMiembro = async (miembroObjetivo, estadoValidacion) => {
    setAlerta('');
    const rolActualObjetivo = (miembroObjetivo.rol || '').toLowerCase();

    if (
      !esSuperadmin &&
      (rolActualObjetivo === 'superadmin' || rolActualObjetivo === 'director')
    ) {
      setAlerta(
        'Jerarquía insuficiente: solo el Superadministrador puede modificar el estado de Directores o Superadministradores.'
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900">
                <Shield className="text-red-600" />
                GESTIÓN DE DIRECTORIO
              </h1>
              <p className="text-sm text-gray-600">
                Validación de postulantes, asignación de roles operativos y
                revisión documental.
              </p>
            </div>

            <span
              className={`self-start rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider ${esSuperadmin
                  ? 'bg-black text-amber-400'
                  : 'bg-red-100 text-red-700'
                }`}
            >
              Nivel: {esSuperadmin ? 'Superadmin (Control Total)' : 'Director'}
            </span>
          </div>

          {alerta && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border-l-4 border-red-600 bg-red-50 p-4 text-xs font-bold text-red-900">
              <AlertTriangle size={18} className="shrink-0 text-red-600" />
              <span>{alerta}</span>
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
            <button
              onClick={() => setTab('miembros')}
              className={`border-b-2 px-4 py-2 text-sm font-bold transition-colors ${tab === 'miembros'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
            >
              Miembros y Postulantes (
              {miembros.filter((m) => m.estado_validacion === 'pendiente').length}{' '}
              pendientes)
            </button>
            <button
              onClick={() => setTab('certificados')}
              className={`border-b-2 px-4 py-2 text-sm font-bold transition-colors ${tab === 'certificados'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
            >
              Certificados ({certificados.length})
            </button>
            <button
              onClick={() => setTab('solicitudes')}
              className={`border-b-2 px-4 py-2 text-sm font-bold transition-colors ${tab === 'solicitudes'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
            >
              Solicitudes de Apoyo ({solicitudes.length})
            </button>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Cargando datos...
            </p>
          ) : tab === 'miembros' ? (
            <div className="space-y-4">
              {miembros.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                  No hay miembros registrados.
                </p>
              ) : (
                miembros.map((m) => {
                  const rolObjetivo = (m.rol || 'postulante').toLowerCase();
                  const protegidoParaDirector =
                    !esSuperadmin &&
                    (rolObjetivo === 'superadmin' || rolObjetivo === 'director');

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            {m.nombre_completo || 'Sin nombre'}
                          </h3>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${m.estado_validacion === 'aprobado'
                                ? 'bg-green-100 text-green-700'
                                : m.estado_validacion === 'rechazado'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                          >
                            {m.estado_validacion || 'pendiente'}
                          </span>
                          {m.es_menor_autorizado && (
                            <span className="rounded bg-amber-400 px-2 py-0.5 text-[11px] font-black uppercase text-black">
                              Menor Autorizado (16-17)
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          RUT: {m.rut || 'No registrado'} · Tel:{' '}
                          {m.telefono || 'Sin teléfono'}
                        </p>
                        {m.especialidad && (
                          <p className="text-xs font-semibold text-gray-500">
                            Área: {m.especialidad}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {protegidoParaDirector ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-bold uppercase text-gray-600">
                            <Lock size={14} /> {rolObjetivo} (Protegido)
                          </span>
                        ) : (
                          <>
                            <select
                              aria-label="Asignar rol institucional"
                              value={rolObjetivo}
                              onChange={(e) =>
                                cambiarRolMiembro(m, e.target.value)
                              }
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold uppercase text-gray-800"
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
                              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                            >
                              <CheckCircle size={14} /> Aprobar
                            </button>

                            <button
                              onClick={() => validarMiembro(m, 'rechazado')}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              <XCircle size={14} /> Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : tab === 'certificados' ? (
            <div className="space-y-4">
              {certificados.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                  No hay certificados registrados.
                </p>
              ) : (
                certificados.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">
                          {cert.titulo_curso}
                        </h3>
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-700">
                          {cert.estado_validacion}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {cert.perfiles?.nombre_completo || 'Sin nombre'} (
                        {cert.perfiles?.rut || 'Sin RUT'}) — Rol:{' '}
                        <strong className="capitalize">
                          {cert.perfiles?.rol}
                        </strong>
                      </p>
                      <p className="text-xs text-gray-400">
                        Institución: {cert.institucion || 'No indicada'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {cert.archivo_url && (
                        <a
                          href={cert.archivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          <FileText size={14} /> Ver PDF
                        </a>
                      )}

                      <button
                        onClick={() => validarCertificado(cert.id, 'aprobado')}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        <CheckCircle size={14} /> Aprobar
                      </button>

                      <button
                        onClick={() => validarCertificado(cert.id, 'rechazado')}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        <XCircle size={14} /> Rechazar
                      </button>

                      {cert.perfiles?.rol === 'postulante' && (
                        <button
                          onClick={() =>
                            cambiarRolMiembro(cert.perfiles, 'voluntario')
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
                        >
                          <UserCheck size={14} /> Ascender a Voluntario
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
                <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                  No hay solicitudes de apoyo recibidas.
                </p>
              ) : (
                solicitudes.map((sol) => (
                  <div
                    key={sol.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Siren size={18} className="text-red-600" />
                        <h3 className="font-bold text-gray-900">
                          {sol.solicitante} — {sol.tipo_apoyo}
                        </h3>
                      </div>
                      <select
                        value={sol.estado}
                        onChange={(e) =>
                          actualizarSolicitud(sol.id, e.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Atendida">Atendida</option>
                      </select>
                    </div>
                    <p className="mb-2 text-sm text-gray-700">
                      {sol.descripcion}
                    </p>
                    <p className="text-xs text-gray-500">
                      Contacto: {sol.telefono} · {sol.email}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}