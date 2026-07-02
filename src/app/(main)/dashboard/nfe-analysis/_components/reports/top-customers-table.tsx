import type { ClienteRow } from "../../_lib/reports";
import { formatBRL, RankingTable } from "./ranking-table";

export function TopCustomersTable({ rows }: { rows: ClienteRow[] }) {
  return (
    <RankingTable
      title="Principais clientes"
      rows={rows}
      getKey={(row) => row.documento || row.xNome}
      emptyMessage="Nenhuma NF Emitida ou NFC no período."
      columns={[
        {
          header: "Cliente",
          render: (row) => (
            <div>
              <div className="font-medium">{row.xNome}</div>
              <div className="text-muted-foreground text-xs">
                {row.documento || "Consumidor final"} {row.uf ? `· ${row.uf}` : ""}
              </div>
            </div>
          ),
        },
        { header: "Notas", align: "right", render: (row) => row.totalNotas },
        { header: "Valor total", align: "right", render: (row) => formatBRL(row.totalValor) },
      ]}
    />
  );
}
