import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    ShieldAlert,
    Navigation,
    Wifi,
    WifiOff,
    RefreshCw,
    MapPin,
    Send,
    Camera,
    Clock,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const TIPOS_WAYPOINT = [
    { key: 'indicio', label: 'Indicio / Huella', color: '#D90429' },
    { key: 'acantilado', label: 'Acantilado / Riesgo', color: '#DC2626' },
    { key: 'precaucion', label: 'Precaución', color: '#F59E0B' },
    { key: 'observacion', label: 'Observación', color: '#2563EB' },
    { key: 'ultimo_avistamiento', label: 'Último Avistamiento (LKP)', color: '#7C3AED' },
    { key: 'reunion', label: 'Punto Reunión', color: '#059669' },
];

export default function OperativoInvitado() {
    const { codigo } = useParams();
    const [operativo, setOperativo] = useState(null);
    const [loadingOp, setLoadingOp] = useState(true);
    const [invitado, setInvitado] = useState(null);

    const [formRegistro, setFormRegistro] = useState({
        nombre_completo: '',
        rut: '',
        organizacion: '',
    });
    const [enviandoRegistro, setEnviandoRegistro] = useState(false);

    // Estado Táctico en Terreno
    const [online, setOnline] = useState(navigator.onLine);
    const [trackingActivo, setTrackingActivo] = useState(false);
    const [colaOffline, setColaOffline] = useState([]);
    const [ultimaPos, setUltimaPos] = useState(null);
    const [sincronizando, setSincronizando] = useState(false);

    const [waypoints, setWaypoints] = useState([]);
    const [chatMensajes, setChatMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [fotoChat, setFotoChat] = useState(null);
    const [enviandoChat, setEnviandoChat] = useState(false);

    const [nuevoWp, setNuevoWp] = useState({
        tipo: 'indicio',
        titulo: '',
        descripcion: '',
    });

    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const layerGroupRef = useRef(null);
    const watchIdRef = useRef(null);

    const storageKeySesion = `bre_invitado_sesion_${codigo}`;
    const storageKeyCola = `bre_invitado_cola_${codigo}`;

    // Detectar conexión / desconexión a internet
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

    // Cargar cola offline almacenada en el teléfono
    useEffect(() => {
        try {
            const guardada = JSON.parse(localStorage.getItem(storageKeyCola) || '[]');
            if (Array.isArray(guardada)) setColaOffline(guardada);
        } catch {
            setColaOffline([]);
        }
    }, [storageKeyCola]);

    // Cargar operativo por código QR y recuperar sesión si ya se registró
    useEffect(() => {
        const inicializar = async () => {
            setLoadingOp(true);
            const { data: opData } = await supabase
                .from('operativos')
                .select('*')
                .eq('codigo_invitacion', (codigo || '').toUpperCase())
                .maybeSingle();

            setOperativo(opData || null);

            if (opData) {
                const tokenGuardado = localStorage.getItem(storageKeySesion);
                if (tokenGuardado) {
                    const { data: invData } = await supabase
                        .from('operativo_invitados_externos')
                        .select('*')
                        .eq('operativo_id', opData.id)
                        .eq('token_sesion', tokenGuardado)
                        .maybeSingle();

                    if (invData) setInvitado(invData);
                }
            }
            setLoadingOp(false);
        };

        inicializar();
    }, [codigo, storageKeySesion]);

    // Suscripción en tiempo real al estado de autorización del invitado
    useEffect(() => {
        if (!invitado?.id || !operativo?.id) return;

        const channel = supabase
            .channel(`invitado_${invitado.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'operativo_invitados_externos',
                    filter: `id=eq.${invitado.id}`,
                },
                (payload) => {
                    setInvitado(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [invitado?.id, operativo?.id]);

    // Cargar datos tácticos cuando el invitado ya fue autorizado por el Puesto de Mando
    useEffect(() => {
        if (invitado?.estado !== 'autorizado' || !operativo?.id) return;

        cargarDatosTacticos();

        const chatChannel = supabase
            .channel(`chat_ext_${operativo.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'operativo_chat',
                    filter: `operativo_id=eq.${operativo.id}`,
                },
                () => cargarDatosTacticos()
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'operativo_waypoints',
                    filter: `operativo_id=eq.${operativo.id}`,
                },
                () => cargarDatosTacticos()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(chatChannel);
        };
    }, [invitado?.estado, operativo?.id]);

    const cargarDatosTacticos = async () => {
        if (!operativo?.id || !invitado?.id) return;
        const [wpRes, chatRes] = await Promise.all([
            supabase
                .from('operativo_waypoints')
                .select('*')
                .eq('operativo_id', operativo.id)
                .order('creado_en', { ascending: false }),
            supabase
                .from('operativo_chat')
                .select('*')
                .eq('operativo_id', operativo.id)
                .order('creado_en', { ascending: true })
                .limit(80),
        ]);

        if (!wpRes.error && wpRes.data) {
            // El invitado externo ve los puntos validados por PM + los creados por él mismo
            setWaypoints(
                wpRes.data.filter(
                    (w) => w.validado === true || w.invitado_id === invitado.id
                )
            );
        }
        if (!chatRes.error && chatRes.data) {
            setChatMensajes(chatRes.data);
        }
    };

    // Inicializar Mapa Leaflet cuando está autorizado
    useEffect(() => {
        if (invitado?.estado !== 'autorizado' || !mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const latInicial = operativo?.latitud ? Number(operativo.latitud) : -36.8201;
        const lngInicial = operativo?.longitud ? Number(operativo.longitud) : -73.0498;

        const map = L.map(mapContainerRef.current).setView([latInicial, lngInicial], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap · BRE Bío-Bío',
            maxZoom: 19,
        }).addTo(map);

        layerGroupRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        setTimeout(() => map.invalidateSize(), 250);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [invitado?.estado, operativo]);

    // Dibujar Waypoints y posición actual en el mapa
    useEffect(() => {
        const layer = layerGroupRef.current;
        if (!layer) return;
        layer.clearLayers();

        waypoints.forEach((wp) => {
            const info = TIPOS_WAYPOINT.find((t) => t.key === wp.tipo) || TIPOS_WAYPOINT[0];
            const marker = L.circleMarker([wp.latitud, wp.longitud], {
                radius: 9,
                fillColor: info.color,
                color: '#FFFFFF',
                weight: 2.5,
                fillOpacity: 0.95,
            });
            marker.bindPopup(
                `<strong>${wp.titulo}</strong><br/><small>${info.label}${wp.validado ? ' · VALIDADO PM' : ' · Pendiente PM'
                }</small>`
            );
            marker.addTo(layer);
        });

        if (ultimaPos) {
            L.circleMarker([ultimaPos.lat, ultimaPos.lng], {
                radius: 8,
                fillColor: '#10B981',
                color: '#0A0A0A',
                weight: 2,
                fillOpacity: 1,
            })
                .bindTooltip('Mi ubicación actual')
                .addTo(layer);
        }
    }, [waypoints, ultimaPos]);

    // Sincronizar automáticamente la cola offline al volver internet
    useEffect(() => {
        if (online && colaOffline.length > 0 && invitado?.estado === 'autorizado') {
            sincronizarColaOffline();
        }
    }, [online, colaOffline.length, invitado?.estado]);

    const guardarEnColaOffline = (item) => {
        setColaOffline((prev) => {
            const nueva = [...prev, item];
            localStorage.setItem(storageKeyCola, JSON.stringify(nueva));
            return nueva;
        });
    };

    const sincronizarColaOffline = async () => {
        if (sincronizando || colaOffline.length === 0) return;
        setSincronizando(true);

        try {
            const puntosGps = colaOffline
                .filter((i) => i.clase === 'tracking')
                .map((i) => i.payload);

            if (puntosGps.length > 0) {
                await supabase.from('operativo_tracking').insert(puntosGps);
            }

            const wpsPendientes = colaOffline
                .filter((i) => i.clase === 'waypoint')
                .map((i) => i.payload);

            if (wpsPendientes.length > 0) {
                await supabase.from('operativo_waypoints').insert(wpsPendientes);
            }

            localStorage.removeItem(storageKeyCola);
            setColaOffline([]);
            cargarDatosTacticos();
        } finally {
            setSincronizando(false);
        }
    };

    // Trakeo GPS continuo (online u offline)
    const toggleTracking = () => {
        if (trackingActivo) {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            setTrackingActivo(false);
            return;
        }

        if (!navigator.geolocation) {
            alert('Este dispositivo no soporta geolocalización GPS.');
            return;
        }

        setTrackingActivo(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setUltimaPos({ lat, lng });

                const registroGps = {
                    operativo_id: operativo.id,
                    invitado_id: invitado.id,
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
                    }
                } else {
                    guardarEnColaOffline({ clase: 'tracking', payload: registroGps });
                }
            },
            (err) => {
                console.error('Error GPS:', err);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
    };

    const handleSolicitarIngreso = async (e) => {
        e.preventDefault();
        if (!operativo?.id) return;
        setEnviandoRegistro(true);

        const token =
            crypto.randomUUID?.() ||
            `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const { data, error } = await supabase
            .from('operativo_invitados_externos')
            .insert([
                {
                    operativo_id: operativo.id,
                    token_sesion: token,
                    nombre_completo: formRegistro.nombre_completo.trim(),
                    rut: formRegistro.rut.trim(),
                    organizacion: formRegistro.organizacion.trim(),
                    estado: 'pendiente',
                },
            ])
            .select()
            .single();

        setEnviandoRegistro(false);

        if (!error && data) {
            localStorage.setItem(storageKeySesion, token);
            setInvitado(data);
        }
    };

    const handleMarcarWaypoint = async (e) => {
        e.preventDefault();
        if (!nuevoWp.titulo.trim() || !operativo?.id || !invitado?.id) return;

        const coords = ultimaPos || {
            lat: Number(operativo.latitud) || -36.8201,
            lng: Number(operativo.longitud) || -73.0498,
        };

        const payload = {
            operativo_id: operativo.id,
            invitado_id: invitado.id,
            autor_etiqueta: `${invitado.nombre_completo} (${invitado.organizacion})`,
            tipo: nuevoWp.tipo,
            titulo: nuevoWp.titulo.trim(),
            descripcion: nuevoWp.descripcion.trim() || null,
            latitud: coords.lat,
            longitud: coords.lng,
            validado: false,
        };

        if (navigator.onLine) {
            const { error } = await supabase
                .from('operativo_waypoints')
                .insert([payload]);
            if (error) {
                guardarEnColaOffline({ clase: 'waypoint', payload });
            } else {
                cargarDatosTacticos();
            }
        } else {
            guardarEnColaOffline({ clase: 'waypoint', payload });
        }

        setNuevoWp({ tipo: 'indicio', titulo: '', descripcion: '' });
    };

    const handleEnviarChat = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim() && !fotoChat) return;
        setEnviandoChat(true);

        try {
            let fotoUrl = null;
            if (fotoChat && navigator.onLine) {
                const ext = fotoChat.name.split('.').pop();
                const filePath = `${operativo.id}/ext_${Date.now()}.${ext}`;
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
                    operativo_id: operativo.id,
                    invitado_id: invitado.id,
                    remitente_nombre: invitado.nombre_completo,
                    remitente_unidad: invitado.organizacion,
                    mensaje: nuevoMensaje.trim() || 'Evidencia fotográfica enviada',
                    foto_url: fotoUrl,
                    latitud: ultimaPos?.lat || null,
                    longitud: ultimaPos?.lng || null,
                },
            ]);

            setNuevoMensaje('');
            setFotoChat(null);
            cargarDatosTacticos();
        } finally {
            setEnviandoChat(false);
        }
    };

    if (loadingOp) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-xs font-black uppercase tracking-widest text-white">
                Verificando código táctico...
            </div>
        );
    }

    if (!operativo || !operativo.invitacion_activa || operativo.estado === 'finalizado') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4 text-white">
                <div className="max-w-md rounded-2xl border-2 border-[#D90429] bg-neutral-950 p-8 text-center">
                    <ShieldAlert size={44} className="mx-auto mb-3 text-[#F2B632]" />
                    <h1 className="text-lg font-black uppercase">
                        Enlace Operativo No Disponible
                    </h1>
                    <p className="mt-2 text-xs text-neutral-300">
                        Este operativo ya finalizó o el código de invitación multi-agencia
                        ha sido desactivado por el Puesto de Mando.
                    </p>
                    <Link
                        to="/"
                        className="mt-6 inline-block rounded-xl bg-[#D90429] px-5 py-2.5 text-xs font-black uppercase text-white"
                    >
                        Ir al Portal BRE Bío-Bío
                    </Link>
                </div>
            </div>
        );
    }

    // Pantalla 1: Formulario rápido de ingreso externo
    if (!invitado) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4 py-10 text-white">
                <div className="w-full max-w-md rounded-2xl border-2 border-[#D90429] bg-neutral-950 p-6 shadow-2xl sm:p-8">
                    <div className="mb-6 border-b border-neutral-800 pb-4">
                        <span className="rounded bg-[#F2B632] px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
                            Interoperabilidad Multi-Agencia · {operativo.codigo_invitacion}
                        </span>
                        <h1 className="mt-2 text-xl font-black uppercase">
                            {operativo.titulo}
                        </h1>
                        <p className="mt-1 text-xs text-neutral-400">
                            Acceso provisorio exclusivo para unidades externas de apoyo en
                            terreno. Requiere autorización del Puesto de Mando BRE Bío-Bío.
                        </p>
                    </div>

                    <form onSubmit={handleSolicitarIngreso} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-black uppercase text-neutral-300">
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                required
                                value={formRegistro.nombre_completo}
                                onChange={(e) =>
                                    setFormRegistro({
                                        ...formRegistro,
                                        nombre_completo: e.target.value,
                                    })
                                }
                                placeholder="Ej. Cabo 1° Carlos Muñoz"
                                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-black uppercase text-neutral-300">
                                RUT
                            </label>
                            <input
                                type="text"
                                required
                                value={formRegistro.rut}
                                onChange={(e) =>
                                    setFormRegistro({ ...formRegistro, rut: e.target.value })
                                }
                                placeholder="12.345.678-9"
                                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-black uppercase text-neutral-300">
                                Organización / Unidad a la que pertenece
                            </label>
                            <input
                                type="text"
                                required
                                value={formRegistro.organizacion}
                                onChange={(e) =>
                                    setFormRegistro({
                                        ...formRegistro,
                                        organizacion: e.target.value,
                                    })
                                }
                                placeholder="Ej. Bomberos Concepción / Socorro Andino / GOPE"
                                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={enviandoRegistro}
                            className="w-full rounded-xl bg-[#D90429] py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {enviandoRegistro
                                ? 'Enviando solicitud...'
                                : 'Solicitar Acceso al Puesto de Mando'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Pantalla 2: Sala de espera hasta que el Puesto de Mando autorice
    if (invitado.estado !== 'autorizado') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4 text-white">
                <div className="w-full max-w-md rounded-2xl border-2 border-[#F2B632] bg-neutral-950 p-8 text-center shadow-2xl">
                    {invitado.estado === 'pendiente' ? (
                        <>
                            <Clock size={44} className="mx-auto mb-3 animate-pulse text-[#F2B632]" />
                            <h2 className="text-lg font-black uppercase">
                                Esperando Autorización de Puesto de Mando
                            </h2>
                            <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                                Hola <strong>{invitado.nombre_completo}</strong> ({invitado.organizacion}).
                                Tu solicitud ya llegó al Puesto de Mando de <strong>{operativo.titulo}</strong>.
                                Esta pantalla se habilitará automáticamente apenas seas autorizado.
                            </p>
                        </>
                    ) : (
                        <>
                            <XCircle size={44} className="mx-auto mb-3 text-[#D90429]" />
                            <h2 className="text-lg font-black uppercase">
                                Acceso Provisorio No Autorizado
                            </h2>
                            <p className="mt-2 text-xs text-neutral-400">
                                El Puesto de Mando ha cerrado o rechazado esta solicitud de
                                acceso externo.
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Pantalla 3: Sala Táctica Provisoria Autorizada
    return (
        <div className="flex min-h-screen flex-col bg-neutral-100 font-sans">
            {/* Cabecera Táctica Provisoria */}
            <header className="bg-[#0A0A0A] px-4 py-3 text-white shadow-md">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
                    <div>
                        <span className="rounded bg-[#F2B632] px-2 py-0.5 text-[10px] font-black uppercase text-black">
                            Unidad Externa · {invitado.organizacion}
                        </span>
                        <h1 className="text-sm font-black uppercase sm:text-base">
                            {operativo.titulo} · {invitado.nombre_completo}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${online
                                    ? 'bg-emerald-900/60 text-emerald-300'
                                    : 'bg-amber-900/60 text-amber-300'
                                }`}
                        >
                            {online ? <Wifi size={13} /> : <WifiOff size={13} />}
                            {online ? 'En Línea' : 'Modo Offline'}
                        </span>

                        {colaOffline.length > 0 && (
                            <button
                                onClick={sincronizarColaOffline}
                                disabled={!online || sincronizando}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#F2B632] px-2.5 py-1 text-[10px] font-black uppercase text-black"
                            >
                                <RefreshCw size={12} className={sincronizando ? 'animate-spin' : ''} />
                                Sincronizar ({colaOffline.length})
                            </button>
                        )}

                        <button
                            onClick={toggleTracking}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black uppercase ${trackingActivo
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-[#D90429] text-white'
                                }`}
                        >
                            <Navigation size={15} />
                            {trackingActivo ? 'GPS Activo' : 'Activar Trakeo GPS'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Cuerpo: Mapa + Marcador de Puntos + Chat */}
            <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <div className="h-80 overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm sm:h-96">
                        <div ref={mapContainerRef} className="h-full w-full" />
                    </div>

                    {/* Formulario rápido de Punto Estratégico */}
                    <form
                        onSubmit={handleMarcarWaypoint}
                        className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3"
                    >
                        <h2 className="flex items-center gap-1.5 text-xs font-black uppercase text-neutral-900">
                            <MapPin size={16} className="text-[#D90429]" /> Marcar Punto
                            Estratégico en mi Ubicación
                        </h2>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <select
                                value={nuevoWp.tipo}
                                onChange={(e) => setNuevoWp({ ...nuevoWp, tipo: e.target.value })}
                                className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-bold"
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
                                placeholder="Título breve (Ej. Corte de sendero)"
                                className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold sm:col-span-2"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-black uppercase text-[#F2B632]"
                        >
                            Enviar Punto al Puesto de Mando
                        </button>
                    </form>
                </div>

                {/* Chat Táctico del Caso */}
                <div className="flex h-[520px] flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <div className="border-b border-neutral-100 px-4 py-3">
                        <h2 className="flex items-center gap-1.5 text-xs font-black uppercase text-neutral-900">
                            <CheckCircle2 size={16} className="text-emerald-600" /> Canal
                            Táctico Multi-Agencia
                        </h2>
                    </div>

                    <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
                        {chatMensajes.map((msg) => (
                            <div
                                key={msg.id}
                                className="rounded-xl border border-neutral-100 bg-neutral-50 p-2.5 text-xs"
                            >
                                <div className="flex items-center justify-between text-[10px] font-black text-neutral-500">
                                    <span>
                                        {msg.remitente_nombre} · {msg.remitente_unidad}
                                    </span>
                                    <span>
                                        {new Date(msg.creado_en).toLocaleTimeString('es-CL', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <p className="mt-1 font-medium text-neutral-900">{msg.mensaje}</p>
                                {msg.foto_url && (
                                    <a
                                        href={msg.foto_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1.5 block"
                                    >
                                        <img
                                            src={msg.foto_url}
                                            alt="Evidencia"
                                            className="max-h-36 rounded-lg object-cover"
                                        />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>

                    <form
                        onSubmit={handleEnviarChat}
                        className="border-t border-neutral-100 p-3 space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer rounded-xl border border-neutral-300 p-2 text-neutral-600 hover:bg-neutral-100">
                                <Camera size={18} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => setFotoChat(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                            </label>
                            <input
                                type="text"
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                placeholder="Reportar novedad o hallazgo..."
                                className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                            />
                            <button
                                type="submit"
                                disabled={enviandoChat}
                                className="rounded-xl bg-[#D90429] p-2.5 text-white hover:bg-red-700"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        {fotoChat && (
                            <p className="text-[10px] font-bold text-emerald-700">
                                Foto lista para enviar: {fotoChat.name}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}