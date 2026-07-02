"use client";

import Link from "next/link";

import { Bar, BarChart, CartesianGrid, Label, LabelList, Pie, PieChart, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import type { FornecedorRow, UfRow } from "../../_lib/reports";
import { formatBRL } from "../reports/ranking-table";

const UF_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function buildUfChartConfig(rows: UfRow[]): ChartConfig {
  const config: ChartConfig = { totalValor: { label: "Valor" } };
  rows.forEach((row, index) => {
    config[row.uf] = { label: row.uf, color: UF_COLORS[index % UF_COLORS.length] };
  });
  return config;
}

const suppliersChartConfig = {
  totalValor: { label: "Valor", color: "var(--chart-1)" },
  label: { color: "var(--primary-foreground)" },
} satisfies ChartConfig;

export function InsightCards({
  ufFornecedores,
  topFornecedores,
}: {
  ufFornecedores: UfRow[];
  topFornecedores: FornecedorRow[];
}) {
  const chartConfig = buildUfChartConfig(ufFornecedores);
  const chartData = ufFornecedores.map((row) => ({ ...row, fill: chartConfig[row.uf]?.color }));
  const totalComprado = ufFornecedores.reduce((sum, row) => sum + row.totalValor, 0);
  const topSeis = topFornecedores.slice(0, 6);

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-5">
      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Compras por UF</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          {ufFornecedores.length === 0 ? (
            <p className="w-full py-10 text-center text-muted-foreground text-sm">Sem compras no período.</p>
          ) : (
            <>
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-48 flex-1">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={chartData}
                    dataKey="totalValor"
                    nameKey="uf"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={2}
                    cornerRadius={4}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground font-bold text-lg tabular-nums"
                              >
                                {formatBRL(totalComprado)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                Total comprado
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              <ul className="flex flex-col gap-3">
                {ufFornecedores.slice(0, 5).map((row) => (
                  <li key={row.uf} className="flex w-36 items-center justify-between">
                    <span className="flex items-center gap-2 text-xs">
                      <span className="size-2.5 rounded-full" style={{ background: chartConfig[row.uf]?.color }} />
                      {row.uf}
                    </span>
                    <span className="text-xs tabular-nums">{formatBRL(row.totalValor)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href="/dashboard/nfe-analysis/uf">Ver relatório completo por UF</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card className="col-span-1 xl:col-span-3">
        <CardHeader>
          <CardTitle>Principais Fornecedores</CardTitle>
        </CardHeader>
        <CardContent className="size-full max-h-52">
          {topSeis.length === 0 ? (
            <p className="flex h-full items-center justify-center text-center text-muted-foreground text-sm">
              Nenhum fornecedor no período.
            </p>
          ) : (
            <ChartContainer config={suppliersChartConfig} className="size-full">
              <BarChart accessibilityLayer data={topSeis} layout="vertical">
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="xNome" type="category" tickLine={false} tickMargin={10} axisLine={false} hide />
                <XAxis dataKey="totalValor" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Bar dataKey="totalValor" fill="var(--color-totalValor)" radius={[0, 6, 6, 0]}>
                  <LabelList
                    dataKey="xNome"
                    position="insideLeft"
                    offset={8}
                    className="fill-primary-foreground text-xs"
                  />
                  <LabelList
                    dataKey="totalValor"
                    position="insideRight"
                    offset={8}
                    className="fill-primary-foreground text-xs tabular-nums"
                    formatter={(value) => (typeof value === "number" ? formatBRL(value) : value)}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xs">{topFornecedores.length} fornecedor(es) no período.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
