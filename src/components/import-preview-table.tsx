import { ParsedRow } from "@/lib/parse-import-file";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function ImportPreviewTable({ rows }: { rows: ParsedRow[] }) {
  return (
    <div className="rounded-md border overflow-auto max-h-72">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.row}
              className={!row.valid ? "bg-red-50 hover:bg-red-50" : ""}
            >
              <TableCell className="text-muted-foreground text-xs">
                {row.row}
              </TableCell>
              <TableCell className="font-medium">
                {row.data.name || (
                  <span className="text-muted-foreground italic">missing</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{row.data.partySize}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.data.phone || row.data.email || "—"}
              </TableCell>
              <TableCell>
                {!row.valid ? (
                  <div className="flex items-center gap-1 text-red-600 text-xs">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    {row.errors[0]}
                  </div>
                ) : row.warnings.length > 0 ? (
                  <div className="flex items-center gap-1 text-amber-600 text-xs">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {row.warnings[0]}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    Ready
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}