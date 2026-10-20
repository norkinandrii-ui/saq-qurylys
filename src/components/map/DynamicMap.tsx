"use client";

import React, { useMemo, useState, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
// @ts-ignore
import 'maplibre-gl/dist/maplibre-gl.css';

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('Worker failed to load')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });
  const origError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Worker failed to load')) return;
    origError(...args);
  };
}

// 1. ОФИЦИАЛЬНАЯ ПОДЛОЖКА 2ГИС (С НОМЕРАМИ ДОМОВ И КОРПУСАМИ УСТЬ-КАМЕНОГОРСКА)
const STYLE_2GIS: any = {
  version: 8,
  sources: {
    'dgis-tiles': {
      type: 'raster',
      tiles: [
        'https://tile0.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1.1',
        'https://tile1.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1.1',
        'https://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1.1'
      ],
      tileSize: 256,
      attribution: '© 2ГИС Усть-Каменогорск'
    }
  },
  layers: [
    {
      id: 'dgis-layer',
      type: 'raster',
      source: 'dgis-tiles',
      minzoom: 0,
      maxzoom: 18
    }
  ],
};

// 2. ПОДЛОЖКА GOOGLE MAPS (НА РУССКОМ ЯЗЫКЕ)
const STYLE_GOOGLE_RU: any = {
  version: 8,
  sources: {
    'google-ru': {
      type: 'raster',
      tiles: [
        'https://mt0.google.com/vt/lyrs=m&hl=ru&x={x}&y={y}&z={z}',
        'https://mt1.google.com/vt/lyrs=m&hl=ru&x={x}&y={y}&z={z}'
      ],
      tileSize: 256,
      attribution: '© Google Карты Усть-Каменогорск (RU)'
    }
  },
  layers: [
    {
      id: 'google-ru-layer',
      type: 'raster',
      source: 'google-ru',
      minzoom: 0,
      maxzoom: 20
    }
  ],
};

// ТОЧНЫЕ КООРДИНАТЫ КОНКРЕТНЫХ ДОМОВ В УСТЬ-КАМЕНОГОРСКЕ
const VERIFIED_HOUSE_COORDS: Record<string, { lat: number; lng: number }> = {
  'vko-emeralds': { lat: 49.893829, lng: 82.603603 },        // ул. Кокжал Барака, 4/1 - 7/3
  'vko-oasis': { lat: 49.902324, lng: 82.605220 },           // пр. Ильяса Есенберлина, 14
  'vko-zhanym': { lat: 49.892912, lng: 82.615559 },          // ул. Увалиева, 3 / 3/4
  'vko-premiera': { lat: 49.922517, lng: 82.621318 },        // пр. Каныша Сатпаева, 84 / 84/4
  'vko-asylym': { lat: 49.887816, lng: 82.617877 },          // ул. Кокжал Барака, 18 / 22/1
  'vko-tumar-towers': { lat: 49.947930, lng: 82.616979 },    // пр. Победы, 2 / 11/1
  'vko-zolotoy-kvadrat': { lat: 49.945351, lng: 82.622899 }, // ул. Касыма Кайсенова, 55/1 (2ГИС)
  'vko-asyltas': { lat: 49.887242, lng: 82.612307 },         // ул. Увалиева, 8/1 - 8/3
};

export default function MapComponent({
  projects,
  onSelectProject,
}: {
  projects: any[];
  onSelectProject?: (id: string) => void;
}) {
  const [popupInfo, setPopupInfo] = useState<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [mapProvider, setMapProvider] = useState<'2gis' | 'google'>('2gis');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const normalizedProjects = useMemo(() => {
    if (!projects) return [];
    return projects.map((p) => {
      const exact = VERIFIED_HOUSE_COORDS[p.id];
      return {
        ...p,
        coordinates: exact ? exact : p.coordinates,
      };
    });
  }, [projects]);

  const pins = useMemo(() => {
    return normalizedProjects.map((project) => (
      <Marker
        key={project.id}
        longitude={project.coordinates.lng}
        latitude={project.coordinates.lat}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setPopupInfo(project);
        }}
      >
        <div className="cursor-pointer flex flex-col items-center group">
          <div className="px-2 py-0.5 rounded-md bg-[#121216]/95 text-white text-[10px] font-bold border border-zinc-700 shadow-md mb-1 whitespace-nowrap group-hover:scale-105 transition-transform">
            {project.name}
          </div>
          <div className="relative flex items-center justify-center">
            {project.zone === 'red' && (
              <div className="absolute -inset-1.5 rounded-full bg-red-500 animate-ping opacity-75" />
            )}
            <div
              className={`w-5 h-5 rounded-full border-2 border-white shadow-xl transition-transform group-hover:scale-125 ${
                project.zone === 'red'
                  ? 'bg-red-600'
                  : project.zone === 'yellow'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>
      </Marker>
    ));
  }, [normalizedProjects]);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-[#121216] flex items-center justify-center text-amber-500 font-bold text-sm">
        Загрузка карты 2ГИС Усть-Каменогорск...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Map
        initialViewState={{ longitude: 82.615, latitude: 49.918, zoom: 12.2 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapProvider === '2gis' ? STYLE_2GIS : STYLE_GOOGLE_RU}
      >
        <NavigationControl position="top-left" />
        {pins}

        {popupInfo && (
          <Popup
            anchor="top"
            offset={8}
            longitude={popupInfo.coordinates.lng}
            latitude={popupInfo.coordinates.lat}
            onClose={() => setPopupInfo(null)}
            className="z-50"
            maxWidth="320px"
          >
            <div className="p-3 space-y-2 text-sm text-zinc-900 font-sans">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-black text-base leading-tight">{popupInfo.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                    popupInfo.zone === 'red'
                      ? 'bg-red-600'
                      : popupInfo.zone === 'yellow'
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                >
                  {popupInfo.totalScore} б.
                </span>
              </div>
              <p className="text-xs font-bold text-zinc-700">
                {popupInfo.developer} (БИН: {popupInfo.bin})
              </p>
              <p className="text-xs text-zinc-600">{popupInfo.address}</p>
              {onSelectProject && (
                <button
                  className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-lg transition-colors"
                  onClick={() => onSelectProject(popupInfo.id)}
                >
                  Открыть паспорт ЖК (R1–R6)
                </button>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* ПЕРЕКЛЮЧАТЕЛЬ КАРТЫ: 2ГИС УСТЬ-КАМЕНОГОРСК / GOOGLE КАРТЫ RU */}
      <div className="absolute bottom-4 left-4 z-10 flex bg-[#121216]/95 p-1 rounded-xl border border-zinc-700 shadow-xl">
        <button
          onClick={() => setMapProvider('2gis')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
            mapProvider === '2gis' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-300 hover:text-white'
          }`}
        >
          2ГИС Карта
        </button>
        <button
          onClick={() => setMapProvider('google')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
            mapProvider === 'google' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-300 hover:text-white'
          }`}
        >
          Google Карты (RU)
        </button>
      </div>
    </div>
  );
}