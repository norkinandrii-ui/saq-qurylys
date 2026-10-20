"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import seedDataRaw from '@/data/seed.json';
import { SeedData, ConstructionProject, AdPublication, AIHypothesis, AuditLog } from '@/lib/types';

const seedData = seedDataRaw as SeedData;

interface AppState {
  projects: ConstructionProject[];
  ads: AdPublication[];
  hypotheses: AIHypothesis[];
  logs: AuditLog[];
  resetDemoData: () => void;
  updateProject: (project: ConstructionProject) => void;
  addHypothesis: (hypothesis: AIHypothesis) => void;
  acceptHypothesis: (hypothesisId: string) => void;
  rejectHypothesis: (hypothesisId: string) => void;
  addAd: (ad: AdPublication) => void;
  addLog: (log: AuditLog) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<SeedData>({
    projects: [],
    ads: [],
    hypotheses: [],
    logs: []
  });

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('saq_qurylys_data');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        setData(seedData);
      }
    } else {
      setData(seedData);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('saq_qurylys_data', JSON.stringify(data));
    }
  }, [data, isMounted]);

  const resetDemoData = () => {
    setData(seedData);
    localStorage.removeItem('saq_qurylys_data');
  };

  const updateProject = (project: ConstructionProject) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === project.id ? project : p)
    }));
  };

  const addHypothesis = (hypothesis: AIHypothesis) => {
    setData(prev => ({ ...prev, hypotheses: [hypothesis, ...prev.hypotheses] }));
  };

  const acceptHypothesis = (hypothesisId: string) => {
    setData(prev => {
      const h = prev.hypotheses.find(x => x.id === hypothesisId);
      if (!h) return prev;
      
      const updatedHypotheses = prev.hypotheses.map(x => x.id === hypothesisId ? { ...x, status: 'accepted' as const } : x);
      
      // We would also update project factors here in a real app, 
      // but let's assume the user updates factors separately or we do it via a complex reducer
      // For this MVP, we will let the component handle factor updates, then call updateProject
      
      return { ...prev, hypotheses: updatedHypotheses };
    });
  };

  const rejectHypothesis = (hypothesisId: string) => {
    setData(prev => ({
      ...prev,
      hypotheses: prev.hypotheses.map(h => h.id === hypothesisId ? { ...h, status: 'rejected' } : h)
    }));
  };

  const addAd = (ad: AdPublication) => {
    setData(prev => ({ ...prev, ads: [ad, ...prev.ads] }));
  };

  const addLog = (log: AuditLog) => {
    setData(prev => ({ ...prev, logs: [log, ...prev.logs] }));
  };

  return (
    <AppStateContext.Provider value={{
      ...data,
      resetDemoData,
      updateProject,
      addHypothesis,
      acceptHypothesis,
      rejectHypothesis,
      addAd,
      addLog
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
};
