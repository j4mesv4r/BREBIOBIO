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

export default function Cursos() {
    const { profile } = useAuth();
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [nuevoCurso, setNuevoCurso] = useState({
        titulo: '',
        descripcion: '',
        entidad: 'SENAPRED / SINAPRED',
        tipo: 'externo',
        url_recurso: '',
        obligatorio: false,
    });

    const rol = (profile?.rol || '').toLowerCase();
    const puedePublicar = rol === 'superadmin' || rol === 'director';

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
        setSaving(true);

        const { error } = await supabase.from('cursos_capacitacion').insert([
            {
                titulo: nuevoCurso.titulo.trim(),
                descripcion: nuevoCurso.descripcion.trim(),
                entidad: nuevoCurso.entidad.trim(),
                tipo: nuevoCurso.tipo,
                url_recurso: nuevoCurso.url_recurso.trim(),
                obligatorio: nuevoCurso.obligatorio,
                creado_por: profile?.id || null,
            },
        ]);

        setSaving(false);

        if (!error) {
            setShowModal(false);
            setNuevoCurso({
                titulo: '',
                descripcion: '',
                entidad: 'SENAPRED / SINAPRED',
                tipo: 'externo',
                url_recurso: '',
                obligatorio: false,
            });
            cargarCursos();
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Eliminar este curso o recurso formativo?')) return;
        const { error } = await supabase
            .from('cursos_capacitacion')
            .delete()
            .eq('id', id);

        if (!error) cargarCursos();
    };

    return (
        <DashboardLayout
            title="Academia y Cursos Operativos"
            subtitle="Formación institucional, manuales internos y acceso oficial a Academia SENAPRED / SINAPRED"
            actions={
                puedePublicar && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors hover:bg-red-700"
                    >
                        <Plus size={18} strokeWidth={2.5} /> Publicar Curso
                    </button>
                )
            }
        >
            {/* Banner Destacado Academia SENAPRED / SINAPRED */}
            <div className="mb-8 rounded-2xl border-2 border-[#0A0A0A] bg-[#0A0A0A] p-6 text-white shadow-xl sm:p-8">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F2B632] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-black">
                            <ShieldAlert size={14} strokeWidth={2.5} /> Convenio / Sistema Nacional SINAPRED
                        </span>
                        <h2 className="text-xl font-black uppercase tracking-tight sm:text-2xl">
                            Portal Oficial Academia SENAPRED Chile
                        </h2>
                        <p className="max-w-2xl text-sm font-medium text-neutral-300">
                            Accede directamente a los cursos gratuitos certificados del Servicio
                            Nacional de Prevención y Respuesta ante Desastres. Una vez aprobado
                            tu curso, descarga tu diploma y súbelo en <strong>Mi Ficha y Credencial</strong> para validarlo en tu hoja de vida.
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

            {/* Listado de Cursos y Material */}
            {loading ? (
                <p className="py-10 text-center text-sm font-bold text-neutral-500">
                    Cargando catálogo de capacitación...
                </p>
            ) : cursos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
                    <GraduationCap size={44} strokeWidth={2} className="mx-auto mb-3 text-neutral-300" />
                    <p className="text-sm font-bold text-neutral-500">
                        No hay cursos adicionales publicados aún.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {cursos.map((curso) => (
                        <div
                            key={curso.id}
                            className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div>
                                <div className="mb-3 flex items-start justify-between gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-700">
                                        <BookOpen size={13} strokeWidth={2.5} className="text-[#D90429]" />
                                        {curso.entidad}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        {curso.obligatorio && (
                                            <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase text-amber-800">
                                                Recomendado / Base
                                            </span>
                                        )}
                                        {puedePublicar && (
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
                                    {curso.descripcion || 'Material de formación operativa BRE Bío-Bío.'}
                                </p>
                            </div>

                            <div className="mt-6 border-t border-neutral-100 pt-4">
                                <a
                                    href={curso.url_recurso}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
                                >
                                    <span>Acceder al Curso / Material</span>
                                    <ExternalLink size={15} strokeWidth={2.5} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Publicar Curso */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="text-lg font-black uppercase text-neutral-950">
                                Publicar Curso o Material
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
                                        Institución Emisora
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
                                        Tipo de Recurso
                                    </label>
                                    <select
                                        value={nuevoCurso.tipo}
                                        onChange={(e) =>
                                            setNuevoCurso({ ...nuevoCurso, tipo: e.target.value })
                                        }
                                        className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-semibold"
                                    >
                                        <option value="externo">Plataforma Externa (Link)</option>
                                        <option value="interno">Curso Interno ONG</option>
                                        <option value="manual">Manual / Protocolo PDF</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                                    Enlace (URL) del Curso o Documento
                                </label>
                                <input
                                    type="url"
                                    required
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
                                    placeholder="Objetivos del curso, requisitos o instrucciones de inscripción..."
                                    className="w-full resize-none rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                                <input
                                    type="checkbox"
                                    checked={nuevoCurso.obligatorio}
                                    onChange={(e) =>
                                        setNuevoCurso({
                                            ...nuevoCurso,
                                            obligatorio: e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 rounded border-neutral-300 text-[#D90429]"
                                />
                                Marcar como curso base recomendado para voluntarios
                            </label>

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
                                    {saving ? 'Publicando...' : 'Publicar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}