"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import ImportModal from "@/components/import-modal";

export default function ImportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Import Guests
      </Button>
      <ImportModal open={open} onOpenChange={setOpen} />
    </>
  );
}