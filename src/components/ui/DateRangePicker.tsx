import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

export type { DateRange };

type DateRangePickerProps = {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
  disableFuture?: boolean;
};

function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmt(date: Date, showYear = true): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(showYear ? { year: 'numeric' } : {}),
  });
}

function formatRange(range: DateRange | undefined, placeholder: string): string {
  if (!range?.from) return placeholder;
  if (!range.to) return fmt(range.from);
  if (range.from.getFullYear() === range.to.getFullYear()) {
    return `${fmt(range.from, false)} – ${fmt(range.to)}`;
  }
  return `${fmt(range.from)} – ${fmt(range.to)}`;
}

function isRangeEqual(a: DateRange | undefined, b: DateRange): boolean {
  return (
    a?.from?.toDateString() === b.from?.toDateString() &&
    a?.to?.toDateString() === b.to?.toDateString()
  );
}

const PRESETS: { label: string; getRange: () => DateRange }[] = [
  {
    label: 'Today',
    getRange: () => { const d = getToday(); return { from: d, to: d }; },
  },
  {
    label: 'Last 7 days',
    getRange: () => {
      const to = getToday();
      const from = new Date(to);
      from.setDate(from.getDate() - 6);
      return { from, to };
    },
  },
  {
    label: 'Last 30 days',
    getRange: () => {
      const to = getToday();
      const from = new Date(to);
      from.setDate(from.getDate() - 29);
      return { from, to };
    },
  },
  {
    label: 'This month',
    getRange: () => {
      const to = getToday();
      const from = new Date(to.getFullYear(), to.getMonth(), 1);
      return { from, to };
    },
  },
  {
    label: 'Last month',
    getRange: () => {
      const today = getToday();
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const to = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from, to };
    },
  },
];

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Select range',
  disableFuture = true,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<DateRange | undefined>(undefined);

  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  function handleSelect(range: DateRange | undefined) {
    if (!controlled) setInternal(range);
    onChange?.(range);
    if (range?.from && range?.to) setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 h-9 px-3.5 rounded-xl border border-border bg-card',
            'text-[13px] font-medium tracking-[-0.006em] text-foreground',
            'hover:bg-muted/50 transition-colors shrink-0 shadow-sm',
            className,
          )}
        >
          <CalendarIcon size={14} className="text-muted-foreground" />
          <span className="hidden sm:inline">{formatRange(current, placeholder)}</span>
          <ChevronDown size={13} className="text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-auto p-0 flex overflow-hidden"
      >
        {/* Preset shortcuts */}
        <div className="flex flex-col border-r border-border/50 p-2 gap-0.5 min-w-[128px]">
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Quick select
          </p>
          {PRESETS.map((preset) => {
            const r = preset.getRange();
            const isActive = isRangeEqual(current, r);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelect(r)}
                className={cn(
                  'text-left px-3 py-1.5 rounded-lg text-[13px] font-medium tracking-[-0.006em] transition-colors',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-foreground hover:bg-muted/60',
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Calendar */}
        <Calendar
          mode="range"
          selected={current}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={disableFuture ? { after: new Date() } : undefined}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
