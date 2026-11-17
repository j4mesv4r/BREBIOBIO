import { useEffect, useState } from 'react';
import {
    Wallet,
    Plus,
    ArrowUpCircle,
    ArrowDownCircle,
    FileText,
    Upload,
    X,
    AlertCircle,
    CheckCircle2,
    Trash2,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const CATEGORIAS = [
    'Donación',
    'Cuota Social',
    'Subvención / Proyecto',
    'Equipamiento de Rescate',
    'Combustible y Transporte',
    'Insumos Médicos',
    'Comunicaciones',
    'Otros',
];

export default function Tesoreria() {
    const { profile } = useAuth();
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [status, setStatus] = useState({ type: '', message: '' });

    const [form, setForm] = useState({
        tipo: 'ingreso',
        categoria: 'Donación',
        concepto: '',
        monto: '',
        fecha_movimiento: new Date().toISOString().split('T')[0],
        numero_documento: '',
    });
    const [archivoRespaldo, setArchivoRespaldo] = useState(null);

    const rol = (profile?.rol || '').toLowerCase();
    const esSuperadmin = rol === 'superadmin';

    const cargarMovimientos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tesoreria_movimientos')
            .select('*, perfiles(nombre_completo)')
            .order('fecha_movimiento', { ascending: false })
            .order('creado_en', { ascending: false });

        if (!error && data) {
            setMovimientos(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        cargarMovimientos();
    }, []);

    const handleGuardar = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus({ type: '', message: '' });

        try {
            let respaldoUrl = null;

            if (archivoRespaldo) {
                const ext = archivoRespaldo.name.split('.').pop();
                const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from('tesoreria')
                    .upload(filePath, archivoRespaldo);

                if (uploadError) {
                    if (uploadError.message.includes('Bucket not found')) {
                        throw new Error(
                            "Crea el bucket público 'tesoreria' en Supabase > Storage antes de adjuntar comprobantes."
                        );
                    }
                    throw uploadError;
                }

                const {
                    data: { publicUrl },
                } = supabase.storage.from('tesoreria').getPublicUrl(filePath);
                respaldoUrl = publicUrl;
            }

            const { error: dbError } = await supabase
                .from('tesoreria_movimientos')
                .insert([
                    {
                        tipo: form.tipo,
                        categoria: form.categoria,
                        concepto: form.concepto.trim(),
                        monto: parseInt(form.monto, 10) || 0,
                        fecha_movimiento: form.fecha_movimiento,
                        numero_documento: form.numero_documento.trim() || null,
                        respaldo_url: respaldoUrl,
                        registrado_por: profile?.id || null,
                    },
                ]);

            if (dbError) throw dbError;

            setShowModal(false);
            setForm({
                tipo: 'ingreso',
                categoria: 'Donación',
                concepto: '',
                monto: '',
                fecha_movimiento: new Date().toISOString().split('T')[0],
                numero_documento: '',
            });
            setArchivoRespaldo(null);
            setStatus({
                type: 'success',
                message: 'Movimiento financiero y respaldo registrados correctamente.',
            });
            cargarMovimientos();
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.message || 'No se pudo registrar el movimiento.',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Eliminar este registro de tesorería? Quedará trazado en auditoría.')) {
            return;
        }
        const { error } = await supabase
            .from('tesoreria_movimientos')
            .delete()
            .eq('id', id);

        if (!error) cargarMovimientos();
    };

    const totalIngresos = movimientos
        .filter((m) => m.tipo === 'ingreso')
        .reduce((acc, m) => acc + Number(m.monto || 0), 0);

    const totalEgresos = movimientos
        .filter((m) => m.tipo === 'egreso')
        .reduce((acc, m) => acc + Number(m.monto || 0), 0);

    const saldoDisponible = totalIngresos - totalEgresos;

    const movimientosFiltrados =
        filtroTipo === 'todos'
            ? movimientos
            : movimientos.filter((m) => m.tipo === filtroTipo);

    const formatearCLP = (valor) =>
        new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(valor || 0);

    return (
        <DashboardLayout
            title="Tesorería y Rendiciones"
            subtitle="Control de ingresos, donaciones, egresos y respaldos documentales (Boletas / Facturas)"
            actions={
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors hover:bg-red-700"
                >
                    <Plus size={18} strokeWidth={2.5} /> Registrar Movimiento
                </button>
            }
        >
            {status.message && (
                <div
                    className={`mb-6 flex items-center gap-2.5 rounded-xl border-l-4 p-4 text-xs font-bold ${status.type === 'error'
                            ? 'border-[#D90429] bg-red-50 text-red-900'
                            : 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        }`}
                >
                    {status.type === 'error' ? (
                        <AlertCircle size={18} strokeWidth={2.5} className="shrink-0" />
                    ) : (
                        <CheckCircle2 size={18} strokeWidth={2.5} className="shrink-0" />
                    )}
                    <span>{status.message}</span>
                </div>
            )}

            {/* Tarjetas Resumen Financiero */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                            Ingresos Totales
                        </span>
                        <ArrowUpCircle size={22} strokeWidth={2.5} className="text-emerald-600" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-emerald-700">
                        {formatearCLP(totalIngresos)}
                    </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                            Egresos y Compras
                        </span>
                        <ArrowDownCircle size={22} strokeWidth={2.5} className="text-[#D90429]" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-[#D90429]">
                        {formatearCLP(totalEgresos)}
                    </p>
                </div>

                <div className="rounded-2xl border-2 border-[#0A0A0A] bg-[#0A0A0A] p-5 text-white shadow-md">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#F2B632]">
                            Saldo Institucional
                        </span>
                        <Wallet size={22} strokeWidth={2.5} className="text-[#F2B632]" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-white">
                        {formatearCLP(saldoDisponible)}
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="mb-5 flex flex-wrap gap-2">
                {[
                    { key: 'todos', label: 'Todos los Movimientos' },
                    { key: 'ingreso', label: 'Solo Ingresos / Donaciones' },
                    { key: 'egreso', label: 'Solo Egresos / Compras' },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFiltroTipo(f.key)}
                        className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${filtroTipo === f.key
                                ? 'bg-[#0A0A0A] text-[#F2B632]'
                                : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Tabla de Movimientos */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                {loading ? (
                    <p className="p-8 text-center text-sm font-bold text-neutral-500">
                        Cargando libro de tesorería...
                    </p>
                ) : movimientosFiltrados.length === 0 ? (
                    <div className="p-12 text-center">
                        <Wallet size={44} strokeWidth={2} className="mx-auto mb-3 text-neutral-300" />
                        <p className="text-sm font-bold text-neutral-500">
                            No hay movimientos financieros registrados en esta vista.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                                <tr>
                                    <th className="px-5 py-4">Fecha</th>
                                    <th className="px-5 py-4">Tipo</th>
                                    <th className="px-5 py-4">Concepto / Categoría</th>
                                    <th className="px-5 py-4">N° Doc</th>
                                    <th className="px-5 py-4">Monto</th>
                                    <th className="px-5 py-4">Respaldo</th>
                                    <th className="px-5 py-4">Registrado por</th>
                                    {esSuperadmin && <th className="px-5 py-4">Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {movimientosFiltrados.map((mov) => (
                                    <tr key={mov.id} className="hover:bg-neutral-50">
                                        <td className="whitespace-nowrap px-5 py-4 text-xs font-bold text-neutral-600">
                                            {mov.fecha_movimiento}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${mov.tipo === 'ingreso'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {mov.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-neutral-900">{mov.concepto}</p>
                                            <p className="text-xs font-semibold text-neutral-400">
                                                {mov.categoria}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-semibold text-neutral-600">
                                            {mov.numero_documento || '—'}
                                        </td>
                                        <td
                                            className={`whitespace-nowrap px-5 py-4 font-black ${mov.tipo === 'ingreso' ? 'text-emerald-700' : 'text-[#D90429]'
                                                }`}
                                        >
                                            {mov.tipo === 'ingreso' ? '+' : '-'} {formatearCLP(mov.monto)}
                                        </td>
                                        <td className="px-5 py-4">
                                            {mov.respaldo_url ? (
                                                <a
                                                    href={mov.respaldo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-black text-blue-700 hover:bg-neutral-100"
                                                >
                                                    <FileText size={14} strokeWidth={2.5} /> Ver Archivo
                                                </a>
                                            ) : (
                                                <span className="text-xs font-medium text-neutral-400">
                                                    Sin adjunto
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-semibold text-neutral-500">
                                            {mov.perfiles?.nombre_completo || 'Directiva'}
                                        </td>
                                        {esSuperadmin && (
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleEliminar(mov.id)}
                                                    title="Eliminar registro"
                                                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-[#D90429]"
                                                >
                                                    <Trash2 size={16} strokeWidth={2.5} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Nuevo Movimiento */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="text-lg font-black uppercase text-neutral-950">
                                Registrar Movimiento Financiero
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-neutral-400 hover:text-neutral-800"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <form onSubmit={handleGuardar} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                        Tipo de Movimiento
                                    </label>
                                    <select
                                        value={form.tipo}
                                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                                        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-bold"
                                    >
                                        <option value="ingreso">Ingreso / Donación</option>
                                        <option value="egreso">Egreso / Compra</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                        Categoría
                                    </label>
                                    <select
                                        value={form.categoria}
                                        onChange={(e) =>
                                            setForm({ ...form, categoria: e.target.value })
                                        }
                                        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-bold"
                                    >
                                        {CATEGORIAS.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Concepto / Glosa Detallada
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.concepto}
                                    onChange={(e) =>
                                        setForm({ ...form, concepto: e.target.value })
                                    }
                                    placeholder="Ej. Compra 2 radios portátiles VHF o Donación campaña"
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                        Monto (CLP)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={form.monto}
                                        onChange={(e) =>
                                            setForm({ ...form, monto: e.target.value })
                                        }
                                        placeholder="50000"
                                        className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={form.fecha_movimiento}
                                        onChange={(e) =>
                                            setForm({ ...form, fecha_movimiento: e.target.value })
                                        }
                                        className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                        N° Boleta / Comp.
                                    </label>
                                    <input
                                        type="text"
                                        value={form.numero_documento}
                                        onChange={(e) =>
                                            setForm({ ...form, numero_documento: e.target.value })
                                        }
                                        placeholder="Ej. F-1042"
                                        className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Imagen o PDF de Respaldo (Boleta / Factura / Transferencia)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) =>
                                        setArchivoRespaldo(e.target.files?.[0] || null)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A0A0A] file:px-3 file:py-1.5 file:text-xs file:font-black file:uppercase file:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-black uppercase text-neutral-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    <Upload size={15} strokeWidth={2.5} />
                                    {saving ? 'Guardando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}