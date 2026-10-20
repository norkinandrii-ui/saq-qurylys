"use client";

import React from 'react';
import { ConstructionProject, Factor } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/lib/store/I18nContext';
import { calculateRiskScore, determineRiskZone } from '@/lib/scoring';
import { Button } from '@/components/ui/Button';

export const RegistriesAdapters = ({ bin }: { bin: string }) => {
  const links = [
    { name: 'КЖК (Гарантии)', url: 'https://homeportal.kz' },
    { name: 'Qazreestr', url: 'https://qazreestr.kz' },
    { name: 'E-License', url: 'https://elicense.kz' },
    { name: 'eQurylys', url: 'https://reestr.equrylys.kz/organizations' },
    { name: 'eGov (БИН)', url: `https://egov.kz` },
    { name: 'КГД (Налоги)', url: 'https://kgd.gov.kz' }
  ];

  return (
    <Card className="no-print">
      <CardHeader><h3 className="font-bold text-sm">Сверка с открытыми государственными реестрами РК</h3></CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {links.map(l => (
            <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1 text-slate-700">
              {l.name}
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const FactorChecklist = ({ project, onUpdate }: { project: ConstructionProject, onUpdate: (p: ConstructionProject) => void }) => {
  const { t } = useI18n();

  const handleToggleStatus = (factorId: keyof typeof project.factors, newStatus: Factor['status']) => {
    const updatedFactors = {
      ...project.factors,
      [factorId]: { ...project.factors[factorId], status: newStatus }
    };
    const newScore = calculateRiskScore(updatedFactors);
    const newZone = determineRiskZone(newScore, updatedFactors);
    
    onUpdate({
      ...project,
      factors: updatedFactors,
      totalScore: newScore,
      zone: newZone
    });
  };

  const statusColors = {
    confirmed: 'red',
    hypothesis: 'yellow',
    needs_check: 'blue',
    none: 'green'
  } as const;

  const statusLabels = {
    confirmed: t('status_confirmed'),
    hypothesis: t('status_hypothesis'),
    needs_check: t('status_needs_check'),
    none: t('status_none')
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold">Чек-лист факторов риска</h3>
      {(Object.values(project.factors) as Factor[]).map(f => (
        <div key={f.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-md bg-white gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">{f.id}</span>
              <span className="text-sm font-medium">{t(`${f.id.toLowerCase()}_name` as any)}</span>
              <span className="text-xs text-slate-400">+{f.baseWeight} баллов</span>
            </div>
            {f.source && <div className="text-xs text-slate-500 mt-1">Источник: {f.source}</div>}
          </div>
          
          <div className="flex items-center gap-2 no-print">
            <Badge variant={statusColors[f.status]}>{statusLabels[f.status]}</Badge>
            <select 
              className="text-xs border rounded p-1 bg-slate-50"
              value={f.status}
              onChange={(e) => handleToggleStatus(f.id as any, e.target.value as Factor['status'])}
            >
              <option value="none">Отсутствует</option>
              <option value="needs_check">Нужна проверка</option>
              <option value="hypothesis">Гипотеза ИИ</option>
              <option value="confirmed">Подтвержден фактом</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};
