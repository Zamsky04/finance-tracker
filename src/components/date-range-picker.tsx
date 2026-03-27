'use client';

type Props = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500"
      />
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500"
      />
    </div>
  );
}