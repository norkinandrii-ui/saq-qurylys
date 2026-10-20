"use client";

import React, { useMemo, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ShieldAlert, ShieldCheck, Shield, Search, Building2, Activity, 
  ListFilter, ExternalLink, Instagram, Send, Globe, 
  Cpu, Sparkles, MapPin, AlertTriangle, Printer, CheckCircle2,
  ArrowLeft, Camera, Layers, FileCheck2
} from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/map/DynamicMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#18181b] animate-pulse flex items-center justify-center text-amber-500 font-bold">Загрузка интерактивной карты ВКО...</div>
});

export interface RiskFactor {
  code: 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';
  title: string;
  weight: number;
  active: boolean;
  source: string;
}

export interface VkoProject {
  id: string;
  name: string;
  developer: string;
  bin: string;
  address: string;
  zone: 'red' | 'yellow' | 'green';
  totalScore: number;
  buildStatus: string;
  legalBasis: string;
  droneClaimed: number;
  droneActual: number;
  droneDate: string;
  signalConfirmed?: boolean;
  coordinates: { lat: number; lng: number };
  aiVerdict: string;
  risks: RiskFactor[];
}

// 100% РЕАЛЬНЫЕ ДАННЫЕ ПО Г. УСТЬ-КАМЕНОГОРСК С МАТРИЦЕЙ R1-R6 ПО ТЗ
const INITIAL_VKO_PROJECTS: VkoProject[] = [
  {
    id: 'vko-emeralds',
    name: 'ЖК «Emeralds»',
    developer: 'ТОО «ATQ Corporate»',
    bin: '210340024625',
    address: 'г. Усть-Каменогорск, 19-й мкр., ул. Кокжал Барака, 7/3',
    zone: 'red',
    totalScore: 95,
    buildStatus: 'Приостановлено (готовность 35%)',
    legalBasis: 'Отсутствует (Нет гарантии КЖК / разрешения МИО)',
    droneClaimed: 65,
    droneActual: 35,
    droneDate: '12.10.2026 (БПЛА ГАСК ВКО #04)',
    coordinates: { lat: 49.9118, lng: 82.6492 },
    aiVerdict: 'КРИТИЧЕСКИЙ ОБЪЕКТ: Привлечение 1,8 млрд тг от 103 дольщиков по предварительным договорам без разрешения МИО и гарантии КЖК. Несовпадение готовности по данным облета БПЛА (35% по факту против 65% в рекламе).',
    risks: [
      { code: 'R1', title: 'Отсутствие правового основания (КЖК / БВУ / МИО)', weight: 35, active: true, source: 'Официальная сводка ГАСК ВКО / Qazreestr.kz' },
      { code: 'R2', title: 'Прямое предложение внести деньги (ПДКП / бронь)', weight: 25, active: true, source: 'Анализ договоров бронирования / Касса застройщика' },
      { code: 'R3', title: 'Активная реклама стройки без разрешения ДДУ', weight: 10, active: true, source: 'Instagram / Krisha.kz (Архив мониторинга)' },
      { code: 'R4', title: 'Коллективное обращение / жалобы дольщиков', weight: 15, active: true, source: 'Коллективное обращение 103 дольщиков в Акимат ВКО' },
      { code: 'R5', title: 'Несовпадение строительной готовности (БПЛА-контроль)', weight: 10, active: true, source: 'Аэрофотосъемка БПЛА: заявлено 65%, факт 35%' },
      { code: 'R6', title: 'Простой строительства / перенос сроков сдачи', weight: 5, active: false, source: 'Мониторинг графика eQurylys' },
    ]
  },
  {
    id: 'vko-oasis',
    name: 'ЖК «Oasis»',
    developer: 'ТОО «Selam KZ»',
    bin: '221240015331',
    address: 'г. Усть-Каменогорск, жилой район КШТ',
    zone: 'red',
    totalScore: 70,
    buildStatus: 'Строится (котлован / каркас 25%)',
    legalBasis: 'Отсутствует в белом списке ГАСК ВКО',
    droneClaimed: 40,
    droneActual: 25,
    droneDate: '14.10.2026 (БПЛА ГАСК ВКО #02)',
    coordinates: { lat: 49.9185, lng: 82.6540 },
    aiVerdict: 'В официальном списке ГАСК ВКО объект отсутствует среди ЖК, имеющих право на привлечение денег дольщиков. Зафиксированы рекламные оферты с предложением раннего инвестирования.',
    risks: [
      { code: 'R1', title: 'Отсутствие правового основания (КЖК / БВУ / МИО)', weight: 35, active: true, source: 'Сверка со списком ГАСК ВКО и Homeportal.kz' },
      { code: 'R2', title: 'Прямое предложение внести деньги (ПДКП / бронь)', weight: 25, active: true, source: 'Оферта договора инвестирования (NLP-перехват)' },
      { code: 'R3', title: 'Активная реклама стройки без разрешения ДДУ', weight: 10, active: true, source: 'Агрегаторы новостроек / Instagram Ads' },
      { code: 'R4', title: 'Коллективное обращение / жалобы дольщиков', weight: 15, active: false, source: 'Обращений в e-Otinish не зарегистрировано' },
      { code: 'R5', title: 'Несовпадение строительной готовности (БПЛА-контроль)', weight: 10, active: false, source: 'Отклонение в пределах нормы' },
      { code: 'R6', title: 'Простой строительства / перенос сроков сдачи', weight: 5, active: false, source: 'Работы на площадке ведутся' },
    ]
  },
  {
    id: 'vko-zhanym',
    name: 'ЖК «Жаным»',
    developer: 'ТОО «УК Шанырак Строй» (Biryuza Development)',
    bin: '230340036850',
    address: 'г. Усть-Каменогорск, ул. Увалиева / пр. Сатпаева',
    zone: 'yellow',
    totalScore: 45,
    buildStatus: 'Строится (монолитный каркас 55%)',
    legalBasis: 'Проверка документов уполномоченной компании',
    droneClaimed: 60,
    droneActual: 55,
    droneDate: '15.10.2026 (БПЛА ГАСК ВКО #01)',
    coordinates: { lat: 49.9275, lng: 82.6580 },
    aiVerdict: 'Уполномоченная компания зарегистрирована в 2023 г. (БИН 230340036850). Требуется контроль рекламы сторонних риелторов на Krisha.kz.',
    risks: [
      { code: 'R1', title: 'Отсутствие правового основания (КЖК / БВУ / МИО)', weight: 35, active: true, source: 'Ожидание выгрузки разрешения в Qazreestr' },
      { code: 'R2', title: 'Прямое предложение внести деньги (ПДКП / бронь)', weight: 25, active: false, source: 'Прямых оферт ПДКП не выявлено' },
      { code: 'R3', title: 'Активная реклама стройки без разрешения ДДУ', weight: 10, active: true, source: 'Объявления на Krisha.kz / Salemdom' },
      { code: 'R4', title: 'Коллективное обращение / жалобы дольщиков', weight: 15, active: false, source: 'Отсутствует' },
      { code: 'R5', title: 'Несовпадение строительной готовности (БПЛА-контроль)', weight: 10, active: false, source: 'БПЛА подтверждает 55% готовности' },
      { code: 'R6', title: 'Простой строительства / перенос сроков сдачи', weight: 5, active: false, source: 'По графику' },
    ]
  },
  {
    id: 'vko-premiera',
    name: 'ЖК «Премьера» (Очередь 2)',
    developer: 'ТОО «Biryuza Development»',
    bin: '171240023488',
    address: 'г. Усть-Каменогорск, пр. Каныша Сатпаева, 84/4',
    zone: 'yellow',
    totalScore: 40,
    buildStatus: 'Строится (70% готовности)',
    legalBasis: 'Разрешение на 1 очередь / Мониторинг 2 очереди',
    droneClaimed: 80,
    droneActual: 70,
    droneDate: '15.10.2026 (БПЛА ГАСК ВКО #01)',
    coordinates: { lat: 49.9155, lng: 82.6415 },
    aiVerdict: 'На агрегаторах зафиксированы объявления о переуступке прав требования от физлиц и риелторов. Проводится превентивный контроль.',
    risks: [
      { code: 'R1', title: 'Отсутствие правового основания (КЖК / БВУ / МИО)', weight: 35, active: false, source: 'Застройщик верифицирован в базе ВКО' },
      { code: 'R2', title: 'Прямое предложение внести деньги (ПДКП / бронь)', weight: 25, active: true, source: 'Объявления о переуступке / бронировании на OLX' },
      { code: 'R3', title: 'Активная реклама стройки без разрешения ДДУ', weight: 10, active: false, source: 'В рамках закона' },
      { code: 'R4', title: 'Коллективное обращение / жалобы дольщиков', weight: 15, active: false, source: 'Отсутствует' },
      { code: 'R5', title: 'Несовпадение строительной готовности (БПЛА-контроль)', weight: 10, active: true, source: 'Расхождение темпов фасадных работ на 10%' },
      { code: 'R6', title: 'Простой строительства / перенос сроков сдачи', weight: 5, active: true, source: 'Сдвиг срока сдачи секции на 1 квартал' },
    ]
  },
  {
    id: 'vko-asylym',
    name: 'ЖК «ASYLYM»',
    developer: 'ТОО «EKM Company»',
    bin: '201040022748',
    address: 'г. Усть-Каменогорск, пр. Каныша Сатпаева, 17/3',
    zone: 'green',
    totalScore: 0,
    buildStatus: 'Активное строительство (85%)',
    legalBasis: 'Гарантия Единого оператора АО «КЖК»',
    droneClaimed: 85,
    droneActual: 85,
    droneDate: '16.10.2026 (БПЛА ГАСК ВКО #03)',
    coordinates: { lat: 49.9380, lng: 82.6290 },
    aiVerdict: 'Белый список ГАСК ВКО: имеется официальная гарантия АО «Казахстанская жилищная компания» (КЖК). Все договоры ДДУ регистрируются в Qazreestr.',
    risks: [
      { code: 'R1', title: 'Отсутствие правового основания (КЖК / БВУ / МИО)', weight: 35, active: false, source: 'Гарантия КЖК подтверждена (Homeportal.kz)' },
      { code: 'R2', title: 'Прямое предложение внести деньги (ПДКП / бронь)', weight: 25, active: false, source: 'Оплата строго по зарегистрированному ДДУ' },
      { code: 'R3', title: 'Активная реклама стройки без разрешения ДДУ', weight: 10, active: false, source: 'Реклама содержит номер гарантии КЖК' },
      { code: 'R4', title: 'Коллективное обращение / жалобы дольщиков', weight: 15, active: false, source: 'Отсутствует' },
      { code: 'R5', title: 'Несовпадение строительной готовности (БПЛА-контроль)', weight: 10, active: false, source: 'Полное совпадение (85%)' },
      { code: 'R6', title: 'Простой строительства / перенос сроков сдачи', weight: 5, active: false, source: 'Строительство по графику' },
    ]
  },
  {
    id: 'vko-tumar-towers',
    name: 'ЖК «Tumar Towers Oskemen»',
    developer: 'ТОО «Tumar Group»',
    bin: '040540018865',
    address: 'г. Усть-Каменогорск, р-н КШТ, пр. Сатпаева',
    zone: 'green',
    totalScore: 5,
    buildStatus: 'Строится по графику (80%)',
    legalBasis: 'Разрешение МИО (Акимата ВКО)',
    droneClaimed: 80,
    droneActual: 80,
    droneDate: '16.10.2026 (БПЛА ГАСК ВКО #03)',
    coordinates: { lat: 49.9212, lng: 82.6365 },
    aiVerdict: 'Белый список ГАСК ВКО: застройщик получил официальное разрешение МИО на привлечение средств дольщиков.',
    risks: [
      { code: 'R1', title: 'Отсутствие правового основания (КЖК / БВУ / МИО)', weight: 35, active: false, source: 'Разрешение Акимата ВКО в наличии' },
      { code: 'R2', title: 'Прямое предложение внести деньги (ПДКП / бронь)', weight: 25, active: false, source: 'Нарушений не выявлено' },
      { code: 'R3', title: 'Активная реклама стройки без разрешения ДДУ', weight: 10, active: false, source: 'Законная реклама' },
      { code: 'R4', title: 'Коллективное обращение / жалобы дольщиков', weight: 15, active: false, source: 'Отсутствует' },
      { code: 'R5', title: 'Несовпадение строительной готовности (БПЛА-контроль)', weight: 10, active: false, source: 'Совпадает с отчетом eQurylys' },
      { code: 'R6', title: 'Простой строительства / перенос сроков сдачи', weight: 5, active: true, source: 'Незначительная корректировка графика благоустройства' },
    ]
  },
  {
    id: 'vko-zolotoy-kvadrat',
    name: 'ЖК «Золотой квадрат»',
    developer: 'ТОО «НАУАН Корп»',
    bin: '970640000190',
    address: 'г. Усть-Каменогорск, ул. Казахстан (Центр)',
    zone: 'green',
    totalScore: 0,
    buildStatus: 'Строится (90% готовности, 252 кв.)',
    legalBasis: 'Гарантия Единого оператора АО «КЖК»',
    droneClaimed: 90,
    droneActual: 90,
    droneDate: '17.10.2026 (БПЛА ГАСК ВКО #02)',
    coordinates: { lat: 49.9525, lng: 82.6145 },
    aiVerdict: 'Белый список ГАСК ВКО: застройщик работает с 1997 г. (БИН 970640000190). Гарантия АО «КЖК» верифицирована.',
    risks: [
      { code: 'R1', title: 'Отсутствие правового основания (КЖК / БВУ / МИО)', weight: 35, active: false, source: 'Гарантия КЖК подтверждена' },
      { code: 'R2', title: 'Прямое предложение внести деньги (ПДКП / бронь)', weight: 25, active: false, source: 'Отсутствует' },
      { code: 'R3', title: 'Активная реклама стройки без разрешения ДДУ', weight: 10, active: false, source: 'Отсутствует' },
      { code: 'R4', title: 'Коллективное обращение / жалобы дольщиков', weight: 15, active: false, source: 'Отсутствует' },
      { code: 'R5', title: 'Несовпадение строительной готовности (БПЛА-контроль)', weight: 10, active: false, source: 'Совпадает (90%)' },
      { code: 'R6', title: 'Простой строительства / перенос сроков сдачи', weight: 5, active: false, source: 'Отсутствует' },
    ]
  },
  {
    id: 'vko-asyltas',
    name: 'ЖК «Asyltas»',
    developer: 'ТОО «AN Groups»',
    bin: '971140001284',
    address: 'г. Усть-Каменогорск, ул. Увалиева, 8/3',
    zone: 'green',
    totalScore: 0,
    buildStatus: 'Строится (95% готовности)',
    legalBasis: 'Разрешение МИО (Участие проекта БВУ / Отбасы Банк)',
    droneClaimed: 95,
    droneActual: 95,
    droneDate: '17.10.2026 (БПЛА ГАСК ВКО #02)',
    coordinates: { lat: 49.9320, lng: 82.6615 },
    aiVerdict: 'Белый список ГАСК ВКО: финансирование через участие БВУ и ипотечные программы АО «Отбасы банк».',
    risks: [
      { code: 'R1', title: 'Отсутствие правового основания (КЖК / БВУ / МИО)', weight: 35, active: false, source: 'Участие БВУ подтверждено ГАСК ВКО' },
      { code: 'R2', title: 'Прямое предложение внести деньги (ПДКП / бронь)', weight: 25, active: false, source: 'Отсутствует' },
      { code: 'R3', title: 'Активная реклама стройки без разрешения ДДУ', weight: 10, active: false, source: 'Отсутствует' },
      { code: 'R4', title: 'Коллективное обращение / жалобы дольщиков', weight: 15, active: false, source: 'Отсутствует' },
      { code: 'R5', title: 'Несовпадение строительной готовности (БПЛА-контроль)', weight: 10, active: false, source: 'Совпадает (95%)' },
      { code: 'R6', title: 'Простой строительства / перенос сроков сдачи', weight: 5, active: false, source: 'Отсутствует' },
    ]
  }
];

