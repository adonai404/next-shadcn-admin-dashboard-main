"use client";

import { create } from "zustand";

import { getLocalStorageValue, setLocalStorageValue } from "@/lib/local-storage.client";

import { isValidCnpjLength, normalizeCnpj } from "./cnpj";
import {
  bulkUpsertNotas,
  clearAllData,
  clearNotasByTipo,
  getAllEmpresas,
  getAllItens,
  getAllNotas,
  insertEmpresa,
} from "./db";
import type { DateRange } from "./reports";
import type { Empresa, ImportError, ImportResult, ItemNota, NotaFiscal, TipoNota } from "./types";
import { NfeParseError, parseNfeXml } from "./xml-parser";
import { expandFiles } from "./zip";

const EMPTY_RANGE: DateRange = { from: "", to: "" };
const CHUNK_SIZE = 250;
const ACTIVE_EMPRESA_STORAGE_KEY = "nfe-analysis:active-empresa";

type ImportProgress = {
  active: boolean;
  tipo: TipoNota | null;
  phase: "expanding" | "processing";
  processed: number;
  total: number;
};

const IDLE_PROGRESS: ImportProgress = { active: false, tipo: null, phase: "processing", processed: 0, total: 0 };

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

type CreateEmpresaResult = { ok: true } | { ok: false; error: string };

type NfeStoreState = {
  hydrated: boolean;
  notas: NotaFiscal[];
  itens: ItemNota[];
  empresas: Empresa[];
  activeEmpresaId: string | null;
  dateRange: DateRange;
  importProgress: ImportProgress;
  hydrate: () => Promise<void>;
  setDateRange: (range: DateRange) => void;
  createEmpresa: (nome: string, cnpj: string) => Promise<CreateEmpresaResult>;
  setActiveEmpresa: (id: string) => void;
  importFiles: (tipo: TipoNota, files: File[]) => Promise<ImportResult>;
  clearByTipo: (tipo: TipoNota) => Promise<void>;
  clearAll: () => Promise<void>;
};

