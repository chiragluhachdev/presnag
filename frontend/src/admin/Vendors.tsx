import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Check, Ban, Trash2, Power, Store, Eye, Zap, Banknote, ShieldCheck,
  Building2, Phone, Mail, MapPin, CircleAlert, KeyRound,
} from "lucide-react";
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

// A vendor is ready to be listed only once its chosen payout rail is set up.
function isPayoutReady(v: Vendor): boolean {
  if (v.settlementMode === "DIRECT") return v.kycStatus === "active";
  return Boolean(v.cashfreeBeneficiaryId); // MANAGED
}

export default function Vendors() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState<Vendor | null>(null);
  const [editModal, setEditModal] = useState<Vendor | null>(null);

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["admin-vendors", filter],
    queryFn: () => api<Vendor[]>(`/api/admin/vendors?status=${filter}`, { auth: true }),
    // Vendors can change their own logo/banner/details from their panel, so keep
    // the admin list fresh when the admin returns to the tab.
    refetchOnWindowFocus: true,
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
                <div className="flex items-center gap-2">
                  <SettlementBadge v={v} />
                  <Button size="sm" variant="outline" onClick={() => setDetail(v)}><Eye className="h-4 w-4" /> Review</Button>
                  <Button
                    size="sm"
                    disabled={!isPayoutReady(v)}
                    title={isPayoutReady(v) ? "List on PreSnag" : "Payout setup not complete yet"}
                    onClick={() => setStatus(v._id, "active")}
                  >
                    <Check className="h-4 w-4" /> List on PreSnag
                  </Button>
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
                <th className="px-5 py-3">Settlement</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((v) => (
                <tr key={v._id} className="cursor-pointer transition hover:bg-slate-50" onClick={() => setDetail(v)}>
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
                  <td className="px-5 py-3"><SettlementBadge v={v} /></td>
                  <td className="px-5 py-3"><Badge color={statusColor[v.status]}>{v.status}</Badge></td>
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" title="View details" onClick={() => setDetail(v)}><Eye className="h-4 w-4 text-slate-500" /></Button>
                      {v.status === "pending" && (
                        <Button size="icon" variant="ghost" title={isPayoutReady(v) ? "List on PreSnag" : "Payout setup incomplete"} disabled={!isPayoutReady(v)} onClick={() => setStatus(v._id, "active")}><Check className="h-4 w-4 text-green-600" /></Button>
                      )}
                      {v.status === "active" ? (
                        <Button size="icon" variant="ghost" title="Suspend" onClick={() => setStatus(v._id, "suspended")}><Ban className="h-4 w-4 text-red-500" /></Button>
                      ) : (
                        <Button size="icon" variant="ghost" title="Activate" disabled={!isPayoutReady(v)} onClick={() => setStatus(v._id, "active")}><Power className="h-4 w-4 text-green-600" /></Button>
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
      {detail && (
        <VendorDetailModal
          v={detail}
          onClose={() => setDetail(null)}
          onAction={async (status) => { await setStatus(detail._id, status); setDetail(null); }}
          onEdit={() => { setEditModal(detail); setDetail(null); }}
        />
      )}
      {editModal && (
        <EditVendorModal
          v={editModal}
          onClose={() => setEditModal(null)}
          onSaved={() => { setEditModal(null); refresh(); }}
        />
      )}
    </div>
  );
}

function SettlementBadge({ v }: { v: Vendor }) {
  const direct = v.settlementMode === "DIRECT";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        direct ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      )}
      title={direct ? "Direct Settlement (Cashfree Easy Split)" : "PreSnag Managed (daily payout)"}
    >
      {direct ? <Banknote className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
      {direct ? "Direct" : "Managed"}
    </span>
  );
}

