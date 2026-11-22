import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  CheckCircle,
  XCircle,
  FileText,
  Siren,
  UserCheck,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  Award,
  BadgeCheck,
  Camera,
  Download,
  User,
  PhoneCall,
  HeartPulse,
  MapPin,
  Bell,
  UserPlus,
  Trash2,
  Link2,
  Unlink,
  KeyRound,
  CreditCard,
  Edit3,
  Save,
  X,
  Printer,
  Clock,
  Upload,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { REGIONES_CHILE } from '../../data/chileRegionesComunas';

const CATALOGO_CARGOS = [
  {
    key: 'presidente',
    label: 'Presidente/a',
    labelMasculino: 'Presidente',
    labelFemenino: 'Presidenta',
    corto: 'PRES',
    unico: true,
    descripcion: 'Único (1 en ONG) · Presidencia institucional y representación legal',
  },
  {
    key: 'vicepresidente',
    label: 'Vicepresidente/a',
    labelMasculino: 'Vicepresidente',
    labelFemenino: 'Vicepresidenta',
    corto: 'VP',
    unico: true,
    descripcion: 'Único (1 en ONG) · Subrogancia presidencial e integrante del Directorio',
  },
  {
    key: 'director',
    label: 'Director/a',
    labelMasculino: 'Director',
    labelFemenino: 'Directora',
    corto: 'DIR',
    unico: true,
    descripcion: 'Único (1 en ONG) · Dirección ejecutiva y representación institucional',
  },
  {
    key: 'secretario',
    label: 'Secretario/a',
    labelMasculino: 'Secretario',
    labelFemenino: 'Secretaria',
    corto: 'SEC',
    unico: true,
    descripcion: 'Único (1 en ONG) · Configura visibilidad pública y actas',
  },
  {
    key: 'tesorero',
    label: 'Tesorero/a',
    labelMasculino: 'Tesorero',
    labelFemenino: 'Tesorera',
    corto: 'TES',
    unico: true,
    descripcion: 'Único (1 en ONG) · Gestiona Tesorería y respaldos',
  },
  {
    key: 'do',
    label: 'Director/a Operativo/a',
    labelMasculino: 'Director Operativo',
    labelFemenino: 'Directora Operativa',
    corto: 'DO',
    unico: true,
    descripcion: 'Único (1 en ONG) · Mando operativo en Directorio y terreno',
  },
  {
    key: 'dos',
    label: 'Director/a Op. Suplente',
    labelMasculino: 'Director Op. Suplente',
    labelFemenino: 'Directora Op. Suplente',
    corto: 'DOs',
    unico: false,
    descripcion: 'Designado por SA, DG o DO',
  },
  {
    key: 'jc',
    label: 'Jefe/a de Cuadrilla',
    labelMasculino: 'Jefe de Cuadrilla',
    labelFemenino: 'Jefa de Cuadrilla',
    corto: 'JC',
    unico: false,
    descripcion: 'Ve antecedentes de su cuadrilla en operativos',
  },
  {
    key: 'lem',
    label: 'Líder Equipo Médico',
    labelMasculino: 'Líder Equipo Médico',
    labelFemenino: 'Líder Equipo Médico',
    corto: 'LEM',
    unico: false,
    descripcion: 'Coordina área médica y asigna Prehospitalario',
  },
  {
    key: 'prehospitalario',
    label: 'Prehospitalario',
    labelMasculino: 'Prehospitalario',
    labelFemenino: 'Prehospitalaria',
    corto: 'PREHOSP',
    unico: false,
    descripcion: 'Designado por SA, DG, DO o LEM · Ingresa casos de Triage',
  },
  {
    key: 'instructor',
    label: 'Instructor/a',
    labelMasculino: 'Instructor',
    labelFemenino: 'Instructora',
    corto: 'INST',
    unico: false,
    descripcion: 'Coordina formación, academias y simulacros operativos',
  },
  {
    key: 'logistica',
    label: 'Logística',
    labelMasculino: 'Logística',
    labelFemenino: 'Logística',
    corto: 'LOG',
    unico: false,
    descripcion: 'Gestión de equipamiento, bodega, vehículos y suministros',
  },
  {
    key: 'apoyo_tesoreria',
    label: 'Apoyo a Tesorería',
    labelMasculino: 'Apoyo a Tesorería',
    labelFemenino: 'Apoyo a Tesorería',
    corto: 'AP. TES',
    unico: false,
    descripcion: 'Colaboración en rendiciones, cuotas y respaldos contables',
  },
];

const obtenerEtiquetaCargoGenero = (cargoObj, genero) => {
  if (!cargoObj) return '';
  return genero === 'femenino'
    ? cargoObj.labelFemenino || cargoObj.label
    : cargoObj.labelMasculino || cargoObj.label;
};

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

const CAMPOS_VISIBILIDAD = [
  { key: 'foto_url', label: 'Fotografía' },
  { key: 'rut', label: 'RUT' },
  { key: 'especialidad', label: 'Especialidad' },
  { key: 'tipo_sangre', label: 'Tipo Sangre' },
  { key: 'certificados', label: 'Certificados' },
  { key: 'vigencia', label: 'Vigencia' },
  { key: 'telefono', label: 'Teléfono' },
];

