import { useState, useRef, useCallback, type DragEvent } from "react";

interface Props {
  onProcess: (base64: string, mimeType: string) => void;
  isProcessing: boolean;
}

export default function BillUpload({ onProcess, isProcessing }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<{ base64: string; mimeType: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      fileRef.current = { base64, mimeType: file.type };
    };
    reader.readAsDataURL(file);
  }, []);

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleProcess() {
    if (!fileRef.current) return;
    onProcess(fileRef.current.base64, fileRef.current.mimeType);
  }

  function handleReset() {
    setPreview(null);
    fileRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
            dragOver
              ? "border-teal-400 bg-teal-50 dark:border-teal-500 dark:bg-teal-900/20"
              : "border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-600 dark:hover:bg-teal-900/10"
          }`}
        >
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
            dragOver
              ? "bg-teal-100 scale-110 dark:bg-teal-800/40"
              : "bg-gray-100 group-hover:bg-teal-100 group-hover:scale-105 dark:bg-slate-700 dark:group-hover:bg-teal-800/40"
          }`}>
            <svg className={`h-8 w-8 transition-colors ${dragOver ? "text-teal-600 dark:text-teal-400" : "text-gray-400 group-hover:text-teal-500 dark:text-slate-500 dark:group-hover:text-teal-400"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              <span className="font-semibold text-teal-600 dark:text-teal-400">Kattints ide</span> vagy húzd ide a számlát
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">JPG, PNG vagy WEBP</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <img
              src={preview}
              alt="Számla előnézet"
              className="mx-auto max-h-80 object-contain p-3"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={isProcessing}
              className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-500 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Másik kép
            </button>
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="flex-1 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-500/20 transition hover:shadow-lg hover:brightness-105 disabled:opacity-60"
            >
              {isProcessing ? (
                <span className="inline-flex items-center gap-2">
                  <div className="relative h-4 w-4">
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white" />
                  </div>
                  Feldolgozás...
                </span>
              ) : (
                "Számla feldolgozása"
              )}
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