function VendorDetailModal({
  v, onClose, onAction, onEdit
}: { v: Vendor; onClose: () => void; onAction: (status: string) => void; onEdit: () => void }) {
  const ready = isPayoutReady(v);
  const payout = v.managedPayout;
  return (
    <Modal
      open
      onClose={onClose}
      title="Vendor details"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {v.status !== "active" && (
            <Button disabled={!ready} title={ready ? "" : "Payout setup incomplete"} onClick={() => onAction("active")}>
              <Check className="h-4 w-4" /> List on PreSnag
            </Button>
          )}
          {v.status === "active" && (
            <Button variant="outline" onClick={() => onAction("suspended")}><Ban className="h-4 w-4" /> Suspend</Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            {v.logo ? <img src={v.logo} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <Store className="h-6 w-6 text-slate-400" />}
          </div>
          <div>
            <div className="font-bold text-slate-900">{v.name}</div>
            <div className="flex items-center gap-2">
              <Badge color={statusColor[v.status]}>{v.status}</Badge>
              <SettlementBadge v={v} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 text-sm sm:grid-cols-2">
          <InfoRow icon={Store} label="Owner" value={v.ownerName || "—"} />
          <InfoRow icon={Phone} label="Mobile" value={v.phone || "—"} />
          <InfoRow icon={Mail} label="Email" value={v.email || "—"} />
          <InfoRow icon={Store} label="Category" value={v.category} />
          <InfoRow icon={MapPin} label="Address" value={v.address || "—"} />
          <InfoRow icon={ShieldCheck} label="FSSAI" value={v.fssaiLicense || "—"} />
          <InfoRow icon={Building2} label="Timings" value={`${v.openTime || "—"} – ${v.closeTime || "—"}`} />
        </div>

        {/* Admin actions */}
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-3">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Store className="h-4 w-4" /> Edit Details
          </Button>
          <Button size="sm" variant="outline" onClick={async () => {
            const pwd = window.prompt(`Set a new password for ${v.name} (min 6 chars):`);
            if (!pwd) return;
            try { await api(`/api/admin/vendors/${v._id}/password`, { method: "PATCH", auth: true, body: { password: pwd } }); toast.success("Password reset"); }
            catch (e: any) { toast.error(e.message || "Failed"); }
          }}>
            <KeyRound className="h-4 w-4" /> Reset Password
          </Button>
          <Button size="sm" variant="outline" onClick={async () => {
            if (!window.confirm(`Clear ALL order history for ${v.name}? This cannot be undone.`)) return;
            try { const r: any = await api(`/api/admin/orders?vendorId=${v._id}`, { method: "DELETE", auth: true }); toast.success(`Cleared ${r.deleted} orders`); }
            catch (e: any) { toast.error(e.message || "Failed"); }
          }}>
            <Trash2 className="h-4 w-4 text-red-500" /> Clear Orders
          </Button>
        </div>

        {/* Settlement / payout */}
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Building2 className="h-4 w-4 text-brand-500" /> Settlement & payout
          </div>
          {v.settlementMode === "DIRECT" ? (
            <div className="space-y-1.5 text-sm">
              <InfoRow icon={Banknote} label="Mode" value="Direct Settlement (Cashfree Easy Split)" />
              <InfoRow icon={ShieldCheck} label="KYC status" value={v.kycStatus || "not_started"} />
            </div>
          ) : (
            <>
              <div className="space-y-1.5 text-sm">
                <InfoRow icon={Zap} label="Mode" value="PreSnag Managed (manual settlement)" />
                <InfoRow icon={Building2} label="Account holder" value={payout?.accountHolderName || "—"} />
                <InfoRow icon={Banknote} label="Account no." value={payout?.accountNumber || (payout?.accountNumberLast4 ? `•••• ${payout.accountNumberLast4}` : "—")} />
                <InfoRow icon={Building2} label="IFSC" value={payout?.ifsc || "—"} />
                <InfoRow icon={ShieldCheck} label="PAN" value={payout?.pan || payout?.panMasked || "—"} />
              </div>
              <p className="mt-2 flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
                <ShieldCheck className="h-3 w-3 shrink-0" /> Confidential — use only for vendor settlement transfers.
              </p>
            </>
          )}
        </div>

        {/* Readiness banner */}
        <div className={cn(
          "flex items-start gap-2 rounded-xl p-3 text-sm",
          ready ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
        )}>
          {ready ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
          {ready
            ? "Payout setup is complete. You can list this vendor on PreSnag."
            : "Payout setup is not complete yet. The vendor must finish their payout/KYC setup before listing."}
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium text-slate-700">{value}</span>
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
    if (!name || !phone || !password) return toast.error("Name, mobile and password required");
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
        <div><Label>Email (optional)</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
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

function EditVendorModal({
  v, onClose, onSaved
}: { v: Vendor; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(v.name);
  const [email, setEmail] = useState(v.email || "");
  const [phone, setPhone] = useState(v.phone || "");
  const [category, setCategory] = useState(v.category || "Fast Food");
  const [fssaiLicense, setFssaiLicense] = useState(v.fssaiLicense || "");
  const [isFeatured, setIsFeatured] = useState(v.isFeatured || false);
  const [featuredOrder, setFeaturedOrder] = useState(v.featuredOrder || 0);
  
  const payout = v.managedPayout || {};
  const [accountHolderName, setAccountHolderName] = useState(payout.accountHolderName || "");
  const [accountNumber, setAccountNumber] = useState(payout.accountNumber || "");
  const [ifsc, setIfsc] = useState(payout.ifsc || "");
  const [pan, setPan] = useState(payout.pan || "");

  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name || !phone) return toast.error("Name and mobile required");
    setSaving(true);
    try {
      const body = {
        name, email, phone, category, fssaiLicense, isFeatured, featuredOrder,
        managedPayout: { accountHolderName, accountNumber, ifsc, pan }
      };
      await api(`/api/admin/vendors/${v._id}`, { method: "PUT", auth: true, body });
      toast.success("Vendor updated");
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
      title={`Edit ${v.name}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving}>Save Changes</Button></>}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-1">
        <h4 className="font-semibold text-slate-800">Basic Information</h4>
        <div><Label>Stall Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>FSSAI License</Label><Input value={fssaiLicense} onChange={(e) => setFssaiLicense(e.target.value)} /></div>
          <div>
            <Label>Category</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {["Tea Stall", "Café", "Bakery", "Juice Corner", "Fast Food", "Food Court", "North Indian", "Multi-Cuisine", "Healthy Food"].map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
        </div>

        <h4 className="mt-6 font-semibold text-slate-800 border-t pt-4">Featured Status</h4>
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="isFeatured" 
            checked={isFeatured} 
            onChange={(e) => setIsFeatured(e.target.checked)} 
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isFeatured" className="mb-0 cursor-pointer text-sm font-medium">Mark as Featured Vendor</label>
        </div>
        {isFeatured && (
          <div className="mt-2 pl-6">
            <Label>Display Order (1 = first, 2 = second...)</Label>
            <Input 
              type="number" 
              min="1" 
              value={featuredOrder} 
              onChange={(e) => setFeaturedOrder(Number(e.target.value))} 
              className="max-w-[150px]"
            />
          </div>
        )}

        <h4 className="mt-6 font-semibold text-slate-800 border-t pt-4">Bank Details (Managed Payout)</h4>
        <div><Label>Account Holder Name</Label><Input value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} /></div>
        <div><Label>Account Number</Label><Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>IFSC Code</Label><Input value={ifsc} onChange={(e) => setIfsc(e.target.value)} /></div>
          <div><Label>PAN Number</Label><Input value={pan} onChange={(e) => setPan(e.target.value)} /></div>
        </div>
      </div>
    </Modal>
  );
}
