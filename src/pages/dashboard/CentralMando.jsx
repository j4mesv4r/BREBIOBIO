import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import QRCode from 'qrcode';
import {
  MapPin,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  X,
  Shield,
  Users,
  HeartPulse,
  PhoneCall,
  UserPlus,
  Trash2,
  Eye,
  Navigation,
  Wifi,
  WifiOff,
  RefreshCw,
  QrCode,
  MessageSquare,
  Camera,
  Send,
  BookOpen,
  Printer,
  Check,
  Copy,
} from 'lucide-react';

const TRIAGE_ESTILOS = {
  verde: {
    label: 'VERDE · Leve / Ambulatorio',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  amarillo: {
    label: 'AMARILLO · Urgencia Diferida',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  rojo: {
    label: 'ROJO · Emergencia Inmediata',
    badge: 'bg-red-100 text-red-800 border-red-300',
  },
  negro: {
    label: 'NEGRO · Fallecido / Expectante',
    badge: 'bg-neutral-900 text-white border-neutral-700',
  },
};

const TIPOS_WAYPOINT = [
  { key: 'ultimo_avistamiento', label: 'Último Avistamiento (LKP)', color: '#7C3AED' },
  { key: 'indicio', label: 'Indicio / Huella', color: '#D90429' },
  { key: 'acantilado', label: 'Acantilado / Riesgo', color: '#DC2626' },
  { key: 'precaucion', label: 'Precaución', color: '#F59E0B' },
  { key: 'zona_exclusion', label: 'Zona de Exclusión', color: '#111827' },
  { key: 'observacion', label: 'Punto Observación', color: '#2563EB' },
  { key: 'reunion', label: 'Punto Reunión', color: '#059669' },
];

export default function CentralMando() {
  const { user, profile } = useAuth();
  const [operativos, setOperativos] = useState([]);
  const [efectivos, setEfectivos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapa Leaflet
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const watchIdRef = useRef(null);

  // Trakeo GPS Offline del usuario actual
  const [online, setOnline] = useState(navigator.onLine);
  const [trackingActivo, setTrackingActivo] = useState(false);
  const [colaOffline, setColaOffline] = useState([]);
  const [ultimaPos, setUltimaPos] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);

  // Modal Creación de Operativo
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nuevoOp, setNuevoOp] = useState({
    titulo: '',
    descripcion: '',
    tipo_operativo: 'real',
    estado: 'en_curso',
    latitud: '-36.8201',
    longitud: '-73.0498',
  });
  const [pmInicialIds, setPmInicialIds] = useState([]);

  // Sala Táctica del Operativo Seleccionado
  const [selectedOp, setSelectedOp] = useState(null);
  const [tabTactico, setTabTactico] = useState('despliegue');
  const [puestoMando, setPuestoMando] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [invitadosExt, setInvitadosExt] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [trackingPuntos, setTrackingPuntos] = useState([]);
  const [chatMensajes, setChatMensajes] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [cuadrillas, setCuadrillas] = useState([]);
  const [triages, setTriages] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [alertaTactica, setAlertaTactica] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiadoLink, setCopiadoLink] = useState(false);

  // Formularios tácticos
  const [nuevoPmId, setNuevoPmId] = useState('');
  const [nuevoPmTurno, setNuevoPmTurno] = useState('Turno 1');
  const [invitarInternoId, setInvitarInternoId] = useState('');
  const [invitarFuncion, setInvitarFuncion] = useState('Búsqueda y Rescate');

  const [nuevoWp, setNuevoWp] = useState({
    tipo: 'indicio',
    titulo: '',
    descripcion: '',
  });

  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [fotoChat, setFotoChat] = useState(null);
  const [enviandoChat, setEnviandoChat] = useState(false);

  const [nuevaEntradaBitacora, setNuevaEntradaBitacora] = useState({
    titulo: '',
    detalle: '',
  });

  const [nuevaCuadrilla, setNuevaCuadrilla] = useState({
    nombre_cuadrilla: '',
    jefe_cuadrilla_id: '',
    integrantes_ids: [],
  });
  const [cuadrillaAntecedentesId, setCuadrillaAntecedentesId] = useState(null);

  const [nuevoTriage, setNuevoTriage] = useState({
    codigo_paciente: '',
    nombre_paciente: '',
    edad_aprox: '',
    categoria_triage: 'amarillo',
    signos_vitales: '',
    lesiones_hallazgos: '',
    centro_derivacion: '',
  });

  const rol = (profile?.rol || 'postulante').toLowerCase();
  const cargos = Array.isArray(profile?.cargos_operativos)
    ? profile.cargos_operativos.map((c) => c.toLowerCase())
    : [];

  const esSA = rol === 'superadmin';
  const esDG = rol === 'director';
  const esDO = cargos.includes('do');
  const esDOs = cargos.includes('dos');
  const esJC = cargos.includes('jc');
  const esLEM = cargos.includes('lem');
  const esPrehosp = cargos.includes('prehospitalario');

  const esMandoGlobal = esSA || esDG || esDO || esDOs;
  const esPmDeEsteCaso =
    esMandoGlobal ||
    puestoMando.some((pm) => pm.perfil_id === profile?.id);

  const miParticipacion = participantes.find(
    (p) => p.perfil_id === profile?.id
  );
  const estoyAutorizadoEnCaso =
    esPmDeEsteCaso || miParticipacion?.estado === 'autorizado';

  const puedeCrearCuadrilla = esPmDeEsteCaso || esJC;
  const puedeRegistrarTriage = esSA || esDG || esDO || esLEM || esPrehosp;

  // Conexión online / offline
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const guardada = JSON.parse(
        localStorage.getItem('bre_tracking_cola') || '[]'
      );
      if (Array.isArray(guardada)) setColaOffline(guardada);
    } catch {
      setColaOffline([]);
    }
  }, []);

  // Sincronización automática al recuperar conexión
  useEffect(() => {
    if (online && colaOffline.length > 0) {
      sincronizarColaOffline();
    }
  }, [online, colaOffline.length]);

  const guardarEnColaOffline = (item) => {
    setColaOffline((prev) => {
      const nueva = [...prev, item];
      localStorage.setItem('bre_tracking_cola', JSON.stringify(nueva));
      return nueva;
    });
  };

  const sincronizarColaOffline = async () => {
    if (sincronizando || colaOffline.length === 0) return;
    setSincronizando(true);
    try {
      const gpsRows = colaOffline
        .filter((i) => i.clase === 'tracking')
        .map((i) => i.payload);
      if (gpsRows.length > 0) {
        await supabase.from('operativo_tracking').insert(gpsRows);
      }

      const wpRows = colaOffline
        .filter((i) => i.clase === 'waypoint')
        .map((i) => i.payload);
      if (wpRows.length > 0) {
        await supabase.from('operativo_waypoints').insert(wpRows);
      }

      localStorage.removeItem('bre_tracking_cola');
      setColaOffline([]);
      if (selectedOp) cargarDetalleOperativo(selectedOp);
    } finally {
      setSincronizando(false);
    }
  };

  // Inicializar Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([-36.8201, -73.0498], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap · O.N.G. BRE Bío-Bío',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (showModalCrear) {
        setNuevoOp((prev) => ({
          ...prev,
          latitud: e.latlng.lat.toFixed(5),
          longitud: e.latlng.lng.toFixed(5),
        }));
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [showModalCrear]);

  // Dibujar marcadores de operativos, waypoints y trazas GPS en el mapa
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    // 1. Marcadores de Operativos Activos
    const iconoEmergencia = L.divIcon({
      className: 'bre-marker',
      html: `<div style="width:26px;height:26px;border-radius:9999px;background:#D90429;border:3px solid #FFFFFF;box-shadow:0 4px 12px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;">
        <div style="width:8px;height:8px;border-radius:9999px;background:#F2B632;"></div>
      </div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    operativos
      .filter((op) => op.latitud && op.longitud && op.estado !== 'finalizado')
      .forEach((op) => {
        const marker = L.marker([Number(op.latitud), Number(op.longitud)], {
          icon: iconoEmergencia,
        });
        marker.bindTooltip(
          `${op.tipo_operativo === 'simulacro' ? '[SIMULACRO] ' : ''}${op.titulo}`,
          { direction: 'top' }
        );
        marker.on('click', () => enfocarOperativo(op));
        marker.addTo(layer);
      });

    // 2. Waypoints y Trazas GPS del operativo seleccionado
    if (selectedOp) {
      waypoints.forEach((wp) => {
        const info =
          TIPOS_WAYPOINT.find((t) => t.key === wp.tipo) || TIPOS_WAYPOINT[0];
        const m = L.circleMarker([wp.latitud, wp.longitud], {
          radius: 9,
          fillColor: info.color,
          color: '#FFFFFF',
          weight: 2.5,
          fillOpacity: 0.95,
        });
        m.bindPopup(
          `<strong>${wp.titulo}</strong><br/><small>${info.label} · ${wp.validado ? 'Validado PM' : 'Pendiente validación'
          }</small>`
        );
        m.addTo(layer);
      });

      // Agrupar trazas por efectivo o invitado
      const rutas = {};
      trackingPuntos.forEach((pt) => {
        const key = pt.perfil_id || `ext_${pt.invitado_id}`;
        if (!rutas[key]) rutas[key] = [];
        rutas[key].push([pt.latitud, pt.longitud]);
      });

      Object.values(rutas).forEach((coords) => {
        if (coords.length > 1) {
          L.polyline(coords, {
            color: '#059669',
            weight: 4,
            opacity: 0.85,
          }).addTo(layer);
        }
      });
    }
  }, [operativos, selectedOp, waypoints, trackingPuntos]);

  useEffect(() => {
    fetchDatosBase();

    const channel = supabase
      .channel('operativos_cambios')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'operativos' },
        () => fetchDatosBase()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDatosBase = async () => {
    setLoading(true);
    const [opRes, perfRes] = await Promise.all([
      supabase
        .from('operativos')
        .select('*')
        .order('creado_en', { ascending: false }),
      supabase
        .from('perfiles')
        .select(
          'id, nombre_completo, rut, rol, cargos_operativos, telefono, tipo_sangre, alergias, contacto_emergencia_nombre, contacto_emergencia_telefono, comuna, codigo_credencial, estado_validacion'
        )
        .eq('estado_validacion', 'aprobado')
        .order('nombre_completo', { ascending: true }),
    ]);

    if (!opRes.error) setOperativos(opRes.data || []);
    if (!perfRes.error) setEfectivos(perfRes.data || []);
    setLoading(false);
  };

  const cargarDetalleOperativo = async (op) => {
    setLoadingDetalle(true);
    setAlertaTactica('');
    const [
      pmRes,
      partRes,
      invRes,
      wpRes,
      trkRes,
      chatRes,
      bitRes,
      cuadRes,
      triRes,
    ] = await Promise.all([
      supabase
        .from('operativo_puesto_mando')
        .select(
          '*, perfiles:perfil_id(id, nombre_completo, rol, cargos_operativos, codigo_credencial)'
        )
        .eq('operativo_id', op.id)
        .order('creado_en', { ascending: true }),
      supabase
        .from('operativo_participantes')
        .select(
          '*, perfiles:perfil_id(id, nombre_completo, rol, codigo_credencial, especialidad)'
        )
        .eq('operativo_id', op.id)
        .order('creado_en', { ascending: false }),
      supabase
        .from('operativo_invitados_externos')
        .select('*')
        .eq('operativo_id', op.id)
        .order('creado_en', { ascending: false }),
      supabase
        .from('operativo_waypoints')
        .select('*, perfiles:creado_por(nombre_completo)')
        .eq('operativo_id', op.id)
        .order('creado_en', { ascending: false }),
      supabase
        .from('operativo_tracking')
        .select('*')
        .eq('operativo_id', op.id)
        .order('capturado_en', { ascending: true }),
      supabase
        .from('operativo_chat')
        .select('*')
        .eq('operativo_id', op.id)
        .order('creado_en', { ascending: true })
        .limit(100),
      supabase
        .from('operativo_bitacora')
        .select('*, perfiles:registrado_por(nombre_completo)')
        .eq('operativo_id', op.id)
        .order('hora_evento', { ascending: true }),
      supabase
        .from('operativo_cuadrillas')
        .select('*')
        .eq('operativo_id', op.id)
        .order('creado_en', { ascending: true }),
      supabase
        .from('operativo_triage')
        .select('*')
        .eq('operativo_id', op.id)
        .order('creado_en', { ascending: false }),
    ]);

    if (!pmRes.error) setPuestoMando(pmRes.data || []);
    if (!partRes.error) setParticipantes(partRes.data || []);
    if (!invRes.error) setInvitadosExt(invRes.data || []);
    if (!wpRes.error) setWaypoints(wpRes.data || []);
    if (!trkRes.error) setTrackingPuntos(trkRes.data || []);
    if (!chatRes.error) setChatMensajes(chatRes.data || []);
    if (!bitRes.error) setBitacora(bitRes.data || []);
    if (!cuadRes.error) setCuadrillas(cuadRes.data || []);
    if (!triRes.error) setTriages(triRes.data || []);
    setLoadingDetalle(false);
  };

  const enfocarOperativo = async (op) => {
    setSelectedOp(op);
    setTabTactico('despliegue');
    if (op.latitud && op.longitud && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [Number(op.latitud), Number(op.longitud)],
        13
      );
    }

    if (op.codigo_invitacion) {
      const urlInv = `${window.location.origin}/operativo-invitado/${op.codigo_invitacion}`;
      try {
        const dataUrl = await QRCode.toDataURL(urlInv, { width: 220, margin: 1 });
        setQrDataUrl(dataUrl);
      } catch {
        setQrDataUrl('');
      }
    }

    cargarDetalleOperativo(op);
  };

  // Trakeo GPS continuo en terreno (Voluntario / Postulante / Mando)
  const toggleTracking = () => {
    if (!selectedOp) {
      alert('Abre primero la Sala Táctica del operativo donde estás desplegado.');
      return;
    }

    if (trackingActivo) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setTrackingActivo(false);
      return;
    }

    if (!navigator.geolocation) {
      alert('Tu navegador o dispositivo no soporta geolocalización GPS.');
      return;
    }

    setTrackingActivo(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUltimaPos({ lat, lng });

        const registroGps = {
          operativo_id: selectedOp.id,
          perfil_id: profile.id,
          latitud: lat,
          longitud: lng,
          precision_metros: pos.coords.accuracy,
          capturado_en: new Date().toISOString(),
        };

        if (navigator.onLine) {
          const { error } = await supabase
            .from('operativo_tracking')
            .insert([registroGps]);
          if (error) {
            guardarEnColaOffline({ clase: 'tracking', payload: registroGps });
          } else {
            setTrackingPuntos((prev) => [...prev, registroGps]);
          }
        } else {
          guardarEnColaOffline({ clase: 'tracking', payload: registroGps });
        }
      },
      (err) => console.error('GPS Error:', err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  };

  const togglePmInicial = (id) => {
    setPmInicialIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const handleCrearOperativo = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { data: opCreado, error } = await supabase
      .from('operativos')
      .insert([
        {
          titulo: nuevoOp.titulo.trim(),
          descripcion: nuevoOp.descripcion.trim(),
          tipo_operativo: nuevoOp.tipo_operativo,
          estado: nuevoOp.estado,
          latitud: nuevoOp.latitud ? parseFloat(nuevoOp.latitud) : null,
          longitud: nuevoOp.longitud ? parseFloat(nuevoOp.longitud) : null,
          creado_por: user?.id ?? null,
        },
      ])
      .select()
      .single();

    if (!error && opCreado && pmInicialIds.length > 0) {
      const filasPm = pmInicialIds.slice(0, 5).map((perfilId, idx) => ({
        operativo_id: opCreado.id,
        perfil_id: perfilId,
        turno: `Turno ${idx + 1}`,
        asignado_por: profile?.id || null,
      }));
      await supabase.from('operativo_puesto_mando').insert(filasPm);
    }

    setSaving(false);

    if (!error) {
      setShowModalCrear(false);
      setNuevoOp({
        titulo: '',
        descripcion: '',
        tipo_operativo: 'real',
        estado: 'en_curso',
        latitud: '-36.8201',
        longitud: '-73.0498',
      });
      setPmInicialIds([]);
      fetchDatosBase();
    }
  };

  const handleCambiarEstadoOp = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('operativos')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (!error) {
      setSelectedOp((prev) =>
        prev && prev.id === id ? { ...prev, estado: nuevoEstado } : prev
      );
      fetchDatosBase();
    }
  };

  // Solicitud de unión (Voluntarios y Postulantes)
  const handleSolicitarUnirme = async () => {
    if (!selectedOp || !profile?.id) return;
    const funcionDefault =
      rol === 'postulante' ? 'Oyente / Observador' : 'Búsqueda y Rescate';

    const { error } = await supabase.from('operativo_participantes').insert([
      {
        operativo_id: selectedOp.id,
        perfil_id: profile.id,
        estado: 'solicitado',
        funcion_terreno: funcionDefault,
      },
    ]);

    if (error) {
      setAlertaTactica(error.message);
    } else {
      cargarDetalleOperativo(selectedOp);
    }
  };

  // PM invita o asigna directamente a un Voluntario o Postulante
  const handleAsignarParticipanteDirecto = async (e) => {
    e.preventDefault();
    if (!invitarInternoId || !selectedOp) return;

    const { error } = await supabase.from('operativo_participantes').upsert(
      [
        {
          operativo_id: selectedOp.id,
          perfil_id: invitarInternoId,
          estado: 'autorizado',
          funcion_terreno: invitarFuncion,
          autorizado_por: profile?.id || null,
        },
      ],
      { onConflict: 'operativo_id,perfil_id' }
    );

    if (!error) {
      setInvitarInternoId('');
      cargarDetalleOperativo(selectedOp);
    }
  };

  const handleAutorizarParticipante = async (partId, nuevoEstado) => {
    const { error } = await supabase
      .from('operativo_participantes')
      .update({
        estado: nuevoEstado,
        autorizado_por: profile?.id || null,
      })
      .eq('id', partId);

    if (!error && selectedOp) cargarDetalleOperativo(selectedOp);
  };

  const handleAutorizarInvitadoExterno = async (invId, nuevoEstado) => {
    const { error } = await supabase
      .from('operativo_invitados_externos')
      .update({
        estado: nuevoEstado,
        autorizado_por: profile?.id || null,
      })
      .eq('id', invId);

    if (!error && selectedOp) cargarDetalleOperativo(selectedOp);
  };

  // Puesto de Mando (máx 5)
  const handleAgregarPuestoMando = async (e) => {
    e.preventDefault();
    setAlertaTactica('');
    if (!nuevoPmId || !selectedOp) return;

    if (puestoMando.length >= 5) {
      setAlertaTactica(
        'Límite alcanzado: cada operativo admite máximo 5 usuarios en Puesto de Mando.'
      );
      return;
    }

    const { error } = await supabase.from('operativo_puesto_mando').insert([
      {
        operativo_id: selectedOp.id,
        perfil_id: nuevoPmId,
        turno: nuevoPmTurno.trim() || 'Turno Guardia',
        asignado_por: profile?.id || null,
      },
    ]);

    if (error) {
      setAlertaTactica(error.message);
    } else {
      setNuevoPmId('');
      cargarDetalleOperativo(selectedOp);
    }
  };

  const handleQuitarPuestoMando = async (pmId) => {
    const { error } = await supabase
      .from('operativo_puesto_mando')
      .delete()
      .eq('id', pmId);
    if (!error && selectedOp) cargarDetalleOperativo(selectedOp);
  };

  // Puntos Estratégicos (Waypoints)
  const handleCrearWaypoint = async (e) => {
    e.preventDefault();
    if (!nuevoWp.titulo.trim() || !selectedOp) return;

    const coords = ultimaPos || {
      lat: Number(selectedOp.latitud) || -36.8201,
      lng: Number(selectedOp.longitud) || -73.0498,
    };

    const payload = {
      operativo_id: selectedOp.id,
      creado_por: profile.id,
      autor_etiqueta: `${profile.nombre_completo} (BRE)`,
      tipo: nuevoWp.tipo,
      titulo: nuevoWp.titulo.trim(),
      descripcion: nuevoWp.descripcion.trim() || null,
      latitud: coords.lat,
      longitud: coords.lng,
      validado: esPmDeEsteCaso, // Si lo crea el PM queda validado al instante
    };

    if (navigator.onLine) {
      const { error } = await supabase
        .from('operativo_waypoints')
        .insert([payload]);
      if (error) {
        guardarEnColaOffline({ clase: 'waypoint', payload });
      } else {
        cargarDetalleOperativo(selectedOp);
      }
    } else {
      guardarEnColaOffline({ clase: 'waypoint', payload });
    }

    setNuevoWp({ tipo: 'indicio', titulo: '', descripcion: '' });
  };

  const handleValidarWaypoint = async (wpId, estadoVal) => {
    const { error } = await supabase
      .from('operativo_waypoints')
      .update({
        validado: estadoVal,
        validado_por: profile?.id || null,
      })
      .eq('id', wpId);

    if (!error && selectedOp) cargarDetalleOperativo(selectedOp);
  };

  // Chat Táctico + Fotos
  const handleEnviarChat = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() && !fotoChat) return;
    setEnviandoChat(true);

    try {
      let fotoUrl = null;
      if (fotoChat) {
        const ext = fotoChat.name.split('.').pop();
        const filePath = `${selectedOp.id}/${profile.id}_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('operativos')
          .upload(filePath, fotoChat);

        if (!upErr) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('operativos').getPublicUrl(filePath);
          fotoUrl = publicUrl;
        }
      }

      await supabase.from('operativo_chat').insert([
        {
          operativo_id: selectedOp.id,
          perfil_id: profile.id,
          remitente_nombre: profile.nombre_completo,
          remitente_unidad: 'BRE Bío-Bío',
          mensaje: nuevoMensaje.trim() || 'Evidencia fotográfica enviada',
          foto_url: fotoUrl,
          latitud: ultimaPos?.lat || null,
          longitud: ultimaPos?.lng || null,
        },
      ]);

      setNuevoMensaje('');
      setFotoChat(null);
      cargarDetalleOperativo(selectedOp);
    } finally {
      setEnviandoChat(false);
    }
  };

  const handlePromoverChatABitacora = async (msg) => {
    if (!esPmDeEsteCaso || !selectedOp) return;
    await supabase.from('operativo_bitacora').insert([
      {
        operativo_id: selectedOp.id,
        hora_evento: msg.creado_en,
        titulo: `Reporte de ${msg.remitente_nombre} (${msg.remitente_unidad})`,
        detalle: msg.mensaje,
        registrado_por: profile.id,
      },
    ]);
    await supabase
      .from('operativo_chat')
      .update({ en_bitacora: true })
      .eq('id', msg.id);

    cargarDetalleOperativo(selectedOp);
  };

  const handleAgregarBitacora = async (e) => {
    e.preventDefault();
    if (!nuevaEntradaBitacora.titulo.trim() || !selectedOp) return;

    const { error } = await supabase.from('operativo_bitacora').insert([
      {
        operativo_id: selectedOp.id,
        titulo: nuevaEntradaBitacora.titulo.trim(),
        detalle: nuevaEntradaBitacora.detalle.trim(),
        registrado_por: profile.id,
      },
    ]);

    if (!error) {
      setNuevaEntradaBitacora({ titulo: '', detalle: '' });
      cargarDetalleOperativo(selectedOp);
    }
  };

  const exportarBitacoraImprimible = () => {
    if (!selectedOp) return;
    const ventana = window.open('', '_blank');
    if (!ventana) return;

    const filas = bitacora
      .map(
        (b) => `
        <tr>
          <td style="padding:8px;border:1px solid #ccc;">${new Date(
          b.hora_evento
        ).toLocaleString('es-CL')}</td>
          <td style="padding:8px;border:1px solid #ccc;"><strong>${b.titulo
          }</strong></td>
          <td style="padding:8px;border:1px solid #ccc;">${b.detalle}</td>
        </tr>`
      )
      .join('');

    ventana.document.write(`
      <html>
        <head><title>Bitácora Oficial - ${selectedOp.titulo}</title></head>
        <body style="font-family:Arial,sans-serif;padding:30px;color:#111;">
          <h2 style="margin:0;color:#D90429;">O.N.G. BRE BÍO-BÍO · BITÁCORA OFICIAL DE OPERACIONES</h2>
          <p style="margin:4px 0 16px 0;font-size:13px;">
            <strong>Caso:</strong> ${selectedOp.titulo} (${selectedOp.tipo_operativo.toUpperCase()})<br/>
            <strong>Coordenadas Base:</strong> ${selectedOp.latitud}, ${selectedOp.longitud}<br/>
            <strong>Estado:</strong> ${selectedOp.estado.toUpperCase()}
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:#0A0A0A;color:#F2B632;">
                <th style="padding:8px;border:1px solid #ccc;text-align:left;">Fecha / Hora</th>
                <th style="padding:8px;border:1px solid #ccc;text-align:left;">Evento / Origen</th>
                <th style="padding:8px;border:1px solid #ccc;text-align:left;">Detalle Táctico</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  // Cuadrillas y Triage
  const toggleIntegranteCuadrilla = (efectivoId) => {
    setNuevaCuadrilla((prev) => {
      const existe = prev.integrantes_ids.includes(efectivoId);
      return {
        ...prev,
        integrantes_ids: existe
          ? prev.integrantes_ids.filter((id) => id !== efectivoId)
          : [...prev.integrantes_ids, efectivoId],
      };
    });
  };

  const handleCrearCuadrilla = async (e) => {
    e.preventDefault();
    if (!nuevaCuadrilla.nombre_cuadrilla || !nuevaCuadrilla.jefe_cuadrilla_id)
      return;

    const { error } = await supabase.from('operativo_cuadrillas').insert([
      {
        operativo_id: selectedOp.id,
        nombre_cuadrilla: nuevaCuadrilla.nombre_cuadrilla.trim(),
        jefe_cuadrilla_id: nuevaCuadrilla.jefe_cuadrilla_id,
        integrantes_ids: nuevaCuadrilla.integrantes_ids,
      },
    ]);

    if (!error) {
      setNuevaCuadrilla({
        nombre_cuadrilla: '',
        jefe_cuadrilla_id: '',
        integrantes_ids: [],
      });
      cargarDetalleOperativo(selectedOp);
    }
  };

  const handleRegistrarTriage = async (e) => {
    e.preventDefault();
    if (!nuevoTriage.codigo_paciente || !selectedOp) return;

    const { error } = await supabase.from('operativo_triage').insert([
      {
        operativo_id: selectedOp.id,
        codigo_paciente: nuevoTriage.codigo_paciente.trim(),
        nombre_paciente:
          nuevoTriage.nombre_paciente.trim() || 'NN / Sin identificar',
        edad_aprox: nuevoTriage.edad_aprox.trim() || null,
        categoria_triage: nuevoTriage.categoria_triage,
        signos_vitales: nuevoTriage.signos_vitales.trim() || null,
        lesiones_hallazgos: nuevoTriage.lesiones_hallazgos.trim() || null,
        centro_derivacion: nuevoTriage.centro_derivacion.trim() || null,
        registrado_por: profile?.id || null,
      },
    ]);

    if (!error) {
      setNuevoTriage({
        codigo_paciente: '',
        nombre_paciente: '',
        edad_aprox: '',
        categoria_triage: 'amarillo',
        signos_vitales: '',
        lesiones_hallazgos: '',
        centro_derivacion: '',
      });
      cargarDetalleOperativo(selectedOp);
    }
  };

  const efectivosSinPostulantes = efectivos.filter(
    (e) => (e.rol || '').toLowerCase() !== 'postulante'
  );
  const candidatosJC = efectivosSinPostulantes.filter((ef) => {
    const r = (ef.rol || '').toLowerCase();
    const cs = Array.isArray(ef.cargos_operativos) ? ef.cargos_operativos : [];
    return (
      ['superadmin', 'director'].includes(r) ||
      cs.some((c) => ['do', 'dos', 'jc'].includes(c))
    );
  });

  const urlInvitacionActual = selectedOp?.codigo_invitacion
    ? `${window.location.origin}/operativo-invitado/${selectedOp.codigo_invitacion}`
    : '';

  return (
    <DashboardLayout
      title="Central de Mando Táctica"
      subtitle="Operativos reales y simulacros · Trakeo offline · Interoperabilidad QR · Bitácora"
      fullHeight
      actions={
        <div className="flex items-center gap-2">
          <span
            className={`hidden items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase sm:inline-flex ${online
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-900'
              }`}
          >
            {online ? <Wifi size={13} /> : <WifiOff size={13} />}
            {online ? 'Online' : 'Offline'}
          </span>

          {colaOffline.length > 0 && (
            <button
              onClick={sincronizarColaOffline}
              disabled={!online || sincronizando}
              className="inline-flex items-center gap-1 rounded-xl bg-[#F2B632] px-3 py-2 text-[10px] font-black uppercase text-black"
            >
              <RefreshCw
                size={13}
                className={sincronizando ? 'animate-spin' : ''}
              />
              Sincronizar ({colaOffline.length})
            </button>
          )}

          {esMandoGlobal && (
            <button
              onClick={() => setShowModalCrear(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-red-700"
            >
              <Plus size={18} strokeWidth={2.5} /> Nuevo Caso
            </button>
          )}
        </div>
      }
    >
      <div className="flex h-[calc(100vh-73px)] flex-col lg:flex-row">
        {/* Mapa Interactivo */}
        <div className="relative z-10 h-1/2 w-full bg-neutral-200 lg:h-full lg:w-2/3">
          <div ref={mapContainerRef} className="h-full w-full" />
        </div>

        {/* Columna Derecha: Lista de Casos Activos y Simulacros */}
        <div className="h-1/2 w-full overflow-y-auto border-t border-neutral-200 bg-white lg:h-full lg:w-1/3 lg:border-l lg:border-t-0">
          <div className="sticky top-0 z-10 border-b border-neutral-100 bg-neutral-50 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
              <AlertCircle
                size={17}
                strokeWidth={2.5}
                className="text-[#D90429]"
              />
              Operativos y Simulacros ({operativos.length})
            </h2>
          </div>

          <div className="space-y-3 p-4">
            {loading ? (
              <p className="py-8 text-center text-xs font-bold text-neutral-500">
                Cargando casos...
              </p>
            ) : operativos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-10 text-center text-xs font-bold text-neutral-500">
                No hay operativos registrados.
              </div>
            ) : (
              operativos.map((op) => (
                <div
                  key={op.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md"
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${op.tipo_operativo === 'simulacro'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {op.tipo_operativo === 'simulacro'
                        ? 'Simulacro / Ficticio'
                        : 'Emergencia Real'}
                    </span>
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-black uppercase text-neutral-700">
                      {(op.estado || 'pendiente').replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-black text-neutral-900">{op.titulo}</h3>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-neutral-600">
                    {op.descripcion}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5 text-[11px] font-semibold text-neutral-400">
                    <span>
                      {op.creado_en
                        ? new Date(op.creado_en).toLocaleDateString('es-CL')
                        : ''}
                    </span>
                    <button
                      onClick={() => enfocarOperativo(op)}
                      className="rounded-lg bg-[#0A0A0A] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#F2B632] hover:bg-neutral-800"
                    >
                      Entrar a Sala Táctica →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: CREAR OPERATIVO REAL O SIMULACRO */}
      {showModalCrear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-lg font-black uppercase text-neutral-950">
                Crear Operativo o Simulacro
              </h3>
              <button
                onClick={() => setShowModalCrear(false)}
                className="text-neutral-400 hover:text-neutral-800"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleCrearOperativo} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Naturaleza del Caso
                  </label>
                  <select
                    value={nuevoOp.tipo_operativo}
                    onChange={(e) =>
                      setNuevoOp({ ...nuevoOp, tipo_operativo: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase"
                  >
                    <option value="real">Emergencia Real</option>
                    <option value="simulacro">
                      Simulacro / Caso Ficticio
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Estado Inicial
                  </label>
                  <select
                    value={nuevoOp.estado}
                    onChange={(e) =>
                      setNuevoOp({ ...nuevoOp, estado: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase"
                  >
                    <option value="en_curso">En curso</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Título del Operativo
                </label>
                <input
                  type="text"
                  required
                  value={nuevoOp.titulo}
                  onChange={(e) =>
                    setNuevoOp({ ...nuevoOp, titulo: e.target.value })
                  }
                  placeholder="Ej. Búsqueda Extraviado Sector Nonguén"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Descripción y Antecedentes Iniciales
                </label>
                <textarea
                  rows="2"
                  required
                  value={nuevoOp.descripcion}
                  onChange={(e) =>
                    setNuevoOp({ ...nuevoOp, descripcion: e.target.value })
                  }
                  className="w-full resize-none rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Latitud
                  </label>
                  <input
                    type="text"
                    value={nuevoOp.latitud}
                    onChange={(e) =>
                      setNuevoOp({ ...nuevoOp, latitud: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Longitud
                  </label>
                  <input
                    type="text"
                    value={nuevoOp.longitud}
                    onChange={(e) =>
                      setNuevoOp({ ...nuevoOp, longitud: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase text-neutral-900">
                    <Shield size={15} className="text-[#D90429]" />
                    Puesto de Mando (Turnos / Contingencia)
                  </span>
                  <span className="rounded-lg bg-[#0A0A0A] px-2.5 py-0.5 text-[11px] font-black text-[#F2B632]">
                    {pmInicialIds.length} / 5 máx.
                  </span>
                </div>

                <div className="max-h-36 space-y-1.5 overflow-y-auto">
                  {efectivosSinPostulantes.map((ef) => {
                    const seleccionado = pmInicialIds.includes(ef.id);
                    const bloqueado = !seleccionado && pmInicialIds.length >= 5;
                    return (
                      <label
                        key={ef.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-1.5 text-xs font-bold ${seleccionado
                          ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                          : 'border-neutral-200 bg-white text-neutral-700'
                          } ${bloqueado ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            disabled={bloqueado}
                            checked={seleccionado}
                            onChange={() => togglePmInicial(ef.id)}
                          />
                          {ef.nombre_completo}
                        </span>
                        <span className="text-[10px] uppercase opacity-75">
                          {ef.rol}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalCrear(false)}
                  className="rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-black uppercase text-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#D90429] px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-red-700"
                >
                  {saving ? 'Creando...' : 'Activar Caso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SALA TÁCTICA COMPLETA */}
      {selectedOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header Sala Táctica */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 bg-[#0A0A0A] px-5 py-4 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#F2B632] px-2 py-0.5 text-[10px] font-black uppercase text-black">
                    {selectedOp.tipo_operativo === 'simulacro'
                      ? 'Simulacro'
                      : 'Operativo Real'}
                  </span>
                  <span className="text-[11px] font-bold text-neutral-400">
                    Cód. Invitación: {selectedOp.codigo_invitacion}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-black">{selectedOp.titulo}</h3>
              </div>

              <div className="flex items-center gap-2">
                {estoyAutorizadoEnCaso && (
                  <button
                    onClick={toggleTracking}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black uppercase ${trackingActivo
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D90429] text-white'
                      }`}
                  >
                    <Navigation size={15} />
                    {trackingActivo ? 'Trakeo GPS Activo' : 'Iniciar mi Trakeo GPS'}
                  </button>
                )}

                <button
                  onClick={() => setSelectedOp(null)}
                  className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Navegación Interna de la Sala Táctica */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50 px-5 py-2.5">
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    key: 'despliegue',
                    label: `Personal y QR (${participantes.length + invitadosExt.length})`,
                    icon: Users,
                  },
                  {
                    key: 'waypoints',
                    label: `Puntos Estratégicos (${waypoints.length})`,
                    icon: MapPin,
                  },
                  {
                    key: 'chat',
                    label: `Chat y Fotos (${chatMensajes.length})`,
                    icon: MessageSquare,
                  },
                  {
                    key: 'bitacora',
                    label: `Bitácora (${bitacora.length})`,
                    icon: BookOpen,
                  },
                  {
                    key: 'puesto_mando',
                    label: `Puesto Mando (${puestoMando.length}/5)`,
                    icon: Shield,
                  },
                  {
                    key: 'cuadrillas',
                    label: `Cuadrillas JC (${cuadrillas.length})`,
                    icon: Eye,
                  },
                  {
                    key: 'triage',
                    label: `Triage (${triages.length})`,
                    icon: HeartPulse,
                  },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTabTactico(t.key)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black uppercase transition-colors ${tabTactico === t.key
                        ? 'bg-[#0A0A0A] text-[#F2B632]'
                        : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                        }`}
                    >
                      <Icon size={13} strokeWidth={2.5} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {esPmDeEsteCaso && (
                <div className="flex items-center gap-1">
                  {['pendiente', 'en_curso', 'finalizado'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleCambiarEstadoOp(selectedOp.id, st)}
                      className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase ${selectedOp.estado === st
                        ? 'border-[#D90429] bg-[#D90429] text-white'
                        : 'border-neutral-300 bg-white text-neutral-600'
                        }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {alertaTactica && (
              <div className="mx-5 mt-3 rounded-xl border-l-4 border-[#D90429] bg-red-50 p-3 text-xs font-bold text-red-900">
                {alertaTactica}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5">
              {loadingDetalle ? (
                <p className="py-10 text-center text-xs font-bold text-neutral-500">
                  Sincronizando sala táctica...
                </p>
              ) : tabTactico === 'despliegue' ? (
                /* PESTAÑA 1: SOLICITUDES, POSTULANTES/VOLUNTARIOS E INVITADOS QR */
                <div className="space-y-6">
                  {/* Banner de solicitud para voluntarios / postulantes */}
                  {!esPmDeEsteCaso && (
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <div>
                        <h4 className="text-sm font-black text-neutral-950">
                          Participación en este Operativo
                        </h4>
                        <p className="text-xs text-neutral-600">
                          {!miParticipacion
                            ? rol === 'postulante'
                              ? 'Como Postulante puedes solicitar unirte como Oyente o Apoyo Logístico.'
                              : 'Solicita autorización al Puesto de Mando para desplegarte y activar tu trakeo GPS.'
                            : `Estado de tu solicitud: ${miParticipacion.estado.toUpperCase()} (${miParticipacion.funcion_terreno
                            })`}
                        </p>
                      </div>
                      {!miParticipacion && (
                        <button
                          onClick={handleSolicitarUnirme}
                          className="rounded-xl bg-[#D90429] px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-red-700"
                        >
                          Solicitar Unirme al Caso
                        </button>
                      )}
                    </div>
                  )}

                  {/* Tarjeta QR Interoperabilidad Multi-Agencia (Visible para PM / DO / DG / SA) */}
                  {esPmDeEsteCaso && (
                    <div className="grid grid-cols-1 gap-4 rounded-2xl border-2 border-[#0A0A0A] bg-neutral-950 p-5 text-white md:grid-cols-3">
                      <div className="space-y-2 md:col-span-2">
                        <span className="inline-flex items-center gap-1.5 rounded bg-[#F2B632] px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
                          <QrCode size={13} /> Acceso Provisorio Multi-Agencia
                        </span>
                        <h4 className="text-base font-black uppercase">
                          Invitar Unidades Externas (Bomberos, Socorro Andino,
                          Municipios)
                        </h4>
                        <p className="text-xs text-neutral-300">
                          Comparte este enlace o muestra el QR para que
                          rescatistas externos ingresen con Nombre, RUT y
                          Organización. Quedarán en espera hasta que los
                          autorices aquí abajo.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <input
                            type="text"
                            readOnly
                            value={urlInvitacionActual}
                            className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(urlInvitacionActual);
                              setCopiadoLink(true);
                              setTimeout(() => setCopiadoLink(false), 2000);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-4 py-2 text-xs font-black uppercase text-white"
                          >
                            {copiadoLink ? (
                              <>
                                <Check size={14} /> Copiado
                              </>
                            ) : (
                              <>
                                <Copy size={14} /> Copiar Link
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {qrDataUrl && (
                        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-3 text-black">
                          <img
                            src={qrDataUrl}
                            alt="QR Invitación Operativo"
                            className="h-32 w-32"
                          />
                          <span className="mt-1 text-[10px] font-black uppercase">
                            Escanear en Terreno
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Asignación Directa de Voluntarios o Postulantes por PM */}
                  {esPmDeEsteCaso && (
                    <form
                      onSubmit={handleAsignarParticipanteDirecto}
                      className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row"
                    >
                      <select
                        required
                        value={invitarInternoId}
                        onChange={(e) => setInvitarInternoId(e.target.value)}
                        className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                      >
                        <option value="">
                          Invitar / Asignar Voluntario o Postulante BRE...
                        </option>
                        {efectivos.map((ef) => (
                          <option key={ef.id} value={ef.id}>
                            {ef.nombre_completo} ({ef.rol.toUpperCase()})
                          </option>
                        ))}
                      </select>

                      <select
                        value={invitarFuncion}
                        onChange={(e) => setInvitarFuncion(e.target.value)}
                        className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                      >
                        <option value="Búsqueda y Rescate">
                          Búsqueda y Rescate
                        </option>
                        <option value="Oyente / Observador">
                          Oyente / Observador (Postulante)
                        </option>
                        <option value="Apoyo Logístico Base">
                          Apoyo Logístico Base
                        </option>
                        <option value="Instrucción en Terreno">
                          Instrucción en Terreno
                        </option>
                      </select>

                      <button
                        type="submit"
                        className="rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-black uppercase text-[#F2B632]"
                      >
                        Asignar al Caso
                      </button>
                    </form>
                  )}

                  {/* Listado de Efectivos Internos (Voluntarios y Postulantes) */}
                  <div>
                    <h4 className="mb-2 text-xs font-black uppercase text-neutral-700">
                      Efectivos Internos BRE ({participantes.length})
                    </h4>
                    <div className="space-y-2">
                      {participantes.map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white p-3 text-xs"
                        >
                          <div>
                            <span className="font-black text-neutral-900">
                              {p.perfiles?.nombre_completo}
                            </span>{' '}
                            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-black uppercase">
                              {p.perfiles?.rol} · {p.funcion_terreno}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${p.estado === 'autorizado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                                }`}
                            >
                              {p.estado}
                            </span>
                            {esPmDeEsteCaso && p.estado === 'solicitado' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleAutorizarParticipante(
                                      p.id,
                                      'autorizado'
                                    )
                                  }
                                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase text-white"
                                >
                                  Autorizar
                                </button>
                                <button
                                  onClick={() =>
                                    handleAutorizarParticipante(
                                      p.id,
                                      'rechazado'
                                    )
                                  }
                                  className="rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase text-white"
                                >
                                  Rechazar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Listado de Invitados Provisorios Externos */}
                  <div>
                    <h4 className="mb-2 text-xs font-black uppercase text-neutral-700">
                      Unidades Externas Invitadas vía QR ({invitadosExt.length})
                    </h4>
                    <div className="space-y-2">
                      {invitadosExt.length === 0 ? (
                        <p className="text-xs text-neutral-400">
                          Ninguna unidad externa ha ingresado aún mediante el
                          enlace QR.
                        </p>
                      ) : (
                        invitadosExt.map((inv) => (
                          <div
                            key={inv.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-xs"
                          >
                            <div>
                              <span className="font-black text-neutral-950">
                                {inv.nombre_completo}
                              </span>{' '}
                              <span className="font-semibold text-neutral-600">
                                ({inv.rut})
                              </span>
                              <span className="ml-2 rounded bg-[#0A0A0A] px-2 py-0.5 text-[10px] font-black uppercase text-[#F2B632]">
                                {inv.organizacion}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase text-neutral-700">
                                {inv.estado}
                              </span>
                              {esPmDeEsteCaso && inv.estado === 'pendiente' && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleAutorizarInvitadoExterno(
                                        inv.id,
                                        'autorizado'
                                      )
                                    }
                                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase text-white"
                                  >
                                    Autorizar Acceso
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAutorizarInvitadoExterno(
                                        inv.id,
                                        'rechazado'
                                      )
                                    }
                                    className="rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase text-white"
                                  >
                                    Rechazar
                                  </button>
                                </>
                              )}
                              {esPmDeEsteCaso && inv.estado === 'autorizado' && (
                                <button
                                  onClick={() =>
                                    handleAutorizarInvitadoExterno(
                                      inv.id,
                                      'revocado'
                                    )
                                  }
                                  className="rounded-lg border border-red-300 px-2 py-1 text-[10px] font-black uppercase text-red-700"
                                >
                                  Revocar
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : tabTactico === 'waypoints' ? (
                /* PESTAÑA 2: PUNTOS ESTRATÉGICOS (LKP, ACANTILADO, INDICIO) */
                <div className="space-y-5">
                  {estoyAutorizadoEnCaso && (
                    <form
                      onSubmit={handleCrearWaypoint}
                      className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <h4 className="text-xs font-black uppercase text-neutral-900">
                        Marcar Punto Estratégico en Mapa
                      </h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <select
                          value={nuevoWp.tipo}
                          onChange={(e) =>
                            setNuevoWp({ ...nuevoWp, tipo: e.target.value })
                          }
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                        >
                          {TIPOS_WAYPOINT.map((t) => (
                            <option key={t.key} value={t.key}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          required
                          value={nuevoWp.titulo}
                          onChange={(e) =>
                            setNuevoWp({ ...nuevoWp, titulo: e.target.value })
                          }
                          placeholder="Título (Ej. Acantilado 40m / Huella calzado)"
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold sm:col-span-2"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-xl bg-[#D90429] px-4 py-2 text-xs font-black uppercase text-white"
                      >
                        Registrar Punto
                      </button>
                    </form>
                  )}

                  <div className="space-y-2.5">
                    {waypoints.map((wp) => {
                      const info =
                        TIPOS_WAYPOINT.find((t) => t.key === wp.tipo) ||
                        TIPOS_WAYPOINT[0];
                      return (
                        <div
                          key={wp.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white p-3.5 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="rounded px-2 py-0.5 text-[10px] font-black uppercase text-white"
                                style={{ backgroundColor: info.color }}
                              >
                                {info.label}
                              </span>
                              <span className="font-black text-neutral-950">
                                {wp.titulo}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-neutral-500">
                              Reportado por:{' '}
                              {wp.autor_etiqueta ||
                                wp.perfiles?.nombre_completo}{' '}
                              · ({wp.latitud.toFixed(4)},{' '}
                              {wp.longitud.toFixed(4)})
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${wp.validado
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                                }`}
                            >
                              {wp.validado
                                ? 'Visible para Tropa'
                                : 'Pendiente Validación PM'}
                            </span>

                            {esPmDeEsteCaso && !wp.validado && (
                              <button
                                onClick={() =>
                                  handleValidarWaypoint(wp.id, true)
                                }
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase text-white"
                              >
                                Validar Punto
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : tabTactico === 'chat' ? (
                /* PESTAÑA 3: CHAT TÁCTICO Y EVIDENCIA FOTOGRÁFICA */
                <div className="flex h-[460px] flex-col">
                  <div className="flex-1 space-y-2.5 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                    {chatMensajes.map((msg) => (
                      <div
                        key={msg.id}
                        className="rounded-xl border border-neutral-200 bg-white p-3 text-xs shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-neutral-900">
                            {msg.remitente_nombre}{' '}
                            <span className="text-[#D90429]">
                              [{msg.remitente_unidad}]
                            </span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-neutral-400">
                              {new Date(msg.creado_en).toLocaleTimeString(
                                'es-CL',
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                            </span>
                            {esPmDeEsteCaso && !msg.en_bitacora && (
                              <button
                                onClick={() =>
                                  handlePromoverChatABitacora(msg)
                                }
                                className="rounded bg-[#0A0A0A] px-2 py-0.5 text-[10px] font-black uppercase text-[#F2B632]"
                              >
                                + Bitácora
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-neutral-800">{msg.mensaje}</p>
                        {msg.foto_url && (
                          <a
                            href={msg.foto_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block"
                          >
                            <img
                              src={msg.foto_url}
                              alt="Evidencia terreno"
                              className="max-h-40 rounded-lg border border-neutral-200 object-cover"
                            />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {estoyAutorizadoEnCaso && (
                    <form
                      onSubmit={handleEnviarChat}
                      className="mt-3 flex items-center gap-2"
                    >
                      <label className="cursor-pointer rounded-xl border border-neutral-300 bg-white p-2.5 text-neutral-700 hover:bg-neutral-100">
                        <Camera size={18} />
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) =>
                            setFotoChat(e.target.files?.[0] || null)
                          }
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        placeholder="Escribir reporte táctico o novedad..."
                        className="flex-1 rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-semibold"
                      />
                      <button
                        type="submit"
                        disabled={enviandoChat}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-4 py-2.5 text-xs font-black uppercase text-white"
                      >
                        <Send size={15} /> Enviar
                      </button>
                    </form>
                  )}
                </div>
              ) : tabTactico === 'bitacora' ? (
                /* PESTAÑA 4: BITÁCORA OFICIAL DEL PUESTO DE MANDO */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-neutral-800">
                      Cronología Oficial del Caso
                    </h4>
                    <button
                      onClick={exportarBitacoraImprimible}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3.5 py-2 text-xs font-black uppercase text-[#F2B632]"
                    >
                      <Printer size={15} /> Exportar / Imprimir PDF
                    </button>
                  </div>

                  {esPmDeEsteCaso && (
                    <form
                      onSubmit={handleAgregarBitacora}
                      className="grid grid-cols-1 gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-3"
                    >
                      <input
                        type="text"
                        required
                        value={nuevaEntradaBitacora.titulo}
                        onChange={(e) =>
                          setNuevaEntradaBitacora({
                            ...nuevaEntradaBitacora,
                            titulo: e.target.value,
                          })
                        }
                        placeholder="Hito / Acción (Ej. Despliegue Cuadrilla Alfa)"
                        className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                      />
                      <input
                        type="text"
                        required
                        value={nuevaEntradaBitacora.detalle}
                        onChange={(e) =>
                          setNuevaEntradaBitacora({
                            ...nuevaEntradaBitacora,
                            detalle: e.target.value,
                          })
                        }
                        placeholder="Detalle técnico, sector o novedad..."
                        className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold sm:col-span-2"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-[#D90429] px-4 py-2 text-xs font-black uppercase text-white sm:col-span-3"
                      >
                        Registrar en Bitácora Oficial
                      </button>
                    </form>
                  )}

                  <div className="space-y-2">
                    {bitacora.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-xl border-l-4 border-[#0A0A0A] bg-white p-3.5 shadow-sm text-xs"
                      >
                        <div className="flex justify-between font-black text-neutral-900">
                          <span>{b.titulo}</span>
                          <span className="text-neutral-400">
                            {new Date(b.hora_evento).toLocaleString('es-CL')}
                          </span>
                        </div>
                        <p className="mt-1 text-neutral-700">{b.detalle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : tabTactico === 'puesto_mando' ? (
                /* PESTAÑA 5: PUESTO DE MANDO (MÁX 5) */
                <div className="space-y-4">
                  {esMandoGlobal && puestoMando.length < 5 && (
                    <form
                      onSubmit={handleAgregarPuestoMando}
                      className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row"
                    >
                      <select
                        required
                        value={nuevoPmId}
                        onChange={(e) => setNuevoPmId(e.target.value)}
                        className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                      >
                        <option value="">
                          Asignar efectivo al Puesto de Mando...
                        </option>
                        {efectivosSinPostulantes
                          .filter(
                            (ef) =>
                              !puestoMando.some((pm) => pm.perfil_id === ef.id)
                          )
                          .map((ef) => (
                            <option key={ef.id} value={ef.id}>
                              {ef.nombre_completo}
                            </option>
                          ))}
                      </select>
                      <input
                        type="text"
                        value={nuevoPmTurno}
                        onChange={(e) => setNuevoPmTurno(e.target.value)}
                        placeholder="Turno"
                        className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold sm:w-40"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-black uppercase text-[#F2B632]"
                      >
                        Asignar ({puestoMando.length}/5)
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {puestoMando.map((pm, idx) => (
                      <div
                        key={pm.id}
                        className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3.5"
                      >
                        <div>
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800">
                            PM #{idx + 1} · {pm.turno}
                          </span>
                          <h4 className="mt-1 font-black text-neutral-900">
                            {pm.perfiles?.nombre_completo}
                          </h4>
                        </div>
                        {esMandoGlobal && (
                          <button
                            onClick={() => handleQuitarPuestoMando(pm.id)}
                            className="text-neutral-400 hover:text-[#D90429]"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : tabTactico === 'cuadrillas' ? (
                /* PESTAÑA 6: CUADRILLAS Y ANTECEDENTES MÉDICOS PARA JC */
                <div className="space-y-4">
                  {puedeCrearCuadrilla && (
                    <form
                      onSubmit={handleCrearCuadrilla}
                      className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <input
                          type="text"
                          required
                          value={nuevaCuadrilla.nombre_cuadrilla}
                          onChange={(e) =>
                            setNuevaCuadrilla({
                              ...nuevaCuadrilla,
                              nombre_cuadrilla: e.target.value,
                            })
                          }
                          placeholder="Nombre Cuadrilla (Ej. Alfa)"
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                        />
                        <select
                          required
                          value={nuevaCuadrilla.jefe_cuadrilla_id}
                          onChange={(e) =>
                            setNuevaCuadrilla({
                              ...nuevaCuadrilla,
                              jefe_cuadrilla_id: e.target.value,
                            })
                          }
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                        >
                          <option value="">
                            Jefe de Cuadrilla (JC)...
                          </option>
                          {candidatosJC.map((jc) => (
                            <option key={jc.id} value={jc.id}>
                              {jc.nombre_completo}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {efectivos.map((ef) => {
                          const sel = nuevaCuadrilla.integrantes_ids.includes(
                            ef.id
                          );
                          return (
                            <button
                              key={ef.id}
                              type="button"
                              onClick={() => toggleIntegranteCuadrilla(ef.id)}
                              className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${sel
                                ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F2B632]'
                                : 'border-neutral-300 bg-white text-neutral-700'
                                }`}
                            >
                              {ef.nombre_completo}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="submit"
                        className="rounded-xl bg-[#D90429] px-4 py-2 text-xs font-black uppercase text-white"
                      >
                        Crear Cuadrilla
                      </button>
                    </form>
                  )}

                  {cuadrillas.map((cuad) => {
                    const jefe = efectivos.find(
                      (e) => e.id === cuad.jefe_cuadrilla_id
                    );
                    const integrantes = efectivos.filter((e) =>
                      (cuad.integrantes_ids || []).includes(e.id)
                    );
                    const puedeVerFicha =
                      profile?.id === cuad.jefe_cuadrilla_id || esPmDeEsteCaso;
                    const abierto = cuadrillaAntecedentesId === cuad.id;

                    return (
                      <div
                        key={cuad.id}
                        className="rounded-xl border border-neutral-200 bg-white p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-black text-neutral-950">
                              {cuad.nombre_cuadrilla}
                            </h4>
                            <p className="text-xs text-neutral-600">
                              JC: {jefe?.nombre_completo} · {integrantes.length}{' '}
                              efectivos
                            </p>
                          </div>
                          {puedeVerFicha && (
                            <button
                              onClick={() =>
                                setCuadrillaAntecedentesId(
                                  abierto ? null : cuad.id
                                )
                              }
                              className="rounded-xl bg-[#0A0A0A] px-3 py-1.5 text-xs font-black uppercase text-[#F2B632]"
                            >
                              {abierto ? 'Ocultar' : 'Antecedentes Médicos'}
                            </button>
                          )}
                        </div>

                        {abierto && puedeVerFicha && (
                          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-neutral-100 pt-3 sm:grid-cols-2">
                            {integrantes.map((intg) => (
                              <div
                                key={intg.id}
                                className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs"
                              >
                                <p className="font-black">
                                  {intg.nombre_completo} · Sangre:{' '}
                                  {intg.tipo_sangre || 'N/R'}
                                </p>
                                <p className="text-red-800">
                                  Alergias: {intg.alergias || 'Ninguna'}
                                </p>
                                <p className="font-bold">
                                  <PhoneCall size={11} className="inline mr-1" />
                                  {intg.contacto_emergencia_nombre || 'N/R'}:{' '}
                                  {intg.contacto_emergencia_telefono || 'N/R'}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* PESTAÑA 7: TRIAGE MÉDICO PREHOSPITALARIO */
                <div className="space-y-4">
                  {puedeRegistrarTriage && (
                    <form
                      onSubmit={handleRegistrarTriage}
                      className="space-y-2 rounded-2xl border border-red-200 bg-red-50/40 p-4"
                    >
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                        <input
                          type="text"
                          required
                          value={nuevoTriage.codigo_paciente}
                          onChange={(e) =>
                            setNuevoTriage({
                              ...nuevoTriage,
                              codigo_paciente: e.target.value,
                            })
                          }
                          placeholder="Cód. Tarjeta (T-01)"
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={nuevoTriage.nombre_paciente}
                          onChange={(e) =>
                            setNuevoTriage({
                              ...nuevoTriage,
                              nombre_paciente: e.target.value,
                            })
                          }
                          placeholder="Nombre o NN"
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs"
                        />
                        <input
                          type="text"
                          value={nuevoTriage.edad_aprox}
                          onChange={(e) =>
                            setNuevoTriage({
                              ...nuevoTriage,
                              edad_aprox: e.target.value,
                            })
                          }
                          placeholder="Edad aprox."
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs"
                        />
                        <select
                          value={nuevoTriage.categoria_triage}
                          onChange={(e) =>
                            setNuevoTriage({
                              ...nuevoTriage,
                              categoria_triage: e.target.value,
                            })
                          }
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase"
                        >
                          <option value="verde">VERDE</option>
                          <option value="amarillo">AMARILLO</option>
                          <option value="rojo">ROJO</option>
                          <option value="negro">NEGRO</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <input
                          type="text"
                          value={nuevoTriage.signos_vitales}
                          onChange={(e) =>
                            setNuevoTriage({
                              ...nuevoTriage,
                              signos_vitales: e.target.value,
                            })
                          }
                          placeholder="Signos vitales"
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs"
                        />
                        <input
                          type="text"
                          value={nuevoTriage.lesiones_hallazgos}
                          onChange={(e) =>
                            setNuevoTriage({
                              ...nuevoTriage,
                              lesiones_hallazgos: e.target.value,
                            })
                          }
                          placeholder="Hallazgos"
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs"
                        />
                        <input
                          type="text"
                          value={nuevoTriage.centro_derivacion}
                          onChange={(e) =>
                            setNuevoTriage({
                              ...nuevoTriage,
                              centro_derivacion: e.target.value,
                            })
                          }
                          placeholder="Derivación"
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-xl bg-[#D90429] px-4 py-2 text-xs font-black uppercase text-white"
                      >
                        Guardar Caso Triage
                      </button>
                    </form>
                  )}

                  {triages.map((tri) => {
                    const st =
                      TRIAGE_ESTILOS[tri.categoria_triage] ||
                      TRIAGE_ESTILOS.amarillo;
                    return (
                      <div
                        key={tri.id}
                        className="rounded-xl border border-neutral-200 bg-white p-3.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black">
                            [{tri.codigo_paciente}] {tri.nombre_paciente}
                          </span>
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-black uppercase ${st.badge}`}
                          >
                            {st.label}
                          </span>
                        </div>
                        <p className="mt-1 text-neutral-600">
                          Signos: {tri.signos_vitales || 'N/R'} · Hallazgos:{' '}
                          {tri.lesiones_hallazgos || 'N/R'} · Derivación:{' '}
                          {tri.centro_derivacion || 'N/R'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}