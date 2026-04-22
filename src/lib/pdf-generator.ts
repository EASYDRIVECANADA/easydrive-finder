// Client-side PDF generation for Bill of Sale and 30-Day Dealer Guarantee.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Order } from "@/lib/orders";

const BRAND = rgb(0.231, 0.620, 1); // ~#3b9eff
const INK = rgb(0.04, 0.09, 0.16);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.85, 0.87, 0.9);

const PAGE_W = 612; // US Letter
const PAGE_H = 792;
const MARGIN = 56;

type Ctx = {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  y: number;
};

async function createCtx(): Promise<Ctx> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([PAGE_W, PAGE_H]);
  return { doc, page, font, bold, y: PAGE_H - MARGIN };
}

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN + 40) {
    ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    ctx.y = PAGE_H - MARGIN;
  }
}

function drawText(
  ctx: Ctx,
  text: string,
  opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; x?: number } = {},
) {
  const size = opts.size ?? 10;
  const f = opts.bold ? ctx.bold : ctx.font;
  ensureSpace(ctx, size + 4);
  ctx.page.drawText(text, {
    x: opts.x ?? MARGIN,
    y: ctx.y - size,
    size,
    font: f,
    color: opts.color ?? INK,
  });
  ctx.y -= size + 4;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const trial = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(trial, size) > maxWidth) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = trial;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawParagraph(ctx: Ctx, text: string, size = 10) {
  const lines = wrapText(text, ctx.font, size, PAGE_W - MARGIN * 2);
  for (const line of lines) drawText(ctx, line, { size });
  ctx.y -= 4;
}

function drawHeading(ctx: Ctx, text: string, size = 13) {
  ctx.y -= 6;
  drawText(ctx, text, { size, bold: true });
  ctx.y -= 2;
}

function drawDivider(ctx: Ctx) {
  ensureSpace(ctx, 10);
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y - 2 },
    end: { x: PAGE_W - MARGIN, y: ctx.y - 2 },
    thickness: 0.5,
    color: LINE,
  });
  ctx.y -= 10;
}

function drawHeader(ctx: Ctx, title: string, orderId: string, dateStr: string) {
  // Brand bar
  ctx.page.drawRectangle({
    x: 0,
    y: PAGE_H - 40,
    width: PAGE_W,
    height: 40,
    color: rgb(0.04, 0.09, 0.16),
  });
  ctx.page.drawText("EDC", {
    x: MARGIN,
    y: PAGE_H - 28,
    size: 16,
    font: ctx.bold,
    color: BRAND,
  });
  ctx.page.drawText("EASYDRIVE CANADA", {
    x: MARGIN + 38,
    y: PAGE_H - 25,
    size: 9,
    font: ctx.bold,
    color: rgb(1, 1, 1),
  });
  const idLabel = `${orderId}  ·  ${dateStr}`;
  const w = ctx.font.widthOfTextAtSize(idLabel, 9);
  ctx.page.drawText(idLabel, {
    x: PAGE_W - MARGIN - w,
    y: PAGE_H - 25,
    size: 9,
    font: ctx.font,
    color: rgb(0.85, 0.87, 0.9),
  });
  ctx.y = PAGE_H - 60;
  drawText(ctx, title, { size: 20, bold: true });
  ctx.y -= 8;
}

function drawKV(ctx: Ctx, k: string, v: string) {
  ensureSpace(ctx, 14);
  ctx.page.drawText(k, { x: MARGIN, y: ctx.y - 10, size: 9, font: ctx.font, color: MUTED });
  const vw = ctx.font.widthOfTextAtSize(v, 10);
  ctx.page.drawText(v, {
    x: PAGE_W - MARGIN - vw,
    y: ctx.y - 10,
    size: 10,
    font: ctx.bold,
    color: INK,
  });
  ctx.y -= 14;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.3,
    color: LINE,
  });
  ctx.y -= 4;
}

