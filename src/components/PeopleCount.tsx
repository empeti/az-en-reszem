interface Props {
  value: number;
  onChange: (count: number) => void;
}

export default function PeopleCount({ value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <span className="text-sm font-semibold text-gray-700">Hány fő?</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-lg font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-25 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="w-7 text-center text-lg font-bold tabular-nums text-gray-900">
          {value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-lg font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
        >
          +
        </button>
      </div>
    </div>
  );
}
