import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, X, Ban, Trash2, Power, Store } from "lucide-react";
import { api } from "@/lib/api";
import { Vendor } from "@/lib/types";
import { Button, Badge, Spinner, Input, Label, Select } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { PageHeader } from "./Overview";

const FILTERS = ["all", "pending", "active", "suspended", "inactive"];
const statusColor: Record<string, any> = {
  pending: "orange", active: "green", suspended: "red", inactive: "slate",
};

export default function Vendors() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["admin-vendors", filter],
    queryFn: () => api<Vendor[]>(`/api/admin/vendors?status=${filter}`, { auth: true }),
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin-vendors"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  }

  async function setStatus(id: string, status: string) {
    try {
      await api(`/api/admin/vendors/${id}/status`, { method: "PATCH", body: { status }, auth: true });
      toast.success(`Vendor ${status}`);
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete this vendor and all its data?")) return;
    await api(`/api/admin/vendors/${id}`, { method: "DELETE", auth: true });
    toast.success("Vendor deleted");
    refresh();
  }

  const pending = vendors?.filter((v) => v.status === "pending") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <PageHeader title="Vendor Management" subtitle="Approve, suspend and manage all vendors on the platform." />
        <Button onClick={() => setModal(true)}><Plus className="h-4 w-4" /> Create Vendor</Button>
      </div>

      {/* Approval queue */}
      {filter !== "pending" && pending.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <div className="mb-3 flex items-center gap-2 font-bold text-orange-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white">{pending.length}</span>
            Vendor(s) awaiting approval
          </div>
          <div className="space-y-2">
            {pending.map((v) => (
              <div key={v._id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    {v.logo ? <img src={v.logo} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <Store className="h-5 w-5 text-slate-400" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.email} · {v.category}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setStatus(v._id, "active")}><Check className="h-4 w-4" /> Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(v._id, "inactive")}><X className="h-4 w-4" /> Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold capitalize transition",
              filter === f
                ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : !vendors?.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          No vendors found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((v) => (
                <tr key={v._id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        {v.logo ? <img src={v.logo} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <Store className="h-5 w-5 text-slate-400" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{v.name}</div>
                        <div className="text-xs text-slate-500">{v.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{v.category}</td>
                  <td className="px-5 py-3"><Badge color={statusColor[v.status]}>{v.status}</Badge></td>
                  <td className="px-5 py-3"><Badge>{v.subscriptionPlan}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      {v.status === "pending" && (
                        <Button size="icon" variant="ghost" title="Approve" onClick={() => setStatus(v._id, "active")}><Check className="h-4 w-4 text-green-600" /></Button>
                      )}
                      {v.status === "active" ? (
                        <Button size="icon" variant="ghost" title="Suspend" onClick={() => setStatus(v._id, "suspended")}><Ban className="h-4 w-4 text-red-500" /></Button>
                      ) : (
                        <Button size="icon" variant="ghost" title="Activate" onClick={() => setStatus(v._id, "active")}><Power className="h-4 w-4 text-green-600" /></Button>
                      )}
                      <Button size="icon" variant="ghost" title="Delete" onClick={() => remove(v._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <CreateVendorModal onClose={() => setModal(false)} onSaved={() => { setModal(false); refresh(); }} />}
    </div>
  );
}

function CreateVendorModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Fast Food");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name || !email || !password) return toast.error("Name, email, password required");
    setSaving(true);
    try {
      await api("/api/admin/vendors", { method: "POST", auth: true, body: { name, email, password, phone, category } });
      toast.success("Vendor created & activated");
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
      title="Create Vendor"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving}>Create</Button></>}
    >
      <div className="space-y-4">
        <div><Label>Stall Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Email (login)</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label>Password</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set an initial password" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div>
            <Label>Category</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {["Tea Stall", "Café", "Bakery", "Juice Corner", "Fast Food", "Food Court"].map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
