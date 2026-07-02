import { z } from "zod";

const recentNotaSchema = z.object({
  chave: z.string(),
  tipo: z.enum(["nfe_recebida", "nfe_emitida", "nfce"]),
  numero: z.string(),
  serie: z.string(),
  dhEmi: z.string(),
  contraparte: z.string(),
  uf: z.string(),
  valor: z.number(),
});

export type RecentNotaRow = z.infer<typeof recentNotaSchema>;
