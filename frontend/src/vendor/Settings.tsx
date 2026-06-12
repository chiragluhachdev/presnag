import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Vendor } from "@/lib/types";
import { Card, Button, Input, Label, Textarea, Select, Spinner } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { VendorHeader } from "./Dashboard";

const CATEGORIES = ["Tea Stall", "Café", "Bakery", "Juice Corner", "Fast Food", "Food Court", "North Indian", "Multi-Cuisine", "Healthy Food"];

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
          ownerName: form.ownerName,
          description: form.description,
          address: form.address,
          category: form.category,
          fssaiLicense: form.fssaiLicense,
          openTime: form.openTime,
          closeTime: form.closeTime,
          openingHours: `${form.openTime || "09:00"} - ${form.closeTime || "21:00"}`,
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
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Shop Name</Label><Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} /></div>
            <div><Label>Owner Name</Label><Input value={form.ownerName || ""} onChange={(e) => set("ownerName", e.target.value)} /></div>
          </div>
          <div><Label>Description</Label><Textarea rows={2} value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category || ""} onChange={(e) => set("category", e.target.value as any)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div><Label>Prep Time (min)</Label><Input type="number" value={form.prepTime ?? ""} onChange={(e) => set("prepTime", Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Mobile (login)</Label><Input value={form.phone || ""} disabled className="bg-slate-50 text-slate-400" /></div>
            <div><Label>FSSAI License</Label><Input value={form.fssaiLicense || ""} onChange={(e) => set("fssaiLicense", e.target.value)} /></div>
          </div>
          <div><Label>Address</Label><Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Opening Time</Label><Input type="time" value={form.openTime || "09:00"} onChange={(e) => set("openTime", e.target.value)} /></div>
            <div><Label>Closing Time</Label><Input type="time" value={form.closeTime || "21:00"} onChange={(e) => set("closeTime", e.target.value)} /></div>
          </div>

          {/* Open / Close shop toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
            <div>
              <div className="text-sm font-semibold text-slate-800">Shop is {form.isOpen ? "Open" : "Closed"}</div>
              <div className="text-[11px] text-slate-500">{form.isOpen ? "Accepting orders now" : "Customers can't order while closed"}</div>
            </div>
            <button
              type="button"
              onClick={() => set("isOpen", !form.isOpen)}
              className={cn("relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition", form.isOpen ? "bg-emerald-500" : "bg-slate-300")}
            >
              <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition", form.isOpen ? "translate-x-6" : "translate-x-1")} />
            </button>
          </div>
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

          <ChangePasswordCard />
        </div>
      </div>

      <Button size="lg" onClick={save} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
      </Button>
    </div>
  );
}

function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  async function change() {
    if (!current || !next) return toast.error("Enter current and new password");
    if (next.length < 6) return toast.error("New password must be at least 6 characters");
    setSaving(true);
    try {
      await api("/api/vendor/change-password", { method: "POST", auth: true, body: { currentPassword: current, newPassword: next } });
      toast.success("Password changed");
      setCurrent(""); setNext("");
    } catch (e: any) {
      toast.error(e.message || "Could not change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <h3 className="font-semibold">Change Password</h3>
      <div><Label>Current Password</Label><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
      <div><Label>New Password</Label><Input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Min 6 characters" /></div>
      <Button variant="outline" onClick={change} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Update Password
      </Button>
    </Card>
  );
}
