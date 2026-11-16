import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  LogOut,
  Home,
  MapPin,
  Package,
  ShieldAlert,
  Settings,
} from 'lucide-react';

export default function PanelVoluntario() {
  const { profile, signOut } = useAuth();
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [nuevoCurso, setNuevoCurso] = useState({
    titulo: '',
    institucion: '',
    fecha: '',
  });
  const [file, setFile] = useState(null);
  const [datosPerfil, setDatosPerfil] = useState({
    nombre_completo: '',
    rut: '',
    telefono: '',
  });
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [perfilMsg, setPerfilMsg] = useState('');

  useEffect(() => {
    if (profile?.id) {
      setDatosPerfil({
        nombre_completo: profile.nombre_completo || '',
        rut: profile.rut || '',
        telefono: profile.telefono || '',
      });
      fetchCertificados();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSavingPerfil(true);
    setPerfilMsg('');

    const { error } = await supabase
      .from('perfiles')
      .update({
        nombre_completo: datosPerfil.nombre_completo,
        rut: datosPerfil.rut || null,
        telefono: datosPerfil.telefono || null,
      })
      .eq('id', profile.id);

    setSavingPerfil(false);
    setPerfilMsg(
      error ? 'Error al guardar datos.' : 'Datos actualizados correctamente.'
    );
  };

  const fetchCertificados = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('certificados')
      .select('*')
      .eq('perfil_id', profile.id)
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error fetching certificados:', error);
    } else {
      setCertificados(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !nuevoCurso.titulo || !profile?.id) return;

    setUploading(true);
    try {
      // 1. Subir archivo a Supabase Storage (bucket 'certificados' público)
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('certificados').getPublicUrl(filePath);

      // 2. Guardar registro en la tabla 'certificados'
      const { error: dbError } = await supabase.from('certificados').insert([
        {
          perfil_id: profile.id,
          titulo_curso: nuevoCurso.titulo,
          institucion: nuevoCurso.institucion,
          fecha_emision: nuevoCurso.fecha || null,
          archivo_url: publicUrl,
          estado_validacion: 'pendiente',
        },
      ]);

      if (dbError) throw dbError;

      // Limpiar formulario y recargar
      setNuevoCurso({ titulo: '', institucion: '', fecha: '' });
      setFile(null);
      const input = document.getElementById('file-upload');
      if (input) input.value = '';
      fetchCertificados();
    } catch (error) {
      console.error('Error al subir certificado:', error.message);
      alert('Error al subir el documento. Revisa la consola para más detalles.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rechazado':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (profile?.estado_validacion === 'pendiente') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4 py-12 font-sans text-white">
        <div className="w-full max-w-xl rounded-lg border-2 border-[#DC2626] bg-neutral-950 p-8 shadow-2xl sm:p-10">
          <div className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded border-b-4 border-[#DC2626] bg-black text-[#FACC15]">
                <ShieldAlert size={22} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#FACC15]">
                  O.N.G. BRE BIO BIO
                </p>
                <h1 className="text-lg font-black uppercase tracking-tight text-white">
                  Verificación Institucional
                </h1>
              </div>
            </div>
            <span className="rounded border border-[#FACC15] bg-[#FACC15] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-black">
              Pendiente
            </span>
          </div>

          <p className="mb-8 text-base font-semibold leading-relaxed text-neutral-200">
            Tus datos han sido recibidos correctamente. La información
            institucional y antecedentes serán validados por los administradores
            de la organización antes de habilitar el acceso operativo completo.
          </p>

          <div className="flex flex-col gap-3 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded border-2 border-neutral-700 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-neutral-200 transition-colors hover:border-white hover:text-white"
            >
              <Home size={16} />
              <span>Volver al Portal</span>
            </Link>

            <button
              onClick={signOut}
              className="inline-flex items-center justify-center gap-2 rounded bg-[#DC2626] px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      {/* Sidebar Lateral para el Panel Interno */}
      <aside className="flex w-full flex-col bg-black p-6 text-white md:min-h-screen md:w-64">
        <div className="mb-8">
          <h2 className="border-b-2 border-red-600 pb-2 text-xl font-bold italic tracking-wider">
            BRE BIOBÍO
          </h2>
          <p className="mt-1 text-xs text-gray-400">Panel Interno</p>
        </div>

        <div className="mb-8 flex flex-col items-center rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-700 text-2xl font-bold text-gray-300">
            {profile?.nombre_completo?.charAt(0) || 'U'}
          </div>
          <h3 className="text-center font-bold">
            {profile?.nombre_completo || 'Usuario'}
          </h3>
          <span className="mt-1 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold uppercase tracking-wider">
            {profile?.rol || 'Postulante'}
          </span>
        </div>

        <nav className="flex-grow space-y-2">
          <Link
            to="/mi-perfil"
            className="flex items-center gap-3 rounded-lg bg-gray-800 p-3 text-white transition-colors"
          >
            <FileText size={20} />
            Mis Certificados
          </Link>
          {(profile?.rol === 'director' || profile?.rol === 'superadmin') && (
            <>
              <Link
                to="/central-mando"
                className="flex items-center gap-3 rounded-lg p-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <MapPin size={20} />
                Central de Mando
              </Link>
              <Link
                to="/inventario"
                className="flex items-center gap-3 rounded-lg p-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <Package size={20} />
                Inventario
              </Link>
            </>
          )}
          {profile?.rol === 'superadmin' && (
            <Link
              to="/configuracion"
              className="flex items-center gap-3 rounded-lg p-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <Settings size={20} />
              Configuración Sitio
            </Link>
          )}
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg p-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <Home size={20} />
            Portal Público
          </Link>
        </nav>

        <button
          onClick={signOut}
          className="mt-6 flex items-center gap-3 rounded-lg p-3 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">
            MI FICHA OPERATIVA
          </h1>
          <p className="text-gray-600">
            Sube tus certificados y capacitaciones para ser validados por la
            Dirección.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Columna Izquierda: Datos Personales + Formulario de Subida */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Mis Datos de Ficha
              </h2>
              <form onSubmit={handleGuardarPerfil} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={datosPerfil.nombre_completo}
                    onChange={(e) =>
                      setDatosPerfil({
                        ...datosPerfil,
                        nombre_completo: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    RUT
                  </label>
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={datosPerfil.rut}
                    onChange={(e) =>
                      setDatosPerfil({ ...datosPerfil, rut: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={datosPerfil.telefono}
                    onChange={(e) =>
                      setDatosPerfil({
                        ...datosPerfil,
                        telefono: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                {perfilMsg && (
                  <p className="text-xs font-semibold text-gray-700">
                    {perfilMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={savingPerfil}
                  className="w-full rounded bg-black px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                >
                  {savingPerfil ? 'Guardando...' : 'Actualizar Datos'}
                </button>
                {datosPerfil.rut && (
                  <Link
                    to={`/voluntario/${encodeURIComponent(datosPerfil.rut)}`}
                    className="block text-center text-xs font-semibold text-red-600 hover:underline"
                  >
                    Ver mi ficha pública →
                  </Link>
                )}
              </form>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
                <Upload size={20} className="text-red-600" /> Nuevo Certificado
              </h2>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Nombre del Curso / Especialidad
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoCurso.titulo}
                    onChange={(e) =>
                      setNuevoCurso({ ...nuevoCurso, titulo: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Ej. Rescate Agreste Nivel 1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Institución que Certifica
                  </label>
                  <input
                    type="text"
                    value={nuevoCurso.institucion}
                    onChange={(e) =>
                      setNuevoCurso({
                        ...nuevoCurso,
                        institucion: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Ej. Bomberos, Cruz Roja..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Fecha de Emisión (Opcional)
                  </label>
                  <input
                    type="date"
                    value={nuevoCurso.fecha}
                    onChange={(e) =>
                      setNuevoCurso({ ...nuevoCurso, fecha: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Archivo (PDF o Imagen)
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-700 hover:file:bg-red-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {uploading ? 'Subiendo...' : 'Guardar Certificado'}
                </button>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Lista de Certificados */}
          <div className="lg:col-span-2">
            <div className="min-h-[400px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-800">
                Historial de Capacitaciones
              </h2>

              {loading ? (
                <p className="py-10 text-center text-gray-500">
                  Cargando registros...
                </p>
              ) : certificados.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <AlertTriangle size={48} className="mb-4 text-gray-300" />
                  <p className="font-medium text-gray-500">
                    Aún no has registrado ninguna capacitación.
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Sube tus certificados para que el Directorio evalúe tu
                    perfil operativo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificados.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex flex-col items-start justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center"
                    >
                      <div className="mb-2 flex items-start gap-4 sm:mb-0">
                        <div className="mt-1">
                          {getStatusIcon(cert.estado_validacion)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {cert.titulo_curso}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {cert.institucion}
                          </p>
                          {cert.fecha_emision && (
                            <p className="mt-1 text-xs text-gray-400">
                              Emitido:{' '}
                              {new Date(cert.fecha_emision).toLocaleDateString(
                                'es-CL'
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex w-full flex-col items-end gap-2 sm:mt-0 sm:w-auto">
                        <span
                          className={`rounded border px-2 py-1 text-xs font-semibold uppercase ${getStatusBadge(
                            cert.estado_validacion
                          )}`}
                        >
                          {cert.estado_validacion}
                        </span>
                        <a
                          href={cert.archivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                        >
                          <FileText size={14} /> Ver Documento
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
