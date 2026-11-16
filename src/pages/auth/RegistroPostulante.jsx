import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function RegistroPostulante() {
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: nombre,
          rut,
          rol: 'postulante',
        },
      },
    });

    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage('Postulación registrada. Revisa tu correo para confirmar tu cuenta.');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card title="Postulación a Voluntario" className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}
            {message && (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                {message}
              </p>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                RUT
              </label>
              <input
                type="text"
                required
                placeholder="12.345.678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <Button type="submit" variant="secondary" className="w-full" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar Postulación'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-[#DC2626] hover:underline">
              Inicia sesión
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}

