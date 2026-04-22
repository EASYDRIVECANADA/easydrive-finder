// 30-Day Dealer Guarantee — content reformatted from the EDC PDF.
export const DEALER_GUARANTEE_VERSION = "v1.0 (2025)";

export function DealerGuaranteeContent() {
  return (
    <article className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-li:my-1">
      <h2 className="!mb-1 text-xl font-bold">Dealer Guarantee Policy &amp; Procedures</h2>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        EasyDrive Canada · 30-Day Dealer Guarantee · {DEALER_GUARANTEE_VERSION}
      </p>

      <p>
        The Dealer Guarantee&apos;s purpose is to provide clients peace of mind, trust and
        confidence to purchase vehicles through EasyDrive Canada and any EDC Authorized
        Dealers. Its function and intended outcome is to recondition the vehicle back to
        being road-worthy, drivable, and in the condition where it passes a safety inspection
        like when originally delivered.
      </p>

      <p>
        Any vehicle sold by EasyDrive Canada or EDC Authorized Dealers will be required to
        provide a <strong>30-Day Dealer Guarantee</strong>. The Dealer Guarantee will be
        defined as a &ldquo;<strong>Service Issue</strong>&rdquo;, which will cover
        &ldquo;Safety Related&rdquo; issues and concerns.
      </p>

      <p>
        In order for clients to utilize the 30-Day Dealer Guarantee and get their vehicle
        serviced, they will need to ensure it meets and follows the following criteria,
        procedures and guidelines:
      </p>

      <ol className="list-decimal pl-6">
        <li>
          EasyDrive Canada or any EDC Authorized Dealer will honour the servicing of vehicles
          at the selling dealership.
        </li>
        <li>Only safety-related service issues brought to our attention will be serviced.</li>
        <li>
          The client will have <strong>30 Days or 3,000 km</strong> (whichever comes first),
          from the time of delivery, to report and schedule a service appointment within the
          coverage period.
        </li>
        <li>
          The vehicle will be required to have a diagnostic report completed relating to the
          issue brought forward by the client, at or by an authorized EDC-approved mechanic.
          <ol className="list-[lower-alpha] pl-6">
            <li>
              In some cases, multiple diagnostics may need to be completed for additional
              information and opinion.
            </li>
          </ol>
        </li>
        <li>The diagnostic report will provide accurate details on corrections needed, if any.</li>
        <li>
          Any modifications or servicing completed on the vehicle done so by the client during
          the coverage period will disqualify the vehicle from redeeming any coverage from the
          30-Day Dealer Guarantee, such as:
          <ol className="list-[lower-alpha] pl-6">
            <li>Exhaust or engine modification</li>
            <li>Tuning &amp; programming</li>
            <li>Structural modifications including suspension, lifters, tire changes, etc.</li>
            <li>
              Or any mechanical servicing done to the vehicle that jeopardizes the eligibility
              of the vehicle to pass a safety inspection
            </li>
          </ol>
        </li>
        <li>
          The client is required and expected to bring the vehicle in for service at the
          selling dealership, or any EDC-approved mechanic locations where the selling
          dealership has acknowledged and granted permission to do so.
        </li>
        <li>
          It is the client&apos;s responsibility to be liable for any transportation costs
          absorbed in transporting the vehicle to service destinations, where and when
          applicable.
        </li>
        <li>
          EasyDrive Canada or any EDC Authorized Dealer will not provide, facilitate, or
          reimburse expenses of any housing accommodations, rental vehicles, or financial
          payments during the servicing period. Furthermore, any loss of time, wages,
          employment, hardship, inconvenience, etc. caused by service coverage delays or
          wait times will be the responsibility of the buyer.
        </li>
        <li>
          The Dealer Guarantee does not cover the following:
          <ol className="list-[lower-alpha] pl-6">
            <li>Physical damage caused by the buyer on any interior or exterior body parts, panels, etc.</li>
            <li>Normal wear &amp; tear</li>
            <li>Excessive vehicle usage for performance, street racing, stunt driving, burnouts, etc.</li>
            <li>
              Any condition where the use of the vehicle exhibits actions that breach
              governing laws on all public and private roadways.
            </li>
          </ol>
        </li>
        <li>
          The Dealer Guarantee does not cover or reimburse any independent diagnostic reports
          done so for or on behalf of the buyer, nor will it cover any repairs without
          acknowledgement and authorization.
        </li>
      </ol>

      <p>
        By signing this agreement of the Dealer Guarantee between the Seller and the Buyer,
        both acknowledge and agree to the terms listed above. Both parties have also
        participated in visual inspections of the vehicle prior to the sale, and upon the
        buyer taking delivery of the vehicle. The Seller is to provide to the Buyer a copy and
        proof that the vehicle has successfully completed and passed a recent safety
        inspection. The Seller is to receive and sign off on a Vehicle Delivery Report &amp;
        Checklist.
      </p>
    </article>
  );
}
