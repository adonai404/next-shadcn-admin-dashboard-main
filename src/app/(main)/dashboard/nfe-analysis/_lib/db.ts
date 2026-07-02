import { createClient } from "@/lib/supabase/client";

import type { Empresa, ItemNota, NotaFiscal, TipoNota } from "./types";

const NOTAS_TABLE = "notas";
const ITENS_TABLE = "itens";
const EMPRESAS_TABLE = "empresas";

const UNIQUE_VIOLATION = "23505";

type EmpresaRow = {
  id: string;
  nome: string;
  cnpj: string;
  criado_em: string;
};

type NotaRow = {
  chave: string;
  empresa_id: string;
  tipo: TipoNota;
  mod: "55" | "65";
  numero: string;
  serie: string;
  dh_emi: string;
  nat_op: string;
  emitente: NotaFiscal["emitente"];
  destinatario: NotaFiscal["destinatario"] | null;
  valores: NotaFiscal["valores"];
  pagamentos: NotaFiscal["pagamentos"];
  arquivo_origem: string;
  importado_em: string;
};

type ItemRow = {
  id: string;
  nota_chave: string;
  c_prod: string;
  x_prod: string;
  ncm: string;
  cfop: string;
  u_com: string;
  q_com: number;
  v_un_com: number;
  v_prod: number;
  v_desc: number;
  impostos: ItemNota["impostos"];
};

function empresaFromRow(row: EmpresaRow): Empresa {
  return { id: row.id, nome: row.nome, cnpj: row.cnpj, criadoEm: row.criado_em };
}

function notaFromRow(row: NotaRow): NotaFiscal {
  return {
    chave: row.chave,
    empresaId: row.empresa_id,
    tipo: row.tipo,
    mod: row.mod,
    numero: row.numero,
    serie: row.serie,
    dhEmi: row.dh_emi,
    natOp: row.nat_op,
    emitente: row.emitente,
    destinatario: row.destinatario ?? undefined,
    valores: row.valores,
    pagamentos: row.pagamentos,
    arquivoOrigem: row.arquivo_origem,
    importadoEm: row.importado_em,
  };
}

function notaToRow(nota: NotaFiscal): Omit<NotaRow, "importado_em"> & { importado_em?: string } {
  return {
    chave: nota.chave,
    empresa_id: nota.empresaId,
    tipo: nota.tipo,
    mod: nota.mod,
    numero: nota.numero,
    serie: nota.serie,
    dh_emi: nota.dhEmi,
    nat_op: nota.natOp,
    emitente: nota.emitente,
    destinatario: nota.destinatario ?? null,
    valores: nota.valores,
    pagamentos: nota.pagamentos,
    arquivo_origem: nota.arquivoOrigem,
    importado_em: nota.importadoEm,
  };
}

function itemFromRow(row: ItemRow): ItemNota {
  return {
    id: row.id,
    chaveNota: row.nota_chave,
    cProd: row.c_prod,
    xProd: row.x_prod,
    ncm: row.ncm,
    cfop: row.cfop,
    uCom: row.u_com,
    qCom: Number(row.q_com),
    vUnCom: Number(row.v_un_com),
    vProd: Number(row.v_prod),
    vDesc: Number(row.v_desc),
    impostos: row.impostos,
  };
}

function itemToRow(item: ItemNota): ItemRow {
  return {
    id: item.id,
    nota_chave: item.chaveNota,
    c_prod: item.cProd,
    x_prod: item.xProd,
    ncm: item.ncm,
    cfop: item.cfop,
    u_com: item.uCom,
    q_com: item.qCom,
    v_un_com: item.vUnCom,
    v_prod: item.vProd,
    v_desc: item.vDesc,
    impostos: item.impostos,
  };
}

export async function getAllEmpresas(): Promise<Empresa[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from(EMPRESAS_TABLE).select("*").order("criado_em", { ascending: true });
  if (error) throw error;
  return (data as EmpresaRow[]).map(empresaFromRow);
}

export type CreateEmpresaOutcome = { ok: true; empresa: Empresa } | { ok: false; error: string };

export async function insertEmpresa(nome: string, cnpj: string): Promise<CreateEmpresaOutcome> {
  const supabase = createClient();
  const { data, error } = await supabase.from(EMPRESAS_TABLE).insert({ nome, cnpj }).select("*").single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { ok: false, error: "Já existe uma empresa cadastrada com esse CNPJ." };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, empresa: empresaFromRow(data as EmpresaRow) };
}

export async function getAllNotas(): Promise<NotaFiscal[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from(NOTAS_TABLE).select("*");
  if (error) throw error;
  return (data as NotaRow[]).map(notaFromRow);
}

export async function getAllItens(): Promise<ItemNota[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from(ITENS_TABLE).select("*");
  if (error) throw error;
  return (data as ItemRow[]).map(itemFromRow);
}

export async function bulkUpsertNotas(entries: { nota: NotaFiscal; itens: ItemNota[] }[]): Promise<void> {
  if (entries.length === 0) return;

  const supabase = createClient();

  const notaRows = entries.map((entry) => notaToRow(entry.nota));
  const { error: notasError } = await supabase.from(NOTAS_TABLE).upsert(notaRows, { onConflict: "chave" });
  if (notasError) throw notasError;

  const chaves = entries.map((entry) => entry.nota.chave);
  const { error: deleteError } = await supabase.from(ITENS_TABLE).delete().in("nota_chave", chaves);
  if (deleteError) throw deleteError;

  const itemRows = entries.flatMap((entry) => entry.itens.map(itemToRow));
  if (itemRows.length > 0) {
    const { error: itensError } = await supabase.from(ITENS_TABLE).insert(itemRows);
    if (itensError) throw itensError;
  }
}

export async function clearNotasByTipo(tipo: TipoNota, empresaId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from(NOTAS_TABLE).delete().eq("tipo", tipo).eq("empresa_id", empresaId);
  if (error) throw error;
}

export async function clearAllData(): Promise<void> {
  const supabase = createClient();
  // RLS already restricts deletes to rows owned by the current user; the filter
  // below is only present because PostgREST requires an explicit WHERE clause.
  const { error } = await supabase.from(NOTAS_TABLE).delete().not("chave", "is", null);
  if (error) throw error;
}
