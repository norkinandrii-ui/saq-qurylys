"use client";

import React, { use } from 'react';
import { useAppState } from '@/lib/store/AppStateContext';
import { useI18n } from '@/lib/store/I18nContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RegistriesAdapters, FactorChecklist } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/Button';
import { FileDown, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { projects, updateProject } = useAppState();
  const { t } = useI18n();

  const project = projects.find(p => p.id === id);

  if (!project) {
    return <div className="p-8 text-center">Проект не найден</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24">
      {/* Print-only watermark */}
      <div className="print-only fixed inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
        <div className="text-6xl font-bold rotate-45 whitespace-nowrap text-red-500">
          ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ<br/>НЕ ЯВЛЯЕТСЯ ОБВИНЕНИЕМ
        </div>
      </div>
      
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-slate-500">{project.address}</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" onClick={handlePrint}><FileDown className="w-4 h-4 mr-2" /> {t('print_signal')}</Button>
          {project.zone === 'red' && <Button variant="danger"><CheckCircle className="w-4 h-4 mr-2" /> {t('confirm_signal')}</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 relative">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500">Застройщик</div>
                <div className="font-medium">{project.developer}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">БИН</div>
                <div className="font-medium">{project.bin}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Статус строительства</div>
                <div className="font-medium">{t(project.status as any)} ({project.declaredReadiness}%)</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Законное основание</div>
                <div className="font-medium">
                  {project.legalBase.type === 'kzhk_guarantee' ? 'Гарантия КЖК' :
                   project.legalBase.type === 'mio_permission' ? 'Разрешение МИО' :
                   project.legalBase.type === 'bank_project' ? 'Проект БВУ' :
                   project.legalBase.type === 'none' ? 'Отсутствует' : 'Не проверено'}
                </div>
              </div>
            </CardContent>
          </Card>

          <FactorChecklist project={project} onUpdate={updateProject} />

          {project.droneImages && (
            <Card>
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold">Данные облета БПЛА (Дрон-мониторинг)</h3>
              </div>
              <CardContent className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm mb-2 text-slate-500">Снимок от {new Date(project.droneImages.date1).toLocaleDateString()}</div>
                  <div className="bg-slate-200 h-32 rounded flex items-center justify-center text-sm text-slate-500 border border-slate-300">
                     Демо фото 1 (Готовность ~25%)
                  </div>
                </div>
                <div>
                  <div className="text-sm mb-2 text-slate-500">Снимок от {new Date(project.droneImages.date2).toLocaleDateString()}</div>
                  <div className="bg-slate-200 h-32 rounded flex items-center justify-center text-sm text-slate-500 border border-slate-300">
                     Демо фото 2 (Готовность ~30%)
                  </div>
                </div>
                <div className="col-span-2 bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
                  <strong>Анализ ИИ (Компьютерное зрение):</strong> Заявленная готовность {project.declaredReadiness}%, фактическая по снимкам ~30%. Расхождение &gt; 20%. Рекомендуется активация фактора <b>R5</b>.
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        <div className="space-y-6">
          <Card className="text-center p-6 bg-slate-900 text-white">
            <div className="text-sm text-slate-400 mb-2">Итоговый балл риска</div>
            <div className={`text-6xl font-bold mb-4 ${
              project.zone === 'red' ? 'text-red-500' :
              project.zone === 'yellow' ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {project.totalScore}
            </div>
            <Badge variant={project.zone} className="uppercase text-sm px-4 py-1">{project.zone}</Badge>
            <div className="mt-4 text-xs text-slate-400">
              {project.zone === 'red' ? 'Приоритетная сигнальная карточка для проверки' :
               project.zone === 'yellow' ? 'Углубленная проверка документов' :
               'Плановый мониторинг'}
            </div>
          </Card>

          <RegistriesAdapters bin={project.bin} />
        </div>
      </div>
      
      {/* Signature block for print */}
      <div className="print-only mt-16 pt-8 border-t border-slate-300 flex justify-between">
        <div>
          <div className="text-sm text-slate-500">Сформировал (Аналитик МИО):</div>
          <div className="mt-4 border-b border-black w-48"></div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Дата и время формирования:</div>
          <div className="mt-4">{new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
