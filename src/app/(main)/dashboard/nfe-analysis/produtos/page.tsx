import { ProductsSection } from "../_components/reports/products-section";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">Produtos</h1>
        <p className="text-muted-foreground text-sm">
          Produtos mais vendidos e mais comprados, por quantidade e valor.
        </p>
      </div>

      <ProductsSection />
    </div>
  );
}
