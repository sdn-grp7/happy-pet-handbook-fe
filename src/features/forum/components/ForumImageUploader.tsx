import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadCareImage } from "@/features/pets/api/uploadCareImage";
import { cn } from "@/lib/utils";

type ForumImageUploaderProps = {
  token: string | null;
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  max?: number;
  labels: {
    add: string;
    uploading: string;
    hint: string;
    remove: string;
  };
};

export function ForumImageUploader({
  token,
  value,
  onChange,
  disabled,
  max = 4,
  labels,
}: ForumImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAdd = value.length < max && Boolean(token) && !disabled && !uploading;

  const pickFiles = async (files: FileList | null) => {
    if (!files?.length || !token || !canAdd) return;
    setError(null);
    setUploading(true);
    try {
      const remaining = max - value.length;
      const selected = Array.from(files).slice(0, remaining);
      const urls: string[] = [];
      for (const file of selected) {
        if (!file.type.startsWith("image/")) continue;
        urls.push(await uploadCareImage(token, file, "pawpath/forum"));
      }
      if (urls.length > 0) onChange([...value, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {value.map((src) => (
            <div key={src} className="group relative overflow-hidden rounded-lg bg-muted">
              <img src={src} alt="" className="aspect-square w-full object-cover" />
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => onChange(value.filter((item) => item !== src))}
                className="absolute right-1.5 top-1.5 rounded-full bg-background/90 p-1 text-foreground shadow opacity-0 transition group-hover:opacity-100 disabled:opacity-40"
                aria-label={labels.remove}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {value.length < max ? (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={!canAdd}
            onChange={(e) => void pickFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={!canAdd}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground",
              !canAdd && "cursor-not-allowed opacity-60",
            )}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            {uploading ? labels.uploading : labels.add}
          </button>
          <p className="mt-1 text-[11px] text-muted-foreground">{labels.hint}</p>
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
