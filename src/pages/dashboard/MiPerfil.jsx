import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
    User,
    Shield,
    Book,
    Upload,
    CheckCircle,
    AlertCircle,
    FileText,
    Calendar,
    ShieldAlert,
    LogOut,
    Home,
    Mail,
    Users,
    MapPin,
    Package,
    Settings,
    Save,
    X,
} from 'lucide-react';

export default function MiPerfil() {
    const { user, signOut, setProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [perfil, setPerfil] = useState(null);
    const [certificados, setCertificados] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    // Estado para edición de datos básicos
    const [editando, setEditando] = useState(false);
    const [guardandoDatos, setGuardandoDatos] = useState(false);
    const [formDatos, setFormDatos] = useState({
        nombre_completo: '',
        rut: '',
        telefono: '',
        especialidad: '',
    });

    useEffect(() => {
        cargarDatosPerfil();
    }, []);

    const cargarDatosPerfil = async () => {
        try {
            setLoading(true);
            const {
                data: { user: currentUser },
            } = await supabase.auth.getUser();

            if (currentUser) {
                const { data: perfilData, error: perfilError } = await supabase
                    .from('perfiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                if (perfilError) throw perfilError;
                setPerfil(perfilData);
                setFormDatos({
                    nombre_completo: perfilData.nombre_completo || '',
                    rut: perfilData.rut || '',
                    telefono: perfilData.telefono || '',
                    especialidad: perfilData.especialidad || '',
                });

                const { data: certData, error: certError } = await supabase
                    .from('certificados')
                    .select('*')
                    .eq('perfil_id', currentUser.id)
                    .order('creado_en', { ascending: false });

                if (certError) throw certError;
                setCertificados(certData || []);
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error.message);
            setMensaje({
                tipo: 'error',
                texto: 'No se pudieron cargar los datos del perfil.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGuardarDatosBasicos = async (e) => {
        e.preventDefault();
        if (!perfil?.id) return;

        try {
            setGuardandoDatos(true);
            setMensaje({ tipo: '', texto: '' });

            const { data, error } = await supabase
                .from('perfiles')
                .update({
                    nombre_completo: formDatos.nombre_completo.trim(),
                    rut: formDatos.rut.trim() || null,
                    telefono: formDatos.telefono.trim() || null,
                    especialidad: formDatos.especialidad.trim() || null,
                })
                .eq('id', perfil.id)
                .select()
                .single();

            if (error) throw error;

            setPerfil(data);
            if (setProfile) setProfile(data);
            setEditando(false);
            setMensaje({
                tipo: 'exito',
                texto: 'Datos operativos actualizados correctamente.',
            });
        } catch (error) {
            console.error('Error al actualizar datos:', error.message);
            setMensaje({
                tipo: 'error',
                texto: error.message || 'No se pudieron guardar los cambios.',
            });
        } finally {
            setGuardandoDatos(false);
        }
    };

    const handleSubirCertificado = async (e) => {
        e.preventDefault();
        const file = e.target.archivo.files[0];
        const titulo = e.target.titulo.value;
        const institucion = e.target.institucion.value;

        if (!file || !perfil?.id) return;

        try {
            setUploading(true);
            setMensaje({ tipo: '', texto: '' });

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${perfil.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('certificados')
                .upload(filePath, file);

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error(
                        "El bucket 'certificados' no existe en Storage. Por favor créalo en Supabase."
                    );
                }
                throw uploadError;
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from('certificados').getPublicUrl(filePath);

            const { error: dbError } = await supabase.from('certificados').insert([
                {
                    perfil_id: perfil.id,
                    titulo_curso: titulo,
                    institucion: institucion,
                    archivo_url: publicUrl,
                    estado_validacion: 'pendiente',
                },
            ]);

            if (dbError) throw dbError;

            setMensaje({
                tipo: 'exito',
                texto: 'Certificado subido correctamente para evaluación.',
            });
            e.target.reset();
            cargarDatosPerfil();
        } catch (error) {
            console.error('Error al subir:', error.message);
            setMensaje({
                tipo: 'error',
                texto: error.message || 'Error al subir el certificado.',
            });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (perfil?.estado_validacion === 'pendiente') {
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

    const esDirectivo =
        perfil?.rol === 'director' || perfil?.rol === 'superadmin';

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Cabecera del Perfil */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-black border-b-4 border-red-600 flex items-start justify-end p-4 gap-2">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Home size={14} /> Portal Público
                        </Link>
                        <button
                            onClick={signOut}
                            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <LogOut size={14} /> Salir
                        </button>
                    </div>

                    <div className="px-8 pb-8 relative">
                        <div className="absolute -top-16 left-8">
                            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                                {perfil?.foto_url ? (
                                    <img
                                        src={perfil.foto_url}
                                        alt={perfil.nombre_completo}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={64} className="text-gray-300" />
                                )}
                            </div>
                        </div>

                        <div className="mt-20 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">
                                    {perfil?.nombre_completo || 'Usuario BRE Biobío'}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-red-100 text-red-700">
                                        <Shield size={14} />
                                        {perfil?.funcion || perfil?.rol || 'Voluntario'}
                                    </span>
                                    {user?.email && (
                                        <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                                            <Mail size={15} />
                                            {user.email}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {perfil?.rol === 'superadmin' && (
                                <div className="bg-black text-amber-400 border border-amber-400/40 text-xs font-black px-3.5 py-2 rounded-lg uppercase tracking-wider self-start">
                                    Acceso Superadmin
                                </div>
                            )}
                        </div>

                        {/* Accesos Rápidos de Administración (Director / Superadmin) */}
                        {esDirectivo && (
                            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                                <Link
                                    to="/gestion"
                                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors"
                                >
                                    <Users size={16} /> Gestión Directorio y Postulantes
                                </Link>
                                <Link
                                    to="/central-mando"
                                    className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors"
                                >
                                    <MapPin size={16} /> Central de Mando
                                </Link>
                                <Link
                                    to="/inventario"
                                    className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors"
                                >
                                    <Package size={16} /> Inventario
                                </Link>
                                {perfil?.rol === 'superadmin' && (
                                    <Link
                                        to="/configuracion"
                                        className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-black text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors"
                                    >
                                        <Settings size={16} /> Configuración Sitio
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Columna Izquierda: Detalles e Info */}
                    <div className="col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                Información Operativa
                            </h3>

                            {!editando ? (
                                <>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">
                                                Especialidad
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {perfil?.especialidad || 'No definida aún'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">
                                                RUT
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {perfil?.rut || 'Pendiente de registro'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">
                                                Teléfono
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {perfil?.telefono || 'No registrado'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditando(true)}
                                        className="w-full mt-6 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition-colors text-sm"
                                    >
                                        Editar Datos Básicos
                                    </button>
                                    {perfil?.id && (
                                        <Link
                                            to={`/voluntario/${perfil.id}`}
                                            className="block text-center mt-3 text-xs font-bold text-red-600 hover:underline"
                                        >
                                            Ver mi credencial pública (QR)
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <form onSubmit={handleGuardarDatosBasicos} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formDatos.nombre_completo}
                                            onChange={(e) =>
                                                setFormDatos({
                                                    ...formDatos,
                                                    nombre_completo: e.target.value,
                                                })
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                            Especialidad
                                        </label>
                                        <input
                                            type="text"
                                            value={formDatos.especialidad}
                                            onChange={(e) =>
                                                setFormDatos({
                                                    ...formDatos,
                                                    especialidad: e.target.value,
                                                })
                                            }
                                            placeholder="Ej. Rescate Terrestre"
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                            RUT
                                        </label>
                                        <input
                                            type="text"
                                            value={formDatos.rut}
                                            onChange={(e) =>
                                                setFormDatos({ ...formDatos, rut: e.target.value })
                                            }
                                            placeholder="12.345.678-9"
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={formDatos.telefono}
                                            onChange={(e) =>
                                                setFormDatos({ ...formDatos, telefono: e.target.value })
                                            }
                                            placeholder="+56 9 1234 5678"
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={guardandoDatos}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-lg text-xs"
                                        >
                                            <Save size={14} />
                                            {guardandoDatos ? 'Guardando...' : 'Guardar'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditando(false)}
                                            className="inline-flex items-center justify-center gap-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs"
                                        >
                                            <X size={14} /> Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Columna Derecha: Certificados */}
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                <Book className="text-red-600" />
                                Subir Nuevo Certificado
                            </h3>

                            {mensaje.texto && (
                                <div
                                    className={`p-4 rounded-lg text-sm font-bold mb-4 flex items-center gap-2 ${mensaje.tipo === 'error'
                                            ? 'bg-red-50 text-red-700'
                                            : 'bg-green-50 text-green-700'
                                        }`}
                                >
                                    {mensaje.tipo === 'error' ? (
                                        <AlertCircle size={18} />
                                    ) : (
                                        <CheckCircle size={18} />
                                    )}
                                    {mensaje.texto}
                                </div>
                            )}

                            <form onSubmit={handleSubirCertificado} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            TÍTULO DEL CURSO
                                        </label>
                                        <input
                                            type="text"
                                            name="titulo"
                                            required
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                            placeholder="Ej. Primeros Auxilios RCP"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            INSTITUCIÓN
                                        </label>
                                        <input
                                            type="text"
                                            name="institucion"
                                            required
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                            placeholder="Ej. Cruz Roja"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        ARCHIVO (PDF o Imagen)
                                    </label>
                                    <input
                                        type="file"
                                        name="archivo"
                                        accept=".pdf,image/*"
                                        required
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition-colors disabled:opacity-70 mt-2"
                                >
                                    {uploading ? (
                                        'Subiendo...'
                                    ) : (
                                        <>
                                            <Upload size={18} /> Enviar para validación
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                Mis Certificados
                            </h3>

                            {certificados.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">
                                        No has subido certificados aún.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {certificados.map((cert) => (
                                        <div
                                            key={cert.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Book size={24} className="text-red-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">
                                                        {cert.titulo_curso}
                                                    </h4>
                                                    <p className="text-xs font-medium text-gray-500 flex items-center gap-2 mt-1">
                                                        <Calendar size={12} /> {cert.institucion}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span
                                                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${cert.estado_validacion === 'aprobado'
                                                            ? 'bg-green-100 text-green-700'
                                                            : cert.estado_validacion === 'rechazado'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    {cert.estado_validacion.toUpperCase()}
                                                </span>
                                                <a
                                                    href={cert.archivo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                                >
                                                    Ver Documento
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}