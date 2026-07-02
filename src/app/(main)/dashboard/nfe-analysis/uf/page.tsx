import { UfSection } from "../_components/reports/uf-section";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">Por UF</h1>
        <p className="text-muted-foreground text-sm">
          Distribuição geográfica das compras (fornecedores) e vendas (clientes) por estado.
        </p>
      </div>

      <UfSection />
    </div>
  );
}
