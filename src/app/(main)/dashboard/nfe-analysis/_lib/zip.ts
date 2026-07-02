import { unzip } from "fflate";

import type { ImportError } from "./types";

export type ExpandedFile = {
  name: string;
  content: string;
};

function unzipAsync(data: Uint8Array): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    unzip(data, (error, unzipped) => {
      if (error) reject(error);
      else resolve(unzipped);
    });
  });
}

export async function expandFiles(files: File[]): Promise<{ files: ExpandedFile[]; errors: ImportError[] }> {
  const decoder = new TextDecoder("utf-8");
  const expanded: ExpandedFile[] = [];
  const errors: ImportError[] = [];

  for (const file of files) {
    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith(".zip")) {
      try {
        const buffer = new Uint8Array(await file.arrayBuffer());
        const unzipped = await unzipAsync(buffer);
        const xmlEntries = Object.entries(unzipped).filter(([entryName]) => entryName.toLowerCase().endsWith(".xml"));

        if (xmlEntries.length === 0) {
          errors.push({ arquivo: file.name, mensagem: `"${file.name}" não contém nenhum arquivo .xml.` });
          continue;
        }

        for (const [entryName, data] of xmlEntries) {
          const baseName = entryName.split("/").pop() ?? entryName;
          expanded.push({ name: `${file.name} › ${baseName}`, content: decoder.decode(data) });
        }
      } catch {
        errors.push({
          arquivo: file.name,
          mensagem: `Não foi possível abrir "${file.name}". O arquivo ZIP pode estar corrompido.`,
        });
      }
    } else if (lowerName.endsWith(".xml")) {
      expanded.push({ name: file.name, content: await file.text() });
    }
  }

  return { files: expanded, errors };
}
