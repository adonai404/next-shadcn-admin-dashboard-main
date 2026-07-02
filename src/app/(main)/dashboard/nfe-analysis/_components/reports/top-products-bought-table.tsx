import type { ProdutoRow } from "../../_lib/reports";
import { formatBRL, RankingTable } from "./ranking-table";

export function TopProductsBoughtTable({ rows }: { rows: ProdutoRow[] }) {
  return (
    <RankingTable
      title="Produtos mais comprados"
      rows={rows}
      getKey={(row) => row.chave}
      emptyMessage="Nenhum item comprado no período."
      columns={[
        {
          header: "Produto",
          render: (row) => (
            <div>
              <div className="font-medium">{row.xProd}</div>
              <div className="text-muted-foreground text-xs">
                {row.cProd} · NCM {row.ncm}
              </div>
            </div>
          ),
        },
        { header: "Qtd.", align: "right", render: (row) => row.totalQtd.toLocaleString("pt-BR") },
        { header: "Valor total", align: "right", render: (row) => formatBRL(row.totalValor) },
      ]}
    />
  );
}
