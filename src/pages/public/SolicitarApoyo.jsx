import { useState } from 'react';
import { Siren, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SolicitarApoyo() {
  const [form, setForm] = useState({
    solicitante: '',
    telefono: '',
    email: '',
    tipo_apoyo: 'Búsqueda de persona extraviada',
    descripcion: '',
  });
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviado(false);
    setSubmitting(true);

    const { error: insertError } = await supabase
      .from('solicitudes_apoyo')
      .insert([form]);

    setSubmitting(false);

    if (insertError) {
      setError(
        'No se pudo enviar la solicitud. Verifica la conexión con el servidor.'
      );
      return;
    }

    setEnviado(true);
    setForm({
      solicitante: '',
      telefono: '',
      email: '',
      tipo_apoyo: 'Búsqueda de persona extraviada',
      descripcion: '',
    });
  };

  return (
    <div className="bg-neutral-100 font-sans text-neutral-950">
      {/* Cabecera */}
      <section className="border-b-4 border-red-600 bg-neutral-950 py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="border-l-4 border-amber-400 pl-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Canal de Activación y Coordinación
            </span>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Solicitar Apoyo Técnico u Operativo
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-neutral-300 sm:text-base">
              Formulario oficial para municipalidades, organismos públicos,
              empresas y particulares que requieran apoyo en emergencias,
              búsquedas, simulacros o capacitaciones.
            </p>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-lg border-2 border-neutral-950 bg-white p-8 shadow-[8px_8px_0px_0px_#0a0a0a] md:p-10">
            <div className="mb-6 flex items-center gap-3 border-b-2 border-neutral-100 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded border-b-4 border-red-600 bg-black text-amber-400">
                <Siren size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase text-black">
                  Registro de Solicitud
                </h2>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Evaluación directa por el Directorio Operativo
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded border-2 border-red-600 bg-red-50 p-4 text-sm font-bold text-red-800">
                <AlertCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {enviado && (
              <div className="mb-6 flex items-center gap-3 rounded border-2 border-emerald-700 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                <CheckCircle2 size={20} className="shrink-0 text-emerald-700" />
                <span>
                  Solicitud registrada correctamente. Nuestro equipo de mando se
                  pondrá en contacto a la brevedad.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-neutral-800">
                  Nombre o Institución Solicitante
                </label>
                <input
                  type="text"
                  name="solicitante"
                  required
                  value={form.solicitante}
                  onChange={handleChange}
                  className="w-full rounded border-2 border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-neutral-950 focus:bg-white"
                  placeholder="Ej. Municipalidad, Bomberos, Empresa, Familiar..."
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-neutral-800">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    required
                    value={form.telefono}
                    onChange={handleChange}
                    className="w-full rounded border-2 border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-neutral-950 focus:bg-white"
                    placeholder="+56 9 ..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-neutral-800">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded border-2 border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-neutral-950 focus:bg-white"
                    placeholder="contacto@institucion.cl"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-neutral-800">
                  Tipo de Apoyo Requerido
                </label>
                <select
                  name="tipo_apoyo"
                  value={form.tipo_apoyo}
                  onChange={handleChange}
                  className="w-full rounded border-2 border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-neutral-950 focus:bg-white"
                >
                  <option>Búsqueda de persona extraviada</option>
                  <option>Rescate en terreno/altura</option>
                  <option>Apoyo en desastre natural</option>
                  <option>Capacitación / Simulacro</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-neutral-800">
                  Descripción de la situación y ubicación referencial
                </label>
                <textarea
                  name="descripcion"
                  rows="4"
                  required
                  value={form.descripcion}
                  onChange={handleChange}
                  className="w-full resize-none rounded border-2 border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-neutral-950 focus:bg-white"
                  placeholder="Indica comuna, sector, cantidad de personas o requerimientos técnicos..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded bg-red-600 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/30 transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                <ShieldAlert size={18} />
                <span>
                  {submitting ? 'Enviando solicitud...' : 'Enviar Solicitud'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
