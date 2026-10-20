"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ru' | 'kz';

const translations = {
  ru: {
    dashboard: "Дашборд",
    map: "Карта",
    projects: "Реестр ЖК",
    ads: "Мониторинг рекламы",
    reset_demo: "Сбросить демо-данные",
    total_projects: "Всего объектов",
    green_zone: "Зеленая зона",
    yellow_zone: "Желтая зона",
    red_zone: "Красная зона",
    search_placeholder: "Поиск по названию ЖК или БИН",
    building: "Строится",
    completed: "Завершен",
    paused: "Простой",
    r1_name: "Отсутствие правового основания",
    r2_name: "Прямое предложение внести деньги",
    r3_name: "Активная реклама стройки",
    r4_name: "Коллективное обращение",
    r5_name: "Несовпадение готовности",
    r6_name: "Простой / просрочка",
    status_confirmed: "Подтвержден",
    status_hypothesis: "Гипотеза ИИ",
    status_needs_check: "Нужна проверка",
    status_none: "Отсутствует",
    analyze_ad: "Анализировать рекламу",
    print_signal: "Выгрузить (PDF/Печать)",
    confirm_signal: "Подтвердить сигнал",
    verify: "Проверить"
  },
  kz: {
    dashboard: "Бақылау тақтасы",
    map: "Карта",
    projects: "ТК тізілімі",
    ads: "Жарнама мониторингі",
    reset_demo: "Демо-деректерді қалпына келтіру",
    total_projects: "Барлық нысандар",
    green_zone: "Жасыл аймақ",
    yellow_zone: "Сары аймақ",
    red_zone: "Қызыл аймақ",
    search_placeholder: "ТК атауы немесе БСН бойынша іздеу",
    building: "Салынуда",
    completed: "Аяқталды",
    paused: "Тоқтап тұр",
    r1_name: "Құқықтық негіздің жоқтығы",
    r2_name: "Ақша салу туралы тікелей ұсыныс",
    r3_name: "Құрылыстың белсенді жарнамасы",
    r4_name: "Ұжымдық өтініш",
    r5_name: "Дайындықтың сәйкес келмеуі",
    r6_name: "Тоқтап қалу / мерзімін өткізіп алу",
    status_confirmed: "Расталды",
    status_hypothesis: "ЖИ гипотезасы",
    status_needs_check: "Тексеру қажет",
    status_none: "Жоқ",
    analyze_ad: "Жарнаманы талдау",
    print_signal: "Жүктеп алу (PDF/Басып шығару)",
    confirm_signal: "Сигналды растау",
    verify: "Тексеру"
  }
};

type Translations = typeof translations.ru;

interface I18nContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof Translations) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('ru');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('saq_lang') as Language;
    if (stored && (stored === 'ru' || stored === 'kz')) {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('saq_lang', lang);
    }
  }, [lang, isMounted]);

  const t = (key: keyof Translations) => {
    return translations[lang][key] || translations['ru'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
