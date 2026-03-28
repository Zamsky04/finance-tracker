import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  addDays,
  endOfMonth,
  endOfYear,
  format,
  parseISO,
  startOfYear,
} from 'date-fns';
import type { ReportFilters } from '@/components/filters-bar';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toYmd(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function resolveDateRange(filters: ReportFilters) {
  if (filters.mode === 'day') {
    const date = filters.baseDate ? parseISO(filters.baseDate) : new Date();
    const ymd = toYmd(date);

    return {
      from: ymd,
      to: ymd,
      label: format(date, 'dd MMM yyyy'),
    };
  }

  if (filters.mode === 'week') {
    const start = filters.baseDate ? parseISO(filters.baseDate) : new Date();
    const end = addDays(start, 6);

    return {
      from: toYmd(start),
      to: toYmd(end),
      label: `${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`,
    };
  }

  if (filters.mode === 'month') {
    const year = Number(filters.year ?? new Date().getFullYear());
    const month = Number(filters.month ?? new Date().getMonth() + 1);

    const start = new Date(year, month - 1, 1);
    const end = endOfMonth(start);

    return {
      from: toYmd(start),
      to: toYmd(end),
      label: `${monthNames[month - 1]} ${year}`,
    };
  }

  if (filters.mode === 'year') {
    const year = Number(filters.year ?? new Date().getFullYear());
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(start);

    return {
      from: toYmd(start),
      to: toYmd(end),
      label: `Tahun ${year}`,
    };
  }

  return {
    from: filters.from,
    to: filters.to,
    label:
      filters.from && filters.to
        ? `${filters.from} - ${filters.to}`
        : 'Custom range',
  };
}