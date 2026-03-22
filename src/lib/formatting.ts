export const penceToPounds = (pence: number): number => pence / 100

export const formatCurrency = (pence: number): string =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100)

export const poundsToPence = (pounds: string | number): number =>
  Math.round(Number(pounds) * 100)

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(date)
  )
}

export const formatDateShort = (date: Date | string | null | undefined): string => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(date)
  )
}

export const formatGoverningLaw = (law: string): string => {
  const map: Record<string, string> = {
    ENGLAND_WALES: 'England and Wales',
    SCOTLAND: 'Scotland',
    NORTHERN_IRELAND: 'Northern Ireland',
  }
  return map[law] ?? law
}

export const formatGuaranteeType = (type: string): string => {
  const map: Record<string, string> = {
    ALL_MONIES: 'All Monies',
    LIMITED: 'Limited Amount',
    SPECIFIC: 'Specific Obligations',
  }
  return map[type] ?? type
}
