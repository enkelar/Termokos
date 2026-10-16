import { useState } from "react";
import { WD, EXTRAS, BONUS, daysIn, tri } from "./lib";

export function Head({ team, department, year, month, MONTHS }) {
  return (
    <div className="head">
      <div>
        <b>ORARI I PUNËS SË PUNËTORËVE</b>
        {MONTHS[month].toUpperCase()} {year} – {team}
      </div>
      <div>
        <b>{department}</b>
      </div>
    </div>
  );
}

// Keyboard: arrows / Enter move between cells, typing replaces the value, Delete clears a cell.
// Click a name (or focus it and press Enter) to select the row, then clear all its boxes.
export default function Grid({
  year,
  month,
  workers,
  hours,
  extras = {},
  editable,
  onChange,
  onCommit,
  onExtraChange,
  onExtraCommit,
  onRemove,
  onClearRow,
}) {
  const [sel, setSel] = useState(null);
  const days = Array.from({ length: daysIn(year, month) }, (_, i) => i + 1);
  const dow = (d) => new Date(year, month, d).getDay();
  const we = (d) => dow(d) === 0 || dow(d) === 6;
  const total = (id) =>
    days.reduce((s, d) => s + (Number(hours[`${id}:${d}`]) || 0), 0);
  const extraSum = (f) =>
    workers.reduce((s, w) => s + (Number(extras[`${w.id}:${f}`]) || 0), 0);
  const selW = workers.find((w) => w.id === sel);

  // Arrow-key movement between cells (r = row, c = column among editable cells)
  const onKey = (e) => {
    const t = e.target;
    if (t.tagName !== "INPUT" || t.dataset.r === undefined) return;
    const r = +t.dataset.r,
      c = +t.dataset.c;
    let nr = r,
      nc = c;
    if (e.key === "ArrowUp") nr--;
    else if (e.key === "ArrowDown" || e.key === "Enter") nr++;
    else if (e.key === "ArrowLeft") nc--;
    else if (e.key === "ArrowRight") nc++;
    else return;
    e.preventDefault();
    const root = e.currentTarget;
    const next =
      nc < 0
        ? root.querySelector(`td.n[data-r="${r}"]`)
        : root.querySelector(`input[data-r="${nr}"][data-c="${nc}"]`);
    if (next) next.focus();
  };

  const onNameKey = (e, w, i) => {
    const table = e.currentTarget.closest("table");
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSel(w.id);
    } else if ((e.key === "Delete" || e.key === "Backspace") && sel === w.id) {
      e.preventDefault();
      onClearRow(w);
    } else if (e.key === "Escape") setSel(null);
    else if (e.key === "ArrowRight") {
      e.preventDefault();
      table.querySelector(`input[data-r="${i}"][data-c="0"]`)?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      table.querySelector(`td.n[data-r="${i + 1}"]`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      table.querySelector(`td.n[data-r="${i - 1}"]`)?.focus();
    }
  };

  const extraCell = (w, f, r, c) => {
    const k = `${w.id}:${f}`;
    return (
      <td key={f} className="x2">
        {editable ? (
          <input
            type="number"
            min="0"
            step="any"
            value={extras[k] ?? ""}
            data-r={r}
            data-c={c}
            onFocus={(e) => e.target.select()}
            onChange={(e) => onExtraChange(k, e.target.value)}
            onBlur={() => onExtraCommit(w.id, f)}
            aria-label={`${w.name}, ${f}`}
          />
        ) : (
          <span>{extras[k] ?? ""}</span>
        )}
      </td>
    );
  };

  return (
    <div onKeyDown={editable ? onKey : undefined}>
      <div className="sc">
        <table>
          <thead>
            <tr>
              <th className="num-header">
                <div className="vertical-text">Numri rendor</div>
              </th>
              <th>Emri dhe Mbiemri</th>
              {days.map((d) => {
                const fullDate = `${String(d).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;

                return (
                  <th key={d} className={we(d) ? "we day-header" : "day-header"}>
                    <div className="vertical-text">{fullDate}</div>
                  </th>
                );
              })}
              <th className="v">
                <span>Gjithsejt orë pune</span>
              </th>
              {EXTRAS.map((c) => (
                <th key={c.key} className="v">
                  <span>
                    {c.label} <small>({c.unit})</small>
                  </span>
                </th>
              ))}
              <th className="v">
                <span>Triskat</span>
              </th>
              <th className="v">
                <span>{BONUS.label}</span>
              </th>
              {editable && <th className="np" />}
            </tr>
          </thead>
          <tbody>
            {workers.map((w, i) => {
              const t = total(w.id);
              return (
                <tr key={w.id} className={sel === w.id ? "sel" : ""}>
                  <td>{i + 1}</td>
                  <td
                    className="n"
                    data-r={i}
                    tabIndex={editable ? 0 : undefined}
                    onClick={() => editable && setSel(sel === w.id ? null : w.id)}
                    onKeyDown={(e) => editable && onNameKey(e, w, i)}
                    title={editable ? "Kliko për të zgjedhur rreshtin" : undefined}
                  >
                    {w.name}
                  </td>
                  {days.map((d) => {
                    const k = `${w.id}:${d}`;
                    return (
                      <td key={d} className={we(d) ? "we" : ""}>
                        {editable ? (
                          <input
                            type="number"
                            min="0"
                            max="24"
                            value={hours[k] ?? ""}
                            data-r={i}
                            data-c={d - 1}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => onChange(k, e.target.value)}
                            onBlur={() => onCommit(w.id, d)}
                            aria-label={`${w.name}, ${d}`}
                          />
                        ) : (
                          <span>{hours[k] ?? ""}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="t">{t}</td>
                  {EXTRAS.map((c, j) => extraCell(w, c.key, i, days.length + j))}
                  <td className="t">{tri(t)}</td>
                  {extraCell(w, BONUS.key, i, days.length + EXTRAS.length)}
                  {editable && (
                    <td className="np">
                      <button
                        className="x"
                        onClick={() => onRemove(w)}
                        aria-label={`Hiq ${w.name}`}
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {!workers.length && (
              <tr>
                <td
                  colSpan={days.length + EXTRAS.length + 5}
                  style={{ padding: 16 }}
                >
                  Nuk ka punëtorë.
                </td>
              </tr>
            )}
          </tbody>
          {!!workers.length && (
            <tfoot>
              <tr>
                <td colSpan={days.length + 3} />
                {EXTRAS.map((c) => (
                  <td key={c.key}>{c.sum ? extraSum(c.key) : ""}</td>
                ))}
                <td />
                <td />
                {editable && <td className="np" />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {editable && selW && (
        <div className="rowbar np">
          <span>
            Rreshti i zgjedhur: <b>{selW.name}</b>
          </span>
          <button onClick={() => onClearRow(selW)}>Pastro kutitë e rreshtit</button>
          <button onClick={() => setSel(null)}>Hiq zgjedhjen</button>
        </div>
      )}
    </div>
  );
}