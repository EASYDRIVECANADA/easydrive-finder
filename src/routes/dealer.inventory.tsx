import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dealer/PageHeader";
import { type VehicleStatus, type Vehicle, type ListingType } from "@/data/vehicles";
import {
  useInventory,
  deleteVehicles,
  upsertVehicle,
  blankVehicle,
} from "@/lib/inventory-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dealer/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Dealer Portal" }] }),
  component: InventoryPage,
});

const tabs = ["All", "Premier", "Fleet"] as const;
const statuses: ("All" | VehicleStatus)[] = ["All", "In Stock", "Deal Pending", "Sold"];
const STATUS_OPTIONS: VehicleStatus[] = ["In Stock", "Deal Pending", "Sold"];
const LISTING_TYPES: ListingType[] = ["EDC Premier", "Dealer Select", "Fleet Select", "Private Seller"];

const statusBadge: Record<VehicleStatus, string> = {
  "In Stock": "bg-success/15 text-success hover:bg-success/15",
  "Deal Pending": "bg-warning/25 text-foreground hover:bg-warning/25",
  Sold: "bg-muted text-muted-foreground hover:bg-muted",
};

function InventoryPage() {
  const inventory = useInventory();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Vehicle | null>(null);

  const filtered = useMemo(() => {
    return inventory.filter((v) => {
      if (status !== "All" && v.status !== status) return false;
      if (
        q &&
        !`${v.year} ${v.make} ${v.model} ${v.trim} ${v.stockNumber}`
          .toLowerCase()
          .includes(q.toLowerCase())
      )
        return false;
      if (tab === "Premier" && v.salePrice < 35000) return false;
      if (tab === "Fleet" && v.salePrice >= 35000) return false;
      return true;
    });
  }, [inventory, tab, status, q]);

  const allSelected = filtered.length > 0 && filtered.every((v) => selected.has(v.id));
  const toggleAll = () => {
    setSelected((s) => {
      const next = new Set(s);
      if (allSelected) filtered.forEach((v) => next.delete(v.id));
      else filtered.forEach((v) => next.add(v.id));
      return next;
    });
  };
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const bulkDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} vehicle(s)?`)) return;
    deleteVehicles(Array.from(selected));
    toast.success(`Deleted ${selected.size} vehicle(s)`);
    setSelected(new Set());
  };

  const onAdd = () => setEditing(blankVehicle());

  const onSave = (v: Vehicle) => {
    upsertVehicle(v);
    setEditing(null);
    toast.success("Vehicle saved");
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${filtered.length} of ${inventory.length} vehicles${selected.size ? ` · ${selected.size} selected` : ""}`}
        actions={
          <>
            {selected.size > 0 && (
              <Button variant="outline" className="rounded-full text-destructive" onClick={bulkDelete}>
                <Trash2 className="mr-1 h-4 w-4" /> Delete {selected.size}
              </Button>
            )}
            <Button variant="outline" className="rounded-full">
              <Upload className="mr-1 h-4 w-4" /> Import file
            </Button>
            <Button className="rounded-full" onClick={onAdd}>
              <Plus className="mr-1 h-4 w-4" /> Add vehicle
            </Button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search inventory..."
                className="w-64 pl-9"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])}
              className="h-9 rounded-md border border-border bg-card px-3 text-sm"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                </th>
                <th className="px-3 py-3 text-left">Description</th>
                <th className="px-3 py-3 text-left">Trim</th>
                <th className="px-3 py-3 text-left">Listing</th>
                <th className="px-3 py-3 text-right">Odometer</th>
                <th className="px-3 py-3 text-right">Sale Price</th>
                <th className="px-3 py-3 text-left">Stock #</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3">
                    <Checkbox
                      checked={selected.has(v.id)}
                      onCheckedChange={() => toggleOne(v.id)}
                      aria-label={`Select ${v.stockNumber}`}
                    />
                  </td>
                  <td className="px-3 py-3 font-medium whitespace-nowrap">
                    {v.year} {v.make} {v.model}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{v.trim}</td>
                  <td className="px-3 py-3">
                    <Badge variant="outline" className="text-[10px]">
                      {v.listingType}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{v.odometer.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">
                    ${v.salePrice.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{v.stockNumber}</td>
                  <td className="px-3 py-3">
                    <Badge className={statusBadge[v.status]}>{v.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(v)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete ${v.year} ${v.make} ${v.model}?`)) {
                          deleteVehicles([v.id]);
                          toast.success("Vehicle deleted");
                        }
                      }}
                      aria-label="Delete"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center text-sm text-muted-foreground">
                    No vehicles match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <VehicleEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </div>
  );
}

function VehicleEditor({
  initial,
  onClose,
  onSave,
}: {
  initial: Vehicle;
  onClose: () => void;
  onSave: (v: Vehicle) => void;
}) {
  const [v, setV] = useState<Vehicle>(initial);
  const update = <K extends keyof Vehicle>(k: K, val: Vehicle[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial.make ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Year">
            <Input type="number" value={v.year} onChange={(e) => update("year", +e.target.value)} />
          </Field>
          <Field label="Make">
            <Input value={v.make} onChange={(e) => update("make", e.target.value)} />
          </Field>
          <Field label="Model">
            <Input value={v.model} onChange={(e) => update("model", e.target.value)} />
          </Field>
          <Field label="Trim">
            <Input value={v.trim} onChange={(e) => update("trim", e.target.value)} />
          </Field>
          <Field label="VIN">
            <Input
              value={v.vin}
              onChange={(e) => update("vin", e.target.value.toUpperCase())}
              className="font-mono"
            />
          </Field>
          <Field label="Stock #">
            <Input value={v.stockNumber} onChange={(e) => update("stockNumber", e.target.value)} />
          </Field>
          <Field label="Key #">
            <Input value={v.keyNumber} onChange={(e) => update("keyNumber", e.target.value)} />
          </Field>
          <Field label="Colour">
            <Input value={v.colour} onChange={(e) => update("colour", e.target.value)} />
          </Field>
          <Field label="Odometer (km)">
            <Input
              type="number"
              value={v.odometer}
              onChange={(e) => update("odometer", +e.target.value)}
            />
          </Field>
          <Field label="Vehicle type">
            <Input value={v.vehicleType} onChange={(e) => update("vehicleType", e.target.value)} />
          </Field>
          <Field label="Drive">
            <Input value={v.drive} onChange={(e) => update("drive", e.target.value)} />
          </Field>
          <Field label="Transmission">
            <Input value={v.transmission} onChange={(e) => update("transmission", e.target.value)} />
          </Field>
          <Field label="Cylinders">
            <Input
              type="number"
              value={v.cylinders}
              onChange={(e) => update("cylinders", +e.target.value)}
            />
          </Field>
          <Field label="Fuel">
            <Input value={v.fuel} onChange={(e) => update("fuel", e.target.value)} />
          </Field>
          <Field label="Doors">
            <Input
              type="number"
              value={v.doors}
              onChange={(e) => update("doors", +e.target.value)}
            />
          </Field>
          <Field label="Cash value">
            <Input
              type="number"
              value={v.cashValue}
              onChange={(e) => update("cashValue", +e.target.value)}
            />
          </Field>
          <Field label="List price">
            <Input
              type="number"
              value={v.listPrice}
              onChange={(e) => update("listPrice", +e.target.value)}
            />
          </Field>
          <Field label="Sale price">
            <Input
              type="number"
              value={v.salePrice}
              onChange={(e) => update("salePrice", +e.target.value)}
            />
          </Field>
          <Field label="DII">
            <Input type="number" value={v.dii} onChange={(e) => update("dii", +e.target.value)} />
          </Field>
          <Field label="Status">
            <Select value={v.status} onValueChange={(val) => update("status", val as VehicleStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Certification">
            <Select
              value={v.certification}
              onValueChange={(val) => update("certification", val as Vehicle["certification"])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cert">Cert</SelectItem>
                <SelectItem value="AS-IS">AS-IS</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Listing type">
            <Select
              value={v.listingType}
              onValueChange={(val) => update("listingType", val as ListingType)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LISTING_TYPES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Seller name">
            <Input value={v.sellerName} onChange={(e) => update("sellerName", e.target.value)} />
          </Field>
          <Field label="Image URL" className="sm:col-span-3">
            <Input value={v.image} onChange={(e) => update("image", e.target.value)} />
          </Field>
          <Field label="Description" className="sm:col-span-3">
            <Textarea
              rows={3}
              value={v.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>
          <Field label="Features (comma separated)" className="sm:col-span-3">
            <Input
              value={v.features.join(", ")}
              onChange={(e) =>
                update(
                  "features",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                )
              }
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(v)}>Save vehicle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
