"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { formatBRL } from "../../reports/ranking-table";
import type { RecentNotaRow } from "./schema";

const TIPO_LABEL: Record<RecentNotaRow["tipo"], string> = {
  nfe_recebida: "NF Recebida",
  nfe_emitida: "NF Emitida",
  nfce: "NFC",
};

const TIPO_VARIANT: Record<RecentNotaRow["tipo"], "default" | "secondary" | "outline"> = {
  nfe_recebida: "secondary",
  nfe_emitida: "default",
  nfce: "outline",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export const recentNotesColumns: ColumnDef<RecentNotaRow>[] = [
  {
    accessorKey: "dhEmi",
    header: "Data",
    cell: ({ row }) => <span className="tabular-nums">{dateFormatter.format(new Date(row.original.dhEmi))}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => <Badge variant={TIPO_VARIANT[row.original.tipo]}>{TIPO_LABEL[row.original.tipo]}</Badge>,
  },
  {
    accessorKey: "numero",
    header: "Número",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.numero}/{row.original.serie}
      </span>
    ),
  },
  {
    accessorKey: "contraparte",
    header: "Contraparte",
    cell: ({ row }) => row.original.contraparte,
    enableHiding: false,
  },
  {
    accessorKey: "uf",
    header: "UF",
    cell: ({ row }) => row.original.uf || "—",
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => <span className="tabular-nums">{formatBRL(row.original.valor)}</span>,
    enableHiding: false,
  },
];
