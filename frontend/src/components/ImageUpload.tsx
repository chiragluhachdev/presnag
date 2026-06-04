import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui";

// Uploads to Cloudinary; falls back to letting the user paste a URL.
export function ImageUpload({
  value,
  onChange,
  folder = "presnag",
  label = "Image",
}: {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed — paste a URL instead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt={label} className="h-16 w-16 rounded-lg border object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {loading ? "Uploading..." : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={loading} />
        </label>
      </div>
      <Input
        placeholder="…or paste an image URL"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
