import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedGuest = {
  name: string;
  phone: string;
  email: string;
  partySize: number;
  notes: string;
};

export type ParsedRow = {
  row: number;
  data: ParsedGuest;
  valid: boolean;
  errors: string[];
  warnings: string[];
};

const NAME_VARIANTS = [
  "name",
  "full name",
  "fullname",
  "guest name",
  "guestname",
];
const PHONE_VARIANTS = [
  "phone",
  "phone number",
  "phonenumber",
  "mobile",
  "tel",
];
const EMAIL_VARIANTS = ["email", "email address", "emailaddress"];
const PARTY_VARIANTS = [
  "party_size",
  "partysize",
  "party size",
  "party",
  "size",
  "count",
  "guests",
];
const NOTES_VARIANTS = ["notes", "note", "remarks", "comment", "comments"];

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function findColumn(headers: string[], variants: string[]): string | null {
  for (const h of headers) {
    if (variants.includes(normalizeHeader(h))) return h;
  }
  return null;
}

function parseRows(rawRows: Record<string, string>[]): ParsedRow[] {
  if (rawRows.length === 0) return [];

  const headers = Object.keys(rawRows[0]);
  const nameCol = findColumn(headers, NAME_VARIANTS);
  const phoneCol = findColumn(headers, PHONE_VARIANTS);
  const emailCol = findColumn(headers, EMAIL_VARIANTS);
  const partyCol = findColumn(headers, PARTY_VARIANTS);
  const notesCol = findColumn(headers, NOTES_VARIANTS);

  return rawRows
    .map((row, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Skip entirely empty rows
      const values = Object.values(row).map((v) => v?.trim() ?? "");
      if (values.every((v) => v === "")) return null;

      const name = nameCol ? (row[nameCol]?.trim() ?? "") : "";
      const phone = phoneCol ? (row[phoneCol]?.trim() ?? "") : "";
      const email = emailCol ? (row[emailCol]?.trim() ?? "") : "";
      const notesRaw = notesCol ? (row[notesCol]?.trim() ?? "") : "";

      let partySize = 1;
      if (partyCol && row[partyCol]) {
        const parsed = parseInt(row[partyCol]);
        if (isNaN(parsed)) {
          warnings.push("Party size is not a number - defaulting to 1");
        } else {
          partySize = Math.min(20, Math.max(1, parsed));
          if (parsed < 1 || parsed > 20) {
            warnings.push(
              `Party size is out of range - clamped to ${partySize}`,
            );
          }
        }
      }

      if (!name) errors.push("Name is required");
      if (phone && !email) warnings.push("No contact information provided");

      return {
        row: index + 2,
        data: { name, phone, email, partySize, notes: notesRaw },
        valid: errors.length === 0,
        errors,
        warnings,
      } satisfies ParsedRow;
    })
    .filter(Boolean) as ParsedRow[];
}

export async function parseCSV(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(parseRows(results.data as Record<string, string>[]));
      },
      error: reject,
    });
  });
}

export async function parseExcel(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: "",
        });
        resolve(parseRows(rows));
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function parseImportFile(file: File): Promise<ParsedRow[]> {
    const name = file.name.toLowerCase();
    if (name.endsWith(".csv")) return parseCSV(file);
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) return parseExcel(file);
    throw new Error("Unsupported file type. Use .csv or .xlsx or .xls");
}
