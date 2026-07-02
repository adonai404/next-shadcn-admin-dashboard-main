import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Análise de NF-e",
  version: packageJson.version,
  copyright: `© ${currentYear}, Análise de NF-e.`,
  meta: {
    title: "Análise de NF-e - Gestão de Notas Fiscais",
    description:
      "Sistema de importação e análise de notas fiscais eletrônicas (NF-e, NFC-e), com relatórios de compras, vendas, fornecedores, clientes, produtos e impostos por estado.",
  },
};
