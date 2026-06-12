const STADIUM_OFFSETS = {
  1: -6,  2: -6,  3: -6,
  4: -5,  5: -5,  6: -5,
  7: -4,  8: -4,  9: -4,
  10: -4, 11: -4, 12: -4,
  13: -7, 14: -7, 15: -7, 16: -7,
}

export function localToBST(localDateStr, stadiumId) {
  const [datePart, timePart] = localDateStr.split(' ')
  const [month, day, year] = datePart.split('/')
  const [hours, minutes] = timePart.split(':')

  const offset = STADIUM_OFFSETS[String(stadiumId)] ?? STADIUM_OFFSETS[stadiumId]
  if (offset == null) return localDateStr

  const localHour = parseInt(hours, 10)

  const utcTimestamp = Date.UTC(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    localHour - offset,
    parseInt(minutes, 10),
  )

  const bstDate = new Date(utcTimestamp + 3600000)

  return bstDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' BST'
}
