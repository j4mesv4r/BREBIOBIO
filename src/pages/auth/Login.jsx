import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    navigate('/mi-perfil');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card title="Acceso Área Privada" className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            ¿Quieres unirte a BRE Biobío?{' '}
            <Link to="/registro" className="font-semibold text-[#1E3A8A] hover:underline">
              Postula aquí
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}

