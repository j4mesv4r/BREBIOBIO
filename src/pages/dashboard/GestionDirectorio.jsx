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
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const CATALOGO_CARGOS = [
  {
    key: 'secretario',
    label: 'Secretario',
    corto: 'SEC',
    unico: true,
    descripcion: 'Único (1 en ONG) · Configura visibilidad pública y actas',
  },
  {
    key: 'tesorero',
    label: 'Tesorero',
    corto: 'TES',
    unico: true,
    descripcion: 'Único (1 en ONG) · Gestiona Tesorería y respaldos',
  },
  {
    key: 'do',
    label: 'Director Operativo',
    corto: 'DO',
    unico: false,
    descripcion: 'Mando operativo · Designa DOs, JC, LEM, Instructor y Puesto de Mando',
  },
  {
    key: 'dos',
    label: 'Director Op. Suplente',
    corto: 'DOs',
    unico: false,
    descripcion: 'Designado por SA, DG o DO',
  },
  {
    key: 'jc',
    label: 'Jefe de Cuadrilla',
    corto: 'JC',
    unico: false,
    descripcion: 'Ve antecedentes de su cuadrilla en operativos',
  },
  {
    key: 'lem',
    label: 'Líder Equipo Médico',
    corto: 'LEM',
    unico: false,
    descripcion: 'Coordina área médica y asigna Prehospitalario',
  },
  {
    key: 'prehospitalario',
    label: 'Prehospitalario',
    corto: 'PREHOSP',
    unico: false,
    descripcion: 'Designado por SA, DG, DO o LEM · Ingresa casos de Triage',
  },
  {
    key: 'instructor',
    label: 'Instructor',
    corto: 'INST',
    unico: false,
    descripcion: 'Coordina formación, academias y simulacros operativos',
  },
];

const CAMPOS_VISIBILIDAD = [
  { key: 'foto_url', label: 'Fotografía' },
  { key: 'rut', label: 'RUT' },
  { key: 'especialidad', label: 'Especialidad' },
  { key: 'tipo_sangre', label: 'Tipo Sangre' },
  { key: 'certificados', label: 'Certificados' },
  { key: 'vigencia', label: 'Vigencia' },
  { key: 'telefono', label: 'Teléfono' },
];

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

  const rolActual = (currentProfile?.rol || '').toLowerCase();
  const cargosActuales = Array.isArray(currentProfile?.cargos_operativos)
    ? currentProfile.cargos_operativos.map((c) => c.toLowerCase())
    : [];

  const esSA = rolActual === 'superadmin';
  const esDG = rolActual === 'director';
  const esDO = cargosActuales.includes('do');
  const esLEM = cargosActuales.includes('lem');
  const esSecretario = cargosActuales.includes('secretario');

  const puedeEditarVisibilidad = esSA || esDG || esSecretario;

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
    const [certsRes, solRes, perfRes, notifRes] = await Promise.all([
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
  const alertasSinLeer = notificaciones.filter((n) => !n.leida);

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

    if (cargos.includes('do')) return 'DIRECTOR OPERATIVO';
    if (r === 'director') return 'DIRECTORIO';
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
    if (r === 'superadmin') return 'OPERATIVO - ADMINISTRATIVO';
    if (r === 'director') return 'DIRECTORIO';
    return 'BÚSQUEDA Y RESCATE';
  };

  const formatearEspecialidadesParaCredencial = (lista = []) => {
    const limpias = Array.isArray(lista) ? lista.filter(Boolean) : [];
    if (limpias.length === 0) {
      return 'PENDIENTE DE VALIDACIÓN · BÚSQUEDA Y RESCATE';
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
    const nuevos = yaTiene
      ? actuales.filter((c) => c !== claveCargo)
      : [...actuales, claveCargo];

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

    return (
      <div
        key={m.id}
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
                        {info ? info.label : cargoKey}
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
                {m.estado_validacion !== 'aprobado' && (
                  <button
                    onClick={() => validarMiembro(m, 'aprobado', 'postulante')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black uppercase text-white hover:bg-emerald-700"
                  >
                    <CheckCircle size={15} strokeWidth={2.5} /> Autorizar
                  </button>
                )}

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

                {m.estado_validacion !== 'aprobado' && (
                  <button
                    onClick={() => validarMiembro(m, 'aprobado')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black uppercase text-white hover:bg-emerald-700"
                  >
                    <CheckCircle size={15} strokeWidth={2.5} /> Aprobar
                  </button>
                )}

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
              onClick={() => setPanelAbiertoId(expandido ? null : m.id)}
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

      {/* Notificaciones para el Directorio */}
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
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs"
            >
              <div>
                <p className="font-black text-neutral-900">{n.titulo}</p>
                {n.detalle && (
                  <p className="text-[11px] text-neutral-600">{n.detalle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => marcarNotificacionLeida(n.id)}
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

        <button
          type="button"
          onClick={() => setShowNuevoPerfil((prev) => !prev)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#F2B632] hover:bg-neutral-800"
        >
          <UserPlus size={14} />
          <span>Agregar Perfil</span>
        </button>
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
        <div className="space-y-4">
          {certificados.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-500">
              No hay certificados registrados.
            </p>
          ) : (
            certificados.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-neutral-900">
                      {cert.titulo_curso}
                    </h3>
                    <span className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-[11px] font-black uppercase text-neutral-700">
                      {cert.estado_validacion}
                    </span>
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
                    onClick={() => validarCertificado(cert, 'aprobado')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-black uppercase text-white hover:bg-green-700"
                  >
                    <CheckCircle size={15} strokeWidth={2.5} /> Aprobar
                  </button>

                  <button
                    onClick={() => validarCertificado(cert, 'rechazado')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-3 py-2 text-xs font-black uppercase text-white hover:bg-red-700"
                  >
                    <XCircle size={15} strokeWidth={2.5} /> Rechazar
                  </button>

                  {cert.perfiles?.rol === 'postulante' && (
                    <button
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
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
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