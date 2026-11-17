import { useEffect, useState } from 'react';
import { Package, Plus, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
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
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <DashboardLayout
      title="Inventario y Logística"
      subtitle="Control de equipamiento de rescate, comunicaciones y vehículos"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors hover:bg-red-700"
        >
          <Plus size={18} strokeWidth={2.5} /> Agregar Equipo
        </button>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm font-bold text-neutral-500">
            Cargando inventario...
          </p>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={44} strokeWidth={2} className="mx-auto mb-3 text-neutral-300" />
            <p className="text-sm font-bold text-neutral-500">
              No hay equipos registrados en el inventario.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Equipo</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Cantidad</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-bold text-neutral-900">
                      {item.nombre}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-600">
                      {item.categoria}
                    </td>
                    <td className="px-6 py-4 font-black">{item.cantidad}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getBadgeClass(
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
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black uppercase text-neutral-950">
                Agregar Equipo
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-800"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleAgregar} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
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
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Categoría
                  </label>
                  <select
                    value={nuevoItem.categoria}
                    onChange={(e) =>
                      setNuevoItem({ ...nuevoItem, categoria: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-semibold"
                  >
                    <option>Rescate</option>
                    <option>Comunicaciones</option>
                    <option>Primeros Auxilios</option>
                    <option>Vehículos</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
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
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Estado
                </label>
                <select
                  value={nuevoItem.estado}
                  onChange={(e) =>
                    setNuevoItem({ ...nuevoItem, estado: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-semibold"
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
                  className="rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-black uppercase text-neutral-700 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#D90429] px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}