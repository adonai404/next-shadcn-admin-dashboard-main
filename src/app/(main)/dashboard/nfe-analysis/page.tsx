import { DashboardSection } from "./_components/dashboard/dashboard-section";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground text-sm">
          Resumo consolidado das notas importadas: valores, impostos, fornecedores e evolução mensal de compras e
          vendas.
        </p>
      </div>

      <DashboardSection />
    </div>
  );
}
