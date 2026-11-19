import { useEffect, useState } from 'react';
import {
    GraduationCap,
    ExternalLink,
    Plus,
    BookOpen,
    ShieldAlert,
    X,
    Trash2,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const PLATAFORMAS_GRATUITAS = [
    {
        id: 'plat-senapred',
        titulo: 'Formación Oficial SINAPRED · Academia SENAPRED',
        descripcion:
            'Cursos gratuitos certificados del Servicio Nacional de Prevención y Respuesta ante Desastres de Chile. Descarga tu diploma y súbelo en Mi Ficha y Credencial para validarlo.',
        entidad: 'SENAPRED / SINAPRED',
        tipo: 'externo',
        url_recurso: 'https://academia.senapred.cl/',
        obligatorio: true,
        esPlataformaBase: true,
    },
    {
        id: 'plat-fema',
        titulo: 'Sistema de Comando de Incidentes (ICS / SCI) · FEMA EMI',
        descripcion:
            'Cursos gratuitos en línea de autoaprendizaje sobre estructura de comando, operaciones, logística y coordinación en emergencias.',
        entidad: 'FEMA EMI (Gratuito)',
        tipo: 'externo',
        url_recurso: 'https://training.fema.gov/is/',
        obligatorio: true,
        esPlataformaBase: true,
    },
    {
        id: 'plat-ifrc',
        titulo: 'Primeros Auxilios y Respuesta Comunitaria · IFRC / Cruz Roja',
        descripcion:
            'Módulos gratuitos sobre respuesta ante emergencias, preparación comunitaria y trabajo voluntario en terreno.',
        entidad: 'IFRC / Cruz Roja (Gratuito)',
        tipo: 'externo',
        url_recurso: 'https://ifrc.csod.com',
        obligatorio: false,
        esPlataformaBase: true,
    },
    {
        id: 'plat-ops',
        titulo: 'Manejo de Emergencias y Trauma · Campus Virtual OPS / OMS',
        descripcion:
            'Capacitaciones gratuitas en atención prehospitalaria, triage y respuesta sanitaria ante desastres.',
        entidad: 'OPS / OMS (Gratuito)',
        tipo: 'externo',
        url_recurso: 'https://www.campusvirtualsp.org',
        obligatorio: false,
        esPlataformaBase: true,
    },
];

export default function Cursos() {
    const { profile } = useAuth();
    const [cursos, setCursos] = useState([]);
    const [filtroCaracter, setFiltroCaracter] = useState('todos');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [nuevoCurso, setNuevoCurso] = useState({
        titulo: '',
        descripcion: '',
        entidad: 'BRE Bío-Bío',
        tipo: 'interno',
        url_recurso: '',
        obligatorio: true,
    });

    const rol = (profile?.rol || '').toLowerCase();
    const esSuperadmin = rol === 'superadmin';

    const cargarCursos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('cursos_capacitacion')
            .select('*')
            .order('obligatorio', { ascending: false })
            .order('creado_en', { ascending: false });

        if (!error && data) {
            setCursos(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        cargarCursos();
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        if (!esSuperadmin) return;
        setSaving(true);

        const { error } = await supabase.from('cursos_capacitacion').insert([
            {
                titulo: nuevoCurso.titulo.trim(),
                descripcion: nuevoCurso.descripcion.trim(),
                entidad: nuevoCurso.entidad.trim() || 'BRE Bío-Bío',
                tipo: nuevoCurso.tipo,
                url_recurso: nuevoCurso.url_recurso.trim() || null,
                obligatorio: Boolean(nuevoCurso.obligatorio),
                creado_por: profile?.id || null,
            },
        ]);

        setSaving(false);

        if (!error) {
            setShowModal(false);
            setNuevoCurso({
                titulo: '',
                descripcion: '',
                entidad: 'BRE Bío-Bío',
                tipo: 'interno',
                url_recurso: '',
                obligatorio: true,
            });
            cargarCursos();
        }
    };

    const handleEliminar = async (id) => {
        if (!esSuperadmin) return;
        if (!window.confirm('¿Eliminar este curso o recurso formativo?')) return;
        const { error } = await supabase
            .from('cursos_capacitacion')
            .delete()
            .eq('id', id);

        if (!error) cargarCursos();
    };

    const catalogoCombinado = [
        ...cursos.map((c) => ({ ...c, esPlataformaBase: false })),
        ...PLATAFORMAS_GRATUITAS,
    ].filter((c) => {
        if (filtroCaracter === 'obligatorio') return Boolean(c.obligatorio);
        if (filtroCaracter === 'optativo') return !c.obligatorio;
        return true;
    });

    return (
        <DashboardLayout
            title="Academia y Cursos Operativos"
            subtitle="Formación institucional, cursos obligatorios y optativos, y plataformas gratuitas de emergencia"
            actions={
                esSuperadmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors hover:bg-red-700"
                    >
                        <Plus size={18} strokeWidth={2.5} /> Agregar Curso
                    </button>
                )
            }
        >
            {/* Banner Destacado Academia SENAPRED / SINAPRED */}
            <div className="mb-6 rounded-2xl border-2 border-[#0A0A0A] bg-[#0A0A0A] p-6 text-white shadow-xl sm:p-8">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F2B632] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-black">
                            <ShieldAlert size={14} strokeWidth={2.5} /> Sistema Nacional SINAPRED
                        </span>
                        <h2 className="text-xl font-black uppercase tracking-tight sm:text-2xl">
                            Portal Oficial Academia SENAPRED Chile
                        </h2>
                        <p className="max-w-2xl text-sm font-medium text-neutral-300">
                            Accede a los cursos gratuitos del Servicio Nacional de Prevención y
                            Respuesta ante Desastres y otras plataformas gratuitas integradas.
                            Al aprobar un curso, descarga tu certificado y súbelo en{' '}
                            <strong>Mi Ficha y Credencial</strong>.
                        </p>
                    </div>

                    <a
                        href="https://academia.senapred.cl/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D90429] px-6 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-105 hover:bg-red-700"
                    >
                        <span>Ir a Academia SENAPRED</span>
                        <ExternalLink size={17} strokeWidth={2.5} />
                    </a>
                </div>
            </div>

            {/* Filtro Obligatorio / Optativo */}
            <div className="mb-6 flex flex-wrap gap-2">
                {[
                    { key: 'todos', label: `Todos (${cursos.length + PLATAFORMAS_GRATUITAS.length})` },
                    { key: 'obligatorio', label: 'Obligatorios' },
                    { key: 'optativo', label: 'Optativos' },
                ].map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setFiltroCaracter(f.key)}
                        className={`rounded-xl px-4 py-2 text-xs font-black uppercase transition-colors ${filtroCaracter === f.key
                                ? 'bg-[#0A0A0A] text-[#F2B632]'
                                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Listado de Cursos y Plataformas Gratuitas */}
            {loading ? (
                <p className="py-10 text-center text-sm font-bold text-neutral-500">
                    Cargando catálogo de capacitación...
                </p>
            ) : catalogoCombinado.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
                    <GraduationCap
                        size={44}
                        strokeWidth={2}
                        className="mx-auto mb-3 text-neutral-300"
                    />
                    <p className="text-sm font-bold text-neutral-500">
                        No hay cursos disponibles en este filtro.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {catalogoCombinado.map((curso) => (
                        <div
                            key={curso.id}
                            className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div>
                                <div className="mb-3 flex items-start justify-between gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-700">
                                        <BookOpen
                                            size={13}
                                            strokeWidth={2.5}
                                            className="text-[#D90429]"
                                        />
                                        {curso.entidad}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${curso.obligatorio
                                                    ? 'bg-red-100 text-[#D90429]'
                                                    : 'bg-emerald-100 text-emerald-800'
                                                }`}
                                        >
                                            {curso.obligatorio ? 'Obligatorio' : 'Optativo'}
                                        </span>
                                        {esSuperadmin && !curso.esPlataformaBase && (
                                            <button
                                                onClick={() => handleEliminar(curso.id)}
                                                className="rounded-lg p-1 text-neutral-400 hover:bg-red-50 hover:text-[#D90429]"
                                                title="Eliminar curso"
                                            >
                                                <Trash2 size={15} strokeWidth={2.5} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-neutral-950">
                                    {curso.titulo}
                                </h3>
                                <p className="mt-2 text-xs font-medium leading-relaxed text-neutral-600">
                                    {curso.descripcion ||
                                        'Material de formación operativa BRE Bío-Bío.'}
                                </p>
                            </div>

                            {curso.url_recurso && (
                                <div className="mt-6 border-t border-neutral-100 pt-4">
                                    <a
                                        href={curso.url_recurso}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
                                    >
                                        <span>Acceder al Curso / Plataforma</span>
                                        <ExternalLink size={15} strokeWidth={2.5} />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Agregar Curso Manual (Exclusivo Superadmin) */}
            {showModal && esSuperadmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="text-lg font-black uppercase text-neutral-950">
                                Agregar Curso Manual
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-neutral-400 hover:text-neutral-800"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <form onSubmit={handleCrear} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Título del Curso o Manual
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nuevoCurso.titulo}
                                    onChange={(e) =>
                                        setNuevoCurso({ ...nuevoCurso, titulo: e.target.value })
                                    }
                                    placeholder="Ej. Curso Básico Sistema Comando de Incidentes (SCI)"
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                        Institución / Plataforma
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={nuevoCurso.entidad}
                                        onChange={(e) =>
                                            setNuevoCurso({ ...nuevoCurso, entidad: e.target.value })
                                        }
                                        placeholder="SENAPRED / BRE Bío-Bío"
                                        className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                        Carácter del Curso
                                    </label>
                                    <select
                                        value={nuevoCurso.obligatorio ? 'obligatorio' : 'optativo'}
                                        onChange={(e) =>
                                            setNuevoCurso({
                                                ...nuevoCurso,
                                                obligatorio: e.target.value === 'obligatorio',
                                            })
                                        }
                                        className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-black uppercase"
                                    >
                                        <option value="obligatorio">Obligatorio</option>
                                        <option value="optativo">Optativo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Enlace (URL) del Curso o Documento
                                </label>
                                <input
                                    type="url"
                                    value={nuevoCurso.url_recurso}
                                    onChange={(e) =>
                                        setNuevoCurso({
                                            ...nuevoCurso,
                                            url_recurso: e.target.value,
                                        })
                                    }
                                    placeholder="https://academia.senapred.cl/..."
                                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Descripción
                                </label>
                                <textarea
                                    rows="3"
                                    value={nuevoCurso.descripcion}
                                    onChange={(e) =>
                                        setNuevoCurso({
                                            ...nuevoCurso,
                                            descripcion: e.target.value,
                                        })
                                    }
                                    placeholder="Objetivos del curso, requisitos o instrucciones..."
                                    className="w-full resize-none rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
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
                                    className="rounded-xl bg-[#D90429] px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Guardar Curso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}