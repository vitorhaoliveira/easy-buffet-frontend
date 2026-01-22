/**
 * Date utility functions
 * @description - Utility functions to handle dates and avoid timezone issues
 * @author - Vitor Hugo
 */

/**
 * @Function - parseDateIgnoringTimezone
 * @description - Parse ISO date string to local date ignoring timezone to prevent off-by-one day errors
 * @author - Vitor Hugo
 * @param - dateString: string - ISO date string (e.g., "2026-03-10T00:00:00.000Z")
 * @returns - Date - Date object in local timezone
 */
export function parseDateIgnoringTimezone(dateString: string): Date {
  const datePart = dateString.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * @Function - formatDateBR
 * @description - Format date string to Brazilian format (dd/mm/yyyy) ignoring timezone
 * @author - Vitor Hugo
 * @param - dateString: string - ISO date string (e.g., "2026-03-10T00:00:00.000Z")
 * @returns - string - Formatted date in Brazilian format
 */
export function formatDateBR(dateString: string): string {
  const date = parseDateIgnoringTimezone(dateString)
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

/**
 * @Function - getDaysUntil
 * @description - Calculate days until a date ignoring timezone
 * @author - Vitor Hugo
 * @param - dateString: string - ISO date string (e.g., "2026-03-10T00:00:00.000Z")
 * @returns - number - Days until the date
 */
export function getDaysUntil(dateString: string): number {
  const targetDate = parseDateIgnoringTimezone(dateString)
  
  // Get today at midnight local time
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const diff = targetDate.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * @Function - isSameDay
 * @description - Check if two dates are the same day ignoring timezone
 * @author - Vitor Hugo
 * @param - dateString1: string - First ISO date string
 * @param - dateString2: string - Second ISO date string
 * @returns - boolean - True if dates are the same day
 */
export function isSameDay(dateString1: string, dateString2: string): boolean {
  const date1 = parseDateIgnoringTimezone(dateString1)
  const date2 = parseDateIgnoringTimezone(dateString2)
  return date1.toDateString() === date2.toDateString()
}

/**
 * @Function - isSameDayAsDate
 * @description - Check if a date string is the same day as a Date object ignoring timezone
 * @author - Vitor Hugo
 * @param - dateString: string - ISO date string
 * @param - date: Date - Date object to compare
 * @returns - boolean - True if dates are the same day
 */
export function isSameDayAsDate(dateString: string, date: Date): boolean {
  const parsedDate = parseDateIgnoringTimezone(dateString)
  return parsedDate.toDateString() === date.toDateString()
}

/**
 * @Function - formatTime
 * @description - Format time string to HH:mm format without timezone conversion
 * @author - Vitor Hugo
 * @param - timeString: string - ISO time string (e.g., "1970-01-01T18:00:00.000Z") or HH:mm format
 * @returns - string - Formatted time in HH:mm format
 */
export function formatTime(timeString: string): string {
  if (!timeString) return 'Não informado'
  
  // If it's already in HH:mm format
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString
  }
  
  // If it's an ISO date string, extract the time using UTC to avoid timezone conversion
  if (timeString.includes('T')) {
    const date = new Date(timeString)
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
  
  // Try to parse as date
  try {
    const date = new Date(timeString)
    if (!isNaN(date.getTime())) {
      // Use UTC to avoid timezone conversion issues
      const hours = date.getUTCHours().toString().padStart(2, '0')
      const minutes = date.getUTCMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
  } catch (error) {
    // If parsing fails, return as is
    console.warn('⚠️ formatTime: Unable to parse time string:', error)
  }
  
  return timeString
}

