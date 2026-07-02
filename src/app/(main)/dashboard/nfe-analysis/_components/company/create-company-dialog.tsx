"use client";

import { useState } from "react";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useNfeStore } from "../../_lib/store";

export function CreateCompanyDialog({ variant = "outline" }: { variant?: "default" | "outline" }) {
  const createEmpresa = useNfeStore((state) => state.createEmpresa);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);
    const result = await createEmpresa(nome, cnpj);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success(`Empresa "${nome.trim()}" criada e selecionada.`);
    setNome("");
    setCnpj("");
    setError(null);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant={variant}>
          <Plus data-icon="inline-start" />
          Nova empresa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova empresa</DialogTitle>
          <DialogDescription>
            As notas importadas ficam vinculadas à empresa selecionada, separando os dados de cada uma.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="empresa-nome">Nome</Label>
            <Input
              id="empresa-nome"
              placeholder="Minha Empresa LTDA"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="empresa-cnpj">CNPJ</Label>
            <Input
              id="empresa-cnpj"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(event) => setCnpj(event.target.value)}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => void handleCreate()} disabled={saving}>
            Criar empresa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
