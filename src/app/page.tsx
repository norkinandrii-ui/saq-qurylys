"use client";

import React, { useMemo, useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldAlert, ShieldCheck, Shield, Search, Building2, Activity, 
  ListFilter, ExternalLink, Cpu, Sparkles, MapPin, Printer, 
  CheckCircle2, ArrowLeft, Camera, Table2, KeyRound, AlertTriangle
} from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/map/DynamicMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#18181b] animate-pulse flex items-center justify-center text-amber-500 font-bold">Загрузка карты Усть-Каменогорска...</div>
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

// ТОЧНЫЕ АДРЕСА И КООРДИНАТЫ 2ГИС / KRISHA.KZ Г. УСТЬ-КАМЕНОГОРСК
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
    coordinates: { lat: 49.894943, lng: 82.607870 },
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
    address: 'г. Усть-Каменогорск, р-н КШТ, пр. Ильяса Есенберлина, 14',
    zone: 'red',
    totalScore: 70,
    buildStatus: 'Строится (котлован / каркас 25%)',
    legalBasis: 'Отсутствует в белом списке ГАСК ВКО',
    droneClaimed: 40,
    droneActual: 25,
    droneDate: '14.10.2026 (БПЛА ГАСК ВКО #02)',
    coordinates: { lat: 49.902324, lng: 82.605220 },
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
    address: 'г. Усть-Каменогорск, пр. Ильяса Есенберлина, 92',
    zone: 'yellow',
    totalScore: 45,
    buildStatus: 'Строится (монолитный каркас 55%)',
    legalBasis: 'Проверка документов уполномоченной компании',
    droneClaimed: 60,
    droneActual: 55,
    droneDate: '15.10.2026 (БПЛА ГАСК ВКО #01)',
    coordinates: { lat: 49.886420, lng: 82.627150 },
    aiVerdict: 'Объект расположен по адресу пр. Ильяса Есенберлина, 92 (2ГИС). Уполномоченная компания БИН 230340036850. Проводится мониторинг рекламы риелторов на Krisha.kz.',
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
    name: 'ЖК «Премьера»',
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
    coordinates: { lat: 49.887850, lng: 82.629410 },
    aiVerdict: 'Расположен на пр. Каныша Сатпаева, 84/4 (2ГИС). На агрегаторах зафиксированы объявления о переуступке прав требования от физлиц и риелторов.',
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
    developer: 'ТОО «EKM Company» (AN Groups)',
    bin: '201040022748',
    address: 'г. Усть-Каменогорск, 19-й мкр., ул. Кокжал Барака, 18 а, б, в',
    zone: 'green',
    totalScore: 0,
    buildStatus: 'Активное строительство (85%, 5 этажей, кирпич)',
    legalBasis: 'Гарантия Единого оператора АО «КЖК»',
    droneClaimed: 85,
    droneActual: 85,
    droneDate: '16.10.2026 (БПЛА ГАСК ВКО #03)',
    coordinates: { lat: 49.888850, lng: 82.614820 },
    aiVerdict: 'Белый список ГАСК ВКО: ул. Кокжал Барака, 18 а,б,в (рядом со школами №46 и №48). Имеется официальная гарантия АО «КЖК». Все ДДУ регистрируются в Qazreestr.',
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
    address: 'г. Усть-Каменогорск, пр. Победы, 2',
    zone: 'green',
    totalScore: 5,
    buildStatus: 'Строится по графику (80%, 18 этажей)',
    legalBasis: 'Разрешение МИО №KZ26VWE00002487',
    droneClaimed: 80,
    droneActual: 80,
    droneDate: '16.10.2026 (БПЛА ГАСК ВКО #03)',
    coordinates: { lat: 49.951840, lng: 82.607420 },
    aiVerdict: 'Белый список ГАСК ВКО: расположен на пр. Победы, 2 (2ГИС). Получено разрешение МИО №KZ26VWE00002487 на привлечение средств дольщиков.',
    risks: [
      { code: 'R1', title: 'Отсутствие правового основания (КЖК / БВУ / МИО)', weight: 35, active: false, source: 'Разрешение Акимата ВКО №KZ26VWE00002487' },
      { code: 'R2', title: 'Прямое предложение внести деньги (ПДКП / бронь)', weight: 25, active: false, source: 'Нарушений не выявлено' },
      { code: 'R3', title: 'Активная реклама стройки без разрешения ДДУ', weight: 10, active: false, source: 'Законная реклама' },
      { code: 'R4', title: 'Коллективное обращение / жалобы дольщиков', weight: 15, active: false, source: 'Отсутствует' },
      { code: 'R5', title: 'Несовпадение строительной готовности (БПЛА-контроль)', weight: 10, active: false, source: 'Совпадает с отчетом eQurylys' },
      { code: 'R6', title: 'Простой строительства / перенос сроков сдачи', weight: 5, active: true, source: 'Корректировка графика благоустройства двора' },
    ]
  },
  {
    id: 'vko-zolotoy-kvadrat',
    name: 'ЖК «Золотой квадрат»',
    developer: 'ТОО «НАУАН Корп»',
    bin: '970640000190',
    address: 'г. Усть-Каменогорск, ул. Касыма Кайсенова, 55/1',
    zone: 'green',
    totalScore: 0,
    buildStatus: 'Строится (90% готовности, 19 этажей, 252 кв.)',
    legalBasis: 'Гарантия Единого оператора АО «КЖК»',
    droneClaimed: 90,
    droneActual: 90,
    droneDate: '17.10.2026 (БПЛА ГАСК ВКО #02)',
    coordinates: { lat: 49.945351, lng: 82.622899 },
    aiVerdict: 'Белый список ГАСК ВКО: ул. К. Кайсенова, 55/1 (5 минут от Акимата ВКО). Застройщик работает с 1997 г. (БИН 970640000190). Гарантия АО «КЖК» верифицирована.',
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
    address: 'г. Усть-Каменогорск, 19-й мкр., ул. Увалиева, 8/3',
    zone: 'green',
    totalScore: 0,
    buildStatus: 'Строится (95% готовности, 5 этажей, 140 кв.)',
    legalBasis: 'Разрешение МИО (Участие проекта БВУ / Отбасы Банк)',
    droneClaimed: 95,
    droneActual: 95,
    droneDate: '17.10.2026 (БПЛА ГАСК ВКО #02)',
    coordinates: { lat: 49.892912, lng: 82.615559 },
    aiVerdict: 'Белый список ГАСК ВКО: ул. Увалиева, 8/3. Финансирование через участие БВУ и ипотечные программы АО «Отбасы банк» («Наурыз», «50/50»).',
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
    text: 'Квартиры в ЖК ASYLYM (19-й мкр., ул. Кокжал Барака, 18 а,б,в). Строительство с гарантией Единого оператора АО «КЖК». Заключение официальных ДДУ через Qazreestr.',
    url: 'https://krisha.kz/complex/show/ust-kamenogorsk/asylym/',
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
  const activeTab = searchParams?.get('tab') || 'analytics';

  const [projectsList, setProjectsList] = useState<VkoProject[]>(INITIAL_VKO_PROJECTS);
  const [selectedPassportId, setSelectedPassportId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all');

  const [selectedProjectId, setSelectedProjectId] = useState(INITIAL_VKO_PROJECTS[0].id);
  const [customAdText, setCustomAdText] = useState('');
  const [clientApiKey, setClientApiKey] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [liveAiResponse, setLiveAiResponse] = useState<any>(null);
  const [adsList, setAdsList] = useState(INITIAL_VKO_ADS);

  useEffect(() => {
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem('saq_gemini_key') || '' : '';
    if (savedKey) setClientApiKey(savedKey);
  }, []);

  const handleSaveKey = (val: string) => {
    setClientApiKey(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('saq_gemini_key', val);
    }
  };

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

  const confirmSignal = (projectId: string) => {
    setProjectsList(prev => prev.map(p => p.id === projectId ? { ...p, signalConfirmed: true } : p));
  };

  // ПРЯМОЙ ВЫЗОВ РЕАЛЬНОГО GOOGLE GEMINI API
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
          clientApiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setAiError(data.error || 'Ошибка вызова Gemini API');
        setIsAiLoading(false);
        return;
      }

      setLiveAiResponse({ ...data, project: targetProject });

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
          author: `Нейросеть: ${data.engine}`,
          source: 'Gemini Live API',
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
      setAiError('Ошибка соединения с сервером: ' + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 lg:p-8 w-full">
        <div className="w-full space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18181b] border border-zinc-700 p-6 rounded-2xl shadow-xl">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedPassportId(null)}
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 mb-2"
              >
                <ArrowLeft className="w-4 h-4" /> Вернуться на Дашборд ГАСК ВКО
              </button>
              <h1 className="text-2xl md:text-3xl font-black text-white">{selectedProject.name}</h1>
              <p className="text-sm text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" /> {selectedProject.address} (GPS: {selectedProject.coordinates.lat}, {selectedProject.coordinates.lng})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-[#27272a] hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-600 flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4 text-amber-400" /> Выгрузить предписание (PDF / Печать)
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
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xl">
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Застройщик / Уполномоченная компания</p>
                  <p className="text-base font-black text-white">{selectedProject.developer}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400 mb-1">БИН (КГД МФ РК / eGov)</p>
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

              <div className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
                  <h2 className="text-lg font-black text-white">Чек-лист факторов риска (Матрица R1–R6 по ТЗ)</h2>
                  <span className="text-xs text-zinc-400">Кликните по статусу для пересчета</span>
                </div>

                <div className="space-y-3">
                  {selectedProject.risks.map((risk) => (
                    <div
                      key={risk.code}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        risk.active ? 'bg-[#221a1c] border-red-500/40' : 'bg-[#121216] border-zinc-800'
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
                      <span className="text-zinc-400">Заявлено застройщиком:</span>
                      <span className="text-white">{selectedProject.droneClaimed}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${selectedProject.droneClaimed}%` }} />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-400">Факт по аэрофотосъемке БПЛА ГАСК:</span>
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
              </div>

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
                  <Cpu className="w-4 h-4" /> Заключение ИИ-Аналитика:
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-16 w-full">
      
      {/* ВКЛАДКА 1: ИНТЕРАКТИВНАЯ КАРТА ВКО */}
      {activeTab === 'map' && (
        <div className="w-full h-[calc(100vh-64px)] relative bg-[#121216]">
          <MapComponent
            projects={filteredProjects}
            onSelectProject={(id: string) => setSelectedPassportId(id)}
          />
          
          <div className="absolute top-6 right-6 bg-[#18181b]/95 backdrop-blur-md p-5 rounded-2xl border border-zinc-700 shadow-2xl z-10 w-80 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-700">
              <MapPin className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-white">Геомониторинг ГАСК ВКО (RU)</h2>
                <p className="text-[11px] text-zinc-400">Точные адреса 2ГИС г. Усть-Каменогорск</p>
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

      {/* ВКЛАДКА 2: ПОЛНОШИРИННЫЙ ДАШБОРД И АНАЛИТИКА */}
      {activeTab === 'analytics' && (
        <div className="w-full px-4 lg:px-8 py-6 space-y-6">
          
          <div className="bg-[#18181b] border border-zinc-700/80 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-500/15 rounded-xl flex items-center justify-center border border-amber-500/30">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Панель Аналитика ГАСК ВКО</h1>
                <p className="text-xs text-zinc-300">Скоринг R1–R6 застройщиков г. Усть-Каменогорск (2ГИС, ГАСК ВКО, КГД МФ РК, Qazreestr)</p>
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

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 h-[640px] w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 relative bg-[#18181b]">
              <MapComponent
                projects={filteredProjects}
                onSelectProject={(id: string) => setSelectedPassportId(id)}
              />
            </div>

            <div className="xl:col-span-4 bg-[#18181b] border border-zinc-700 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[640px]">
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

          <div className="bg-[#18181b] border border-zinc-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-700 bg-[#222228] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Table2 className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-sm text-white uppercase tracking-wider">
                  Сводная матрица риск-скоринга (R1–R6) и БПЛА-мониторинга по г. Усть-Каменогорск
                </h2>
              </div>
              <span className="text-xs text-zinc-400">Точные адреса верифицированы по 2ГИС и Krisha.kz</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#121216] text-zinc-400 border-b border-zinc-700 uppercase">
                    <th className="p-3.5 font-bold">Жилой комплекс / Адрес (2ГИС)</th>
                    <th className="p-3.5 font-bold">Застройщик / БИН</th>
                    <th className="p-3.5 font-bold">Правовое основание ДДУ</th>
                    <th className="p-3.5 font-bold text-center">БПЛА (Заявл. / Факт)</th>
                    <th className="p-3.5 font-bold text-center">Матрица R1–R6</th>
                    <th className="p-3.5 font-bold text-center">Риск-скоринг</th>
                    <th className="p-3.5 font-bold text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredProjects.map(p => (
                    <tr key={p.id} className="hover:bg-[#222228]/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{p.name}</div>
                        <div className="text-zinc-400">{p.address}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-zinc-200">{p.developer}</div>
                        <div className="font-mono text-amber-400">БИН: {p.bin}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={p.zone === 'red' ? 'text-red-400 font-bold' : 'text-zinc-200'}>
                          {p.legalBasis}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        <span className="text-zinc-300">{p.droneClaimed}%</span> /{' '}
                        <span className={p.droneClaimed - p.droneActual >= 15 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {p.droneActual}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex gap-1">
                          {p.risks.map(r => (
                            <span
                              key={r.code}
                              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                                r.active ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-zinc-800 text-zinc-500'
                              }`}
                            >
                              {r.code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-md font-black ${
                          p.zone === 'red' ? 'bg-red-500/20 text-red-300' : p.zone === 'yellow' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {p.totalScore} б.
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedPassportId(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#27272a] hover:bg-amber-500 hover:text-zinc-950 text-amber-400 font-bold transition-colors"
                        >
                          Паспорт ЖК →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ВКЛАДКА 3: МОНИТОРИНГ РЕКЛАМЫ С НАСТОЯЩИМ GOOGLE GEMINI API */}
      {activeTab === 'ads' && (
        <div className="w-full px-4 lg:px-8 py-6 space-y-6">
          
          <div className="bg-[#18181b] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    Реальный ИИ-Аудитор рекламы ДДУ (Прямой запрос к Google Gemini API)
                  </h2>
                  <p className="text-xs text-zinc-300">
                    Отправляет промпт с данными ЖК и БИН на сервер Google Gemini и автоматически активирует критерии R2 (+25) и R3 (+10)
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
                Вставить пример незаконной оферты (ЖК «Emeralds»)
              </button>
            </div>

            {/* ПОЛЕ ДЛЯ ПРЯМОЙ ПРИВЯЗКИ GEMINI API KEY (ЕСЛИ .ENV.LOCAL НЕ СРАБОТАЛ) */}
            <div className="p-3.5 rounded-xl bg-[#121216] border border-zinc-700 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 shrink-0">
                <KeyRound className="w-4 h-4" /> Ключ Google Gemini API (опционально, если нет в .env.local):
              </div>
              <input
                type="password"
                value={clientApiKey}
                onChange={(e) => handleSaveKey(e.target.value)}
                placeholder="Вставьте ваш ключ AIzaSy... с aistudio.google.com/apikey"
                className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-zinc-600 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
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
                  placeholder="Вставьте текст объявления для отправки в Google Gemini..."
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
                  {isAiLoading ? 'Запрос к Google Gemini...' : 'Анализировать через Gemini'}
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
                    ОТВЕТ НЕЙРОСЕТИ ({liveAiResponse.engine}): {liveAiResponse.riskLevel} РИСК ({liveAiResponse.riskScore} БАЛЛОВ)
                  </span>
                  <span className="text-xs font-mono text-zinc-200 bg-[#09090b] px-3 py-1 rounded-lg border border-zinc-700">
                    {liveAiResponse.lawArticle}
                  </span>
                </div>
                <p className="text-sm text-white leading-relaxed">{liveAiResponse.verdict}</p>
                {liveAiResponse.detectedTriggers && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-xs text-zinc-300 font-bold">Выявленные триггеры Gemini:</span>
                    {liveAiResponse.detectedTriggers.map((t: string, i: number) => (
                      <span key={i} className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
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
                    Открыть Паспорт ЖК (R1–R6) →
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