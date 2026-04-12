interface Props {
  value: number;
  onChange: (count: number) => void;
}

export default function PeopleCount({ value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
      <span className="text-sm font-semibold text-white/70">Hány fő?</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-medium text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="w-7 text-center text-lg font-bold tabular-nums text-white">
          {value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          +
        </button>
      </div>
    </div>
  );
}
