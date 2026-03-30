'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="flex-1 overflow-x-hidden">{children}</main>;
  }

  return (
    <div className="w-full min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-500/30">
      <Navbar />
      <main className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
