"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { parseImportFile, ParsedRow } from "@/lib/parse-import-file";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ImportPreviewTable from "@/components/import-preview-table";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";

type Step = "upload" | "preview" | "importing" | "done";

type DoneResult = { imported: number; skipped: number };

export default function ImportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<DoneResult | null>(null);

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  async function handleFile(file: File) {
    setError("");
    try {
      const parsed = await parseImportFile(file);
      if (parsed.length === 0) {
        setError("No rows found in file.");
        return;
      }
      setRows(parsed);
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse file");
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  async function handleImport() {
    setStep("importing");

    const res = await fetch("/api/guests/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guests: validRows.map((r) => r.data),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Import failed");
      setStep("preview");
      return;
    }

    setResult(data);
    setStep("done");
    router.refresh();
  }

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setStep("upload");
      setRows([]);
      setError("");
      setResult(null);
    }, 300);
  }

  function downloadSampleCSV() {
    const csv = [
      "name,phone,email,party_size,notes",
      "Abebe Kebede,+251911000001,abebe@example.com,1,",
      "Marta Alemu,+251911000002,,2,Vegetarian",
      "Dawit Family,+251911000003,,4,Table near stage",
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guest-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Guests</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to add multiple guests at once.
          </DialogDescription>
        </DialogHeader>

        {/* UPLOAD STEP */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
                ${dragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                }`}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">Drop your file here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports .csv, .xlsx, .xls
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Need a template?
              </p>
              <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                <Download className="h-4 w-4 mr-2" />
                Download Sample CSV
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-4 text-sm space-y-1">
              <p className="font-medium">Expected columns</p>
              <p className="text-muted-foreground">
                <code className="text-xs">name</code> (required) ·{" "}
                <code className="text-xs">phone</code> ·{" "}
                <code className="text-xs">email</code> ·{" "}
                <code className="text-xs">party_size</code> ·{" "}
                <code className="text-xs">notes</code>
              </p>
            </div>
          </div>
        )}

        {/* PREVIEW STEP */}
        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>{validRows.length} valid</span>
              </div>
              {invalidRows.length > 0 && (
                <div className="flex items-center gap-1.5 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>{invalidRows.length} will be skipped</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{rows.length} rows total</span>
              </div>
            </div>

            <ImportPreviewTable rows={rows} />

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="flex-1"
              >
                Import {validRows.length} Guest{validRows.length !== 1 ? "s" : ""}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload");
                  setRows([]);
                  setError("");
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                Change File
              </Button>
            </div>
          </div>
        )}

        {/* IMPORTING STEP */}
        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-medium">Importing guests...</p>
            <p className="text-sm text-muted-foreground">
              Generating invite codes for {validRows.length} guests
            </p>
          </div>
        )}

        {/* DONE STEP */}
        {step === "done" && result && (
          <div className="flex flex-col items-center justify-center py-8 gap-6 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
            <div className="space-y-1">
              <p className="text-xl font-bold">Import Complete</p>
              <p className="text-muted-foreground text-sm">
                {result.imported} guest{result.imported !== 1 ? "s" : ""} added
                successfully
                {result.skipped > 0 && ` · ${result.skipped} skipped`}
              </p>
            </div>
            <Button onClick={handleClose} className="w-full max-w-xs">
              View Guest List
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}