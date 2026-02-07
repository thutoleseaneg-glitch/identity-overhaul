
export type Category = 'sales' | 'network' | 'relationships' | 'finance' | 'productivity' | 'gym' | 'notes';

export interface SalesSource {
  name: string;
  count: number;
  active: boolean;
}

export interface RevenueSource {
  name: string;
  amount: number;
}

export type CallType = 'cold' | 'warm' | 'followup' | 'client';

export interface CallRecord {
  id: string;
  timestamp: string; // ISO string
  contact: string;
  company: string;
  type: CallType;
  duration: string; // MM:SS
  durationSeconds: number;
  outcome: string;
  objections: string[];
  notes: string;
  success: boolean;
}

export interface SalesEntry {
  leads: number;
  sources: SalesSource[];
  leadQuality: number; // 1-10
  coldCalls: number;
  meetings: number;
  dealsClosed: number;
  revenue: number;
  revenueBreakdown: RevenueSource[];
  dealStage: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  callLog: CallRecord[];
  notes: string;
}

export type NetworkTier = 'strategic' | 'key' | 'regular' | 'casual';
export type IndustrySector = 'Mining' | 'Tourism' | 'Finance' | 'Agriculture' | 'Tech' | 'Government' | 'Manufacturing' | 'Other';

export interface Interaction {
  id: string;
  date: string;
  type: 'Meeting' | 'Call' | 'Email' | 'Social' | 'Event';
  notes: string;
  outcomeScore: number; // 1-5
}

export interface TrustMatrix {
  integrity: number;      // 0-25
  competence: number;     // 0-25
  communication: number;  // 0-20
  alignment: number;      // 0-15
  reciprocity: number;    // 0-15
}

export interface ValueExchange {
  timeInvested: number; // minutes
  resourcesSpent: number; // BWP
  valueReceived: 'Low' | 'Medium' | 'High' | 'Strategic';
  notes: string;
}

export interface RelationshipEntry {
  contactId: string;
  trustMatrix: TrustMatrix;
  temperature: number; // 0-100
  mood: 'Positive' | 'Neutral' | 'Negative' | 'Tense' | 'Relaxed';
  weather: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Clear';
  valueExchange: ValueExchange;
  conflictLogged: boolean;
  strategicNotes: string;
}

export interface Contact {
  id: string;
  fullName: string;
  title: string; 
  position: string;
  company: string;
  industry: IndustrySector;
  tier: NetworkTier;
  estimatedNetWorth: number; 
  wealthConfidence: number; 
  primaryIncomeSource: string;
  lastTrustScore: number;
  interactionCount: number;
  lastInteractionDate?: string;
  tags: string[];
  notes: string;
}

export interface NetworkEntry {
  newContacts: Contact[];
  reconnections: number;
  introductionsGiven: number;
  introductionsReceived: number;
  notes?: string;
}

export interface FinanceEntry {
  revenue: number;
  operatingExpenses: number;
  mrr: number; // Monthly Recurring Revenue
  churn: number;
  taxReserve: number;
  cashPosition: number;
  notes?: string;
}

export interface ProductivityEntry {
  focusHours: number;
  deepWorkHours: number;
  tasksCompleted: number;
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10
  majorAccomplishments: string[];
  notes?: string;
}

export interface GymEntry {
  type: string;
  sets: number;
  reps: number;
  weight: number;
  completed: boolean;
  notes: string;
}

export interface DailyData {
  sales?: SalesEntry;
  network?: NetworkEntry;
  relationships?: RelationshipEntry[];
  finance?: FinanceEntry;
  productivity?: ProductivityEntry;
  gym?: GymEntry;
  notes?: string;
  categories: Category[];
  overallScore?: number;
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface UserState {
  entries: Record<string, DailyData>;
  contacts: Contact[]; 
  consent: boolean;
  theme: 'light' | 'dark';
  plan: 'free' | 'premium';
  isLoggedIn: boolean;
  profile?: UserProfile;
}
