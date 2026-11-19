import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
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
    HeartPulse,
    CreditCard,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { REGIONES_CHILE } from '../../data/chileRegionesComunas';

const ESPECIALIDADES_CATALOGO = [
    { nombre: 'Búsqueda y Rescate Agreste (GSAR)', abrev: 'GSAR' },
    { nombre: 'Rescate Urbano (USAR / INSARAG)', abrev: 'USAR' },
    { nombre: 'Rescate Vertical y Cuerdas', abrev: 'R. VERT' },
    { nombre: 'Rescate en Aguas Rápidas e Inundaciones (SRT)', abrev: 'SRT/ACU' },
    { nombre: 'Buceo de Búsqueda y Recuperación', abrev: 'BUCEO' },
    { nombre: 'Rescate en Montaña y Media Montaña', abrev: 'MONTAÑA' },
    { nombre: 'Rescate Vehicular y Extricación', abrev: 'R. VEH' },
    { nombre: 'Atención Prehospitalaria / Triage START', abrev: 'PREHOSP' },
    { nombre: 'Primeros Auxilios en Zonas Remotas (WFR)', abrev: 'WFR' },
    { nombre: 'Operador RPAS / Drone Táctico', abrev: 'RPAS/DRONE' },
    { nombre: 'Unidad Canina de Búsqueda (K9)', abrev: 'K9' },
    { nombre: 'Cartografía, SIG y Navegación GPS', abrev: 'SIG/GPS' },
    { nombre: 'Telecomunicaciones VHF / UHF / HF', abrev: 'TELECO' },
    { nombre: 'Sistema de Comando de Incidentes (SCI)', abrev: 'SCI' },
    { nombre: 'Materiales Peligrosos (HAZMAT)', abrev: 'HAZMAT' },
    { nombre: 'Gestión Logística y Abastecimiento', abrev: 'LOGÍST' },
    { nombre: 'Administración y Gestión de Proyectos', abrev: 'ADMIN' },
    { nombre: 'Tesorería, Contabilidad y Rendiciones', abrev: 'FINANZAS' },
    { nombre: 'Instrucción y Capacitación Operativa', abrev: 'INSTRUC' },
    { nombre: 'Apoyo Psicosocial en Emergencias', abrev: 'PSICOSOC' },
];

