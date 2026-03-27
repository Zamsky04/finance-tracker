import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import type { FilterMode } from '@/components/filters-bar';

export function resolveDateRange(params: {
  mode: FilterMode;
  baseDate: string;
  from?: string;
  to?: string;
}) {
  if (params.mode === 'custom') {
    return {
      from: params.from
        ? startOfDay(new Date(params.from)).toISOString()
        : undefined,
      to: params.to
        ? endOfDay(new Date(params.to)).toISOString()
        : undefined,
      label:
        params.from && params.to
          ? `${params.from} s/d ${params.to}`
          : 'Custom',
    };
  }

  const base = params.baseDate ? new Date(params.baseDate) : new Date();

  switch (params.mode) {
    case 'day':
      return {
        from: startOfDay(base).toISOString(),
        to: endOfDay(base).toISOString(),
        label: format(base, 'yyyy-MM-dd'),
      };
    case 'week':
      return {
        from: startOfWeek(base, { weekStartsOn: 1 }).toISOString(),
        to: endOfWeek(base, { weekStartsOn: 1 }).toISOString(),
        label: 'Minggu ini',
      };
    case 'month':
      return {
        from: startOfMonth(base).toISOString(),
        to: endOfMonth(base).toISOString(),
        label: 'Bulan ini',
      };
    case 'year':
      return {
        from: startOfYear(base).toISOString(),
        to: endOfYear(base).toISOString(),
        label: 'Tahun ini',
      };
    default:
      return {
        from: startOfDay(base).toISOString(),
        to: endOfDay(base).toISOString(),
        label: format(base, 'yyyy-MM-dd'),
      };
  }
}