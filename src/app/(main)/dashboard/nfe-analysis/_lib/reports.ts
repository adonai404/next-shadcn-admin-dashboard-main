import type { ItemNota, NotaFiscal, TipoNota } from "./types";

export type DateRange = {
  from: string;
  to: string;
};

export type FornecedorRow = {
  cnpj: string;
  xNome: string;
  uf: string;
  totalNotas: number;
  totalValor: number;
};

export type ClienteRow = {
  documento: string;
  xNome: string;
  uf: string;
  totalNotas: number;
  totalValor: number;
};

export type ProdutoRow = {
  chave: string;
  cProd: string;
  xProd: string;
  ncm: string;
  totalQtd: number;
  totalValor: number;
};

export type UfRow = {
  uf: string;
  totalNotas: number;
  totalValor: number;
};

export type ResumoValores = {
  totalComprado: number;
  totalVendido: number;
  qtdNotasCompra: number;
  qtdNotasVenda: number;
  ticketMedioCompra: number;
  ticketMedioVenda: number;
};

export type ImpostosResumo = {
  vICMS: number;
  vPIS: number;
  vCOFINS: number;
  vIBS: number;
  vCBS: number;
};

export type EvolucaoMensalPonto = {
  mes: string;
  compras: number;
  vendas: number;
};

export type NotaPorTipoRow = {
  tipo: TipoNota;
  label: string;
  count: number;
};

const VENDA_TIPOS: TipoNota[] = ["nfe_emitida", "nfce"];

function isVenda(tipo: TipoNota): boolean {
  return VENDA_TIPOS.includes(tipo);
}

export function isWithinRange(dhEmi: string, range: DateRange): boolean {
  const date = dhEmi.slice(0, 10);
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
}

export function filterNotasByRange(notas: NotaFiscal[], range: DateRange): NotaFiscal[] {
  if (!range.from && !range.to) return notas;
  return notas.filter((nota) => isWithinRange(nota.dhEmi, range));
}

export function getResumoValores(notas: NotaFiscal[]): ResumoValores {
  const compras = notas.filter((nota) => nota.tipo === "nfe_recebida");
  const vendas = notas.filter((nota) => isVenda(nota.tipo));
  const totalComprado = compras.reduce((sum, nota) => sum + nota.valores.vNF, 0);
  const totalVendido = vendas.reduce((sum, nota) => sum + nota.valores.vNF, 0);

  return {
    totalComprado,
    totalVendido,
    qtdNotasCompra: compras.length,
    qtdNotasVenda: vendas.length,
    ticketMedioCompra: compras.length > 0 ? totalComprado / compras.length : 0,
    ticketMedioVenda: vendas.length > 0 ? totalVendido / vendas.length : 0,
  };
}

export function getImpostosResumo(notas: NotaFiscal[]): ImpostosResumo {
  return notas.reduce<ImpostosResumo>(
    (acc, nota) => ({
      vICMS: acc.vICMS + nota.valores.vICMS,
      vPIS: acc.vPIS + nota.valores.vPIS,
      vCOFINS: acc.vCOFINS + nota.valores.vCOFINS,
      vIBS: acc.vIBS + (nota.valores.vIBS ?? 0),
      vCBS: acc.vCBS + (nota.valores.vCBS ?? 0),
    }),
    { vICMS: 0, vPIS: 0, vCOFINS: 0, vIBS: 0, vCBS: 0 },
  );
}

