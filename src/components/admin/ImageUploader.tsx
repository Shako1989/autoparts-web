import { useRef, useState, type ChangeEvent, type ReactElement } from 'react';
import axios from 'axios';
import { Upload, X } from 'lucide-react';

import { usePresignCatalogImage } from '@/api/admin';

interface Props {
  value: string;
  onChange: (publicUrl: string) => void;
  label?: string;
  hint?: string;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export function ImageUploader({ value, onChange, label, hint }: Props): ReactElement {
  const presign = usePresignCatalogImage();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError(`Unsupported type: ${file.type}`);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const presigned = await presign.mutateAsync(file.type);
      await axios.put(presigned.uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        transformRequest: [(d) => d],
      });
      onChange(presigned.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="mt-1 flex items-start gap-3">
        <div className="flex h-20 w-20 flex-none items-center justify-center rounded border border-slate-200 bg-slate-50 overflow-hidden">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-slate-400">no image</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" aria-hidden />
              {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-400"
              >
                <X className="h-4 w-4" aria-hidden /> Remove
              </button>
            )}
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="or paste an image URL"
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-slate-500 focus:outline-none"
          />
          {hint && <p className="text-xs text-slate-500">{hint}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
