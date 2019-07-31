/**
 * Get an array with latests N days
 * @param {Number} n N quantity of days
 * @returns Array<Date>
 */
export function lastXdays(n) {
  let dates = []
  // Loor for N days
  for (var i = 0; i < n; i++) {
    let date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    dates.push(date)
  }
  return dates
}

export function setHourTo(date='start', time) {
  if (time == 'start') {
    return new Date(date.setHours(0, 0, 0, 0))
  } else if (time == 'end') {
    return new Date(date.setHours(23, 59, 59))
  }
}
