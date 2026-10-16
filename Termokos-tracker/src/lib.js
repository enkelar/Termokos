export const MONTHS = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor']
export const WD = ['D','H','M','M','E','P','Sh']
export const daysIn = (y, m) => new Date(y, m + 1, 0).getDate() 
export const tri = (total) => Math.round(total / 8)         

export const EXTRAS = [
  { key: 'night',    label: 'Punë e natës',      unit: 'orë pune' },
  { key: 'cont',     label: 'Punë e vazhduar',   unit: 'orë pune', sum: true },
  { key: 'paid_abs', label: 'Mungesë e paguar',  unit: 'orë pune' },
  { key: 'just_abs', label: 'Mung. e arsyetuar', unit: 'ditë pune' },
  { key: 'holiday',  label: 'Festat',            unit: 'orë pune' },
  { key: 'annual',   label: 'Pushim vjetor',     unit: 'ditë', sum: true },
  { key: 'sick',     label: 'Pushim mjekësor',   unit: '20 ditë', sum: true },
]
export const BONUS = { key: 'bonus', label: 'Stimulime' }