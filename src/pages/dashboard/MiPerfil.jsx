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
    { nombre: 'Incendios Forestales y Control de Fuego', abrev: 'IF/FUEGO' },
    { nombre: 'Evaluación de Daños y Análisis de Necesidades (EDAN)', abrev: 'EDAN' },
    { nombre: 'Soporte Vital Básico (BLS / RCP / DEA)', abrev: 'BLS/RCP' },
    { nombre: 'Soporte Vital Avanzado en Trauma (PHTLS)', abrev: 'PHTLS' },
    { nombre: 'Operación de Vehículos Todoterreno (4x4 / UTV)', abrev: '4X4/UTV' },
    { nombre: 'Operación de Embarcaciones y Rescate Costero', abrev: 'MARÍTIMO' },
    { nombre: 'Rescate en Estructuras Colapsadas', abrev: 'COLAPSO' },
    { nombre: 'Rescate en Espacios Confinados', abrev: 'CONFINADO' },
    { nombre: 'Enlace Interinstitucional y SENAPRED', abrev: 'ENLACE' },
    { nombre: 'Prensa, Comunicaciones y Vocería en Crisis', abrev: 'COMUNIC' },
    { nombre: 'Auditoría, Cumplimiento y Transparencia', abrev: 'AUDITORÍA' },
    { nombre: 'Bienestar y Cuidado de Equipos Operativos', abrev: 'BIENESTAR' },
    { nombre: 'Tecnologías de la Información y Soporte (TI)', abrev: 'TI' },
    { nombre: 'Analista de Datos e Inteligencia Operativa', abrev: 'ANALISTA' },
    { nombre: 'Desarrollo de Software y Plataformas Web', abrev: 'DEV/TI' },
    { nombre: 'Redes, Infraestructura y Conectividad Satelital', abrev: 'REDES/SAT' },
    { nombre: 'Ciberseguridad y Protección de Datos', abrev: 'CIBERSEG' },
    { nombre: 'Electrónica, Energía Solar y Respaldo Eléctrico', abrev: 'ELECTRÓN' },
    { nombre: 'Análisis Meteorológico y Riesgos Naturales', abrev: 'METEO' },
    { nombre: 'Planificación Estratégica y Gestión de Riesgos', abrev: 'PLANIF' },
    { nombre: 'Asesoría Jurídica y Normativa Institucional', abrev: 'JURÍDICO' },
    { nombre: 'Prevención de Riesgos y Seguridad Operacional', abrev: 'PREV. RIESG' },
];

function obtenerAbreviaturaEspecialidad(nombreEsp = '') {
    const limpio = (nombreEsp || '').trim();
    if (!limpio) return '';

    const matchCatalogo = ESPECIALIDADES_CATALOGO.find(
        (item) =>
            item.nombre.toLowerCase() === limpio.toLowerCase() ||
            item.abrev.toLowerCase() === limpio.toLowerCase()
    );
    if (matchCatalogo) return matchCatalogo.abrev;

    const parentesis = limpio.match(/\(([^)]+)\)/);
    if (parentesis?.[1]) {
        return parentesis[1].trim().toUpperCase().slice(0, 10);
    }

    const palabras = limpio
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s/]/g, '')
        .split(/\s+/)
        .filter((p) => p.length > 2);

    if (palabras.length === 0) return limpio.toUpperCase().slice(0, 8);
    if (palabras.length === 1) return palabras[0].toUpperCase().slice(0, 8);

    return palabras
        .slice(0, 3)
        .map((p) => p[0].toUpperCase())
        .join('');
}

function formatearEspecialidadesParaCredencial(listaEspecialidades = []) {
    const lista = Array.isArray(listaEspecialidades)
        ? listaEspecialidades.filter(Boolean)
        : [];
    if (lista.length === 0) {
        return 'PENDIENTE DE VALIDACIÓN · BÚSQUEDA Y RESCATE';
    }
    if (lista.length > 6) {
        return lista
            .map((esp) => obtenerAbreviaturaEspecialidad(esp))
            .filter(Boolean)
            .join(' · ')
            .toUpperCase();
    }
    return lista.join(' · ').toUpperCase();
}

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

