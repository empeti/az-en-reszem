interface Props {
  bankName: string;
  bankAccount: string;
  onBankNameChange: (value: string) => void;
  onBankAccountChange: (value: string) => void;
}

export default function BankInfo({
  bankName,
  bankAccount,
  onBankNameChange,
  onBankAccountChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 space-y-3 shadow-sm">
      <p className="text-sm font-semibold text-gray-700">Utalási adatok</p>
      <div className="space-y-2">
        <input
          type="text"
          value={bankName}
          onChange={(e) => onBankNameChange(e.target.value)}
          placeholder="Kedvezményezett neve"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
        />
        <input
          type="text"
          value={bankAccount}
          onChange={(e) => onBankAccountChange(e.target.value)}
          placeholder="Bankszámlaszám (pl. 12345678-12345678-12345678)"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none tabular-nums"
        />
      </div>
      <p className="text-xs text-gray-400">
        Ezek az adatok megjelennek a megosztott linken a fizetéshez.
      </p>
    </div>
  );
}
