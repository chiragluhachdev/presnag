import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Ticket } from "lucide-react";
import { api } from "@/lib/api";
import { Coupon } from "@/lib/types";
import { Card, Button, Badge, Spinner, Input, Label, Select } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { rupees } from "@/lib/utils";
import { VendorHeader } from "./Dashboard";

export default function Coupons() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["v-coupons"],
    queryFn: () => api<Coupon[]>("/api/vendor/coupons", { auth: true }),
  });

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await api(`/api/vendor/coupons/${id}`, { method: "DELETE", auth: true });
    qc.invalidateQueries({ queryKey: ["v-coupons"] });
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <VendorHeader title="Coupons" subtitle="Create discount codes customers can apply at checkout." />
        <Button onClick={() => setModal(true)}><Plus className="h-4 w-4" /> New Coupon</Button>
      </div>

      {!coupons?.length ? (
        <Card className="p-10 text-center text-slate-400">No coupons yet.</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <Card key={c._id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-brand-500" />
                  <span className="font-bold tracking-wide">{c.code}</span>
                </div>
                <button onClick={() => remove(c._id)}><Trash2 className="h-4 w-4 text-red-500" /></button>
              </div>
              <div className="mt-2 text-2xl font-bold text-brand-600">
                {c.type === "percent" ? `${c.value}% OFF` : `${rupees(c.value)} OFF`}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge color={c.isActive ? "green" : "slate"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                <Badge>Used {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}</Badge>
                {c.expiry && <Badge color="yellow">Exp {new Date(c.expiry).toLocaleDateString()}</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && <CouponModal onClose={() => setModal(false)} onSaved={() => { setModal(false); qc.invalidateQueries({ queryKey: ["v-coupons"] }); }} />}
    </div>
  );
}

function CouponModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [expiry, setExpiry] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!code.trim() || !value) return toast.error("Code and value required");
    setSaving(true);
    try {
      await api("/api/vendor/coupons", {
        method: "POST",
        auth: true,
        body: {
          code: code.toUpperCase(),
          type,
          value: Number(value),
          expiry: expiry || undefined,
          usageLimit: usageLimit ? Number(usageLimit) : 0,
        },
      });
      toast.success("Coupon created");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="New Coupon"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving}>Create</Button></>}
    >
      <div className="space-y-4">
        <div><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SAVE20" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </Select>
          </div>
          <div><Label>Value</Label><Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "percent" ? "10" : "50"} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Expiry (optional)</Label><Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></div>
          <div><Label>Usage Limit (0 = ∞)</Label><Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="0" /></div>
        </div>
      </div>
    </Modal>
  );
}
