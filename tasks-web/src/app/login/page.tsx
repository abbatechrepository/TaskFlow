'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { login, password });

      // 🔥 salva sessão
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // 🔥 navega + força re-render do layout (CRÍTICO)
      router.push('/');
      router.refresh();

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Credenciais inválidas ou erro no servidor'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br p-4 relative overflow-hidden">
      {/* from-indigo-600 via-blue-700 to-indigo-900 */}

      {/* BACKGROUND FX */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px]" />
      </div>

      {/* CARD */}
      <div className="card w-full max-w-md p-10 rounded-[2rem] shadow-2xl relative z-10">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm border border-white/20">
            <span className="text-4xl">🚀</span>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">
            TaskFlow
          </h1>

          <p className="text-indigo-100/60 mt-2 font-medium">
            Bem-vindo de volta!
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <Input
            label="Usuário ou E-mail"
            placeholder="felipe"
            className="
              input
              bg-white/5
              border-white/10
              text-white
              placeholder:text-indigo-200/30
              focus:bg-white/10
              focus:border-white/20
            "
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            className="
              input
              bg-white/5
              border-white/10
              text-white
              placeholder:text-indigo-200/30
              focus:bg-white/10
              focus:border-white/20
            "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* ERROR */}
          {error && (
            <div className="urgent-border text-red-200 text-xs p-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {/* BUTTON */}
          <Button
            type="submit"
            className="
              btn-blue
              w-full
              h-12
              text-lg
              shadow-xl
              shadow-black/40
            "
            isLoading={loading}
          >
            Entrar no Sistema
          </Button>

        </form>

        {/* FOOTER */}
        <p className="text-center mt-8 text-indigo-100/40 text-xs font-medium">
          Esqueceu sua senha?{' '}
          <a href="/recover-password" className="text-white hover:underline">
            Recuperar acesso
          </a>
        </p>

      </div>
    </div>
  );
}