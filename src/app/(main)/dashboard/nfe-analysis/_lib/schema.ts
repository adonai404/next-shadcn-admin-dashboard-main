import { z } from "zod";

const enderecoSchema = z.object({
  uf: z.string().length(2),
  municipio: z.string().min(1),
});

const emitenteSchema = enderecoSchema.extend({
  cnpj: z.string().min(11),
  xNome: z.string().min(1),
  xFant: z.string().optional(),
});

const destinatarioSchema = z.object({
  documento: z.string().min(11),
  xNome: z.string().min(1),
  uf: z.string().length(2).optional(),
  municipio: z.string().optional(),
});

const valoresNotaSchema = z.object({
  vProd: z.number(),
  vDesc: z.number(),
  vFrete: z.number(),
  vICMS: z.number(),
  vPIS: z.number(),
  vCOFINS: z.number(),
  vIBS: z.number().optional(),
  vCBS: z.number().optional(),
  vNF: z.number(),
});

const formaPagamentoSchema = z.object({
  tPag: z.string().min(1),
  xPag: z.string().optional(),
  vPag: z.number(),
});

export const notaFiscalCoreSchema = z.object({
  chave: z.string().length(44),
  mod: z.enum(["55", "65"]),
  numero: z.string().min(1),
  serie: z.string().min(1),
  dhEmi: z.string().min(1),
  natOp: z.string().min(1),
  emitente: emitenteSchema,
  destinatario: destinatarioSchema.optional(),
  valores: valoresNotaSchema,
  pagamentos: z.array(formaPagamentoSchema),
});

const impostosItemSchema = z.object({
  vICMS: z.number(),
  pICMS: z.number(),
  vPIS: z.number(),
  vCOFINS: z.number(),
  vIBS: z.number().optional(),
  vCBS: z.number().optional(),
});

export const itemNotaSchema = z.object({
  id: z.string().min(1),
  chaveNota: z.string().length(44),
  cProd: z.string().min(1),
  xProd: z.string().min(1),
  ncm: z.string().min(1),
  cfop: z.string().min(1),
  uCom: z.string().min(1),
  qCom: z.number(),
  vUnCom: z.number(),
  vProd: z.number(),
  vDesc: z.number(),
  impostos: impostosItemSchema,
});
