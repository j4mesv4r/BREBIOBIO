import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Shield, Book, Upload, CheckCircle, AlertCircle, FileText, Calendar } from 'lucide-react';

export default function MiPerfil() {
    const [loading, setLoading] = useState(true);
    const [perfil, setPerfil] = useState(null);
    const [certificados, setCertificados] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        cargarDatosPerfil();
    }, []);

    const cargarDatosPerfil = async () => {
        try {
            setLoading(true);
            // Obtener el usuario actual
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Cargar datos de la tabla perfiles
                const { data: perfilData, error: perfilError } = await supabase
                    .from('perfiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (perfilError) throw perfilError;
                setPerfil(perfilData);

                // Cargar certificados del usuario
                const { data: certData, error: certError } = await supabase
                    .from('certificados')
                    .select('*')
                    .eq('perfil_id', user.id)
                    .order('creado_en', { ascending: false });

                if (certError) throw certError;
                setCertificados(certData);
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error.message);
            setMensaje({ tipo: 'error', texto: 'No se pudieron cargar los datos del perfil.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubirCertificado = async (e) => {
        e.preventDefault();
        const file = e.target.archivo.files[0];
        const titulo = e.target.titulo.value;
        const institucion = e.target.institucion.value;

        if (!file) return;

        try {
            setUploading(true);
            setMensaje({ tipo: '', texto: '' });

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${perfil.id}/${fileName}`;

            // 1. Subir el archivo al Storage de Supabase (Debes crear un bucket llamado 'certificados')
            const { error: uploadError } = await supabase.storage
                .from('certificados')
                .upload(filePath, file);

            if (uploadError) {
                // Si el bucket no existe, avisamos
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error("El bucket 'certificados' no existe en Storage. Por favor créalo en Supabase.");
                }
                throw uploadError;
            }

            // 2. Obtener la URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('certificados')
                .getPublicUrl(filePath);

            // 3. Guardar el registro en la base de datos
            const { error: dbError } = await supabase
                .from('certificados')
                .insert([
                    {
                        perfil_id: perfil.id,
                        titulo_curso: titulo,
                        institucion: institucion,
                        archivo_url: publicUrl,
                        estado_validacion: 'pendiente'
                    }
                ]);

            if (dbError) throw dbError;

            setMensaje({ tipo: 'exito', texto: 'Certificado subido correctamente para evaluación.' });
            e.target.reset();
            cargarDatosPerfil(); // Recargar la lista

        } catch (error) {
            console.error('Error al subir:', error.message);
            setMensaje({ tipo: 'error', texto: error.message || 'Error al subir el certificado.' });
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

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Cabecera del Perfil */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-black border-b-4 border-red-600"></div>
                    <div className="px-8 pb-8 relative">
                        <div className="absolute -top-16 left-8">
                            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                <User size={64} className="text-gray-300" />
                            </div>
                        </div>

                        <div className="mt-20 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">{perfil?.nombre_completo}</h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                                        <Shield size={16} />
                                        {perfil?.cargo_ong}
                                    </span>
                                    <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Mail size={16} />
                                        {/* El correo se podría sacar de auth.users si hacemos un join, o del context */}
                                        Perfil Activo
                                    </span>
                                </div>
                            </div>

                            {perfil?.rol === 'superadmin' && (
                                <div className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide">
                                    Acceso Superadmin
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Columna Izquierda: Detalles e Info */}
                    <div className="col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Información Operativa</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Especialidad</label>
                                    <p className="font-medium text-gray-900">{perfil?.especialidad || 'No definida aún'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">RUT</label>
                                    <p className="font-medium text-gray-900">{perfil?.rut || 'Pendiente de registro'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Teléfono</label>
                                    <p className="font-medium text-gray-900">{perfil?.telefono || 'No registrado'}</p>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm">
                                Editar Datos Básicos
                            </button>
                        </div>
                    </div>

                    {/* Columna Derecha: Certificados */}
                    <div className="col-span-1 md:col-span-2 space-y-6">

                        {/* Formulario Subir Certificado */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                <Book className="text-red-600" />
                                Subir Nuevo Certificado
                            </h3>

                            {mensaje.texto && (
                                <div className={`p-4 rounded-lg text-sm font-bold mb-4 flex items-center gap-2 ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                    {mensaje.tipo === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                    {mensaje.texto}
                                </div>
                            )}

                            <form onSubmit={handleSubirCertificado} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">TÍTULO DEL CURSO</label>
                                        <input type="text" name="titulo" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Ej. Primeros Auxilios RCP" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">INSTITUCIÓN</label>
                                        <input type="text" name="institucion" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Ej. Cruz Roja" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">ARCHIVO (PDF o Imagen)</label>
                                    <input type="file" name="archivo" accept=".pdf,image/*" required className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300" />
                                </div>

                                <button type="submit" disabled={uploading} className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition-colors disabled:opacity-70 mt-2">
                                    {uploading ? 'Subiendo...' : <><Upload size={18} /> Enviar para validación</>}
                                </button>
                            </form>
                        </div>

                        {/* Lista de Certificados */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Mis Certificados</h3>

                            {certificados.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">No has subido certificados aún.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {certificados.map((cert) => (
                                        <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Book size={24} className="text-red-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{cert.titulo_curso}</h4>
                                                    <p className="text-xs font-medium text-gray-500 flex items-center gap-2 mt-1">
                                                        <Calendar size={12} /> {cert.institucion}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cert.estado_validacion === 'aprobado' ? 'bg-green-100 text-green-700' :
                                                        cert.estado_validacion === 'rechazado' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {cert.estado_validacion.toUpperCase()}
                                                </span>
                                                <a href={cert.archivo_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800">
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