interface Props {
  value: number;
  onChange: (count: number) => void;
}

export default function PeopleCount({ value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3">
      <span className="text-sm font-medium text-gray-700">Hány fő?</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-lg font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="w-6 text-center text-lg font-semibold tabular-nums text-gray-900">
          {value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-lg font-medium text-gray-600 transition hover:bg-gray-50"
        >
          +
        </button>
      </div>
    </div>
  );
}
