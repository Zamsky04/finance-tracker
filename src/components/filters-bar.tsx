'use client';

import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';

import { DatePickerField } from './date-picker-field';
import { DateRangePicker } from './date-range-picker';

export type FilterMode = 'day' | 'week' | 'month' | 'year' | 'custom';

export type ReportFilters = {
  mode: FilterMode;
  baseDate?: string;
  from?: string;
  to?: string;
  month?: string;
  year?: string;
};

type Props = {
  onApply?: (filters: ReportFilters) => void;
};

function today() {
  return new Date();
}

function toYmd(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function currentYear() {
  return String(new Date().getFullYear());
}

function currentMonth() {
  return format(new Date(), 'MM');
}

const monthOptions = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export function FiltersBar({ onApply }: Props) {
  const [mode, setMode] = useState<FilterMode>('day');
  const [baseDate, setBaseDate] = useState<Date | undefined>(today());
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: today(),
    to: today(),
  });
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(now - i));
  }, []);

  const weekPreview =
    mode === 'week' && baseDate
      ? `${toYmd(baseDate)} s/d ${toYmd(addDays(baseDate, 6))}`
      : null;

  const handleApply = () => {
    if (mode === 'day') {
      onApply?.({
        mode,
        baseDate: baseDate ? toYmd(baseDate) : undefined,
      });
      return;
    }

    if (mode === 'week') {
      onApply?.({
        mode,
        baseDate: baseDate ? toYmd(baseDate) : undefined,
      });
      return;
    }

    if (mode === 'month') {
      onApply?.({
        mode,
        month,
        year,
      });
      return;
    }

    if (mode === 'year') {
      onApply?.({
        mode,
        year,
      });
      return;
    }

    onApply?.({
      mode: 'custom',
      from: customRange?.from ? toYmd(customRange.from) : undefined,
      to: customRange?.to ? toYmd(customRange.to) : undefined,
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Filter Periode</h3>
        <p className="text-sm text-slate-500">
          Pilih tampilan harian, mingguan, bulanan, tahunan, atau custom range
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto]">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as FilterMode)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-black outline-none focus:border-blue-500"
          >
            <option value="day">Per Hari</option>
            <option value="week">Per Minggu</option>
            <option value="month">Per Bulan</option>
            <option value="year">Per Tahun</option>
            <option value="custom">Custom</option>
          </select>

          <div className="min-w-0">
            {mode === 'day' && (
              <DatePickerField
                value={baseDate}
                onChange={setBaseDate}
                placeholder="Pilih tanggal"
              />
            )}

            {mode === 'week' && (
              <div className="space-y-2">
                <DatePickerField
                  value={baseDate}
                  onChange={setBaseDate}
                  placeholder="Pilih tanggal awal minggu"
                />
                {weekPreview && (
                  <p className="text-xs text-slate-500">
                    Periode 7 hari otomatis: {weekPreview}
                  </p>
                )}
              </div>
            )}

            {mode === 'month' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-black outline-none focus:border-blue-500"
                >
                  {monthOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-black outline-none focus:border-blue-500"
                >
                  {yearOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'year' && (
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-black outline-none focus:border-blue-500"
              >
                {yearOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}

            {mode === 'custom' && (
              <DateRangePicker
                from={customRange?.from}
                to={customRange?.to}
                onChange={setCustomRange}
              />
            )}
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="h-12 rounded-2xl bg-slate-900 px-5 text-white transition hover:opacity-95"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}