export const useNfeStore = create<NfeStoreState>((set, get) => ({
  hydrated: false,
  notas: [],
  itens: [],
  empresas: [],
  activeEmpresaId: null,
  dateRange: EMPTY_RANGE,
  importProgress: IDLE_PROGRESS,

  hydrate: async () => {
    if (get().hydrated) return;
    const [notas, itens, empresas] = await Promise.all([getAllNotas(), getAllItens(), getAllEmpresas()]);
    const storedId = getLocalStorageValue(ACTIVE_EMPRESA_STORAGE_KEY);
    const activeEmpresaId = empresas.some((empresa) => empresa.id === storedId) ? storedId : (empresas[0]?.id ?? null);
    set({ notas, itens, empresas, activeEmpresaId, hydrated: true });
  },

  setDateRange: (range) => set({ dateRange: range }),

  createEmpresa: async (nome, cnpj) => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      return { ok: false, error: "Informe o nome da empresa." };
    }
    if (!isValidCnpjLength(cnpj)) {
      return { ok: false, error: "CNPJ inválido. Informe os 14 dígitos." };
    }

    const outcome = await insertEmpresa(nomeLimpo, normalizeCnpj(cnpj));
    if (!outcome.ok) {
      return { ok: false, error: outcome.error };
    }

    setLocalStorageValue(ACTIVE_EMPRESA_STORAGE_KEY, outcome.empresa.id);
    set((state) => ({ empresas: [...state.empresas, outcome.empresa], activeEmpresaId: outcome.empresa.id }));
    return { ok: true };
  },

  setActiveEmpresa: (id) => {
    if (!get().empresas.some((empresa) => empresa.id === id)) return;
    setLocalStorageValue(ACTIVE_EMPRESA_STORAGE_KEY, id);
    set({ activeEmpresaId: id });
  },

  importFiles: async (tipo, files) => {
    const empresaId = get().activeEmpresaId;
    if (!empresaId) {
      return {
        importadas: 0,
        atualizadas: 0,
        erros: [{ arquivo: "—", mensagem: "Crie ou selecione uma empresa antes de importar notas." }],
      };
    }

    set({ importProgress: { active: true, tipo, phase: "expanding", processed: 0, total: 0 } });

    const { files: expanded, errors: expandErrors } = await expandFiles(files);

    if (expanded.length === 0) {
      set({ importProgress: IDLE_PROGRESS });
      return {
        importadas: 0,
        atualizadas: 0,
        erros: expandErrors.length > 0 ? expandErrors : [{ arquivo: "—", mensagem: "Nenhum arquivo .xml encontrado." }],
      };
    }

    const total = expanded.length;
    set({ importProgress: { active: true, tipo, phase: "processing", processed: 0, total } });

    // Group existing itens by nota so the merge below stays O(n) instead of re-filtering
    // the full array on every processed file (which would be O(n^2) at 10k+ imports).
    const notasMap = new Map(get().notas.map((nota) => [nota.chave, nota]));
    const itensMap = new Map<string, ItemNota[]>();
    for (const item of get().itens) {
      const list = itensMap.get(item.chaveNota);
      if (list) list.push(item);
      else itensMap.set(item.chaveNota, [item]);
    }

    let importadas = 0;
    let atualizadas = 0;
    const erros: ImportError[] = [...expandErrors];
    let pendingWrites: { nota: NotaFiscal; itens: ItemNota[] }[] = [];

    for (let i = 0; i < expanded.length; i++) {
      const file = expanded[i];
      try {
        const { nota: core, itens: parsedItens } = parseNfeXml(file.content, file.name);

        if (tipo === "nfce" && core.mod !== "65") {
          throw new NfeParseError(
            `"${file.name}" é modelo ${core.mod} (NF-e), não NFC-e. Importe no card "NF Emitidas" ou "NF Recebidas".`,
          );
        }
        if (tipo !== "nfce" && core.mod !== "55") {
          throw new NfeParseError(`"${file.name}" é modelo 65 (NFC-e). Importe no card "NFC".`);
        }

        const nota: NotaFiscal = {
          ...core,
          tipo,
          empresaId,
          arquivoOrigem: file.name,
          importadoEm: new Date().toISOString(),
        };

        if (notasMap.has(nota.chave)) {
          atualizadas += 1;
        } else {
          importadas += 1;
        }

        notasMap.set(nota.chave, nota);
        itensMap.set(nota.chave, parsedItens);
        pendingWrites.push({ nota, itens: parsedItens });
      } catch (error) {
        erros.push({
          arquivo: file.name,
          mensagem: error instanceof Error ? error.message : `Erro desconhecido ao processar "${file.name}".`,
        });
      }

      const isLast = i === expanded.length - 1;
      if (pendingWrites.length >= CHUNK_SIZE || isLast) {
        if (pendingWrites.length > 0) {
          try {
            await bulkUpsertNotas(pendingWrites);
          } catch (error) {
            for (const entry of pendingWrites) {
              erros.push({
                arquivo: entry.nota.arquivoOrigem,
                mensagem: error instanceof Error ? `Falha ao salvar: ${error.message}` : "Falha ao salvar no banco.",
              });
              notasMap.delete(entry.nota.chave);
              itensMap.delete(entry.nota.chave);
              if (notasMap.has(entry.nota.chave)) atualizadas -= 1;
              else importadas -= 1;
            }
          }
          pendingWrites = [];
        }
        set({ importProgress: { active: true, tipo, phase: "processing", processed: i + 1, total } });
        await yieldToUi();
      }
    }

    set({
      notas: Array.from(notasMap.values()),
      itens: Array.from(itensMap.values()).flat(),
      importProgress: IDLE_PROGRESS,
    });

    return { importadas, atualizadas, erros };
  },

  clearByTipo: async (tipo) => {
    const empresaId = get().activeEmpresaId;
    if (!empresaId) return;

    await clearNotasByTipo(tipo, empresaId);
    set((state) => {
      const keysToRemove = new Set(
        state.notas.filter((nota) => nota.tipo === tipo && nota.empresaId === empresaId).map((nota) => nota.chave),
      );
      return {
        notas: state.notas.filter((nota) => !keysToRemove.has(nota.chave)),
        itens: state.itens.filter((item) => !keysToRemove.has(item.chaveNota)),
      };
    });
  },

  clearAll: async () => {
    await clearAllData();
    set({ notas: [], itens: [] });
  },
}));
