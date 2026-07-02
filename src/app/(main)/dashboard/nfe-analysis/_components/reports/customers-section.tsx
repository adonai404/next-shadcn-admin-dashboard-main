"use client";

import { getClientesRanking } from "../../_lib/reports";
import { useFilteredNfeData } from "../../_lib/use-filtered-data";
import { NoDataState } from "./no-data-state";
import { PeriodFilter } from "./period-filter";
import { TopCustomersTable } from "./top-customers-table";

export function CustomersSection() {
  const { hydrated, hasAnyNotas, notasFiltradas, dateRange, setDateRange } = useFilteredNfeData();

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
      <TopCustomersTable rows={getClientesRanking(notasFiltradas)} />
    </div>
  );
}
