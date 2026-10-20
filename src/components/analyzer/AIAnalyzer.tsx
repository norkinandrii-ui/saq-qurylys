"use client";

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/AppStateContext';
import { AdPublication, AIHypothesis, ConstructionProject } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { v4 as uuidv4 } from 'uuid';
import { Check, X } from 'lucide-react';

// Simple deterministic NLP simulator using Regex
const analyzeText = (text: string, projects: ConstructionProject[]): { 
  matchedProject?: string, 
  triggers: string[], 
  factors: ('R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6')[] 
} => {
  const lowerText = text.toLowerCase();
  
  // 1. Match project by name
  let matchedProject: string | undefined;
  for (const p of projects) {
    // simplified fuzzy match
    const nameWords = p.name.toLowerCase().replace(/жк|«|»|-демо/g, '').trim().split(' ');
    if (nameWords.some(w => w.length > 3 && lowerText.includes(w))) {
      matchedProject = p.id;
      break;
    }
  }

  // 2. Find triggers
  const triggers: string[] = [];
  const factors = new Set<('R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6')>();

  const r2Patterns = [
    { regex: /бронь/i, type: 'R2' },
    { regex: /депозит/i, type: 'R2' },
    { regex: /взнос/i, type: 'R2' },
    { regex: /рассрочк/i, type: 'R2' },
    { regex: /котлован/i, type: 'R2' }
  ];

  for (const p of r2Patterns) {
    if (p.regex.test(lowerText)) {
      factors.add('R2');
      const match = lowerText.match(new RegExp(`.{0,15}${p.regex.source}.{0,15}`, 'i'));
      if (match) triggers.push(`"...${match[0]}..."`);
    }
  }
  
  const r3Patterns = [
    { regex: /старт продаж/i, type: 'R3' },
    { regex: /открыты продажи/i, type: 'R3' },
    { regex: /покупай/i, type: 'R3' }
  ];

  for (const p of r3Patterns) {
    if (p.regex.test(lowerText)) {
      factors.add('R3');
    }
  }
  
  // If no R3 triggers found specifically, but we found a project and it's an ad text, assume R3
  if (matchedProject && factors.size > 0 && !factors.has('R3')) {
      factors.add('R3');
  }

  return {
    matchedProject,
    triggers,
    factors: Array.from(factors)
  };
};

export const AIAnalyzer = () => {
  const { projects, addAd, addHypothesis, hypotheses, acceptHypothesis, rejectHypothesis, updateProject } = useAppState();
  const [text, setText] = useState('');
  const [source, setSource] = useState('Instagram');

  const handleAnalyze = () => {
    if (!text) return;
    
    const analysis = analyzeText(text, projects);
    
    const newAd: AdPublication = {
      id: uuidv4(),
      source,
      author: 'Unknown',
      datePublished: new Date().toISOString(),
      dateFixed: new Date().toISOString(),
      url: '#',
      text,
      projectId: analysis.matchedProject
    };
    
    addAd(newAd);

    if (analysis.matchedProject && analysis.factors.length > 0) {
      const newHypothesis: AIHypothesis = {
        id: uuidv4(),
        adId: newAd.id,
        projectId: analysis.matchedProject,
        factors: analysis.factors,
        quote: analysis.triggers.join(' | ') || 'Общий контекст продажи',
        confidence: 92,
        status: 'pending'
      };
      addHypothesis(newHypothesis);
    }
    
    setText('');
  };

  const handleAccept = (h: AIHypothesis) => {
    acceptHypothesis(h.id);
    const p = projects.find(x => x.id === h.projectId);
    if (p) {
      const updatedFactors = { ...p.factors };
      h.factors.forEach(f => {
        updatedFactors[f] = { ...updatedFactors[f], status: 'confirmed', source: `ИИ Гипотеза (уверенность ${h.confidence}%)` };
      });
      // Import calculateRiskScore and determineRiskZone dynamically or just use simple logic if we don't want to break imports
      // We will do a full update
      import('@/lib/scoring').then(({ calculateRiskScore, determineRiskZone }) => {
        updateProject({
          ...p,
          factors: updatedFactors,
          totalScore: calculateRiskScore(updatedFactors),
          zone: determineRiskZone(calculateRiskScore(updatedFactors), updatedFactors)
        });
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
        <h3 className="font-bold mb-4">Добавить и проанализировать публикацию (ИИ)</h3>
        <div className="flex gap-2 mb-2">
           <select className="border rounded p-2 text-sm" value={source} onChange={e => setSource(e.target.value)}>
             <option>Instagram</option><option>Telegram</option><option>Krisha.kz</option><option>OLX</option>
           </select>
           <Button variant="outline" size="sm" onClick={() => setText("Старт продаж ЖК Ертіс Тауэрс Демо! Бронь квартиры всего за 300 000 тенге.")}>Пресет (Демо)</Button>
        </div>
        <textarea 
          className="w-full border rounded-md p-2 text-sm" 
          rows={4} 
          placeholder="Вставьте текст рекламного объявления или загрузите скриншот (OCR симуляция)..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Button className="mt-2 w-full" onClick={handleAnalyze}>Анализировать (NLP)</Button>
      </div>

      {hypotheses.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold">Гипотезы ИИ, ожидающие проверки</h3>
          {hypotheses.map(h => {
             const proj = projects.find(p => p.id === h.projectId);
             return (
              <div key={h.id} className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm relative">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-blue-900">Обнаружены факторы: {h.factors.join(', ')}</div>
                  <Badge variant={h.status === 'pending' ? 'blue' : h.status === 'accepted' ? 'green' : 'red'}>
                    {h.status === 'pending' ? 'Ожидает' : h.status === 'accepted' ? 'Принята' : 'Отклонена'}
                  </Badge>
                </div>
                <div className="text-slate-600 mb-1">Объект: {proj?.name || 'Неизвестно'}</div>
                <div className="bg-white p-2 rounded text-xs border italic mb-2">
                  Триггер: {h.quote}
                </div>
                <div className="text-xs text-blue-700 font-medium mb-3">Confidence: {h.confidence}%</div>
                
                {h.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => handleAccept(h)}><Check className="w-4 h-4 mr-1"/> Принять гипотезу</Button>
                    <Button size="sm" variant="outline" onClick={() => rejectHypothesis(h.id)}><X className="w-4 h-4 mr-1"/> Отклонить</Button>
                  </div>
                )}
              </div>
             )
          })}
        </div>
      )}
    </div>
  );
};
