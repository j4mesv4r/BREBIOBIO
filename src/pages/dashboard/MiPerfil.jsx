import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
    User,
    Camera,
    Download,
    Clock,
    FileText,
    Upload,
    AlertCircle,
    BadgeCheck,
    Save,
    X,
    ShieldAlert,
    Sparkles,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const ESPECIALIDADES_SUGERIDAS = [
    { nombre: 'Búsqueda Agreste', abrev: 'B. AGR' },
    { nombre: 'Rescate Vertical', abrev: 'R. VERT' },
    { nombre: 'Rescate Acuático', abrev: 'R. ACU' },
    { nombre: 'Primeros Auxilios', abrev: 'P. AUX' },
    { nombre: 'Atención Prehospitalaria', abrev: 'PREHOSP' },
    { nombre: 'Comunicaciones', abrev: 'COMUN' },
    { nombre: 'Logística', abrev: 'LOGÍST' },
    { nombre: 'Cartografía y GPS', abrev: 'CART/GPS' },
    { nombre: 'Operador Drone', abrev: 'DRONE' },
    { nombre: 'Unidad Canina K9', abrev: 'K9' },
    { nombre: 'Sistema Comando Incidentes', abrev: 'SCI' },
    { nombre: 'Rescate Vehicular', abrev: 'R. VEH' },
];

const AVATAR_GENERICO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280">
    <rect width="240" height="280" fill="#171717"/>
    <circle cx="120" cy="95" r="46" fill="#525252"/>
    <path d="M40 255c0-48 36-78 80-78s80 30 80 78" fill="#525252"/>
    <rect x="0" y="242" width="240" height="38" fill="#D90429"/>
    <text x="120" y="266" font-family="sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">AVATAR PROVISORIO</text>
  </svg>`
)}`;

function abreviarEspecialidadesParaCredencial(lista) {
    if (!Array.isArray(lista) || lista.length === 0) return '';
    const textoCompleto = lista.join(' · ').toUpperCase();
    if (lista.length <= 2 && textoCompleto.length <= 34) {
        return textoCompleto;
    }
    return lista
        .map((esp) => {
            const encontrada = ESPECIALIDADES_SUGERIDAS.find(
                (s) => s.nombre.toLowerCase() === esp.toLowerCase()
            );
            if (encontrada) return encontrada.abrev;
            return esp
                .split(' ')
                .map((p) => (p.length > 4 ? p.slice(0, 4) + '.' : p))
                .join(' ')
                .toUpperCase();
        })
        .join(' · ');
}

