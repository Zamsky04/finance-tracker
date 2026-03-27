'use client';

import { useState } from 'react';
import { DateRangePicker } from './date-range-picker';

export type FilterMode = 'day' | 'week' | 'month' | 'year' | 'custom';

type Props = {
  onApply?: (filters: {
    mode: FilterMode;
    baseDate: string;
    from?: string;
    to?: string;
  }) => void;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function FiltersBar({ onApply }: Props) {
  const [mode, setMode] = useState<FilterMode>('day');
  const [baseDate, setBaseDate] = useState(getToday());
  const [from, setFrom] = useState(getToday());
  const [to, setTo] = useState(getToday());

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Filter Periode</h3>
        <p className="text-sm text-slate-500">
          Lihat data per hari, minggu, bulan, tahun, atau custom range
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as FilterMode)}
            className="h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500 text-black"
          >
            <option value="day">Per Hari</option>
            <option value="week">Per Minggu</option>
            <option value="month">Per Bulan</option>
            <option value="year">Per Tahun</option>
            <option value="custom">Custom</option>
          </select>

          {mode !== 'custom' ? (
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500 text-black"
            />
          ) : (
            <DateRangePicker
              from={from}
              to={to}
              onFromChange={setFrom}
              onToChange={setTo}
            />
          )}

          <button
            type="button"
            onClick={() =>
              onApply?.({
                mode,
                baseDate,
                from,
                to,
              })
            }
            className="h-12 rounded-2xl bg-slate-900 px-5 text-white transition hover:opacity-95"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}