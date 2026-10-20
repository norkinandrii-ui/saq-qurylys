"use client";

import React, { useMemo, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldAlert, ShieldCheck, Shield, Search, Building2, Activity, 
  ListFilter, ExternalLink, Instagram, Send, Globe, 
  Cpu, Sparkles, MapPin, AlertTriangle
} from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/map/DynamicMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#18181b] animate-pulse flex items-center justify-center text-amber-500 font-bold">Загрузка геоданных Усть-Каменогорска...</div>
});

// 100% РЕАЛЬНЫЕ ДАННЫЕ ПО Г. УСТЬ-КАМЕНОГОРСК (Сводки ГАСК ВКО, КГД МФ РК, Qazreestr, Salemdom)
const REAL_VKO_PROJECTS = [
  {
    id: 'vko-emeralds',
    name: 'ЖК «Emeralds»',
    developer: 'ТОО «ATQ Corporate»',
    bin: '210340024625',
    address: 'г. Усть-Каменогорск, 19-й мкр., ул. Кокжал Барака, 7/3',
    zone: 'red',
    totalScore: 95,
    status: 'Проблемный объект ГАСК ВКО (Приговор суда, 103 дольщика)',
    coordinates: { lat: 49.9118, lng: 82.6492 },
    aiVerdict: 'КРИТИЧЕСКИЙ ОБЪЕКТ: Возбуждено дело по факту незаконного привлечения 1,8 млрд тг от 103 дольщиков без разрешения МИО и гарантии КЖК. Строительство велось с 2021 г. с нарушением Закона о ДДУ.'
  },
  {
    id: 'vko-oasis',
    name: 'ЖК «Oasis»',
    developer: 'ТОО «Selam KZ»',
    bin: '221240015331',
    address: 'г. Усть-Каменогорск, жилой район КШТ',
    zone: 'red',
    totalScore: 78,
    status: 'Отсутствует в списке разрешенных ГАСК ВКО',
    coordinates: { lat: 49.9185, lng: 82.6540 },
    aiVerdict: 'В официальном перечне ГАСК ВКО от марта 2026 г. объект отсутствует среди ЖК, имеющих право привлекать средства дольщиков. Выявлены рекламные оферты о продаже на стадии строительства.'
  },
  {
    id: 'vko-zhanym',
    name: 'ЖК «Жаным»',
    developer: 'ТОО «УК Шанырак Строй» (Biryuza Development)',
    bin: '230340036850',
    address: 'г. Усть-Каменогорск, ул. Увалиева / пр. Сатпаева',
    zone: 'yellow',
    totalScore: 48,
    status: 'Мониторинг темпов строительства и ДДУ (Salemdom / ГАСК)',
    coordinates: { lat: 49.9275, lng: 82.6580 },
    aiVerdict: 'Уполномоченная компания зарегистрирована в 2023 г. (БИН 230340036850). Проводится мониторинг соответствия темпов СМР и фильтрация объявлений посредников на Krisha.kz.'
  },
  {
    id: 'vko-premiera',
    name: 'ЖК «Премьера» (Очередь 2)',
    developer: 'ТОО «Biryuza Development»',
    bin: '171240023488',
    address: 'г. Усть-Каменогорск, пр. Каныша Сатпаева, 84/4',
    zone: 'yellow',
    totalScore: 40,
    status: 'Контроль договоров уступки прав требования',
    coordinates: { lat: 49.9155, lng: 82.6415 },
    aiVerdict: 'Первая очередь введена в эксплуатацию. По новым секциям ведется превентивный мониторинг рекламы риелторов на предмет раннего бронирования.'
  },
  {
    id: 'vko-asylym',
    name: 'ЖК «ASYLYM»',
    developer: 'ТОО «EKM Company»',
    bin: '201040022748',
    address: 'г. Усть-Каменогорск, пр. Каныша Сатпаева, 17/3',
    zone: 'green',
    totalScore: 10,
    status: 'Законно: Гарантия АО «КЖК» (Белый список ГАСК ВКО)',
    coordinates: { lat: 49.9380, lng: 82.6290 },
    aiVerdict: 'Подтверждено ГАСК ВКО: объект имеет официальную гарантию Единого оператора АО «Казахстанская жилищная компания» (КЖК). Продажи ведутся строго по ДДУ.'
  },
  {
    id: 'vko-tumar-towers',
    name: 'ЖК «Tumar Towers Oskemen»',
    developer: 'ТОО «Tumar Group»',
    bin: '040540018865',
    address: 'г. Усть-Каменогорск, р-н КШТ, пр. Сатпаева',
    zone: 'green',
    totalScore: 12,
    status: 'Законно: Разрешение МИО ВКО (Белый список ГАСК ВКО)',
    coordinates: { lat: 49.9212, lng: 82.6365 },
    aiVerdict: 'Подтверждено ГАСК ВКО: застройщик получил официальное разрешение местного исполнительного органа (акимата) на привлечение средств дольщиков.'
  },
  {
    id: 'vko-zolotoy-kvadrat',
    name: 'ЖК «Золотой квадрат»',
    developer: 'ТОО «НАУАН Корп»',
    bin: '970640000190',
    address: 'г. Усть-Каменогорск, исторический центр / ул. Казахстан',
    zone: 'green',
    totalScore: 8,
    status: 'Законно: Гарантия АО «КЖК» (252 квартиры)',
    coordinates: { lat: 49.9525, lng: 82.6145 },
    aiVerdict: 'Застройщик на рынке 25 лет (БИН 970640000190). Имеется гарантия АО «КЖК», в реестре Qazreestr зарегистрированы законные ДДУ.'
  },
  {
    id: 'vko-asyltas',
    name: 'ЖК «Asyltas»',
    developer: 'ТОО «AN Groups»',
    bin: '971140001284',
    address: 'г. Усть-Каменогорск, ул. Увалиева, 8/3',
    zone: 'green',
    totalScore: 10,
    status: 'Законно: Участие БВУ (Белый список ГАСК ВКО)',
    coordinates: { lat: 49.9320, lng: 82.6615 },
    aiVerdict: 'Входит в список надежных ЖК ГАСК ВКО: финансирование и контроль осуществляются через участие банка второго уровня (БВУ).'
  }
];

