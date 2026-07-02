"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { Funnel, FunnelChart, LabelList } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";

import type { NotaPorTipoRow, UfRow } from "../../_lib/reports";
import type { NotaFiscal, TipoNota } from "../../_lib/types";
import { formatBRL } from "../reports/ranking-table";

const funnelChartConfig = {
  value: { label: "Notas", color: "var(--chart-1)" },
} satisfies ChartConfig;

const TIPO_BADGE_VARIANT: Record<TipoNota, "default" | "secondary" | "outline"> = {
  nfe_recebida: "secondary",
  nfe_emitida: "default",
  nfce: "outline",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

function formatContraparte(nota: NotaFiscal): string {
  if (nota.tipo === "nfe_recebida") return nota.emitente.xNome;
  return nota.destinatario?.xNome ?? "Consumidor final";
}

export function OperationalCards({
  notasPorTipo,
  ufClientes,
  ultimasNotas,
}: {
  notasPorTipo: NotaPorTipoRow[];
  ufClientes: UfRow[];
  ultimasNotas: NotaFiscal[];
}) {
  const funnelData = notasPorTipo
    .filter((row) => row.count > 0)
    .map((row, index) => ({
      stage: row.label,
      value: row.count,
      fill: `var(--chart-${index + 1})`,
    }));

  const totalVendasUf = ufClientes.reduce((sum, row) => sum + row.totalValor, 0);
  const totalNotas = notasPorTipo.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Notas por Tipo</CardTitle>
        </CardHeader>
        <CardContent className="size-full">
          {funnelData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-center text-muted-foreground text-sm">
              Sem notas no período.
            </p>
          ) : (
            <ChartContainer config={funnelChartConfig} className="size-full">
              <FunnelChart margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <Funnel className="stroke-2 stroke-card" dataKey="value" data={funnelData}>
                  <LabelList className="fill-foreground stroke-0" dataKey="stage" position="right" offset={10} />
                  <LabelList className="fill-foreground stroke-0" dataKey="value" position="left" offset={10} />
                </Funnel>
              </FunnelChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xs">{totalNotas} nota(s) importada(s) no período.</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendas por UF</CardTitle>
          <CardDescription className="font-medium tabular-nums">{formatBRL(totalVendasUf)}</CardDescription>
        </CardHeader>
        <CardContent>
          {ufClientes.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground text-sm">Sem vendas com UF identificada.</p>
          ) : (
            <div className="space-y-2.5">
              {ufClientes.slice(0, 5).map((row) => {
                const percentage = totalVendasUf > 0 ? (row.totalValor / totalVendasUf) * 100 : 0;
                return (
                  <div key={row.uf} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{row.uf}</span>
                      <span className="font-semibold text-sm tabular-nums">{formatBRL(row.totalValor)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} />
                      <span className="font-medium text-muted-foreground text-xs tabular-nums">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <span className="text-muted-foreground text-xs">{ufClientes.length} estado(s) atendido(s).</span>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {ultimasNotas.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground text-sm">Nenhuma nota no período.</p>
          ) : (
            <ul className="space-y-2.5">
              {ultimasNotas.map((nota) => (
                <li key={nota.chave} className="space-y-2 rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate font-medium text-sm">{formatContraparte(nota)}</span>
                    <Badge variant={TIPO_BADGE_VARIANT[nota.tipo]}>{nota.numero}</Badge>
                  </div>
                  <div className="font-medium text-muted-foreground text-xs">{formatBRL(nota.valores.vNF)}</div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="size-3 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground text-xs">
                      {dateFormatter.format(new Date(nota.dhEmi))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
