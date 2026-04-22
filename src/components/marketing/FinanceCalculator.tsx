import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const APR = 7.99;
const TERMS = [36, 48, 60, 72, 84];

export function FinanceCalculator({
  salePrice,
  defaultDown = 2000,
  defaultTerm = 60,
}: {
  salePrice: number;
  defaultDown?: number;
  defaultTerm?: number;
}) {
  const maxDown = Math.floor(salePrice * 0.6);
  const [down, setDown] = useState(Math.min(defaultDown, maxDown));
  const [term, setTerm] = useState(defaultTerm);

  const monthly = useMemo(() => {
    const principal = Math.max(0, salePrice - down);
    const r = APR / 100 / 12;
    if (principal <= 0) return 0;
    return (principal * r) / (1 - Math.pow(1 + r, -term));
  }, [salePrice, down, term]);

  const biweekly = monthly * 12 / 26;

  const setDownClamped = (n: number) => {
    if (Number.isNaN(n)) return setDown(0);
    setDown(Math.max(0, Math.min(maxDown, Math.round(n))));
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">Payment calculator</h3>
        <span className="text-xs text-muted-foreground">Est. {APR}% APR OAC</span>
      </div>

      <div className="mt-5 space-y-6">
        {/* Down payment */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Down payment
            </Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={maxDown}
                step={100}
                value={down}
                onChange={(e) => setDownClamped(Number(e.target.value))}
                className="h-8 w-28 text-right text-sm"
              />
            </div>
          </div>
          <Slider
            value={[down]}
            min={0}
            max={maxDown}
            step={100}
            onValueChange={(v) => setDown(v[0])}
            className="mt-1"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>$0</span>
            <span>${maxDown.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[0, 1000, 2500, 5000, 10000].filter((n) => n <= maxDown).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDown(n)}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${
                  down === n
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                ${n.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Term */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Term length
          </Label>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {TERMS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTerm(t)}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  term === t
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {t} mo
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-brand/10 p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Monthly</div>
          <div className="mt-0.5 text-2xl font-bold text-brand">
            ${Math.round(monthly).toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground">over {term} mo</div>
        </div>
        <div className="rounded-2xl bg-muted p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Biweekly</div>
          <div className="mt-0.5 text-2xl font-bold">
            ${Math.round(biweekly).toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground">26 payments / yr</div>
        </div>
      </div>

      <Button asChild variant="outline" className="mt-4 w-full rounded-full">
        <Link to="/financing">Get pre-approved</Link>
      </Button>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        Estimate only. Final rate &amp; term depend on lender approval.
      </p>
    </div>
  );
}
