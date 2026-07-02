"use client";

import { useEffect, useMemo } from "react";

import { filterNotasByRange } from "./reports";
import { useNfeStore } from "./store";

export function useFilteredNfeData() {
  const hydrate = useNfeStore((state) => state.hydrate);
  const hydrated = useNfeStore((state) => state.hydrated);
  const notas = useNfeStore((state) => state.notas);
  const itens = useNfeStore((state) => state.itens);
  const empresas = useNfeStore((state) => state.empresas);
  const activeEmpresaId = useNfeStore((state) => state.activeEmpresaId);
  const dateRange = useNfeStore((state) => state.dateRange);
  const setDateRange = useNfeStore((state) => state.setDateRange);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const notasDaEmpresa = useMemo(
    () => notas.filter((nota) => nota.empresaId === activeEmpresaId),
    [notas, activeEmpresaId],
  );
  const notasFiltradas = useMemo(() => filterNotasByRange(notasDaEmpresa, dateRange), [notasDaEmpresa, dateRange]);
  const itensFiltrados = useMemo(() => {
    const chaves = new Set(notasFiltradas.map((nota) => nota.chave));
    return itens.filter((item) => chaves.has(item.chaveNota));
  }, [itens, notasFiltradas]);

  const activeEmpresa = empresas.find((empresa) => empresa.id === activeEmpresaId) ?? null;

  return {
    hydrated,
    activeEmpresa,
    hasAnyNotas: notasDaEmpresa.length > 0,
    notasFiltradas,
    itensFiltrados,
    dateRange,
    setDateRange,
  };
}
