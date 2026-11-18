import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import {
  MapPin,
  Plus,
  AlertCircle,
  X,
  Shield,
  Users,
  HeartPulse,
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
  Search,
  Layers,
  Upload,
  Download,
  ChevronUp,
  ChevronDown,
  RotateCcw,
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

const EQUIPOS_GEOMETRIA = [
  { key: 'terrestre', label: 'Búsqueda Terrestre', color: '#D90429' },
  { key: 'drone', label: 'Equipo Drone / RPAS', color: '#2563EB' },
  { key: 'acuatico', label: 'Equipo Acuático / Buceo', color: '#0891B2' },
  { key: 'k9', label: 'Unidad Canina K9', color: '#7C3AED' },
];

function obtenerBadgeOperativo(efectivo) {
  const rol = (efectivo?.rol || 'voluntario').toLowerCase();
  const cargos = Array.isArray(efectivo?.cargos_operativos)
    ? efectivo.cargos_operativos.map((c) => c.toLowerCase())
    : [];

  if (rol === 'superadmin') return { sigla: 'SA', color: '#0A0A0A', texto: '#F2B632' };
  if (rol === 'director') return { sigla: 'DG', color: '#991B1B', texto: '#FFFFFF' };
  if (cargos.includes('do')) return { sigla: 'DO', color: '#D90429', texto: '#FFFFFF' };
  if (cargos.includes('dos')) return { sigla: 'DOs', color: '#EA580C', texto: '#FFFFFF' };
  if (cargos.includes('jc')) return { sigla: 'JC', color: '#1D4ED8', texto: '#FFFFFF' };
  if (cargos.includes('lem')) return { sigla: 'LEM', color: '#047857', texto: '#FFFFFF' };
  if (cargos.includes('prehospitalario'))
    return { sigla: 'PREH', color: '#059669', texto: '#FFFFFF' };
  if (cargos.includes('instructor'))
    return { sigla: 'INST', color: '#6D28D9', texto: '#FFFFFF' };

  const partes = (efectivo?.nombre_completo || 'VB').trim().split(/\s+/);
  const iniciales =
    partes.length >= 2
      ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
      : (partes[0] || 'VB').slice(0, 2).toUpperCase();

  return { sigla: iniciales, color: '#1F2937', texto: '#FFFFFF' };
}

export default function CentralMando() {
  const { user, profile } = useAuth();
  const [operativos, setOperativos] = useState([]);
  const [efectivos, setEfectivos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapa Leaflet Principal
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const drawLayerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentTimestampRef = useRef(0);

  // Mini-Mapa dentro del Modal de Crear Operativo
  const modalMapContainerRef = useRef(null);
  const modalMapInstanceRef = useRef(null);
  const modalMarkerRef = useRef(null);
  const [busquedaModal, setBusquedaModal] = useState('');
  const [resultadosModal, setResultadosModal] = useState([]);
  const [buscandoModal, setBuscandoModal] = useState(false);

  // Buscador de direcciones en Mapa Principal
  const [busquedaMapa, setBusquedaMapa] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscandoDir, setBuscandoDir] = useState(false);

  // Herramienta interactiva sobre el mapa ('navegar' | 'pinchar_wp' | 'dibujar_linea' | 'dibujar_poligono')
  const [modoMapa, setModoMapa] = useState('navegar');
  const [puntosDibujo, setPuntosDibujo] = useState([]);
  const [coordenadasPinchadas, setCoordenadasPinchadas] = useState(null);
  const [geometrias, setGeometrias] = useState([]);
  const [formGeometria, setFormGeometria] = useState({
    titulo: '',
    equipo_especialidad: 'drone',
    altura_o_profundidad: '',
    observaciones: '',
  });
  const [importandoKml, setImportandoKml] = useState(false);

  // Trakeo GPS Offline del usuario actual (6s online / 20s offline)
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
    latitud: '-36.82010',
    longitud: '-73.04980',
  });
  const [pmInicialIds, setPmInicialIds] = useState([]);

  // Sala Táctica (Panel Lateral Izquierdo en PC / Desplegable en Móvil)
  const [selectedOp, setSelectedOp] = useState(null);
  const [tabTactico, setTabTactico] = useState('despliegue');
  const [chatAbiertoMovil, setChatAbiertoMovil] = useState(false);
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

  // Ordenamiento inteligente de casos
  const operativosOrdenados = useMemo(() => {
    const cuatroDiasMs = 4 * 24 * 60 * 60 * 1000;
    const ahora = Date.now();

    return [...operativos].sort((a, b) => {
      const aFin = a.estado === 'finalizado';
      const bFin = b.estado === 'finalizado';
      if (aFin !== bFin) return aFin ? 1 : -1;

      const tA = new Date(a.creado_en || 0).getTime();
      const tB = new Date(b.creado_en || 0).getTime();
      const aAntiguo = ahora - tA > cuatroDiasMs;
      const bAntiguo = ahora - tB > cuatroDiasMs;

      if (aAntiguo !== bAntiguo) return aAntiguo ? 1 : -1;
      return tB - tA;
    });
  }, [operativos]);

  // Submenús adaptativos según el perfil
  const tabsDisponibles = useMemo(() => {
    const todos = [
      {
        key: 'despliegue',
        label: `Personal (${participantes.length + invitadosExt.length})`,
        icon: Users,
        visible: true,
      },
      {
        key: 'waypoints',
        label: `Puntos (${waypoints.length})`,
        icon: MapPin,
        visible: true,
      },
      {
        key: 'geometrias',
        label: `Polígonos/KML (${geometrias.length})`,
        icon: Layers,
        visible: true,
      },
      {
        key: 'triage',
        label: `Triage (${triages.length})`,
        icon: HeartPulse,
        visible: esPmDeEsteCaso || esLEM || esPrehosp,
      },
      {
        key: 'cuadrillas',
        label: `Cuadrillas (${cuadrillas.length})`,
        icon: Eye,
        visible: esPmDeEsteCaso || esJC || !esPrehosp,
      },
      {
        key: 'bitacora',
        label: `Bitácora (${bitacora.length})`,
        icon: BookOpen,
        visible: esPmDeEsteCaso || !esPrehosp,
      },
      {
        key: 'puesto_mando',
        label: `PM (${puestoMando.length}/5)`,
        icon: Shield,
        visible: esPmDeEsteCaso,
      },
      {
        key: 'chat',
        label: `Chat (${chatMensajes.length})`,
        icon: MessageSquare,
        visible: true,
      },
    ];
    return todos.filter((t) => t.visible);
  }, [
    participantes.length,
    invitadosExt.length,
    waypoints.length,
    geometrias.length,
    triages.length,
    cuadrillas.length,
    bitacora.length,
    puestoMando.length,
    chatMensajes.length,
    esPmDeEsteCaso,
    esLEM,
    esPrehosp,
    esJC,
  ]);

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

  // ============================================================================
  // MINI-MAPA INTERACTIVO DENTRO DEL MODAL "CREAR OPERATIVO O SIMULACRO"
  // ============================================================================
  useEffect(() => {
    if (!showModalCrear) {
      if (modalMapInstanceRef.current) {
        modalMapInstanceRef.current.remove();
        modalMapInstanceRef.current = null;
        modalMarkerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!modalMapContainerRef.current || modalMapInstanceRef.current) return;

      const latIni = parseFloat(nuevoOp.latitud) || -36.8201;
      const lngIni = parseFloat(nuevoOp.longitud) || -73.0498;

      const mMap = L.map(modalMapContainerRef.current).setView(
        [latIni, lngIni],
        11
      );

      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap',
        maxZoom: 17,
      }).addTo(mMap);

      const iconoPunto = L.divIcon({
        className: 'bre-modal-pin',
        html: `<div style="width:24px;height:24px;border-radius:9999px;background:#D90429;border:3px solid #FFFFFF;box-shadow:0 3px 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;border-radius:9999px;background:#F2B632;"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([latIni, lngIni], {
        draggable: true,
        icon: iconoPunto,
      }).addTo(mMap);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setNuevoOp((prev) => ({
          ...prev,
          latitud: pos.lat.toFixed(5),
          longitud: pos.lng.toFixed(5),
        }));
      });

      mMap.on('click', (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        marker.setLatLng([lat, lng]);
        setNuevoOp((prev) => ({
          ...prev,
          latitud: lat.toFixed(5),
          longitud: lng.toFixed(5),
        }));
      });

      modalMapInstanceRef.current = mMap;
      modalMarkerRef.current = marker;
      mMap.invalidateSize();
    }, 150);

    return () => clearTimeout(timer);
  }, [showModalCrear]);

  // Sincronizar marcador del modal si el usuario edita manualmente los inputs de Latitud/Longitud
  useEffect(() => {
    if (!showModalCrear || !modalMapInstanceRef.current || !modalMarkerRef.current)
      return;
    const lat = parseFloat(nuevoOp.latitud);
    const lng = parseFloat(nuevoOp.longitud);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      modalMarkerRef.current.setLatLng([lat, lng]);
      modalMapInstanceRef.current.panTo([lat, lng]);
    }
  }, [nuevoOp.latitud, nuevoOp.longitud, showModalCrear]);

  const handleBuscarDireccionModal = async (e) => {
    e.preventDefault();
    const q = busquedaModal.trim();
    if (!q) return;

    const matchCoords = q.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
    if (matchCoords) {
      const lat = parseFloat(matchCoords[1]).toFixed(5);
      const lng = parseFloat(matchCoords[2]).toFixed(5);
      setNuevoOp((prev) => ({ ...prev, latitud: lat, longitud: lng }));
      if (modalMapInstanceRef.current) {
        modalMapInstanceRef.current.setView([parseFloat(lat), parseFloat(lng)], 14);
      }
      setResultadosModal([]);
      return;
    }

    setBuscandoModal(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=cl&limit=5&q=${encodeURIComponent(
          q
        )}`
      );
      const data = await res.json();
      setResultadosModal(Array.isArray(data) ? data : []);
    } catch {
      setResultadosModal([]);
    } finally {
      setBuscandoModal(false);
    }
  };

  // ============================================================================
  // INICIALIZAR MAPA PRINCIPAL CON CURVAS DE NIVEL TOPOGRÁFICAS
  // ============================================================================
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([-36.8201, -73.0498], 9);

    const capaTopografica = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenTopoMap (Curvas de Nivel) · O.N.G. BRE Bío-Bío',
        maxZoom: 17,
      }
    );

    const capaCalles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap · O.N.G. BRE Bío-Bío',
        maxZoom: 19,
      }
    );

    capaTopografica.addTo(map);
    L.control
      .layers(
        { 'Topográfico (Curvas de Nivel)': capaTopografica, 'Mapa Calles': capaCalles },
        null,
        { position: 'bottomright' }
      )
      .addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    drawLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => mapInstanceRef.current.invalidateSize(), 260);
    }
  }, [selectedOp]);

  // Interacción directa con el mapa principal (Pinchar punto / Dibujar línea o polígono)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (!selectedOp) return;
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));

      if (modoMapa === 'pinchar_wp') {
        setCoordenadasPinchadas({ lat, lng });
        setTabTactico('waypoints');
      } else if (modoMapa === 'dibujar_linea' || modoMapa === 'dibujar_poligono') {
        setPuntosDibujo((prev) => [...prev, [lat, lng]]);
        setTabTactico('geometrias');
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [selectedOp, modoMapa]);

  // Previsualización de trazos en curso sobre drawLayerRef
  useEffect(() => {
    const layer = drawLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (coordenadasPinchadas) {
      L.circleMarker([coordenadasPinchadas.lat, coordenadasPinchadas.lng], {
        radius: 10,
        color: '#D90429',
        fillColor: '#F2B632',
        fillOpacity: 0.95,
        weight: 3,
      })
        .bindTooltip('Punto seleccionado en mapa', { permanent: true })
        .addTo(layer);
    }

    if (puntosDibujo.length > 0) {
      puntosDibujo.forEach((pt, i) => {
        L.circleMarker(pt, {
          radius: 5,
          color: '#0A0A0A',
          fillColor: '#F2B632',
          fillOpacity: 1,
        })
          .bindTooltip(`Vértice ${i + 1}`)
          .addTo(layer);
      });

      if (modoMapa === 'dibujar_poligono' && puntosDibujo.length >= 3) {
        L.polygon(puntosDibujo, {
          color: '#2563EB',
          fillColor: '#2563EB',
          fillOpacity: 0.25,
          dashArray: '6, 6',
        }).addTo(layer);
      } else if (puntosDibujo.length >= 2) {
        L.polyline(puntosDibujo, {
          color: '#2563EB',
          weight: 4,
          dashArray: '6, 6',
        }).addTo(layer);
      }
    }
  }, [coordenadasPinchadas, puntosDibujo, modoMapa]);

  // Dibujar en el mapa: Salas abiertas + Waypoints + Polígonos/Líneas + Voluntarios en tiempo real
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    const iconoEmergencia = L.divIcon({
      className: 'bre-marker-caso',
      html: `<div style="width:28px;height:28px;border-radius:9999px;background:#D90429;border:3px solid #FFFFFF;box-shadow:0 4px 12px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;">
        <div style="width:9px;height:9px;border-radius:9999px;background:#F2B632;"></div>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
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
          `<div style="font-family:sans-serif;font-size:12px;">
            <strong>${wp.titulo}</strong><br/>
            <span style="color:#555;">${info.label}</span><br/>
            <small>${wp.descripcion || ''}</small>
          </div>`
        );
        m.addTo(layer);
      });

      geometrias.forEach((geo) => {
        const coords = Array.isArray(geo.coordenadas) ? geo.coordenadas : [];
        if (coords.length === 0) return;

        const meta = geo.metadatos || {};
        const popupHtml = `<div style="font-family:sans-serif;font-size:12px;max-width:220px;">
          <strong style="color:${geo.color || '#D90429'}">${geo.titulo}</strong><br/>
          <span style="text-transform:uppercase;font-size:10px;font-weight:bold;">Equipo: ${geo.equipo_especialidad}</span>
          ${meta.altura_o_profundidad ? `<br/><span>Dato técnico: ${meta.altura_o_profundidad}</span>` : ''}
          ${meta.observaciones ? `<br/><small>${meta.observaciones}</small>` : ''}
        </div>`;

        if (geo.tipo_geometria === 'poligono' && coords.length >= 3) {
          L.polygon(coords, {
            color: geo.color || '#2563EB',
            fillColor: geo.color || '#2563EB',
            fillOpacity: 0.25,
            weight: 3,
          })
            .bindPopup(popupHtml)
            .addTo(layer);
        } else if (coords.length >= 2) {
          L.polyline(coords, {
            color: geo.color || '#059669',
            weight: 4,
            opacity: 0.9,
          })
            .bindPopup(popupHtml)
            .addTo(layer);
        }
      });

      const rutasPorUsuario = {};
      trackingPuntos.forEach((pt) => {
        const key = pt.perfil_id ? `int_${pt.perfil_id}` : `ext_${pt.invitado_id}`;
        if (!rutasPorUsuario[key]) {
          rutasPorUsuario[key] = {
            esExterno: !pt.perfil_id,
            perfilId: pt.perfil_id,
            invitadoId: pt.invitado_id,
            puntos: [],
          };
        }
        rutasPorUsuario[key].puntos.push(pt);
      });

      Object.values(rutasPorUsuario).forEach((grupo) => {
        const coords = grupo.puntos.map((p) => [p.latitud, p.longitud]);
        const ultimo = grupo.puntos[grupo.puntos.length - 1];

        if (coords.length > 1) {
          L.polyline(coords, {
            color: grupo.esExterno ? '#EAB308' : '#059669',
            weight: 3.5,
            opacity: 0.85,
          }).addTo(layer);
        }

        if (ultimo) {
          if (grupo.esExterno) {
            const inv = invitadosExt.find((i) => i.id === grupo.invitadoId);
            const iconoExt = L.divIcon({
              className: 'bre-user-ext',
              html: `<div style="padding:3px 7px;border-radius:9999px;background:#FACC15;color:#0A0A0A;border:2px solid #0A0A0A;font-weight:900;font-size:10px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.4);">
                EXT · ${(inv?.organizacion || 'APOYO').slice(0, 8).toUpperCase()}
              </div>`,
              iconSize: [64, 24],
              iconAnchor: [32, 12],
            });
            L.marker([ultimo.latitud, ultimo.longitud], { icon: iconoExt })
              .bindPopup(
                `<strong>${inv?.nombre_completo || 'Unidad Externa'}</strong><br/>Organización: ${inv?.organizacion || 'Externa'}`
              )
              .addTo(layer);
          } else {
            const ef = efectivos.find((e) => e.id === grupo.perfilId);
            const badge = obtenerBadgeOperativo(ef);
            const iconoVol = L.divIcon({
              className: 'bre-user-int',
              html: `<div style="min-width:30px;height:30px;padding:0 6px;border-radius:9999px;background:${badge.color};color:${badge.texto};border:2.5px solid #FFFFFF;font-weight:900;font-size:11px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.45);">
                ${badge.sigla}
              </div>`,
              iconSize: [34, 34],
              iconAnchor: [17, 17],
            });

            const fotoHtml = ef?.foto_url
              ? `<img src="${ef.foto_url}" style="width:54px;height:62px;object-fit:cover;border-radius:8px;border:1px solid #ccc;" />`
              : '';

            const popupVol = `<div style="display:flex;gap:10px;align-items:center;font-family:sans-serif;min-width:190px;">
              ${fotoHtml}
              <div style="font-size:11px;line-height:1.35;">
                <strong style="font-size:12px;color:#0A0A0A;">${ef?.nombre_completo || 'Voluntario BRE'}</strong><br/>
                <span style="color:#D90429;font-weight:800;">${ef?.codigo_credencial || ''}</span><br/>
                <span>Sangre: <strong>${ef?.tipo_sangre || 'N/R'}</strong></span><br/>
                <span>Tel: ${ef?.telefono || 'N/R'}</span>
              </div>
            </div>`;

            L.marker([ultimo.latitud, ultimo.longitud], { icon: iconoVol })
              .bindPopup(popupVol)
              .addTo(layer);
          }
        }
      });
    }
  }, [operativos, selectedOp, waypoints, geometrias, trackingPuntos, efectivos, invitadosExt]);

  // Suscripción Realtime
  useEffect(() => {
    fetchDatosBase();

    const channel = supabase
      .channel('central_mando_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'operativos' },
        () => fetchDatosBase()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'operativo_tracking' },
        (payload) => {
          if (selectedOp && payload.new.operativo_id === selectedOp.id) {
            setTrackingPuntos((prev) => [...prev, payload.new]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'operativo_waypoints' },
        () => {
          if (selectedOp) cargarDetalleOperativo(selectedOp);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'operativo_geometrias' },
        () => {
          if (selectedOp) cargarDetalleOperativo(selectedOp);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'operativo_chat' },
        (payload) => {
          if (selectedOp && payload.new.operativo_id === selectedOp.id) {
            setChatMensajes((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedOp?.id]);

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
          'id, nombre_completo, rut, rol, cargos_operativos, telefono, tipo_sangre, alergias, contacto_emergencia_nombre, contacto_emergencia_telefono, comuna, codigo_credencial, foto_url, estado_validacion'
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
      geoRes,
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
        .from('operativo_geometrias')
        .select('*')
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
    if (!geoRes.error) setGeometrias(geoRes.data || []);
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
    setModoMapa('navegar');
    setPuntosDibujo([]);
    setCoordenadasPinchadas(null);

    if (op.latitud && op.longitud && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [Number(op.latitud), Number(op.longitud)],
        14
      );
    }

    if (op.codigo_invitacion) {
      const urlInv = `${window.location.origin}/operativo-invitado/${op.codigo_invitacion}`;
      try {
        const dataUrl = await QRCode.toDataURL(urlInv, { width: 200, margin: 1 });
        setQrDataUrl(dataUrl);
      } catch {
        setQrDataUrl('');
      }
    }

    cargarDetalleOperativo(op);
  };

  const handleBuscarDireccion = async (e) => {
    e.preventDefault();
    const q = busquedaMapa.trim();
    if (!q) return;

    const matchCoords = q.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
    if (matchCoords && mapInstanceRef.current) {
      const lat = parseFloat(matchCoords[1]);
      const lng = parseFloat(matchCoords[2]);
      mapInstanceRef.current.setView([lat, lng], 15);
      setCoordenadasPinchadas({ lat, lng });
      setResultadosBusqueda([]);
      return;
    }

    setBuscandoDir(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=cl&limit=5&q=${encodeURIComponent(
          q
        )}`
      );
      const data = await res.json();
      setResultadosBusqueda(Array.isArray(data) ? data : []);
    } catch {
      setResultadosBusqueda([]);
    } finally {
      setBuscandoDir(false);
    }
  };

  const handleGuardarGeometria = async (e) => {
    e.preventDefault();
    if (!selectedOp || puntosDibujo.length < 2) return;

    const eqInfo =
      EQUIPOS_GEOMETRIA.find((eq) => eq.key === formGeometria.equipo_especialidad) ||
      EQUIPOS_GEOMETRIA[0];

    const tipoGeo =
      modoMapa === 'dibujar_poligono' && puntosDibujo.length >= 3
        ? 'poligono'
        : 'linea';

    const { error } = await supabase.from('operativo_geometrias').insert([
      {
        operativo_id: selectedOp.id,
        creado_por: profile.id,
        creado_por_nombre: profile.nombre_completo,
        tipo_geometria: tipoGeo,
        equipo_especialidad: formGeometria.equipo_especialidad,
        titulo: formGeometria.titulo.trim(),
        color: eqInfo.color,
        coordenadas: puntosDibujo,
        metadatos: {
          altura_o_profundidad: formGeometria.altura_o_profundidad.trim(),
          observaciones: formGeometria.observaciones.trim(),
        },
        validado_pm: esPmDeEsteCaso,
      },
    ]);

    if (!error) {
      setPuntosDibujo([]);
      setModoMapa('navegar');
      setFormGeometria({
        titulo: '',
        equipo_especialidad: 'drone',
        altura_o_profundidad: '',
        observaciones: '',
      });
      cargarDetalleOperativo(selectedOp);
    }
  };

  const handleImportarArchivoGeo = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOp) return;

    setImportandoKml(true);
    setAlertaTactica('');

    try {
      let xmlTexto = '';
      const nombreLower = file.name.toLowerCase();

      if (nombreLower.endsWith('.kmz')) {
        const zip = await JSZip.loadAsync(file);
        const kmlEntry = Object.values(zip.files).find((f) =>
          f.name.toLowerCase().endsWith('.kml')
        );
        if (!kmlEntry) throw new Error('El archivo KMZ no contiene un KML válido.');
        xmlTexto = await kmlEntry.async('text');
      } else {
        xmlTexto = await file.text();
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlTexto, 'text/xml');

      const nuevasGeos = [];
      const nuevosWps = [];

      if (nombreLower.endsWith('.gpx')) {
        const wpts = Array.from(xmlDoc.getElementsByTagName('wpt'));
        wpts.forEach((w) => {
          const lat = parseFloat(w.getAttribute('lat'));
          const lon = parseFloat(w.getAttribute('lon'));
          const name =
            w.getElementsByTagName('name')[0]?.textContent || 'Waypoint GPX';
          if (!isNaN(lat) && !isNaN(lon)) {
            nuevosWps.push({
              operativo_id: selectedOp.id,
              creado_por: profile.id,
              autor_etiqueta: `${profile.nombre_completo} (GPX)`,
              tipo: 'observacion',
              titulo: name,
              latitud: lat,
              longitud: lon,
              validado: esPmDeEsteCaso,
            });
          }
        });

        const trksegs = Array.from(xmlDoc.getElementsByTagName('trkseg'));
        trksegs.forEach((seg, idx) => {
          const pts = Array.from(seg.getElementsByTagName('trkpt'))
            .map((pt) => [
              parseFloat(pt.getAttribute('lat')),
              parseFloat(pt.getAttribute('lon')),
            ])
            .filter(([la, lo]) => !isNaN(la) && !isNaN(lo));

          if (pts.length >= 2) {
            nuevasGeos.push({
              operativo_id: selectedOp.id,
              creado_por: profile.id,
              creado_por_nombre: profile.nombre_completo,
              tipo_geometria: 'linea',
              equipo_especialidad: 'terrestre',
              titulo: `${file.name} · Track #${idx + 1}`,
              color: '#059669',
              coordenadas: pts,
              metadatos: { observaciones: 'Importado desde GPX / Geo Tracker' },
              validado_pm: esPmDeEsteCaso,
            });
          }
        });
      } else {
        const placemarks = Array.from(xmlDoc.getElementsByTagName('Placemark'));
        placemarks.forEach((pm, idx) => {
          const nombre =
            pm.getElementsByTagName('name')[0]?.textContent?.trim() ||
            `Elemento KML #${idx + 1}`;
          const desc =
            pm.getElementsByTagName('description')[0]?.textContent?.trim() || '';

          const parseCoordsKml = (str) =>
            str
              .trim()
              .split(/\s+/)
              .map((par) => {
                const [lon, lat] = par.split(',').map(Number);
                return [lat, lon];
              })
              .filter(([la, lo]) => !isNaN(la) && !isNaN(lo));

          const polyNode = pm.getElementsByTagName('Polygon')[0];
          const lineNode = pm.getElementsByTagName('LineString')[0];
          const pointNode = pm.getElementsByTagName('Point')[0];

          if (polyNode) {
            const coordStr =
              polyNode.getElementsByTagName('coordinates')[0]?.textContent || '';
            const pts = parseCoordsKml(coordStr);
            if (pts.length >= 3) {
              nuevasGeos.push({
                operativo_id: selectedOp.id,
                creado_por: profile.id,
                creado_por_nombre: profile.nombre_completo,
                tipo_geometria: 'poligono',
                equipo_especialidad: 'drone',
                titulo: nombre,
                color: '#2563EB',
                coordenadas: pts,
                metadatos: { observaciones: desc || 'Polígono KML/KMZ' },
                validado_pm: esPmDeEsteCaso,
              });
            }
          } else if (lineNode) {
            const coordStr =
              lineNode.getElementsByTagName('coordinates')[0]?.textContent || '';
            const pts = parseCoordsKml(coordStr);
            if (pts.length >= 2) {
              nuevasGeos.push({
                operativo_id: selectedOp.id,
                creado_por: profile.id,
                creado_por_nombre: profile.nombre_completo,
                tipo_geometria: 'linea',
                equipo_especialidad: 'terrestre',
                titulo: nombre,
                color: '#059669',
                coordenadas: pts,
                metadatos: { observaciones: desc || 'Ruta KML/KMZ' },
                validado_pm: esPmDeEsteCaso,
              });
            }
          } else if (pointNode) {
            const coordStr =
              pointNode.getElementsByTagName('coordinates')[0]?.textContent || '';
            const pts = parseCoordsKml(coordStr);
            if (pts.length === 1) {
              nuevosWps.push({
                operativo_id: selectedOp.id,
                creado_por: profile.id,
                autor_etiqueta: `${profile.nombre_completo} (KML)`,
                tipo: 'observacion',
                titulo: nombre,
                descripcion: desc || null,
                latitud: pts[0][0],
                longitud: pts[0][1],
                validado: esPmDeEsteCaso,
              });
            }
          }
        });
      }

      if (nuevasGeos.length > 0) {
        await supabase.from('operativo_geometrias').insert(nuevasGeos);
      }
      if (nuevosWps.length > 0) {
        await supabase.from('operativo_waypoints').insert(nuevosWps);
      }

      if (nuevasGeos.length === 0 && nuevosWps.length === 0) {
        setAlertaTactica(
          'No se encontraron coordenadas válidas dentro del archivo KML/KMZ/GPX.'
        );
      } else {
        cargarDetalleOperativo(selectedOp);
      }
    } catch (err) {
      setAlertaTactica(err.message || 'Error al procesar archivo KML/KMZ/GPX.');
    } finally {
      setImportandoKml(false);
      e.target.value = '';
    }
  };

  const exportarOperativoKML = () => {
    if (!selectedOp) return;

    const placemarksWps = waypoints
      .map(
        (wp) => `
      <Placemark>
        <name><![CDATA[${wp.titulo} (${wp.tipo})]]></name>
        <description><![CDATA[${wp.descripcion || ''}]]></description>
        <Point><coordinates>${wp.longitud},${wp.latitud},0</coordinates></Point>
      </Placemark>`
      )
      .join('');

    const placemarksGeos = geometrias
      .map((geo) => {
        const coordsStr = (geo.coordenadas || [])
          .map(([lat, lng]) => `${lng},${lat},0`)
          .join(' ');
        if (geo.tipo_geometria === 'poligono') {
          return `
          <Placemark>
            <name><![CDATA[${geo.titulo} [${geo.equipo_especialidad.toUpperCase()}]]]></name>
            <Polygon><outerBoundaryIs><LinearRing><coordinates>${coordsStr}</coordinates></LinearRing></outerBoundaryIs></Polygon>
          </Placemark>`;
        }
        return `
        <Placemark>
          <name><![CDATA[${geo.titulo}]]></name>
          <LineString><coordinates>${coordsStr}</coordinates></LineString>
        </Placemark>`;
      })
      .join('');

    const kmlCompleto = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name><![CDATA[BRE Bio-Bio - ${selectedOp.titulo}]]></name>
    ${placemarksWps}
    ${placemarksGeos}
  </Document>
</kml>`;

    const blob = new Blob([kmlCompleto], {
      type: 'application/vnd.google-earth.kml+xml',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BRE_${selectedOp.titulo.replace(/\s+/g, '_')}.kml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTracking = () => {
    if (!selectedOp) return;

    if (trackingActivo) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setTrackingActivo(false);
      return;
    }

    if (!navigator.geolocation) {
      alert('Tu dispositivo no soporta geolocalización GPS.');
      return;
    }

    setTrackingActivo(true);
    lastSentTimestampRef.current = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const ahora = Date.now();
        const intervaloMinimoMs = navigator.onLine ? 6000 : 20000;
        if (ahora - lastSentTimestampRef.current < intervaloMinimoMs) return;
        lastSentTimestampRef.current = ahora;

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
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
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
      setBusquedaModal('');
      setResultadosModal([]);
      setNuevoOp({
        titulo: '',
        descripcion: '',
        tipo_operativo: 'real',
        estado: 'en_curso',
        latitud: '-36.82010',
        longitud: '-73.04980',
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

  const handleCrearWaypoint = async (e) => {
    e.preventDefault();
    if (!nuevoWp.titulo.trim() || !selectedOp) return;

    const coords = coordenadasPinchadas ||
      ultimaPos || {
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
      validado: esPmDeEsteCaso,
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
    setCoordenadasPinchadas(null);
    setModoMapa('navegar');
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
      subtitle="Mapa topográfico en tiempo real · Polígonos KML/KMZ/GPX · Interoperabilidad QR"
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
      <div className="relative flex h-[calc(100vh-73px)] flex-col lg:flex-row">
        {/* PANEL IZQUIERDO: LISTA DE CASOS O SALA TÁCTICA LATERAL */}
        <div className="z-20 flex h-[48%] w-full flex-col border-b border-neutral-200 bg-white lg:h-full lg:w-[440px] lg:shrink-0 lg:border-b-0 lg:border-r">
          {!selectedOp ? (
            <>
              <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
                  <AlertCircle
                    size={17}
                    strokeWidth={2.5}
                    className="text-[#D90429]"
                  />
                  Operativos y Simulacros ({operativosOrdenados.length})
                </h2>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {loading ? (
                  <p className="py-8 text-center text-xs font-bold text-neutral-500">
                    Cargando casos...
                  </p>
                ) : operativosOrdenados.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-10 text-center text-xs font-bold text-neutral-500">
                    No hay operativos registrados.
                  </div>
                ) : (
                  operativosOrdenados.map((op) => {
                    const cerrado = op.estado === 'finalizado';
                    return (
                      <div
                        key={op.id}
                        className={`rounded-xl border p-4 shadow-sm transition-all ${cerrado
                            ? 'border-neutral-200 bg-neutral-50 opacity-80'
                            : 'border-neutral-200 bg-white hover:shadow-md'
                          }`}
                      >
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${op.tipo_operativo === 'simulacro'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {op.tipo_operativo === 'simulacro'
                              ? 'Simulacro'
                              : 'Emergencia Real'}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${cerrado
                                ? 'bg-neutral-200 text-neutral-700'
                                : 'bg-emerald-100 text-emerald-800'
                              }`}
                          >
                            {(op.estado || 'pendiente').replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="font-black text-neutral-900">
                          {op.titulo}
                        </h3>
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
                            {cerrado ? 'Reabrir / Consultar →' : 'Sala Táctica →'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col">
              <div className="bg-[#0A0A0A] px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-[#F2B632] px-1.5 py-0.5 text-[9px] font-black uppercase text-black">
                        {selectedOp.tipo_operativo === 'simulacro'
                          ? 'Simulacro'
                          : 'Real'}
                      </span>
                      <span className="truncate font-mono text-[10px] text-neutral-400">
                        {selectedOp.codigo_invitacion}
                      </span>
                    </div>
                    <h3 className="truncate text-sm font-black">
                      {selectedOp.titulo}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {estoyAutorizadoEnCaso && (
                      <button
                        onClick={toggleTracking}
                        title="Activar/Detener Trakeo GPS en vivo"
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase ${trackingActivo
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#D90429] text-white'
                          }`}
                      >
                        <Navigation size={13} />
                        {trackingActivo ? 'GPS ON' : 'GPS'}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedOp(null);
                        setModoMapa('navegar');
                        setPuntosDibujo([]);
                      }}
                      title="Volver a lista de casos"
                      className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {esPmDeEsteCaso && (
                  <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                    <span className="text-[10px] font-bold uppercase text-neutral-400">
                      Estado del caso:
                    </span>
                    <div className="flex gap-1">
                      {['pendiente', 'en_curso', 'finalizado'].map((st) => (
                        <button
                          key={st}
                          onClick={() =>
                            handleCambiarEstadoOp(selectedOp.id, st)
                          }
                          className={`rounded px-2 py-0.5 text-[9px] font-black uppercase ${selectedOp.estado === st
                              ? 'bg-[#D90429] text-white'
                              : 'bg-white/10 text-neutral-300'
                            }`}
                        >
                          {st === 'finalizado' ? 'Cerrar' : st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Selector Desplegable en Celular + Pestañas Compactas en PC */}
              <div className="border-b border-neutral-200 bg-neutral-50 px-3 py-2">
                <select
                  value={tabTactico}
                  onChange={(e) => setTabTactico(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase text-neutral-900 lg:hidden"
                >
                  {tabsDisponibles.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <div className="hidden flex-wrap gap-1 lg:flex">
                  {tabsDisponibles.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setTabTactico(t.key)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase transition-colors ${tabTactico === t.key
                            ? 'bg-[#0A0A0A] text-[#F2B632]'
                            : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                          }`}
                      >
                        <Icon size={12} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {alertaTactica && (
                <div className="mx-3 mt-2 rounded-lg border-l-4 border-[#D90429] bg-red-50 p-2.5 text-[11px] font-bold text-red-900">
                  {alertaTactica}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-3.5 text-xs">
                {loadingDetalle ? (
                  <p className="py-8 text-center font-bold text-neutral-500">
                    Sincronizando datos tácticos...
                  </p>
                ) : tabTactico === 'despliegue' ? (
                  <div className="space-y-4">
                    {!esPmDeEsteCaso && (
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="font-bold text-neutral-800">
                          {!miParticipacion
                            ? 'Solicita autorización al Puesto de Mando para desplegarte.'
                            : `Estado: ${miParticipacion.estado.toUpperCase()} (${miParticipacion.funcion_terreno})`}
                        </p>
                        {!miParticipacion && (
                          <button
                            onClick={handleSolicitarUnirme}
                            className="mt-2 w-full rounded-lg bg-[#D90429] py-2 text-[11px] font-black uppercase text-white"
                          >
                            Solicitar Unirme al Caso
                          </button>
                        )}
                      </div>
                    )}

                    {esPmDeEsteCaso && (
                      <div className="rounded-xl bg-neutral-950 p-3.5 text-white">
                        <span className="inline-flex items-center gap-1 rounded bg-[#F2B632] px-2 py-0.5 text-[9px] font-black uppercase text-black">
                          <QrCode size={11} /> Interoperabilidad QR Externa
                        </span>
                        <div className="mt-2 flex items-center gap-3">
                          {qrDataUrl && (
                            <img
                              src={qrDataUrl}
                              alt="QR"
                              className="h-20 w-20 shrink-0 rounded-lg bg-white p-1"
                            />
                          )}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <p className="text-[11px] text-neutral-300">
                              Bomberos, Socorro Andino u otras agencias:
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(urlInvitacionActual);
                                setCopiadoLink(true);
                                setTimeout(() => setCopiadoLink(false), 2000);
                              }}
                              className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#D90429] py-1.5 text-[10px] font-black uppercase text-white"
                            >
                              {copiadoLink ? (
                                <>
                                  <Check size={12} /> Link Copiado
                                </>
                              ) : (
                                <>
                                  <Copy size={12} /> Copiar Enlace Invitado
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {esPmDeEsteCaso && (
                      <form
                        onSubmit={handleAsignarParticipanteDirecto}
                        className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                      >
                        <select
                          required
                          value={invitarInternoId}
                          onChange={(e) => setInvitarInternoId(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                        >
                          <option value="">Asignar miembro BRE...</option>
                          {efectivos.map((ef) => (
                            <option key={ef.id} value={ef.id}>
                              {ef.nombre_completo} ({ef.rol.toUpperCase()})
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-1.5">
                          <select
                            value={invitarFuncion}
                            onChange={(e) => setInvitarFuncion(e.target.value)}
                            className="flex-1 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-[11px] font-bold"
                          >
                            <option value="Búsqueda y Rescate">Búsqueda</option>
                            <option value="Equipo Drone">Equipo Drone</option>
                            <option value="Equipo Acuático">Equipo Acuático</option>
                            <option value="Prehospitalario">Prehospitalario</option>
                            <option value="Oyente / Observador">Oyente</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#0A0A0A] px-3 py-1.5 text-[10px] font-black uppercase text-[#F2B632]"
                          >
                            Asignar
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-1.5">
                      <h4 className="font-black uppercase text-neutral-500">
                        Efectivos Internos ({participantes.length})
                      </h4>
                      {participantes.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-lg border border-neutral-200 p-2.5"
                        >
                          <div>
                            <p className="font-black text-neutral-900">
                              {p.perfiles?.nombre_completo}
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              {p.funcion_terreno} · {p.estado}
                            </p>
                          </div>
                          {esPmDeEsteCaso && p.estado === 'solicitado' && (
                            <button
                              onClick={() =>
                                handleAutorizarParticipante(p.id, 'autorizado')
                              }
                              className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-black uppercase text-white"
                            >
                              Autorizar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-black uppercase text-neutral-500">
                        Externos QR ({invitadosExt.length})
                      </h4>
                      {invitadosExt.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-2.5"
                        >
                          <div>
                            <p className="font-black text-neutral-900">
                              {inv.nombre_completo}
                            </p>
                            <p className="text-[10px] font-bold text-amber-900">
                              {inv.organizacion} · {inv.estado}
                            </p>
                          </div>
                          {esPmDeEsteCaso && inv.estado === 'pendiente' && (
                            <button
                              onClick={() =>
                                handleAutorizarInvitadoExterno(
                                  inv.id,
                                  'autorizado'
                                )
                              }
                              className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-black uppercase text-white"
                            >
                              Autorizar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : tabTactico === 'waypoints' ? (
                  <div className="space-y-3">
                    {estoyAutorizadoEnCaso && (
                      <form
                        onSubmit={handleCrearWaypoint}
                        className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black uppercase text-neutral-800">
                            Nuevo Punto Estratégico
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setModoMapa(
                                modoMapa === 'pinchar_wp'
                                  ? 'navegar'
                                  : 'pinchar_wp'
                              )
                            }
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${modoMapa === 'pinchar_wp'
                                ? 'bg-[#F2B632] text-black'
                                : 'bg-[#0A0A0A] text-white'
                              }`}
                          >
                            {modoMapa === 'pinchar_wp'
                              ? 'Haz clic en el mapa...'
                              : 'Pinchar en Mapa'}
                          </button>
                        </div>

                        {coordenadasPinchadas && (
                          <p className="font-mono text-[10px] font-bold text-emerald-700">
                            Coordenada pinchada: {coordenadasPinchadas.lat},{' '}
                            {coordenadasPinchadas.lng}
                          </p>
                        )}

                        <select
                          value={nuevoWp.tipo}
                          onChange={(e) =>
                            setNuevoWp({ ...nuevoWp, tipo: e.target.value })
                          }
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-bold"
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
                          placeholder="Título del punto..."
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-[#D90429] py-2 text-[11px] font-black uppercase text-white"
                        >
                          Guardar Punto en Mapa
                        </button>
                      </form>
                    )}

                    <div className="space-y-2">
                      {waypoints.map((wp) => {
                        const info =
                          TIPOS_WAYPOINT.find((t) => t.key === wp.tipo) ||
                          TIPOS_WAYPOINT[0];
                        return (
                          <div
                            key={wp.id}
                            className="rounded-lg border border-neutral-200 p-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="rounded px-1.5 py-0.5 text-[9px] font-black uppercase text-white"
                                style={{ backgroundColor: info.color }}
                              >
                                {info.label}
                              </span>
                              {esPmDeEsteCaso && !wp.validado && (
                                <button
                                  onClick={() =>
                                    handleValidarWaypoint(wp.id, true)
                                  }
                                  className="rounded bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase text-white"
                                >
                                  Validar
                                </button>
                              )}
                            </div>
                            <p className="mt-1 font-black text-neutral-900">
                              {wp.titulo}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : tabTactico === 'geometrias' ? (
                  <div className="space-y-4">
                    <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <h4 className="font-black uppercase text-neutral-900">
                        Intercambio GPS (Geo Tracker · Google Earth)
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#0A0A0A] px-3 py-2 text-[10px] font-black uppercase text-[#F2B632] hover:bg-neutral-800">
                          <Upload size={13} />
                          <span>
                            {importandoKml
                              ? 'Leyendo...'
                              : 'Subir KML/KMZ/GPX'}
                          </span>
                          <input
                            type="file"
                            accept=".kml,.kmz,.gpx"
                            onChange={handleImportarArchivoGeo}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={exportarOperativoKML}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[10px] font-black uppercase text-neutral-900 hover:bg-neutral-100"
                        >
                          <Download size={13} />
                          <span>Bajar KML Earth</span>
                        </button>
                      </div>
                    </div>

                    {estoyAutorizadoEnCaso && (
                      <div className="space-y-2.5 rounded-xl border border-neutral-200 bg-white p-3">
                        <h4 className="font-black uppercase text-neutral-900">
                          Trazar Sector / Polígono en Mapa
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPuntosDibujo([]);
                              setModoMapa(
                                modoMapa === 'dibujar_poligono'
                                  ? 'navegar'
                                  : 'dibujar_poligono'
                              );
                            }}
                            className={`rounded-lg py-1.5 text-[10px] font-black uppercase ${modoMapa === 'dibujar_poligono'
                                ? 'bg-[#2563EB] text-white'
                                : 'border border-neutral-300 text-neutral-700'
                              }`}
                          >
                            {modoMapa === 'dibujar_poligono'
                              ? 'Pinchando Polígono...'
                              : '+ Polígono Área'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPuntosDibujo([]);
                              setModoMapa(
                                modoMapa === 'dibujar_linea'
                                  ? 'navegar'
                                  : 'dibujar_linea'
                              );
                            }}
                            className={`rounded-lg py-1.5 text-[10px] font-black uppercase ${modoMapa === 'dibujar_linea'
                                ? 'bg-[#059669] text-white'
                                : 'border border-neutral-300 text-neutral-700'
                              }`}
                          >
                            {modoMapa === 'dibujar_linea'
                              ? 'Pinchando Línea...'
                              : '+ Línea Track'}
                          </button>
                        </div>

                        {puntosDibujo.length > 0 && (
                          <form
                            onSubmit={handleGuardarGeometria}
                            className="space-y-2 border-t border-neutral-100 pt-2"
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-blue-700">
                              <span>{puntosDibujo.length} vértices marcados</span>
                              <button
                                type="button"
                                onClick={() => setPuntosDibujo([])}
                                className="inline-flex items-center gap-1 text-red-600"
                              >
                                <RotateCcw size={11} /> Limpiar
                              </button>
                            </div>

                            <select
                              value={formGeometria.equipo_especialidad}
                              onChange={(e) =>
                                setFormGeometria({
                                  ...formGeometria,
                                  equipo_especialidad: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-bold"
                            >
                              {EQUIPOS_GEOMETRIA.map((eq) => (
                                <option key={eq.key} value={eq.key}>
                                  {eq.label}
                                </option>
                              ))}
                            </select>

                            <input
                              type="text"
                              required
                              value={formGeometria.titulo}
                              onChange={(e) =>
                                setFormGeometria({
                                  ...formGeometria,
                                  titulo: e.target.value,
                                })
                              }
                              placeholder="Nombre sector (Ej. Barrido Drone Quebrada Norte)"
                              className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs"
                            />

                            <input
                              type="text"
                              value={formGeometria.altura_o_profundidad}
                              onChange={(e) =>
                                setFormGeometria({
                                  ...formGeometria,
                                  altura_o_profundidad: e.target.value,
                                })
                              }
                              placeholder="Metadato (Ej. Altura 60m / Profundidad 4m)"
                              className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs"
                            />

                            <button
                              type="submit"
                              className="w-full rounded-lg bg-[#D90429] py-2 text-[11px] font-black uppercase text-white"
                            >
                              Guardar Trazo en Mapa
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      {geometrias.map((g) => (
                        <div
                          key={g.id}
                          className="rounded-lg border border-neutral-200 p-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="rounded px-1.5 py-0.5 text-[9px] font-black uppercase text-white"
                              style={{ backgroundColor: g.color }}
                            >
                              {g.equipo_especialidad} · {g.tipo_geometria}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {(g.coordenadas || []).length} pts
                            </span>
                          </div>
                          <p className="mt-1 font-black text-neutral-900">
                            {g.titulo}
                          </p>
                          {g.metadatos?.altura_o_profundidad && (
                            <p className="text-[11px] text-neutral-600">
                              Metadato: {g.metadatos.altura_o_profundidad}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : tabTactico === 'chat' ? (
                  <div className="flex h-full flex-col">
                    <div className="flex-1 space-y-2 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-2.5">
                      {chatMensajes.map((msg) => (
                        <div
                          key={msg.id}
                          className="rounded-lg border border-neutral-200 bg-white p-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-neutral-900">
                              {msg.remitente_nombre}
                            </span>
                            {esPmDeEsteCaso && !msg.en_bitacora && (
                              <button
                                onClick={() => handlePromoverChatABitacora(msg)}
                                className="rounded bg-[#0A0A0A] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#F2B632]"
                              >
                                + Bitácora
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-neutral-700">{msg.mensaje}</p>
                          {msg.foto_url && (
                            <img
                              src={msg.foto_url}
                              alt="Evidencia"
                              className="mt-1.5 max-h-28 rounded object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {estoyAutorizadoEnCaso && (
                      <form
                        onSubmit={handleEnviarChat}
                        className="mt-2 flex items-center gap-1.5"
                      >
                        <label className="cursor-pointer rounded-lg border border-neutral-300 bg-white p-2">
                          <Camera size={15} />
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
                          placeholder="Mensaje táctico..."
                          className="flex-1 rounded-lg border border-neutral-300 px-2.5 py-2 text-xs"
                        />
                        <button
                          type="submit"
                          disabled={enviandoChat}
                          className="rounded-lg bg-[#D90429] p-2 text-white"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    )}
                  </div>
                ) : tabTactico === 'bitacora' ? (
                  <div className="space-y-3">
                    <button
                      onClick={exportarBitacoraImprimible}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0A0A0A] py-2 text-[11px] font-black uppercase text-[#F2B632]"
                    >
                      <Printer size={14} /> Exportar Bitácora PDF
                    </button>

                    {esPmDeEsteCaso && (
                      <form
                        onSubmit={handleAgregarBitacora}
                        className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
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
                          placeholder="Hito..."
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-bold"
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
                          placeholder="Detalle..."
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-[#D90429] py-1.5 text-[11px] font-black uppercase text-white"
                        >
                          Agregar a Bitácora
                        </button>
                      </form>
                    )}

                    <div className="space-y-2">
                      {bitacora.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-lg border-l-4 border-[#0A0A0A] bg-neutral-50 p-2.5"
                        >
                          <p className="font-black text-neutral-900">
                            {b.titulo}
                          </p>
                          <p className="text-neutral-700">{b.detalle}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : tabTactico === 'puesto_mando' ? (
                  <div className="space-y-3">
                    {esMandoGlobal && puestoMando.length < 5 && (
                      <form
                        onSubmit={handleAgregarPuestoMando}
                        className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                      >
                        <select
                          required
                          value={nuevoPmId}
                          onChange={(e) => setNuevoPmId(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                        >
                          <option value="">Asignar a PM ({puestoMando.length}/5)...</option>
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
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-[#0A0A0A] py-1.5 text-[11px] font-black uppercase text-[#F2B632]"
                        >
                          Confirmar PM
                        </button>
                      </form>
                    )}

                    {puestoMando.map((pm, idx) => (
                      <div
                        key={pm.id}
                        className="flex items-center justify-between rounded-lg border border-neutral-200 p-2.5"
                      >
                        <div>
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-800">
                            PM #{idx + 1}
                          </span>
                          <p className="font-black text-neutral-900">
                            {pm.perfiles?.nombre_completo}
                          </p>
                        </div>
                        {esMandoGlobal && (
                          <button
                            onClick={() => handleQuitarPuestoMando(pm.id)}
                            className="text-neutral-400 hover:text-[#D90429]"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : tabTactico === 'cuadrillas' ? (
                  <div className="space-y-3">
                    {puedeCrearCuadrilla && (
                      <form
                        onSubmit={handleCrearCuadrilla}
                        className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                      >
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
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-bold"
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
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                        >
                          <option value="">Jefe de Cuadrilla (JC)...</option>
                          {candidatosJC.map((jc) => (
                            <option key={jc.id} value={jc.id}>
                              {jc.nombre_completo}
                            </option>
                          ))}
                        </select>
                        <div className="flex flex-wrap gap-1">
                          {efectivos.map((ef) => {
                            const sel = nuevaCuadrilla.integrantes_ids.includes(
                              ef.id
                            );
                            return (
                              <button
                                key={ef.id}
                                type="button"
                                onClick={() => toggleIntegranteCuadrilla(ef.id)}
                                className={`rounded border px-2 py-0.5 text-[10px] font-bold ${sel
                                    ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F2B632]'
                                    : 'border-neutral-300 bg-white'
                                  }`}
                              >
                                {ef.nombre_completo}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-[#D90429] py-1.5 text-[11px] font-black uppercase text-white"
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
                          className="rounded-lg border border-neutral-200 p-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-black">{cuad.nombre_cuadrilla}</p>
                              <p className="text-[10px] text-neutral-500">
                                JC: {jefe?.nombre_completo} ({integrantes.length})
                              </p>
                            </div>
                            {puedeVerFicha && (
                              <button
                                onClick={() =>
                                  setCuadrillaAntecedentesId(
                                    abierto ? null : cuad.id
                                  )
                                }
                                className="rounded bg-[#0A0A0A] px-2 py-1 text-[9px] font-black uppercase text-[#F2B632]"
                              >
                                {abierto ? 'Ocultar' : 'Ficha Médica'}
                              </button>
                            )}
                          </div>
                          {abierto && puedeVerFicha && (
                            <div className="mt-2 space-y-1.5 border-t pt-2">
                              {integrantes.map((intg) => (
                                <div
                                  key={intg.id}
                                  className="rounded bg-red-50 p-2 text-[11px]"
                                >
                                  <p className="font-black">
                                    {intg.nombre_completo} · {intg.tipo_sangre || 'N/R'}
                                  </p>
                                  <p className="text-red-800">
                                    Alergias: {intg.alergias || 'Ninguna'}
                                  </p>
                                  <p className="font-bold">
                                    ICE: {intg.contacto_emergencia_nombre}:{' '}
                                    {intg.contacto_emergencia_telefono}
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
                  <div className="space-y-3">
                    {puedeRegistrarTriage && (
                      <form
                        onSubmit={handleRegistrarTriage}
                        className="space-y-2 rounded-xl border border-red-200 bg-red-50/50 p-3"
                      >
                        <div className="grid grid-cols-2 gap-1.5">
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
                            placeholder="Tarjeta (T-01)"
                            className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                          />
                          <select
                            value={nuevoTriage.categoria_triage}
                            onChange={(e) =>
                              setNuevoTriage({
                                ...nuevoTriage,
                                categoria_triage: e.target.value,
                              })
                            }
                            className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-xs font-black uppercase"
                          >
                            <option value="verde">VERDE</option>
                            <option value="amarillo">AMARILLO</option>
                            <option value="rojo">ROJO</option>
                            <option value="negro">NEGRO</option>
                          </select>
                        </div>
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
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          value={nuevoTriage.signos_vitales}
                          onChange={(e) =>
                            setNuevoTriage({
                              ...nuevoTriage,
                              signos_vitales: e.target.value,
                            })
                          }
                          placeholder="Signos vitales / Lesiones"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-[#D90429] py-1.5 text-[11px] font-black uppercase text-white"
                        >
                          Guardar Triage
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
                          className="rounded-lg border border-neutral-200 p-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black">
                              [{tri.codigo_paciente}] {tri.nombre_paciente}
                            </span>
                            <span
                              className={`rounded border px-1.5 py-0.5 text-[9px] font-black uppercase ${st.badge}`}
                            >
                              {tri.categoria_triage}
                            </span>
                          </div>
                          <p className="mt-1 text-neutral-600">
                            {tri.signos_vitales || 'Sin detalle'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CAJÓN INFERIOR COLAPSABLE DE CHAT RÁPIDO EN CELULAR */}
              {selectedOp && tabTactico !== 'chat' && (
                <div className="border-t border-neutral-200 bg-neutral-950 text-white lg:hidden">
                  <button
                    type="button"
                    onClick={() => setChatAbiertoMovil(!chatAbiertoMovil)}
                    className="flex w-full items-center justify-between px-4 py-2 text-[11px] font-black uppercase text-[#F2B632]"
                  >
                    <span className="flex items-center gap-1.5">
                      <MessageSquare size={13} /> Chat Táctico Rápido ({chatMensajes.length})
                    </span>
                    {chatAbiertoMovil ? (
                      <ChevronDown size={15} />
                    ) : (
                      <ChevronUp size={15} />
                    )}
                  </button>

                  {chatAbiertoMovil && (
                    <div className="max-h-44 space-y-2 overflow-y-auto bg-neutral-900 p-3 text-xs">
                      {chatMensajes.slice(-5).map((m) => (
                        <div key={m.id} className="rounded bg-white/10 p-2">
                          <strong className="text-[#F2B632]">
                            {m.remitente_nombre}:
                          </strong>{' '}
                          <span>{m.mensaje}</span>
                        </div>
                      ))}
                      {estoyAutorizadoEnCaso && (
                        <form onSubmit={handleEnviarChat} className="flex gap-1.5">
                          <input
                            type="text"
                            value={nuevoMensaje}
                            onChange={(e) => setNuevoMensaje(e.target.value)}
                            placeholder="Escribir..."
                            className="flex-1 rounded bg-white px-2.5 py-1.5 text-xs text-black"
                          />
                          <button
                            type="submit"
                            className="rounded bg-[#D90429] px-3 py-1.5 text-xs font-black"
                          >
                            Enviar
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PANEL DERECHO: MAPA TOPOGRÁFICO SIEMPRE VISIBLE */}
        <div className="relative z-10 h-[52%] w-full bg-neutral-200 lg:h-full lg:flex-1">
          <div className="absolute left-12 right-3 top-3 z-[450] max-w-md">
            <form
              onSubmit={handleBuscarDireccion}
              className="flex items-center overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-white shadow-xl"
            >
              <input
                type="text"
                value={busquedaMapa}
                onChange={(e) => setBusquedaMapa(e.target.value)}
                placeholder="Buscar dirección, cerro, comuna o lat, lng..."
                className="flex-1 px-3.5 py-2 text-xs font-bold text-neutral-900 outline-none"
              />
              <button
                type="submit"
                disabled={buscandoDir}
                className="bg-[#0A0A0A] px-3.5 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800"
              >
                <Search size={15} />
              </button>
            </form>

            {resultadosBusqueda.length > 0 && (
              <div className="mt-1 overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-xl">
                {resultadosBusqueda.map((r) => (
                  <button
                    key={r.place_id}
                    type="button"
                    onClick={() => {
                      const lat = parseFloat(r.lat);
                      const lng = parseFloat(r.lon);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([lat, lng], 15);
                      }
                      setCoordenadasPinchadas({ lat, lng });
                      setResultadosBusqueda([]);
                    }}
                    className="block w-full border-b border-neutral-100 px-3.5 py-2 text-left text-[11px] font-semibold text-neutral-800 hover:bg-neutral-100"
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-3 z-[450] hidden rounded-xl border border-neutral-300 bg-white/95 px-3 py-2 text-[10px] font-black shadow-lg sm:flex sm:items-center sm:gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D90429]" /> DO / Caso
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1D4ED8]" /> JC / Drone
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#059669]" /> Méd / Track
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full border border-black bg-[#FACC15]" /> Externo QR
            </span>
          </div>

          <div ref={mapContainerRef} className="h-full w-full" />
        </div>
      </div>

      {/* ========================================================================
          MODAL CREAR OPERATIVO CON BUSCADOR Y MINI-MAPA PROPORCIONAL INTERACTIVO
         ======================================================================== */}
      {showModalCrear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
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

              {/* UBICACIÓN GEOREFERENCIADA: BUSCADOR + MINI-MAPA PROPORCIONAL + COORDENADAS */}
              <div className="space-y-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-black uppercase text-neutral-900">
                    <MapPin size={15} className="text-[#D90429]" />
                    Punto Base del Operativo (Busca, pincha en el mapa o ingresa coordenadas)
                  </label>
                </div>

                {/* Buscador dentro del modal */}
                <div className="relative">
                  <div className="flex overflow-hidden rounded-xl border border-neutral-300 bg-white">
                    <input
                      type="text"
                      value={busquedaModal}
                      onChange={(e) => setBusquedaModal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleBuscarDireccionModal(e);
                      }}
                      placeholder="Buscar sector, calle, cerro, río o pegar lat, lng..."
                      className="flex-1 px-3 py-2 text-xs font-semibold outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleBuscarDireccionModal}
                      disabled={buscandoModal}
                      className="bg-[#0A0A0A] px-3.5 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800"
                    >
                      {buscandoModal ? '...' : 'Buscar'}
                    </button>
                  </div>

                  {resultadosModal.length > 0 && (
                    <div className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-xl">
                      {resultadosModal.map((r) => (
                        <button
                          key={r.place_id}
                          type="button"
                          onClick={() => {
                            const lat = parseFloat(r.lat).toFixed(5);
                            const lng = parseFloat(r.lon).toFixed(5);
                            setNuevoOp((prev) => ({
                              ...prev,
                              latitud: lat,
                              longitud: lng,
                            }));
                            if (modalMapInstanceRef.current) {
                              modalMapInstanceRef.current.setView(
                                [parseFloat(lat), parseFloat(lng)],
                                15
                              );
                            }
                            setResultadosModal([]);
                          }}
                          className="block w-full border-b border-neutral-100 px-3 py-2 text-left text-[11px] font-semibold text-neutral-800 hover:bg-neutral-100"
                        >
                          {r.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mini-mapa proporcional al ancho del recuadro */}
                <div className="relative h-60 w-full overflow-hidden rounded-xl border-2 border-[#0A0A0A] shadow-inner">
                  <div
                    ref={modalMapContainerRef}
                    className="h-full w-full"
                  />
                  <span className="pointer-events-none absolute bottom-2 left-2 z-[500] rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-[#F2B632]">
                    Haz clic en el mapa o arrastra el marcador
                  </span>
                </div>

                {/* Campos numéricos sincronizados */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="mb-1 block text-[11px] font-black uppercase text-neutral-600">
                      Latitud
                    </label>
                    <input
                      type="text"
                      value={nuevoOp.latitud}
                      onChange={(e) =>
                        setNuevoOp({ ...nuevoOp, latitud: e.target.value })
                      }
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-black uppercase text-neutral-600">
                      Longitud
                    </label>
                    <input
                      type="text"
                      value={nuevoOp.longitud}
                      onChange={(e) =>
                        setNuevoOp({ ...nuevoOp, longitud: e.target.value })
                      }
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 font-mono text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Puesto de Mando */}
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
                          } ${bloqueado ? 'cursor-not-allowed opacity-40' : ''}`}
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
    </DashboardLayout>
  );
}