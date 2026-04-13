"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import api from '@/lib/api';
import Link from 'next/link';

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/recover", { email });

      setSuccess("Se o e-mail existir, enviaremos instruções de recuperação.");
    } catch {
      setError("Erro ao tentar recuperar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br p-4 relative overflow-hidden">

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
            {/* <span className="text-4xl">🚀</span> */}
            <img src="/taskflow/logov2.png" alt="ABBATECH" style={{ width: 120 }} />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">
            Recuperar acesso
          </h1>

          <p className="text-indigo-100/60 mt-2 font-medium">
            Informe seu e-mail para receber o link de recuperação
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            className="
              input
              bg-white/5
              border-white/10
              text-white
              placeholder:text-indigo-200/30
              focus:bg-white/10
              focus:border-white/20
            "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* SUCCESS */}
          {success && (
            <div className="text-green-200 text-xs p-3 rounded-xl bg-green-500/10 border border-green-400/20">
              ✅ {success}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="urgent-border text-red-200 text-xs p-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="
              w-full
              h-12
              px-4
              py-2
              bg-blue-500/10
              hover:bg-blue-500/20
              text-blue-400
              text-sm
              font-bold
              border
              border-blue-500/20
              rounded-xl
            "
            disabled={loading}
          >
            Enviar link de recuperação
          </button>

        </form>

        {/* FOOTER */}
        <p className="text-center mt-8 text-indigo-100/40 text-xs font-medium">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-white hover:underline">
            Voltar para login
          </Link>
        </p>

      </div>
    </div>
  );
}
