"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { controlClass } from "./fields";

type Row = { key: number; days: string; price: string };

/**
 * Stawki za dobę wg długości najmu (np. od 1 doby – 219 zł, od 4 dób – 189 zł).
 * Wiersze wysyłamy jako powtarzalne pola `tierDays` / `tierPrice`.
 */
export function PriceTiersField({
  initialRows,
  error,
}: {
  initialRows: { days: string; price: string }[];
  error?: string[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    (initialRows.length > 0 ? initialRows : [{ days: "1", price: "" }]).map((row, key) => ({
      key,
      ...row,
    })),
  );
  const [nextKey, setNextKey] = useState(initialRows.length + 1);

  const update = (key: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  return (
    <fieldset className="md:col-span-2">
      <legend className="mb-1.5 text-body-sm font-medium">Stawki za dobę (netto)</legend>
      <p className="mb-3 text-caption text-slate">
        Im dłuższy najem, tym niższa stawka za dobę. Wymagany jest próg „od 1 doby”.
      </p>

      <ul className="space-y-2">
        {rows.map((row, index) => (
          <li key={row.key} className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`tierDays-${row.key}`}>
              Od ilu dób, wiersz {index + 1}
            </label>
            <div className="flex w-32 shrink-0 items-center gap-2">
              <span className="text-body-sm text-slate">od</span>
              <input
                id={`tierDays-${row.key}`}
                name="tierDays"
                inputMode="numeric"
                value={row.days}
                onChange={(event) => update(row.key, { days: event.target.value })}
                className={controlClass(Boolean(error?.length), "px-3 text-center")}
                aria-label={`Od ilu dób, wiersz ${index + 1}`}
              />
              <span className="text-body-sm text-slate">dób</span>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <input
                name="tierPrice"
                inputMode="decimal"
                placeholder="np. 219"
                value={row.price}
                onChange={(event) => update(row.key, { price: event.target.value })}
                className={controlClass(Boolean(error?.length), "min-w-0")}
                aria-label={`Cena netto za dobę, wiersz ${index + 1}`}
              />
              <span className="text-body-sm text-slate">zł</span>
            </div>

            <button
              type="button"
              onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}
              disabled={rows.length === 1}
              aria-label={`Usuń wiersz ${index + 1}`}
              className="flex size-11 shrink-0 items-center justify-center rounded-ui border border-iron hover:bg-mist disabled:opacity-40"
            >
              <TrashIcon width={18} height={18} />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => {
          setRows((current) => [...current, { key: nextKey, days: "", price: "" }]);
          setNextKey((k) => k + 1);
        }}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-ui border border-iron bg-paper px-4 text-body-sm hover:bg-mist"
      >
        <PlusIcon width={16} height={16} />
        Dodaj próg
      </button>

      {error?.length ? (
        <p role="alert" className="mt-2 text-body-sm font-medium text-ink">
          {error[0]}
        </p>
      ) : null}
    </fieldset>
  );
}
