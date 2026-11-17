import { useEffect, useState } from 'react';
import { Save, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

export default function ConfiguracionSitio() {
  const [form, setForm] = useState({
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuracion_sitio')
        .select('instagram_url, facebook_url, tiktok_url')
        .eq('id', 1)
        .single();

      if (!error && data) {
        setForm({
          instagram_url: data.instagram_url || '',
          facebook_url: data.facebook_url || '',
          tiktok_url: data.tiktok_url || '',
        });
      }
      setLoading(false);
    };

    cargar();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });

    const { error } = await supabase.from('configuracion_sitio').upsert(
      {
        id: 1,
        instagram_url: form.instagram_url.trim() || null,
        facebook_url: form.facebook_url.trim() || null,
        tiktok_url: form.tiktok_url.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    setSaving(false);

    if (error) {
      setStatus({
        type: 'error',
        message:
          'No se pudo guardar la configuración. Verifica tus permisos de Superadmin.',
      });
    } else {
      setStatus({
        type: 'success',
        message:
          'Configuración de redes sociales actualizada correctamente en el portal público.',
      });
    }
  };

  return (
    <DashboardLayout
      title="Configuración del Sitio"
      subtitle="Enlaces oficiales de redes sociales visibles en el pie de página público"
    >
      <div className="max-w-2xl rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-b-4 border-[#D90429] bg-[#0A0A0A] text-[#F2B632]">
            <Globe size={21} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base font-black uppercase text-neutral-950">
              Redes Sociales Institucionales
            </h2>
            <p className="text-xs font-semibold text-neutral-500">
              Si un campo queda vacío, el botón no se mostrará al público.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="py-6 text-sm font-bold text-neutral-500">
            Cargando configuración actual...
          </p>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {status.message && (
              <div
                className={`flex items-center gap-3 rounded-xl border p-4 text-xs font-bold ${status.type === 'error'
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-900'
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

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-neutral-800">
                Instagram URL
              </label>
              <input
                type="url"
                value={form.instagram_url}
                onChange={(e) =>
                  setForm({ ...form, instagram_url: e.target.value })
                }
                placeholder="https://www.instagram.com/brebiobio/"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0A0A0A] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-neutral-800">
                Facebook URL
              </label>
              <input
                type="url"
                value={form.facebook_url}
                onChange={(e) =>
                  setForm({ ...form, facebook_url: e.target.value })
                }
                placeholder="https://www.facebook.com/brebiobio/"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0A0A0A] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-neutral-800">
                TikTok URL
              </label>
              <input
                type="url"
                value={form.tiktok_url}
                onChange={(e) =>
                  setForm({ ...form, tiktok_url: e.target.value })
                }
                placeholder="https://www.tiktok.com/@brebiobio"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0A0A0A] focus:bg-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                <Save size={16} strokeWidth={2.5} />
                <span>{saving ? 'Guardando...' : 'Guardar Enlaces'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}