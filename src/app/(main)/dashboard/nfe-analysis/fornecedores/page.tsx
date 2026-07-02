import { SuppliersSection } from "../_components/reports/suppliers-section";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">Fornecedores</h1>
        <p className="text-muted-foreground text-sm">
          Ranking de fornecedores por valor total comprado e quantidade de notas recebidas.
        </p>
      </div>

      <SuppliersSection />
    </div>
  );
}