function formatearRutChileno(valor) {
    const limpio = (valor || '').replace(/[^0-9kK]/g, '').toUpperCase();
    if (limpio.length <= 1) return limpio;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpoFormateado}-${dv}`;
}

function validarRutChileno(rutFormateado) {
    const limpio = (rutFormateado || '').replace(/[^0-9kK]/g, '').toUpperCase();
    if (limpio.length < 8) return false;
    const cuerpo = limpio.slice(0, -1);
    const dvIngresado = limpio.slice(-1);
    if (!/^\d+$/.test(cuerpo)) return false;

    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i], 10) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
    return dvIngresado === dvEsperado;
}

function obtenerAvatarGenericoUrl(genero) {
    return genero === 'femenino'
        ? '/avatar-femenino.png'
        : '/avatar-masculino.png';
}

const RESPALDO_AVATAR_SVG = (genero) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280">
      <rect width="240" height="280" fill="#171717"/>
      <circle cx="120" cy="95" r="46" fill="${genero === 'femenino' ? '#9D174D' : '#374151'
        }"/>
      <path d="M40 255c0-48 36-78 80-78s80 30 80 78" fill="${genero === 'femenino' ? '#9D174D' : '#374151'
        }"/>
      <rect x="0" y="242" width="240" height="38" fill="#D90429"/>
      <text x="120" y="266" font-family="sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">${genero === 'femenino' ? 'AVATAR FEMENINO' : 'AVATAR MASCULINO'
        }</text>
    </svg>`
    )}`;

function resolverTituloFranjaCredencial(perfil, generoActual) {
    const r = (perfil?.rol || 'voluntario').toLowerCase();
    const cargos = Array.isArray(perfil?.cargos_operativos)
        ? perfil.cargos_operativos.map((c) => c.toLowerCase())
        : [];
    const esMujer = (perfil?.genero || generoActual) === 'femenino';

    if (cargos.includes('do')) return 'DIRECTOR OPERATIVO';
    if (r === 'director') return 'DIRECTORIO';
    if (r === 'superadmin') {
        return esMujer ? 'VOLUNTARIA' : 'VOLUNTARIO';
    }
    if (r === 'voluntario') {
        return esMujer ? 'VOLUNTARIA' : 'VOLUNTARIO';
    }
    return r.toUpperCase();
}

function resolverFuncionAreaCredencial(perfil) {
    const r = (perfil?.rol || 'voluntario').toLowerCase();
    const cargos = Array.isArray(perfil?.cargos_operativos)
        ? perfil.cargos_operativos.map((c) => c.toLowerCase())
        : [];

    const etiquetasCargo = {
        tesorero: 'TESORERO',
        secretario: 'SECRETARÍA',
        do: 'DIRECCIÓN OPERATIVA',
        dos: 'DIRECCIÓN OPERATIVA',
        jc: 'JEFE DE CUADRILLA',
        lem: 'PREHOSPITALARIO',
        prehospitalario: 'PREHOSPITALARIO',
        instructor: 'INSTRUCCIÓN',
        operativo: 'OPERATIVO',
    };

    const cargosMapeados = cargos
        .map((c) => etiquetasCargo[c])
        .filter(Boolean);

    if (cargosMapeados.length > 0) {
        return Array.from(new Set(cargosMapeados)).join(' · ');
    }

    if (r === 'superadmin') {
        return 'OPERATIVO - ADMINISTRATIVO';
    }

    if (r === 'director') {
        return 'DIRECTORIO';
    }

    return 'BÚSQUEDA Y RESCATE';
}

// Agrupa texto sin límite de líneas dentro del ancho máximo del recuadro
function envolverTextoSinLimite(ctx, texto, maxWidth) {
    const palabras = (texto || '').trim().split(/\s+/).filter(Boolean);
    if (palabras.length === 0) return [''];

    const lineas = [];
    let lineaActual = palabras[0];

    for (let i = 1; i < palabras.length; i++) {
        const prueba = `${lineaActual} ${palabras[i]}`;
        if (ctx.measureText(prueba).width <= maxWidth) {
            lineaActual = prueba;
        } else {
            lineas.push(lineaActual);
            lineaActual = palabras[i];
        }
    }

    lineas.push(lineaActual);
    return lineas;
}

export default function MiPerfil() {
    const { user, profile, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [uploadingFoto, setUploadingFoto] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const [form, setForm] = useState({
        nombre_completo: '',
        rut: '',
        genero: 'masculino',
        telefono: '',
        region: 'Región del Biobío',
        comuna: 'Concepción',
        especialidades: [],
        tipo_sangre: 'No especificado',
        alergias: '',
        contacto_emergencia_nombre: '',
        contacto_emergencia_telefono: '',
        disponible_operativo: true,
        foto_url: '',
        usando_avatar_generico: false,
    });

    const [inputEsp, setInputEsp] = useState('');
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    const [certificados, setCertificados] = useState([]);
    const [nuevoCert, setNuevoCert] = useState({
        titulo_curso: '',
        institucion: 'SENAPRED',
    });
    const [archivoCert, setArchivoCert] = useState(null);
    const [subiendoCert, setSubiendoCert] = useState(false);

    const canvasFrenteRef = useRef(null);
    const canvasReversoRef = useRef(null);
    const [ladoCredencial, setLadoCredencial] = useState('frente');
    const [credencialLista, setCredencialLista] = useState(false);

    const rol = (profile?.rol || 'postulante').toLowerCase();
    const esSA = rol === 'superadmin';
    const aprobado = esSA || profile?.estado_validacion === 'aprobado';
    const onboardingListo = esSA || Boolean(profile?.onboarding_completado);

    const rutValido = form.rut.trim() === '' ? true : validarRutChileno(form.rut);
    const faltaGrupoSanguineo =
        !form.tipo_sangre || form.tipo_sangre === 'No especificado';

    const comunasDisponibles =
        REGIONES_CHILE.find((r) => r.region === form.region)?.comunas || [];

    useEffect(() => {
        if (profile) {
            const listaEsp = Array.isArray(profile.especialidades)
                ? profile.especialidades
                : profile.especialidad
                    ? [profile.especialidad]
                    : [];

            setForm({
                nombre_completo: profile.nombre_completo || '',
                rut: profile.rut ? formatearRutChileno(profile.rut) : '',
                genero: profile.genero === 'femenino' ? 'femenino' : 'masculino',
                telefono: profile.telefono || '',
                region: profile.region || 'Región del Biobío',
                comuna: profile.comuna || 'Concepción',
                especialidades: listaEsp,
                tipo_sangre: profile.tipo_sangre || 'No especificado',
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
                        ? 'Primera prórroga de 15 días activada.'
                        : 'Última prórroga de 15 días activada.',
            });
        }
    };

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

    const sugerenciasFiltradas = ESPECIALIDADES_CATALOGO.filter(
        (s) =>
            s.nombre.toLowerCase().includes(inputEsp.toLowerCase()) &&
            !form.especialidades.some(
                (e) => e.toLowerCase() === s.nombre.toLowerCase()
            )
    );

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
            message: `Avatar genérico (${form.genero === 'femenino' ? 'Femenino' : 'Masculino'
                }) activado por 7 días.`,
        });
    };

    const handleGuardarFicha = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (!validarRutChileno(form.rut)) {
            setStatus({
                type: 'error',
                message:
                    'Este RUT no corresponde. Verifica los dígitos y el dígito verificador.',
            });
            return;
        }

        setSaving(true);
        try {
            const esGenerico = !form.foto_url;
            const textoEspecialidadLegacy = form.especialidades.join(', ');

            const payload = {
                nombre_completo: form.nombre_completo.trim(),
                rut: formatearRutChileno(form.rut),
                genero: form.genero,
                telefono: form.telefono.trim(),
                region: form.region,
                comuna: form.comuna,
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

            setForm((prev) => ({
                ...prev,
                usando_avatar_generico: esGenerico,
            }));

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
    // RENDERIZADO CREDENCIAL DOBLE CARA HORIZONTAL (1012 x 638)
    // ============================================================================
    useEffect(() => {
        if (!aprobado) return;
        if (!canvasFrenteRef.current || !canvasReversoRef.current) return;

        const cargarImagen = (src, fallbackSrc) =>
            new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => {
                    if (fallbackSrc) {
                        const fb = new Image();
                        fb.onload = () => resolve(fb);
                        fb.onerror = () => resolve(null);
                        fb.src = fallbackSrc;
                    } else {
                        resolve(null);
                    }
                };
                img.src = src;
            });

        const renderizarAmbasCaras = async () => {
            const W = 1012;
            const H = 638;

            // -------------------- 1. CARA FRONTAL --------------------
            const cFrente = canvasFrenteRef.current;
            const ctxF = cFrente.getContext('2d');
            cFrente.width = W;
            cFrente.height = H;

            const imgBaseFrente =
                (await cargarImagen('/credencial-frente.jpg')) ||
                (await cargarImagen('/credencial-frente.png'));

            if (imgBaseFrente) {
                ctxF.drawImage(imgBaseFrente, 0, 0, W, H);
            }

            // Fotografía ocupando por completo el marco gris izquierdo hasta su borde
            const avatarGenPng =
                form.genero === 'femenino'
                    ? '/avatar-femenino.png'
                    : '/avatar-masculino.png';
            const avatarGenJpg =
                form.genero === 'femenino'
                    ? '/avatar-femenino.jpg'
                    : '/avatar-masculino.jpg';

            const imgFoto = profile?.foto_url
                ? await cargarImagen(profile.foto_url, RESPALDO_AVATAR_SVG(form.genero))
                : (await cargarImagen(avatarGenPng)) ||
                (await cargarImagen(avatarGenJpg, RESPALDO_AVATAR_SVG(form.genero)));

            if (imgFoto) {
                const boxX = 31;
                const boxY = 71;
                const boxW = 308;
                const boxH = 424;

                ctxF.save();
                ctxF.beginPath();
                ctxF.roundRect(boxX, boxY, boxW, boxH, 16);
                ctxF.clip();

                const ratioImg = imgFoto.width / imgFoto.height;
                const ratioBox = boxW / boxH;
                let drawW = boxW;
                let drawH = boxH;
                let drawX = boxX;
                let drawY = boxY;

                if (ratioImg > ratioBox) {
                    drawH = boxH;
                    drawW = boxH * ratioImg;
                    drawX = boxX - (drawW - boxW) / 2;
                } else {
                    drawW = boxW;
                    drawH = boxW / ratioImg;
                    drawY = boxY - (drawH - boxH) / 2;
                }

                ctxF.drawImage(imgFoto, drawX, drawY, drawW, drawH);
                ctxF.restore();
            }

            // Franja Roja
            const tituloFranjaRoja = resolverTituloFranjaCredencial(
                profile,
                form.genero
            );
            ctxF.fillStyle = '#FFFFFF';
            ctxF.textAlign = 'left';
            ctxF.font = '900 42px sans-serif';
            ctxF.fillText(tituloFranjaRoja, 412, 248, 430);

            // Nombre Completo
            ctxF.fillStyle = '#111827';
            ctxF.font = '900 28px sans-serif';
            ctxF.fillText(
                (
                    form.nombre_completo ||
                    profile?.nombre_completo ||
                    'NOMBRE COMPLETO'
                ).toUpperCase(),
                420,
                345,
                545
            );

            // RUT Formateado
            ctxF.font = '900 26px sans-serif';
            ctxF.fillText(
                formatearRutChileno(form.rut || profile?.rut) || '12.345.678-9',
                420,
                418
            );

            // Función / Área
            const funcionAreaTexto = resolverFuncionAreaCredencial(profile);
            ctxF.font = '900 22px sans-serif';
            ctxF.fillText(funcionAreaTexto, 420, 502, 545);

            // Barra Inferior Negra
            const codigoMostrar =
                profile?.codigo_credencial ||
                (form.rut
                    ? `BRE-${form.rut.replace(/[^0-9]/g, '').slice(0, 6)}`
                    : 'BRE-000000');

            const fechaEmision = profile?.creado_en
                ? new Date(profile.creado_en)
                : new Date();
            const fechaVigencia = new Date(fechaEmision);
            fechaVigencia.setFullYear(fechaVigencia.getFullYear() + 2);

            const fmtFecha = (d) =>
                `${String(d.getDate()).padStart(2, '0')}-${String(
                    d.getMonth() + 1
                ).padStart(2, '0')}-${d.getFullYear()}`;

            ctxF.fillStyle = '#FFFFFF';
            ctxF.font = '900 28px sans-serif';
            ctxF.fillText(codigoMostrar, 92, 588);

            ctxF.font = '800 23px sans-serif';
            ctxF.fillText(fmtFecha(fechaEmision), 395, 588);
            ctxF.fillText(fmtFecha(fechaVigencia), 585, 588);

            // -------------------- 2. CARA TRASERA --------------------
            const cReverso = canvasReversoRef.current;
            const ctxR = cReverso.getContext('2d');
            cReverso.width = W;
            cReverso.height = H;

            const imgBaseReverso =
                (await cargarImagen('/credencial-reverso.jpg')) ||
                (await cargarImagen('/credencial-reverso.png'));

            if (imgBaseReverso) {
                ctxR.drawImage(imgBaseReverso, 0, 0, W, H);
            }

            // Grupo Sanguíneo
            ctxR.fillStyle = '#FFFFFF';
            ctxR.textAlign = 'center';
            ctxR.font = '900 38px sans-serif';
            const gsTexto =
                form.tipo_sangre && form.tipo_sangre !== 'No especificado'
                    ? form.tipo_sangre
                    : 'N/E';
            ctxR.fillText(gsTexto, 875, 132);

            // Caja Gris 1: Especialidad (hasta 2 líneas)
            const textoEspReverso =
                form.especialidades.length > 0
                    ? form.especialidades.join(' · ').toUpperCase()
                    : 'BÚSQUEDA Y RESCATE EN EMERGENCIAS';

            ctxR.fillStyle = '#111827';
            ctxR.textAlign = 'left';
            ctxR.font = '800 18px sans-serif';
            const lineasEsp = envolverTextoSinLimite(ctxR, textoEspReverso, 450).slice(
                0,
                2
            );
            lineasEsp.forEach((linea, idx) => {
                ctxR.fillText(linea, 152, 286 + idx * 24, 450);
            });

            // Caja Gris 2: Antecedentes Médicos - Alergias (sin límite de líneas, agrupado en recuadro gris)
            const textoAlergias = (
                form.alergias || 'SIN ANTECEDENTES RELEVANTES'
            ).toUpperCase();

            const fontSizeAlergias = textoAlergias.length > 110 ? 14 : 16;
            const altoLineaAlergias = fontSizeAlergias + 4;
            ctxR.font = `800 ${fontSizeAlergias}px sans-serif`;

            const lineasAlergias = envolverTextoSinLimite(
                ctxR,
                textoAlergias,
                445
            );
            const altoTotalBloque = lineasAlergias.length * altoLineaAlergias;
            // Centro vertical del recuadro gris inferior (~Y: 428) ajustado según cantidad de líneas
            const inicioYAlergias = Math.max(396, 428 - altoTotalBloque / 2 + 10);

            lineasAlergias.forEach((linea, idx) => {
                ctxR.fillText(
                    linea,
                    152,
                    inicioYAlergias + idx * altoLineaAlergias,
                    445
                );
            });

            // Código QR centrado dentro del recuadro blanco con borde rojo
            const urlVerificacion = `${window.location.origin}/voluntario/${encodeURIComponent(
                codigoMostrar
            )}`;
            const qrDataUrl = await QRCode.toDataURL(urlVerificacion, {
                width: 240,
                margin: 1,
                color: { dark: '#0A0A0A', light: '#FFFFFF' },
            });

            const imgQr = await cargarImagen(qrDataUrl);
            if (imgQr) {
                const qrSize = 236;
                const qrX = 710 + (256 - qrSize) / 2;
                const qrY = 196 + (256 - qrSize) / 2;
                ctxR.drawImage(imgQr, qrX, qrY, qrSize, qrSize);
            }

            setCredencialLista(true);
        };

        renderizarAmbasCaras();
    }, [aprobado, profile, rol, form]);

    const descargarPNG = (lado) => {
        const canvas =
            lado === 'frente' ? canvasFrenteRef.current : canvasReversoRef.current;
        if (!canvas) return;
        const codigo =
            profile?.codigo_credencial ||
            (form.rut
                ? `BRE-${form.rut.replace(/[^0-9]/g, '').slice(0, 6)}`
                : 'BRE');
        const enlace = document.createElement('a');
        enlace.download = `Credencial_${lado.toUpperCase()}_${codigo}.png`;
        enlace.href = canvas.toDataURL('image/png');
        enlace.click();
    };

    const renderSelectorEspecialidades = () => (
        <div className="relative sm:col-span-2">
            <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                Especialidades Operativas y Administrativas (Espacio, Coma o Enter)
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
                            ? 'Ej. USAR, Búsqueda Agreste, RPAS/Drone, Administración...'
                            : 'Agregar otra especialidad...'
                    }
                    className="min-w-[180px] flex-1 bg-transparent text-sm font-semibold outline-none"
                />
            </div>

            {mostrarSugerencias && sugerenciasFiltradas.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl">
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

    const renderBannersRecordatorio = () => (
        <div className="mb-6 space-y-3">
            {faltaGrupoSanguineo && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-l-4 border-[#D90429] bg-red-50 p-4 text-xs text-red-950 shadow-sm">
                    <p className="flex items-center gap-2 font-black uppercase">
                        <HeartPulse size={17} className="shrink-0 text-[#D90429]" />
                        Recordatorio Médico: Tu Grupo Sanguíneo figura como &ldquo;No
                        especificado&rdquo;. Selecciona tu grupo real en tu ficha para
                        respaldo en emergencias.
                    </p>
                </div>
            )}

            {estadoAvatar.requiereFoto && (
                <div
                    className={`rounded-2xl border-l-4 p-4 shadow-sm ${estadoAvatar.vencido
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
                                    ? 'Se agotaron los 7 días iniciales y las dos prórrogas de 15 días. Este mensaje permanecerá activo hasta que subas tu fotografía oficial.'
                                    : 'Puedes actualizar tus datos libremente, pero recuerda subir tu fotografía formal o con uniforme.'}
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
            )}
        </div>
    );

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
                                <img
                                    src={form.foto_url || obtenerAvatarGenericoUrl(form.genero)}
                                    onError={(e) => {
                                        e.currentTarget.src = RESPALDO_AVATAR_SVG(form.genero);
                                    }}
                                    alt="Avatar"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="space-y-2 text-center sm:text-left">
                                <h3 className="text-xs font-black uppercase text-neutral-900">
                                    Fotografía o Avatar Genérico Provisorio (7 días)
                                </h3>
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
                                    RUT Chileno
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.rut}
                                    onChange={(e) =>
                                        setForm({ ...form, rut: formatearRutChileno(e.target.value) })
                                    }
                                    placeholder="19.082.512-4"
                                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold ${!rutValido
                                            ? 'border-[#D90429] bg-red-50 text-red-900'
                                            : 'border-neutral-300'
                                        }`}
                                />
                                {!rutValido && (
                                    <p className="mt-1 text-[11px] font-black text-[#D90429]">
                                        Este RUT no corresponde. Reintenta verificando el número.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Sexo / Avatar Genérico
                                </label>
                                <select
                                    value={form.genero}
                                    onChange={(e) =>
                                        setForm({ ...form, genero: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-bold"
                                >
                                    <option value="masculino">Masculino</option>
                                    <option value="femenino">Femenino</option>
                                </select>
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
                                    Región
                                </label>
                                <select
                                    value={form.region}
                                    onChange={(e) => {
                                        const nuevaReg = e.target.value;
                                        const primeraComuna =
                                            REGIONES_CHILE.find((r) => r.region === nuevaReg)
                                                ?.comunas?.[0] || '';
                                        setForm({
                                            ...form,
                                            region: nuevaReg,
                                            comuna: primeraComuna,
                                        });
                                    }}
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-bold"
                                >
                                    {REGIONES_CHILE.map((r) => (
                                        <option key={r.region} value={r.region}>
                                            {r.region}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Comuna
                                </label>
                                <select
                                    value={form.comuna}
                                    onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-bold"
                                >
                                    {comunasDisponibles.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
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
                                    {[
                                        'No especificado',
                                        'O+',
                                        'O-',
                                        'A+',
                                        'A-',
                                        'B+',
                                        'B-',
                                        'AB+',
                                        'AB-',
                                    ].map((gs) => (
                                        <option key={gs} value={gs}>
                                            {gs}
                                        </option>
                                    ))}
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
                            disabled={saving || !rutValido}
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

    if (!aprobado) {
        return (
            <DashboardLayout
                title="Estado de Postulación"
                subtitle="Verificación de antecedentes por el Directorio O.N.G. BRE Bío-Bío"
            >
                {renderBannersRecordatorio()}
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

    return (
        <DashboardLayout
            title="Mi Ficha y Credencial"
            subtitle="Identificación oficial BRE Bío-Bío doble cara, QR fiscalizable y hoja de vida"
            actions={
                profile?.codigo_credencial && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3.5 py-2 text-xs font-black tracking-wider text-[#F2B632]">
                        <BadgeCheck size={16} /> {profile.codigo_credencial}
                    </span>
                )
            }
        >
            {renderBannersRecordatorio()}

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

            <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-900">
                        <CreditCard size={18} className="text-[#D90429]" /> Credencial
                        Institucional Digital (Doble Cara)
                    </h2>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setLadoCredencial('frente')}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-black uppercase ${ladoCredencial === 'frente'
                                    ? 'bg-[#0A0A0A] text-[#F2B632]'
                                    : 'border border-neutral-300 text-neutral-700'
                                }`}
                        >
                            Vista Frontal
                        </button>
                        <button
                            type="button"
                            onClick={() => setLadoCredencial('reverso')}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-black uppercase ${ladoCredencial === 'reverso'
                                    ? 'bg-[#0A0A0A] text-[#F2B632]'
                                    : 'border border-neutral-300 text-neutral-700'
                                }`}
                        >
                            Vista Trasera (QR y Salud)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-3">
                    <div className="overflow-hidden rounded-2xl border-2 border-[#0A0A0A] bg-neutral-900 shadow-lg lg:col-span-2">
                        <canvas
                            ref={canvasFrenteRef}
                            className={`h-auto w-full ${ladoCredencial === 'frente' ? 'block' : 'hidden'
                                }`}
                        />
                        <canvas
                            ref={canvasReversoRef}
                            className={`h-auto w-full ${ladoCredencial === 'reverso' ? 'block' : 'hidden'
                                }`}
                        />
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-medium leading-relaxed text-neutral-600">
                            Descarga ambas caras de tu credencial oficial en alta resolución
                            para impresión PVC o porte digital en terreno.
                        </p>
                        <button
                            type="button"
                            disabled={!credencialLista}
                            onClick={() => descargarPNG('frente')}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D90429] px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-red-700 disabled:opacity-50"
                        >
                            <Download size={15} /> Descargar PNG Frente
                        </button>
                        <button
                            type="button"
                            disabled={!credencialLista}
                            onClick={() => descargarPNG('reverso')}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-3 text-xs font-black uppercase tracking-wider text-[#F2B632] shadow hover:bg-neutral-800 disabled:opacity-50"
                        >
                            <Download size={15} /> Descargar PNG Reverso (QR)
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <form
                    onSubmit={handleGuardarFicha}
                    className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-16 w-16 overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-neutral-100">
                                <img
                                    src={form.foto_url || obtenerAvatarGenericoUrl(form.genero)}
                                    onError={(e) => {
                                        e.currentTarget.src = RESPALDO_AVATAR_SVG(form.genero);
                                    }}
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
                                RUT Chileno
                            </label>
                            <input
                                type="text"
                                required
                                value={form.rut}
                                onChange={(e) =>
                                    setForm({ ...form, rut: formatearRutChileno(e.target.value) })
                                }
                                className={`w-full rounded-xl border px-3.5 py-2 text-sm font-semibold ${!rutValido
                                        ? 'border-[#D90429] bg-red-50 text-red-900'
                                        : 'border-neutral-300'
                                    }`}
                            />
                            {!rutValido && (
                                <p className="mt-1 text-[11px] font-black text-[#D90429]">
                                    Este RUT no corresponde. Reintenta verificando el número.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                Sexo / Avatar Genérico
                            </label>
                            <select
                                value={form.genero}
                                onChange={(e) => setForm({ ...form, genero: e.target.value })}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-sm font-bold"
                            >
                                <option value="masculino">Masculino</option>
                                <option value="femenino">Femenino</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                value={form.telefono}
                                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                Región
                            </label>
                            <select
                                value={form.region}
                                onChange={(e) => {
                                    const nuevaReg = e.target.value;
                                    const primeraComuna =
                                        REGIONES_CHILE.find((r) => r.region === nuevaReg)
                                            ?.comunas?.[0] || '';
                                    setForm({
                                        ...form,
                                        region: nuevaReg,
                                        comuna: primeraComuna,
                                    });
                                }}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-sm font-bold"
                            >
                                {REGIONES_CHILE.map((r) => (
                                    <option key={r.region} value={r.region}>
                                        {r.region}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-black uppercase text-neutral-600">
                                Comuna
                            </label>
                            <select
                                value={form.comuna}
                                onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-sm font-bold"
                            >
                                {comunasDisponibles.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
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
                                className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm font-bold ${faltaGrupoSanguineo
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-neutral-300'
                                    }`}
                            >
                                {[
                                    'No especificado',
                                    'O+',
                                    'O-',
                                    'A+',
                                    'A-',
                                    'B+',
                                    'B-',
                                    'AB+',
                                    'AB-',
                                ].map((gs) => (
                                    <option key={gs} value={gs}>
                                        {gs}
                                    </option>
                                ))}
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
                                onChange={(e) => setForm({ ...form, alergias: e.target.value })}
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
                            disabled={saving || !rutValido}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0A0A0A] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#F2B632] hover:bg-neutral-800 disabled:opacity-50"
                        >
                            <Save size={15} />
                            {saving ? 'Guardando...' : 'Actualizar Mis Antecedentes'}
                        </button>
                    </div>
                </form>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-900">
                        <FileText size={17} className="text-[#D90429]" /> Mis Certificados
                    </h3>

                    <form
                        onSubmit={handleSubirCertificado}
                        className="mb-5 space-y-2.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5"
                    >
                        <input
                            type="text"
                            required
                            value={nuevoCert.titulo_curso}
                            onChange={(e) =>
                                setNuevoCert({ ...nuevoCert, titulo_curso: e.target.value })
                            }
                            placeholder="Curso (Ej. Sistema SINAPRED)"
                            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
                        />
                        <input
                            type="text"
                            value={nuevoCert.institucion}
                            onChange={(e) =>
                                setNuevoCert({ ...nuevoCert, institucion: e.target.value })
                            }
                            placeholder="Institución (SENAPRED)"
                            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
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
                                Aún no has cargado certificados.
                            </p>
                        ) : (
                            certificados.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center justify-between rounded-xl border border-neutral-200 px-3.5 py-2 text-xs"
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
                                        className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase ${c.estado_validacion === 'aprobado'
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
        </DashboardLayout>
    );
}