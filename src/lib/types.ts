export type RiskZone = 'green' | 'yellow' | 'red';
export type VerificationStatus = 'confirmed' | 'hypothesis' | 'needs_check' | 'none';

export interface Factor {
  id: 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';
  name: string;
  description: string;
  baseWeight: number;
  status: VerificationStatus;
  source?: string; // Link to proof or text
  dateFixed?: string; // ISO string
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LegalBase {
  type: 'kzhk_guarantee' | 'bank_project' | 'mio_permission' | 'none' | 'unknown';
  status: 'active' | 'inactive' | 'unknown';
}

export interface ConstructionProject {
  id: string;
  name: string;
  developer: string;
  bin: string;
  address: string;
  coordinates: Coordinates;
  status: 'building' | 'completed' | 'paused';
  declaredReadiness: number; // percentage
  actualReadiness?: number; // percentage from drone
  legalBase: LegalBase;
  factors: Record<'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6', Factor>;
  totalScore: number;
  zone: RiskZone;
  droneImages?: {
    date1: string;
    url1: string;
    date2: string;
    url2: string;
  };
}

export interface AdPublication {
  id: string;
  source: string; // e.g. Instagram, Krisha.kz
  author: string;
  datePublished: string;
  dateFixed: string;
  url: string;
  text: string;
  imageUrl?: string;
  projectId?: string; // Linked project
}

export interface AIHypothesis {
  id: string;
  adId?: string; // if based on an ad
  projectId: string;
  factors: ('R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6')[];
  quote: string; // The text fragment that triggered this
  confidence: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  analystName: string;
  action: string;
  details: string;
  projectId?: string;
}

export interface SeedData {
  projects: ConstructionProject[];
  ads: AdPublication[];
  hypotheses: AIHypothesis[];
  logs: AuditLog[];
}
