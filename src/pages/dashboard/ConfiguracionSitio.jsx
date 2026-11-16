import { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
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
        message: 'No se pudo guardar la configuración. Verifica tus permisos de Superadmin.',
      });
    } else {
      setStatus({
        type: 'success',
        message: 'Configuración de redes sociales actualizada correctamente en el portal público.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-950">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10">
          <div className="mb-8 border-l-4 border-[#DC2626] pl-4">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#DC2626]">
              Administración Superadmin
            </span>
            <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-black uppercase tracking-tight text-[#0A0A0A] sm:text-3xl">
              <Settings size={26} className="text-[#DC2626]" />
              Configuración del Sitio
            </h1>
            <p className="mt-1 text-sm font-semibold text-neutral-700">
              Administra los enlaces oficiales de redes sociales visibles en el pie de página. Si un campo queda vacío, el botón no se mostrará al público.
            </p>
          </div>

          <div className="max-w-2xl rounded-lg border-2 border-[#0A0A0A] bg-white p-7 shadow-[6px_6px_0px_0px_#0A0A0A]">
            <div className="mb-6 flex items-center gap-3 border-b-2 border-neutral-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded border-b-4 border-[#DC2626] bg-[#0A0A0A] text-[#FACC15]">
                <Globe size={20} />
              </div>
              <div>
                <h2 className="text-base font-black uppercase text-[#0A0A0A]">
                  Redes Sociales Institucionales
                </h2>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Tabla configuracion_sitio (ID = 1)
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
                    className={`flex items-center gap-3 rounded border-2 p-4 text-sm font-bold ${
                      status.type === 'error'
                        ? 'border-[#DC2626] bg-red-50 text-red-900'
                        : 'border-emerald-700 bg-emerald-50 text-emerald-900'
                    }`}
                  >
                    {status.type === 'error' ? (
                      <AlertCircle size={18} className="shrink-0" />
                    ) : (
                      <CheckCircle2 size={18} className="shrink-0" />
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
                    className="w-full rounded border-2 border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-[#0A0A0A] focus:bg-white"
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
                    className="w-full rounded border-2 border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-[#0A0A0A] focus:bg-white"
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
                    className="w-full rounded border-2 border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-[#0A0A0A] focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded bg-[#DC2626] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>{saving ? 'Guardando...' : 'Guardar Enlaces'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

