"use client";

import { getProdutosComprados, getProdutosVendidos } from "../../_lib/reports";
import { useFilteredNfeData } from "../../_lib/use-filtered-data";
import { NoDataState } from "./no-data-state";
import { PeriodFilter } from "./period-filter";
import { TopProductsBoughtTable } from "./top-products-bought-table";
import { TopProductsSoldTable } from "./top-products-sold-table";

export function ProductsSection() {
  const { hydrated, hasAnyNotas, notasFiltradas, itensFiltrados, dateRange, setDateRange } = useFilteredNfeData();

  if (!hydrated) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">Carregando notas…</div>;
  }

  if (!hasAnyNotas) {
    return (
      <div className="flex flex-col gap-4">
        <PeriodFilter range={dateRange} onChange={setDateRange} />
        <NoDataState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PeriodFilter range={dateRange} onChange={setDateRange} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TopProductsSoldTable rows={getProdutosVendidos(itensFiltrados, notasFiltradas)} />
        <TopProductsBoughtTable rows={getProdutosComprados(itensFiltrados, notasFiltradas)} />
      </div>
    </div>
  );
}
