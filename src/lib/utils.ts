// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  parseISO,
  startOfDay,
  startOfYear,
} from 'date-fns';
import { id } from 'date-fns/locale';
import type { ReportFilters } from '@/components/filters-bar';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toIsoStartOfDay(date: Date) {
  return startOfDay(date).toISOString();
}

function toIsoEndOfDay(date: Date) {
  return endOfDay(date).toISOString();
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

    return {
      from: toIsoStartOfDay(date),
      to: toIsoEndOfDay(date),
      label: format(date, 'dd MMM yyyy', { locale: id }),
    };
  }

  if (filters.mode === 'week') {
    const start = filters.baseDate ? parseISO(filters.baseDate) : new Date();
    const end = addDays(start, 6);

    return {
      from: toIsoStartOfDay(start),
      to: toIsoEndOfDay(end),
      label: `${format(start, 'dd MMM yyyy', { locale: id })} - ${format(end, 'dd MMM yyyy', { locale: id })}`,
    };
  }

  if (filters.mode === 'month') {
    const year = Number(filters.year ?? new Date().getFullYear());
    const month = Number(filters.month ?? new Date().getMonth() + 1);

    const start = new Date(year, month - 1, 1);
    const end = endOfMonth(start);

    return {
      from: toIsoStartOfDay(start),
      to: toIsoEndOfDay(end),
      label: `${monthNames[month - 1]} ${year}`,
    };
  }

  if (filters.mode === 'year') {
    const year = Number(filters.year ?? new Date().getFullYear());
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(start);

    return {
      from: toIsoStartOfDay(start),
      to: toIsoEndOfDay(end),
      label: `Tahun ${year}`,
    };
  }

  const customFrom = filters.from ? parseISO(filters.from) : undefined;
  const customTo = filters.to ? parseISO(filters.to) : undefined;

  return {
    from: customFrom ? toIsoStartOfDay(customFrom) : undefined,
    to: customTo ? toIsoEndOfDay(customTo) : undefined,
    label:
      filters.from && filters.to
        ? `${format(customFrom!, 'dd MMM yyyy', { locale: id })} - ${format(customTo!, 'dd MMM yyyy', { locale: id })}`
        : 'Custom range',
  };
}