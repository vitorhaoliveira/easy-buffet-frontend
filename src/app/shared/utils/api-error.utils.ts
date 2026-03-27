/**
 * @Function - getApiErrorMessage
 * @description - Extracts a human-readable message from Angular HttpClient error responses (nested API shapes or plain message).
 * @author - Vitor Hugo
 * @param - err: unknown - Error object from catchError or try/catch
 * @param - fallback: string - Message when nothing else is found
 * @returns - string - Error message for display
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    error?: { error?: { message?: string }; message?: string }
    message?: string
  }
  const nested = e?.error?.error?.message
  if (typeof nested === 'string' && nested.trim().length > 0) {
    return nested
  }
  const flat = e?.error?.message
  if (typeof flat === 'string' && flat.trim().length > 0) {
    return flat
  }
  const top = e?.message
  if (typeof top === 'string' && top.trim().length > 0) {
    return top
  }
  return fallback
}
