import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileCheck2, X } from "lucide-react";
import type { FileRef } from "@/lib/orders";

export function FileUpload({
  label,
  accept = "image/*,application/pdf",
  value,
  onChange,
  required,
}: {
  label: string;
  accept?: string;
  value: FileRef | null;
  onChange: (f: FileRef | null) => void;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (file: File) => {
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10 MB)");
      return;
    }
    let dataUrl: string | null = null;
    if (file.type.startsWith("image/") && file.size < 1024 * 1024) {
      dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });
    }
    onChange({
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl,
      uploadedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="rounded-xl border border-dashed border-input bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">
            {label} {required && <span className="text-destructive">*</span>}
          </div>
          {!value && <div className="text-xs text-muted-foreground">JPG, PNG, or PDF · max 10 MB</div>}
        </div>
        {!value ? (
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>
            <Upload className="mr-1 h-4 w-4" /> Upload
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X className="mr-1 h-4 w-4" /> Remove
          </Button>
        )}
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handle(f);
            e.target.value = "";
          }}
        />
      </div>
      {value && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-background p-2">
          {value.dataUrl ? (
            <img src={value.dataUrl} alt={value.name} className="h-12 w-16 rounded object-cover" />
          ) : (
            <div className="flex h-12 w-16 items-center justify-center rounded bg-muted">
              <FileCheck2 className="h-5 w-5 text-success" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{value.name}</div>
            <div className="text-xs text-muted-foreground">
              {(value.size / 1024).toFixed(0)} KB · uploaded {new Date(value.uploadedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
      {error && <div className="mt-2 text-xs text-destructive">{error}</div>}
    </div>
  );
}
