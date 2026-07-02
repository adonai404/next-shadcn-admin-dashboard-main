import type { ZodError } from "zod";

import { itemNotaSchema, notaFiscalCoreSchema } from "./schema";
import type { ItemNota, NotaFiscalCore, ParsedNfe } from "./types";

export class NfeParseError extends Error {}

function text(el: Element | null | undefined, tag: string): string | undefined {
  const value = el?.getElementsByTagName(tag)[0]?.textContent?.trim();
  return value ? value : undefined;
}

function num(el: Element | null | undefined, tag: string): number | undefined {
  const raw = text(el, tag);
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function describeZodError(error: ZodError): string {
  return error.issues.map((issue) => issue.path.join(".") || "raiz").join(", ");
}

export function parseNfeXml(xmlText: string, fileName: string): ParsedNfe {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");

  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new NfeParseError(`"${fileName}" não é um XML válido.`);
  }

  const infNFe = doc.getElementsByTagName("infNFe")[0];
  if (!infNFe) {
    throw new NfeParseError(`"${fileName}" não parece ser um XML de NF-e/NFC-e (tag infNFe não encontrada).`);
  }

  const ide = infNFe.getElementsByTagName("ide")[0];
  const emit = infNFe.getElementsByTagName("emit")[0];
  const dest = infNFe.getElementsByTagName("dest")[0];
  const total = infNFe.getElementsByTagName("ICMSTot")[0];
  const detNodes = Array.from(infNFe.getElementsByTagName("det"));

  const mod = text(ide, "mod");
  const idAttr = infNFe.getAttribute("Id") ?? infNFe.getAttribute("id") ?? "";
  const chave = (doc.getElementsByTagName("chNFe")[0]?.textContent?.trim() || idAttr.replace(/^NFe/i, "")).trim();

  const enderEmit = emit?.getElementsByTagName("enderEmit")[0];
  const enderDest = dest?.getElementsByTagName("enderDest")[0];
  const destDocumento = dest ? (text(dest, "CNPJ") ?? text(dest, "CPF")) : undefined;

  const rawNota = {
    chave,
    mod,
    numero: text(ide, "nNF") ?? "",
    serie: text(ide, "serie") ?? "",
    dhEmi: text(ide, "dhEmi") ?? text(ide, "dEmi") ?? "",
    natOp: text(ide, "natOp") ?? "",
    emitente: {
      cnpj: text(emit, "CNPJ") ?? text(emit, "CPF") ?? "",
      xNome: text(emit, "xNome") ?? "",
      xFant: text(emit, "xFant"),
      uf: text(enderEmit, "UF") ?? "",
      municipio: text(enderEmit, "xMun") ?? "",
    },
    destinatario: destDocumento
      ? {
          documento: destDocumento,
          xNome: text(dest, "xNome") ?? "",
          uf: text(enderDest, "UF"),
          municipio: text(enderDest, "xMun"),
        }
      : undefined,
    valores: {
      vProd: num(total, "vProd") ?? 0,
      vDesc: num(total, "vDesc") ?? 0,
      vFrete: num(total, "vFrete") ?? 0,
      vICMS: num(total, "vICMS") ?? 0,
      vPIS: num(total, "vPIS") ?? 0,
      vCOFINS: num(total, "vCOFINS") ?? 0,
      vIBS: num(total, "vIBS"),
      vCBS: num(total, "vCBS"),
      vNF: num(total, "vNF") ?? 0,
    },
    pagamentos: Array.from(infNFe.getElementsByTagName("detPag")).map((detPag) => ({
      tPag: text(detPag, "tPag") ?? "",
      xPag: text(detPag, "xPag"),
      vPag: num(detPag, "vPag") ?? 0,
    })),
  };

  const notaResult = notaFiscalCoreSchema.safeParse(rawNota);
  if (!notaResult.success) {
    throw new NfeParseError(`"${fileName}" tem campos ausentes ou inválidos: ${describeZodError(notaResult.error)}.`);
  }

  const itens: ItemNota[] = detNodes.map((det, index) => {
    const prod = det.getElementsByTagName("prod")[0];
    const imposto = det.getElementsByTagName("imposto")[0];

    const rawItem = {
      id: `${chave}-${index + 1}`,
      chaveNota: chave,
      cProd: text(prod, "cProd") ?? "",
      xProd: text(prod, "xProd") ?? "",
      ncm: text(prod, "NCM") ?? "",
      cfop: text(prod, "CFOP") ?? "",
      uCom: text(prod, "uCom") ?? "",
      qCom: num(prod, "qCom") ?? 0,
      vUnCom: num(prod, "vUnCom") ?? 0,
      vProd: num(prod, "vProd") ?? 0,
      vDesc: num(prod, "vDesc") ?? 0,
      impostos: {
        vICMS: num(imposto, "vICMS") ?? 0,
        pICMS: num(imposto, "pICMS") ?? 0,
        vPIS: num(imposto, "vPIS") ?? 0,
        vCOFINS: num(imposto, "vCOFINS") ?? 0,
        vIBS: num(imposto, "vIBS"),
        vCBS: num(imposto, "vCBS"),
      },
    };

    const itemResult = itemNotaSchema.safeParse(rawItem);
    if (!itemResult.success) {
      throw new NfeParseError(
        `"${fileName}" item ${index + 1} tem campos ausentes ou inválidos: ${describeZodError(itemResult.error)}.`,
      );
    }
    return itemResult.data;
  });

  return { nota: notaResult.data as NotaFiscalCore, itens };
}
