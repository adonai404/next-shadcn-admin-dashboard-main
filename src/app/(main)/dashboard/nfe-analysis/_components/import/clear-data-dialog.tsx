"use client";

import { useState } from "react";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useNfeStore } from "../../_lib/store";
import type { TipoNota } from "../../_lib/types";

export function ClearDataDialog({ tipo, label, disabled }: { tipo: TipoNota; label: string; disabled?: boolean }) {
  const clearByTipo = useNfeStore((state) => state.clearByTipo);
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" disabled={disabled} aria-label={`Limpar notas de ${label}`}>
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover notas de {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso apaga permanentemente todas as notas e itens importados nesta categoria. Essa ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await clearByTipo(tipo);
              toast.success(`Notas de ${label} removidas.`);
            }}
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
