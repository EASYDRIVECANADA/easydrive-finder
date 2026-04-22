import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_DESCRIPTIONS,
  setAccountType,
  useAccountType,
  type AccountType,
} from "@/lib/account";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCog } from "lucide-react";

export function AccountTypeSwitcher({ compact = false }: { compact?: boolean }) {
  const current = useAccountType();
  return (
    <div
      className={
        compact
          ? "inline-flex items-center gap-2"
          : "inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1"
      }
      title={ACCOUNT_TYPE_DESCRIPTIONS[current]}
    >
      <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Demo as
      </span>
      <Select value={current} onValueChange={(v) => setAccountType(v as AccountType)}>
        <SelectTrigger className="h-7 w-[150px] rounded-full border-0 bg-transparent px-2 text-xs font-semibold focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {ACCOUNT_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
