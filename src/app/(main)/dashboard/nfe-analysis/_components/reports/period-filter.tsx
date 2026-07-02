"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { DateRange } from "../../_lib/reports";
import { CompanySwitcher } from "../company/company-switcher";

export function PeriodFilter({ range, onChange }: { range: DateRange; onChange: (range: DateRange) => void }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <span className="block font-medium text-sm leading-none">Empresa</span>
        <CompanySwitcher className="w-56" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="period-from">De</Label>
        <Input
          id="period-from"
          type="date"
          value={range.from}
          className="w-40"
          onChange={(event) => onChange({ ...range, from: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="period-to">Até</Label>
        <Input
          id="period-to"
          type="date"
          value={range.to}
          className="w-40"
          onChange={(event) => onChange({ ...range, to: event.target.value })}
        />
      </div>
      {(range.from || range.to) && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ from: "", to: "" })}>
          Limpar período
        </Button>
      )}
    </div>
  );
}