function dibujarTextoAjustadoEnArea(ctx, texto, x, y, w, h, tamanoInicial = 18) {
    let fontSize = tamanoInicial;
    let lineas = [];
    let altoLinea = fontSize + 4;

    while (fontSize >= 10) {
        ctx.font = `800 ${fontSize}px sans-serif`;
        lineas = envolverTextoSinLimite(ctx, texto, w - 12);
        altoLinea = fontSize + 4;
        if (lineas.length * altoLinea <= h - 6) break;
        fontSize -= 1;
    }

    const totalHeight = lineas.length * altoLinea;
    const startY =
        y + Math.max(altoLinea * 0.85, (h - totalHeight) / 2 + altoLinea * 0.75);

    lineas.forEach((linea, idx) => {
        ctx.fillText(linea, x + 6, startY + idx * altoLinea, w - 12);
    });
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
        mostrar_antecedentes_publicos: true,
        foto_url: '',
        usando_avatar_generico: false,
    });

    const [inputEsp, setInputEsp] = useState('');
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    const [certificados, setCertificados] = useState([]);
    const [nuevoCert, setNuevoCert] = useState({
        titulo_curso: '',
        institucion: 'SENAPRED',
        especialidad_vinculada: ESPECIALIDADES_CATALOGO[0].nombre,
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

    const especialidadesValidadas = Array.isArray(
        profile?.especialidades_validadas
    )
        ? profile.especialidades_validadas
        : [];

    useEffect(() => {
        if (profile) {
            const validadasPrev = Array.isArray(profile.especialidades_validadas)
                ? profile.especialidades_validadas
                : [];
            const pendientesPrev = Array.isArray(profile.especialidades_pendientes)
                ? profile.especialidades_pendientes
                : [];
            const legacyPrev = Array.isArray(profile.especialidades)
                ? profile.especialidades
                : profile.especialidad
                    ? [profile.especialidad]
                    : [];

            const combinadas = Array.from(
                new Set([...validadasPrev, ...pendientesPrev, ...legacyPrev])
            );

            setForm({
                nombre_completo: profile.nombre_completo || '',
                rut: profile.rut ? formatearRutChileno(profile.rut) : '',
                genero: profile.genero === 'femenino' ? 'femenino' : 'masculino',
                telefono: profile.telefono || '',
                region: profile.region || 'Región del Biobío',
                comuna: profile.comuna || 'Concepción',
                especialidades: combinadas,
                tipo_sangre: profile.tipo_sangre || 'No especificado',
                alergias: profile.alergias || '',
                contacto_emergencia_nombre: profile.contacto_emergencia_nombre || '',
                contacto_emergencia_telefono: profile.contacto_emergencia_telefono || '',
                disponible_operativo:
                    profile.disponible_operativo !== undefined
                        ? Boolean(profile.disponible_operativo)
                        : true,
                mostrar_antecedentes_publicos:
                    profile.mostrar_antecedentes_publicos !== undefined
                        ? Boolean(profile.mostrar_antecedentes_publicos)
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
            (s.nombre.toLowerCase().includes(inputEsp.toLowerCase()) ||
                s.abrev.toLowerCase().includes(inputEsp.toLowerCase())) &&
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
            const digitosRut = form.rut.replace(/[^0-9]/g, '');
            const codigoCredencialCalculado =
                profile?.codigo_credencial ||
                (digitosRut.length >= 6 ? `BRE-${digitosRut.slice(0, 6)}` : null);

            const validadasPrevias = Array.isArray(profile?.especialidades_validadas)
                ? profile.especialidades_validadas
                : [];
            const pendientesPrevias = Array.isArray(profile?.especialidades_pendientes)
                ? profile.especialidades_pendientes
                : [];

            // Mantener como validadas solo las especialidades que ya estaban validadas y siguen en la lista
            const validadasVigentes = validadasPrevias.filter((esp) =>
                form.especialidades.some(
                    (actual) => actual.toLowerCase() === esp.toLowerCase()
                )
            );

            // Identificar únicamente las especialidades nuevas o modificadas que no estaban validadas
            const nuevasOModificadas = form.especialidades.filter((esp) => {
                const yaValidada = validadasVigentes.some(
                    (v) => v.toLowerCase() === esp.toLowerCase()
                );
                return !yaValidada;
            });

            const huboCambioEspecialidades =
                nuevasOModificadas.length > 0 ||
                validadasVigentes.length !== validadasPrevias.length ||
                JSON.stringify(nuevasOModificadas) !== JSON.stringify(pendientesPrevias);

            const payload = {
                nombre_completo: form.nombre_completo.trim(),
                rut: formatearRutChileno(form.rut),
                codigo_credencial: codigoCredencialCalculado,
                genero: form.genero,
                telefono: form.telefono.trim(),
                region: form.region,
                comuna: form.comuna,
                especialidades: form.especialidades,
                especialidades_validadas: validadasVigentes,
                especialidades_pendientes: nuevasOModificadas,
                tipo_sangre: form.tipo_sangre,
                alergias: form.alergias.trim() || 'Ninguna',
                contacto_emergencia_nombre: form.contacto_emergencia_nombre.trim(),
                contacto_emergencia_telefono: form.contacto_emergencia_telefono.trim(),
                disponible_operativo: form.disponible_operativo,
                mostrar_antecedentes_publicos: form.mostrar_antecedentes_publicos,
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

            // Solo notifica al Directorio cuando se agregan, quitan o modifican especialidades
            if (huboCambioEspecialidades && nuevasOModificadas.length > 0) {
                await supabase.from('notificaciones_directorio').insert([
                    {
                        perfil_origen_id: user.id,
                        tipo: 'especialidad',
                        titulo: `Nuevas especialidades por validar: ${form.nombre_completo.trim()}`,
                        detalle: `Especialidades agregadas/modificadas: ${nuevasOModificadas.join(
                            ', '
                        )}`,
                        leida: false,
                    },
                ]);
            }

            setForm((prev) => ({
                ...prev,
                usando_avatar_generico: esGenerico,
            }));

            if (refreshProfile) await refreshProfile();
            setStatus({
                type: 'success',
                message:
                    nuevasOModificadas.length > 0
                        ? 'Datos actualizados. Solo las especialidades nuevas o modificadas fueron enviadas a validación del Directorio.'
                        : 'Datos de perfil actualizados correctamente.',
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
                    especialidad_vinculada: nuevoCert.especialidad_vinculada,
                    archivo_url: publicUrl,
                    estado_validacion: 'pendiente',
                },
            ]);

            if (dbErr) throw dbErr;

            await supabase.from('notificaciones_directorio').insert([
                {
                    perfil_origen_id: user.id,
                    tipo: 'certificado',
                    titulo: `Nuevo certificado por validar: ${nuevoCert.titulo_curso.trim()}`,
                    detalle: `${form.nombre_completo || user.email
                        } · Especialidad vinculada: ${nuevoCert.especialidad_vinculada}`,
                    leida: false,
                },
            ]);

            setNuevoCert({
                titulo_curso: '',
                institucion: 'SENAPRED',
                especialidad_vinculada: ESPECIALIDADES_CATALOGO[0].nombre,
            });
            setArchivoCert(null);
            cargarCertificados();
            setStatus({
                type: 'success',
                message:
                    'Certificado cargado y vinculado a especialidad. Se notificó al Directorio para validación.',
            });
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
    // RENDERIZADO CREDENCIAL DOBLE CARA HORIZONTAL SOBRE ÁREAS DEFINIDAS (%)
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

            const cFrente = canvasFrenteRef.current;
            const ctxF = cFrente.getContext('2d');

            const imgBaseFrente =
                (await cargarImagen('/credencial-frente.jpg')) ||
                (await cargarImagen('/credencial-frente.png'));

            const ratioFrente =
                imgBaseFrente && imgBaseFrente.naturalWidth
                    ? imgBaseFrente.naturalHeight / imgBaseFrente.naturalWidth
                    : 638 / 1012;
            const HF = Math.round(W * ratioFrente);

            cFrente.width = W;
            cFrente.height = HF;

            if (imgBaseFrente) {
                ctxF.drawImage(imgBaseFrente, 0, 0, W, HF);
            }

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
                const boxX = W * 0.0355;
                const boxY = HF * 0.0797;
                const boxW = W * 0.3375;
                const boxH = HF * 0.698;

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

            const tituloFranjaRoja = resolverTituloFranjaCredencial(
                profile,
                form.genero
            );
            ctxF.fillStyle = '#FFFFFF';
            ctxF.textAlign = 'left';
            ctxF.font = '900 42px sans-serif';
            ctxF.fillText(tituloFranjaRoja, 412, HF * 0.388, 430);

            ctxF.fillStyle = '#111827';
            ctxF.font = '900 28px sans-serif';
            ctxF.fillText(
                (
                    form.nombre_completo ||
                    profile?.nombre_completo ||
                    'NOMBRE COMPLETO'
                ).toUpperCase(),
                420,
                HF * 0.54,
                545
            );

            ctxF.font = '900 26px sans-serif';
            ctxF.fillText(
                formatearRutChileno(form.rut || profile?.rut) || '12.345.678-9',
                420,
                HF * 0.655
            );

            const funcionAreaTexto = resolverFuncionAreaCredencial(profile);
            ctxF.font = '900 22px sans-serif';
            ctxF.fillText(funcionAreaTexto, 420, HF * 0.787, 545);

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
            ctxF.fillText(codigoMostrar, 92, HF * 0.922);

            ctxF.font = '800 23px sans-serif';
            ctxF.fillText(fmtFecha(fechaEmision), 395, HF * 0.922);
            ctxF.fillText(fmtFecha(fechaVigencia), 585, HF * 0.922);

            const cReverso = canvasReversoRef.current;
            const ctxR = cReverso.getContext('2d');

            const imgBaseReverso =
                (await cargarImagen('/credencial-reverso.jpg')) ||
                (await cargarImagen('/credencial-reverso.png'));

            const ratioReverso =
                imgBaseReverso && imgBaseReverso.naturalWidth
                    ? imgBaseReverso.naturalHeight / imgBaseReverso.naturalWidth
                    : 638 / 1012;
            const HR = Math.round(W * ratioReverso);

            cReverso.width = W;
            cReverso.height = HR;

            if (imgBaseReverso) {
                ctxR.drawImage(imgBaseReverso, 0, 0, W, HR);
            }

            ctxR.fillStyle = '#FFFFFF';
            ctxR.textAlign = 'center';
            ctxR.font = '900 38px sans-serif';
            const gsTexto =
                form.tipo_sangre && form.tipo_sangre !== 'No especificado'
                    ? form.tipo_sangre
                    : 'N/E';
            ctxR.fillText(gsTexto, 875, HR * 0.207);

            const espParaCredencial = formatearEspecialidadesParaCredencial(
                especialidadesValidadas
            );

            ctxR.fillStyle = '#111827';
            ctxR.textAlign = 'left';
            dibujarTextoAjustadoEnArea(
                ctxR,
                espParaCredencial,
                W * 0.1497,
                HR * 0.4049,
                W * 0.4371,
                HR * 0.1166,
                17
            );

            const textoAlergias = (
                form.alergias || 'SIN ANTECEDENTES RELEVANTES'
            ).toUpperCase();

            dibujarTextoAjustadoEnArea(
                ctxR,
                textoAlergias,
                W * 0.1526,
                HR * 0.6243,
                W * 0.3482,
                HR * 0.1335,
                16
            );

            const urlVerificacion = `${window.location.origin}/voluntario/${encodeURIComponent(
                codigoMostrar
            )}`;
            const qrDataUrl = await QRCode.toDataURL(urlVerificacion, {
                width: 260,
                margin: 1,
                color: { dark: '#0A0A0A', light: '#FFFFFF' },
            });

            const imgQr = await cargarImagen(qrDataUrl);
            if (imgQr) {
                const qrBoxX = W * 0.699;
                const qrBoxY = HR * 0.296;
                const qrBoxW = W * 0.2621;
                const qrBoxH = HR * 0.4035;
                const qrSize = Math.min(qrBoxW, qrBoxH) * 0.86;
                const qrX = qrBoxX + (qrBoxW - qrSize) / 2;
                const qrY = qrBoxY + (qrBoxH - qrSize) / 2;
                ctxR.drawImage(imgQr, qrX, qrY, qrSize, qrSize);
            }

            setCredencialLista(true);
        };

        renderizarAmbasCaras();
    }, [aprobado, profile, rol, form, especialidadesValidadas]);

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
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-black uppercase text-neutral-700">
                    Mis Especialidades ({form.especialidades.length} seleccionadas ·{' '}
                    {form.especialidades.length > 6
                        ? 'En credencial se muestran abreviaturas por superar 6'
                        : 'Nombre completo hasta 6 especialidades'}
                    )
                </label>
                <span className="text-[11px] font-bold text-neutral-500">
                    Solo las especialidades nuevas o modificadas pasan a validación
                </span>
            </div>

            <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 focus-within:border-[#0A0A0A]">
                {form.especialidades.map((esp) => {
                    const estaValidada = especialidadesValidadas.some(
                        (v) => v.toLowerCase() === esp.toLowerCase()
                    );
                    const abrev = obtenerAbreviaturaEspecialidad(esp);
                    return (
                        <span
                            key={esp}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black ${estaValidada
                                    ? 'bg-emerald-900 text-emerald-200'
                                    : 'bg-[#0A0A0A] text-[#F2B632]'
                                }`}
                        >
                            <span>
                                {form.especialidades.length > 6 ? `${abrev} · ${esp}` : esp}{' '}
                                {estaValidada ? '(Validada)' : '(Nueva / Por validar)'}
                            </span>
                            <button
                                type="button"
                                onClick={() => eliminarEspecialidadChip(esp)}
                                className="rounded-full p-0.5 text-neutral-400 hover:bg-white/15 hover:text-white"
                            >
                                <X size={12} strokeWidth={3} />
                            </button>
                        </span>
                    );
                })}
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
                    placeholder="Selecciona del catálogo (TI, Analista, etc.) o escribe manual y Enter..."
                    className="min-w-[200px] flex-1 bg-transparent text-sm font-semibold outline-none"
                />
            </div>

            {mostrarSugerencias && sugerenciasFiltradas.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl">
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

                        <div className="flex flex-wrap gap-2">
                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] font-black uppercase">
                                <input
                                    type="checkbox"
                                    checked={form.mostrar_antecedentes_publicos}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            mostrar_antecedentes_publicos: e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 rounded text-[#D90429]"
                                />
                                <span>Antecedentes Visibles en QR</span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] font-black uppercase">
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
                                        : 'No Disponible'}
                                </span>
                            </label>
                        </div>
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
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
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
                        <div>
                            <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                                Especialidad Vinculada
                            </label>
                            <select
                                value={nuevoCert.especialidad_vinculada}
                                onChange={(e) =>
                                    setNuevoCert({
                                        ...nuevoCert,
                                        especialidad_vinculada: e.target.value,
                                    })
                                }
                                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                            >
                                {ESPECIALIDADES_CATALOGO.map((esp) => (
                                    <option key={esp.nombre} value={esp.nombre}>
                                        {esp.nombre} ({esp.abrev})
                                    </option>
                                ))}
                            </select>
                        </div>
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
                                            {c.especialidad_vinculada
                                                ? ` · ${c.especialidad_vinculada}`
                                                : ''}
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