import { requireAdmin } from "@/lib/auth/admin";
import { listSignups } from "@/lib/waitlist/query";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "name",
  "email",
  "phone",
  "business",
  "leadTypes",
  "leadTypeOther",
  "location",
  "budgetPerLead",
  "leadsPerMonth",
  "stage",
  "createdAt",
] as const;

/**
 * Quotes every field, and neutralises anything Excel would treat as a formula.
 * These rows are attacker-supplied, and a spreadsheet opening `=HYPERLINK(...)`
 * from a signup form is a real exfiltration path.
 */
function csvCell(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const access = await requireAdmin();
  if (!access.ok) {
    return new Response("Not authorised", { status: access.reason === "signed-out" ? 401 : 403 });
  }

  const rows = await listSignups(10_000);

  const body = [
    COLUMNS.map(csvCell).join(","),
    ...rows.map((row) =>
      COLUMNS.map((column) => {
        const value = row[column];
        if (column === "leadTypes") return csvCell((value as string[]).join(" | "));
        if (column === "createdAt") return csvCell((value as Date).toISOString());
        return csvCell(value);
      }).join(","),
    ),
  ].join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(`﻿${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aleadmate-waitlist-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
