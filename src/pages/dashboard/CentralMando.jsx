import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MapPin,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  X,
  Package,
  User,
} from 'lucide-react';

export default function CentralMando() {
  const { user, profile } = useAuth();
  const [operativos, setOperativos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState({
    longitude: -73.0498, // Centro referencial: Concepción, Bío Bío
    latitude: -36.8201,
    zoom: 9,
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedOp, setSelectedOp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [nuevoOp, setNuevoOp] = useState({
    titulo: '',
    descripcion: '',
    estado: 'en_curso',
    latitud: '-36.8201',
    longitud: '-73.0498',
  });

  // El token debe configurarse en el .env como VITE_MAPBOX_TOKEN
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    fetchOperativos();

    // Suscripción en tiempo real a la tabla 'operativos'
    const channel = supabase
      .channel('operativos_cambios')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'operativos' },
        () => {
          fetchOperativos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOperativos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('operativos')
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error fetching operativos:', error);
    } else {
      setOperativos(data || []);
    }
    setLoading(false);
  };

  const handleCrearOperativo = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('operativos').insert([
      {
        titulo: nuevoOp.titulo,
        descripcion: nuevoOp.descripcion,
        estado: nuevoOp.estado,
        latitud: nuevoOp.latitud ? parseFloat(nuevoOp.latitud) : null,
        longitud: nuevoOp.longitud ? parseFloat(nuevoOp.longitud) : null,
        creado_por: user?.id ?? null,
      },
    ]);

    setSaving(false);

    if (!error) {
      setShowModal(false);
      setNuevoOp({
        titulo: '',
        descripcion: '',
        estado: 'en_curso',
        latitud: '-36.8201',
        longitud: '-73.0498',
      });
      fetchOperativos();
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('operativos')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (!error) {
      setSelectedOp((prev) =>
        prev && prev.id === id ? { ...prev, estado: nuevoEstado } : prev
      );
      fetchOperativos();
    }
  };

  const enfocarOperativo = (op) => {
    setSelectedOp(op);
    if (op.latitud && op.longitud) {
      setViewState((prev) => ({
        ...prev,
        latitude: op.latitud,
        longitude: op.longitud,
        zoom: 12,
      }));
    }
  };

  const getStatusStyle = (estado) => {
    switch (estado) {
      case 'en_curso':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'finalizado':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'en_curso':
        return <AlertCircle size={16} className="mr-1" />;
      case 'finalizado':
        return <CheckCircle size={16} className="mr-1" />;
      default:
        return <Clock size={16} className="mr-1" />;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100 font-sans">
      {/* Cabecera del Módulo */}
      <header className="relative z-10 flex items-center justify-between bg-black p-4 text-white shadow-md">
        <div>
          <h1 className="text-2xl font-black italic tracking-wider">
            CENTRAL DE MANDO
          </h1>
          <p className="text-sm text-gray-400">
            Panel de Control de Operativos - BRE Biobío
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/inventario"
            className="hidden items-center gap-1.5 rounded border border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-800 sm:inline-flex"
          >
            <Package size={16} /> Inventario
          </Link>
          <Link
            to="/mi-perfil"
            className="hidden items-center gap-1.5 rounded border border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-800 sm:inline-flex"
          >
            <User size={16} /> Mi Perfil
          </Link>
          <span className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-sm font-semibold">
            Hola, {profile?.nombre_completo || 'Director'}
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700"
          >
            <Plus size={20} /> Nuevo Operativo
          </button>
        </div>
      </header>

      {/* Cuerpo Principal: Mapa y Lista */}
      <div className="flex flex-1 overflow-hidden">
        {/* Columna Izquierda: Mapa (65% del ancho) */}
        <div className="relative h-full w-2/3 bg-gray-300">
          {MAPBOX_TOKEN ? (
            <Map
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              onClick={(evt) => {
                if (showModal) {
                  setNuevoOp((prev) => ({
                    ...prev,
                    latitud: evt.lngLat.lat.toFixed(5),
                    longitud: evt.lngLat.lng.toFixed(5),
                  }));
                }
              }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: '100%', height: '100%' }}
            >
              <NavigationControl position="top-left" />

              {/* Renderizar Marcadores de Operativos Activos */}
              {operativos
                .filter(
                  (op) => op.latitud && op.longitud && op.estado === 'en_curso'
                )
                .map((op) => (
                  <Marker
                    key={op.id}
                    longitude={op.longitud}
                    latitude={op.latitud}
                    anchor="bottom"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      enfocarOperativo(op);
                    }}
                  >
                    <div
                      className="animate-bounce cursor-pointer text-red-600"
                      title={op.titulo}
                    >
                      <MapPin size={32} strokeWidth={2.5} fill="white" />
                    </div>
                  </Marker>
                ))}
            </Map>
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gray-200 p-8 text-center">
              <MapPin size={48} className="mb-4 text-gray-400" />
              <h3 className="mb-2 text-xl font-bold text-gray-700">
                Mapa no configurado
              </h3>
              <p className="text-gray-500">
                Agrega tu <code>VITE_MAPBOX_TOKEN</code> en el archivo{' '}
                <code>.env</code> para habilitar la visualización geoespacial.
              </p>
            </div>
          )}
        </div>

        {/* Columna Derecha: Lista de Operativos (35% del ancho) */}
        <div className="h-full w-1/3 overflow-y-auto border-l border-gray-200 bg-white">
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50 p-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <AlertCircle className="text-red-600" /> Registro de Casos
            </h2>
          </div>

          <div className="space-y-4 p-4">
            {loading ? (
              <p className="py-8 text-center text-gray-500">
                Cargando operativos...
              </p>
            ) : operativos.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-500">
                <p>No hay operativos registrados en el sistema.</p>
              </div>
            ) : (
              operativos.map((op) => (
                <div
                  key={op.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3
                      className="line-clamp-1 font-bold text-gray-800"
                      title={op.titulo}
                    >
                      {op.titulo}
                    </h3>
                    <span
                      className={`flex shrink-0 items-center rounded border px-2 py-1 text-xs font-semibold ${getStatusStyle(
                        op.estado
                      )}`}
                    >
                      {getStatusIcon(op.estado)}
                      {(op.estado || 'pendiente')
                        .replace('_', ' ')
                        .toUpperCase()}
                    </span>
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                    {op.descripcion}
                  </p>
                  <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
                    <span>
                      {op.creado_en
                        ? new Date(op.creado_en).toLocaleDateString('es-CL')
                        : ''}
                    </span>
                    <button
                      onClick={() => enfocarOperativo(op)}
                      className="font-semibold text-red-600 transition-colors hover:text-red-800"
                    >
                      Ver Detalles →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Nuevo Operativo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Nuevo Operativo
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearOperativo} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Título del Operativo
                </label>
                <input
                  type="text"
                  required
                  value={nuevoOp.titulo}
                  onChange={(e) =>
                    setNuevoOp({ ...nuevoOp, titulo: e.target.value })
                  }
                  placeholder="Ej. Búsqueda sector Alto Biobío"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  rows="3"
                  required
                  value={nuevoOp.descripcion}
                  onChange={(e) =>
                    setNuevoOp({ ...nuevoOp, descripcion: e.target.value })
                  }
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Estado inicial
                </label>
                <select
                  value={nuevoOp.estado}
                  onChange={(e) =>
                    setNuevoOp({ ...nuevoOp, estado: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="en_curso">En curso</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Latitud
                  </label>
                  <input
                    type="text"
                    value={nuevoOp.latitud}
                    onChange={(e) =>
                      setNuevoOp({ ...nuevoOp, latitud: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Longitud
                  </label>
                  <input
                    type="text"
                    value={nuevoOp.longitud}
                    onChange={(e) =>
                      setNuevoOp({ ...nuevoOp, longitud: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Crear Operativo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle de Operativo */}
      {selectedOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedOp.titulo}
              </h3>
              <button
                onClick={() => setSelectedOp(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              {selectedOp.descripcion || 'Sin descripción registrada.'}
            </p>

            <div className="mb-6 text-xs text-gray-500">
              Coordenadas: {selectedOp.latitud ?? 'N/A'},{' '}
              {selectedOp.longitud ?? 'N/A'}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
                Cambiar Estado
              </label>
              <div className="flex gap-2">
                {['pendiente', 'en_curso', 'finalizado'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleCambiarEstado(selectedOp.id, st)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      selectedOp.estado === st
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {st.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOp(null)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
