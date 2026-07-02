"use client";

import { Building2 } from "lucide-react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { formatCnpj } from "../../_lib/cnpj";
import { useNfeStore } from "../../_lib/store";

export function CompanySwitcher({ className }: { className?: string }) {
  const empresas = useNfeStore((state) => state.empresas);
  const activeEmpresaId = useNfeStore((state) => state.activeEmpresaId);
  const setActiveEmpresa = useNfeStore((state) => state.setActiveEmpresa);

  if (empresas.length === 0) return null;

  return (
    <Select value={activeEmpresaId ?? ""} onValueChange={setActiveEmpresa}>
      <SelectTrigger size="sm" className={className ?? "w-56"}>
        <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Selecione uma empresa" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {empresas.map((empresa) => (
            <SelectItem key={empresa.id} value={empresa.id}>
              <span className="flex min-w-0 flex-col text-left">
                <span className="truncate">{empresa.nome}</span>
                <span className="text-muted-foreground text-xs tabular-nums">{formatCnpj(empresa.cnpj)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
