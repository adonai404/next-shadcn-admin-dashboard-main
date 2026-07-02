"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useNfeStore } from "../../_lib/store";
import { CompanySwitcher } from "./company-switcher";
import { CreateCompanyDialog } from "./create-company-dialog";

export function CompanySelectorCard() {
  const empresas = useNfeStore((state) => state.empresas);
  const activeEmpresaId = useNfeStore((state) => state.activeEmpresaId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresa</CardTitle>
        <CardDescription>
          As notas importadas ficam vinculadas à empresa selecionada. Crie uma empresa ou selecione uma existente para
          liberar a importação.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <CompanySwitcher />
        <CreateCompanyDialog variant={empresas.length === 0 ? "default" : "outline"} />
        {!activeEmpresaId && (
          <p className="w-full text-amber-600 text-xs dark:text-amber-400">
            Nenhuma empresa selecionada — a importação está bloqueada.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