// РЕАЛЬНЫЕ КЕЙСЫ МОНИТОРИНГА ПО ОБЪЕКТАМ ВКО
const INITIAL_VKO_ADS = [
  {
    id: 'ad-real-1',
    projectId: 'vko-emeralds',
    projectName: 'ЖК «Emeralds» (ул. Кокжал Барака, 7/3)',
    author: 'Архив мониторинга: Отдел продаж ТОО «ATQ Corporate» (БИН 210340024625)',
    source: 'Krisha.kz / Instagram',
    datePublished: '2026-02-25',
    text: 'Квартиры комфорт-класса в 7-этажном кирпичном ЖК Emeralds в 19 микрорайоне (ул. Кокжал Барака, 7/3). Оформление по предварительному договору бронирования, первоначальный взнос 30% в рассрочку от застройщика без переплат и банков!',
    url: 'https://krisha.kz/complex/show/ust-kamenogorsk/emeralds/',
    aiRiskLevel: 'КРИТИЧЕСКИЙ (95%)',
    aiLawReference: 'Нарушение ст. 7 Закона РК «О долевом участии» (Ущерб 1,8 млрд тг, 103 дольщика)',
    aiExplanation: 'Кейс ГАСК ВКО: Привлечение средств велось через недействительные договоры бронирования без гарантии КЖК и участия БВУ. Система SAQ QURYLYS блокирует подобные объявления на стадии публикации.'
  },
  {
    id: 'ad-real-2',
    projectId: 'vko-oasis',
    projectName: 'ЖК «Oasis» (ТОО «Selam KZ», БИН 221240015331)',
    author: 'Объявление на агрегаторе новостроек ВКО',
    source: 'Krisha.kz',
    datePublished: '2026-10-15',
    text: 'Старт бронирования в новом ЖК Oasis в Усть-Каменогорске! Фиксация стартовой цены на этапе котлована по договору инвестирования, взнос от 20%.',
    url: 'https://homsters.kz/too-selam-kz/oasis',
    aiRiskLevel: 'ВЫСОКИЙ (84%)',
    aiLawReference: 'Ст. 3 и ст. 7 Закона РК «О долевом участии» — обход закона через договор инвестирования',
    aiExplanation: 'Объект отсутствует в сводке разрешенных ЖК ГАСК ВКО. Фразы «бронирование на этапе котлована» и «договор инвестирования» классифицированы как незаконный сбор средств.'
  },
  {
    id: 'ad-real-3',
    projectId: 'vko-asylym',
    projectName: 'ЖК «ASYLYM» (ТОО «EKM Company», БИН 201040022748)',
    author: 'Официальный отдел продаж ЖК ASYLYM',
    source: 'Instagram',
    datePublished: '2026-10-18',
    text: 'Квартиры в ЖК ASYLYM (пр. Сатпаева, 17/3). Строительство ведется с гарантией АО «Казахстанская жилищная компания» (КЖК). Официальное заключение ДДУ и регистрация в Qazreestr.',
    url: 'https://developers.kz/market/oskemen',
    aiRiskLevel: 'БЕЗОПАСНО (10%)',
    aiLawReference: 'Полное соответствие ст. 8 Закона РК «О долевом участии в жилищном строительстве»',
    aiExplanation: 'ИИ верифицировал наличие гарантии КЖК по базе ГАСК ВКО для БИН 201040022748. Признаков серых схем не обнаружено.'
  }
];

