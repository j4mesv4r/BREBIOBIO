import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  FileText,
  Lock,
} from 'lucide-react';
import { REGIONES_CHILE } from '../../data/chileRegionesComunas';

const EQUIPOS_OPERATIVOS = [
  'Búsqueda y Rescate',
  'Equipo de Logística',
  'Equipo de Telecomunicaciones',
  'Unidad Técnica de Drones',
  'Unidad de Cuerdas',
  'Unidad K-9 (Canina)',
  'Equipo Audiovisual',
  'Equipo Administrativo',
];

function formatearRutChileno(valor = '') {
  const limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
  if (limpio.length <= 1) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFormateado}-${dv}`;
}

export default function Postular() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    ya_es_voluntario: false,
    nombre_completo: '',
    rut: '',
    fecha_nacimiento: '',
    telefono: '',
    region: 'Región del Biobío',
    comuna: 'Concepción',
    experiencia_previa: false,
    detalle_experiencia: '',
    formacion_afines: false,
    detalle_formacion_cursos: '',
    motivacion: '',
    disp_entrenamientos: 'Si',
    disp_emergencias_biobio: 'Si',
    condicion_medica_terreno: false,
    detalle_condicion_medica: '',
    equipos_interes: ['Búsqueda y Rescate'],
    autorizacion_parental_confirmada: false,
    nombre_apoderado: '',
    telefono_apoderado: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        ya_es_voluntario: Boolean(profile.ya_es_voluntario || prev.ya_es_voluntario),
        nombre_completo:
          profile.nombre_completo ||
          user?.user_metadata?.full_name ||
          prev.nombre_completo,
        rut: profile.rut ? formatearRutChileno(profile.rut) : prev.rut,
        fecha_nacimiento: profile.fecha_nacimiento
          ? String(profile.fecha_nacimiento).slice(0, 10)
          : prev.fecha_nacimiento,
        telefono: profile.telefono || prev.telefono,
        region: profile.region || prev.region,
        comuna: profile.comuna || prev.comuna,
        experiencia_previa: Boolean(profile.experiencia_previa),
        detalle_experiencia: profile.detalle_experiencia || '',
        formacion_afines: Boolean(profile.formacion_afines),
        detalle_formacion_cursos: profile.detalle_formacion_cursos || '',
        motivacion: profile.motivacion || '',
        disp_entrenamientos: profile.disp_entrenamientos || 'Si',
        disp_emergencias_biobio: profile.disp_emergencias_biobio || 'Si',
        condicion_medica_terreno: Boolean(profile.condicion_medica_terreno),
        detalle_condicion_medica: profile.detalle_condicion_medica || '',
        equipos_interes:
          Array.isArray(profile.equipos_interes) && profile.equipos_interes.length > 0
            ? profile.equipos_interes
            : prev.equipos_interes,
        nombre_apoderado: profile.nombre_apoderado || '',
        telefono_apoderado: profile.telefono_apoderado || '',
        autorizacion_parental_confirmada: Boolean(profile.es_menor_autorizado),
      }));
    } else if (user?.user_metadata?.full_name) {
      setFormData((prev) => ({
        ...prev,
        nombre_completo: prev.nombre_completo || user.user_metadata.full_name,
      }));
    }
  }, [profile, user]);

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return null;
    const hoy = new Date();
    const cumple = new Date(`${fechaNac}T12:00:00`);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
      edad--;
    }
    return edad;
  };

  const edadActual = calcularEdad(formData.fecha_nacimiento);
  const esMenorDeEdad =
    !formData.ya_es_voluntario &&
    edadActual !== null &&
    edadActual >= 16 &&
    edadActual < 18;
  const esMenorDe16 =
    !formData.ya_es_voluntario && edadActual !== null && edadActual < 16;

  const comunasDisponibles =
    REGIONES_CHILE.find((r) => r.region === formData.region)?.comunas || [
      'Concepción',
      'San Pedro de la Paz',
    ];

  const toggleEquipoInteres = (equipo) => {
    setFormData((prev) => {
      const existe = prev.equipos_interes.includes(equipo);
      const siguientes = existe
        ? prev.equipos_interes.filter((item) => item !== equipo)
        : [...prev.equipos_interes, equipo];
      return {
        ...prev,
        equipos_interes: siguientes.length > 0 ? siguientes : ['Búsqueda y Rescate'],
      };
    });
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/postular`,
      },
    });
    if (error) setErrorMsg('No se pudo conectar con Google: ' + error.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (esMenorDe16) {
      setErrorMsg('La edad mínima de postulación institucional es de 16 años.');
      return;
    }

    if (
      esMenorDeEdad &&
      (!formData.autorizacion_parental_confirmada ||
        !formData.nombre_apoderado.trim())
    ) {
      setErrorMsg(
        'Los postulantes de 16 y 17 años deben contar con autorización expresa de sus padres o apoderados.'
      );
      return;
    }

    setLoading(true);
    try {
      const rutLimpio = formatearRutChileno(formData.rut);
      const digitosRut = rutLimpio.replace(/[^0-9]/g, '');
      const codigoBre =
        profile?.codigo_credencial ||
        (digitosRut.length >= 6 ? `BRE-${digitosRut.slice(0, 6)}` : null);

      const payloadPerfil = {
        ya_es_voluntario: Boolean(formData.ya_es_voluntario),
        nombre_completo: formData.nombre_completo.trim(),
        rut: rutLimpio,
        codigo_credencial: codigoBre,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        telefono: formData.telefono.trim(),
        region: formData.region,
        comuna: formData.comuna.trim(),
        experiencia_previa: Boolean(formData.experiencia_previa),
        detalle_experiencia: formData.experiencia_previa
          ? formData.detalle_experiencia.trim()
          : '',
        formacion_afines: Boolean(formData.formacion_afines),
        detalle_formacion_cursos: formData.formacion_afines
          ? formData.detalle_formacion_cursos.trim()
          : '',
        motivacion: formData.motivacion.trim(),
        disp_entrenamientos: formData.disp_entrenamientos,
        disp_emergencias_biobio: formData.disp_emergencias_biobio,
        condicion_medica_terreno: Boolean(formData.condicion_medica_terreno),
        detalle_condicion_medica: formData.condicion_medica_terreno
          ? formData.detalle_condicion_medica.trim() || 'Especificado por postulante'
          : 'Ninguna',
        alergias: formData.condicion_medica_terreno
          ? formData.detalle_condicion_medica.trim() || profile?.alergias || 'Ninguna'
          : profile?.alergias || 'Ninguna',
        equipos_interes: formData.equipos_interes,
        especialidades_pendientes: formData.equipos_interes,
        es_menor_autorizado: esMenorDeEdad,
        nombre_apoderado: esMenorDeEdad ? formData.nombre_apoderado.trim() : null,
        telefono_apoderado: esMenorDeEdad
          ? formData.telefono_apoderado.trim()
          : null,
        rol:
          (profile?.rol || 'postulante').toLowerCase() === 'postulante'
            ? 'postulante'
            : profile.rol,
        estado_validacion:
          profile?.estado_validacion === 'aprobado' ? 'aprobado' : 'pendiente',
        onboarding_completado: true,
      };

      if (user) {
        const { error } = await supabase
          .from('perfiles')
          .update({
            ...payloadPerfil,
            email: user.email,
          })
          .eq('id', user.id);

        if (error) throw error;

        await supabase.from('notificaciones_directorio').insert([
          {
            perfil_origen_id: user.id,
            tipo: 'antecedentes',
            titulo: formData.ya_es_voluntario
              ? `Solicitud de acceso (Declara ya ser voluntario): ${formData.nombre_completo.trim()}`
              : `Nueva ficha de postulación: ${formData.nombre_completo.trim()}`,
            detalle: `RUT: ${rutLimpio} · Comuna: ${formData.comuna} · Equipos: ${formData.equipos_interes.join(', ')}`,
            leida: false,
          },
        ]);

        if (refreshProfile) await refreshProfile();
      } else {
        const { error } = await supabase.from('postulaciones').insert([
          {
            ...payloadPerfil,
            estado: 'pendiente',
          },
        ]);
        if (error) throw error;
      }

      setEnviado(true);
    } catch (err) {
      setErrorMsg(
        err.message || 'Ocurrió un error al guardar la información de postulación.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-xl space-y-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-[0_25px_50px_-12px_rgba(15,23,42,0.18)] sm:p-10">
          <div className="absolute inset-x-0 top-0 h-2.5 bg-gradient-to-r from-[#D90429] via-[#F2B632] to-[#D90429]" />

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-b from-[#FFD25A] to-[#F2B632] text-[#0A0A0A] shadow-md">
            <Clock size={38} strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-lg bg-[#0A0A0A] px-3.5 py-1 text-xs font-black uppercase tracking-widest text-[#F2B632]">
              Ficha Guardada · En Revisión de Directorio
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#0A0A0A] sm:text-3xl">
              Solicitud Registrada en el Sistema
            </h1>
          </div>

          <p className="text-sm font-semibold leading-relaxed text-neutral-700">
            Tu información quedó guardada directamente en la ficha de{' '}
            <strong>Postulantes / Directorio</strong> de{' '}
            <strong>O.N.G. BRE BÍO-BÍO</strong> para su validación institucional.
          </p>

          <div className="space-y-1.5 rounded-2xl border border-neutral-200 bg-neutral-100 p-4 text-left text-xs font-bold text-neutral-700">
            <p className="flex items-center gap-2 font-black uppercase text-[#0A0A0A]">
              <Lock size={14} className="text-[#D90429]" /> Resumen Guardado
            </p>
            <p>Nombre: {formData.nombre_completo}</p>
            <p>RUT: {formatearRutChileno(formData.rut)}</p>
            <p>
              Condición declarada:{' '}
              {formData.ya_es_voluntario ? 'Ya soy voluntario' : 'Postulante'}
            </p>
            <p>Equipos: {formData.equipos_interes.join(' · ')}</p>
          </div>

          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-xs font-black uppercase text-neutral-800 hover:bg-neutral-100"
          >
            Revisar o Editar Información Guardada
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#D90429] via-[#B8001F] to-[#0A0A0A] p-8 text-white shadow-[0_20px_45px_-12px_rgba(217,4,41,0.35)]">
          <span className="inline-block rounded-lg bg-[#F2B632] px-3 py-1 text-xs font-black uppercase tracking-widest text-[#0A0A0A]">
            Acceso y Ficha de Postulación · ONG BRE BÍO-BÍO
          </span>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Postulación y Solicitud de Acceso
          </h1>
          <p className="mt-2 text-sm font-semibold text-white/90">
            Completa tu ficha directamente en la plataforma para que quede
            disponible en el Directorio y Postulantes. Si ya formas parte del
            cuerpo, marca la opción correspondiente.
          </p>
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg sm:flex-row">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-[#0A0A0A]">
                Vincula tu cuenta Gmail para crear tu perfil
              </h2>
              <p className="mt-0.5 text-xs font-semibold text-neutral-600">
                Al conectar tu correo, tus antecedentes quedarán asociados a tu
                ficha para revisión del Directorio.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-2xl bg-[#0A0A0A] px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-neutral-800"
            >
              <UserPlus size={16} className="text-[#F2B632]" />
              <span>Continuar con Gmail</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-950">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <span>
              Cuenta conectada: <strong>{user.email}</strong>. Completa los
              datos de tu ficha de postulación.
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12)] sm:p-10"
        >
          {errorMsg && (
            <div className="flex items-start gap-3 rounded-r-xl border-l-4 border-[#D90429] bg-red-50 p-4 text-xs font-bold text-red-900">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-[#D90429]"
              />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Opción: Ya soy voluntario */}
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 border-[#0A0A0A] bg-amber-50/70 p-4">
            <div>
              <span className="block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                Ya soy voluntario de ONG BRE Bío-Bío
              </span>
              <span className="block text-xs font-semibold text-neutral-600">
                Marca esta casilla si ya perteneces a la institución y estás
                registrando o actualizando tu ficha de acceso.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.ya_es_voluntario}
              onChange={(e) =>
                setFormData({ ...formData, ya_es_voluntario: e.target.checked })
              }
              className="h-5 w-5 rounded border-neutral-400 text-[#D90429]"
            />
          </label>

          {/* Datos Personales */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                Nombre Completo (Nombres y Apellidos) *
              </label>
              <input
                type="text"
                required
                value={formData.nombre_completo}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_completo: e.target.value })
                }
                placeholder="Ej: Juan Pablo Rojas Torres"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold outline-none focus:border-[#D90429]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                RUT / RUN *
              </label>
              <input
                type="text"
                required
                value={formData.rut}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rut: formatearRutChileno(e.target.value),
                  })
                }
                placeholder="Ej: 18.123.456-7"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold outline-none focus:border-[#D90429]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                required
                value={formData.fecha_nacimiento}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_nacimiento: e.target.value })
                }
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold outline-none focus:border-[#D90429]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                Teléfono de Contacto (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                placeholder="+56 9 1234 5678"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold outline-none focus:border-[#D90429]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                Región *
              </label>
              <select
                value={formData.region}
                onChange={(e) => {
                  const nuevaReg = e.target.value;
                  const primeraComuna =
                    REGIONES_CHILE.find((r) => r.region === nuevaReg)
                      ?.comunas?.[0] || '';
                  setFormData({
                    ...formData,
                    region: nuevaReg,
                    comuna: primeraComuna,
                  });
                }}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#D90429]"
              >
                {REGIONES_CHILE.map((r) => (
                  <option key={r.region} value={r.region}>
                    {r.region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                Comuna de Residencia *
              </label>
              <select
                value={formData.comuna}
                onChange={(e) =>
                  setFormData({ ...formData, comuna: e.target.value })
                }
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#D90429]"
              >
                {comunasDisponibles.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {esMenorDeEdad && (
            <div className="space-y-4 rounded-2xl border-2 border-[#F2B632] bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={24}
                  className="mt-0.5 shrink-0 text-[#D90429]"
                />
                <div>
                  <h3 className="text-sm font-black uppercase text-[#0A0A0A]">
                    Protocolo para Postulantes de 16 y 17 Años
                  </h3>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-neutral-700">
                    Para postular con {edadActual} años se requiere autorización
                    expresa de padres o apoderados.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-[#0A0A0A]">
                    Nombre Padre / Madre o Apoderado *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre_apoderado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombre_apoderado: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-[#0A0A0A]">
                    Teléfono del Apoderado *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefono_apoderado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefono_apoderado: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 text-xs font-bold text-[#0A0A0A]">
                <input
                  type="checkbox"
                  checked={formData.autorizacion_parental_confirmada}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      autorizacion_parental_confirmada: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-neutral-400 text-[#D90429]"
                />
                <span>
                  Declaro contar con autorización expresa de mis padres o
                  apoderados.
                </span>
              </label>
            </div>
          )}

          {/* Evaluación de Perfil */}
          <div className="space-y-4 border-t border-neutral-100 pt-5">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                1.- ¿Tienes experiencia previa en voluntariado o grupos de
                emergencia?[cite: 22]
              </label>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, experiencia_previa: val })
                    }
                    className={`rounded-xl px-4 py-2 text-xs font-black uppercase ${formData.experiencia_previa === val
                        ? 'bg-[#0A0A0A] text-[#F2B632]'
                        : 'border border-neutral-300 bg-white text-neutral-700'
                      }`}
                  >
                    {val ? 'Sí' : 'No'}
                  </button>
                ))}
              </div>
              {formData.experiencia_previa && (
                <textarea
                  rows={2}
                  value={formData.detalle_experiencia}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detalle_experiencia: e.target.value,
                    })
                  }
                  placeholder="Especifica dónde y qué función realizaste..."
                  className="mt-2.5 w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#D90429]"
                />
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                2.- ¿Cuentas con formación en primeros auxilios, rescate,
                orientación u otras áreas afines?[cite: 24]
              </label>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, formacion_afines: val })
                    }
                    className={`rounded-xl px-4 py-2 text-xs font-black uppercase ${formData.formacion_afines === val
                        ? 'bg-[#0A0A0A] text-[#F2B632]'
                        : 'border border-neutral-300 bg-white text-neutral-700'
                      }`}
                  >
                    {val ? 'Sí' : 'No'}
                  </button>
                ))}
              </div>
              {formData.formacion_afines && (
                <textarea
                  rows={2}
                  value={formData.detalle_formacion_cursos}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detalle_formacion_cursos: e.target.value,
                    })
                  }
                  placeholder="Indica el nombre del curso y el año en que lo realizaste..."
                  className="mt-2.5 w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#D90429]"
                />
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                3.- ¿Por qué te gustaría ser parte de la ONG BRE Bío-Bío? *[cite: 25]
              </label>
              <textarea
                rows={3}
                required
                value={formData.motivacion}
                onChange={(e) =>
                  setFormData({ ...formData, motivacion: e.target.value })
                }
                placeholder="Cuéntanos tu motivación y cómo deseas aportar..."
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#D90429]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  4.- Disponibilidad para entrenamientos presenciales (al menos
                  1 vez al mes)[cite: 26]
                </label>
                <select
                  value={formData.disp_entrenamientos}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disp_entrenamientos: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-bold"
                >
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                  <option value="Si, pero dependo de mi turno laboral">
                    Sí, pero dependo de mi turno laboral
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                  5.- Disponibilidad para emergencias en Región del Biobío[cite: 26]
                </label>
                <select
                  value={formData.disp_emergencias_biobio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disp_emergencias_biobio: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-bold"
                >
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                  <option value="De forma ocasional">De forma ocasional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                6.- ¿Tienes alguna condición médica o física que debamos
                conocer para actividades en terreno?[cite: 27]
              </label>
              <div className="flex gap-3">
                {[false, true].map((tieneCond) => (
                  <button
                    key={String(tieneCond)}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        condicion_medica_terreno: tieneCond,
                      })
                    }
                    className={`rounded-xl px-4 py-2 text-xs font-black uppercase ${formData.condicion_medica_terreno === tieneCond
                        ? 'bg-[#0A0A0A] text-[#F2B632]'
                        : 'border border-neutral-300 bg-white text-neutral-700'
                      }`}
                  >
                    {tieneCond ? 'Sí (Especificar)' : 'No'}
                  </button>
                ))}
              </div>
              {formData.condicion_medica_terreno && (
                <input
                  type="text"
                  value={formData.detalle_condicion_medica}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detalle_condicion_medica: e.target.value,
                    })
                  }
                  placeholder="Especifica tu condición médica, alergia o restricción..."
                  className="mt-2.5 w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#D90429]"
                />
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#0A0A0A]">
                Áreas o Equipos Operativos de Interés[cite: 27]
              </label>
              <div className="flex flex-wrap gap-2">
                {EQUIPOS_OPERATIVOS.map((eq) => {
                  const activo = formData.equipos_interes.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipoInteres(eq)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${activo
                          ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F2B632]'
                          : 'border-neutral-300 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                      {eq}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || esMenorDe16}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-b from-[#F01436] via-[#D90429] to-[#A3001B] px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_14px_28px_-6px_rgba(217,4,41,0.5)] transition-all hover:brightness-110 disabled:opacity-50 sm:text-sm"
          >
            <FileText size={18} strokeWidth={2.5} />
            <span>
              {loading
                ? 'Guardando Ficha...'
                : 'Guardar Información de Postulación'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}