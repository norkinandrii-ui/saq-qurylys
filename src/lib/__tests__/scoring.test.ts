import { describe, it, expect } from 'vitest';
import { calculateRiskScore, determineRiskZone } from '../scoring';
import { Factor } from '../types';

const defaultFactors: Record<'R1'|'R2'|'R3'|'R4'|'R5'|'R6', Factor> = {
  R1: { id: 'R1', name: '', description: '', baseWeight: 35, status: 'none' },
  R2: { id: 'R2', name: '', description: '', baseWeight: 25, status: 'none' },
  R3: { id: 'R3', name: '', description: '', baseWeight: 10, status: 'none' },
  R4: { id: 'R4', name: '', description: '', baseWeight: 15, status: 'none' },
  R5: { id: 'R5', name: '', description: '', baseWeight: 10, status: 'none' },
  R6: { id: 'R6', name: '', description: '', baseWeight: 5, status: 'none' }
};

describe('Risk Scoring Engine', () => {
  it('calculates score correctly ignoring hypotheses and unverified data', () => {
    const factors = {
      ...defaultFactors,
      R1: { ...defaultFactors.R1, status: 'needs_check' as const },
      R2: { ...defaultFactors.R2, status: 'hypothesis' as const },
      R3: { ...defaultFactors.R3, status: 'confirmed' as const }
    };
    
    expect(calculateRiskScore(factors)).toBe(10);
  });

  it('caps the score at 100', () => {
    const factors = {
      ...defaultFactors,
      R1: { ...defaultFactors.R1, status: 'confirmed' as const }, // 35
      R2: { ...defaultFactors.R2, status: 'confirmed' as const }, // 25
      R3: { ...defaultFactors.R3, status: 'confirmed' as const }, // 10
      R4: { ...defaultFactors.R4, status: 'confirmed' as const }, // 15
      R5: { ...defaultFactors.R5, status: 'confirmed' as const }, // 10
      R6: { ...defaultFactors.R6, status: 'confirmed' as const }  // 5
    };
    
    // Sum is 100
    expect(calculateRiskScore(factors)).toBe(100);
  });

  it('Case A: Yellow zone (Right conditions but not R1)', () => {
    const factors = {
      ...defaultFactors,
      R1: { ...defaultFactors.R1, status: 'needs_check' as const }, // 0
      R2: { ...defaultFactors.R2, status: 'confirmed' as const }, // 25
      R3: { ...defaultFactors.R3, status: 'confirmed' as const }  // 10
    };
    
    const score = calculateRiskScore(factors);
    expect(score).toBe(35);
    expect(determineRiskZone(score, factors)).toBe('yellow');
  });

  it('Case B: Red zone (R1 + R2 and >= 60)', () => {
    const factors = {
      ...defaultFactors,
      R1: { ...defaultFactors.R1, status: 'confirmed' as const }, // 35
      R2: { ...defaultFactors.R2, status: 'confirmed' as const }, // 25
      R3: { ...defaultFactors.R3, status: 'confirmed' as const }  // 10
    };
    
    const score = calculateRiskScore(factors);
    expect(score).toBe(70);
    expect(determineRiskZone(score, factors)).toBe('red');
  });

  it('Case C: Green zone (Score < 25)', () => {
    const factors = {
      ...defaultFactors,
      R1: { ...defaultFactors.R1, status: 'none' as const }, // 0
      R3: { ...defaultFactors.R3, status: 'confirmed' as const }  // 10
    };
    
    const score = calculateRiskScore(factors);
    expect(score).toBe(10);
    expect(determineRiskZone(score, factors)).toBe('green');
  });

  it('Strict Red Zone Rule: >= 60 but missing R1 or R2 stays Yellow', () => {
    const factors = {
      ...defaultFactors,
      R1: { ...defaultFactors.R1, status: 'confirmed' as const }, // 35
      // Missing R2!
      R3: { ...defaultFactors.R3, status: 'confirmed' as const }, // 10
      R4: { ...defaultFactors.R4, status: 'confirmed' as const }, // 15
      R6: { ...defaultFactors.R6, status: 'confirmed' as const }  // 5
    };
    
    const score = calculateRiskScore(factors);
    expect(score).toBe(65);
    expect(determineRiskZone(score, factors)).toBe('yellow'); // Should be yellow, not red
  });
});
