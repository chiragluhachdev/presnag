import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, FolderPlus } from "lucide-react";
import { api } from "@/lib/api";
import { Category, MenuItem, Customization } from "@/lib/types";
import { Card, Button, Badge, Spinner, Input, Label, Textarea, Select } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "@/components/ui/toast";
import { rupees, cn } from "@/lib/utils";
import { VendorHeader } from "./Dashboard";
import { CustomizationBuilder } from "./CustomizationBuilder";

export default function Menu() {
  const qc = useQueryClient();
  const [catModal, setCatModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editCat, setEditCat] = useState<Category | null>(null);

  const { data: categories, isLoading: lc } = useQuery({
    queryKey: ["v-categories"],
    queryFn: () => api<Category[]>("/api/vendor/categories", { auth: true }),
  });
  const { data: items, isLoading: li } = useQuery({
    queryKey: ["v-items"],
    queryFn: () => api<MenuItem[]>("/api/vendor/items", { auth: true }),
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["v-categories"] });
    qc.invalidateQueries({ queryKey: ["v-items"] });
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category and all its items?")) return;
    await api(`/api/vendor/categories/${id}`, { method: "DELETE", auth: true });
    toast.success("Category deleted");
    refresh();
  }
  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    await api(`/api/vendor/items/${id}`, { method: "DELETE", auth: true });
    toast.success("Item deleted");
    refresh();
  }
  async function toggleAvailability(item: MenuItem) {
    await api(`/api/vendor/items/${item._id}/availability`, { method: "PATCH", auth: true });
    refresh();
  }

  if (lc || li) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <VendorHeader title="Menu Management" subtitle="Add categories and items, toggle availability and upload photos." />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditCat(null); setCatModal(true); }}>
            <FolderPlus className="h-4 w-4" /> Category
          </Button>
          <Button onClick={() => { setEditItem(null); setItemModal(true); }} disabled={!categories?.length}>
            <Plus className="h-4 w-4" /> Item
          </Button>
        </div>
      </div>

      {!categories?.length && (
        <Card className="p-10 text-center text-slate-400">
          Create a category first, then add items.
        </Card>
      )}

      {categories?.map((cat) => {
        const catItems = items?.filter((i) => i.categoryId === cat._id) || [];
        return (
          <Card key={cat._id} className="overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                {cat.image && <img src={cat.image} alt="" className="h-8 w-8 rounded object-cover" />}
                <span className="font-semibold">{cat.name}</span>
                <Badge>{catItems.length} items</Badge>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditCat(cat); setCatModal(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => deleteCategory(cat._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {catItems.length === 0 && <div className="px-4 py-4 text-sm text-slate-400">No items in this category.</div>}
              {catItems.map((item) => (
                <div key={item._id} className="flex items-center gap-3 px-4 py-3">
                  {item.image && <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="line-clamp-1 text-xs text-slate-500">{item.description}</div>
                  </div>
                  <div className="font-semibold">{rupees(item.price)}</div>
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditItem(item); setItemModal(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteItem(item._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {catModal && (
        <CategoryModal cat={editCat} onClose={() => setCatModal(false)} onSaved={() => { setCatModal(false); refresh(); }} />
      )}
      {itemModal && categories && (
        <ItemModal item={editItem} categories={categories} onClose={() => setItemModal(false)} onSaved={() => { setItemModal(false); refresh(); }} />
      )}
    </div>
  );
}

function CategoryModal({ cat, onClose, onSaved }: { cat: Category | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(cat?.name || "");
  const [image, setImage] = useState(cat?.image || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return toast.error("Name required");
    setSaving(true);
    try {
      if (cat) await api(`/api/vendor/categories/${cat._id}`, { method: "PUT", body: { name, image }, auth: true });
      else await api("/api/vendor/categories", { method: "POST", body: { name, image }, auth: true });
      toast.success("Category saved");
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
      title={cat ? "Edit Category" : "New Category"}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving}>Save</Button></>}
    >
      <div className="space-y-4">
        <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Beverages" /></div>
        <div><Label>Image</Label><ImageUpload value={image} onChange={setImage} folder="categories" /></div>
      </div>
    </Modal>
  );
}

function ItemModal({
  item, categories, onClose, onSaved,
}: { item: MenuItem | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [tab, setTab] = useState<"basic" | "custom">("basic");
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [categoryId, setCategoryId] = useState(item?.categoryId || categories[0]?._id || "");
  const [image, setImage] = useState(item?.image || "");
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);
  const [customizations, setCustomizations] = useState<Customization[]>(item?.customizations || []);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim() || !price) return toast.error("Name and price required");
    setSaving(true);
    const body = { name, description, price: Number(price), categoryId, image, isAvailable, customizations };
    try {
      if (item) await api(`/api/vendor/items/${item._id}`, { method: "PUT", body, auth: true });
      else await api("/api/vendor/items", { method: "POST", body, auth: true });
      toast.success("Item saved");
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
      title={item ? "Edit Item" : "New Item"}
      className={tab === "custom" ? "max-w-5xl" : "max-w-lg"}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving}>Save</Button></>}
    >
      <div className="mb-4 flex gap-4 border-b border-slate-100">
        <button 
          onClick={() => setTab("basic")} 
          className={cn("pb-2 font-medium transition", tab === "basic" ? "border-b-2 border-brand-500 text-brand-600" : "text-slate-500 hover:text-slate-800")}
        >
          Basic Info
        </button>
        <button 
          onClick={() => setTab("custom")} 
          className={cn("pb-2 font-medium transition", tab === "custom" ? "border-b-2 border-brand-500 text-brand-600" : "text-slate-500 hover:text-slate-800")}
        >
          Customizations (Builder)
        </button>
      </div>

      {tab === "basic" && (
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Price (₹)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </Select>
            </div>
          </div>
          <div><Label>Image</Label><ImageUpload value={image} onChange={setImage} folder="items" /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
            Available for ordering
          </label>
        </div>
      )}

      {tab === "custom" && (
        <CustomizationBuilder 
          customizations={customizations} 
          onChange={setCustomizations} 
          basePrice={Number(price) || 0} 
        />
      )}
    </Modal>
  );
}
