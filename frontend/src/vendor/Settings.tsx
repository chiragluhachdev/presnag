import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Vendor } from "@/lib/types";
import { Card, Button, Input, Label, Textarea, Select, Spinner } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "@/components/ui/toast";
import { VendorHeader } from "./Dashboard";

const CATEGORIES = ["Tea Stall", "Café", "Bakery", "Juice Corner", "Fast Food", "Food Court"];

export default function Stall() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-me"],
    queryFn: () => api<Vendor>("/api/vendor/me", { auth: true }),
  });

  const [form, setForm] = useState<Partial<Vendor>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function set<K extends keyof Vendor>(key: K, value: Vendor[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await api("/api/vendor/me", {
        method: "PUT",
        auth: true,
        body: {
          name: form.name,
          phone: form.phone,
          description: form.description,
          address: form.address,
          category: form.category,
          openingHours: form.openingHours,
          isOpen: form.isOpen,
          prepTime: form.prepTime,
          logo: form.logo,
          banner: form.banner,
          socialLinks: form.socialLinks,
        },
      });
      toast.success("Stall details saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-5">
      <VendorHeader title="Stall Settings" subtitle="Update your stall details, branding and opening hours." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <h3 className="font-semibold">Basic Info</h3>
          <div><Label>Stall Name</Label><Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} /></div>
          <div><Label>Description</Label><Textarea rows={3} value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></div>
          <div>
            <Label>Category</Label>
            <Select value={form.category || ""} onChange={(e) => set("category", e.target.value as any)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Contact Number</Label><Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><Label>Prep Time (min)</Label><Input type="number" value={form.prepTime ?? ""} onChange={(e) => set("prepTime", Number(e.target.value))} /></div>
          </div>
          <div><Label>Address</Label><Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} /></div>
          <div><Label>Opening Hours</Label><Input value={form.openingHours || ""} onChange={(e) => set("openingHours", e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.isOpen} onChange={(e) => set("isOpen", e.target.checked)} />
            Stall is currently open
          </label>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <h3 className="font-semibold">Branding</h3>
            <div><Label>Logo</Label><ImageUpload value={form.logo} onChange={(url) => set("logo", url)} folder="logos" /></div>
            <div><Label>Banner</Label><ImageUpload value={form.banner} onChange={(url) => set("banner", url)} folder="banners" /></div>
          </Card>

          <Card className="space-y-4 p-5">
            <h3 className="font-semibold">Social Links</h3>
            <div><Label>Instagram</Label><Input value={form.socialLinks?.instagram || ""} onChange={(e) => set("socialLinks", { ...form.socialLinks, instagram: e.target.value })} /></div>
            <div><Label>Facebook</Label><Input value={form.socialLinks?.facebook || ""} onChange={(e) => set("socialLinks", { ...form.socialLinks, facebook: e.target.value })} /></div>
            <div><Label>Website</Label><Input value={form.socialLinks?.website || ""} onChange={(e) => set("socialLinks", { ...form.socialLinks, website: e.target.value })} /></div>
          </Card>
        </div>
      </div>

      <Button size="lg" onClick={save} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
      </Button>
    </div>
  );
}
