"use client";

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppState } from '@/lib/store/AppStateContext';
import { ShieldAlert, ShieldCheck, Shield, Search, Building2, Activity, ListFilter } from 'lucide-react';
import Link from 'next/link';

// Карта грузится динамически
const MapComponent = dynamic(() => import('@/components/map/DynamicMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1E293B] animate-pulse flex items-center justify-center text-slate-400 font-medium">Загрузка картографии...</div>
});

export default function MapDashboard() {
  const { projects } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all');

  const metrics = useMemo(() => {
    return {
      total: projects.length,
      red: projects.filter(p => p.zone === 'red').length,
      yellow: projects.filter(p => p.zone === 'yellow').length,
      green: projects.filter(p => p.zone === 'green').length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.bin.includes(searchTerm);
      const matchesZone = filterZone === 'all' || p.zone === filterZone;
      return matchesSearch && matchesZone;
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [projects, searchTerm, filterZone]);

  return (
    <div className="h-full flex flex-col bg-[#0B1120] min-h-screen font-sans selection:bg-blue-500/30">
      
      {/* 1. ПАНЕЛЬ УПРАВЛЕНИЯ СВЕРХУ (ГРАФИТОВАЯ С СИНИМИ АКЦЕНТАМИ) */}
      <div className="bg-[#111827] border-b border-slate-800 shadow-xl sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto p-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-inner">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Панель Аналитика</h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">GovTech / Усть-Каменогорск</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row items-center gap-4 w-full md:max-w-3xl justify-end">
            {/* Строка поиска */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Поиск по БИН или названию ЖК..." 
                className="w-full pl-9 pr-4 py-2 bg-[#0B1120] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Кнопки-фильтры */}
            <div className="flex bg-[#0B1120] p-1 rounded-xl border border-slate-700 shadow-inner">
              <button 
                onClick={() => setFilterZone('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterZone === 'all' ? 'bg-[#1E293B] text-blue-400 shadow-md border border-slate-700' : 'text-slate-400 hover:text-white'}`}
              >Все зоны</button>
              <button 
                onClick={() => setFilterZone('red')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterZone === 'red' ? 'bg-red-500 text-white shadow-md' : 'text-red-400 hover:bg-red-950/30'}`}
              >Красная</button>
              <button 
                onClick={() => setFilterZone('yellow')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterZone === 'yellow' ? 'bg-amber-500 text-white shadow-md' : 'text-amber-400 hover:bg-amber-950/30'}`}
              >Желтая</button>
              <button 
                onClick={() => setFilterZone('green')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterZone === 'green' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-400 hover:bg-emerald-950/30'}`}
              >Зеленая</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ОСНОВНОЙ КОНТЕНТ */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
          
          {/* КАРТОЧКИ СТАТИСТИКИ (Контрастные графитовые блоки) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between backdrop-blur-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Все объекты</p>
                <p className="text-3xl font-black text-white">{metrics.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#1E293B] flex items-center justify-center border border-slate-700 shadow-inner">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#111827] to-red-950/40 border border-red-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between backdrop-blur-sm">
              <div>
                <p className="text-xs text-red-400 uppercase font-bold tracking-wider mb-1">Красная зона</p>
                <p className="text-3xl font-black text-red-100">{metrics.red}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-950/50 flex items-center justify-center border border-red-800/50 shadow-inner">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#111827] to-amber-950/40 border border-amber-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between backdrop-blur-sm">
              <div>
                <p className="text-xs text-amber-400 uppercase font-bold tracking-wider mb-1">Желтая зона</p>
                <p className="text-3xl font-black text-amber-100">{metrics.yellow}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-950/50 flex items-center justify-center border border-amber-800/50 shadow-inner">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#111827] to-emerald-950/40 border border-emerald-900/40 p-5 rounded-2xl shadow-lg flex items-center justify-between backdrop-blur-sm">
              <div>
                <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider mb-1">Зеленая зона</p>
                <p className="text-3xl font-black text-emerald-100">{metrics.green}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/50 flex items-center justify-center border border-emerald-800/50 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* ИНТЕРАКТИВНАЯ КАРТА И РЕЕСТР */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* КАРТА С ПЕРЕДАЧЕЙ ФИЛЬТРОВ */}
            <div className="xl:col-span-2 h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative bg-[#1E293B]">
              <MapComponent projects={filteredProjects} />
              <div className="absolute top-4 right-4 bg-[#111827]/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-blue-400 border border-slate-700 flex items-center gap-2 shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                УСТЬ-КАМЕНОГОРСК LIVE
              </div>
            </div>

            {/* ТАБЛИЦА РЕЕСТРА */}
            <div className="xl:col-span-1 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[550px]">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0B1120]">
                <h2 className="font-bold text-sm text-white uppercase tracking-widest flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-blue-400" />
                  Объекты строительства
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-[#1E293B] text-blue-400 border border-slate-700 text-xs font-mono font-bold">{filteredProjects.length} найдено</span>
              </div>
              
              <div className="overflow-y-auto flex-1 p-3 space-y-3">
                {filteredProjects.map(p => (
                  <div key={p.id} className="bg-[#1E293B]/50 border border-slate-800 p-3.5 rounded-xl hover:border-slate-600 transition-colors">
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="text-sm font-bold text-white leading-tight">{p.name}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border ${
                        p.zone === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        p.zone === 'yellow' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {p.totalScore} БАЛЛОВ
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">{p.developer} <span className="text-slate-500">({p.bin})</span></div>
                    <Link href={`/projects/${p.id}`} className="block w-full text-center px-4 py-2 bg-[#0B1120] hover:bg-blue-600 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700 hover:border-blue-500 shadow-sm">
                      ОТКРЫТЬ КАРТОЧКУ
                    </Link>
                  </div>
                ))}
                {filteredProjects.length === 0 && (
                  <div className="p-12 text-center text-slate-500 font-medium text-sm">
                    Ничего не найдено
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}