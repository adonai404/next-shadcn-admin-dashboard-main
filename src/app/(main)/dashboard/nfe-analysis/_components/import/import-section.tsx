"use client";

import { useEffect } from "react";

import { useNfeStore } from "../../_lib/store";
import { CompanySelectorCard } from "../company/company-selector-card";
import { ImportCardsGrid } from "./import-cards-grid";

export function ImportSection() {
  const hydrate = useNfeStore((state) => state.hydrate);
  const hydrated = useNfeStore((state) => state.hydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
        Carregando notas salvas…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CompanySelectorCard />
      <ImportCardsGrid />
    </div>
  );
}
