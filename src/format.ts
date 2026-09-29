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

export function errorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
