import { useState } from 'react';
import { Siren } from 'lucide-react';
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
    <div className="min-h-[70vh] bg-gray-50 py-16">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="rounded-2xl border-t-8 border-red-600 bg-white p-8 shadow-xl md:p-12">
          <div className="mb-6 flex justify-center text-red-600">
            <Siren size={48} strokeWidth={1.5} />
          </div>
          <h1 className="mb-2 text-center text-3xl font-black">
            SOLICITAR APOYO
          </h1>
          <p className="mb-8 text-center text-gray-600">
            Complete este formulario para solicitar la intervención o
            colaboración de la ONG BRE Biobío en operativos, simulacros o
            capacitaciones.
          </p>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {enviado && (
            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-800">
              Solicitud registrada. Nuestro equipo se pondrá en contacto a la
              brevedad.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">
                Nombre o Institución Solicitante
              </label>
              <input
                type="text"
                name="solicitante"
                required
                value={form.solicitante}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-red-600"
                placeholder="Ej. Municipalidad, Bomberos, Familiar..."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  name="telefono"
                  required
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">
                Tipo de Apoyo Requerido
              </label>
              <select
                name="tipo_apoyo"
                value={form.tipo_apoyo}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-red-600"
              >
                <option>Búsqueda de persona extraviada</option>
                <option>Rescate en terreno/altura</option>
                <option>Apoyo en desastre natural</option>
                <option>Capacitación / Simulacro</option>
                <option>Otro</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">
                Descripción de la situación
              </label>
              <textarea
                name="descripcion"
                rows="4"
                required
                value={form.descripcion}
                onChange={handleChange}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-red-600"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-red-600 py-4 text-lg font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
