// Shared types across the application

export interface KnowledgeEntry {
  id: string;
  name: string;
  context: string | null;
}

export interface UsageData {
  callsUsed: number;
  callsLimit: number;
  minutesUsed: number;
  minutesLimit: number;
}

export interface CallLimits extends UsageData {
  canCall: boolean;
  isPremium: boolean;
}
