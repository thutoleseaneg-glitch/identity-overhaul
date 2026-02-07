
import { Category } from './types';

export const CATEGORIES: { id: Category; label: string; icon: string; color: string; accent: string }[] = [
  { id: 'sales', label: 'SALES & LEADS', icon: 'fa-bullhorn', color: 'bg-emerald-500', accent: '#10B981' },
  { id: 'network', label: 'PEOPLE NETWORK', icon: 'fa-users', color: 'bg-blue-500', accent: '#3B82F6' },
  { id: 'relationships', label: 'RELATIONSHIPS', icon: 'fa-handshake', color: 'bg-purple-500', accent: '#8B5CF6' },
  { id: 'finance', label: 'FINANCE', icon: 'fa-money-bill-wave', color: 'bg-amber-500', accent: '#F59E0B' },
  { id: 'productivity', label: 'PRODUCTIVITY', icon: 'fa-tasks', color: 'bg-cyan-500', accent: '#06B6D4' },
  { id: 'gym', label: 'GYM & FITNESS', icon: 'fa-dumbbell', color: 'bg-zinc-100', accent: '#FFFFFF' },
  { id: 'notes', label: 'NOTEPAD', icon: 'fa-sticky-note', color: 'bg-zinc-500', accent: '#71717a' },
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
