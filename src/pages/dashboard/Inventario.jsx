import { useEffect, useState } from 'react';
import { Package, Plus, X } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { supabase } from '../../lib/supabase';

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nuevoItem, setNuevoItem] = useState({
    nombre: '',
    categoria: 'Rescate',
    cantidad: 1,
    estado: 'Operativo',
  });

  const cargarInventario = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const handleAgregar = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('inventario').insert([
      {
        nombre: nuevoItem.nombre,
        categoria: nuevoItem.categoria,
        cantidad: Number(nuevoItem.cantidad) || 1,
        estado: nuevoItem.estado,
      },
    ]);

    setSaving(false);

    if (!error) {
      setShowModal(false);
      setNuevoItem({
        nombre: '',
        categoria: 'Rescate',
        cantidad: 1,
        estado: 'Operativo',
      });
      cargarInventario();
    }
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Operativo':
        return 'bg-green-100 text-green-800';
      case 'En mantención':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900">
                <Package className="text-red-600" />
                INVENTARIO Y LOGÍSTICA
              </h1>
              <p className="text-sm text-gray-600">
                Control de equipamiento de rescate, comunicaciones y vehículos.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              <Plus size={18} /> Agregar Equipo
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <p className="p-8 text-center text-sm text-gray-500">
                Cargando inventario...
              </p>
            ) : items.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">
                No hay equipos registrados en el inventario.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Equipo</th>
                    <th className="px-6 py-3">Categoría</th>
                    <th className="px-6 py-3">Cantidad</th>
                    <th className="px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {item.nombre}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.categoria}
                      </td>
                      <td className="px-6 py-4 font-medium">{item.cantidad}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getBadgeClass(
                            item.estado
                          )}`}
                        >
                          {item.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Agregar Equipo
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAgregar} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  required
                  value={nuevoItem.nombre}
                  onChange={(e) =>
                    setNuevoItem({ ...nuevoItem, nombre: e.target.value })
                  }
                  placeholder="Ej. Radio VHF Motorola"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Categoría
                  </label>
                  <select
                    value={nuevoItem.categoria}
                    onChange={(e) =>
                      setNuevoItem({ ...nuevoItem, categoria: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option>Rescate</option>
                    <option>Comunicaciones</option>
                    <option>Primeros Auxilios</option>
                    <option>Vehículos</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nuevoItem.cantidad}
                    onChange={(e) =>
                      setNuevoItem({ ...nuevoItem, cantidad: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  value={nuevoItem.estado}
                  onChange={(e) =>
                    setNuevoItem({ ...nuevoItem, estado: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option>Operativo</option>
                  <option>En mantención</option>
                  <option>De baja</option>
                </select>
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
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