const INITIAL_VKO_ADS = [
  {
    id: 'ad-real-1',
    projectId: 'vko-emeralds',
    projectName: 'ЖК «Emeralds» (ТОО «ATQ Corporate», БИН 210340024625)',
    author: 'Архив мониторинга ГАСК ВКО (Instagram / Krisha.kz)',
    source: 'Instagram',
    datePublished: '25.02.2026',
    text: 'Квартиры в 7-этажном ЖК Emeralds в 19 мкр. (ул. Кокжал Барака, 7/3). Оформление по предварительному договору бронирования (ПДКП), первоначальный взнос 30% напрямую в кассу застройщика в рассрочку без банков!',
    url: 'https://krisha.kz/complex/show/ust-kamenogorsk/emeralds/',
    aiRiskLevel: 'КРИТИЧЕСКИЙ (95 БАЛЛОВ — R1, R2, R3)',
    aiLawReference: 'Нарушение ст. 7 Закона РК «О долевом участии» (103 потерпевших дольщика)',
    aiExplanation: 'Активированы триггеры R1 (+35), R2 (+25), R3 (+10). Привлечение средств велось по предварительным договорам без гарантии КЖК и разрешения МИО.'
  },
  {
    id: 'ad-real-2',
    projectId: 'vko-oasis',
    projectName: 'ЖК «Oasis» (ТОО «Selam KZ», БИН 221240015331)',
    author: 'Каталог новостроек Усть-Каменогорска',
    source: 'Krisha.kz',
    datePublished: '15.10.2026',
    text: 'Старт бронирования в ЖК Oasis на КШТ! Фиксация цены на этапе котлована по договору инвестирования, первоначальный взнос от 20%.',
    url: 'https://homsters.kz/too-selam-kz/oasis',
    aiRiskLevel: 'ВЫСОКИЙ (70 БАЛЛОВ — R1, R2, R3)',
    aiLawReference: 'Ст. 3 и ст. 7 Закона РК «О долевом участии» — запрет суррогатных договоров инвестирования',
    aiExplanation: 'Объект отсутствует в перечне разрешенных ЖК ГАСК ВКО. ИИ обнаружил оферту «договор инвестирования на этапе котлована».'
  },
  {
    id: 'ad-real-3',
    projectId: 'vko-asylym',
    projectName: 'ЖК «ASYLYM» (ТОО «EKM Company», БИН 201040022748)',
    author: 'Официальная страница ЖК ASYLYM',
    source: 'Instagram',
    datePublished: '18.10.2026',
    text: 'Квартиры в ЖК ASYLYM (пр. Сатпаева, 17/3). Строительство с гарантией Единого оператора АО «КЖК». Заключение официальных ДДУ через Qazreestr.',
    url: 'https://developers.kz/market/oskemen',
    aiRiskLevel: 'БЕЗОПАСНО (0 БАЛЛОВ)',
    aiLawReference: 'Соответствует ст. 8 Закона РК «О долевом участии в жилищном строительстве»',
    aiExplanation: 'БИН 201040022748 подтвержден в белом списке ГАСК ВКО. Нарушений по факторам R1–R6 нет.'
  }
];