export default function MiPerfil() {
    const { user, profile, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [uploadingFoto, setUploadingFoto] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Formulario ficha / onboarding
    const [form, setForm] = useState({
        nombre_completo: '',
        rut: '',
        telefono: '',
        comuna: '',
        especialidades: [],
        tipo_sangre: 'O+',
        alergias: '',
        contacto_emergencia_nombre: '',
        contacto_emergencia_telefono: '',
        disponible_operativo: true,
        foto_url: '',
        usando_avatar_generico: false,
    });

    // Input de Chips/Tags + Autocomplete para Especialidades
    const [inputEsp, setInputEsp] = useState('');
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    // Certificados
    const [certificados, setCertificados] = useState([]);
    const [nuevoCert, setNuevoCert] = useState({
        titulo_curso: '',
        institucion: 'SENAPRED',
    });
    const [archivoCert, setArchivoCert] = useState(null);
    const [subiendoCert, setSubiendoCert] = useState(false);

    // Credencial PNG + QR
    const canvasRef = useRef(null);
    const [credencialLista, setCredencialLista] = useState(false);

    const rol = (profile?.rol || 'postulante').toLowerCase();
    const esSA = rol === 'superadmin';
    const aprobado = esSA || profile?.estado_validacion === 'aprobado';
    const onboardingListo = esSA || Boolean(profile?.onboarding_completado);

    useEffect(() => {
        if (profile) {
            const listaEsp = Array.isArray(profile.especialidades)
                ? profile.especialidades
                : profile.especialidad
                    ? [profile.especialidad]
                    : [];

            setForm({
                nombre_completo: profile.nombre_completo || '',
                rut: profile.rut || '',
                telefono: profile.telefono || '',
                comuna: profile.comuna || '',
                especialidades: listaEsp,
                tipo_sangre: profile.tipo_sangre || 'O+',
                alergias: profile.alergias || '',
                contacto_emergencia_nombre: profile.contacto_emergencia_nombre || '',
                contacto_emergencia_telefono: profile.contacto_emergencia_telefono || '',
                disponible_operativo:
                    profile.disponible_operativo !== undefined
                        ? Boolean(profile.disponible_operativo)
                        : true,
                foto_url: profile.foto_url || '',
                usando_avatar_generico: Boolean(profile.usando_avatar_generico),
            });
        }
    }, [profile]);

    useEffect(() => {
        if (user?.id) cargarCertificados();
    }, [user?.id]);

    const cargarCertificados = async () => {
        const { data, error } = await supabase
            .from('certificados')
            .select('*')
            .eq('perfil_id', user.id)
            .order('creado_en', { ascending: false });

        if (!error && data) setCertificados(data);
    };

    // ============================================================================
    // CÁLCULO DE ESTADO DE PRÓRROGAS PARA AVATAR GENÉRICO (7 + 15 + 15 DÍAS)
    // ============================================================================
    const calcularEstadoAvatar = () => {
        if (form.foto_url && !form.usando_avatar_generico) {
            return {
                requiereFoto: false,
                vencido: false,
                puedeProrrogar: false,
                diasRestantes: 0,
                etapa: 'oficial',
            };
        }

        const inicio = profile?.fecha_inicio_avatar_generico
            ? new Date(profile.fecha_inicio_avatar_generico)
            : new Date();
        const prorrogas = Number(profile?.prorrogas_avatar_usadas || 0);
        // Tramo 0: 7 días | Prórroga 1: +15 días (22) | Prórroga 2 (última): +15 días (37)
        const diasPermitidos = 7 + prorrogas * 15;
        const msTranscurridos = Date.now() - inicio.getTime();
        const diasTranscurridos = Math.floor(msTranscurridos / (1000 * 60 * 60 * 24));
        const diasRestantes = Math.max(0, diasPermitidos - diasTranscurridos);
        const vencido = diasTranscurridos >= diasPermitidos;
        const puedeProrrogar = vencido && prorrogas < 2;

        return {
            requiereFoto: true,
            vencido,
            puedeProrrogar,
            prorrogas,
            diasRestantes,
            etapa:
                prorrogas === 0
                    ? 'Plazo inicial (7 días)'
                    : prorrogas === 1
                        ? '1ª Prórroga (+15 días)'
                        : 'Última Prórroga (+15 días)',
        };
    };

    const estadoAvatar = calcularEstadoAvatar();

    const handleExtenderProrrogaAvatar = async () => {
        const actuales = Number(profile?.prorrogas_avatar_usadas || 0);
        if (actuales >= 2 || !user?.id) return;

        const { error } = await supabase
            .from('perfiles')
            .update({
                usando_avatar_generico: true,
                fecha_inicio_avatar_generico:
                    profile?.fecha_inicio_avatar_generico || new Date().toISOString(),
                prorrogas_avatar_usadas: actuales + 1,
            })
            .eq('id', user.id);

        if (!error) {
            if (refreshProfile) await refreshProfile();
            setStatus({
                type: 'success',
                message:
                    actuales + 1 === 1
                        ? 'Primera prórroga de 15 días activada. Recuerda subir tu fotografía institucional.'
                        : 'Última prórroga de 15 días activada. Al vencer deberás subir tu fotografía obligatoriamente.',
            });
        }
    };

    // ============================================================================
    // CHIPS / TAGS + AUTOCOMPLETE DE ESPECIALIDADES
    // ============================================================================
    const agregarEspecialidadChip = (valorRaw) => {
        const limpio = valorRaw.replace(/,/g, '').trim();
        if (!limpio) return;
        const existe = form.especialidades.some(
            (e) => e.toLowerCase() === limpio.toLowerCase()
        );
        if (!existe) {
            setForm((prev) => ({
                ...prev,
                especialidades: [...prev.especialidades, limpio],
            }));
        }
        setInputEsp('');
        setMostrarSugerencias(false);
    };

    const eliminarEspecialidadChip = (item) => {
        setForm((prev) => ({
            ...prev,
            especialidades: prev.especialidades.filter((e) => e !== item),
        }));
    };

    const handleKeyDownEspecialidad = (e) => {
        if (['Enter', ',', ' '].includes(e.key)) {
            if (inputEsp.trim().length > 0) {
                e.preventDefault();
                agregarEspecialidadChip(inputEsp);
            }
        } else if (
            e.key === 'Backspace' &&
            inputEsp === '' &&
            form.especialidades.length > 0
        ) {
            eliminarEspecialidadChip(
                form.especialidades[form.especialidades.length - 1]
            );
        }
    };

    const sugerenciasFiltradas = ESPECIALIDADES_SUGERIDAS.filter(
        (s) =>
            s.nombre.toLowerCase().includes(inputEsp.toLowerCase()) &&
            !form.especialidades.some(
                (e) => e.toLowerCase() === s.nombre.toLowerCase()
            )
    );

    // ============================================================================
    // SUBIDA DE FOTOGRAFÍA OFICIAL O SELECCIÓN DE AVATAR GENÉRICO
    // ============================================================================
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

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from('avatares').getPublicUrl(filePath);

            setForm((prev) => ({
                ...prev,
                foto_url: publicUrl,
                usando_avatar_generico: false,
            }));

            await supabase
                .from('perfiles')
                .update({
                    foto_url: publicUrl,
                    usando_avatar_generico: false,
                })
                .eq('id', user.id);

            if (refreshProfile) await refreshProfile();
            setStatus({
                type: 'success',
                message: 'Fotografía oficial actualizada correctamente.',
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

    const seleccionarAvatarGenerico = () => {
        setForm((prev) => ({
            ...prev,
            foto_url: '',
            usando_avatar_generico: true,
        }));
        setStatus({
            type: 'success',
            message:
                'Avatar genérico seleccionado por 7 días. Podrás subir tu fotografía oficial más adelante.',
        });
    };

    const handleGuardarFicha = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (!form.foto_url && !form.usando_avatar_generico) {
            setStatus({
                type: 'error',
                message:
                    'Sube tu fotografía institucional o selecciona el Avatar Genérico provisorio (7 días).',
            });
            return;
        }

        setSaving(true);
        try {
            const esGenerico = !form.foto_url && form.usando_avatar_generico;
            const textoEspecialidadLegacy = form.especialidades.join(', ');

            const payload = {
                nombre_completo: form.nombre_completo.trim(),
                rut: form.rut.trim(),
                telefono: form.telefono.trim(),
                comuna: form.comuna.trim(),
                especialidad: textoEspecialidadLegacy,
                especialidades: form.especialidades,
                tipo_sangre: form.tipo_sangre,
                alergias: form.alergias.trim() || 'Ninguna',
                contacto_emergencia_nombre: form.contacto_emergencia_nombre.trim(),
                contacto_emergencia_telefono: form.contacto_emergencia_telefono.trim(),
                disponible_operativo: form.disponible_operativo,
                foto_url: esGenerico ? null : form.foto_url,
                usando_avatar_generico: esGenerico,
                fecha_inicio_avatar_generico: esGenerico
                    ? profile?.fecha_inicio_avatar_generico || new Date().toISOString()
                    : profile?.fecha_inicio_avatar_generico || null,
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

    // ============================================================================
    // RENDERIZADO DE CREDENCIAL PNG CON QR + ESPECIALIDADES ABREVIADAS
    // ============================================================================
    useEffect(() => {
        if (!aprobado || !profile?.codigo_credencial || !canvasRef.current) return;

        const renderizarCredencial = async () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const W = 638;
            const H = 1012;
            canvas.width = W;
            canvas.height = H;

            const plantilla = new Image();
            plantilla.crossOrigin = 'anonymous';
            plantilla.src = '/credencial-plantilla.png';

            await new Promise((resolve) => {
                plantilla.onload = () => {
                    ctx.drawImage(plantilla, 0, 0, W, H);
                    resolve();
                };
                plantilla.onerror = () => {
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

            const fotoW = 210;
            const fotoH = 240;
            const fotoX = (W - fotoW) / 2;
            const fotoY = 235;

            const srcFoto = profile.foto_url || AVATAR_GENERICO_SVG;
            const avatarImg = new Image();
            avatarImg.crossOrigin = 'anonymous';
            avatarImg.src = srcFoto;

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

            const listaEsp = Array.isArray(profile.especialidades)
                ? profile.especialidades
                : profile.especialidad
                    ? [profile.especialidad]
                    : [];
            const espFormateada = abreviarEspecialidadesParaCredencial(listaEsp);
            const textoRol = `${rol.toUpperCase()}${espFormateada ? ` · ${espFormateada}` : ''
                }`;

            ctx.fillStyle = '#0A0A0A';
            ctx.font = '800 16px sans-serif';
            ctx.fillText(textoRol, W / 2, 638, W - 96);

            ctx.fillStyle = '#B91C1C';
            ctx.font = '900 18px sans-serif';
            ctx.fillText(
                `GRUPO SANGUÍNEO: ${profile.tipo_sangre || 'N/R'}`,
                W / 2,
                672
            );

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

    // Componente reutilizable del Selector de Especialidades con Chips + Autocomplete
    const renderSelectorEspecialidades = () => (
        <div className="relative sm:col-span-2">
            <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                Especialidades (Escribe y presiona Espacio, Coma o Enter)
            </label>
            <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 focus-within:border-[#0A0A0A]">
                {form.especialidades.map((esp) => (
                    <span
                        key={esp}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0A0A0A] px-2.5 py-1 text-xs font-black text-[#F2B632]"
                    >
                        {esp}
                        <button
                            type="button"
                            onClick={() => eliminarEspecialidadChip(esp)}
                            className="rounded-full p-0.5 text-neutral-400 hover:bg-white/15 hover:text-white"
                        >
                            <X size={12} strokeWidth={3} />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputEsp}
                    onFocus={() => setMostrarSugerencias(true)}
                    onBlur={() => setTimeout(() => setMostrarSugerencias(false), 180)}
                    onChange={(e) => {
                        setInputEsp(e.target.value);
                        setMostrarSugerencias(true);
                    }}
                    onKeyDown={handleKeyDownEspecialidad}
                    placeholder={
                        form.especialidades.length === 0
                            ? 'Ej. Búsqueda Agreste, Primeros Auxilios...'
                            : 'Agregar otra...'
                    }
                    className="min-w-[160px] flex-1 bg-transparent text-sm font-semibold outline-none"
                />
            </div>

            {mostrarSugerencias && sugerenciasFiltradas.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl">
                    {sugerenciasFiltradas.map((sug) => (
                        <button
                            key={sug.nombre}
                            type="button"
                            onMouseDown={() => agregarEspecialidadChip(sug.nombre)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold text-neutral-800 hover:bg-neutral-100"
                        >
                            <span>{sug.nombre}</span>
                            <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-black text-neutral-600">
                                {sug.abrev}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // ============================================================================
    // BANNER DE ALERTA / PRÓRROGA DE FOTOGRAFÍA INSTITUCIONAL
    // ============================================================================
    const renderBannerFotografia = () => {
        if (!estadoAvatar.requiereFoto) return null;

        return (
            <div
                className={`mb-6 rounded-2xl border-l-4 p-4 shadow-sm ${estadoAvatar.vencido
                        ? 'border-[#D90429] bg-red-50 text-red-950'
                        : 'border-amber-500 bg-amber-50 text-amber-950'
                    }`}
            >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-xs font-black uppercase">
                            <ShieldAlert
                                size={16}
                                className={
                                    estadoAvatar.vencido ? 'text-[#D90429]' : 'text-amber-600'
                                }
                            />
                            {estadoAvatar.vencido
                                ? 'Plazo Vencido: Debes actualizar tu fotografía institucional'
                                : `Avatar Genérico Activo · ${estadoAvatar.etapa} (${estadoAvatar.diasRestantes} días restantes)`}
                        </p>
                        <p className="text-xs font-medium">
                            {estadoAvatar.vencido && !estadoAvatar.puedeProrrogar
                                ? 'Ya utilizaste el plazo inicial de 7 días y tus dos prórrogas de 15 días. Este aviso permanecerá activo hasta que subas tu fotografía oficial.'
                                : 'Puedes seguir editando tus datos personales, pero recuerda cargar tu fotografía formal o con uniforme institucional.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#D90429] px-3.5 py-2 text-xs font-black uppercase text-white hover:bg-red-700">
                            <Camera size={14} />
                            <span>{uploadingFoto ? 'Subiendo...' : 'Subir Foto Ahora'}</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleSubirFoto}
                                className="hidden"
                            />
                        </label>

                        {estadoAvatar.puedeProrrogar && (
                            <button
                                type="button"
                                onClick={handleExtenderProrrogaAvatar}
                                className="rounded-xl border border-neutral-800 bg-[#0A0A0A] px-3.5 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800"
                            >
                                {estadoAvatar.prorrogas === 0
                                    ? 'Solicitar Prórroga (+15 días)'
                                    : 'Última Prórroga (+15 días)'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================================
    // VISTA 1: ONBOARDING OBLIGATORIO DE PRIMER INGRESO
    // ============================================================================
    if (!onboardingListo) {
        return (
            <DashboardLayout
                title="Completar Ficha Institucional"
                subtitle="Paso obligatorio de primer ingreso para generar tu código BRE"
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
                            Sube tu fotografía institucional o elige el{' '}
                            <strong>Avatar Genérico Provisorio (7 días)</strong> mientras
                            obtienes tu foto oficial.
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
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:flex-row">
                            <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-white">
                                {form.foto_url ? (
                                    <img
                                        src={form.foto_url}
                                        alt="Foto perfil"
                                        className="h-full w-full object-cover"
                                    />
                                ) : form.usando_avatar_generico ? (
                                    <img
                                        src={AVATAR_GENERICO_SVG}
                                        alt="Avatar genérico"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User size={36} className="text-neutral-300" />
                                )}
                            </div>
                            <div className="space-y-2 text-center sm:text-left">
                                <h3 className="text-xs font-black uppercase text-neutral-900">
                                    Fotografía para Credencial
                                </h3>
                                <p className="text-xs text-neutral-500">
                                    Puedes subir tu foto ahora o usar el avatar genérico por 7
                                    días.
                                </p>
                                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800">
                                        <Camera size={15} />
                                        <span>
                                            {uploadingFoto ? 'Subiendo...' : 'Subir Fotografía'}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSubirFoto}
                                            className="hidden"
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={seleccionarAvatarGenerico}
                                        className={`rounded-xl border px-3.5 py-2 text-xs font-black uppercase ${form.usando_avatar_generico
                                                ? 'border-amber-600 bg-amber-100 text-amber-900'
                                                : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                                            }`}
                                    >
                                        Usar Avatar Genérico (7 días)
                                    </button>
                                </div>
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

                            {renderSelectorEspecialidades()}

                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Alergias o Condiciones Médicas
                                </label>
                                <input
                                    type="text"
                                    value={form.alergias}
                                    onChange={(e) =>
                                        setForm({ ...form, alergias: e.target.value })
                                    }
                                    placeholder="Indicar alergias o escribir 'Ninguna'"
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
                {renderBannerFotografia()}
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
                        agilizar tu autorización.
                    </p>
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
                profile?.codigo_credencial && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3.5 py-2 text-xs font-black tracking-wider text-[#F2B632]">
                        <BadgeCheck size={16} /> {profile.codigo_credencial}
                    </span>
                )
            }
        >
            {renderBannerFotografia()}

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
                    </div>
                </div>

                {/* Columna Derecha (2/3): Edición de Ficha + Certificados */}
                <div className="space-y-6 lg:col-span-2">
                    <form
                        onSubmit={handleGuardarFicha}
                        className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-16 w-16 overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-neutral-100">
                                    <img
                                        src={form.foto_url || AVATAR_GENERICO_SVG}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-black text-neutral-950">
                                        {form.nombre_completo}
                                    </h3>
                                    <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1 text-[11px] font-black uppercase text-neutral-800 hover:bg-neutral-200">
                                        <Camera size={13} />
                                        {uploadingFoto ? 'Subiendo...' : 'Subir / Cambiar Foto'}
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

                            {renderSelectorEspecialidades()}

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

                    {/* Certificados y Diplomas */}
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