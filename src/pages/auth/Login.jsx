import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleLoginEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMsg('Correo o contraseña incorrectos. Verifica tus credenciales.');
      setLoading(false);
    } else {
      navigate('/mi-perfil');
    }
  };

  const handleLoginGoogle = async () => {
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/mi-perfil`,
      },
    });
    if (error) {
      setErrorMsg(error.message);
    }
  };

  const handleRecuperarPassword = async () => {
    setErrorMsg('');
    setInfoMsg('');
    if (!email.trim()) {
      setErrorMsg('Ingresa tu correo electrónico arriba y luego presiona "¿Olvidaste tu contraseña?".');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/mi-perfil`,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setInfoMsg('Te enviamos un enlace de recuperación a tu correo electrónico.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] lg:flex-row">
      {/* Panel Izquierdo Institucional con Logo Oficial */}
      <div className="relative flex flex-col justify-between border-b-4 border-[#D90429] bg-[#0A0A0A] p-8 text-white lg:w-1/2 lg:border-b-0 lg:border-r-4 lg:p-14">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            <span>Volver al portal</span>
          </Link>
        </div>

        <div className="my-auto flex flex-col items-center py-10 text-center">
          <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#D90429] bg-white p-2 shadow-[0_0_40px_rgba(217,4,41,0.35)]">
            <img
              src="/logo-bre.png"
              alt="Logo O.N.G. BRE Bío-Bío"
              className="h-full w-full rounded-full object-contain"
            />
          </div>

          <h1 className="text-3xl font-black italic tracking-wider text-white sm:text-4xl">
            ACCESO
            <br />
            RESTRINGIDO
          </h1>
          <div className="my-4 h-1 w-12 rounded-full bg-[#D90429]" />
          <p className="max-w-xs text-xs font-medium leading-relaxed text-neutral-300 sm:text-sm">
            Plataforma exclusiva para miembros activos, directiva y postulantes de
            O.N.G. BRE Bío-Bío.
          </p>
        </div>

        <div className="text-center text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          Servir · Apoyar · Preparar · Salvar Vidas
        </div>
      </div>

      {/* Panel Derecho: Formulario de Inicio de Sesión */}
      <div className="flex flex-1 items-center justify-center bg-neutral-100 p-6 sm:p-12">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl sm:p-10">
          <h2 className="text-2xl font-black text-neutral-950">
            Iniciar Sesión
          </h2>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            Ingresa a tu cuenta institucional o de postulante.
          </p>

          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border-l-4 border-[#D90429] bg-red-50 p-3 text-xs font-bold text-red-900">
              <AlertCircle size={16} className="shrink-0 text-[#D90429]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border-l-4 border-emerald-600 bg-emerald-50 p-3 text-xs font-bold text-emerald-900">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{infoMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLoginGoogle}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-xs font-black text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-[11px] font-bold text-neutral-400">
              O ingresa con tu correo
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <form onSubmit={handleLoginEmail} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-neutral-700">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@brebiobio.cl"
                  className="w-full rounded-xl border border-neutral-300 py-3 pl-10 pr-4 text-sm font-semibold text-neutral-900 outline-none focus:border-[#D90429]"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-neutral-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handleRecuperarPassword}
                  className="text-[11px] font-bold text-[#D90429] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-300 py-3 pl-10 pr-4 text-sm font-semibold text-neutral-900 outline-none focus:border-[#D90429]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#D90429] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Verificando acceso...' : 'Acceder al Panel'}
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-100 pt-5 text-center">
            <p className="text-xs font-medium text-neutral-600">
              ¿No tienes cuenta y deseas unirte a BRE Bío-Bío?
            </p>
            <Link
              to="/postular"
              className="mt-1 inline-block text-xs font-black uppercase tracking-wider text-[#D90429] hover:underline"
            >
              Postula aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}