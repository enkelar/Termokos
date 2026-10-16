import { WD, EXTRAS, BONUS, daysIn, tri } from './lib'

export function Head({ team, department, year, month, MONTHS }) {
  return (
    <div className="head">
      <div><b>ORARI I PUNËS SË PUNËTORËVE</b>{MONTHS[month].toUpperCase()} {year} – {team}</div>
      <div><b>{department}</b></div>
    </div>
  )
}

export default function Grid({ year, month, workers, hours, extras = {}, editable, onChange, onCommit, onExtraChange, onExtraCommit, onRemove }) {
  const days = Array.from({ length: daysIn(year, month) }, (_, i) => i + 1)
  const dow = (d) => new Date(year, month, d).getDay()
  const we = (d) => dow(d) === 0 || dow(d) === 6
  const total = (id) => days.reduce((s, d) => s + (Number(hours[`${id}:${d}`]) || 0), 0)
  const extraSum = (f) => workers.reduce((s, w) => s + (Number(extras[`${w.id}:${f}`]) || 0), 0)
  const extraCell = (w, f) => {
    const k = `${w.id}:${f}`
    return (
      <td key={f} className="x2">
        {editable
          ? <input type="number" min="0" step="any" value={extras[k] ?? ''}
              onChange={(e) => onExtraChange(k, e.target.value)} onBlur={() => onExtraCommit(w.id, f)}
              aria-label={`${w.name}, ${f}`} />
          : <span>{extras[k] ?? ''}</span>}
      </td>
    )
  }
  return (
    <div className="sc">
      <table>
        <thead>
          <tr>
            <th>Nr.</th><th>Emri e Mbiemri</th>
            {days.map((d) => <th key={d} className={we(d) ? 'we' : ''}>{d}<small>{WD[dow(d)]}</small></th>)}
            <th className="v"><span>Gjithsejt orë pune</span></th>
            {EXTRAS.map((c) => <th key={c.key} className="v"><span>{c.label} <small>({c.unit})</small></span></th>)}
            <th className="v"><span>Triskat</span></th>
            <th className="v"><span>{BONUS.label}</span></th>
            {editable && <th className="np" />}
          </tr>
        </thead>
        <tbody>
          {workers.map((w, i) => {
            const t = total(w.id)
            return (
              <tr key={w.id}>
                <td>{i + 1}</td><td className="n">{w.name}</td>
                {days.map((d) => {
                  const k = `${w.id}:${d}`
                  return (
                    <td key={d} className={we(d) ? 'we' : ''}>
                      {editable
                        ? <input type="number" min="0" max="24" value={hours[k] ?? ''}
                            onChange={(e) => onChange(k, e.target.value)}
                            onBlur={() => onCommit(w.id, d)} aria-label={`${w.name}, ${d}`} />
                        : <span>{hours[k] ?? ''}</span>}
                    </td>
                  )
                })}
                <td className="t">{t}</td>
                {EXTRAS.map((c) => extraCell(w, c.key))}
                <td className="t">{tri(t)}</td>
                {extraCell(w, BONUS.key)}
                {editable && <td className="np"><button className="x" onClick={() => onRemove(w)} aria-label={`Hiq ${w.name}`}>×</button></td>}
              </tr>
            )
          })}
          {!workers.length && <tr><td colSpan={days.length + EXTRAS.length + 5} style={{ padding: 16 }}>Nuk ka punëtorë.</td></tr>}
        </tbody>
        {!!workers.length && (
          <tfoot>
            <tr>
              <td colSpan={days.length + 3} />
              {EXTRAS.map((c) => <td key={c.key}>{c.sum ? extraSum(c.key) : ''}</td>)}
              <td /><td />
              {editable && <td className="np" />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}