function evaluarVencimiento(fechaStr) {
  if (!fechaStr) return null;
  const fechaLimpia = String(fechaStr).slice(0, 10);
  const objetivo = new Date(`${fechaLimpia}T23:59:59`);
  if (Number.isNaN(objetivo.getTime())) return null;
  const diasRestantes = Math.ceil(
    (objetivo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diasRestantes < 0) {
    return {
      estado: 'vencido',
      diasRestantes,
      etiqueta: `Vencido (${fechaLimpia})`,
    };
  }
  if (diasRestantes <= 15) {
    return {
      estado: 'urgente',
      diasRestantes,
      etiqueta: `Urgente: vence en ${diasRestantes} día(s)`,
    };
  }
  if (diasRestantes <= 30) {
    return {
      estado: 'preventivo',
      diasRestantes,
      etiqueta: `Preventivo: vence en ${diasRestantes} día(s)`,
    };
  }
  return {
    estado: 'ok',
    diasRestantes,
    etiqueta: `Vigente hasta ${fechaLimpia}`,
  };
}

export default function GestionDirectorio() {
  const { profile: currentProfile } = useAuth();
  const [tab, setTab] = useState('miembros');
  const [certificados, setCertificados] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState('');
  const [panelAbiertoId, setPanelAbiertoId] = useState(null);
  const [subiendoFotoId, setSubiendoFotoId] = useState(null);
  const [showNuevoPerfil, setShowNuevoPerfil] = useState(false);
  const [creandoPerfil, setCreandoPerfil] = useState(false);
  const [nuevoPerfil, setNuevoPerfil] = useState({
    nombre_completo: '',
    email: '',
    rut: '',
    rol: 'postulante',
  });
  const [claveInputs, setClaveInputs] = useState({});
  const [infoExito, setInfoExito] = useState('');
  const [descargandoCredKey, setDescargandoCredKey] = useState('');
  const [editandoFichaId, setEditandoFichaId] = useState(null);
  const [guardandoFicha, setGuardandoFicha] = useState(false);
  const [fichaForm, setFichaForm] = useState({
    nombre_completo: '',
    rut: '',
    genero: 'masculino',
    telefono: '',
    region: 'Región del Biobío',
    comuna: '',
    tipo_sangre: 'No especificado',
    alergias: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    especialidades: [],
    fecha_vigencia_credencial: '',
  });
  const [inputEspFicha, setInputEspFicha] = useState('');
  const [mostrarSugerenciasEsp, setMostrarSugerenciasEsp] = useState(false);
  const [participacionesOp, setParticipacionesOp] = useState([]);
  const [nuevoCertForm, setNuevoCertForm] = useState({
    perfil_id: '',
    titulo_curso: '',
    institucion: 'O.N.G. BRE Bío-Bío',
    especialidad_vinculada: '',
    sin_vencimiento: true,
    fecha_vencimiento: '',
  });
  const [archivoNuevoCert, setArchivoNuevoCert] = useState(null);
  const [creandoCert, setCreandoCert] = useState(false);

  const rolActual = (currentProfile?.rol || '').toLowerCase();
  const cargosActuales = Array.isArray(currentProfile?.cargos_operativos)
    ? currentProfile.cargos_operativos.map((c) => c.toLowerCase())
    : [];

  const esSA = rolActual === 'superadmin';
  const esDG = rolActual === 'director';
  const esDO = cargosActuales.includes('do');
  const esDOs = cargosActuales.includes('dos');
  const esInstructor = cargosActuales.includes('instructor');
  const esLEM = cargosActuales.includes('lem');
  const esSecretario = cargosActuales.includes('secretario');

  const puedeEditarVisibilidad = esSA || esDG || esSecretario;
  const puedeAgregarCertificado = esSA || esInstructor || esDO || esDOs;

  const puedeAsignarCargo = (claveCargo) => {
    if (esSA || esDG) return true;
    if (esDO && ['dos', 'jc', 'prehospitalario', 'instructor'].includes(claveCargo))
      return true;
    if (esLEM && claveCargo === 'prehospitalario') return true;
    return false;
  };

  const cargarDatos = async () => {
    setLoading(true);
    setAlerta('');
    const [certsRes, solRes, perfRes, notifRes, partRes] = await Promise.all([
      supabase
        .from('certificados')
        .select('*, perfiles(id, nombre_completo, rut, rol, cargos_operativos)')
        .order('creado_en', { ascending: false }),
      supabase
        .from('solicitudes_apoyo')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('perfiles')
        .select('*')
        .order('nombre_completo', { ascending: true }),
      supabase
        .from('notificaciones_directorio')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(25),
      supabase
        .from('operativo_participantes')
        .select('*, operativos(id, titulo, tipo_operativo, estado, creado_en)'),
    ]);

    if (!certsRes.error && certsRes.data) setCertificados(certsRes.data);
    if (!solRes.error && solRes.data) setSolicitudes(solRes.data);
    if (!perfRes.error && perfRes.data) {
      setPerfiles(perfRes.data);
    } else if (perfRes.error) {
      setAlerta(`Error cargando perfiles: ${perfRes.error.message}`);
    }
    if (!notifRes.error && notifRes.data) {
      setNotificaciones(notifRes.data);
    }
    if (!partRes.error && partRes.data) {
      setParticipacionesOp(partRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const listaMiembros = perfiles.filter(
    (p) => (p.rol || 'postulante').toLowerCase() !== 'postulante'
  );
  const listaPostulantes = perfiles.filter(
    (p) => (p.rol || 'postulante').toLowerCase() === 'postulante'
  );
  const postulantesPendientes = listaPostulantes.filter(
    (p) => (p.estado_validacion || 'pendiente') === 'pendiente'
  );
  const certificadosPendientes = certificados.filter(
    (c) => (c.estado_validacion || 'pendiente') === 'pendiente'
  );
  const solicitudesPendientes = solicitudes.filter(
    (s) => (s.estado || 'Pendiente').toLowerCase() === 'pendiente'
  );
  const perfilesConEspPendientes = perfiles.filter(
    (p) =>
      Array.isArray(p.especialidades_pendientes) &&
      p.especialidades_pendientes.length > 0
  );
  const vencimientosProximos = [
    ...perfiles
      .map((p) => {
        const ev = evaluarVencimiento(p.fecha_vigencia_credencial);
        return ev && ev.estado !== 'ok'
          ? {
              tipo: 'credencial',
              tab: (p.rol || 'postulante').toLowerCase() === 'postulante' ? 'postulantes' : 'miembros',
              elementId: `persona-${p.id}`,
              perfilId: p.id,
              titulo: `Credencial de ${p.nombre_completo}`,
              ev,
            }
          : null;
      })
      .filter(Boolean),
    ...certificados
      .map((c) => {
        if (c.sin_vencimiento || !c.fecha_vencimiento) return null;
        const ev = evaluarVencimiento(c.fecha_vencimiento);
        return ev && ev.estado !== 'ok'
          ? {
              tipo: 'certificado',
              tab: 'certificados',
              elementId: `cert-${c.id}`,
              perfilId: c.perfil_id,
              titulo: `Curso "${c.titulo_curso}" (${c.perfiles?.nombre_completo || 'Voluntario'})`,
              ev,
            }
          : null;
      })
      .filter(Boolean),
  ];

  const alertasSinLeer = notificaciones.filter((n) => !n.leida);

  const irATabYElemento = (targetTab, elementId, perfilIdAExpandir = null) => {
    setTab(targetTab);
    if (perfilIdAExpandir) {
      setPanelAbiertoId(perfilIdAExpandir);
    }
    setTimeout(() => {
      const el = elementId ? document.getElementById(elementId) : null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  };

  const navegarDesdeNotificacion = (n) => {
    const texto = `${n.tipo || ''} ${n.titulo || ''} ${n.detalle || ''}`.toLowerCase();
    if (texto.includes('certificado') || texto.includes('curso')) {
      irATabYElemento(
        'certificados',
        n.referencia_id ? `cert-${n.referencia_id}` : 'panel-certificados'
      );
      return;
    }
    if (texto.includes('solicitud') || texto.includes('apoyo')) {
      irATabYElemento('solicitudes', 'panel-solicitudes');
      return;
    }
    const perfilRelacionado = perfiles.find((p) => p.id === n.perfil_id);
    if (
      texto.includes('postul') ||
      (perfilRelacionado && (perfilRelacionado.rol || '').toLowerCase() === 'postulante')
    ) {
      irATabYElemento(
        'postulantes',
        n.perfil_id ? `persona-${n.perfil_id}` : null,
        n.perfil_id || null
      );
      return;
    }
    irATabYElemento(
      'miembros',
      n.perfil_id ? `persona-${n.perfil_id}` : null,
      n.perfil_id || null
    );
  };

  const handleCrearCertificadoDirectorio = async (e) => {
    e.preventDefault();
    if (!nuevoCertForm.perfil_id || !nuevoCertForm.titulo_curso.trim()) return;
    setCreandoCert(true);
    setAlerta('');
    setInfoExito('');

    try {
      let archivoUrl = null;
      if (archivoNuevoCert) {
        const ext = archivoNuevoCert.name.split('.').pop() || 'pdf';
        const path = `${nuevoCertForm.perfil_id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('certificados')
          .upload(path, archivoNuevoCert, { upsert: true });
        if (upErr) throw upErr;
        const {
          data: { publicUrl },
        } = supabase.storage.from('certificados').getPublicUrl(path);
        archivoUrl = publicUrl;
      }

      const payloadBase = {
        perfil_id: nuevoCertForm.perfil_id,
        titulo_curso: nuevoCertForm.titulo_curso.trim(),
        institucion: nuevoCertForm.institucion.trim() || 'O.N.G. BRE Bío-Bío',
        especialidad_vinculada: nuevoCertForm.especialidad_vinculada || null,
        archivo_url: archivoUrl,
        estado_validacion: 'aprobado',
      };

      const payloadConVencimiento = {
        ...payloadBase,
        sin_vencimiento: Boolean(nuevoCertForm.sin_vencimiento),
        fecha_vencimiento: nuevoCertForm.sin_vencimiento
          ? null
          : nuevoCertForm.fecha_vencimiento || null,
      };

      let { error } = await supabase
        .from('certificados')
        .insert([payloadConVencimiento]);

      if (error && /sin_vencimiento|fecha_vencimiento/i.test(error.message || '')) {
        const resFallback = await supabase.from('certificados').insert([payloadBase]);
        error = resFallback.error;
      }

      if (error) throw error;

      if (nuevoCertForm.especialidad_vinculada) {
        const dueno = perfiles.find((p) => p.id === nuevoCertForm.perfil_id);
        if (dueno) {
          const validadas = Array.isArray(dueno.especialidades_validadas)
            ? dueno.especialidades_validadas
            : [];
          if (!validadas.includes(nuevoCertForm.especialidad_vinculada)) {
            await supabase
              .from('perfiles')
              .update({
                especialidades_validadas: [
                  ...validadas,
                  nuevoCertForm.especialidad_vinculada,
                ],
              })
              .eq('id', dueno.id);
          }
        }
      }

      setNuevoCertForm({
        perfil_id: '',
        titulo_curso: '',
        institucion: 'O.N.G. BRE Bío-Bío',
        especialidad_vinculada: '',
        sin_vencimiento: true,
        fecha_vencimiento: '',
      });
      setArchivoNuevoCert(null);
      setInfoExito('Curso / certificado agregado y validado correctamente.');
      await cargarDatos();
    } catch (err) {
      setAlerta(err.message || 'No se pudo registrar el certificado.');
    } finally {
      setCreandoCert(false);
    }
  };

  const exportarNominaCSV = () => {
    const escapar = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const encabezados = [
      'Codigo Credencial',
      'Nombre Completo',
      'RUT',
      'Rol',
      'Cargos Operativos',
      'Especialidades Validadas',
      'Cursos / Certificados',
      'Vigencia Credencial',
      'Telefono',
      'Email',
    ];
    const filas = listaMiembros.map((m) => {
      const certsMiembro = certificados
        .filter((c) => c.perfil_id === m.id)
        .map((c) => {
          const v =
            c.sin_vencimiento || !c.fecha_vencimiento
              ? 'No tiene vencimiento'
              : `Vence: ${String(c.fecha_vencimiento).slice(0, 10)}`;
          return `${c.titulo_curso} (${c.estado_validacion}, ${v})`;
        })
        .join(' | ');
      const cargosTxt = Array.isArray(m.cargos_operativos)
        ? m.cargos_operativos.join(', ')
        : '';
      const espTxt = Array.isArray(m.especialidades_validadas)
        ? m.especialidades_validadas.join(', ')
        : '';
      return [
        m.codigo_credencial || '',
        m.nombre_completo || '',
        m.rut || '',
        m.rol || '',
        cargosTxt,
        espTxt,
        certsMiembro,
        m.fecha_vigencia_credencial
          ? String(m.fecha_vigencia_credencial).slice(0, 10)
          : 'Anual estándar',
        m.telefono || '',
        m.email || '',
      ]
        .map(escapar)
        .join(',');
    });
    const csv = `\uFEFF${[encabezados.map(escapar).join(','), ...filas].join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nomina_Certificados_BRE_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const abrirVistaImprimible = () => {
    const ventana = window.open('', '_blank');
    if (!ventana) {
      window.print();
      return;
    }
    const filas = listaMiembros
      .map((m) => {
        const esp = Array.isArray(m.especialidades_validadas)
          ? m.especialidades_validadas.join(', ')
          : '—';
        const certs = certificados
          .filter((c) => c.perfil_id === m.id)
          .map(
            (c) =>
              `${c.titulo_curso} (${
                c.sin_vencimiento || !c.fecha_vencimiento
                  ? 'No tiene vencimiento'
                  : `Vence ${String(c.fecha_vencimiento).slice(0, 10)}`
              })`
          )
          .join('<br/>');
        return `<tr>
          <td style="padding:6px;border:1px solid #ccc;"><strong>${m.codigo_credencial || '—'}</strong></td>
          <td style="padding:6px;border:1px solid #ccc;">${m.nombre_completo || '—'}<br/><small>${m.rut || ''}</small></td>
          <td style="padding:6px;border:1px solid #ccc;text-transform:uppercase;">${m.rol || ''}</td>
          <td style="padding:6px;border:1px solid #ccc;">${esp || '—'}</td>
          <td style="padding:6px;border:1px solid #ccc;">${certs || 'Sin cursos'}</td>
        </tr>`;
      })
      .join('');

    ventana.document.write(`
      <html>
        <head><title>Nómina Activa y Certificados · O.N.G. BRE Bío-Bío</title></head>
        <body style="font-family:Arial,sans-serif;padding:24px;color:#111;">
          <h2 style="margin:0;color:#D90429;">O.N.G. BRE BÍO-BÍO · NÓMINA ACTIVA Y CERTIFICADOS</h2>
          <p style="font-size:12px;color:#555;">Emitido el ${new Date().toLocaleString('es-CL')} · Total miembros activos: ${listaMiembros.length}</p>
          <table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:12px;">
            <thead>
              <tr style="background:#0A0A0A;color:#F2B632;text-align:left;">
                <th style="padding:8px;border:1px solid #0A0A0A;">Credencial</th>
                <th style="padding:8px;border:1px solid #0A0A0A;">Voluntario / RUT</th>
                <th style="padding:8px;border:1px solid #0A0A0A;">Rol</th>
                <th style="padding:8px;border:1px solid #0A0A0A;">Especialidades</th>
                <th style="padding:8px;border:1px solid #0A0A0A;">Certificados / Cursos</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
          <script>window.onload = function(){ window.print(); };</script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  const marcarNotificacionLeida = async (id) => {
    const { error } = await supabase
      .from('notificaciones_directorio')
      .update({ leida: true })
      .eq('id', id);

    if (!error) {
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    }
  };

  const actualizarVigenciaCredencial = async (perfilId, nuevaFecha) => {
    const valor = nuevaFecha || null;
    const { error } = await supabase
      .from('perfiles')
      .update({ fecha_vigencia_credencial: valor })
      .eq('id', perfilId);

    if (error) {
      setAlerta(error.message);
      return;
    }

    setPerfiles((prev) =>
      prev.map((p) =>
        p.id === perfilId ? { ...p, fecha_vigencia_credencial: valor } : p
      )
    );
  };

  const abrirEdicionFicha = (miembro) => {
    const listaEsp =
      Array.isArray(miembro.especialidades_validadas) &&
      miembro.especialidades_validadas.length > 0
        ? miembro.especialidades_validadas
        : Array.isArray(miembro.especialidades)
          ? miembro.especialidades
          : [];

    setPanelAbiertoId(miembro.id);
    setEditandoFichaId(miembro.id);
    setFichaForm({
      nombre_completo: miembro.nombre_completo || '',
      rut: miembro.rut ? formatearRutCredencial(miembro.rut) : '',
      genero: miembro.genero === 'femenino' ? 'femenino' : 'masculino',
      telefono: miembro.telefono || '',
      region: miembro.region || 'Región del Biobío',
      comuna: miembro.comuna || 'Concepción',
      tipo_sangre: miembro.tipo_sangre || 'No especificado',
      alergias: miembro.alergias || '',
      contacto_emergencia_nombre: miembro.contacto_emergencia_nombre || '',
      contacto_emergencia_telefono: miembro.contacto_emergencia_telefono || '',
      especialidades: listaEsp,
      fecha_vigencia_credencial: miembro.fecha_vigencia_credencial
        ? String(miembro.fecha_vigencia_credencial).slice(0, 10)
        : '',
    });
    setInputEspFicha('');
    setMostrarSugerenciasEsp(false);
  };

  const agregarEspecialidadFicha = (valorRaw) => {
    const limpio = valorRaw.replace(/,/g, '').trim();
    if (!limpio) return;
    setFichaForm((prev) => {
      const lista = Array.isArray(prev.especialidades) ? prev.especialidades : [];
      const existe = lista.some(
        (e) => e.toLowerCase() === limpio.toLowerCase()
      );
      if (existe) return prev;
      return { ...prev, especialidades: [...lista, limpio] };
    });
    setInputEspFicha('');
    setMostrarSugerenciasEsp(false);
  };

  const eliminarEspecialidadFicha = (item) => {
    setFichaForm((prev) => ({
      ...prev,
      especialidades: (prev.especialidades || []).filter((e) => e !== item),
    }));
  };

  const handleKeyDownEspecialidadFicha = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      if (inputEspFicha.trim().length > 0) {
        e.preventDefault();
        agregarEspecialidadFicha(inputEspFicha);
      }
    } else if (
      e.key === 'Backspace' &&
      inputEspFicha === '' &&
      Array.isArray(fichaForm.especialidades) &&
      fichaForm.especialidades.length > 0
    ) {
      eliminarEspecialidadFicha(
        fichaForm.especialidades[fichaForm.especialidades.length - 1]
      );
    }
  };

  const sugerenciasEspFiltradas = ESPECIALIDADES_CATALOGO.filter(
    (s) =>
      !(fichaForm.especialidades || []).some(
        (sel) => sel.toLowerCase() === s.nombre.toLowerCase()
      ) &&
      (s.nombre.toLowerCase().includes(inputEspFicha.toLowerCase()) ||
        s.abrev.toLowerCase().includes(inputEspFicha.toLowerCase()))
  );

  const rutFichaValido =
    !fichaForm.rut.trim() || validarRutChileno(fichaForm.rut);

  const comunasFichaDisponibles =
    REGIONES_CHILE.find((r) => r.region === fichaForm.region)?.comunas || [];

  const guardarEdicionFicha = async (e, miembroId) => {
    e.preventDefault();
    if (fichaForm.rut.trim() && !validarRutChileno(fichaForm.rut)) {
      setAlerta('El RUT ingresado no corresponde. Reintenta verificando el número.');
      return;
    }
    setGuardandoFicha(true);
    setAlerta('');
    setInfoExito('');

    const especialidadesLista = Array.isArray(fichaForm.especialidades)
      ? fichaForm.especialidades.map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      nombre_completo: fichaForm.nombre_completo.trim(),
      rut: fichaForm.rut.trim() || null,
      genero: fichaForm.genero === 'femenino' ? 'femenino' : 'masculino',
      telefono: fichaForm.telefono.trim() || null,
      region: fichaForm.region.trim() || 'Región del Biobío',
      comuna: fichaForm.comuna.trim() || null,
      tipo_sangre: fichaForm.tipo_sangre.trim() || 'No especificado',
      alergias: fichaForm.alergias.trim() || null,
      contacto_emergencia_nombre:
        fichaForm.contacto_emergencia_nombre.trim() || null,
      contacto_emergencia_telefono:
        fichaForm.contacto_emergencia_telefono.trim() || null,
      especialidades: especialidadesLista,
      especialidades_validadas: especialidadesLista,
      fecha_vigencia_credencial: fichaForm.fecha_vigencia_credencial || null,
    };

    const { error } = await supabase
      .from('perfiles')
      .update(payload)
      .eq('id', miembroId);

    setGuardandoFicha(false);
    if (error) {
      setAlerta(error.message);
      return;
    }

    setEditandoFichaId(null);
    setInfoExito('Antecedentes de la ficha actualizados correctamente.');
    await cargarDatos();
  };

  const handleCrearPerfil = async (e) => {
    e.preventDefault();
    if (!nuevoPerfil.nombre_completo.trim()) return;
    setCreandoPerfil(true);
    setAlerta('');
    setInfoExito('');

    const nuevoRegistro = {
      id: crypto.randomUUID(),
      nombre_completo: nuevoPerfil.nombre_completo.trim(),
      email: nuevoPerfil.email.trim() || null,
      rut: nuevoPerfil.rut.trim() || null,
      rol: nuevoPerfil.rol || 'postulante',
      estado_validacion: 'pendiente',
      cuenta_vinculada: false,
    };

    const { data, error } = await supabase
      .from('perfiles')
      .insert([nuevoRegistro])
      .select()
      .single();

    setCreandoPerfil(false);
    if (error) {
      setAlerta(error.message);
      return;
    }

    setPerfiles((prev) => [data || nuevoRegistro, ...prev]);
    setNuevoPerfil({ nombre_completo: '', email: '', rut: '', rol: 'postulante' });
    setShowNuevoPerfil(false);
    setInfoExito(`Perfil creado para ${nuevoRegistro.nombre_completo}.`);
  };

  const eliminarPerfil = async (perfil) => {
    if ((perfil?.rol || '').toLowerCase() === 'superadmin') {
      setAlerta('No está permitido eliminar un perfil con rol Superadmin.');
      return;
    }
    if (
      !window.confirm(
        `¿Eliminar el perfil de ${perfil.nombre_completo || 'este usuario'}?`
      )
    ) {
      return;
    }

    setAlerta('');
    setInfoExito('');
    const { error } = await supabase
      .from('perfiles')
      .delete()
      .eq('id', perfil.id);

    if (error) {
      setAlerta(error.message);
      return;
    }

    setPerfiles((prev) => prev.filter((p) => p.id !== perfil.id));
    setInfoExito(`Perfil de ${perfil.nombre_completo || 'usuario'} eliminado.`);
  };

  const toggleVinculacionCuenta = async (perfil) => {
    setAlerta('');
    setInfoExito('');
    const nuevoEstado = !Boolean(perfil.cuenta_vinculada);

    const { error } = await supabase
      .from('perfiles')
      .update({ cuenta_vinculada: nuevoEstado })
      .eq('id', perfil.id);

    if (error) {
      setAlerta(error.message);
      return;
    }

    setPerfiles((prev) =>
      prev.map((p) =>
        p.id === perfil.id ? { ...p, cuenta_vinculada: nuevoEstado } : p
      )
    );
    setInfoExito(
      nuevoEstado
        ? `Cuenta marcada como vinculada para ${perfil.nombre_completo || 'el perfil'}.`
        : `Cuenta desvinculada para ${perfil.nombre_completo || 'el perfil'}. Todos sus antecedentes se conservan intactos.`
    );
  };

  const asignarClaveProvisoria = async (perfil, generarAutomatica = false) => {
    if (!esSA) return;
    setAlerta('');
    setInfoExito('');

    const claveManual = (claveInputs[perfil.id] || '').trim();
    const claveFinal =
      generarAutomatica || !claveManual
        ? `BRE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
        : claveManual;

    const { error } = await supabase
      .from('perfiles')
      .update({
        clave_provisoria: claveFinal,
        requiere_cambio_clave: true,
      })
      .eq('id', perfil.id);

    if (error) {
      setAlerta(error.message);
      return;
    }

    setPerfiles((prev) =>
      prev.map((p) =>
        p.id === perfil.id
          ? {
              ...p,
              clave_provisoria: claveFinal,
              requiere_cambio_clave: true,
            }
          : p
      )
    );
    setClaveInputs((prev) => ({ ...prev, [perfil.id]: claveFinal }));
    setInfoExito(
      `Clave provisoria asignada a ${perfil.nombre_completo || perfil.email}: ${claveFinal} (requiere cambio al ingresar).`
    );
  };

  const formatearRutCredencial = (valor = '') => {
    const limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
    if (limpio.length <= 1) return limpio;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
  };

  const resolverTituloFranjaCredencial = (perfil) => {
    const r = (perfil?.rol || 'voluntario').toLowerCase();
    const cargos = Array.isArray(perfil?.cargos_operativos)
      ? perfil.cargos_operativos.map((c) => c.toLowerCase())
      : [];
    const esMujer = perfil?.genero === 'femenino';
    const cargosDirectorio = ['vicepresidente', 'director', 'secretario', 'tesorero', 'do'];

    if (r === 'presidente' || cargos.includes('presidente')) {
      return esMujer ? 'PRESIDENTA' : 'PRESIDENTE';
    }
    if (
      r === 'director' ||
      cargos.some((c) => cargosDirectorio.includes(c))
    ) {
      return 'DIRECTORIO';
    }
    if (r === 'superadmin' || r === 'voluntario') {
      return esMujer ? 'VOLUNTARIA' : 'VOLUNTARIO';
    }
    return r.toUpperCase();
  };

  const resolverFuncionAreaCredencial = (perfil) => {
    const r = (perfil?.rol || 'voluntario').toLowerCase();
    const cargos = Array.isArray(perfil?.cargos_operativos)
      ? perfil.cargos_operativos.map((c) => c.toLowerCase())
      : [];
    const esMujer = perfil?.genero === 'femenino';

    const etiquetasCargo = {
      presidente: esMujer ? 'PRESIDENTA' : 'PRESIDENTE',
      vicepresidente: esMujer ? 'VICEPRESIDENTA' : 'VICEPRESIDENTE',
      director: esMujer ? 'DIRECTORA' : 'DIRECTOR',
      tesorero: esMujer ? 'TESORERA' : 'TESORERO',
      secretario: esMujer ? 'SECRETARIA' : 'SECRETARIO',
      do: esMujer ? 'DIRECTORA OPERATIVA' : 'DIRECTOR OPERATIVO',
      dos: esMujer ? 'DIRECTORA OP. SUPLENTE' : 'DIRECTOR OP. SUPLENTE',
      jc: esMujer ? 'JEFA DE CUADRILLA' : 'JEFE DE CUADRILLA',
      lem: 'PREHOSPITALARIO',
      prehospitalario: esMujer ? 'PREHOSPITALARIA' : 'PREHOSPITALARIO',
      instructor: esMujer ? 'INSTRUCTORA' : 'INSTRUCTOR',
      logistica: 'LOGÍSTICA',
      apoyo_tesoreria: 'APOYO A TESORERÍA',
      operativo: esMujer ? 'OPERATIVA' : 'OPERATIVO',
    };

    const cargosMapeados = cargos
      .map((c) => etiquetasCargo[c])
      .filter(Boolean);

    if (cargosMapeados.length > 0) {
      return Array.from(new Set(cargosMapeados)).join(' · ');
    }
    if (r === 'superadmin') return 'OPERATIVO - ADMINISTRATIVO';
    if (r === 'director') return 'DIRECTORIO';
    return 'BÚSQUEDA Y RESCATE';
  };

  const formatearEspecialidadesParaCredencial = (lista = []) => {
    const limpias = Array.isArray(lista) ? lista.filter(Boolean) : [];
    if (limpias.length === 0) {
      return 'PERSONAL OPERATIVO';
    }
    if (limpias.length > 6) {
      return limpias
        .map((esp) => {
          const parentesis = esp.match(/\(([^)]+)\)/);
          if (parentesis?.[1]) {
            return parentesis[1].trim().toUpperCase().slice(0, 10);
          }
          const palabras = esp
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s/]/g, '')
            .split(/\s+/)
            .filter((p) => p.length > 2);
          if (palabras.length === 0) return esp.toUpperCase().slice(0, 8);
          if (palabras.length === 1) return palabras[0].toUpperCase().slice(0, 8);
          return palabras
            .slice(0, 3)
            .map((p) => p[0].toUpperCase())
            .join('');
        })
        .filter(Boolean)
        .join(' · ')
        .toUpperCase();
    }
    return limpias.join(' · ').toUpperCase();
  };

  const dibujarTextoAjustadoEnArea = (ctx, texto, x, y, w, h, tamanoInicial = 18) => {
    let fontSize = tamanoInicial;
    let lineas = [];
    let altoLinea = fontSize + 4;

    while (fontSize >= 10) {
      ctx.font = `800 ${fontSize}px sans-serif`;
      const palabras = (texto || '').trim().split(/\s+/).filter(Boolean);
      lineas = [];
      if (palabras.length === 0) {
        lineas = [''];
      } else {
        let actual = palabras[0];
        for (let i = 1; i < palabras.length; i++) {
          const prueba = `${actual} ${palabras[i]}`;
          if (ctx.measureText(prueba).width <= w - 12) {
            actual = prueba;
          } else {
            lineas.push(actual);
            actual = palabras[i];
          }
        }
        lineas.push(actual);
      }
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
  };

  const cargarImagenCanvas = (src, fallbackSrc) =>
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

  const descargarCredencialMiembro = async (miembro, lado) => {
    const key = `${miembro.id}-${lado}`;
    setDescargandoCredKey(key);
    setAlerta('');

    try {
      const W = 1012;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const rutForm = formatearRutCredencial(miembro.rut || '');
      const codigoMostrar =
        miembro.codigo_credencial ||
        (rutForm ? `BRE-${rutForm.replace(/[^0-9]/g, '').slice(0, 6)}` : 'BRE-000000');

      if (lado === 'frente') {
        const imgBaseFrente =
          (await cargarImagenCanvas('/credencial-frente.jpg')) ||
          (await cargarImagenCanvas('/credencial-frente.png'));
        const ratio =
          imgBaseFrente && imgBaseFrente.naturalWidth
            ? imgBaseFrente.naturalHeight / imgBaseFrente.naturalWidth
            : 638 / 1012;
        const HF = Math.round(W * ratio);
        canvas.width = W;
        canvas.height = HF;

        if (imgBaseFrente) ctx.drawImage(imgBaseFrente, 0, 0, W, HF);

        const genero = miembro.genero === 'femenino' ? 'femenino' : 'masculino';
        const avatarPng =
          genero === 'femenino' ? '/avatar-femenino.png' : '/avatar-masculino.png';
        const avatarJpg =
          genero === 'femenino' ? '/avatar-femenino.jpg' : '/avatar-masculino.jpg';
        const imgFoto = miembro.foto_url
          ? await cargarImagenCanvas(miembro.foto_url, avatarPng)
          : (await cargarImagenCanvas(avatarPng)) ||
            (await cargarImagenCanvas(avatarJpg));

        if (imgFoto) {
          const boxX = W * 0.0355;
          const boxY = HF * 0.0797;
          const boxW = W * 0.3375;
          const boxH = HF * 0.698;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, boxH, 16);
          ctx.clip();

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
          ctx.drawImage(imgFoto, drawX, drawY, drawW, drawH);
          ctx.restore();
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.font = '900 42px sans-serif';
        ctx.fillText(resolverTituloFranjaCredencial(miembro), 412, HF * 0.388, 430);

        ctx.fillStyle = '#111827';
        ctx.font = '900 28px sans-serif';
        ctx.fillText(
          (miembro.nombre_completo || 'NOMBRE COMPLETO').toUpperCase(),
          420,
          HF * 0.54,
          545
        );

        ctx.font = '900 26px sans-serif';
        ctx.fillText(rutForm || '12.345.678-9', 420, HF * 0.655);

        ctx.font = '900 22px sans-serif';
        ctx.fillText(resolverFuncionAreaCredencial(miembro), 420, HF * 0.787, 545);

        const fechaEmision = miembro.creado_en
          ? new Date(miembro.creado_en)
          : new Date();
        let fechaVigencia;
        if (miembro.fecha_vigencia_credencial) {
          fechaVigencia = new Date(
            `${String(miembro.fecha_vigencia_credencial).slice(0, 10)}T12:00:00`
          );
        } else {
          fechaVigencia = new Date(fechaEmision);
          fechaVigencia.setFullYear(fechaVigencia.getFullYear() + 2);
        }
        const fmtFecha = (d) =>
          `${String(d.getDate()).padStart(2, '0')}-${String(
            d.getMonth() + 1
          ).padStart(2, '0')}-${d.getFullYear()}`;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 28px sans-serif';
        ctx.fillText(codigoMostrar, 92, HF * 0.922);
        ctx.font = '800 23px sans-serif';
        ctx.fillText(fmtFecha(fechaEmision), 395, HF * 0.922);
        ctx.fillText(fmtFecha(fechaVigencia), 585, HF * 0.922);
      } else {
        const imgBaseReverso =
          (await cargarImagenCanvas('/credencial-reverso.jpg')) ||
          (await cargarImagenCanvas('/credencial-reverso.png'));
        const ratio =
          imgBaseReverso && imgBaseReverso.naturalWidth
            ? imgBaseReverso.naturalHeight / imgBaseReverso.naturalWidth
            : 638 / 1012;
        const HR = Math.round(W * ratio);
        canvas.width = W;
        canvas.height = HR;

        if (imgBaseReverso) ctx.drawImage(imgBaseReverso, 0, 0, W, HR);

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.font = '900 38px sans-serif';
        const gs =
          miembro.tipo_sangre && miembro.tipo_sangre !== 'No especificado'
            ? miembro.tipo_sangre
            : 'N/E';
        ctx.fillText(gs, 875, HR * 0.207);

        const espLista = Array.isArray(miembro.especialidades_validadas)
          ? miembro.especialidades_validadas
          : Array.isArray(miembro.especialidades)
            ? miembro.especialidades
            : [];
        ctx.fillStyle = '#111827';
        ctx.textAlign = 'left';
        dibujarTextoAjustadoEnArea(
          ctx,
          formatearEspecialidadesParaCredencial(espLista),
          W * 0.1497,
          HR * 0.4049,
          W * 0.4371,
          HR * 0.1166,
          17
        );

        dibujarTextoAjustadoEnArea(
          ctx,
          (miembro.alergias || 'SIN ANTECEDENTES RELEVANTES').toUpperCase(),
          W * 0.1526,
          HR * 0.6243,
          W * 0.3482,
          HR * 0.1335,
          16
        );

        const urlVerif = `${window.location.origin}/voluntario/${encodeURIComponent(
          codigoMostrar
        )}`;
        const qrDataUrl = await QRCode.toDataURL(urlVerif, {
          width: 260,
          margin: 1,
          color: { dark: '#0A0A0A', light: '#FFFFFF' },
        });
        const imgQr = await cargarImagenCanvas(qrDataUrl);
        if (imgQr) {
          const qrBoxX = W * 0.699;
          const qrBoxY = HR * 0.296;
          const qrBoxW = W * 0.2621;
          const qrBoxH = HR * 0.4035;
          const qrSize = Math.min(qrBoxW, qrBoxH) * 0.86;
          ctx.drawImage(
            imgQr,
            qrBoxX + (qrBoxW - qrSize) / 2,
            qrBoxY + (qrBoxH - qrSize) / 2,
            qrSize,
            qrSize
          );
        }
      }

      const enlace = document.createElement('a');
      enlace.download = `Credencial_${lado.toUpperCase()}_${codigoMostrar}.png`;
      enlace.href = canvas.toDataURL('image/png');
      enlace.click();
    } catch (err) {
      setAlerta(err.message || 'No se pudo generar la credencial.');
    } finally {
      setDescargandoCredKey('');
    }
  };

  const validarCertificado = async (cert, estado) => {
    const certId = typeof cert === 'object' ? cert.id : cert;
    const certObj =
      typeof cert === 'object'
        ? cert
        : certificados.find((c) => c.id === certId);

    const { error } = await supabase
      .from('certificados')
      .update({ estado_validacion: estado })
      .eq('id', certId);

    if (error) {
      setAlerta(error.message);
      return;
    }

    if (estado === 'aprobado' && certObj?.especialidad_vinculada) {
      const dueno = perfiles.find((p) => p.id === certObj.perfil_id);
      if (dueno) {
        const validadasActuales = Array.isArray(dueno.especialidades_validadas)
          ? dueno.especialidades_validadas
          : [];
        const pendientesActuales = Array.isArray(dueno.especialidades_pendientes)
          ? dueno.especialidades_pendientes
          : [];

        const nuevasValidadas = validadasActuales.includes(
          certObj.especialidad_vinculada
        )
          ? validadasActuales
          : [...validadasActuales, certObj.especialidad_vinculada];

        await supabase
          .from('perfiles')
          .update({
            especialidades_validadas: nuevasValidadas,
            especialidades_pendientes: pendientesActuales.filter(
              (e) => e !== certObj.especialidad_vinculada
            ),
          })
          .eq('id', dueno.id);
      }
    }

    cargarDatos();
  };

  const aprobarEspecialidadPendiente = async (miembro, especialidad) => {
    const rolObjetivo = (miembro.rol || 'postulante').toLowerCase();
    if (!esSA && (rolObjetivo === 'superadmin' || rolObjetivo === 'director')) {
      setAlerta(
        'Jerarquía insuficiente: solo el Superadministrador puede modificar Directores o Superadministradores.'
      );
      return;
    }

    const validadasActuales = Array.isArray(miembro.especialidades_validadas)
      ? miembro.especialidades_validadas
      : [];
    const pendientesActuales = Array.isArray(miembro.especialidades_pendientes)
      ? miembro.especialidades_pendientes
      : [];

    const { error } = await supabase
      .from('perfiles')
      .update({
        especialidades_validadas: validadasActuales.includes(especialidad)
          ? validadasActuales
          : [...validadasActuales, especialidad],
        especialidades_pendientes: pendientesActuales.filter(
          (e) => e !== especialidad
        ),
      })
      .eq('id', miembro.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const rechazarEspecialidadPendiente = async (miembro, especialidad) => {
    const rolObjetivo = (miembro.rol || 'postulante').toLowerCase();
    if (!esSA && (rolObjetivo === 'superadmin' || rolObjetivo === 'director')) {
      setAlerta(
        'Jerarquía insuficiente: solo el Superadministrador puede modificar Directores o Superadministradores.'
      );
      return;
    }

    const pendientesActuales = Array.isArray(miembro.especialidades_pendientes)
      ? miembro.especialidades_pendientes
      : [];

    const { error } = await supabase
      .from('perfiles')
      .update({
        especialidades_pendientes: pendientesActuales.filter(
          (e) => e !== especialidad
        ),
      })
      .eq('id', miembro.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const toggleMostrarAntecedentes = async (miembro) => {
    if (!puedeEditarVisibilidad) {
      setAlerta(
        'Solo el Secretario, Director General o Superadministrador pueden cambiar la visibilidad de antecedentes.'
      );
      return;
    }

    const actual = miembro.mostrar_antecedentes_publicos !== false;
    const { error } = await supabase
      .from('perfiles')
      .update({ mostrar_antecedentes_publicos: !actual })
      .eq('id', miembro.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const cambiarRolMiembro = async (miembroObjetivo, nuevoRol) => {
    setAlerta('');
    const rolObjetivo = (miembroObjetivo.rol || 'postulante').toLowerCase();

    if (!esSA) {
      if (
        rolObjetivo === 'superadmin' ||
        rolObjetivo === 'director' ||
        nuevoRol === 'superadmin' ||
        nuevoRol === 'director'
      ) {
        setAlerta(
          'Jerarquía insuficiente: solo el Superadministrador (SA) puede asignar o modificar Directores (DG) o Superadministradores.'
        );
        return;
      }
    }

    const payload = { rol: nuevoRol };
    if (nuevoRol === 'postulante') {
      payload.cargos_operativos = [];
    }

    const { error } = await supabase
      .from('perfiles')
      .update(payload)
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const toggleCargoOperativo = async (miembroObjetivo, claveCargo) => {
    setAlerta('');
    const rolObjetivo = (miembroObjetivo.rol || 'postulante').toLowerCase();

    if (rolObjetivo === 'postulante') {
      setAlerta(
        'Un Postulante no puede recibir cargos operativos. Apruébalo o asciéndelo primero a Voluntario.'
      );
      return;
    }

    if (!puedeAsignarCargo(claveCargo)) {
      setAlerta(
        'No tienes autorización jerárquica para asignar o remover este cargo operativo.'
      );
      return;
    }

    const actuales = Array.isArray(miembroObjetivo.cargos_operativos)
      ? [...miembroObjetivo.cargos_operativos]
      : [];
    const yaTiene = actuales.includes(claveCargo);
    const cargoMeta = CATALOGO_CARGOS.find((c) => c.key === claveCargo);
    const nuevos = yaTiene
      ? actuales.filter((c) => c !== claveCargo)
      : [...actuales, claveCargo];

    if (!yaTiene && cargoMeta?.unico) {
      const otrosConCargo = perfiles.filter(
        (p) =>
          p.id !== miembroObjetivo.id &&
          Array.isArray(p.cargos_operativos) &&
          p.cargos_operativos.includes(claveCargo)
      );

      for (const otro of otrosConCargo) {
        const filtrados = otro.cargos_operativos.filter(
          (c) => c !== claveCargo
        );
        await supabase
          .from('perfiles')
          .update({ cargos_operativos: filtrados })
          .eq('id', otro.id);
      }
    }

    const { error } = await supabase
      .from('perfiles')
      .update({ cargos_operativos: nuevos })
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const toggleCampoVisibilidad = async (miembroObjetivo, claveCampo) => {
    if (!puedeEditarVisibilidad) {
      setAlerta(
        'Solo el Secretario, Director General o Superadministrador pueden configurar la visibilidad pública.'
      );
      return;
    }

    const visActual = miembroObjetivo.visibilidad_publica || {
      foto_url: true,
      rut: true,
      especialidad: true,
      tipo_sangre: true,
      certificados: true,
      vigencia: true,
      telefono: false,
    };

    const visNueva = {
      ...visActual,
      [claveCampo]: !visActual[claveCampo],
    };

    const { error } = await supabase
      .from('perfiles')
      .update({ visibilidad_publica: visNueva })
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const validarMiembro = async (
    miembroObjetivo,
    estadoValidacion,
    nuevoRolOpcional
  ) => {
    setAlerta('');
    const rolObjetivo = (miembroObjetivo.rol || 'postulante').toLowerCase();

    if (!esSA && (rolObjetivo === 'superadmin' || rolObjetivo === 'director')) {
      setAlerta(
        'Jerarquía insuficiente: solo el Superadministrador puede modificar el estado de Directores o Superadministradores.'
      );
      return;
    }

    const payload = { estado_validacion: estadoValidacion };
    if (nuevoRolOpcional) {
      payload.rol = nuevoRolOpcional;
    }

    const { error } = await supabase
      .from('perfiles')
      .update(payload)
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const handleAdminSubirFotoMiembro = async (miembroId, file) => {
    if (!esSA || !file) return;
    setAlerta('');
    setSubiendoFotoId(miembroId);

    try {
      const ext = file.name.split('.').pop();
      const filePath = `${miembroId}/uniformada_${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatares')
        .upload(filePath, file, { upsert: true });

      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatares').getPublicUrl(filePath);

      const { error: dbErr } = await supabase
        .from('perfiles')
        .update({
          foto_url: publicUrl,
          usando_avatar_generico: false,
        })
        .eq('id', miembroId);

      if (dbErr) throw dbErr;

      cargarDatos();
    } catch (err) {
      setAlerta(
        err.message || 'No se pudo actualizar la fotografía del miembro.'
      );
    } finally {
      setSubiendoFotoId(null);
    }
  };

  const actualizarSolicitud = async (id, estado) => {
    const { error } = await supabase
      .from('solicitudes_apoyo')
      .update({ estado })
      .eq('id', id);

    if (!error) cargarDatos();
  };

  const renderTarjetaPersona = (m, esPostulanteTab = false) => {
    const rolObjetivo = (m.rol || 'postulante').toLowerCase();
    const cargosMiembro = Array.isArray(m.cargos_operativos)
      ? m.cargos_operativos
      : [];
    const espValidadas = Array.isArray(m.especialidades_validadas)
      ? m.especialidades_validadas
      : [];
    const espPendientes = Array.isArray(m.especialidades_pendientes)
      ? m.especialidades_pendientes
      : [];
    const antecedentesPublicosActivos =
      m.mostrar_antecedentes_publicos !== false;

    const visPublica = m.visibilidad_publica || {
      foto_url: true,
      rut: true,
      especialidad: true,
      tipo_sangre: true,
      certificados: true,
      vigencia: true,
      telefono: false,
    };

    const protegidoParaNoSA =
      !esSA && (rolObjetivo === 'superadmin' || rolObjetivo === 'director');

    const expandido = panelAbiertoId === m.id;
    const vencimientoCred = evaluarVencimiento(m.fecha_vigencia_credencial);
    const partMiembro = participacionesOp.filter(
      (p) => p.perfil_id === m.id && p.estado === 'autorizado'
    );
    const totalHorasOp = partMiembro.reduce(
      (acc, p) => acc + (Number(p.horas_operativas) || 0),
      0
    );

    return (
      <div
        key={m.id}
        id={`persona-${m.id}`}
        className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3.5">
            <div className="h-14 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100">
              {m.foto_url ? (
                <img
                  src={m.foto_url}
                  alt={m.nombre_completo}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="m-auto mt-3 text-neutral-400" size={24} />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-neutral-950">
                  {m.nombre_completo || m.email || 'Sin nombre'}
                </h3>

                {m.codigo_credencial && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#0A0A0A] px-2.5 py-0.5 text-[11px] font-black tracking-wider text-[#F2B632]">
                    <BadgeCheck size={13} strokeWidth={2.5} />
                    {m.codigo_credencial}
                  </span>
                )}

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

                {espPendientes.length > 0 && (
                  <span className="rounded-lg bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
                    {espPendientes.length} Especialidad(es) por Validar
                  </span>
                )}

                {m.es_menor_autorizado && (
                  <span className="rounded-lg bg-[#F2B632] px-2.5 py-0.5 text-[11px] font-black uppercase text-black">
                    Menor Autorizado (16-17)
                  </span>
                )}

                {vencimientoCred && vencimientoCred.estado !== 'ok' && (
                  <span
                    className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      vencimientoCred.estado === 'preventivo'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-red-100 text-[#D90429]'
                    }`}
                  >
                    Credencial · {vencimientoCred.etiqueta}
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-neutral-600">
                RUT: {m.rut || 'No registrado'} · Tel:{' '}
                {m.telefono || 'Sin teléfono'}
                {m.email ? ` · Email: ${m.email}` : ''}
              </p>

              {!esPostulanteTab && cargosMiembro.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cargosMiembro.map((cargoKey) => {
                    const info = CATALOGO_CARGOS.find(
                      (c) => c.key === cargoKey
                    );
                    return (
                      <span
                        key={cargoKey}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-black uppercase text-[#D90429]"
                      >
                        <Award size={12} strokeWidth={2.5} />
                        {info
                          ? obtenerEtiquetaCargoGenero(info, m.genero)
                          : cargoKey}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {protegidoParaNoSA ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-xs font-black uppercase text-neutral-600">
                <Lock size={14} strokeWidth={2.5} /> {rolObjetivo} (Protegido)
              </span>
            ) : esPostulanteTab ? (
              <>
                <button
                  type="button"
                  disabled={m.estado_validacion === 'aprobado'}
                  onClick={() => validarMiembro(m, 'aprobado', 'postulante')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black uppercase ${
                    m.estado_validacion === 'aprobado'
                      ? 'cursor-not-allowed border border-emerald-200 bg-emerald-50 text-emerald-700 opacity-75'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle size={15} strokeWidth={2.5} />{' '}
                  {m.estado_validacion === 'aprobado' ? 'Autorizado' : 'Autorizar'}
                </button>

                <button
                  onClick={() => validarMiembro(m, 'aprobado', 'voluntario')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3.5 py-2 text-xs font-black uppercase text-white hover:bg-blue-800"
                >
                  <UserCheck size={15} strokeWidth={2.5} /> Promover
                </button>

                {m.estado_validacion === 'pendiente' && (
                  <button
                    onClick={() => validarMiembro(m, 'rechazado')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-3 py-2 text-xs font-black uppercase text-white hover:bg-red-700"
                  >
                    <XCircle size={15} strokeWidth={2.5} /> Rechazar
                  </button>
                )}
              </>
            ) : (
              <>
                <select
                  aria-label="Rol del sistema"
                  value={rolObjetivo}
                  onChange={(e) => cambiarRolMiembro(m, e.target.value)}
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase text-neutral-800"
                >
                  <option value="postulante">Postulante</option>
                  <option value="voluntario">Voluntario</option>
                  {esSA && (
                    <>
                      <option value="director">Director (DG)</option>
                      <option value="superadmin">Superadmin (SA)</option>
                    </>
                  )}
                </select>

                <button
                  type="button"
                  disabled={m.estado_validacion === 'aprobado'}
                  onClick={() => validarMiembro(m, 'aprobado')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black uppercase ${
                    m.estado_validacion === 'aprobado'
                      ? 'cursor-not-allowed border border-emerald-200 bg-emerald-50 text-emerald-700 opacity-75'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle size={15} strokeWidth={2.5} />{' '}
                  {m.estado_validacion === 'aprobado' ? 'Aprobado' : 'Aprobar'}
                </button>

                <button
                  type="button"
                  disabled={descargandoCredKey === `${m.id}-frente`}
                  onClick={() => descargarCredencialMiembro(m, 'frente')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800 disabled:opacity-50"
                >
                  <CreditCard size={14} />{' '}
                  {descargandoCredKey === `${m.id}-frente` ? '...' : 'Frente'}
                </button>

                <button
                  type="button"
                  disabled={descargandoCredKey === `${m.id}-reverso`}
                  onClick={() => descargarCredencialMiembro(m, 'reverso')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800 disabled:opacity-50"
                >
                  <CreditCard size={14} />{' '}
                  {descargandoCredKey === `${m.id}-reverso` ? '...' : 'Reverso'}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={!puedeEditarVisibilidad}
              onClick={() => toggleMostrarAntecedentes(m)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black uppercase text-white disabled:opacity-50 ${
                antecedentesPublicosActivos
                  ? 'bg-teal-700 hover:bg-teal-800'
                  : 'bg-neutral-700 hover:bg-neutral-800'
              }`}
            >
              {antecedentesPublicosActivos ? (
                <>
                  <Eye size={14} /> Antecedentes Visibles
                </>
              ) : (
                <>
                  <EyeOff size={14} /> Antecedentes Ocultos
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => toggleVinculacionCuenta(m)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black uppercase text-white ${
                m.cuenta_vinculada
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {m.cuenta_vinculada ? (
                <>
                  <Unlink size={14} /> Desvincular
                </>
              ) : (
                <>
                  <Link2 size={14} /> Vincular
                </>
              )}
            </button>

            {rolObjetivo !== 'superadmin' && (
              <button
                type="button"
                onClick={() => eliminarPerfil(m)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase text-[#D90429] hover:bg-red-100"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            )}

            <button
              type="button"
              onClick={() => abrirEdicionFicha(m)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3 py-2 text-xs font-black uppercase text-white hover:bg-neutral-800"
            >
              <Edit3 size={14} /> Editar Ficha
            </button>

            <button
              type="button"
              onClick={() => {
                if (expandido) setEditandoFichaId(null);
                setPanelAbiertoId(expandido ? null : m.id);
              }}
              className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-black uppercase text-neutral-800 hover:bg-neutral-100"
            >
              {expandido
                ? 'Ocultar Ficha'
                : esPostulanteTab
                  ? 'Revisar Antecedentes'
                  : 'Ficha y Cargos'}
            </button>
          </div>
        </div>

        {expandido && (
          <div className="grid grid-cols-1 gap-6 border-t border-neutral-100 pt-4 lg:grid-cols-2">
            {editandoFichaId === m.id && (
              <form
                onSubmit={(e) => guardarEdicionFicha(e, m.id)}
                className="space-y-4 rounded-xl border-2 border-[#0A0A0A] bg-white p-5 lg:col-span-2"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-900">
                    <Edit3 size={15} className="text-[#D90429]" />
                    Edición Directa de Antecedentes de Ficha
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditandoFichaId(null)}
                    className="text-xs font-black uppercase text-neutral-500 hover:text-neutral-900"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={fichaForm.nombre_completo}
                      onChange={(e) =>
                        setFichaForm({
                          ...fichaForm,
                          nombre_completo: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      RUT
                    </label>
                    <input
                      type="text"
                      value={fichaForm.rut}
                      onChange={(e) =>
                        setFichaForm({
                          ...fichaForm,
                          rut: formatearRutCredencial(e.target.value),
                        })
                      }
                      placeholder="19.082.512-4"
                      className={`w-full rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        !rutFichaValido
                          ? 'border-[#D90429] bg-red-50 text-red-900'
                          : 'border-neutral-300'
                      }`}
                    />
                    {!rutFichaValido && (
                      <p className="mt-1 text-[10px] font-black text-[#D90429]">
                        Este RUT no corresponde. Reintenta verificando el número.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Género
                    </label>
                    <select
                      value={fichaForm.genero}
                      onChange={(e) =>
                        setFichaForm({ ...fichaForm, genero: e.target.value })
                      }
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold"
                    >
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={fichaForm.telefono}
                      onChange={(e) =>
                        setFichaForm({ ...fichaForm, telefono: e.target.value })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Región
                    </label>
                    <select
                      value={fichaForm.region}
                      onChange={(e) => {
                        const nuevaReg = e.target.value;
                        const primeraComuna =
                          REGIONES_CHILE.find((r) => r.region === nuevaReg)
                            ?.comunas?.[0] || '';
                        setFichaForm({
                          ...fichaForm,
                          region: nuevaReg,
                          comuna: primeraComuna,
                        });
                      }}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold"
                    >
                      {REGIONES_CHILE.map((r) => (
                        <option key={r.region} value={r.region}>
                          {r.region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Comuna
                    </label>
                    <select
                      value={fichaForm.comuna}
                      onChange={(e) =>
                        setFichaForm({ ...fichaForm, comuna: e.target.value })
                      }
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold"
                    >
                      {fichaForm.comuna &&
                        !comunasFichaDisponibles.includes(fichaForm.comuna) && (
                          <option value={fichaForm.comuna}>
                            {fichaForm.comuna}
                          </option>
                        )}
                      {comunasFichaDisponibles.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Tipo de Sangre
                    </label>
                    <select
                      value={fichaForm.tipo_sangre}
                      onChange={(e) =>
                        setFichaForm({
                          ...fichaForm,
                          tipo_sangre: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold"
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

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Alergias
                    </label>
                    <input
                      type="text"
                      value={fichaForm.alergias}
                      onChange={(e) =>
                        setFichaForm({ ...fichaForm, alergias: e.target.value })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Vigencia Credencial
                    </label>
                    <input
                      type="date"
                      value={fichaForm.fecha_vigencia_credencial}
                      onChange={(e) =>
                        setFichaForm({
                          ...fichaForm,
                          fecha_vigencia_credencial: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Contacto Emergencia (Nombre)
                    </label>
                    <input
                      type="text"
                      value={fichaForm.contacto_emergencia_nombre}
                      onChange={(e) =>
                        setFichaForm({
                          ...fichaForm,
                          contacto_emergencia_nombre: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Contacto Emergencia (Teléfono)
                    </label>
                    <input
                      type="text"
                      value={fichaForm.contacto_emergencia_telefono}
                      onChange={(e) =>
                        setFichaForm({
                          ...fichaForm,
                          contacto_emergencia_telefono: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>

                  <div className="relative sm:col-span-3">
                    <label className="mb-1 block text-[10px] font-black uppercase text-neutral-600">
                      Especialidades Operativas / Técnicas
                    </label>
                    <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 focus-within:border-[#0A0A0A]">
                      {(fichaForm.especialidades || []).map((esp) => {
                        const abrev = obtenerAbreviaturaEspecialidad(esp);
                        return (
                          <span
                            key={esp}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#0A0A0A] px-2.5 py-1 text-xs font-black text-[#F2B632]"
                          >
                            <span>
                              {(fichaForm.especialidades || []).length > 6
                                ? `${abrev} · ${esp}`
                                : esp}
                            </span>
                            <button
                              type="button"
                              onClick={() => eliminarEspecialidadFicha(esp)}
                              className="rounded-full p-0.5 text-neutral-400 hover:bg-white/15 hover:text-white"
                            >
                              <X size={12} strokeWidth={3} />
                            </button>
                          </span>
                        );
                      })}
                      <input
                        type="text"
                        value={inputEspFicha}
                        onFocus={() => setMostrarSugerenciasEsp(true)}
                        onBlur={() =>
                          setTimeout(() => setMostrarSugerenciasEsp(false), 180)
                        }
                        onChange={(e) => {
                          setInputEspFicha(e.target.value);
                          setMostrarSugerenciasEsp(true);
                        }}
                        onKeyDown={handleKeyDownEspecialidadFicha}
                        placeholder="Selecciona del catálogo (TI, GSAR, etc.) o escribe manual y Enter..."
                        className="min-w-[200px] flex-1 bg-transparent text-xs font-semibold outline-none"
                      />
                    </div>

                    {mostrarSugerenciasEsp && sugerenciasEspFiltradas.length > 0 && (
                      <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl">
                        {sugerenciasEspFiltradas.map((sug) => (
                          <button
                            key={sug.nombre}
                            type="button"
                            onMouseDown={() => agregarEspecialidadFicha(sug.nombre)}
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
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditandoFichaId(null)}
                    className="rounded-xl border border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-black uppercase text-neutral-700 hover:bg-neutral-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardandoFicha || !rutFichaValido}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-5 py-2 text-xs font-black uppercase text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{guardandoFicha ? 'Guardando...' : 'Guardar Ficha'}</span>
                  </button>
                </div>
              </form>
            )}
            {/* Antecedentes y Especialidades (Validadas vs Pendientes) */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:col-span-2">
              <h4 className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                <User
                  size={15}
                  strokeWidth={2.5}
                  className="text-[#D90429]"
                />
                Ficha Completa de Antecedentes y Validación de Especialidades
              </h4>
              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-lg border border-neutral-200 bg-white p-2.5">
                  <span className="block text-[10px] font-black uppercase text-neutral-400">
                    Ubicación
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 font-bold text-neutral-800">
                    <MapPin size={13} className="text-[#D90429]" />
                    {m.region || 'Región del Biobío'} ·{' '}
                    {m.comuna || 'Sin comuna'}
                  </span>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-2.5">
                  <span className="block text-[10px] font-black uppercase text-neutral-400">
                    Salud y Sangre
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 font-bold text-red-700">
                    <HeartPulse size={13} />
                    Sangre: {m.tipo_sangre || 'No especificado'} · Alergias:{' '}
                    {m.alergias || 'Ninguna'}
                  </span>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-2.5">
                  <span className="block text-[10px] font-black uppercase text-neutral-400">
                    Contacto Emergencia (ICE)
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 font-bold text-neutral-800">
                    <PhoneCall size={13} className="text-emerald-600" />
                    {m.contacto_emergencia_nombre || 'N/R'} (
                    {m.contacto_emergencia_telefono || 'N/R'})
                  </span>
                </div>

                <div className="rounded-lg border border-neutral-200 bg-white p-3 sm:col-span-3">
                  <span className="block text-[10px] font-black uppercase text-neutral-500">
                    Participación Operativa y Horas Acumuladas
                  </span>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#0A0A0A] px-2.5 py-1 font-black text-[#F2B632]">
                      <Clock size={13} /> {totalHorasOp.toFixed(1)} hrs operativas
                    </span>
                    <span className="rounded-md bg-red-50 px-2.5 py-1 font-black text-[#D90429]">
                      Reales:{' '}
                      {
                        partMiembro.filter(
                          (p) => p.operativos?.tipo_operativo !== 'simulacro'
                        ).length
                      }
                    </span>
                    <span className="rounded-md bg-purple-50 px-2.5 py-1 font-black text-purple-800">
                      Simulacros:{' '}
                      {
                        partMiembro.filter(
                          (p) => p.operativos?.tipo_operativo === 'simulacro'
                        ).length
                      }
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-200 bg-white p-3 sm:col-span-3">
                  <span className="block text-[10px] font-black uppercase text-neutral-500">
                    Vigencia de Credencial (Opcional)
                  </span>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={
                        m.fecha_vigencia_credencial
                          ? String(m.fecha_vigencia_credencial).slice(0, 10)
                          : ''
                      }
                      onChange={(e) =>
                        actualizarVigenciaCredencial(m.id, e.target.value)
                      }
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-900"
                    />
                    {m.fecha_vigencia_credencial && (
                      <button
                        type="button"
                        onClick={() => actualizarVigenciaCredencial(m.id, null)}
                        className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-[11px] font-black uppercase text-neutral-700 hover:bg-neutral-200"
                      >
                        Restablecer
                      </button>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-200 bg-white p-3 sm:col-span-3">
                  <span className="block text-[10px] font-black uppercase text-neutral-500">
                    Especialidades Validadas (Visibles en Credencial)
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {espValidadas.length === 0 ? (
                      <span className="text-xs font-semibold text-neutral-400">
                        Sin especialidades validadas aún.
                      </span>
                    ) : (
                      espValidadas.map((esp) => (
                        <span
                          key={esp}
                          className="rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-900"
                        >
                          {esp}
                        </span>
                      ))
                    )}
                  </div>

                  {espPendientes.length > 0 && (
                    <div className="mt-3 border-t border-neutral-100 pt-2.5">
                      <span className="block text-[10px] font-black uppercase text-[#D90429]">
                        Especialidades Pendientes de Validación
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {espPendientes.map((esp) => (
                          <div
                            key={esp}
                            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1"
                          >
                            <span className="text-xs font-bold text-neutral-900">
                              {esp}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                aprobarEspecialidadPendiente(m, esp)
                              }
                              className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white hover:bg-emerald-700"
                            >
                              Validar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                rechazarEspecialidadPendiente(m, esp)
                              }
                              className="rounded bg-[#D90429] px-2 py-0.5 text-[10px] font-black uppercase text-white hover:bg-red-700"
                            >
                              Rechazar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!esPostulanteTab && (
              <>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                      <Award
                        size={15}
                        strokeWidth={2.5}
                        className="text-[#D90429]"
                      />
                      Cargos Operativos Acumulables
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CATALOGO_CARGOS.map((cargo) => {
                      const activo = cargosMiembro.includes(cargo.key);
                      const permitido = puedeAsignarCargo(cargo.key);

                      return (
                        <button
                          key={cargo.key}
                          type="button"
                          disabled={!permitido}
                          title={cargo.descripcion}
                          onClick={() => toggleCargoOperativo(m, cargo.key)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition-all ${activo
                              ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F2B632] shadow-sm'
                              : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400'
                            } disabled:cursor-not-allowed disabled:opacity-45`}
                        >
                          <span>{cargo.label}</span>
                          {cargo.unico && (
                            <span className="rounded bg-red-600 px-1.5 py-0.2 text-[9px] uppercase text-white">
                              Único
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                      <Eye
                        size={15}
                        strokeWidth={2.5}
                        className="text-[#D90429]"
                      />
                      Datos Públicos Visibles en QR (Fiscalización)
                    </h4>
                    {!puedeEditarVisibilidad && (
                      <span className="text-[10px] font-black uppercase text-neutral-400">
                        Solo Secretario / DG / SA
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CAMPOS_VISIBILIDAD.map((campo) => {
                      const visible = Boolean(visPublica[campo.key]);
                      return (
                        <button
                          key={campo.key}
                          type="button"
                          disabled={!puedeEditarVisibilidad}
                          onClick={() => toggleCampoVisibilidad(m, campo.key)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition-colors ${visible
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                              : 'border-neutral-300 bg-white text-neutral-400'
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${visible ? 'bg-emerald-600' : 'bg-neutral-300'
                              }`}
                          />
                          {campo.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {esSA && (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:col-span-2">
                <h4 className="mb-2.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                  Gestión de Fotografía Institucional (Exclusivo Superadmin)
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-white">
                    {m.foto_url ? (
                      <img
                        src={m.foto_url}
                        alt={m.nombre_completo}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-center text-[10px] font-black uppercase text-neutral-400">
                        Sin Foto
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {m.foto_url && (
                      <a
                        href={m.foto_url}
                        download={`Foto_${m.rut || m.id}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-black uppercase text-neutral-800 hover:bg-neutral-100"
                      >
                        <Download size={14} strokeWidth={2.5} /> Descargar Foto
                        Original
                      </a>
                    )}

                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800">
                      <Camera size={14} strokeWidth={2.5} />
                      <span>
                        {subiendoFotoId === m.id
                          ? 'Subiendo imagen...'
                          : 'Subir / Reemplazar Foto con Uniforme'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={subiendoFotoId === m.id}
                        onChange={(e) =>
                          handleAdminSubirFotoMiembro(m.id, e.target.files?.[0])
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {!(m.email || '').toLowerCase().endsWith('@gmail.com') && (
                  <div className="mt-4 border-t border-neutral-200 pt-4">
                    <h5 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                      <KeyRound size={14} className="text-[#D90429]" />
                      Clave Provisoria para Correo Externo (Exclusivo Superadmin)
                    </h5>
                    <p className="mb-2.5 text-[11px] font-semibold text-neutral-600">
                      Correo: <strong>{m.email || 'Sin correo'}</strong> ·{' '}
                      {m.requiere_cambio_clave
                        ? `Requiere cambio de clave (actual: ${m.clave_provisoria || 'asignada'})`
                        : 'Sin clave provisoria pendiente'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={
                          claveInputs[m.id] !== undefined
                            ? claveInputs[m.id]
                            : m.clave_provisoria || ''
                        }
                        onChange={(e) =>
                          setClaveInputs((prev) => ({
                            ...prev,
                            [m.id]: e.target.value,
                          }))
                        }
                        placeholder="Escribe clave o genera una"
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-900"
                      />
                      <button
                        type="button"
                        onClick={() => asignarClaveProvisoria(m, false)}
                        className="rounded-lg bg-[#0A0A0A] px-3 py-1.5 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800"
                      >
                        Asignar Clave
                      </button>
                      <button
                        type="button"
                        onClick={() => asignarClaveProvisoria(m, true)}
                        className="rounded-lg bg-[#D90429] px-3 py-1.5 text-xs font-black uppercase text-white hover:bg-red-700"
                      >
                        Generar Automática
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Gestión de Directorio y Cargos"
      subtitle="Administración separada de Miembros Activos, Postulantes, Certificados y Solicitudes"
      actions={
        <div className="flex items-center gap-2">
          {cargosActuales.map((c) => (
            <span
              key={c}
              className="hidden rounded-lg bg-red-100 px-2.5 py-1 text-[10px] font-black uppercase text-[#D90429] sm:inline-block"
            >
              {c}
            </span>
          ))}
          <span
            className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${esSA
                ? 'bg-[#0A0A0A] text-[#F2B632]'
                : 'bg-red-100 text-[#D90429]'
              }`}
          >
            {rolActual}
          </span>
        </div>
      }
    >
      {alerta && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border-l-4 border-[#D90429] bg-red-50 p-4 text-xs font-bold text-red-900">
          <AlertTriangle
            size={18}
            strokeWidth={2.5}
            className="shrink-0 text-[#D90429]"
          />
          <span>{alerta}</span>
        </div>
      )}

      {infoExito && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border-l-4 border-emerald-600 bg-emerald-50 p-4 text-xs font-bold text-emerald-900">
          <CheckCircle size={18} strokeWidth={2.5} className="shrink-0 text-emerald-600" />
          <span>{infoExito}</span>
        </div>
      )}

      {/* Resumen de Alertas Accionables (Clicables -> Navegación directa) */}
      {(certificadosPendientes.length > 0 ||
        postulantesPendientes.length > 0 ||
        solicitudesPendientes.length > 0 ||
        perfilesConEspPendientes.length > 0 ||
        vencimientosProximos.length > 0) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {certificadosPendientes.length > 0 && (
            <button
              type="button"
              onClick={() =>
                irATabYElemento(
                  'certificados',
                  `cert-${certificadosPendientes[0].id}`
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-black text-amber-950 shadow-sm hover:bg-amber-100"
            >
              <Bell size={14} className="text-[#D90429]" />
              <span>
                {certificadosPendientes.length} Certificado(s) por validar →
              </span>
            </button>
          )}
          {postulantesPendientes.length > 0 && (
            <button
              type="button"
              onClick={() =>
                irATabYElemento(
                  'postulantes',
                  `persona-${postulantesPendientes[0].id}`,
                  postulantesPendientes[0].id
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2 text-xs font-black text-[#D90429] shadow-sm hover:bg-red-100"
            >
              <UserCheck size={14} />
              <span>
                {postulantesPendientes.length} Postulación(es) pendiente(s) →
              </span>
            </button>
          )}
          {perfilesConEspPendientes.length > 0 && (
            <button
              type="button"
              onClick={() =>
                irATabYElemento(
                  'miembros',
                  `persona-${perfilesConEspPendientes[0].id}`,
                  perfilesConEspPendientes[0].id
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-black text-amber-950 shadow-sm hover:bg-amber-100"
            >
              <Award size={14} className="text-[#D90429]" />
              <span>
                {perfilesConEspPendientes.length} Miembro(s) con especialidades por validar →
              </span>
            </button>
          )}
          {solicitudesPendientes.length > 0 && (
            <button
              type="button"
              onClick={() => irATabYElemento('solicitudes', 'panel-solicitudes')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2 text-xs font-black text-red-900 shadow-sm hover:bg-red-100"
            >
              <Siren size={14} className="text-[#D90429]" />
              <span>
                {solicitudesPendientes.length} Solicitud(es) de apoyo pendiente(s) →
              </span>
            </button>
          )}
          {vencimientosProximos.length > 0 && (
            <button
              type="button"
              onClick={() =>
                irATabYElemento(
                  vencimientosProximos[0].tab,
                  vencimientosProximos[0].elementId,
                  vencimientosProximos[0].perfilId
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-400 bg-red-100 px-3.5 py-2 text-xs font-black text-red-950 shadow-sm hover:bg-red-200"
            >
              <Clock size={14} className="text-[#D90429]" />
              <span>
                {vencimientosProximos.length} Vencimiento(s) (≤30 / ≤15 días) →
              </span>
            </button>
          )}
        </div>
      )}

      {/* Notificaciones para el Directorio (Clicables -> Navegación directa) */}
      {alertasSinLeer.length > 0 && (
        <div className="mb-6 space-y-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <p className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-950">
            <Bell size={15} className="text-[#D90429]" />
            Notificaciones de Antecedentes, Especialidades y Cursos (
            {alertasSinLeer.length})
          </p>
          {alertasSinLeer.map((n) => (
            <div
              key={n.id}
              onClick={() => navegarDesdeNotificacion(n)}
              className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs transition-colors hover:border-[#D90429] hover:bg-amber-50/40"
            >
              <div>
                <p className="font-black text-neutral-900">
                  {n.titulo}{' '}
                  <span className="ml-1 text-[10px] font-black uppercase text-[#D90429]">
                    · Ir a resolver →
                  </span>
                </p>
                {n.detalle && (
                  <p className="text-[11px] text-neutral-600">{n.detalle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  marcarNotificacionLeida(n.id);
                }}
                className="rounded-lg bg-[#0A0A0A] px-2.5 py-1 text-[10px] font-black uppercase text-[#F2B632]"
              >
                Marcar Leída
              </button>
            </div>
          ))}
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
          Miembros Activos ({listaMiembros.length})
        </button>

        <button
          onClick={() => setTab('postulantes')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${tab === 'postulantes'
              ? 'border-[#D90429] text-[#D90429]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
        >
          <span>Postulantes ({listaPostulantes.length})</span>
          {postulantesPendientes.length > 0 && (
            <span className="rounded-full bg-[#D90429] px-2 py-0.5 text-[10px] font-black text-white">
              {postulantesPendientes.length} por revisar
            </span>
          )}
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

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportarNominaCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-neutral-800 hover:bg-neutral-100"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={abrirVistaImprimible}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-neutral-800 hover:bg-neutral-100"
          >
            <Printer size={14} />
            <span>Vista Imprimible</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNuevoPerfil((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#F2B632] hover:bg-neutral-800"
          >
            <UserPlus size={14} />
            <span>Agregar Perfil</span>
          </button>
        </div>
      </div>

      {showNuevoPerfil && (
        <form
          onSubmit={handleCrearPerfil}
          className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-5"
        >
          <input
            type="text"
            required
            value={nuevoPerfil.nombre_completo}
            onChange={(e) =>
              setNuevoPerfil({ ...nuevoPerfil, nombre_completo: e.target.value })
            }
            placeholder="Nombre completo *"
            className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold sm:col-span-2"
          />
          <input
            type="email"
            value={nuevoPerfil.email}
            onChange={(e) =>
              setNuevoPerfil({ ...nuevoPerfil, email: e.target.value })
            }
            placeholder="Correo electrónico"
            className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
          />
          <input
            type="text"
            value={nuevoPerfil.rut}
            onChange={(e) =>
              setNuevoPerfil({ ...nuevoPerfil, rut: e.target.value })
            }
            placeholder="RUT (12.345.678-9)"
            className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
          />
          <div className="flex gap-2">
            <select
              value={nuevoPerfil.rol}
              onChange={(e) =>
                setNuevoPerfil({ ...nuevoPerfil, rol: e.target.value })
              }
              className="w-full rounded-xl border border-neutral-300 bg-white px-2.5 py-2 text-xs font-bold uppercase"
            >
              <option value="postulante">Postulante</option>
              <option value="voluntario">Voluntario</option>
            </select>
            <button
              type="submit"
              disabled={creandoPerfil}
              className="shrink-0 rounded-xl bg-[#D90429] px-4 py-2 text-xs font-black uppercase text-white hover:bg-red-700 disabled:opacity-50"
            >
              {creandoPerfil ? '...' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm font-bold text-neutral-500">
          Cargando registros institucionales...
        </p>
      ) : tab === 'miembros' ? (
        <div className="space-y-4">
          {listaMiembros.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-500">
              No hay miembros activos registrados.
            </p>
          ) : (
            listaMiembros.map((m) => renderTarjetaPersona(m, false))
          )}
        </div>
      ) : tab === 'postulantes' ? (
        <div className="space-y-4">
          {listaPostulantes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-500">
              No hay postulantes registrados en este momento.
            </p>
          ) : (
            listaPostulantes.map((p) => renderTarjetaPersona(p, true))
          )}
        </div>
      ) : tab === 'certificados' ? (
        <div id="panel-certificados" className="space-y-5">
          {puedeAgregarCertificado && (
            <form
              onSubmit={handleCrearCertificadoDirectorio}
              className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-900">
                <Award size={16} className="text-[#D90429]" />
                Agregar Curso / Certificado a Voluntario o Postulante
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <select
                  required
                  value={nuevoCertForm.perfil_id}
                  onChange={(e) =>
                    setNuevoCertForm({
                      ...nuevoCertForm,
                      perfil_id: e.target.value,
                    })
                  }
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                >
                  <option value="">Seleccionar voluntario / postulante...</option>
                  {perfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_completo || p.email} ({(p.rol || 'postulante').toUpperCase()})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  required
                  value={nuevoCertForm.titulo_curso}
                  onChange={(e) =>
                    setNuevoCertForm({
                      ...nuevoCertForm,
                      titulo_curso: e.target.value,
                    })
                  }
                  placeholder="Nombre del curso / certificación *"
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                />

                <input
                  type="text"
                  value={nuevoCertForm.institucion}
                  onChange={(e) =>
                    setNuevoCertForm({
                      ...nuevoCertForm,
                      institucion: e.target.value,
                    })
                  }
                  placeholder="Institución emisora"
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                />

                <select
                  value={nuevoCertForm.especialidad_vinculada}
                  onChange={(e) =>
                    setNuevoCertForm({
                      ...nuevoCertForm,
                      especialidad_vinculada: e.target.value,
                    })
                  }
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                >
                  <option value="">Sin especialidad vinculada</option>
                  {ESPECIALIDADES_CATALOGO.map((esp) => (
                    <option key={esp.nombre} value={esp.nombre}>
                      {esp.nombre} ({esp.abrev})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-black text-neutral-900">
                    <input
                      type="checkbox"
                      checked={nuevoCertForm.sin_vencimiento}
                      onChange={(e) =>
                        setNuevoCertForm({
                          ...nuevoCertForm,
                          sin_vencimiento: e.target.checked,
                          fecha_vencimiento: e.target.checked
                            ? ''
                            : nuevoCertForm.fecha_vencimiento,
                        })
                      }
                      className="h-4 w-4 rounded text-[#D90429]"
                    />
                    <span>No tiene vencimiento</span>
                  </label>

                  {!nuevoCertForm.sin_vencimiento && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase text-neutral-600">
                        Vence el:
                      </span>
                      <input
                        type="date"
                        required
                        value={nuevoCertForm.fecha_vencimiento}
                        onChange={(e) =>
                          setNuevoCertForm({
                            ...nuevoCertForm,
                            fecha_vencimiento: e.target.value,
                          })
                        }
                        className="rounded-xl border border-neutral-300 px-3 py-1.5 text-xs font-bold"
                      />
                    </div>
                  )}

                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100">
                    <Upload size={14} className="text-[#D90429]" />
                    <span>
                      {archivoNuevoCert
                        ? archivoNuevoCert.name
                        : 'Adjuntar PDF / Imagen (opcional)'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) =>
                        setArchivoNuevoCert(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={creandoCert}
                  className="rounded-xl bg-[#D90429] px-5 py-2 text-xs font-black uppercase text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {creandoCert ? 'Guardando...' : 'Agregar Certificado'}
                </button>
              </div>
            </form>
          )}

          {certificados.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-500">
              No hay certificados registrados.
            </p>
          ) : (
            certificados.map((cert) => {
              const yaAprobado = cert.estado_validacion === 'aprobado';
              const sinVenc =
                cert.sin_vencimiento === true || !cert.fecha_vencimiento;
              const evCert = sinVenc
                ? null
                : evaluarVencimiento(cert.fecha_vencimiento);

              return (
                <div
                  key={cert.id}
                  id={`cert-${cert.id}`}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-neutral-900">
                        {cert.titulo_curso}
                      </h3>
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-[11px] font-black uppercase ${
                          yaAprobado
                            ? 'bg-emerald-100 text-emerald-800'
                            : cert.estado_validacion === 'rechazado'
                              ? 'bg-red-100 text-[#D90429]'
                              : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {cert.estado_validacion}
                      </span>
                      {sinVenc ? (
                        <span className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-neutral-700">
                          No tiene vencimiento
                        </span>
                      ) : (
                        evCert && (
                          <span
                            className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              evCert.estado === 'preventivo'
                                ? 'bg-amber-100 text-amber-900'
                                : evCert.estado === 'urgente' ||
                                    evCert.estado === 'vencido'
                                  ? 'bg-red-100 text-[#D90429]'
                                  : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {evCert.etiqueta}
                          </span>
                        )
                      )}
                    </div>
                    <p className="text-xs font-semibold text-neutral-600">
                      {cert.perfiles?.nombre_completo || 'Sin nombre'} (
                      {cert.perfiles?.rut || 'Sin RUT'}) — Rol:{' '}
                      <strong className="uppercase">{cert.perfiles?.rol}</strong>
                    </p>
                    <p className="text-xs text-neutral-400">
                      Institución: {cert.institucion || 'No indicada'}
                      {cert.especialidad_vinculada
                        ? ` · Especialidad vinculada: ${cert.especialidad_vinculada}`
                        : ''}
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
                      type="button"
                      disabled={yaAprobado}
                      onClick={() => validarCertificado(cert, 'aprobado')}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black uppercase ${
                        yaAprobado
                          ? 'cursor-not-allowed border border-emerald-200 bg-emerald-50 text-emerald-700 opacity-75'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <CheckCircle size={15} strokeWidth={2.5} />{' '}
                      {yaAprobado ? 'Aprobado' : 'Aprobar'}
                    </button>

                    <button
                      type="button"
                      onClick={() => validarCertificado(cert, 'rechazado')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-3 py-2 text-xs font-black uppercase text-white hover:bg-red-700"
                    >
                      <XCircle size={15} strokeWidth={2.5} /> Rechazar
                    </button>

                    {cert.perfiles?.rol === 'postulante' && (
                      <button
                        type="button"
                        onClick={() =>
                          cambiarRolMiembro(cert.perfiles, 'voluntario')
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3 py-2 text-xs font-black uppercase text-white hover:bg-neutral-800"
                      >
                        <UserCheck size={15} strokeWidth={2.5} /> Ascender a
                        Voluntario
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div id="panel-solicitudes" className="space-y-4">
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
                    <Siren
                      size={20}
                      strokeWidth={2.5}
                      className="text-[#D90429]"
                    />
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