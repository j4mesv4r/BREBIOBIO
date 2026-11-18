import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
    User,
    Camera,
    Download,
    ShieldAlert,
    CheckCircle2,
    Clock,
    FileText,
    Upload,
    AlertCircle,
    PhoneCall,
    HeartPulse,
    BadgeCheck,
    Save,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function MiPerfil() {
    const { user, profile, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [uploadingFoto, setUploadingFoto] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Datos del formulario de ficha / onboarding
    const [form, setForm] = useState({
        nombre_completo: '',
        rut: '',
        telefono: '',
        comuna: '',
        especialidad: '',
        tipo_sangre: 'O+',
        alergias: '',
        contacto_emergencia_nombre: '',
        contacto_emergencia_telefono: '',
        disponible_operativo: true,
        foto_url: '',
    });

    // Certificados del usuario
    const [certificados, setCertificados] = useState([]);
    const [nuevoCert, setNuevoCert] = useState({
        titulo_curso: '',
        institucion: 'SENAPRED',
    });
    const [archivoCert, setArchivoCert] = useState(null);
    const [subiendoCert, setSubiendoCert] = useState(false);

    // Canvas de Credencial PNG + QR
    const canvasRef = useRef(null);
    const [credencialLista, setCredencialLista] = useState(false);

    const rol = (profile?.rol || 'postulante').toLowerCase();
    const esSA = rol === 'superadmin';
    const aprobado = esSA || profile?.estado_validacion === 'aprobado';
    const onboardingListo = esSA || Boolean(profile?.onboarding_completado);

    useEffect(() => {
        if (profile) {
            setForm({
                nombre_completo: profile.nombre_completo || '',
                rut: profile.rut || '',
                telefono: profile.telefono || '',
                comuna: profile.comuna || '',
                especialidad: profile.especialidad || '',
                tipo_sangre: profile.tipo_sangre || 'O+',
                alergias: profile.alergias || '',
                contacto_emergencia_nombre: profile.contacto_emergencia_nombre || '',
                contacto_emergencia_telefono: profile.contacto_emergencia_telefono || '',
                disponible_operativo:
                    profile.disponible_operativo !== undefined
                        ? Boolean(profile.disponible_operativo)
                        : true,
                foto_url: profile.foto_url || '',
            });
        }
    }, [profile]);

    useEffect(() => {
        if (user?.id) {
            cargarCertificados();
        }
    }, [user?.id]);

    const cargarCertificados = async () => {
        const { data, error } = await supabase
            .from('certificados')
            .select('*')
            .eq('perfil_id', user.id)
            .order('creado_en', { ascending: false });

        if (!error && data) {
            setCertificados(data);
        }
    };

    // Subir fotografía institucional al bucket 'avatares'
    const handleSubirFoto = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        setUploadingFoto(true);
        setStatus({ type: '', message: '' });

        try {
            const ext = file.name.split('.').pop();
            const filePath = `${user.id}/avatar_${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('avatares')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error(
                        "Crea el bucket público 'avatares' en Supabase > Storage antes de subir tu fotografía."
                    );
                }
                throw uploadError;
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from('avatares').getPublicUrl(filePath);

            setForm((prev) => ({ ...prev, foto_url: publicUrl }));

            await supabase
                .from('perfiles')
                .update({ foto_url: publicUrl })
                .eq('id', user.id);

            if (refreshProfile) await refreshProfile();
            setStatus({
                type: 'success',
                message: 'Fotografía institucional actualizada correctamente.',
            });
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.message || 'No se pudo subir la fotografía.',
            });
        } finally {
            setUploadingFoto(false);
        }
    };

    // Guardar Ficha Personal / Completar Onboarding Obligatorio
    const handleGuardarFicha = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (!form.foto_url) {
            setStatus({
                type: 'error',
                message:
                    'Debes subir una fotografía formal o institucional antes de guardar tu ficha.',
            });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                nombre_completo: form.nombre_completo.trim(),
                rut: form.rut.trim(),
                telefono: form.telefono.trim(),
                comuna: form.comuna.trim(),
                especialidad: form.especialidad.trim(),
                tipo_sangre: form.tipo_sangre,
                alergias: form.alergias.trim() || 'Ninguna',
                contacto_emergencia_nombre: form.contacto_emergencia_nombre.trim(),
                contacto_emergencia_telefono: form.contacto_emergencia_telefono.trim(),
                disponible_operativo: form.disponible_operativo,
                foto_url: form.foto_url,
                onboarding_completado: true,
            };

            const { error } = await supabase
                .from('perfiles')
                .update(payload)
                .eq('id', user.id);

            if (error) throw error;

            if (refreshProfile) await refreshProfile();
            setStatus({
                type: 'success',
                message: 'Antecedentes guardados correctamente.',
            });
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.message || 'Error al guardar los datos personales.',
            });
        } finally {
            setSaving(false);
        }
    };

    // Subir Certificado (SENAPRED u otros)
    const handleSubirCertificado = async (e) => {
        e.preventDefault();
        if (!nuevoCert.titulo_curso.trim() || !archivoCert) return;

        setSubiendoCert(true);
        try {
            const ext = archivoCert.name.split('.').pop();
            const filePath = `${user.id}/cert_${Date.now()}.${ext}`;

            const { error: upErr } = await supabase.storage
                .from('avatares')
                .upload(filePath, archivoCert);

            if (upErr) throw upErr;

            const {
                data: { publicUrl },
            } = supabase.storage.from('avatares').getPublicUrl(filePath);

            const { error: dbErr } = await supabase.from('certificados').insert([
                {
                    perfil_id: user.id,
                    titulo_curso: nuevoCert.titulo_curso.trim(),
                    institucion: nuevoCert.institucion.trim() || 'SENAPRED',
                    archivo_url: publicUrl,
                    estado_validacion: 'pendiente',
                },
            ]);

            if (dbErr) throw dbErr;

            setNuevoCert({ titulo_curso: '', institucion: 'SENAPRED' });
            setArchivoCert(null);
            cargarCertificados();
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.message || 'No se pudo subir el certificado.',
            });
        } finally {
            setSubiendoCert(false);
        }
    };

    // Renderizado automático de Credencial PNG con QR sobre /credencial-plantilla.png
    useEffect(() => {
        if (!aprobado || !profile?.codigo_credencial || !canvasRef.current) return;

        const renderizarCredencial = async () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const W = 638;
            const H = 1012;
            canvas.width = W;
            canvas.height = H;

            // 1. Intentar cargar plantilla PNG institucional desde /credencial-plantilla.png
            const plantilla = new Image();
            plantilla.crossOrigin = 'anonymous';
            plantilla.src = '/credencial-plantilla.png';

            await new Promise((resolve) => {
                plantilla.onload = () => {
                    ctx.drawImage(plantilla, 0, 0, W, H);
                    resolve();
                };
                plantilla.onerror = () => {
                    // Respaldo institucional automático si aún no subes credencial-plantilla.png a public/
                    ctx.fillStyle = '#0A0A0A';
                    ctx.fillRect(0, 0, W, H);
                    ctx.fillStyle = '#D90429';
                    ctx.fillRect(0, 0, W, 175);
                    ctx.fillStyle = '#F2B632';
                    ctx.fillRect(0, 175, W, 12);

                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '900 32px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('O.N.G. BRE BÍO-BÍO', W / 2, 75);
                    ctx.font = '700 18px sans-serif';
                    ctx.fillText('BÚSQUEDA Y RESCATE EN EMERGENCIAS', W / 2, 115);

                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(36, 215, W - 72, H - 255);
                    resolve();
                };
            });

            // 2. Dibujar Fotografía del Voluntario (Centro superior)
            const fotoW = 210;
            const fotoH = 240;
            const fotoX = (W - fotoW) / 2;
            const fotoY = 235;

            if (profile.foto_url) {
                const avatarImg = new Image();
                avatarImg.crossOrigin = 'anonymous';
                avatarImg.src = profile.foto_url;

                await new Promise((resolve) => {
                    avatarImg.onload = () => {
                        ctx.save();
                        ctx.beginPath();
                        ctx.roundRect(fotoX, fotoY, fotoW, fotoH, 16);
                        ctx.clip();
                        ctx.drawImage(avatarImg, fotoX, fotoY, fotoW, fotoH);
                        ctx.restore();
                        ctx.strokeStyle = '#0A0A0A';
                        ctx.lineWidth = 4;
                        ctx.strokeRect(fotoX, fotoY, fotoW, fotoH);
                        resolve();
                    };
                    avatarImg.onerror = () => resolve();
                });
            }

            // 3. Superponer Datos Identificatorios y Código BRE-XXXXXX
            ctx.textAlign = 'center';
            ctx.fillStyle = '#0A0A0A';
            ctx.font = '900 28px sans-serif';
            ctx.fillText(
                (profile.nombre_completo || 'VOLUNTARIO BRE').toUpperCase(),
                W / 2,
                525
            );

            ctx.fillStyle = '#D90429';
            ctx.font = '900 24px sans-serif';
            ctx.fillText(profile.codigo_credencial, W / 2, 565);

            ctx.fillStyle = '#333333';
            ctx.font = '700 20px sans-serif';
            ctx.fillText(`RUT: ${profile.rut || 'N/R'}`, W / 2, 602);

            const textoRol = `${rol.toUpperCase()}${profile.especialidad ? ` · ${profile.especialidad.toUpperCase()}` : ''
                }`;
            ctx.fillStyle = '#0A0A0A';
            ctx.font = '800 17px sans-serif';
            ctx.fillText(textoRol, W / 2, 638);

            ctx.fillStyle = '#B91C1C';
            ctx.font = '900 18px sans-serif';
            ctx.fillText(
                `GRUPO SANGUÍNEO: ${profile.tipo_sangre || 'N/R'}`,
                W / 2,
                672
            );

            // 4. Generar y dibujar Código QR vinculado a la ficha pública fiscalizable
            const urlVerificacion = `${window.location.origin}/voluntario/${encodeURIComponent(
                profile.codigo_credencial
            )}`;
            const qrDataUrl = await QRCode.toDataURL(urlVerificacion, {
                width: 210,
                margin: 1,
                color: { dark: '#0A0A0A', light: '#FFFFFF' },
            });

            const qrImg = new Image();
            qrImg.src = qrDataUrl;
            await new Promise((resolve) => {
                qrImg.onload = () => {
                    const qrSize = 195;
                    ctx.drawImage(qrImg, (W - qrSize) / 2, 705, qrSize, qrSize);
                    resolve();
                };
            });

            ctx.fillStyle = '#525252';
            ctx.font = '700 13px sans-serif';
            ctx.fillText(
                'ESCANEAR PARA VALIDACIÓN OFICIAL EN TERRENO',
                W / 2,
                925
            );

            setCredencialLista(true);
        };

        renderizarCredencial();
    }, [aprobado, profile, rol]);

    const descargarCredencialPNG = () => {
        if (!canvasRef.current) return;
        const enlace = document.createElement('a');
        enlace.download = `Credencial_${profile?.codigo_credencial || 'BRE_BIOBIO'
            }.png`;
        enlace.href = canvasRef.current.toDataURL('image/png');
        enlace.click();
    };

    // ============================================================================
    // VISTA 1: ONBOARDING OBLIGATORIO DE PRIMER INGRESO
    // ============================================================================
    if (!onboardingListo) {
        return (
            <DashboardLayout
                title="Completar Ficha Institucional"
                subtitle="Paso obligatorio de primer ingreso para generar tu código BRE y solicitar autorización"
            >
                <div className="mx-auto max-w-3xl rounded-2xl border-2 border-[#0A0A0A] bg-white p-6 shadow-xl sm:p-8">
                    <div className="mb-6 border-b border-neutral-200 pb-4">
                        <span className="rounded-lg bg-[#F2B632] px-3 py-1 text-[11px] font-black uppercase text-black">
                            Primer Ingreso · Registro Obligatorio
                        </span>
                        <h2 className="mt-2 text-xl font-black uppercase text-neutral-950">
                            Antecedentes Personales y Fotografía
                        </h2>
                        <p className="mt-1 text-xs font-medium text-neutral-600">
                            Para activar tu perfil y asignarte tu código institucional{' '}
                            <strong>BRE-XXXXXX</strong>, completa tus datos médicos, de
                            emergencia y sube tu fotografía.
                        </p>
                    </div>

                    {status.message && (
                        <div
                            className={`mb-5 rounded-xl border-l-4 p-3.5 text-xs font-bold ${status.type === 'error'
                                    ? 'border-[#D90429] bg-red-50 text-red-900'
                                    : 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                }`}
                        >
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleGuardarFicha} className="space-y-5">
                        {/* Carga de Fotografía */}
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:flex-row">
                            <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-white">
                                {form.foto_url ? (
                                    <img
                                        src={form.foto_url}
                                        alt="Foto perfil"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User size={36} className="text-neutral-300" />
                                )}
                            </div>
                            <div className="space-y-2 text-center sm:text-left">
                                <h3 className="text-xs font-black uppercase text-neutral-900">
                                    Fotografía para Credencial (Obligatoria)
                                </h3>
                                <p className="text-xs text-neutral-500">
                                    Sube una fotografía de rostro despejado con buena iluminación.
                                </p>
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800">
                                    <Camera size={15} />
                                    <span>
                                        {uploadingFoto ? 'Subiendo...' : 'Seleccionar Fotografía'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleSubirFoto}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.nombre_completo}
                                    onChange={(e) =>
                                        setForm({ ...form, nombre_completo: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    RUT (Ej. 19082512-4)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.rut}
                                    onChange={(e) => setForm({ ...form, rut: e.target.value })}
                                    placeholder="19082512-4"
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Teléfono Móvil
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={form.telefono}
                                    onChange={(e) =>
                                        setForm({ ...form, telefono: e.target.value })
                                    }
                                    placeholder="+56 9 1234 5678"
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Comuna de Residencia
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.comuna}
                                    onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                                    placeholder="Ej. Concepción / Talcahuano / Los Ángeles"
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Grupo Sanguíneo
                                </label>
                                <select
                                    value={form.tipo_sangre}
                                    onChange={(e) =>
                                        setForm({ ...form, tipo_sangre: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-bold"
                                >
                                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(
                                        (gs) => (
                                            <option key={gs} value={gs}>
                                                {gs}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Especialidad / Área de Apoyo
                                </label>
                                <input
                                    type="text"
                                    value={form.especialidad}
                                    onChange={(e) =>
                                        setForm({ ...form, especialidad: e.target.value })
                                    }
                                    placeholder="Ej. Búsqueda Agreste, Primeros Auxilios, Logística"
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Alergias o Condiciones Médicas Relevantes
                                </label>
                                <input
                                    type="text"
                                    value={form.alergias}
                                    onChange={(e) =>
                                        setForm({ ...form, alergias: e.target.value })
                                    }
                                    placeholder="Indicar alergias a medicamentos/alimentos o escribir 'Ninguna'"
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Nombre Contacto de Emergencia (ICE)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.contacto_emergencia_nombre}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            contacto_emergencia_nombre: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Teléfono Contacto de Emergencia
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={form.contacto_emergencia_telefono}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            contacto_emergencia_telefono: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full rounded-xl bg-[#D90429] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {saving
                                ? 'Guardando antecedentes...'
                                : 'Guardar Ficha y Solicitar Autorización'}
                        </button>
                    </form>
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================================
    // VISTA 2: SALA DE ESPERA INSTITUCIONAL (Perfil aún no autorizado)
    // ============================================================================
    if (!aprobado) {
        return (
            <DashboardLayout
                title="Estado de Postulación"
                subtitle="Verificación de antecedentes por el Directorio O.N.G. BRE Bío-Bío"
            >
                <div className="mx-auto max-w-xl rounded-2xl border-2 border-[#F2B632] bg-[#0A0A0A] p-8 text-center text-white shadow-2xl">
                    <Clock
                        size={52}
                        strokeWidth={2.2}
                        className="mx-auto mb-4 text-[#F2B632]"
                    />
                    <span className="rounded-lg bg-[#D90429] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        Perfil en Revisión · {profile?.codigo_credencial || 'Pendiente'}
                    </span>
                    <h2 className="mt-3 text-xl font-black uppercase">
                        Tu perfil aún no ha sido autorizado
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                        Hola <strong>{profile?.nombre_completo}</strong>, tus antecedentes
                        ya fueron recibidos por la institución. Contáctate con tu{' '}
                        <strong>Director o Jefe de Grupo</strong> para asignarte caso o
                        agilizar tu autorización como Postulante o Voluntario activo.
                    </p>

                    <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-left text-xs text-neutral-300">
                        <p className="font-black uppercase text-[#F2B632]">
                            Datos Registrados:
                        </p>
                        <p className="mt-1">
                            <strong>RUT:</strong> {profile?.rut} · <strong>Comuna:</strong>{' '}
                            {profile?.comuna || 'No indicada'}
                        </p>
                        <p className="mt-0.5">
                            <strong>Estado actual:</strong>{' '}
                            {(profile?.estado_validacion || 'pendiente').toUpperCase()}
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ============================================================================
    // VISTA 3: PERFIL COMPLETO + CREDENCIAL PNG CON QR + CERTIFICADOS
    // ============================================================================
    return (
        <DashboardLayout
            title="Mi Ficha y Credencial"
            subtitle="Identificación oficial BRE Bío-Bío, código QR fiscalizable y hoja de vida"
            actions={
                <div className="flex items-center gap-2">
                    {profile?.codigo_credencial && (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3.5 py-2 text-xs font-black tracking-wider text-[#F2B632]">
                            <BadgeCheck size={16} /> {profile.codigo_credencial}
                        </span>
                    )}
                </div>
            }
        >
            {status.message && (
                <div
                    className={`mb-6 flex items-center gap-2 rounded-xl border-l-4 p-4 text-xs font-bold ${status.type === 'error'
                            ? 'border-[#D90429] bg-red-50 text-red-900'
                            : 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        }`}
                >
                    <AlertCircle size={17} />
                    <span>{status.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Columna Izquierda: Vista Previa y Descarga de Credencial PNG + QR */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-900">
                            <BadgeCheck size={17} className="text-[#D90429]" /> Credencial
                            Institucional Digital
                        </h2>

                        <div className="overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-neutral-900 shadow-lg">
                            <canvas
                                ref={canvasRef}
                                className="mx-auto block h-auto w-full max-w-[300px]"
                            />
                        </div>

                        <button
                            type="button"
                            disabled={!credencialLista}
                            onClick={descargarCredencialPNG}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D90429] px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-red-700 disabled:opacity-50"
                        >
                            <Download size={16} strokeWidth={2.5} /> Descargar Credencial PNG
                        </button>
                        <p className="mt-2 text-center text-[11px] font-medium text-neutral-500">
                            El código QR enlaza directamente a tu ficha pública validada por
                            el Directorio.
                        </p>
                    </div>
                </div>

                {/* Columna Derecha (2/3): Edición de Ficha + Subida de Certificados */}
                <div className="space-y-6 lg:col-span-2">
                    <form
                        onSubmit={handleGuardarFicha}
                        className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-16 w-16 overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-neutral-100">
                                    {form.foto_url ? (
                                        <img
                                            src={form.foto_url}
                                            alt="Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="m-auto mt-3 text-neutral-400" size={32} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-neutral-950">
                                        {form.nombre_completo}
                                    </h3>
                                    <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1 text-[11px] font-black uppercase text-neutral-800 hover:bg-neutral-200">
                                        <Camera size={13} />
                                        {uploadingFoto ? 'Subiendo...' : 'Cambiar Fotografía'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSubirFoto}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-black uppercase">
                                <input
                                    type="checkbox"
                                    checked={form.disponible_operativo}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            disponible_operativo: e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 rounded text-emerald-600"
                                />
                                <span
                                    className={
                                        form.disponible_operativo
                                            ? 'text-emerald-700'
                                            : 'text-neutral-500'
                                    }
                                >
                                    {form.disponible_operativo
                                        ? 'Disponible para Llamado'
                                        : 'No Disponible Temporalmente'}
                                </span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.nombre_completo}
                                    onChange={(e) =>
                                        setForm({ ...form, nombre_completo: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                    RUT
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.rut}
                                    onChange={(e) => setForm({ ...form, rut: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={form.telefono}
                                    onChange={(e) =>
                                        setForm({ ...form, telefono: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                    Comuna
                                </label>
                                <input
                                    type="text"
                                    value={form.comuna}
                                    onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                    Grupo Sanguíneo
                                </label>
                                <select
                                    value={form.tipo_sangre}
                                    onChange={(e) =>
                                        setForm({ ...form, tipo_sangre: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-sm font-bold"
                                >
                                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(
                                        (gs) => (
                                            <option key={gs} value={gs}>
                                                {gs}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                    Especialidad
                                </label>
                                <input
                                    type="text"
                                    value={form.especialidad}
                                    onChange={(e) =>
                                        setForm({ ...form, especialidad: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                    Alergias / Antecedentes Médicos
                                </label>
                                <input
                                    type="text"
                                    value={form.alergias}
                                    onChange={(e) =>
                                        setForm({ ...form, alergias: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                    Contacto Emergencia (Nombre)
                                </label>
                                <input
                                    type="text"
                                    value={form.contacto_emergencia_nombre}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            contacto_emergencia_nombre: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                    Contacto Emergencia (Teléfono)
                                </label>
                                <input
                                    type="tel"
                                    value={form.contacto_emergencia_telefono}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            contacto_emergencia_telefono: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#0A0A0A] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#F2B632] hover:bg-neutral-800"
                            >
                                <Save size={15} />
                                {saving ? 'Guardando...' : 'Actualizar Mis Antecedentes'}
                            </button>
                        </div>
                    </form>

                    {/* Certificados y Diplomas (SENAPRED / Cursos) */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-900">
                            <FileText size={17} className="text-[#D90429]" /> Mis Certificados
                            y Cursos Aprobados
                        </h3>

                        <form
                            onSubmit={handleSubirCertificado}
                            className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-3"
                        >
                            <input
                                type="text"
                                required
                                value={nuevoCert.titulo_curso}
                                onChange={(e) =>
                                    setNuevoCert({ ...nuevoCert, titulo_curso: e.target.value })
                                }
                                placeholder="Nombre del curso (Ej. Sistema SINAPRED)"
                                className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
                            />
                            <input
                                type="text"
                                value={nuevoCert.institucion}
                                onChange={(e) =>
                                    setNuevoCert({ ...nuevoCert, institucion: e.target.value })
                                }
                                placeholder="Institución (SENAPRED)"
                                className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,image/*"
                                    onChange={(e) => setArchivoCert(e.target.files?.[0] || null)}
                                    className="w-full text-[11px]"
                                />
                                <button
                                    type="submit"
                                    disabled={subiendoCert}
                                    className="shrink-0 rounded-xl bg-[#D90429] px-3.5 py-2 text-xs font-black uppercase text-white"
                                >
                                    <Upload size={14} />
                                </button>
                            </div>
                        </form>

                        <div className="space-y-2">
                            {certificados.length === 0 ? (
                                <p className="text-xs font-semibold text-neutral-400">
                                    Aún no has cargado certificados en tu hoja de vida.
                                </p>
                            ) : (
                                certificados.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-2.5 text-xs"
                                    >
                                        <div>
                                            <p className="font-black text-neutral-900">
                                                {c.titulo_curso}
                                            </p>
                                            <p className="text-[11px] text-neutral-500">
                                                {c.institucion}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase ${c.estado_validacion === 'aprobado'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                                }`}
                                        >
                                            {c.estado_validacion}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}