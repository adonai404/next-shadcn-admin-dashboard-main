import { ImportSection } from "../_components/import/import-section";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">Importação</h1>
        <p className="text-muted-foreground text-sm">
          Importe XMLs de NF-e e NFC-e para gerar relatórios de compras, vendas, fornecedores e produtos.
        </p>
      </div>

      <ImportSection />
    </div>
  );
}
