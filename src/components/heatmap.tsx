'use client';

import { getLocalDateString } from '@/lib/utils';

interface HeatmapProps {
  data: Record<string, number>; // dateStr (YYYY-MM-DD) -> activity count
}

export default function Heatmap({ data = {} }: HeatmapProps) {
  // Generate date grid for the past 24 weeks (approx 168 days) plus remaining days to align with Sunday
  const cells: { dateStr: string; count: number; dayOfWeek: number; monthLabel: string | null }[] = [];
  
  const today = new Date();
  const startDay = new Date();
  // Go back 24 weeks
  startDay.setDate(today.getDate() - 24 * 7);
  
  // Align startDay to the previous Sunday
  const startDayOfWeek = startDay.getDay();
  startDay.setDate(startDay.getDate() - startDayOfWeek);

  const totalDays = 25 * 7; // 25 weeks of cells
  let currentMonth = -1;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDay.getTime());
    d.setDate(d.getDate() + i);
    const dateStr = getLocalDateString(d);
    const count = data[dateStr] || 0;
    
    // Determine if we should show a month label (only on the first Sunday of a month)
    let monthLabel = null;
    if (d.getDay() === 0) {
      const month = d.getMonth();
      if (month !== currentMonth) {
        currentMonth = month;
        monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
      }
    }

    cells.push({
      dateStr,
      count,
      dayOfWeek: d.getDay(),
      monthLabel,
    });
  }

  // Group cells into columns (weeks)
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Get fill color based on contribution intensity
  const getCellColor = (count: number) => {
    if (count === 0) return 'fill-slate-100 dark:fill-slate-800';
    if (count === 1) return 'fill-blue-100 text-blue-100'; // light primary container
    if (count === 2) return 'fill-blue-300 text-blue-300';
    if (count === 3) return 'fill-primary/60 text-primary-light';
    return 'fill-primary text-white'; // deep primary
  };

  return (
    <div className="w-full overflow-x-auto pb-2 select-none">
      <div className="min-w-[620px] flex flex-col">
        {/* Month Labels */}
        <div className="flex h-5 ml-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono select-none">
          {weeks.map((week, weekIdx) => {
            const sundayCell = week[0];
            if (sundayCell.monthLabel) {
              return (
                <div
                  key={weekIdx}
                  style={{ width: '22px' }}
                  className="flex-shrink-0"
                >
                  {sundayCell.monthLabel}
                </div>
              );
            }
            return <div key={weekIdx} style={{ width: '22px' }} className="flex-shrink-0" />;
          })}
        </div>

        {/* Heatmap Grid */}
        <div className="flex">
          {/* Day Labels */}
          <div className="flex flex-col justify-between h-[91px] pr-2 text-[9px] font-bold text-slate-400 font-mono mt-1 w-6 select-none uppercase">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Grid SVG */}
          <svg width={weeks.length * 15} height={105} className="flex-1">
            <g>
              {weeks.map((week, weekIdx) => (
                <g key={weekIdx} transform={`translate(${weekIdx * 15}, 0)`}>
                  {week.map((cell, cellIdx) => {
                    const colorClass = getCellColor(cell.count);
                    return (
                      <rect
                        key={cell.dateStr}
                        y={cellIdx * 15}
                        width={11}
                        height={11}
                        rx={2.5}
                        className={`smooth-hover transition-colors duration-150 ${colorClass}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <title>{`${cell.dateStr}: ${cell.count} study logs`}</title>
                      </rect>
                    );
                  })}
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end space-x-1.5 text-[10px] font-bold text-slate-400 font-mono mt-4 mr-2 select-none uppercase tracking-wider">
          <span>Less</span>
          <div className="w-3 h-3 rounded-[2.5px] bg-slate-100 border border-slate-200"></div>
          <div className="w-3 h-3 rounded-[2.5px] bg-blue-100"></div>
          <div className="w-3 h-3 rounded-[2.5px] bg-blue-300"></div>
          <div className="w-3 h-3 rounded-[2.5px] bg-primary/60"></div>
          <div className="w-3 h-3 rounded-[2.5px] bg-primary"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
