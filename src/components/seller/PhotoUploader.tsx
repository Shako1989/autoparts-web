import { useState, type ChangeEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

import {
  uploadFileToPresignedUrl,
  useConfirmPhoto,
  usePresignPhoto,
  useRemovePhoto,
  type ListingPhoto,
} from '@/api/listings';

interface Props {
  listingId: string;
  photos: ListingPhoto[];
}

export function PhotoUploader({ listingId, photos }: Props): ReactElement {
  const { t } = useTranslation();
  const presign = usePresignPhoto(listingId);
  const confirm = useConfirmPhoto(listingId);
  const remove = useRemovePhoto(listingId);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      let nextPosition = photos.length;
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw new Error(`Unsupported type: ${file.type}`);
        }
        const presigned = await presign.mutateAsync(file.type);
        await uploadFileToPresignedUrl(presigned.uploadUrl, file);
        await confirm.mutateAsync({ s3Key: presigned.s3Key, position: nextPosition });
        nextPosition += 1;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative h-24 w-24">
            <img src={p.url} alt="" className="h-full w-full rounded object-cover" />
            <button
              type="button"
              onClick={() => remove.mutate(p.id)}
              className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow ring-1 ring-slate-200 hover:bg-slate-100"
              aria-label={t('actions.remove') ?? 'Remove'}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-500 hover:border-slate-400">
          {uploading ? t('catalog.loading') : t('listing.addPhoto')}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFiles}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
