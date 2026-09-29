import type { Priority, WorkStatus } from './api'

export function statusClass(status: WorkStatus) {
  return status === 'Done' ? 'status-done' : status === 'Review' ? 'status-review' : 'status-progress'
}

export function priorityColor(priority: Priority | string) {
  return priority === 'High' ? '#E84545' : priority === 'Low' ? '#2EAD72' : '#D99324'
}

export function errorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
