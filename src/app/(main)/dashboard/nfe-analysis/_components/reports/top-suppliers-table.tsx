import type { FornecedorRow } from "../../_lib/reports";
import { formatBRL, RankingTable } from "./ranking-table";

export function TopSuppliersTable({ rows }: { rows: FornecedorRow[] }) {
  return (
    <RankingTable
      title="Principais fornecedores"
      rows={rows}
      getKey={(row) => row.cnpj}
      emptyMessage="Nenhuma NF Recebida no período."
      columns={[
        {
          header: "Fornecedor",
          render: (row) => (
            <div>
              <div className="font-medium">{row.xNome}</div>
              <div className="text-muted-foreground text-xs">
                {row.cnpj} · {row.uf}
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
