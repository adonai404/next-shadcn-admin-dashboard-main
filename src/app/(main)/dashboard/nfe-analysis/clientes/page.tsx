import { CustomersSection } from "../_components/reports/customers-section";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">Clientes</h1>
        <p className="text-muted-foreground text-sm">
          Ranking de clientes por valor total vendido, considerando NF Emitidas e NFC.
        </p>
      </div>

      <CustomersSection />
    </div>
  );
}
