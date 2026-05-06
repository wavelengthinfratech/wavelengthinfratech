export const LEAD_TYPES = [
  "HOUSE_OWNER","THEKEDAR","MISTRI_CARPENTER","ELECTRICIAN",
  "CONSTRUCTION_LEAD","PLANNING","INTERIOR","ELEVATION",
] as const;

export const LEAD_STATUSES = [
  "NEW","CONTACTED","INTERESTED","VISIT_SCHEDULED","VISITED",
  "QUOTED","NEGOTIATING","WON","LOST","FUTURE_FOLLOWUP",
] as const;

export const CALL_RESULTS = ["Answered","Not Answered","Busy","Wrong Number"] as const;

export const STATUS_COLOR: Record<string,string> = {
  NEW: "bg-blue-500/15 text-blue-600",
  CONTACTED: "bg-cyan-500/15 text-cyan-600",
  INTERESTED: "bg-emerald-500/15 text-emerald-600",
  VISIT_SCHEDULED: "bg-amber-500/15 text-amber-600",
  VISITED: "bg-amber-600/15 text-amber-700",
  QUOTED: "bg-violet-500/15 text-violet-600",
  NEGOTIATING: "bg-fuchsia-500/15 text-fuchsia-600",
  WON: "bg-green-600/20 text-green-700",
  LOST: "bg-red-500/15 text-red-600",
  FUTURE_FOLLOWUP: "bg-slate-500/15 text-slate-600",
};

const FIELD_SYNONYMS: Record<string, string[]> = {
  timestamp_text: ["timestamp","date","datetime","time"],
  lead_type: ["leadtype","lead type","type","category"],
  mobile_no: ["mobile","mobileno","phone","mobilenumber","contact","mobile no"],
  name: ["name","client","fullname","clientname"],
  village_address: ["village","address","villageaddress","village/address","villageoraddress"],
  construction_area: ["constructionarea","area","constarea","sqft","constructionsqft"],
  experience: ["experience","exp"],
  remark: ["remark","remarks","note","notes","comment"],
  location_area: ["location","locationarea","place","city"],
};

const norm = (s: string) => s.toLowerCase().replace(/[\s_\-/.]/g, "");

export function fuzzyMapHeaders(headers: string[]): Record<string,string> {
  const map: Record<string,string> = {};
  const used = new Set<string>();
  for (const h of headers) {
    const nh = norm(h);
    let best: string | null = null;
    for (const [field, syns] of Object.entries(FIELD_SYNONYMS)) {
      if (used.has(field)) continue;
      if (syns.some((s) => norm(s) === nh) || norm(field) === nh) { best = field; break; }
    }
    if (!best) {
      for (const [field, syns] of Object.entries(FIELD_SYNONYMS)) {
        if (used.has(field)) continue;
        if (syns.some((s) => nh.includes(norm(s)) || norm(s).includes(nh))) { best = field; break; }
      }
    }
    if (best) { map[h] = best; used.add(best); }
  }
  return map;
}

export function normalizeLeadType(v: string): string {
  if (!v) return "HOUSE_OWNER";
  const u = v.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z_]/g, "");
  const known = LEAD_TYPES as readonly string[];
  if (known.includes(u)) return u;
  if (u.includes("MISTRI") || u.includes("CARPENT")) return "MISTRI_CARPENTER";
  if (u.includes("ELECTR")) return "ELECTRICIAN";
  if (u.includes("THEKEDAR") || u.includes("CONTRACTOR")) return "THEKEDAR";
  if (u.includes("INTERIOR")) return "INTERIOR";
  if (u.includes("ELEVATION")) return "ELEVATION";
  if (u.includes("PLAN")) return "PLANNING";
  if (u.includes("CONSTRUCTION")) return "CONSTRUCTION_LEAD";
  if (u.includes("OWNER") || u.includes("HOUSE")) return "HOUSE_OWNER";
  return "HOUSE_OWNER";
}

export function cleanMobile(v: string): string {
  return (v || "").toString().replace(/\D/g, "").slice(-10);
}
