import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-900/50 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo / Nome */}
        <div className="text-sm text-slate-400 font-bold tracking-tight">
          AbbaTech © {new Date().getFullYear()}
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Tarefas
          </Link>

          <Link
            href="/admin/projects"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Projetos
          </Link>

          <a
            href="#"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Suporte
          </a>
        </div>

        {/* Extra */}
        <div className="text-xs text-slate-500">
          Feito com ⚡
        </div>
      </div>
    </footer>
  );
}