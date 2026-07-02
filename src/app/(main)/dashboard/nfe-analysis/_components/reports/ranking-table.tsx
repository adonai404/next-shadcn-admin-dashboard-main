import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export function formatBRL(value: number): string {
  return formatCurrency(value, { currency: "BRL", locale: "pt-BR" });
}

export type RankingColumn<T> = {
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
};

export function RankingTable<T>({
  title,
  rows,
  getKey,
  columns,
  emptyMessage,
}: {
  title: string;
  rows: T[];
  getKey: (row: T) => string;
  columns: RankingColumn<T>[];
  emptyMessage: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.header} className={column.align === "right" ? "text-right" : undefined}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={getKey(row)}>
                    {columns.map((column) => (
                      <TableCell key={column.header} className={column.align === "right" ? "text-right" : undefined}>
                        {column.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
