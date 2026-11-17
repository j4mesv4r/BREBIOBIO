import { useEffect, useState } from 'react';
import {
    History,
    Search,
    RefreshCw,
    Eye,
    X,
    ShieldCheck,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

export default function Auditoria() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTabla, setFiltroTabla] = useState('todas');
    const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

    const cargarAuditoria = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('auditoria_sistema')
            .select('*')
            .order('creado_en', { ascending: false })
            .limit(200);

        if (!error && data) {
            setRegistros(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        cargarAuditoria();
    }, []);

    const registrosFiltrados = registros.filter((reg) => {
        const coincideTabla =
            filtroTabla === 'todas' || reg.tabla_afectada === filtroTabla;
        const texto = busqueda.toLowerCase();
        const coincideTexto =
            !texto ||
            (reg.usuario_nombre || '').toLowerCase().includes(texto) ||
            (reg.tabla_afectada || '').toLowerCase().includes(texto) ||
            (reg.accion || '').toLowerCase().includes(texto) ||
            (reg.registro_id || '').toLowerCase().includes(texto);

        return coincideTabla && coincideTexto;
    });

    const getBadgeAccion = (accion) => {
        switch (accion) {
            case 'INSERT':
                return 'bg-emerald-100 text-emerald-800';
            case 'UPDATE':
                return 'bg-amber-100 text-amber-800';
            case 'DELETE':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-neutral-100 text-neutral-800';
        }
    };

    return (
        <DashboardLayout
            title="Auditoría y Trazabilidad"
            subtitle="Registro inmutable de acciones, autorizaciones de roles, casos operativos y movimientos"
            actions={
                <button
                    onClick={cargarAuditoria}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#F2B632] shadow-md hover:bg-neutral-800"
                >
                    <RefreshCw size={15} strokeWidth={2.5} /> Actualizar
                </button>
            }
        >
            {/* Filtros de Búsqueda */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search
                        size={16}
                        strokeWidth={2.5}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por usuario, tabla o ID..."
                        className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold outline-none focus:border-[#0A0A0A]"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'todas', label: 'Todas las Tablas' },
                        { key: 'perfiles', label: 'Perfiles y Roles' },
                        { key: 'operativos', label: 'Operativos' },
                        { key: 'tesoreria_movimientos', label: 'Tesorería' },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setFiltroTabla(t.key)}
                            className={`rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-colors ${filtroTabla === t.key
                                    ? 'bg-[#D90429] text-white'
                                    : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabla de Auditoría */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                {loading ? (
                    <p className="p-8 text-center text-sm font-bold text-neutral-500">
                        Cargando bitácora de seguridad...
                    </p>
                ) : registrosFiltrados.length === 0 ? (
                    <div className="p-12 text-center">
                        <History size={44} strokeWidth={2} className="mx-auto mb-3 text-neutral-300" />
                        <p className="text-sm font-bold text-neutral-500">
                            No se encontraron eventos de auditoría con los filtros actuales.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                                <tr>
                                    <th className="px-5 py-4">Fecha y Hora</th>
                                    <th className="px-5 py-4">Responsable</th>
                                    <th className="px-5 py-4">Acción</th>
                                    <th className="px-5 py-4">Módulo / Tabla</th>
                                    <th className="px-5 py-4">ID Registro</th>
                                    <th className="px-5 py-4">Inspección</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {registrosFiltrados.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-neutral-50">
                                        <td className="whitespace-nowrap px-5 py-3.5 text-xs font-bold text-neutral-600">
                                            {new Date(reg.creado_en).toLocaleString('es-CL')}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 font-bold text-neutral-900">
                                                <ShieldCheck size={15} strokeWidth={2.5} className="text-[#D90429]" />
                                                {reg.usuario_nombre || 'Sistema'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase ${getBadgeAccion(
                                                    reg.accion
                                                )}`}
                                            >
                                                {reg.accion}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs font-black uppercase text-neutral-700">
                                            {reg.tabla_afectada}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs text-neutral-500">
                                            {reg.registro_id ? reg.registro_id.slice(0, 8) + '...' : '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <button
                                                onClick={() => setDetalleSeleccionado(reg)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-black text-neutral-800 hover:bg-neutral-100"
                                            >
                                                <Eye size={14} strokeWidth={2.5} /> Ver Diff
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Comparador JSON Anterior vs Nuevo */}
            {detalleSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
                            <div>
                                <h3 className="text-base font-black uppercase text-neutral-950">
                                    Detalle de Trazabilidad ({detalleSeleccionado.accion})
                                </h3>
                                <p className="text-xs font-semibold text-neutral-500">
                                    Por {detalleSeleccionado.usuario_nombre} ·{' '}
                                    {new Date(detalleSeleccionado.creado_en).toLocaleString('es-CL')}
                                </p>
                            </div>
                            <button
                                onClick={() => setDetalleSeleccionado(null)}
                                className="text-neutral-400 hover:text-neutral-800"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="mb-1.5 text-xs font-black uppercase text-neutral-500">
                                    Estado Anterior
                                </p>
                                <pre className="max-h-80 overflow-auto rounded-xl bg-neutral-900 p-4 text-[11px] text-neutral-200">
                                    {detalleSeleccionado.datos_anteriores
                                        ? JSON.stringify(detalleSeleccionado.datos_anteriores, null, 2)
                                        : 'Sin datos previos (Registro nuevo)'}
                                </pre>
                            </div>

                            <div>
                                <p className="mb-1.5 text-xs font-black uppercase text-emerald-700">
                                    Estado Nuevo
                                </p>
                                <pre className="max-h-80 overflow-auto rounded-xl bg-neutral-900 p-4 text-[11px] text-emerald-300">
                                    {detalleSeleccionado.datos_nuevos
                                        ? JSON.stringify(detalleSeleccionado.datos_nuevos, null, 2)
                                        : 'Registro eliminado'}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}