export function getFornecedoresRanking(notas: NotaFiscal[]): FornecedorRow[] {
  const map = new Map<string, FornecedorRow>();

  for (const nota of notas) {
    if (nota.tipo !== "nfe_recebida") continue;

    const key = nota.emitente.cnpj;
    const existing = map.get(key);
    if (existing) {
      existing.totalNotas += 1;
      existing.totalValor += nota.valores.vNF;
    } else {
      map.set(key, {
        cnpj: key,
        xNome: nota.emitente.xNome,
        uf: nota.emitente.uf,
        totalNotas: 1,
        totalValor: nota.valores.vNF,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalValor - a.totalValor);
}

const CONSUMIDOR_FINAL_KEY = "CONSUMIDOR_FINAL";

export function getClientesRanking(notas: NotaFiscal[]): ClienteRow[] {
  const map = new Map<string, ClienteRow>();

  for (const nota of notas) {
    if (!isVenda(nota.tipo)) continue;

    const dest = nota.destinatario;
    const key = dest?.documento ?? CONSUMIDOR_FINAL_KEY;
    const existing = map.get(key);
    if (existing) {
      existing.totalNotas += 1;
      existing.totalValor += nota.valores.vNF;
    } else {
      map.set(key, {
        documento: dest?.documento ?? "",
        xNome: dest?.xNome ?? "Consumidor final (não identificado)",
        uf: dest?.uf ?? "",
        totalNotas: 1,
        totalValor: nota.valores.vNF,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalValor - a.totalValor);
}

function buildProdutoRanking(
  itens: ItemNota[],
  notasByChave: Map<string, NotaFiscal>,
  allow: (tipo: TipoNota) => boolean,
): ProdutoRow[] {
  const map = new Map<string, ProdutoRow>();

  for (const item of itens) {
    const nota = notasByChave.get(item.chaveNota);
    if (!nota || !allow(nota.tipo)) continue;

    const key = `${item.cProd}|${item.xProd}`;
    const existing = map.get(key);
    const valorLiquido = item.vProd - item.vDesc;
    if (existing) {
      existing.totalQtd += item.qCom;
      existing.totalValor += valorLiquido;
    } else {
      map.set(key, {
        chave: key,
        cProd: item.cProd,
        xProd: item.xProd,
        ncm: item.ncm,
        totalQtd: item.qCom,
        totalValor: valorLiquido,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalValor - a.totalValor);
}

export function getProdutosVendidos(itens: ItemNota[], notas: NotaFiscal[]): ProdutoRow[] {
  const notasByChave = new Map(notas.map((nota) => [nota.chave, nota]));
  return buildProdutoRanking(itens, notasByChave, isVenda);
}

export function getProdutosComprados(itens: ItemNota[], notas: NotaFiscal[]): ProdutoRow[] {
  const notasByChave = new Map(notas.map((nota) => [nota.chave, nota]));
  return buildProdutoRanking(itens, notasByChave, (tipo) => tipo === "nfe_recebida");
}

export function getUfFornecedores(notas: NotaFiscal[]): UfRow[] {
  const map = new Map<string, UfRow>();

  for (const nota of notas) {
    if (nota.tipo !== "nfe_recebida") continue;

    const uf = nota.emitente.uf || "—";
    const existing = map.get(uf);
    if (existing) {
      existing.totalNotas += 1;
      existing.totalValor += nota.valores.vNF;
    } else {
      map.set(uf, { uf, totalNotas: 1, totalValor: nota.valores.vNF });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalValor - a.totalValor);
}

export function getUfClientes(notas: NotaFiscal[]): UfRow[] {
  const map = new Map<string, UfRow>();

  for (const nota of notas) {
    if (!isVenda(nota.tipo)) continue;

    const uf = nota.destinatario?.uf;
    if (!uf) continue;

    const existing = map.get(uf);
    if (existing) {
      existing.totalNotas += 1;
      existing.totalValor += nota.valores.vNF;
    } else {
      map.set(uf, { uf, totalNotas: 1, totalValor: nota.valores.vNF });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalValor - a.totalValor);
}

export function getEvolucaoMensal(notas: NotaFiscal[]): EvolucaoMensalPonto[] {
  const map = new Map<string, EvolucaoMensalPonto>();

  for (const nota of notas) {
    const mes = nota.dhEmi.slice(0, 7);
    const existing = map.get(mes) ?? { mes, compras: 0, vendas: 0 };
    if (nota.tipo === "nfe_recebida") {
      existing.compras += nota.valores.vNF;
    } else {
      existing.vendas += nota.valores.vNF;
    }
    map.set(mes, existing);
  }

  return Array.from(map.values()).sort((a, b) => a.mes.localeCompare(b.mes));
}

const TIPO_LABEL: Record<TipoNota, string> = {
  nfe_recebida: "NF Recebidas",
  nfe_emitida: "NF Emitidas",
  nfce: "NFC",
};

export function getNotasPorTipo(notas: NotaFiscal[]): NotaPorTipoRow[] {
  const counts: Record<TipoNota, number> = { nfe_recebida: 0, nfe_emitida: 0, nfce: 0 };
  for (const nota of notas) {
    counts[nota.tipo] += 1;
  }
  return (Object.keys(TIPO_LABEL) as TipoNota[]).map((tipo) => ({
    tipo,
    label: TIPO_LABEL[tipo],
    count: counts[tipo],
  }));
}

export function getUltimasNotas(notas: NotaFiscal[], limit: number): NotaFiscal[] {
  return [...notas].sort((a, b) => b.dhEmi.localeCompare(a.dhEmi)).slice(0, limit);
}
