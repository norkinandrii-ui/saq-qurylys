import { NextResponse } from 'next/server';

const ASHYQ_DATASET_URL =
  'https://ashyq.data.gov.kz/dataset/magda-ds-b80110e9-218a-42ba-b8c8-01fa5e4c82c8';

const REGISTRY_TARGETS = [
  { id: 'homeportal', name: 'Жилищный портал КЖК', url: 'https://homeportal.kz' },
  { id: 'qazreestr', name: 'Qazreestr (Долевое строительство)', url: 'https://qazreestr.kz' },
  { id: 'ashyq', name: 'Ashyq Data (Датасет разрешений МИО)', url: ASHYQ_DATASET_URL },
  { id: 'elicense', name: 'E-License (Проверка лицензий)', url: 'https://elicense.kz' },
  { id: 'equrylys', name: 'eQurylys (Реестр стройорганизаций)', url: 'https://reestr.equrylys.kz/organizations' },
  { id: 'kgd', name: 'КГД МФ РК (Налоговая задолженность)', url: 'https://kgd.gov.kz' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bin = searchParams.get('bin') || '';
  const name = searchParams.get('name') || '';

  const results = await Promise.all(
    REGISTRY_TARGETS.map(async (target) => {
      const startTime = Date.now();
      try {
        const response = await fetch(target.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SaqQurylysGovMonitor/1.0)',
            'Accept': 'text/html,application/json',
          },
          signal: AbortSignal.timeout(6000),
        });

        const html = await response.text();
        const latencyMs = Date.now() - startTime;

        // Проверяем упоминание БИН или названия ЖК в ответе портала / датасета
        const foundBin = bin ? html.includes(bin) : false;
        const foundName = name ? html.toLowerCase().includes(name.toLowerCase()) : false;

        return {
          ...target,
          reachable: response.ok,
          httpStatus: response.status,
          latencyMs,
          matchedInRawHtml: foundBin || foundName,
          checkedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        return {
          ...target,
          reachable: false,
          httpStatus: 0,
          latencyMs: Date.now() - startTime,
          matchedInRawHtml: false,
          error: error?.message || 'Timeout / Connection error',
          checkedAt: new Date().toISOString(),
        };
      }
    })
  );

  return NextResponse.json({
    query: { bin, name },
    timestamp: new Date().toISOString(),
    registries: results,
  });
}