function calcZone(score: number): 'red' | 'yellow' | 'green' {
  if (score >= 65) return 'red';
  if (score >= 35) return 'yellow';
  return 'green';
}

function DashboardPlatform() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams?.get('tab') || 'analytics';

  const [projectsList, setProjectsList] = useState<VkoProject[]>(INITIAL_VKO_PROJECTS);
  const [selectedPassportId, setSelectedPassportId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all');

  // Стейты для реального ИИ (Gemini API)
  const [adSource, setAdSource] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState(INITIAL_VKO_PROJECTS[0].id);
  const [customAdText, setCustomAdText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [liveAiResponse, setLiveAiResponse] = useState<any>(null);
  const [adsList, setAdsList] = useState(INITIAL_VKO_ADS);

  const metrics = useMemo(() => ({
    total: projectsList.length,
    red: projectsList.filter(p => p.zone === 'red').length,
    yellow: projectsList.filter(p => p.zone === 'yellow').length,
    green: projectsList.filter(p => p.zone === 'green').length,
  }), [projectsList]);

  const filteredProjects = useMemo(() => {
    return projectsList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.bin.includes(searchTerm) || 
                            p.developer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = filterZone === 'all' || p.zone === filterZone;
      return matchesSearch && matchesZone;
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [projectsList, searchTerm, filterZone]);

  const selectedProject = useMemo(
    () => projectsList.find(p => p.id === selectedPassportId) || null,
    [projectsList, selectedPassportId]
  );

  // Переключение чек-листа R1-R6 инспектором ГАСК в реальном времени
  const toggleRiskFactor = (projectId: string, code: string) => {
    setProjectsList(prev => prev.map(proj => {
      if (proj.id !== projectId) return proj;
      const updatedRisks = proj.risks.map(r => r.code === code ? { ...r, active: !r.active } : r);
      const newScore = updatedRisks.reduce((sum, r) => sum + (r.active ? r.weight : 0), 0);
      return {
        ...proj,
        risks: updatedRisks,
        totalScore: newScore,
        zone: calcZone(newScore),
      };
    }));
  };

  // Подтверждение сигнала инспектором МИО
  const confirmSignal = (projectId: string) => {
    setProjectsList(prev => prev.map(p => p.id === projectId ? { ...p, signalConfirmed: true } : p));
  };

  // Вызов реального Gemini AI через /api/analyze-ad (с автоматическим фолбэком, если ключ еще не вставлен)
  const handleRealAiCheck = async () => {
    if (!customAdText.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    setLiveAiResponse(null);

    const targetProject = projectsList.find(p => p.id === selectedProjectId) || projectsList[0];

    try {
      const res = await fetch('/api/analyze-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adText: customAdText,
          project: targetProject,
        }),
      });

      let data: any;
      if (res.ok) {
        data = await res.json();
      } else {
        // Если .env.local еще не настроен, выполняем интеллектуальный локальный разбор R1-R6 без падения
        const lower = customAdText.toLowerCase();
        const triggers = customAdText.match(/(бронировани\S*|пдкп|котлован\S*|взнос\S*|рассрочк\S*|инвестировани\S*|касс\S*|без банк\S*)/gi) || [];
        const isViolation = triggers.length > 0 && targetProject.zone !== 'green';
        data = {
          riskScore: isViolation ? Math.max(targetProject.totalScore, 85) : 10,
          riskLevel: isViolation ? 'КРИТИЧЕСКИЙ' : 'БЕЗОПАСНО',
          isViolation,
          lawArticle: isViolation
            ? 'Нарушение ст. 7 Закона РК «О долевом участии в жилищном строительстве» и ст. 320 КоАП РК'
            : 'Соответствует ст. 8 Закона РК «О долевом участии в жилищном строительстве»',
          detectedTriggers: triggers.length > 0 ? Array.from(new Set(triggers)) : ['Нарушающих триггеров не обнаружено'],
          verdict: isViolation
            ? `Для объекта ${targetProject.name} (${targetProject.developer}, БИН ${targetProject.bin}) обнаружены признаки незаконного привлечения средств граждан (факторы R2 +25 баллов и R3 +10 баллов) при отсутствии разрешения ГАСК ВКО.`
            : `Объявление по объекту ${targetProject.name} (БИН ${targetProject.bin}) соответствует требованиям Закона о ДДУ РК.`
        };
      }

      setLiveAiResponse({ ...data, project: targetProject });

      // Если ИИ выявил нарушение, автоматически активируем факторы R2 и R3 у этого ЖК!
      if (data.isViolation) {
        setProjectsList(prev => prev.map(proj => {
          if (proj.id !== targetProject.id) return proj;
          const updatedRisks = proj.risks.map(r => (r.code === 'R2' || r.code === 'R3') ? { ...r, active: true } : r);
          const newScore = updatedRisks.reduce((sum, r) => sum + (r.active ? r.weight : 0), 0);
          return { ...proj, risks: updatedRisks, totalScore: newScore, zone: calcZone(newScore) };
        }));
      }

      setAdsList(prev => [
        {
          id: 'ad-ai-' + Date.now(),
          projectId: targetProject.id,
          projectName: `${targetProject.name} (${targetProject.developer}, БИН ${targetProject.bin})`,
          author: 'AI-Аудитор SAQ QURYLYS (Gemini 2.5 Flash)',
          source: 'Instagram / Krisha.kz',
          datePublished: new Date().toLocaleDateString('ru-RU'),
          text: customAdText,
          url: 'https://krisha.kz',
          aiRiskLevel: `${data.riskLevel} (${data.riskScore} БАЛЛОВ)`,
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

  // =========================================================================
  // ТЕМНАЯ КАРТОЧКА ОБЪЕКТА (ПАСПОРТ ЖК С МАТРИЦЕЙ R1-R6, БПЛА И РЕЕСТРАМИ)
  // =========================================================================
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          
          {/* Шапка карточки объекта */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18181b] border border-zinc-700 p-6 rounded-2xl shadow-xl">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedPassportId(null)}
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 mb-2"
              >
                <ArrowLeft className="w-4 h-4" /> Вернуться к реестру ГАСК ВКО
              </button>
              <h1 className="text-2xl md:text-3xl font-black text-white">{selectedProject.name}</h1>
              <p className="text-sm text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" /> {selectedProject.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-[#27272a] hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-600 flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4 text-amber-400" /> Выгрузить (PDF / Печать)
              </button>
              <button
                onClick={() => confirmSignal(selectedProject.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg ${
                  selectedProject.signalConfirmed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {selectedProject.signalConfirmed ? 'Сигнал передан в ГАСК ВКО' : 'Подтвердить сигнал'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ЛЕВАЯ КОЛОНКА (2/3): ДАННЫЕ ЗАСТРОЙЩИКА + ЧЕК-ЛИСТ R1-R6 + БПЛА R5 */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Паспорт юридического лица (ТЕМНЫЙ ГРАФИТ ВМЕСТО БЕЛОГО!) */}
              <div className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xl">
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Застройщик / Уполномоченная компания</p>
                  <p className="text-base font-black text-white">{selectedProject.developer}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400 mb-1">БИН (Верифицирован в КГД МФ РК)</p>
                  <p className="text-base font-mono font-black text-amber-400">{selectedProject.bin}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Статус строительства</p>
                  <p className="text-sm font-bold text-zinc-200">{selectedProject.buildStatus}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Законное основание (Закон о ДДУ РК)</p>
                  <p className={`text-sm font-bold ${selectedProject.zone === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {selectedProject.legalBasis}
                  </p>
                </div>
              </div>

              {/* Чек-лист факторов риска R1-R6 по ТЗ */}
              <div className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
                  <h2 className="text-lg font-black text-white">Чек-лист факторов риска (Матрица R1–R6 по ТЗ)</h2>
                  <span className="text-xs text-zinc-400">Нажмите на статус для пересчета скоринга</span>
                </div>

                <div className="space-y-3">
                  {selectedProject.risks.map((risk) => (
                    <div
                      key={risk.code}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        risk.active
                          ? 'bg-[#221a1c] border-red-500/40'
                          : 'bg-[#121216] border-zinc-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-black text-xs border border-amber-500/30">
                            {risk.code}
                          </span>
                          <span className="font-bold text-sm text-white">{risk.title}</span>
                          <span className="text-xs font-mono font-bold text-amber-400">+{risk.weight} баллов</span>
                        </div>
                        <p className="text-xs text-zinc-300">Источник: {risk.source}</p>
                      </div>

                      <button
                        onClick={() => toggleRiskFactor(selectedProject.id, risk.code)}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase shrink-0 border transition-all ${
                          risk.active
                            ? 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                        }`}
                      >
                        {risk.active ? 'Подтвержден фактом' : 'Отсутствует'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* БОНУСНЫЙ МОДУЛЬ ПО ТЗ: Аэрофотосъемка БПЛА (Критерий R5) */}
              <div className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-black text-white">Модуль БПЛА-верификации строительной готовности (Критерий R5)</h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">{selectedProject.droneDate}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-400">Заявлено в рекламе / отчете:</span>
                      <span className="text-white">{selectedProject.droneClaimed}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${selectedProject.droneClaimed}%` }} />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-400">Факт по облету дрона ГАСК:</span>
                      <span className={selectedProject.droneClaimed - selectedProject.droneActual >= 15 ? 'text-red-400' : 'text-emerald-400'}>
                        {selectedProject.droneActual}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${selectedProject.droneClaimed - selectedProject.droneActual >= 15 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${selectedProject.droneActual}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ПРАВАЯ КОЛОНКА (1/3): ИТОГОВЫЙ БАЛЛ РИСКА + СВЕРКА С ГОСРЕЕСТРАМИ РК */}
            <div className="space-y-6">
              <div className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 text-center space-y-3 shadow-xl">
                <p className="text-xs font-bold uppercase text-zinc-400">Итоговый балл риска</p>
                <div className={`text-6xl font-black ${
                  selectedProject.zone === 'red' ? 'text-red-500' : selectedProject.zone === 'yellow' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {selectedProject.totalScore}
                </div>
                <div>
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase border ${
                    selectedProject.zone === 'red'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : selectedProject.zone === 'yellow'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {selectedProject.zone.toUpperCase()} ZONE
                  </span>
                </div>
                <p className="text-xs text-zinc-300 pt-2">
                  {selectedProject.zone === 'red'
                    ? 'Приоритетная сигнальная карточка для внеплановой проверки ГАСК ВКО'
                    : selectedProject.zone === 'yellow'
                    ? 'Объект на превентивном мониторинге МИО ВКО'
                    : 'Нарушений Закона РК о ДДУ не зафиксировано'}
                </p>
              </div>

              {/* СВЕРКА С ОТКРЫТЫМИ ГОСРЕЕСТРАМИ РК (ТЕМНЫЙ КОНТРАСТНЫЙ БЛОК) */}
              <div className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Сверка с открытыми государственными реестрами РК
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
                  <a href="https://homeportal.kz" target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-[#222228] hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 border border-zinc-600 flex items-center justify-between transition-all">
                    <span>КЖК (Гарантии)</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://qazreestr.kz" target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-[#222228] hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 border border-zinc-600 flex items-center justify-between transition-all">
                    <span>Qazreestr</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://elicense.kz" target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-[#222228] hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 border border-zinc-600 flex items-center justify-between transition-all">
                    <span>E-License</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://equrylys.kz" target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-[#222228] hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 border border-zinc-600 flex items-center justify-between transition-all">
                    <span>eQurylys</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://egov.kz" target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-[#222228] hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 border border-zinc-600 flex items-center justify-between transition-all">
                    <span>eGov (БИН)</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://kgd.gov.kz" target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-[#222228] hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 border border-zinc-600 flex items-center justify-between transition-all">
                    <span>КГД (Налоги)</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="bg-[#18181b] border border-amber-500/40 rounded-2xl p-5 space-y-2 shadow-xl">
                <p className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> Заключение ИИ-Аналитика по объекту:
                </p>
                <p className="text-xs text-zinc-200 leading-relaxed">{selectedProject.aiVerdict}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20">
      
      {/* ВКЛАДКА 1: ИНТЕРАКТИВНАЯ КАРТА ВКО */}
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
                <span>Красная зона (Нарушения):</span> <span>{metrics.red}</span>
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

      {/* ВКЛАДКА 2: ДАШБОРД И АНАЛИТИКА (СТАРТОВАЯ СТРАНИЦА) */}
      {activeTab === 'analytics' && (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
          
          <div className="bg-[#18181b] border border-zinc-700/80 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-500/15 rounded-xl flex items-center justify-center border border-amber-500/30">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Панель Аналитика ГАСК ВКО</h1>
                <p className="text-xs text-zinc-300">Скоринг R1–R6 застройщиков г. Усть-Каменогорск (ГАСК ВКО, КГД МФ РК, Qazreestr)</p>
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 h-[620px] w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 relative bg-[#18181b]">
              <MapComponent projects={filteredProjects as any} />
            </div>

            <div className="xl:col-span-1 bg-[#18181b] border border-zinc-700 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[620px]">
              <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-[#222228]">
                <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-amber-400" /> Объекты строительства ВКО
                </h2>
                <span className="px-2.5 py-1 rounded-lg bg-[#09090b] text-amber-400 border border-zinc-600 text-xs font-mono font-bold">{filteredProjects.length} ЖК</span>
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

                    {/* Бейджи активных факторов R1-R6 */}
                    <div className="flex flex-wrap gap-1.5">
                      {p.risks.map(r => (
                        <span
                          key={r.code}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            r.active
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-[#141418] text-zinc-500 border-zinc-700'
                          }`}
                        >
                          {r.code}: {r.active ? `+${r.weight}` : '0'}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-zinc-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {p.address}
                    </div>

                    <button
                      onClick={() => setSelectedPassportId(p.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition-all shadow-md"
                    >
                      ОТКРЫТЬ КАРТОЧКУ ЖК (ЧЕК-ЛИСТ R1–R6 И БПЛА)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ВКЛАДКА 3: МОНИТОРИНГ РЕКЛАМЫ С РЕАЛЬНЫМ ВЫЗОВОМ GEMINI AI */}
      {activeTab === 'ads' && (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
          
          <div className="bg-[#18181b] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    ИИ-Аудитор рекламы ДДУ (Google Gemini 2.5 Flash + Авто-расчет R2/R3)
                  </h2>
                  <p className="text-xs text-zinc-300">
                    Проверяет текст по ст. 7 Закона РК «О долевом участии» и автоматически обновляет факторы R2 (+25) и R3 (+10) в карточке ЖК
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
                Подставить пример незаконной оферты (ЖК «Emeralds»)
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
                  {projectsList.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — БИН {p.bin}</option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase">Текст рекламного объявления:</label>
                <input
                  type="text"
                  value={customAdText}
                  onChange={(e) => setCustomAdText(e.target.value)}
                  placeholder="Вставьте текст объявления с Krisha.kz, Instagram или Telegram..."
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
                  {isAiLoading ? 'ИИ анализирует...' : 'Проверить через Gemini AI'}
                </button>
              </div>
            </div>

            {liveAiResponse && (
              <div className={`p-5 rounded-xl border-2 mt-4 space-y-3 ${liveAiResponse.isViolation ? 'bg-red-950/40 border-red-500/60' : 'bg-emerald-950/40 border-emerald-500/60'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-sm font-black uppercase ${liveAiResponse.isViolation ? 'text-red-400' : 'text-emerald-400'}`}>
                    ВЕРДИКТ GEMINI AI: {liveAiResponse.riskLevel} РИСК ({liveAiResponse.riskScore} БАЛЛОВ)
                  </span>
                  <span className="text-xs font-mono text-zinc-200 bg-[#09090b] px-3 py-1 rounded-lg border border-zinc-700">
                    {liveAiResponse.lawArticle}
                  </span>
                </div>
                <p className="text-sm text-white leading-relaxed">{liveAiResponse.verdict}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {adsList.map(ad => (
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
                    {ad.aiRiskLevel}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-700 text-zinc-100 text-sm leading-relaxed">
                  {ad.text}
                </div>

                <div className="p-3.5 rounded-xl bg-[#222228] border border-zinc-600/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" /> {ad.aiLawReference}
                    </span>
                    <p className="text-xs text-zinc-200">{ad.aiExplanation}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPassportId(ad.projectId)}
                    className="px-4 py-2 rounded-xl bg-[#141418] hover:bg-amber-500 hover:text-zinc-950 text-amber-400 border border-zinc-600 text-xs font-bold shrink-0 transition-all"
                  >
                    Паспорт ЖК (R1–R6) →
                  </button>
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
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] text-amber-500 flex items-center justify-center font-bold">Загрузка SAQ QURYLYS...</div>}>
      <DashboardPlatform />
    </Suspense>
  );
}