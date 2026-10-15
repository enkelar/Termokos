import { WD, daysIn, tri } from './lib'

export function Head({ team, department, year, month, MONTHS }) {
  return (
    <div className="head">
      <div><b>ORARI I PUNËS SË PUNËTORËVE</b>{MONTHS[month].toUpperCase()} {year} – {team}</div>
      <div><b>{department}</b></div>
    </div>
  )
}

// month is 0-based. hours is a map { "workerId:day": number }
export default function Grid({ year, month, workers, hours, editable, onChange, onCommit, onRemove }) {
  const days = Array.from({ length: daysIn(year, month) }, (_, i) => i + 1)
  const dow = (d) => new Date(year, month, d).getDay()
  const we = (d) => dow(d) === 0 || dow(d) === 6
  const total = (id) => days.reduce((s, d) => s + (Number(hours[`${id}:${d}`]) || 0), 0)
  return (
    <div className="sc">
      <table>
        <thead>
          <tr>
            <th>Nr.</th><th>Emri e Mbiemri</th>
            {days.map((d) => <th key={d} className={we(d) ? 'we' : ''}>{d}<small>{WD[dow(d)]}</small></th>)}
            <th>Gjithsejt orë pune</th><th>Triskat</th>
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
                <td className="t">{t}</td><td className="t">{tri(t)}</td>
                {editable && <td className="np"><button className="x" onClick={() => onRemove(w)} aria-label={`Hiq ${w.name}`}>×</button></td>}
              </tr>
            )
          })}
          {!workers.length && <tr><td colSpan={days.length + 4} style={{ padding: 16 }}>Nuk ka punëtorë.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
