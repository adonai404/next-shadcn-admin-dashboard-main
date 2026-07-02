export function NoDataState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-1 rounded-xl border border-border border-dashed text-center text-muted-foreground">
      <p>Nenhuma nota importada para a empresa selecionada.</p>
      <p className="text-xs">Importe XMLs em "Importação" no menu lateral, ou troque de empresa no filtro acima.</p>
    </div>
  );
}
