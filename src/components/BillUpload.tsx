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
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition ${
            dragOver
              ? "border-indigo-400 bg-indigo-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }`}
        >
          <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-indigo-600">Kattints ide</span> vagy húzd ide a számla fotóját
          </p>
          <p className="text-xs text-gray-400">JPG, PNG vagy WEBP</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            <img
              src={preview}
              alt="Számla előnézet"
              className="mx-auto max-h-80 object-contain p-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={isProcessing}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
            >
              Másik kép
            </button>
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {isProcessing ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
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
