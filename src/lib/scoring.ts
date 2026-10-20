import { ConstructionProject, RiskZone, Factor } from './types';

export function calculateRiskScore(factors: Record<string, Factor>): number {
  let score = 0;
  for (const key in factors) {
    const factor = factors[key as keyof typeof factors];
    if (factor.status === 'confirmed') {
      score += factor.baseWeight;
    }
  }
  return Math.min(100, score);
}

export function determineRiskZone(score: number, factors: Record<string, Factor>): RiskZone {
  const r1Confirmed = factors.R1?.status === 'confirmed';
  const r2Confirmed = factors.R2?.status === 'confirmed';

  if (score >= 60 && r1Confirmed && r2Confirmed) {
    return 'red';
  } else if (score >= 25) {
    return 'yellow';
  } else {
    return 'green';
  }
}

export function updateProjectRisk(project: ConstructionProject): ConstructionProject {
  const newScore = calculateRiskScore(project.factors);
  const newZone = determineRiskZone(newScore, project.factors);
  
  return {
    ...project,
    totalScore: newScore,
    zone: newZone
  };
}
