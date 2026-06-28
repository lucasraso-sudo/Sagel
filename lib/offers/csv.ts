// Minimal CSV/TSV parser — handles quoted fields and escaped quotes. Returns
// objects keyed by lower-cased header names.

function splitLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delimiter) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

export function parseDelimited(
  text: string,
  delimiter = ","
): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitLine(lines[0], delimiter).map((h) =>
    h.trim().toLowerCase()
  );
  return lines.slice(1).map((line) => {
    const cells = splitLine(line, delimiter);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = (cells[i] ?? "").trim()));
    return obj;
  });
}

export function toBool(v: string | undefined): boolean {
  if (v === undefined || v === "") return true; // default in stock
  return v === "1" || /^(true|yes|oui|y|o)$/i.test(v);
}
