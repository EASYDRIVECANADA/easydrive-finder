import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dealer/PageHeader";
import { employees as initial, type Employee, type Role } from "@/data/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dealer/directory")({
  head: () => ({ meta: [{ title: "Directory — Dealer Portal" }] }),
  component: DirectoryPage,
});

const roles: Role[] = ["Owner", "Manager", "Sales", "Finance", "Service"];

function DirectoryPage() {
  const [list, setList] = useState<Employee[]>(initial);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("Sales");

  const add = () => {
    if (!name || !email) return;
    setList((l) => [
      ...l,
      {
        id: `E-${String(l.length + 1).padStart(3, "0")}`,
        name, email, phone, role, active: true,
        joined: new Date().toISOString().slice(0, 10),
      },
    ]);
    toast.success(`${name} added to the team`);
    setOpen(false);
    setName(""); setEmail(""); setPhone(""); setRole("Sales");
  };

  const remove = (id: string) => {
    setList((l) => l.filter((e) => e.id !== id));
    toast.success("Employee removed");
  };

  return (
    <div>
      <PageHeader
        title="Directory"
        subtitle={`${list.length} team members`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Add employee</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add employee</DialogTitle></DialogHeader>
              <div className="grid gap-4">
                <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
                <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" /></div>
                <div>
                  <Label>Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={add}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {e.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-muted-foreground">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline">{e.role}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{e.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.joined}</td>
                  <td className="px-4 py-3">
                    <Badge className={e.active ? "bg-success/15 text-success hover:bg-success/15" : "bg-muted text-muted-foreground hover:bg-muted"}>
                      {e.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.role !== "Owner" && (
                      <Button size="sm" variant="ghost" onClick={() => remove(e.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
