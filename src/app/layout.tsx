import React, { Suspense } from 'react';
// @ts-ignore Next.js loads global CSS at runtime; it has no TypeScript module declaration.
import './globals.css';
import Link from 'next/link';
import { Shield, Map, LayoutDashboard, Megaphone, Cpu, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'SAQ QURYLYS | Система мониторинга рисков ДДУ ВКО',
  description: 'GovTech-платформа мониторинга долевого строительства г. Усть-Каменогорск (GroundZero)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className="bg-[#09090b] text-zinc-100 font-sans antialiased min-h-screen flex flex-col selection:bg-amber-500/30">
        
        <header className="bg-[#121216] border-b border-zinc-800 sticky top-0 z-50 shadow-2xl w-full">
          <div className="w-full px-4 lg:px-8 h-16 flex items-center justify-between">
            
            <div className="flex items-center gap-8">
              <Link href="/?tab=analytics" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/30 shadow-inner">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-wide">
                    SAQ <span className="text-amber-500">QURYLYS</span>
                  </h1>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                    GovTech ВКО / GroundZero
                  </p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-2 border-l border-zinc-800 pl-6">
                <Link
                  href="/?tab=map"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all text-zinc-200 hover:text-amber-400 hover:bg-zinc-800/70 border border-transparent hover:border-zinc-700"
                >

<Map className="w-4 h-4 text-amber-500" />
Интерактивная карта
                </Link>
                <Link
                  href="/?tab=analytics"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all text-zinc-200 hover:text-amber-400 hover:bg-zinc-800/70 border border-transparent hover:border-zinc-700"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-500" /> Дашборд и Аналитика
                </Link>
                <Link
                  href="/?tab=ads"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all text-zinc-200 hover:text-amber-400 hover:bg-zinc-800/70 border border-transparent hover:border-zinc-700"
                >
                  <Megaphone className="w-4 h-4 text-amber-500" /> Мониторинг рекламы (AI)
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Реестры: Qazreestr • КЖК • ГАСК ВКО
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                <Cpu className="w-3.5 h-3.5" /> AI NLP Core Online
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full relative">
          <Suspense fallback={<div className="p-12 text-center text-amber-500 font-bold">Загрузка SAQ QURYLYS...</div>}>
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  );
}