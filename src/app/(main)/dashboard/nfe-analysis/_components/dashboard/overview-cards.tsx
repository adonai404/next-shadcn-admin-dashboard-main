"use client";

import { BadgeDollarSign, Wallet } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import type { EvolucaoMensalPonto, ImpostosResumo, ResumoValores } from "../../_lib/reports";
import { formatBRL } from "../reports/ranking-table";
import { computeGrowthPct, formatGrowthLabel } from "./dashboard-utils";

const comprasChartConfig = {
  compras: { label: "Compras", color: "var(--chart-4)" },
} satisfies ChartConfig;

const vendasChartConfig = {
  vendas: { label: "Vendas", color: "var(--chart-2)" },
} satisfies ChartConfig;

const saldoChartConfig = {
  saldo: { label: "Saldo", color: "var(--chart-1)" },
} satisfies ChartConfig;

function growthClassName(pct: number | null): string {
  if (pct === null) return "text-muted-foreground";
  return pct >= 0 ? "text-green-500" : "text-destructive";
}

export function OverviewCards({
  resumo,
  impostos,
  evolucaoMensal,
}: {
  resumo: ResumoValores;
  impostos: ImpostosResumo;
  evolucaoMensal: EvolucaoMensalPonto[];
}) {
  const last = evolucaoMensal.at(-1);
  const prev = evolucaoMensal.at(-2);
  const comprasGrowth = last && prev ? computeGrowthPct(last.compras, prev.compras) : null;
  const vendasGrowth = last && prev ? computeGrowthPct(last.vendas, prev.vendas) : null;

  const saldoData = evolucaoMensal.map((ponto) => ({ mes: ponto.mes, saldo: ponto.vendas - ponto.compras }));
  const totalImpostos = impostos.vICMS + impostos.vPIS + impostos.vCOFINS + impostos.vIBS + impostos.vCBS;
  const impostosPctReceita = resumo.totalVendido > 0 ? (totalImpostos / resumo.totalVendido) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader>
          <CardTitle>Compras</CardTitle>
          <CardDescription>Evolução mensal</CardDescription>
        </CardHeader>
        <CardContent className="size-full">
          <ChartContainer className="size-full min-h-24" config={comprasChartConfig}>
            <BarChart accessibilityLayer data={evolucaoMensal} barSize={8}>
              <XAxis dataKey="mes" tickLine={false} tickMargin={10} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="compras" fill="var(--color-compras)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="font-semibold text-xl tabular-nums">{resumo.qtdNotasCompra}</span>
          <span className={`font-medium text-sm ${growthClassName(comprasGrowth)}`}>
            {formatGrowthLabel(comprasGrowth)}
          </span>
        </CardFooter>
      </Card>

      <Card className="overflow-hidden pb-0">
        <CardHeader>
          <CardTitle>Vendas</CardTitle>
          <CardDescription>NF Emitidas + NFC</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ChartContainer className="size-full min-h-24" config={vendasChartConfig}>
            <AreaChart data={evolucaoMensal} margin={{ left: 0, right: 0, top: 5 }}>
              <XAxis dataKey="mes" tickLine={false} tickMargin={10} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
              <Area
                dataKey="vendas"
                fill="var(--color-vendas)"
                fillOpacity={0.05}
                stroke="var(--color-vendas)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="w-fit rounded-lg bg-green-500/10 p-2">
            <Wallet className="size-5 text-green-500" />
          </div>
        </CardHeader>
        <CardContent className="flex size-full flex-col justify-between">
          <div className="space-y-1.5">
            <CardTitle>Total Vendido</CardTitle>
            <CardDescription>Período selecionado</CardDescription>
          </div>
          <p className="font-medium text-2xl tabular-nums">{formatBRL(resumo.totalVendido)}</p>
          <div
            className={`w-fit rounded-md px-2 py-1 font-medium text-xs ${
              vendasGrowth !== null && vendasGrowth < 0
                ? "bg-destructive/10 text-destructive"
                : "bg-green-500/10 text-green-500"
            }`}
          >
            {formatGrowthLabel(vendasGrowth)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="w-fit rounded-lg bg-destructive/10 p-2">
            <BadgeDollarSign className="size-5 text-destructive" />
          </div>
        </CardHeader>
        <CardContent className="flex size-full flex-col justify-between">
          <div className="space-y-1.5">
            <CardTitle>Total de Impostos</CardTitle>
            <CardDescription>ICMS + PIS + COFINS + IBS/CBS</CardDescription>
          </div>
          <p className="font-medium text-2xl tabular-nums">{formatBRL(totalImpostos)}</p>
          <div className="w-fit rounded-md bg-destructive/10 px-2 py-1 font-medium text-destructive text-xs">
            {impostosPctReceita.toFixed(1)}% da receita
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Saldo do Período</CardTitle>
          <CardDescription>Vendas − compras, por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={saldoChartConfig} className="h-24 w-full">
            <LineChart data={saldoData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="mes" tickLine={false} tickMargin={10} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" strokeWidth={2} dataKey="saldo" stroke="var(--color-saldo)" activeDot={{ r: 6 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-sm">
            Ticket médio: {formatBRL(resumo.ticketMedioCompra)} na compra · {formatBRL(resumo.ticketMedioVenda)} na
            venda
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
