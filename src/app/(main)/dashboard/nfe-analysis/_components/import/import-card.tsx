"use client";

import { useId, useState } from "react";

import { AlertCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { useNfeStore } from "../../_lib/store";
import type { ImportError, TipoNota } from "../../_lib/types";
import { ClearDataDialog } from "./clear-data-dialog";

const TIPO_META: Record<TipoNota, { title: string; description: string }> = {
  nfe_recebida: {
    title: "NF Recebidas",
    description: "Notas modelo 55 em que sua empresa é a destinatária (compras).",
  },
  nfe_emitida: {
    title: "NF Emitidas",
    description: "Notas modelo 55 em que sua empresa é a emitente (vendas).",
  },
  nfce: {
    title: "NFC",
    description: "Cupons fiscais modelo 65 (consumidor final).",
  },
};

const MAX_ERROS_EXIBIDOS = 50;

export function ImportCard({ tipo }: { tipo: TipoNota }) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [erros, setErros] = useState<ImportError[]>([]);

  const notas = useNfeStore((state) => state.notas);
  const itens = useNfeStore((state) => state.itens);
  const activeEmpresaId = useNfeStore((state) => state.activeEmpresaId);
  const importFiles = useNfeStore((state) => state.importFiles);
  const importProgress = useNfeStore((state) => state.importProgress);

  const meta = TIPO_META[tipo];
  const notasDoTipo = notas.filter((nota) => nota.tipo === tipo && nota.empresaId === activeEmpresaId);
  const chavesDoTipo = new Set(notasDoTipo.map((nota) => nota.chave));
  const itensDoTipo = itens.filter((item) => chavesDoTipo.has(item.chaveNota));

  const isProcessingThisCard = importProgress.active && importProgress.tipo === tipo;
  const isImportBlocked = !activeEmpresaId;

  async function processFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const acceptedFiles = Array.from(fileList).filter((file) => {
      const lower = file.name.toLowerCase();
      return lower.endsWith(".xml") || lower.endsWith(".zip");
    });
    if (acceptedFiles.length === 0) {
      toast.error("Selecione arquivos .xml ou .zip.");
      return;
    }

    setErros([]);
    const result = await importFiles(tipo, acceptedFiles);
    setErros(result.erros);

    if (result.importadas > 0 || result.atualizadas > 0) {
      toast.success(`${meta.title}: ${result.importadas} nota(s) nova(s), ${result.atualizadas} atualizada(s).`);
    }
    if (result.erros.length > 0) {
      toast.error(`${meta.title}: ${result.erros.length} arquivo(s) com erro. Veja os detalhes no card.`);
    }
  }

  let dropArea: React.ReactNode;
  if (isImportBlocked) {
    dropArea = (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center">
        <UploadCloud className="size-6 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">Crie ou selecione uma empresa para importar notas.</p>
      </div>
    );
  } else if (isProcessingThisCard) {
    dropArea = (
      <div className="flex flex-col gap-3 rounded-xl border border-dashed p-6">
        {importProgress.phase === "expanding" ? (
          <p className="text-center text-muted-foreground text-sm">Lendo arquivo(s)…</p>
        ) : (
          <>
            <Progress value={importProgress.total > 0 ? (importProgress.processed / importProgress.total) * 100 : 0} />
            <p className="text-center text-muted-foreground text-xs tabular-nums">
              Processando {importProgress.processed} de {importProgress.total} nota(s)…
            </p>
          </>
        )}
      </div>
    );
  } else {
    dropArea = (
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void processFiles(event.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
        }`}
      >
        <UploadCloud className="size-6 text-muted-foreground" />
        <p className="text-sm">
          Arraste arquivos .xml ou .zip aqui ou <span className="text-primary underline">clique para selecionar</span>
        </p>
        <input
          id={inputId}
          type="file"
          accept=".xml,.zip,text/xml,application/xml,application/zip,application/x-zip-compressed"
          multiple
          className="hidden"
          onChange={(event) => {
            void processFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1.5">
          <CardTitle>{meta.title}</CardTitle>
          <CardDescription>{meta.description}</CardDescription>
        </div>
        <ClearDataDialog tipo={tipo} label={meta.title} disabled={notasDoTipo.length === 0} />
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-6">
          <div>
            <div className="font-medium text-2xl tracking-tight">{notasDoTipo.length}</div>
            <p className="text-muted-foreground text-xs">notas</p>
          </div>
          <div>
            <div className="font-medium text-2xl tracking-tight">{itensDoTipo.length}</div>
            <p className="text-muted-foreground text-xs">itens</p>
          </div>
        </div>

        {dropArea}

        {erros.length > 0 && (
          <AttachmentGroup className="flex-col overflow-visible">
            {erros.slice(0, MAX_ERROS_EXIBIDOS).map((erro) => (
              <Attachment key={`${erro.arquivo}-${erro.mensagem}`} state="error" className="w-full">
                <AttachmentMedia>
                  <AlertCircle className="text-destructive" />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{erro.arquivo}</AttachmentTitle>
                  <AttachmentDescription>{erro.mensagem}</AttachmentDescription>
                </AttachmentContent>
              </Attachment>
            ))}
            {erros.length > MAX_ERROS_EXIBIDOS && (
              <p className="text-center text-muted-foreground text-xs">
                + {erros.length - MAX_ERROS_EXIBIDOS} erro(s) não exibido(s).
              </p>
            )}
          </AttachmentGroup>
        )}
      </CardContent>
    </Card>
  );
}
