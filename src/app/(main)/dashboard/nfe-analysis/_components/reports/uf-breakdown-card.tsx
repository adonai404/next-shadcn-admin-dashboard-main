import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { UfRow } from "../../_lib/reports";
import { formatBRL } from "./ranking-table";

function UfList({ rows, emptyMessage }: { rows: UfRow[]; emptyMessage: string }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  const max = Math.max(...rows.map((row) => row.totalValor));

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.uf} className="flex items-center gap-3">
          <span className="w-8 shrink-0 font-medium text-sm">{row.uf}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-chart-2"
              style={{ width: `${max > 0 ? (row.totalValor / max) * 100 : 0}%` }}
            />
          </div>
          <span className="w-28 shrink-0 text-right text-muted-foreground text-xs tabular-nums">
            {formatBRL(row.totalValor)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function UfBreakdownCard({ fornecedores, clientes }: { fornecedores: UfRow[]; clientes: UfRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Fornecedores por UF</CardTitle>
        </CardHeader>
        <CardContent>
          <UfList rows={fornecedores} emptyMessage="Nenhuma NF Recebida no período." />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Clientes por UF</CardTitle>
        </CardHeader>
        <CardContent>
          <UfList rows={clientes} emptyMessage="Nenhum destinatário com UF identificada no período." />
        </CardContent>
      </Card>
    </div>
  );
}
