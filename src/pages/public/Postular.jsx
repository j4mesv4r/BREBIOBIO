import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  CheckCircle2,
  UserPlus,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Postular() {
  const { user, profile, setProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    nombre_completo: '',
    rut: '',
    fecha_nacimiento: '',
    telefono: '',
    comuna: 'San Pedro de la Paz',
    especialidad: 'Búsqueda y Rescate Terrestre',
    motivacion: '',
    autorizacion_parental: false,
    nombre_apoderado: '',
    telefono_apoderado: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        nombre_completo: profile.nombre_completo || prev.nombre_completo,
        rut: profile.rut || prev.rut,
        fecha_nacimiento: profile.fecha_nacimiento || prev.fecha_nacimiento,
        telefono: profile.telefono || prev.telefono,
        comuna: profile.comuna || prev.comuna,
        especialidad: profile.especialidad || prev.especialidad,
        motivacion: profile.motivacion || prev.motivacion,
        nombre_apoderado: profile.nombre_apoderado || prev.nombre_apoderado,
        telefono_apoderado: profile.telefono_apoderado || prev.telefono_apoderado,
      }));

      if (profile.estado_validacion === 'pendiente' && profile.rut) {
        setEnviado(true);
      }
    }
  }, [profile]);

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return null;
    const hoy = new Date();
    const cumple = new Date(fechaNac);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
      edad--;
    }
    return edad;
  };

  const edadActual = calcularEdad(formData.fecha_nacimiento);
  const esMenorAutorizado = edadActual !== null && edadActual >= 16 && edadActual < 18;
  const esMenorDe16 = edadActual !== null && edadActual < 16;

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/postular`,
      },
    });
    if (error) {
      setErrorMsg('No se pudo conectar con Google: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Primero vincula tu cuenta con Google o regístrate para crear tu ficha de postulante.');
      return;
    }

    if (esMenorDe16) {
      setErrorMsg('La edad mínima de postulación institucional es de 16 años.');
      return;
    }

    if (esMenorAutorizado && (!formData.autorizacion_parental || !formData.nombre_apoderado.trim())) {
      setErrorMsg(
        'Los postulantes de 16 y 17 años deben ingresar los datos y confirmar autorización expresa de sus padres o apoderados.'
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre_completo: formData.nombre_completo.trim(),
        rut: formData.rut.trim(),
        fecha_nacimiento: formData.fecha_nacimiento,
        telefono: formData.telefono.trim(),
        comuna: formData.comuna.trim(),
        especialidad: esMenorAutorizado
          ? 'Apoyo Administrativo / Terreno Seguro (Menor Autorizado)'
          : formData.especialidad,
        motivacion: formData.motivacion.trim(),
        es_menor_autorizado: esMenorAutorizado,
        nombre_apoderado: esMenorAutorizado ? formData.nombre_apoderado.trim() : null,
        telefono_apoderado: esMenorAutorizado ? formData.telefono_apoderado.trim() : null,
      };

      const { data, error } = await supabase
        .from('perfiles')
        .update(payload)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (data && setProfile) setProfile(data);
      setEnviado(true);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo enviar la postulación.');
    } finally {
      setLoading(false);
    }
  };

  const etapas = [
    {
      paso: '01',
      titulo: 'Registro y Antecedentes',
      desc: 'Crea tu cuenta e ingresa tus datos básicos de identificación, edad y área de apoyo.',
    },
    {
      paso: '02',
      titulo: 'Revisión del Directorio',
      desc: 'Tu solicitud queda en espera de validación por el Directorio o Superadministrador.',
    },
    {
      paso: '03',
      titulo: 'Evaluación e Instrucción',
      desc: 'Una vez autorizado tu perfil, accedes al ciclo de capacitación como Colaborador o Voluntario.',
    },
  ];

  if (enviado || (profile?.estado_validacion === 'pendiente' && profile?.rut)) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200 shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_25px_50px_-12px_rgba(15,23,42,0.18)] text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-[#D90429] via-[#F2B632] to-[#D90429]" />

          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-b from-[#FFD25A] to-[#F2B632] text-[#0A0A0A] flex items-center justify-center shadow-[0_12px_25px_-5px_rgba(242,182,50,0.5)]">
            <Clock size={38} strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <span className="inline-block bg-[#0A0A0A] text-[#F2B632] px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest">
              Estado: En Espera de Autorización
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">
              Postulación Recibida Correctamente
            </h1>
          </div>

          <p className="text-sm font-semibold text-neutral-700 leading-relaxed">
            Tus antecedentes básicos han sido registrados en el sistema de la{' '}
            <strong>O.N.G. BRE BÍO-BÍO</strong>. Tu solicitud queda en espera de revisión y autorización por parte del{' '}
            <strong>Directorio / Superadministrador</strong> para habilitar tu perfil operativo y credencial institucional.
          </p>

          <div className="bg-neutral-100 rounded-2xl p-4 text-left text-xs font-bold text-neutral-700 space-y-1.5 border border-neutral-200">
            <p className="flex items-center gap-2 text-[#0A0A0A] font-black uppercase">
              <Lock size={14} className="text-[#D90429]" /> Control de Acceso Institucional
            </p>
            <p>
              Mientras tu perfil permanezca en estado <strong>Pendiente</strong>, los permisos internos y la emisión de credencial estarán restringidos hasta su validación formal.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/mi-perfil"
              className="inline-flex items-center justify-center bg-[#0A0A0A] hover:bg-neutral-800 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
            >
              Ver Estado en Mi Perfil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white font-sans text-neutral-950">
      <section className="border-b-4 border-amber-400 bg-neutral-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-l-4 border-red-600 pl-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Reclutamiento Oficial · BRE Biobío
            </span>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Postulación de Voluntarios
            </h1>
            <p className="mt-3 max-w-2xl text-base font-semibold text-neutral-300">
              Ingresa tus antecedentes básicos para iniciar el proceso de admisión. Tu ficha quedará en espera de validación por el Directorio antes de habilitar tu perfil operativo[cite: 38].
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-12">
            {/* Columna Izquierda: Requisitos y Etapas */}
            <div className="space-y-6 lg:col-span-5">
              <div className="border-l-4 border-red-600 pl-4">
                <h2 className="flex items-center gap-2 text-2xl font-black uppercase text-black">
                  <ClipboardCheck className="text-red-600" size={26} />
                  Requisitos de Ingreso
                </h2>
              </div>

              <ul className="space-y-3 text-sm font-bold text-neutral-800">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-red-600" />
                  <span>
                    Edad mínima de <strong>16 años</strong>. Postulantes de <strong>16 y 17 años</strong> requieren autorización expresa de padres o apoderados para labores administrativas u operativas seguras sin riesgo físico.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-red-600" />
                  <span>
                    Salud física y mental compatible con la función o área de apoyo a la que postula.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-red-600" />
                  <span>
                    Disposición formal para asistir a capacitaciones, acuartelamientos y simulacros.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-red-600" />
                  <span>
                    Acatar los estatutos (Ley N° 20.500), reglamento interno y código de ética de la O.N.G. BRE BIO BIO[cite: 38].
                  </span>
                </li>
              </ul>

              <div className="space-y-4 pt-2">
                {etapas.map((etapa) => (
                  <div
                    key={etapa.paso}
                    className="rounded-xl border-2 border-neutral-950 bg-neutral-50 p-4"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="inline-block rounded bg-red-600 px-2.5 py-0.5 text-xs font-black text-white">
                        {etapa.paso}
                      </span>
                      <h3 className="text-sm font-black uppercase text-black">
                        {etapa.titulo}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold leading-relaxed text-neutral-700">
                      {etapa.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Formulario de Postulación */}
            <div className="lg:col-span-7 space-y-6">
              {!user ? (
                <div className="rounded-2xl border-2 border-neutral-950 bg-amber-400 p-6 shadow-[6px_6px_0px_0px_#0a0a0a] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">
                      Paso 1 · Identificación Digital
                    </span>
                    <h3 className="text-lg font-black uppercase text-black">
                      Vincula tu cuenta para postular
                    </h3>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">
                      Conecta con Google o{' '}
                      <Link to="/registro" className="underline">
                        regístrate con correo
                      </Link>{' '}
                      para habilitar el formulario.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
                  >
                    <UserPlus size={16} className="text-amber-400" />
                    <span>Continuar con Google</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex items-center gap-3 text-xs font-bold text-emerald-950">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <span>
                    Cuenta vinculada: <strong>{user.email}</strong>. Completa tus antecedentes abajo para enviar tu postulación a revisión.
                  </span>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border-2 border-neutral-950 bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0a0a0a] space-y-5"
              >
                <h3 className="text-lg font-black uppercase text-black border-b-2 border-neutral-100 pb-3">
                  Ficha de Antecedentes Básicos
                </h3>

                {errorMsg && (
                  <div className="rounded-xl border-l-4 border-red-600 bg-red-50 p-3.5 flex items-start gap-2.5 text-xs font-bold text-red-900">
                    <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-900 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre_completo}
                      onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                      placeholder="Nombres y Apellidos"
                      className="w-full rounded-xl border-2 border-neutral-200 px-3.5 py-2.5 text-sm font-semibold focus:border-red-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-900 mb-1">
                      RUT *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.rut}
                      onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                      placeholder="18.123.456-7"
                      className="w-full rounded-xl border-2 border-neutral-200 px-3.5 py-2.5 text-sm font-semibold focus:border-red-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-900 mb-1">
                      Fecha de Nacimiento (Desde 16 años) *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_nacimiento}
                      onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                      className="w-full rounded-xl border-2 border-neutral-200 px-3.5 py-2.5 text-sm font-semibold focus:border-red-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-900 mb-1">
                      Teléfono de Contacto *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+56 9 1234 5678"
                      className="w-full rounded-xl border-2 border-neutral-200 px-3.5 py-2.5 text-sm font-semibold focus:border-red-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-900 mb-1">
                      Comuna *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.comuna}
                      onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                      className="w-full rounded-xl border-2 border-neutral-200 px-3.5 py-2.5 text-sm font-semibold focus:border-red-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-900 mb-1">
                      Área de Interés *
                    </label>
                    <select
                      value={formData.especialidad}
                      onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                      disabled={esMenorAutorizado}
                      className="w-full rounded-xl border-2 border-neutral-200 px-3.5 py-2.5 text-sm font-semibold bg-white focus:border-red-600 outline-none disabled:bg-neutral-100"
                    >
                      <option value="Búsqueda y Rescate Terrestre">Búsqueda y Rescate Terrestre</option>
                      <option value="Primeros Auxilios y Soporte Vital">Primeros Auxilios y Soporte Vital</option>
                      <option value="Rescate Técnico en Altura">Rescate Técnico en Altura</option>
                      <option value="Emergencias, Logística y Protección Civil">Emergencias, Logística y Protección Civil</option>
                      <option value="Apoyo Administrativo y Comunicaciones">Apoyo Administrativo y Comunicaciones</option>
                    </select>
                  </div>
                </div>

                {esMenorAutorizado && (
                  <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck size={22} className="text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black uppercase text-black">
                          Autorización Parental Obligatoria ({edadActual} años)
                        </h4>
                        <p className="text-xs font-semibold text-neutral-800 mt-1">
                          Al tener entre 16 y 17 años, tu participación se orientará a labores administrativas u operativas en terreno sin riesgo físico, requiriendo autorización expresa de tu apoderado.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={formData.nombre_apoderado}
                        onChange={(e) => setFormData({ ...formData, nombre_apoderado: e.target.value })}
                        placeholder="Nombre completo Padre/Madre o Apoderado *"
                        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
                      />
                      <input
                        type="tel"
                        required
                        value={formData.telefono_apoderado}
                        onChange={(e) => setFormData({ ...formData, telefono_apoderado: e.target.value })}
                        placeholder="Teléfono del Apoderado *"
                        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <label className="flex items-start gap-2 text-xs font-bold text-neutral-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autorizacion_parental}
                        onChange={(e) =>
                          setFormData({ ...formData, autorizacion_parental: e.target.checked })
                        }
                        className="mt-0.5"
                      />
                      <span>
                        Confirmo contar con autorización expresa de mis padres o apoderados para participar en actividades seguras de la ONG.
                      </span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-900 mb-1">
                    Motivación o Experiencia Previa
                  </label>
                  <textarea
                    rows={3}
                    value={formData.motivacion}
                    onChange={(e) => setFormData({ ...formData, motivacion: e.target.value })}
                    placeholder="Cuéntanos brevemente tu motivación o experiencia previa..."
                    className="w-full rounded-xl border-2 border-neutral-200 px-3.5 py-2.5 text-sm font-semibold focus:border-red-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !user || esMenorDe16}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-6 py-4 text-xs font-black uppercase tracking-wider text-white transition-colors"
                >
                  <FileText size={18} />
                  <span>{loading ? 'Registrando Postulación...' : 'Enviar Solicitud de Postulación'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}