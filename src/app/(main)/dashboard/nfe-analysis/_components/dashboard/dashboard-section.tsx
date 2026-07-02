"use client";

import {
  getEvolucaoMensal,
  getFornecedoresRanking,
  getImpostosResumo,
  getNotasPorTipo,
  getResumoValores,
  getUfClientes,
  getUfFornecedores,
  getUltimasNotas,
} from "../../_lib/reports";
import { useFilteredNfeData } from "../../_lib/use-filtered-data";
import { NoDataState } from "../reports/no-data-state";
import { PeriodFilter } from "../reports/period-filter";
import { InsightCards } from "./insight-cards";
import { OperationalCards } from "./operational-cards";
import { OverviewCards } from "./overview-cards";
import type { RecentNotaRow } from "./recent-notes-table/schema";
import { RecentNotesTable } from "./recent-notes-table/table";

export function DashboardSection() {
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

  const resumo = getResumoValores(notasFiltradas);
  const impostos = getImpostosResumo(notasFiltradas);
  const evolucaoMensal = getEvolucaoMensal(notasFiltradas);
  const ufFornecedores = getUfFornecedores(notasFiltradas);
  const ufClientes = getUfClientes(notasFiltradas);
  const topFornecedores = getFornecedoresRanking(notasFiltradas);
  const notasPorTipo = getNotasPorTipo(notasFiltradas);
  const notasOrdenadas = getUltimasNotas(notasFiltradas, notasFiltradas.length);

  const tableRows: RecentNotaRow[] = notasOrdenadas.map((nota) => ({
    chave: nota.chave,
    tipo: nota.tipo,
    numero: nota.numero,
    serie: nota.serie,
    dhEmi: nota.dhEmi,
    contraparte: nota.tipo === "nfe_recebida" ? nota.emitente.xNome : (nota.destinatario?.xNome ?? "Consumidor final"),
    uf: nota.tipo === "nfe_recebida" ? nota.emitente.uf : (nota.destinatario?.uf ?? ""),
    valor: nota.valores.vNF,
  }));

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PeriodFilter range={dateRange} onChange={setDateRange} />
      <OverviewCards resumo={resumo} impostos={impostos} evolucaoMensal={evolucaoMensal} />
      <InsightCards ufFornecedores={ufFornecedores} topFornecedores={topFornecedores} />
      <OperationalCards notasPorTipo={notasPorTipo} ufClientes={ufClientes} ultimasNotas={notasOrdenadas.slice(0, 3)} />
      <RecentNotesTable data={tableRows} />
    </div>
  );
}
