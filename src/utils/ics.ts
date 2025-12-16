import { addDays, addMonths, format } from 'date-fns'
import type { EADPeriod } from '../types'
import {
  OPT_UNEMPLOYMENT_LIMIT,
  TOTAL_UNEMPLOYMENT_LIMIT_WITH_STEM,
} from './calculator'

function formatICSDate(value: Date): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date for ICS event')
  }
  return format(date, "yyyyMMdd'T'HHmmss'Z'")
}

function generateUid(): string {
  const cryptoRef = globalThis.crypto
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return cryptoRef.randomUUID()
  }
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function buildEvent(
  summary: string,
  date: Date,
  description: string,
  reminders?: number[]
): string[] {
  const event = [
    'BEGIN:VEVENT',
    `UID:${generateUid()}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(date)}`,
    `DTEND:${formatICSDate(addDays(date, 1))}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
  ]

  // Add reminders/alarms if provided
  if (reminders && reminders.length > 0) {
    for (const reminderDays of reminders) {
      event.push('BEGIN:VALARM')
      event.push('ACTION:DISPLAY')
      event.push(`DESCRIPTION:${summary}`)
      event.push(`TRIGGER:-P${reminderDays}D`)
      event.push('END:VALARM')
    }
  }

  event.push('END:VEVENT')
  return event
}

export function createUnemploymentICS(
  optPeriod: EADPeriod | null,
  stemPeriod: EADPeriod | null
): string | null {
  if (!optPeriod) return null

  const events: string[] = []
  const optDeadline = addDays(optPeriod.startDate, OPT_UNEMPLOYMENT_LIMIT - 1)
  events.push(
    ...buildEvent(
      'OPT 90-day unemployment limit',
      optDeadline,
      'Reminder: You must not exceed 90 days of unemployment during OPT.'
    )
  )

  const totalDeadline = addDays(
    optPeriod.startDate,
    TOTAL_UNEMPLOYMENT_LIMIT_WITH_STEM - 1
  )
  events.push(
    ...buildEvent(
      'STEM 150-day unemployment limit',
      totalDeadline,
      'Reminder: OPT + STEM combined unemployment must stay under 150 days.'
    )
  )

  if (stemPeriod) {
    events.push(
      ...buildEvent(
        'STEM period ends',
        stemPeriod.endDate,
        'End of STEM EAD validity.'
      )
    )
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OPT Tracker//EN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

/**
 * Creates ICS calendar file with STEM OPT evaluation reminders
 * Generates events for 6, 12, 18, and 24-month evaluations with reminders
 */
export function createStemEvaluationICS(stemStartDate: Date): string | null {
  if (!stemStartDate) return null

  const events: string[] = []
  const milestones = [6, 12, 18, 24]
  const reminders = [30, 7, 1] // 30 days, 7 days, 1 day before

  for (const months of milestones) {
    const evaluationDate = addMonths(stemStartDate, months)
    const summary = `STEM OPT ${months}-Month Evaluation Due`
    const description = `This is your STEM OPT ${months}-month evaluation deadline. Please submit Form I-983 evaluation to your DSO before the deadline.`
    
    events.push(...buildEvent(summary, evaluationDate, description, reminders))
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OPT Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadIcsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
