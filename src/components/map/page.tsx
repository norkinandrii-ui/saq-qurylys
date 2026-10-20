"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { useAppState } from '@/lib/store/AppStateContext';

const MapComponent = dynamic(() => import('@/components/map/DynamicMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#121216] animate-pulse flex items-center justify-center text-amber-500 font-medium">Загрузка интерактивной карты ВКО...</div>
});

export default function FullMapPage() {
  const { projects } = useAppState();

  return (
    <div className="w-full h-[calc(100vh-64px)] relative bg-[#09090b]">
      <MapComponent projects={projects} />
      
      <div className="absolute top-6 right-6 bg-[#121216]/95 backdrop-blur-md p-4 rounded-2xl border border-zinc-700 shadow-2xl z-10 w-72">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-700">
          <MapPin className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold text-white">Усть-Каменогорск (Реестр ГАСК)</h2>
        </div>
        <div className="space-y-2 text-xs font-bold">
          <div className="flex justify-between text-red-400"><span>Красная зона:</span> <span>{projects.filter(p => p.zone === 'red').length} объекта</span></div>
          <div className="flex justify-between text-amber-400"><span>Желтая зона:</span> <span>{projects.filter(p => p.zone === 'yellow').length} объекта</span></div>
          <div className="flex justify-between text-emerald-400"><span>Зеленая зона:</span> <span>{projects.filter(p => p.zone === 'green').length} объекта</span></div>
        </div>
      </div>
    </div>
  );
}