async function drawSignatureBlock(
  ctx: Ctx,
  label: string,
  sig: { typedName: string; drawnDataUrl: string; signedAt: string } | null,
) {
  ensureSpace(ctx, 90);
  ctx.y -= 6;
  drawText(ctx, label, { size: 9, color: MUTED });
  const boxY = ctx.y - 60;
  ctx.page.drawRectangle({
    x: MARGIN,
    y: boxY,
    width: PAGE_W - MARGIN * 2,
    height: 60,
    borderColor: LINE,
    borderWidth: 0.6,
  });
  if (sig) {
    try {
      const pngBytes = dataUrlToBytes(sig.drawnDataUrl);
      const png = await ctx.doc.embedPng(pngBytes);
      const maxH = 50;
      const maxW = 200;
      const dims = png.scale(Math.min(maxW / png.width, maxH / png.height));
      ctx.page.drawImage(png, {
        x: MARGIN + 8,
        y: boxY + (60 - dims.height) / 2,
        width: dims.width,
        height: dims.height,
      });
    } catch {
      // ignore
    }
    ctx.page.drawText(sig.typedName, {
      x: MARGIN + 230,
      y: boxY + 38,
      size: 11,
      font: ctx.bold,
      color: INK,
    });
    ctx.page.drawText(`Signed ${new Date(sig.signedAt).toLocaleString()}`, {
      x: MARGIN + 230,
      y: boxY + 22,
      size: 8,
      font: ctx.font,
      color: MUTED,
    });
  } else {
    ctx.page.drawText("Awaiting signature", {
      x: MARGIN + 8,
      y: boxY + 28,
      size: 9,
      font: ctx.font,
      color: MUTED,
    });
  }
  ctx.y = boxY - 12;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? dataUrl;
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function fmtMoney(n: number) {
  return `$${n.toLocaleString("en-CA")}`;
}

// ----- Bill of Sale -----
export async function generateBillOfSalePdf(order: Order): Promise<Uint8Array> {
  const ctx = await createCtx();
  const today = new Date(order.createdAt).toLocaleDateString("en-CA");
  drawHeader(ctx, "Bill of Sale", order.id, today);

  drawHeading(ctx, "Seller");
  drawText(ctx, "EasyDrive Canada");
  drawText(ctx, "Toronto, Ontario · info@easydrivecanada.com", { color: MUTED, size: 9 });

  drawHeading(ctx, "Buyer");
  const c = order.customer;
  drawText(ctx, c.fullName, { bold: true });
  drawText(ctx, `${c.addressLine1}, ${c.city}, ${c.province} ${c.postalCode}`, {
    color: MUTED,
    size: 9,
  });
  drawText(ctx, `${c.email}  ·  ${c.phone}`, { color: MUTED, size: 9 });

  drawHeading(ctx, "Vehicle");
  const v = order.vehicleSnapshot;
  drawKV(ctx, "Year / Make / Model", `${v.year} ${v.make} ${v.model}`);
  drawKV(ctx, "Trim", v.trim);
  drawKV(ctx, "VIN", v.vin);
  drawKV(ctx, "Stock #", v.stockNumber);

  drawHeading(ctx, "Pricing");
  const p = order.pricing;
  drawKV(ctx, "Sale price", fmtMoney(p.salePrice));
  drawKV(ctx, "Documentation fee", fmtMoney(p.docFee));
  drawKV(ctx, "Licensing", fmtMoney(p.licensing));
  drawKV(ctx, "HST (13%)", fmtMoney(p.hst));
  ensureSpace(ctx, 18);
  ctx.page.drawText("Total", { x: MARGIN, y: ctx.y - 12, size: 12, font: ctx.bold, color: INK });
  const tw = ctx.bold.widthOfTextAtSize(fmtMoney(p.total), 12);
  ctx.page.drawText(fmtMoney(p.total), {
    x: PAGE_W - MARGIN - tw,
    y: ctx.y - 12,
    size: 12,
    font: ctx.bold,
    color: BRAND,
  });
  ctx.y -= 20;
  drawDivider(ctx);
  drawKV(ctx, "Non-refundable deposit", fmtMoney(p.deposit));
  drawKV(ctx, "Balance due before delivery", fmtMoney(p.balanceDue));

  drawHeading(ctx, "Terms & Conditions");
  const terms = [
    "1. The deposit of $1,000 is NON-REFUNDABLE except at EasyDrive Canada's sole discretion.",
    "2. Buyer must remit the remaining balance via direct deposit / wire transfer prior to vehicle release.",
    "3. Once the vehicle is marked Ready for Delivery, Buyer has 72 hours to (a) clear the remaining balance and (b) upload valid proof of insurance for the vehicle. Failure to do either results in cancellation of this sale and forfeiture of the deposit.",
    "4. The vehicle is sold subject to the EasyDrive Canada 30-Day Dealer Guarantee, which Buyer acknowledges signing as a separate document.",
    "5. EasyDrive Canada reserves the right to cancel this transaction and refund the deposit at its sole discretion.",
  ];
  for (const t of terms) drawParagraph(ctx, t, 9.5);

  await drawSignatureBlock(ctx, "BUYER SIGNATURE", order.signatures.billOfSaleCustomer);
  await drawSignatureBlock(
    ctx,
    "SELLER SIGNATURE — EASYDRIVE CANADA",
    order.signatures.billOfSaleDealer,
  );

  return ctx.doc.save();
}

// ----- 30-Day Dealer Guarantee -----
export async function generateDealerGuaranteePdf(order: Order): Promise<Uint8Array> {
  const ctx = await createCtx();
  const today = new Date(order.createdAt).toLocaleDateString("en-CA");
  drawHeader(ctx, "30-Day Dealer Guarantee", order.id, today);

  drawText(ctx, "Dealer Guarantee Policy & Procedures · v1.0 (2025)", { color: MUTED, size: 9 });
  ctx.y -= 6;

  drawParagraph(
    ctx,
    "The Dealer Guarantee's purpose is to provide clients peace of mind, trust and confidence to purchase vehicles through EasyDrive Canada and any EDC Authorized Dealers. Its function and intended outcome is to recondition the vehicle back to being road-worthy, drivable, and in the condition where it passes a safety inspection like when originally delivered.",
  );
  drawParagraph(
    ctx,
    "Any vehicle sold by EasyDrive Canada or EDC Authorized Dealers will be required to provide a 30-Day Dealer Guarantee. The Dealer Guarantee will be defined as a Service Issue, which will cover Safety Related issues and concerns.",
  );
  drawParagraph(
    ctx,
    "In order for clients to utilize the 30-Day Dealer Guarantee and get their vehicle serviced, they will need to ensure it meets and follows the following criteria, procedures and guidelines:",
  );

  const clauses = [
    "1. EasyDrive Canada or any EDC Authorized Dealer will honour the servicing of vehicles at the selling dealership.",
    "2. Only safety-related service issues brought to our attention will be serviced.",
    "3. The client will have 30 Days or 3,000 km (whichever comes first), from the time of delivery, to report and schedule a service appointment within the coverage period.",
    "4. The vehicle will be required to have a diagnostic report completed relating to the issue brought forward by the client, at or by an authorized EDC-approved mechanic. In some cases, multiple diagnostics may need to be completed.",
    "5. The diagnostic report will provide accurate details on corrections needed, if any.",
    "6. Any modifications or servicing completed on the vehicle by the client during the coverage period will disqualify the vehicle from coverage — including exhaust/engine modification, tuning, structural modifications (suspension, lifters, tire changes), or any servicing that jeopardizes safety inspection eligibility.",
    "7. The client is required and expected to bring the vehicle in for service at the selling dealership, or any EDC-approved mechanic locations where the selling dealership has acknowledged and granted permission to do so.",
    "8. It is the client's responsibility to be liable for any transportation costs absorbed in transporting the vehicle to service destinations, where and when applicable.",
    "9. EasyDrive Canada or any EDC Authorized Dealer will not provide, facilitate, or reimburse expenses of any housing accommodations, rental vehicles, or financial payments during the servicing period. Loss of time, wages, employment, hardship, or inconvenience caused by service delays will be the responsibility of the buyer.",
    "10. The Dealer Guarantee does not cover physical damage caused by the buyer; normal wear & tear; excessive vehicle usage for performance, street racing, stunt driving, or burnouts; or any condition where the use of the vehicle exhibits actions that breach governing laws on public or private roadways.",
    "11. The Dealer Guarantee does not cover or reimburse any independent diagnostic reports done for the buyer, nor will it cover any repairs without acknowledgement and authorization.",
  ];
  for (const cl of clauses) drawParagraph(ctx, cl, 9.5);

  drawParagraph(
    ctx,
    "By signing this agreement of the Dealer Guarantee between the Seller and the Buyer, both parties acknowledge and agree to the terms listed above. Both parties have also participated in visual inspections of the vehicle prior to the sale, and upon the buyer taking delivery of the vehicle. The Seller is to provide to the Buyer a copy and proof that the vehicle has successfully completed and passed a recent safety inspection. The Seller is to receive and sign off on a Vehicle Delivery Report & Checklist.",
  );

  await drawSignatureBlock(ctx, "BUYER SIGNATURE", order.signatures.dealerGuaranteeCustomer);
  await drawSignatureBlock(ctx, "SELLER — EASYDRIVE CANADA", null);

  return ctx.doc.save();
}

export async function downloadOrderPdf(
  kind: "bos" | "guarantee",
  order: Order,
): Promise<void> {
  const bytes =
    kind === "bos"
      ? await generateBillOfSalePdf(order)
      : await generateDealerGuaranteePdf(order);
  const filename =
    kind === "bos"
      ? `BillOfSale-${order.id}.pdf`
      : `DealerGuarantee-${order.id}.pdf`;
  // Copy into a fresh, contiguous Uint8Array so the Blob constructor sees a plain
  // ArrayBuffer (avoids "SharedArrayBuffer" / TS BlobPart typing issues).
  const buf = new Uint8Array(bytes.byteLength);
  buf.set(bytes);
  const blob = new Blob([buf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
