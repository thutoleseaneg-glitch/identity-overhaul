
import React from 'react';
import { MONTHS, DAYS, CATEGORIES } from '../constants';
import { DailyData } from '../types';

interface Props {
  viewDate: Date;
  setViewDate: (d: Date) => void;
  entries: Record<string, DailyData>;
  onDayClick: (d: Date) => void;
}

export const Calendar: React.FC<Props> = ({ viewDate, setViewDate, entries, onDayClick }) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => setViewDate(new Date());

  const formatDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  return (
    <div className="bg-black p-4 sm:p-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 border-b border-white pb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-syne font-black uppercase tracking-tighter text-white">
            {MONTHS[month]} <span className="text-zinc-600">{year}</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1 italic">PROTOCOL PERFORMANCE CALENDAR</p>
        </div>
        <div className="flex gap-0 w-full sm:w-auto border border-white">
          <button onClick={prevMonth} className="flex-1 sm:w-12 h-12 hover:bg-white hover:text-black transition-colors flex items-center justify-center border-r border-white">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <button onClick={goToToday} className="flex-[2] sm:px-6 h-12 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-colors border-r border-white">
            TODAY
          </button>
          <button onClick={nextMonth} className="flex-1 sm:w-12 h-12 hover:bg-white hover:text-black transition-colors flex items-center justify-center">
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 flex-1 border-l border-t border-white">
        {DAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest py-3 border-r border-b border-white bg-black">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square border-r border-b border-white bg-zinc-950/50"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateKey = formatDateKey(day);
          const entry = entries[dateKey];
          const isToday = today.getTime() === new Date(year, month, day).getTime();

          return (
            <button
              key={day}
              onClick={() => onDayClick(new Date(year, month, day))}
              className={`group relative aspect-square flex flex-col p-2 sm:p-4 transition-all border-r border-b border-white ${
                isToday 
                ? 'bg-white text-black' 
                : 'bg-black hover:bg-zinc-900 text-white'
              }`}
            >
              <span className={`text-sm sm:text-xl font-black font-syne ${isToday ? 'text-black' : 'text-zinc-300'}`}>
                {day}
              </span>
              
              <div className="flex flex-wrap gap-1 mt-auto">
                {CATEGORIES.map(cat => {
                    const hasEntry = entry && entry.categories?.includes(cat.id);
                    if (!hasEntry) return null;
                    return (
                        <div 
                            key={cat.id} 
                            className={`w-1.5 h-1.5 rounded-full ${cat.color} opacity-80`}
                            title={cat.label}
                        />
                    );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
