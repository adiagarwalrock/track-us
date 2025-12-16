import { describe, it, expect } from 'vitest'
import { createStemEvaluationICS } from '../ics'

describe('createStemEvaluationICS', () => {
  it('generates ICS with 4 evaluation events', () => {
    const stemStartDate = new Date('2024-07-15')
    const ics = createStemEvaluationICS(stemStartDate)

    expect(ics).not.toBeNull()
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('PRODID:-//OPT Tracker//EN')

    // Should have 4 events (6, 12, 18, 24 months)
    const eventCount = (ics!.match(/BEGIN:VEVENT/g) || []).length
    expect(eventCount).toBe(4)
  })

  it('includes correct milestone months in event summaries', () => {
    const stemStartDate = new Date('2024-07-15')
    const ics = createStemEvaluationICS(stemStartDate)

    expect(ics).toContain('STEM OPT 6-Month Evaluation Due')
    expect(ics).toContain('STEM OPT 12-Month Evaluation Due')
    expect(ics).toContain('STEM OPT 18-Month Evaluation Due')
    expect(ics).toContain('STEM OPT 24-Month Evaluation Due')
  })

  it('includes Form I-983 in descriptions', () => {
    const stemStartDate = new Date('2024-07-15')
    const ics = createStemEvaluationICS(stemStartDate)

    expect(ics).toContain('Form I-983')
    expect(ics).toContain('DSO')
  })

  it('includes reminders for each event', () => {
    const stemStartDate = new Date('2024-07-15')
    const ics = createStemEvaluationICS(stemStartDate)

    // Each event should have 3 reminders (30, 7, 1 days)
    const alarmCount = (ics!.match(/BEGIN:VALARM/g) || []).length
    expect(alarmCount).toBe(12) // 4 events × 3 reminders

    // Check for specific reminder periods
    expect(ics).toContain('TRIGGER:-P30D') // 30 days before
    expect(ics).toContain('TRIGGER:-P7D')  // 7 days before
    expect(ics).toContain('TRIGGER:-P1D')  // 1 day before
  })

  it('calculates correct dates for milestones', () => {
    const stemStartDate = new Date('2024-01-15')
    const ics = createStemEvaluationICS(stemStartDate)

    // 6 months from Jan 15, 2024 = Jul 15, 2024
    expect(ics).toContain('20240715')
    // 12 months from Jan 15, 2024 = Jan 15, 2025
    expect(ics).toContain('20250115')
    // 18 months from Jan 15, 2024 = Jul 15, 2025
    expect(ics).toContain('20250715')
    // 24 months from Jan 15, 2024 = Jan 15, 2026
    expect(ics).toContain('20260115')
  })

  it('returns null if no start date provided', () => {
    const ics = createStemEvaluationICS(null as any)
    expect(ics).toBeNull()
  })

  it('handles leap year dates correctly', () => {
    const stemStartDate = new Date('2024-02-29') // Leap year
    const ics = createStemEvaluationICS(stemStartDate)

    expect(ics).not.toBeNull()
    // 6 months from Feb 29, 2024 should be Aug 29, 2024
    expect(ics).toContain('20240829')
    // 12 months from Feb 29, 2024 should be Feb 28, 2025 (not a leap year)
    expect(ics).toContain('20250228')
  })
})
