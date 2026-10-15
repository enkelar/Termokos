export const MONTHS = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor']
export const WD = ['D','H','M','M','E','P','Sh']
export const daysIn = (y, m) => new Date(y, m + 1, 0).getDate() // m is 0-based
export const tri = (total) => Math.round(total / 8)             // Triskat = hours / 8
