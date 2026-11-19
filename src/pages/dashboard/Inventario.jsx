import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Plus,
  Truck,
  HeartPulse,
  Anchor,
  Radio,
  Tent,
  Trash2,
  User,
  Building2,
  X,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const CATEGORIAS_INVENTARIO = [
  { key: 'Vehículos ONG', label: 'Vehículos ONG', icon: Truck },
  { key: 'Vehículos Particulares', label: 'Vehículos Particulares', icon: Truck },
  { key: 'Prehospitalario', label: 'Prehospitalario', icon: HeartPulse },
  { key: 'Cuerdas y Rescate Vertical', label: 'Cuerdas y Rescate Vertical', icon: Anchor },
  { key: 'Telecomunicaciones (Teleco)', label: 'Telecomunicaciones (Teleco)', icon: Radio },
  { key: 'Puesto de Comando (PC)', label: 'Puesto de Comando (PC)', icon: Tent },
  { key: 'Equipamiento General', label: 'Equipamiento General', icon: Package },
];

export default function Inventario() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [miembros, setMiembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroPropiedad, setFiltroPropiedad] = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alerta, setAlerta] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    categoria: 'Prehospitalario',
    cantidad: 1,
    estado: 'Operativo',
    tipo_propiedad: 'ong',
    propietario_id: '',
    ubicacion_o_notas: '',
  });

  const rol = (profile?.rol || 'postulante').toLowerCase();
  const cargos = Array.isArray(profile?.cargos_operativos)
    ? profile.cargos_operativos.map((c) => c.toLowerCase())
    : [];
  const puedeGestionar =
    ['superadmin', 'director'].includes(rol) ||
    cargos.some((c) => ['do', 'dos', 'jc', 'lem', 'tesorero'].includes(c));

  const cargarDatos = async () => {
    setLoading(true);
    setAlerta('');
    const [invRes, perfRes] = await Promise.all([
      supabase
        .from('inventario')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nombre', { ascending: true }),
      supabase
        .from('perfiles')
        .select('id, nombre_completo, rol, codigo_credencial')
        .eq('estado_validacion', 'aprobado')
        .order('nombre_completo', { ascending: true }),
    ]);

    if (!invRes.error) setItems(invRes.data || []);
    else setAlerta(invRes.error.message);

    if (!perfRes.error) setMiembros(perfRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearItem = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setSaving(true);
    setAlerta('');

    const esParticular =
      form.tipo_propiedad === 'particular' ||
      form.categoria === 'Vehículos Particulares';
    const propEncontrado = miembros.find((m) => m.id === form.propietario_id);

    const { error } = await supabase.from('inventario').insert([
      {
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        cantidad: Math.max(1, parseInt(form.cantidad, 10) || 1),
        estado: form.estado,
        tipo_propiedad: esParticular ? 'particular' : 'ong',
        propietario_id: esParticular ? form.propietario_id || null : null,
        propietario_nombre: esParticular
          ? propEncontrado?.nombre_completo || 'Particular sin asignar'
          : 'O.N.G. BRE Bío-Bío',
        ubicacion_o_notas: form.ubicacion_o_notas.trim() || null,
      },
    ]);

    setSaving(false);
    if (error) {
      setAlerta(error.message);
    } else {
      setShowModal(false);
      setForm({
        nombre: '',
        categoria: 'Prehospitalario',
        cantidad: 1,
        estado: 'Operativo',
        tipo_propiedad: 'ong',
        propietario_id: '',
        ubicacion_o_notas: '',
      });
      cargarDatos();
    }
  };

  const handleEliminarItem = async (id) => {
    const { error } = await supabase.from('inventario').delete().eq('id', id);
    if (!error) cargarDatos();
  };

  const itemsFiltrados = useMemo(() => {
    return items.filter((it) => {
      const okCat =
        filtroCategoria === 'todas' || it.categoria === filtroCategoria;
      const prop = (it.tipo_propiedad || 'ong').toLowerCase();
      const okProp = filtroPropiedad === 'todas' || prop === filtroPropiedad;
      return okCat && okProp;
    });
  }, [items, filtroCategoria, filtroPropiedad]);

  const agrupadosPorCategoria = useMemo(() => {
    const grupos = {};
    itemsFiltrados.forEach((it) => {
      const cat = it.categoria || 'Equipamiento General';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(it);
    });
    return grupos;
  }, [itemsFiltrados]);

  return (
    <DashboardLayout
      title="Inventario Operativo y Logístico"
      subtitle="Agrupación por especialidad, Puesto de Comando, telecomunicaciones y propiedad ONG / particular"
      actions={
        puedeGestionar && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-red-700"
          >
            <Plus size={17} strokeWidth={2.5} /> Registrar Recurso
          </button>
        )
      }
    >
      {alerta && (
        <div className="mb-4 rounded-xl border-l-4 border-[#D90429] bg-red-50 p-3.5 text-xs font-bold text-red-900">
          {alerta}
        </div>
      )}

      {/* Filtros por Categoría y Propiedad */}
      <div className="mb-6 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
            Filtrar por Propiedad:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'todas', label: 'Todo el Inventario' },
              { key: 'ong', label: 'Recursos de la ONG' },
              { key: 'particular', label: 'Aporte / Vehículos Particulares' },
            ].map((fp) => (
              <button
                key={fp.key}
                type="button"
                onClick={() => setFiltroPropiedad(fp.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase ${filtroPropiedad === fp.key
                    ? 'bg-[#0A0A0A] text-[#F2B632]'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
              >
                {fp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-neutral-100 pt-3">
          <button
            type="button"
            onClick={() => setFiltroCategoria('todas')}
            className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase ${filtroCategoria === 'todas'
                ? 'bg-[#D90429] text-white'
                : 'border border-neutral-200 bg-neutral-50 text-neutral-700'
              }`}
          >
            Todas las Categorías ({items.length})
          </button>
          {CATEGORIAS_INVENTARIO.map((cat) => {
            const count = items.filter((i) => i.categoria === cat.key).length;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setFiltroCategoria(cat.key)}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase ${filtroCategoria === cat.key
                    ? 'bg-[#D90429] text-white'
                    : 'border border-neutral-200 bg-neutral-50 text-neutral-700'
                  }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm font-bold text-neutral-500">
          Cargando inventario categorizado...
        </p>
      ) : Object.keys(agrupadosPorCategoria).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm font-semibold text-neutral-500">
          No hay elementos registrados en este filtro.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(agrupadosPorCategoria).map(([categoria, lista]) => {
            const metaCat =
              CATEGORIAS_INVENTARIO.find((c) => c.key === categoria) ||
              CATEGORIAS_INVENTARIO[CATEGORIAS_INVENTARIO.length - 1];
            const IconoCat = metaCat.icon;

            return (
              <section
                key={categoria}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-950 px-5 py-3 text-white">
                  <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#F2B632]">
                    <IconoCat size={16} />
                    {categoria}
                  </h2>
                  <span className="rounded-lg bg-white/10 px-2.5 py-0.5 text-[11px] font-black">
                    {lista.length} ítems
                  </span>
                </div>

                <div className="divide-y divide-neutral-100">
                  {lista.map((it) => {
                    const esPart =
                      (it.tipo_propiedad || '').toLowerCase() === 'particular';
                    return (
                      <div
                        key={it.id}
                        className="flex flex-col justify-between gap-3 px-5 py-3.5 sm:flex-row sm:items-center"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-neutral-950">
                              {it.nombre}
                            </span>
                            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-black text-neutral-800">
                              Cant: {it.cantidad}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${it.estado === 'Operativo'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                                }`}
                            >
                              {it.estado}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${esPart
                                  ? 'bg-amber-100 text-amber-950'
                                  : 'bg-red-50 text-[#D90429]'
                                }`}
                            >
                              {esPart ? (
                                <>
                                  <User size={11} /> Particular ·{' '}
                                  {it.propietario_nombre || 'Voluntario'}
                                </>
                              ) : (
                                <>
                                  <Building2 size={11} /> Propiedad ONG
                                </>
                              )}
                            </span>
                          </div>
                          {it.ubicacion_o_notas && (
                            <p className="text-xs text-neutral-500">
                              {it.ubicacion_o_notas}
                            </p>
                          )}
                        </div>

                        {puedeGestionar && (
                          <button
                            type="button"
                            onClick={() => handleEliminarItem(it.id)}
                            className="self-end rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-[#D90429] sm:self-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Modal Nuevo Recurso de Inventario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black uppercase text-neutral-950">
                Registrar Recurso en Inventario
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearItem} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Nombre del Recurso / Equipo
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Camilla rígida / Radio VHF portátil / Toyota Hilux"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Categoría Operativa
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        categoria: cat,
                        tipo_propiedad:
                          cat === 'Vehículos Particulares'
                            ? 'particular'
                            : cat === 'Vehículos ONG'
                              ? 'ong'
                              : prev.tipo_propiedad,
                      }));
                    }}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black"
                  >
                    {CATEGORIAS_INVENTARIO.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Propiedad
                  </label>
                  <select
                    value={form.tipo_propiedad}
                    onChange={(e) =>
                      setForm({ ...form, tipo_propiedad: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase"
                  >
                    <option value="ong">De la ONG</option>
                    <option value="particular">Particular (Voluntario)</option>
                  </select>
                </div>
              </div>

              {form.tipo_propiedad === 'particular' && (
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Voluntario / Miembro Propietario
                  </label>
                  <select
                    required
                    value={form.propietario_id}
                    onChange={(e) =>
                      setForm({ ...form, propietario_id: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                  >
                    <option value="">Selecciona a quién pertenece...</option>
                    {miembros.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre_completo}{' '}
                        {m.codigo_credencial ? `(${m.codigo_credencial})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.cantidad}
                    onChange={(e) =>
                      setForm({ ...form, cantidad: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Estado
                  </label>
                  <select
                    value={form.estado}
                    onChange={(e) =>
                      setForm({ ...form, estado: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase"
                  >
                    <option value="Operativo">Operativo</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Fuera de servicio">Fuera de servicio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Patente / Serie / Observaciones
                </label>
                <input
                  type="text"
                  value={form.ubicacion_o_notas}
                  onChange={(e) =>
                    setForm({ ...form, ubicacion_o_notas: e.target.value })
                  }
                  placeholder="Ej. Patente ABCD-12 · Frecuencia UHF 462.500"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-black uppercase text-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#D90429] px-5 py-2 text-xs font-black uppercase text-white hover:bg-red-700"
                >
                  {saving ? 'Guardando...' : 'Guardar Recurso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}