import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, GripVertical, Settings, Trash2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Customization, CustomizationOption, MenuItem } from "@/lib/types";
import { Button, Input, Label, Select } from "@/components/ui";
import { rupees, cn } from "@/lib/utils";

// A minimal live preview of how the customer sees it.
function LivePreview({ customizations, basePrice }: { customizations: Customization[]; basePrice: number }) {
  const [picks, setPicks] = useState<Record<string, Set<string>>>({});

  function toggle(groupId: string, type: "single" | "multi", optionId: string) {
    setPicks((p) => {
      const next = { ...p };
      const set = new Set(next[groupId] || []);
      if (type === "single") {
        next[groupId] = new Set([optionId]);
      } else {
        set.has(optionId) ? set.delete(optionId) : set.add(optionId);
        next[groupId] = set;
      }
      return next;
    });
  }

  // Calculate pricing
  let totalAddons = 0;
  customizations.forEach(g => {
    if (!g.isActive) return;
    const selected = picks[g.id] || new Set();
    g.options.forEach(o => {
      if (selected.has(o.id) && o.isAvailable) {
        if (o.priceType === "fixed") totalAddons += o.price;
      }
    });
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sticky top-4">
      <h3 className="mb-4 font-bold text-slate-800">Live Customer Preview</h3>
      <div className="space-y-4">
        {customizations.filter(g => g.isActive).map((g) => {
          // Check dependencies
          if (g.dependency?.groupId && g.dependency?.optionId) {
            if (!picks[g.dependency.groupId]?.has(g.dependency.optionId)) return null;
          }

          return (
            <div key={g.id}>
              <div className="mb-1.5 flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800">{g.name || "Unnamed Group"}</h4>
                <span className="text-[10px] font-medium text-slate-400">
                  {g.required ? "Required" : g.type === "single" ? "Pick one" : "Optional"}
                </span>
              </div>
              <div className="space-y-1.5">
                {g.options.filter(o => o.isAvailable && !o.isHidden).map((o) => {
                  const checked = picks[g.id]?.has(o.id) ?? false;
                  let displayPrice = "";
                  if (o.priceType === "fixed" && o.price > 0) displayPrice = `+ ${rupees(o.price)}`;
                  if (o.priceType === "free") displayPrice = "Free";

                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggle(g.id, g.type, o.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition",
                        checked ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-500" : "border-slate-200"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn(
                          "flex h-4 w-4 items-center justify-center border",
                          g.type === "single" ? "rounded-full" : "rounded",
                          checked ? "border-brand-500 bg-brand-500" : "border-slate-300"
                        )}>
                          {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        {o.label || "Unnamed Option"}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{displayPrice}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 border-t border-slate-100 pt-4">
        <Button className="w-full">
          Add to Cart — {rupees(basePrice + totalAddons)}
        </Button>
      </div>
    </div>
  );
}

export function CustomizationBuilder({
  customizations,
  onChange,
  basePrice,
}: {
  customizations: Customization[];
  onChange: (c: Customization[]) => void;
  basePrice: number;
}) {
  const [expanded, setExpanded] = useState<string[]>([]);

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const { source, destination, type } = result;

    if (type === "group") {
      const reordered = Array.from(customizations);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      onChange(reordered);
    } else if (type.startsWith("option-")) {
      const groupId = type.replace("option-", "");
      const groupIdx = customizations.findIndex((g) => g.id === groupId);
      if (groupIdx < 0) return;
      const group = customizations[groupIdx];
      const reorderedOptions = Array.from(group.options);
      const [removed] = reorderedOptions.splice(source.index, 1);
      reorderedOptions.splice(destination.index, 0, removed);
      
      const newCustomizations = [...customizations];
      newCustomizations[groupIdx] = { ...group, options: reorderedOptions };
      onChange(newCustomizations);
    }
  }

  function addGroup() {
    const newGroup: Customization = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      type: "single",
      required: false,
      isActive: true,
      displayOrder: customizations.length,
      minSelections: 0,
      options: [],
    };
    onChange([...customizations, newGroup]);
    setExpanded((prev) => [...prev, newGroup.id]);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  // Helper to update a specific group
  function updateGroup(id: string, updates: Partial<Customization>) {
    onChange(customizations.map(g => g.id === id ? { ...g, ...updates } : g));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side: Builder */}
      <div className="col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Customization Groups</h3>
          <Button size="sm" onClick={addGroup}><Plus className="h-4 w-4" /> Add Group</Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="groups" type="group">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {customizations.map((group, index) => (
                  <Draggable key={group.id} draggableId={group.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                      >
                        {/* Group Header */}
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border-b border-slate-200">
                          <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <Input 
                            value={group.name} 
                            onChange={(e) => updateGroup(group.id, { name: e.target.value })} 
                            placeholder="e.g. Size" 
                            className="h-8 flex-1 text-sm font-semibold border-transparent hover:border-slate-300 focus:border-brand-500 bg-transparent transition-colors"
                          />
                          <Select 
                            value={group.type} 
                            onChange={(e) => updateGroup(group.id, { type: e.target.value as any })}
                            className="h-8 text-sm w-32"
                          >
                            <option value="single">Single Pick</option>
                            <option value="multi">Multi Select</option>
                          </Select>
                          <label className="flex items-center gap-1 text-xs font-medium text-slate-600">
                            <input type="checkbox" checked={group.required} onChange={(e) => updateGroup(group.id, { required: e.target.checked })} />
                            Req
                          </label>
                          <button onClick={() => toggleExpand(group.id)} className="p-1 text-slate-500 hover:bg-slate-200 rounded">
                            {expanded.includes(group.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <button onClick={() => onChange(customizations.filter(g => g.id !== group.id))} className="p-1 text-red-500 hover:bg-red-50 rounded">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Group Body (Options) */}
                        {expanded.includes(group.id) && (
                          <div className="p-3 bg-white">
                            <Droppable droppableId={`options-${group.id}`} type={`option-${group.id}`}>
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                  {group.options.map((opt, optIndex) => (
                                    <Draggable key={opt.id} draggableId={opt.id} index={optIndex}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className="flex items-center gap-2"
                                        >
                                          <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-500">
                                            <GripVertical className="h-4 w-4" />
                                          </div>
                                          <Input 
                                            placeholder="Option name" 
                                            value={opt.label} 
                                            onChange={(e) => {
                                              const newOpts = [...group.options];
                                              newOpts[optIndex].label = e.target.value;
                                              updateGroup(group.id, { options: newOpts });
                                            }}
                                            className="h-8 text-sm flex-1"
                                          />
                                          <Select 
                                            value={opt.priceType} 
                                            onChange={(e) => {
                                              const newOpts = [...group.options];
                                              newOpts[optIndex].priceType = e.target.value as any;
                                              updateGroup(group.id, { options: newOpts });
                                            }}
                                            className="h-8 text-sm w-24"
                                          >
                                            <option value="fixed">Fixed</option>
                                            <option value="free">Free</option>
                                          </Select>
                                          {opt.priceType !== "free" && (
                                            <Input 
                                              type="number" 
                                              min="0"
                                              value={opt.price} 
                                              onChange={(e) => {
                                                const newOpts = [...group.options];
                                                newOpts[optIndex].price = Math.max(0, Number(e.target.value));
                                                updateGroup(group.id, { options: newOpts });
                                              }}
                                              className="h-8 text-sm w-20"
                                            />
                                          )}
                                          <button 
                                            onClick={() => {
                                              const newOpts = [...group.options];
                                              newOpts.splice(optIndex, 1);
                                              updateGroup(group.id, { options: newOpts });
                                            }} 
                                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full text-xs h-8 border-dashed"
                                    onClick={() => {
                                      const newOpt: CustomizationOption = {
                                        id: Math.random().toString(36).substr(2, 9),
                                        label: "",
                                        priceType: "fixed",
                                        price: 0,
                                        isAvailable: true,
                                        isDefault: false,
                                        displayOrder: group.options.length,
                                        inStock: true,
                                        isHidden: false,
                                      };
                                      updateGroup(group.id, { options: [...group.options, newOpt] });
                                    }}
                                  >
                                    <Plus className="h-3 w-3" /> Add Option
                                  </Button>
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Right side: Live Preview */}
      <div className="col-span-1 border-l pl-6 border-slate-100">
        <LivePreview customizations={customizations} basePrice={basePrice} />
      </div>
    </div>
  );
}
