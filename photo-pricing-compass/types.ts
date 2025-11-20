
export enum AppView {
  PROFILE = 'PROFILE',
  SCENARIO = 'SCENARIO',
  CORPORATE = 'CORPORATE',
  LICENSING = 'LICENSING',
  NEGOTIATION = 'NEGOTIATION',
  HISTORY = 'HISTORY'
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
}

export interface UserProfile {
  name: string;
  currency: string;
  annualIncomeGoal: number;
  taxRate: number;
  workWeeksPerYear: number;
  daysPerWeek: number;
  hoursPerDay: number;
  percentBillable: number; // 0-100
  expenses: Expense[];
  targetHourlyRate: number;
  codbHourly: number;
  targetShootsPerYear: number;
}

export enum ScenarioType {
  INDIVIDUAL = 'Individual Session',
  TEAM = 'Team/Group Headshots',
  RETAINER = 'Monthly Retainer',
  LICENSING = 'Licensing Only'
}

export interface QuoteTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  hourlyRateEffective: number;
  margin: number;
}

export interface ProjectExpense {
  id: string;
  name: string;
  amount: number;
}

export interface ScenarioData {
  id: string;
  date: string;
  type: ScenarioType;
  title: string;
  inputs: Record<string, any>;
  projectExpenses: ProjectExpense[]; // New detailed expenses
  tiers: [QuoteTier, QuoteTier, QuoteTier]; // Essential, Standard, Premium
  selectedTier?: string;
  status: 'Draft' | 'Won' | 'Lost';
  finalPrice?: number;
}