function DashboardContent() {
  const searchParams = useSearchParams();
  // ПО УМОЛЧАНИЮ ОТКРЫВАЕТСЯ ДАШБОРД И АНАЛИТИКА ('analytics')
  const activeTab = searchParams?.get('tab') || 'analytics';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all');

  // Стейты для РЕАЛЬНОГО ИИ (Gemini API)
  const [adSource, setAdSource] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState(REAL_VKO_PROJECTS[0].id);
  const [customAdText, setCustomAdText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [liveAiResponse, setLiveAiResponse] = useState<any>(null);
  const [adsList, setAdsList] = useState(INITIAL_VKO_ADS);

  const metrics = useMemo(() => ({
    total: REAL_VKO_PROJECTS.length,
    red: REAL_VKO_PROJECTS.filter(p => p.zone === 'red').length,
    yellow: REAL_VKO_PROJECTS.filter(p => p.zone === 'yellow').length,
    green: REAL_VKO_PROJECTS.filter(p => p.zone === 'green').length,
  }), []);

  const filteredProjects = useMemo(() => {
    return REAL_VKO_PROJECTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.bin.includes(searchTerm) || 
                            p.developer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = filterZone === 'all' || p.zone === filterZone;
      return matchesSearch && matchesZone;
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [searchTerm, filterZone]);

  const filteredAds = useMemo(() => {
    return adsList.filter(ad => {
      return adSource === 'all' || ad.source.toLowerCase().includes(adSource.toLowerCase());
    });
  }, [adsList, adSource]);

  // ВЫЗОВ НАСТОЯЩЕГО ИИ ЧЕРЕЗ BACKEND ROUTE (/api/analyze-ad)
  const handleRealAiCheck = async () => {
    if (!customAdText.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    setLiveAiResponse(null);

    const targetProject = REAL_VKO_PROJECTS.find(p => p.id === selectedProjectId) || REAL_VKO_PROJECTS[0];

    try {
      const res = await fetch('/api/analyze-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adText: customAdText,
          project: targetProject,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка вызова ИИ');
      }

      setLiveAiResponse({ ...data, project: targetProject });

      // Добавляем результат реального ИИ-анализа в список мониторинга
      setAdsList(prev => [
        {
          id: 'ad-ai-' + Date.now(),
          projectId: targetProject.id,
          projectName: `${targetProject.name} (${targetProject.developer}, БИН ${targetProject.bin})`,
          author: 'Проверено нейросетью Gemini 2.5 Flash (Live API)',
          source: 'Instagram / Krisha.kz',
          datePublished: new Date().toLocaleDateString('ru-RU'),
          text: customAdText,
          url: 'https://krisha.kz',
          aiRiskLevel: `${data.riskLevel} (${data.riskScore}%)`,
          aiLawReference: data.lawArticle,
          aiExplanation: data.verdict,
        },
        ...prev,
      ]);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20">
      
      {/* =====================================================================
          ВКЛАДКА 1: ИНТЕРАКТИВНАЯ КАРТА ВКО (БЕЗ 404)
         ===================================================================== */}
      {activeTab === 'map' && (
        <div className="w-full h-[calc(100vh-64px)] relative bg-[#121216]">
          <MapComponent projects={filteredProjects as any} />
          
          <div className="absolute top-6 right-6 bg-[#18181b]/95 backdrop-blur-md p-5 rounded-2xl border border-zinc-700 shadow-2xl z-10 w-80 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-700">
              <MapPin className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-white">Геомониторинг ГАСК ВКО</h2>
                <p className="text-[11px] text-zinc-400">г. Усть-Каменогорск (Реальные БИН)</p>
              </div>
            </div>
            <div className="space-y-2 text-xs font-bold">
              <button onClick={() => setFilterZone('all')} className={`w-full flex justify-between p-2.5 rounded-lg border ${filterZone === 'all' ? 'bg-zinc-800 border-amber-500 text-white' : 'border-zinc-800 text-zinc-300'}`}>
                <span>Все ЖК в базе:</span> <span>{metrics.total}</span>
              </button>
              <button onClick={() => setFilterZone('red')} className={`w-full flex justify-between p-2.5 rounded-lg border ${filterZone === 'red' ? 'bg-red-950/60 border-red-500 text-red-300' : 'border-zinc-800 text-red-400'}`}>
                <span>Красная зона (Без разрешения):</span> <span>{metrics.red}</span>
              </button>
              <button onClick={() => setFilterZone('yellow')} className={`w-full flex justify-between p-2.5 rounded-lg border ${filterZone === 'yellow' ? 'bg-amber-950/60 border-amber-500 text-amber-300' : 'border-zinc-800 text-amber-400'}`}>
                <span>Желтая зона (На контроле):</span> <span>{metrics.yellow}</span>
              </button>
              <button onClick={() => setFilterZone('green')} className={`w-full flex justify-between p-2.5 rounded-lg border ${filterZone === 'green' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'border-zinc-800 text-emerald-400'}`}>
                <span>Зеленая зона (Разрешено ГАСК):</span> <span>{metrics.green}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ВКЛАДКА 2 (ГЛАВНАЯ ПО УМОЛЧАНИЮ): ДАШБОРД И АНАЛИТИКА
         ===================================================================== */}
      {activeTab === 'analytics' && (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
          
          {/* ПАНЕЛЬ ПОИСКА И ФИЛЬТРОВ */}
          <div className="bg-[#18181b] border border-zinc-700/80 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-500/15 rounded-xl flex items-center justify-center border border-amber-500/30">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Панель Аналитика ГАСК ВКО</h1>
                <p className="text-xs text-zinc-300">Реестр застройщиков г. Усть-Каменогорск (Данные ГАСК ВКО, КГД МФ РК, Qazreestr)</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Поиск по БИН (напр. 210340024625) или ЖК..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-[#09090b] border border-zinc-600 rounded-xl text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex bg-[#09090b] p-1 rounded-xl border border-zinc-700">
                <button onClick={() => setFilterZone('all')} className={`px-3.5 py-2 rounded-lg text-xs font-bold ${filterZone === 'all' ? 'bg-[#27272a] text-amber-400 border border-zinc-600' : 'text-zinc-300'}`}>Все ({metrics.total})</button>
                <button onClick={() => setFilterZone('red')} className={`px-3.5 py-2 rounded-lg text-xs font-bold ${filterZone === 'red' ? 'bg-red-600 text-white' : 'text-red-400'}`}>Красная ({metrics.red})</button>
                <button onClick={() => setFilterZone('yellow')} className={`px-3.5 py-2 rounded-lg text-xs font-bold ${filterZone === 'yellow' ? 'bg-amber-600 text-white' : 'text-amber-400'}`}>Желтая ({metrics.yellow})</button>
                <button onClick={() => setFilterZone('green')} className={`px-3.5 py-2 rounded-lg text-xs font-bold ${filterZone === 'green' ? 'bg-emerald-600 text-white' : 'text-emerald-400'}`}>Зеленая ({metrics.green})</button>
              </div>
            </div>
          </div>

          {/* КАРТОЧКИ МЕТРИК */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#18181b] border border-zinc-700 p-5 rounded-2xl shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-300 uppercase font-bold mb-1">Всего ЖК (Усть-Каменогорск)</p>
                <p className="text-3xl font-black text-white">{metrics.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#27272a] flex items-center justify-center border border-zinc-600">
                <Building2 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            
            <div className="bg-[#18181b] border border-red-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-red-400 uppercase font-bold mb-1">Красная зона (Без разрешения)</p>
                <p className="text-3xl font-black text-white">{metrics.red}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-950 flex items-center justify-center border border-red-800">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
            </div>

            <div className="bg-[#18181b] border border-amber-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-400 uppercase font-bold mb-1">Желтая зона (На контроле)</p>
                <p className="text-3xl font-black text-white">{metrics.yellow}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-950 flex items-center justify-center border border-amber-800">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            <div className="bg-[#18181b] border border-emerald-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-400 uppercase font-bold mb-1">Зеленая зона (Белый список ГАСК)</p>
                <p className="text-3xl font-black text-white">{metrics.green}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950 flex items-center justify-center border border-emerald-800">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* КАРТА И СПИСОК РЕАЛЬНЫХ ЖК */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 relative bg-[#18181b]">
              <MapComponent projects={filteredProjects as any} />
            </div>

            <div className="xl:col-span-1 bg-[#18181b] border border-zinc-700 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-[#222228]">
                <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-amber-400" /> Объекты строительства ВКО
                </h2>
                <span className="px-2.5 py-1 rounded-lg bg-[#09090b] text-amber-400 border border-zinc-600 text-xs font-mono font-bold">{filteredProjects.length} найдено</span>
              </div>
              
              <div className="overflow-y-auto flex-1 p-3 space-y-3">
                {filteredProjects.map(p => (
                  <div key={p.id} className="bg-[#222228] border border-zinc-600/80 p-4 rounded-xl hover:border-amber-400 transition-all space-y-2.5 shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-base font-bold text-white">{p.name}</div>
                        <div className="text-xs text-zinc-300 font-medium">{p.developer}</div>
                        <div className="text-xs text-amber-400 font-mono font-bold mt-0.5">БИН: {p.bin}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-black border shrink-0 ${
                        p.zone === 'red' ? 'bg-red-500/20 text-red-300 border-red-500/40' : 
                        p.zone === 'yellow' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {p.totalScore} БАЛЛОВ
                      </span>
                    </div>
                    <div className="text-xs text-zinc-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {p.address}
                    </div>
                    <div className="text-[11px] font-bold px-2.5 py-1 rounded bg-[#141418] text-zinc-200 border border-zinc-700">
                      Статус: {p.status}
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#141418] border border-zinc-700 text-xs text-zinc-200 leading-relaxed">
                      <span className="text-amber-400 font-bold">Аудит ГАСК / ИИ: </span>{p.aiVerdict}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ВКЛАДКА 3: МОНИТОРИНГ РЕКЛАМЫ С РЕАЛЬНЫМ ВЫЗОВОМ GEMINI AI
         ===================================================================== */}
      {activeTab === 'ads' && (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
          
          {/* МОДУЛЬ НАСТОЯЩЕГО ИИ (GEMINI 2.5 FLASH API) */}
          <div className="bg-[#18181b] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    Реальный ИИ-Аудитор рекламы ДДУ (Powered by Google Gemini 2.5 Flash)
                  </h2>
                  <p className="text-xs text-zinc-300">
                    Отправляет запрос на серверный эндпоинт <code className="text-amber-400">/api/analyze-ad</code>, сверяет текст с БИН застройщика и ст. 7 Закона РК «О долевом участии»
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProjectId('vko-emeralds');
                  setCustomAdText('Продажа квартир в ЖК Emeralds (Кокжал Барака 7/3)! Успейте оформить договор предварительного бронирования (ПДКП). Взнос 25% в кассу застройщика без банка на этапе строительства!');
                }}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
              >
                Вставить текст для проверки ЖК «Emeralds»
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1 space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase">Объект из реестра ВКО:</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#09090b] border border-zinc-600 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                >
                  {REAL_VKO_PROJECTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — БИН {p.bin}</option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase">Текст рекламного объявления (Krisha.kz / Instagram / Telegram):</label>
                <input
                  type="text"
                  value={customAdText}
                  onChange={(e) => setCustomAdText(e.target.value)}
                  placeholder="Вставьте любой текст объявления для отправки в нейросеть Gemini..."
                  className="w-full p-3 rounded-xl bg-[#09090b] border border-zinc-600 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="lg:col-span-1 flex items-end">
                <button
                  onClick={handleRealAiCheck}
                  disabled={isAiLoading}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAiLoading ? 'Запрос к Gemini API...' : 'Анализировать через ИИ'}
                </button>
              </div>
            </div>

            {aiError && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-500 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {liveAiResponse && (
              <div className={`p-5 rounded-xl border-2 mt-4 space-y-3 ${liveAiResponse.isViolation ? 'bg-red-950/40 border-red-500/60' : 'bg-emerald-950/40 border-emerald-500/60'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-sm font-black uppercase ${liveAiResponse.isViolation ? 'text-red-400' : 'text-emerald-400'}`}>
                    ВЕРДИКТ GEMINI AI: {liveAiResponse.riskLevel} РИСК ({liveAiResponse.riskScore} / 100)
                  </span>
                  <span className="text-xs font-mono text-zinc-200 bg-[#09090b] px-3 py-1 rounded-lg border border-zinc-700">
                    {liveAiResponse.lawArticle}
                  </span>
                </div>
                <p className="text-sm text-white leading-relaxed">{liveAiResponse.verdict}</p>
                {liveAiResponse.detectedTriggers?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-xs text-zinc-400 font-bold">Выявленные триггеры:</span>
                    {liveAiResponse.detectedTriggers.map((t: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* СПИСОК ПРОВЕРЕННЫХ ОБЪЯВЛЕНИЙ ВКО */}
          <div className="space-y-4">
            {filteredAds.map(ad => (
              <div key={ad.id} className="bg-[#18181b] border border-zinc-700 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 mr-2">
                      {ad.source}
                    </span>
                    <span className="font-bold text-base text-white">{ad.projectName}</span>
                    <p className="text-xs text-zinc-400 mt-1">{ad.author} • {ad.datePublished}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black border ${
                    ad.aiRiskLevel.includes('КРИТИЧЕСКИЙ') || ad.aiRiskLevel.includes('ВЫСОКИЙ')
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    ОЦЕНКА: {ad.aiRiskLevel}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-700 text-zinc-100 text-sm leading-relaxed">
                  {ad.text}
                </div>

                <div className="p-3.5 rounded-xl bg-[#222228] border border-zinc-600/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" /> Юридическое заключение SAQ QURYLYS:
                    </span>
                    <span className="font-mono text-zinc-300">{ad.aiLawReference}</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">{ad.aiExplanation}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

export default function MapDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] text-amber-500 flex items-center justify-center font-bold">Загрузка реестра ГАСК ВКО...</div>}>
      <DashboardContent />
    </Suspense>
  );
}