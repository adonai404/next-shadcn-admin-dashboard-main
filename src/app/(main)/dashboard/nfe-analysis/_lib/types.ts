export type TipoNota = "nfe_recebida" | "nfe_emitida" | "nfce";

export type Empresa = {
  id: string;
  nome: string;
  cnpj: string;
  criadoEm: string;
};

export type Endereco = {
  uf: string;
  municipio: string;
};

export type Emitente = Endereco & {
  cnpj: string;
  xNome: string;
  xFant?: string;
};

export type Destinatario = Partial<Endereco> & {
  documento: string;
  xNome: string;
};

export type FormaPagamento = {
  tPag: string;
  xPag?: string;
  vPag: number;
};

export type ValoresNota = {
  vProd: number;
  vDesc: number;
  vFrete: number;
  vICMS: number;
  vPIS: number;
  vCOFINS: number;
  vIBS?: number;
  vCBS?: number;
  vNF: number;
};

export type NotaFiscalCore = {
  chave: string;
  mod: "55" | "65";
  numero: string;
  serie: string;
  dhEmi: string;
  natOp: string;
  emitente: Emitente;
  destinatario?: Destinatario;
  valores: ValoresNota;
  pagamentos: FormaPagamento[];
};

export type NotaFiscal = NotaFiscalCore & {
  tipo: TipoNota;
  empresaId: string;
  arquivoOrigem: string;
  importadoEm: string;
};

export type ImpostosItem = {
  vICMS: number;
  pICMS: number;
  vPIS: number;
  vCOFINS: number;
  vIBS?: number;
  vCBS?: number;
};

export type ItemNota = {
  id: string;
  chaveNota: string;
  cProd: string;
  xProd: string;
  ncm: string;
  cfop: string;
  uCom: string;
  qCom: number;
  vUnCom: number;
  vProd: number;
  vDesc: number;
  impostos: ImpostosItem;
};

export type ParsedNfe = {
  nota: NotaFiscalCore;
  itens: ItemNota[];
};

export type ImportError = {
  arquivo: string;
  mensagem: string;
};

export type ImportResult = {
  importadas: number;
  atualizadas: number;
  erros: ImportError[];
};
