import { fullName, type Order } from "@/lib/orders";

export function BillOfSaleContent({ order }: { order: Order }) {
  const { customer, vehicleSnapshot: v, pricing, id, createdAt } = order;
  const today = new Date(createdAt).toLocaleDateString("en-CA");
  return (
    <article className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground">
      <div className="not-prose mb-4 flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold">Bill of Sale</h2>
          <p className="text-xs text-muted-foreground">EasyDrive Canada</p>
        </div>
        <div className="text-right text-xs">
          <div className="font-semibold">{id}</div>
          <div className="text-muted-foreground">Date: {today}</div>
        </div>
      </div>

      <h3 className="!mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Seller
      </h3>
      <p className="!mt-0">
        EasyDrive Canada
        <br />
        Toronto, Ontario
        <br />
        info@easydrivecanada.com
      </p>

      <h3 className="!mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Buyer
      </h3>
      <p className="!mt-0">
        {fullName(customer)}
        <br />
        {customer.addressLine1}, {customer.city}, {customer.province} {customer.postalCode}
        <br />
        {customer.email} · {customer.phone}
      </p>

      <h3 className="!mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Vehicle
      </h3>
      <table className="not-prose w-full text-sm">
        <tbody className="divide-y divide-border">
          <Row k="Year / Make / Model" v={`${v.year} ${v.make} ${v.model}`} />
          <Row k="Trim" v={v.trim} />
          <Row k="VIN" v={v.vin} />
          <Row k="Stock #" v={v.stockNumber} />
        </tbody>
      </table>

      <h3 className="!mb-1 mt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Pricing
      </h3>
      <table className="not-prose w-full text-sm">
        <tbody className="divide-y divide-border">
          <Row k="Sale price" v={`$${pricing.salePrice.toLocaleString()}`} />
          {pricing.lineItems.map((li) => (
            <tr key={li.label}>
              <td className="py-1.5 text-muted-foreground">
                {li.label}
                {li.note && <span className="ml-1 text-xs text-success">({li.note})</span>}
              </td>
              <td className="py-1.5 text-right tabular-nums">
                {li.waived && li.originalAmount ? (
                  <>
                    <span className="mr-2 text-muted-foreground line-through">
                      ${li.originalAmount.toLocaleString()}
                    </span>
                    <span className="font-semibold text-success">WAIVED</span>
                  </>
                ) : (
                  `$${li.amount.toLocaleString()}`
                )}
              </td>
            </tr>
          ))}
          {pricing.addOns.length > 0 && (
            <>
              <tr><td colSpan={2} className="pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add-Ons</td></tr>
              {pricing.addOns.map((a) => (
                <Row key={a.id} k={a.label} v={`$${a.amount.toLocaleString()}`} />
              ))}
            </>
          )}
          <Row k="HST (13%)" v={`$${pricing.hst.toLocaleString()}`} />
          <tr className="border-t-2 border-foreground/40">
            <td className="py-2 font-bold">Total</td>
            <td className="py-2 text-right font-bold tabular-nums">
              ${pricing.total.toLocaleString()}
            </td>
          </tr>
          <Row k="Non-refundable deposit" v={`$${pricing.deposit.toLocaleString()}`} />
          <tr>
            <td className="py-2 font-semibold">Balance due before delivery</td>
            <td className="py-2 text-right font-semibold tabular-nums">
              ${pricing.balanceDue.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      <h3 className="!mb-1 mt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Terms &amp; Conditions
      </h3>
      <ol className="list-decimal pl-6 text-sm">
        <li>
          The deposit of $1,000 is <strong>non-refundable</strong> except at EasyDrive
          Canada&apos;s sole discretion.
        </li>
        <li>
          Buyer must remit the remaining balance via direct deposit / wire transfer prior to
          vehicle release.
        </li>
        <li>
          Once the vehicle is marked &ldquo;Ready for Delivery,&rdquo; Buyer has{" "}
          <strong>72 hours</strong> to (a) clear the remaining balance and (b) upload valid
          proof of insurance for the vehicle. Failure to do either results in cancellation of
          this sale and forfeiture of the deposit.
        </li>
        <li>
          The vehicle is sold subject to the EasyDrive Canada 30-Day Dealer Guarantee, which
          Buyer acknowledges signing as a separate document.
        </li>
        <li>
          EasyDrive Canada reserves the right to cancel this transaction and refund the deposit
          at its sole discretion.
        </li>
      </ol>
    </article>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td className="py-1.5 text-muted-foreground">{k}</td>
      <td className="py-1.5 text-right tabular-nums">{v}</td>
    </tr>
  );
}
