import { ImportCard } from "./import-card";

export function ImportCardsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ImportCard tipo="nfe_recebida" />
      <ImportCard tipo="nfe_emitida" />
      <ImportCard tipo="nfce" />
    </div>
  );
}
