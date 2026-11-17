import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
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
    Save,
    X,
} from 'lucide-react';

export default function MiPerfil() {
    const { user, profile: contextProfile, signOut, setProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [perfil, setPerfil] = useState(contextProfile || null);
    const [certificados, setCertificados] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

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
    }, [user]);

    const cargarDatosPerfil = async () => {
        try {
            setLoading(true);
            setMensaje({ tipo: '', texto: '' });

            const currentUser = user || (await supabase.auth.getUser()).data?.user;
            if (!currentUser) {
                setLoading(false);
                return;
            }

            const { data: perfilData, error: perfilError } = await supabase
                .from('perfiles')
                .select('*')
                .eq('id', currentUser.id)
                .maybeSingle();

            if (perfilError) throw perfilError;

            const perfilActivo = perfilData || contextProfile;
            if (perfilActivo) {
                setPerfil(perfilActivo);
                if (setProfile) setProfile(perfilActivo);
                setFormDatos({
                    nombre_completo: perfilActivo.nombre_completo || '',
                    rut: perfilActivo.rut || '',
                    telefono: perfilActivo.telefono || '',
                    especialidad: perfilActivo.especialidad || '',
                });
            }

            const { data: certData, error: certError } = await supabase
                .from('certificados')
                .select('*')
                .eq('perfil_id', currentUser.id)
                .order('creado_en', { ascending: false });

            if (!certError && certData) {
                setCertificados(certData);
            }
        } catch (error) {
            setMensaje({
                tipo: 'error',
                texto: 'Error al cargar perfil: ' + error.message,
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
            const filePath = `${perfil.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('certificados')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

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
            <div className="flex min-h-screen items-center justify-center bg-neutral-100">
                <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-[#D90429]" />
            </div>
        );
    }

    if (perfil?.estado_validacion === 'pendiente') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4 py-12 font-sans text-white">
                <div className="w-full max-w-xl rounded-2xl border-2 border-[#D90429] bg-neutral-950 p-8 shadow-2xl sm:p-10">
                    <div className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-b-4 border-[#D90429] bg-black text-[#F2B632]">
                                <ShieldAlert size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-[#F2B632]">
                                    O.N.G. BRE BIO BIO
                                </p>
                                <h1 className="text-lg font-black uppercase tracking-tight text-white">
                                    Verificación Institucional
                                </h1>
                            </div>
                        </div>
                        <span className="rounded-lg bg-[#F2B632] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-black">
                            Pendiente
                        </span>
                    </div>

                    <p className="mb-8 text-base font-semibold leading-relaxed text-neutral-200">
                        Tus datos han sido recibidos correctamente. Tu solicitud queda en
                        espera de autorización por parte del Directorio o Superadministrador
                        antes de habilitar el acceso operativo completo.
                    </p>

                    <div className="flex flex-col gap-3 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-700 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-neutral-200 transition-colors hover:border-white hover:text-white"
                        >
                            <Home size={16} strokeWidth={2.5} />
                            <span>Volver al Portal</span>
                        </Link>

                        <button
                            onClick={signOut}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D90429] px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700"
                        >
                            <LogOut size={16} strokeWidth={2.5} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout
            title="Mi Ficha Operativa"
            subtitle="Datos de identificación, especialidad y acreditación documental"
        >
            <div className="space-y-8">
                {/* Tarjeta de Identidad del Integrante */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-neutral-200 bg-neutral-100 shadow-sm">
                                {perfil?.foto_url ? (
                                    <img
                                        src={perfil.foto_url}
                                        alt={perfil.nombre_completo}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User size={40} strokeWidth={2.5} className="text-neutral-400" />
                                )}
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-neutral-950 sm:text-3xl">
                                    {perfil?.nombre_completo || 'Usuario BRE Biobío'}
                                </h2>
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase text-[#D90429]">
                                        <Shield size={14} strokeWidth={2.5} />
                                        {perfil?.funcion || perfil?.cargo_ong || perfil?.rol || 'Voluntario'}
                                    </span>
                                    {user?.email && (
                                        <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500">
                                            <Mail size={15} strokeWidth={2.5} />
                                            {user.email}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {perfil?.id && (
                            <Link
                                to={`/voluntario/${perfil.id}`}
                                className="inline-flex items-center justify-center rounded-xl bg-[#0A0A0A] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#F2B632] shadow-md transition-transform hover:scale-105"
                            >
                                Credencial Pública (QR)
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Columna Izquierda: Datos Operativos */}
                    <div className="col-span-1 space-y-6">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 border-b border-neutral-100 pb-3 text-base font-black uppercase text-neutral-950">
                                Información Operativa
                            </h3>

                            {!editando ? (
                                <>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                                                Especialidad
                                            </label>
                                            <p className="font-bold text-neutral-900">
                                                {perfil?.especialidad || 'No definida aún'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                                                RUT
                                            </label>
                                            <p className="font-bold text-neutral-900">
                                                {perfil?.rut || 'Pendiente de registro'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                                                Teléfono
                                            </label>
                                            <p className="font-bold text-neutral-900">
                                                {perfil?.telefono || 'No registrado'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditando(true)}
                                        className="mt-6 w-full rounded-xl bg-neutral-100 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-800 transition-colors hover:bg-neutral-200"
                                    >
                                        Editar Datos Básicos
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleGuardarDatosBasicos} className="space-y-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
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
                                            className="w-full rounded-xl border border-neutral-300 p-2.5 text-sm font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
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
                                            className="w-full rounded-xl border border-neutral-300 p-2.5 text-sm font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                            RUT
                                        </label>
                                        <input
                                            type="text"
                                            value={formDatos.rut}
                                            onChange={(e) =>
                                                setFormDatos({ ...formDatos, rut: e.target.value })
                                            }
                                            placeholder="12.345.678-9"
                                            className="w-full rounded-xl border border-neutral-300 p-2.5 text-sm font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={formDatos.telefono}
                                            onChange={(e) =>
                                                setFormDatos({ ...formDatos, telefono: e.target.value })
                                            }
                                            placeholder="+56 9 1234 5678"
                                            className="w-full rounded-xl border border-neutral-300 p-2.5 text-sm font-semibold"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={guardandoDatos}
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3 py-2.5 text-xs font-black uppercase text-white hover:bg-neutral-800"
                                        >
                                            <Save size={14} strokeWidth={2.5} />
                                            {guardandoDatos ? 'Guardando...' : 'Guardar'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditando(false)}
                                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-neutral-100 px-3 py-2.5 text-xs font-black uppercase text-neutral-700 hover:bg-neutral-200"
                                        >
                                            <X size={14} strokeWidth={2.5} /> Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Columna Derecha: Certificados */}
                    <div className="col-span-1 space-y-6 md:col-span-2">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3 text-base font-black uppercase text-neutral-950">
                                <Book size={20} strokeWidth={2.5} className="text-[#D90429]" />
                                Subir Nuevo Certificado
                            </h3>

                            {mensaje.texto && (
                                <div
                                    className={`mb-4 flex items-center gap-2 rounded-xl p-4 text-xs font-bold ${mensaje.tipo === 'error'
                                            ? 'bg-red-50 text-red-700'
                                            : 'bg-green-50 text-green-700'
                                        }`}
                                >
                                    {mensaje.tipo === 'error' ? (
                                        <AlertCircle size={18} strokeWidth={2.5} />
                                    ) : (
                                        <CheckCircle size={18} strokeWidth={2.5} />
                                    )}
                                    {mensaje.texto}
                                </div>
                            )}

                            <form onSubmit={handleSubirCertificado} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                            Título del Curso
                                        </label>
                                        <input
                                            type="text"
                                            name="titulo"
                                            required
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-sm font-semibold"
                                            placeholder="Ej. Primeros Auxilios RCP"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                            Institución
                                        </label>
                                        <input
                                            type="text"
                                            name="institucion"
                                            required
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-sm font-semibold"
                                            placeholder="Ej. Cruz Roja"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                        Archivo (PDF o Imagen)
                                    </label>
                                    <input
                                        type="file"
                                        name="archivo"
                                        accept=".pdf,image/*"
                                        required
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#0A0A0A] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:text-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D90429] px-4 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors hover:bg-red-700 disabled:opacity-70"
                                >
                                    {uploading ? (
                                        'Subiendo...'
                                    ) : (
                                        <>
                                            <Upload size={18} strokeWidth={2.5} /> Enviar para validación
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 border-b border-neutral-100 pb-3 text-base font-black uppercase text-neutral-950">
                                Mis Certificados
                            </h3>

                            {certificados.length === 0 ? (
                                <div className="py-8 text-center text-neutral-400">
                                    <FileText size={48} strokeWidth={2} className="mx-auto mb-3 opacity-25" />
                                    <p className="text-sm font-semibold">
                                        No has subido certificados aún.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {certificados.map((cert) => (
                                        <div
                                            key={cert.id}
                                            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="rounded-xl bg-white p-2.5 shadow-sm">
                                                    <Book size={22} strokeWidth={2.5} className="text-[#D90429]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-neutral-900">
                                                        {cert.titulo_curso}
                                                    </h4>
                                                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                                                        <Calendar size={13} strokeWidth={2.5} /> {cert.institucion}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${cert.estado_validacion === 'aprobado'
                                                            ? 'bg-green-100 text-green-700'
                                                            : cert.estado_validacion === 'rechazado'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                >
                                                    {cert.estado_validacion}
                                                </span>
                                                <a
                                                    href={cert.archivo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-black text-blue-600 hover:underline"
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
        </DashboardLayout>
    );
}