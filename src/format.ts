import type { BandDelivery, Priority, WorkStatus } from './api'

export function statusClass(status: WorkStatus) {
  return status === 'Done' ? 'status-done' : status === 'Review' ? 'status-review' : 'status-progress'
}

export function priorityColor(priority: Priority | string) {
  return priority === 'High' ? '#E84545' : priority === 'Low' ? '#2EAD72' : '#D99324'
}

// Turns POST /work results into the notice shown after publishing work.
export function bandDeliveryNotice(results: Array<{ band?: BandDelivery }>) {
  const failed = results.find((result) => !result.band?.sent)
  if (!failed) {
    return {
      tone: 'success' as const,
      title: 'Work published',
      text: results.length > 1 ? `${results.length} tasks were created. The wristband shows the most recent one.` : 'The first step is now on the wristband.',
    }
  }
  return {
    tone: 'warning' as const,
    title: 'Work saved, not on the wristband',
    text: `${failed.band?.error ?? 'The BLE bridge did not answer.'} Start the bridge (python app.py in the naprock folder) with the watch switched on.`,
  }
}

// The server stores UTC times as "YYYY-MM-DD HH:MM:SS".
export function parseServerTime(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatTime(date: Date) {
  const today = new Date()
  const sameDay = date.toDateString() === today.toDateString()
  const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return sameDay ? `Today, ${time}` : `${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}, ${time}`
}

// Due dates are saved as "YYYY-MM-DD" or "Unscheduled".
export function parseDue(due: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(due)
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null
}

export function formatDue(due: string) {
  const date = parseDue(due)
  return date ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : due
}

export function errorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
