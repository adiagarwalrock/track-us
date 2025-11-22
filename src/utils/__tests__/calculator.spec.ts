import { describe, it, expect } from 'vitest'
import { calculateUnemployment } from '../calculator'
import type { EADPeriod } from '../../types'

function createPeriod(
  start: string,
  end: string,
  type: 'OPT' | 'STEM'
): EADPeriod {
  return {
    startDate: new Date(start),
    endDate: new Date(end),
    type,
  }
}

describe('calculateUnemployment', () => {
  it('only counts unemployment days that have actually elapsed', () => {
    const optPeriod = createPeriod('2024-07-15', '2025-07-14', 'OPT')

    const result = calculateUnemployment(optPeriod, null, [], {
      referenceDate: new Date('2024-08-01'),
    })

    expect(result).not.toBeNull()
    expect(result!.phase1.usedDays).toBe(18)
    expect(result!.phase1.remainingDays).toBe(72)
    expect(result!.totalUsedDays).toBe(18)
  })

  it('reports zero usage before the OPT period starts', () => {
    const optPeriod = createPeriod('2024-07-15', '2025-07-14', 'OPT')

    const result = calculateUnemployment(optPeriod, null, [], {
      referenceDate: new Date('2024-06-01'),
    })

    expect(result).not.toBeNull()
    expect(result!.phase1.usedDays).toBe(0)
    expect(result!.phase1.remainingDays).toBe(90)
    expect(result!.totalUsedDays).toBe(0)
    expect(result!.status).toBe('normal')
  })

  it('never produces negative STEM limits and still clamps to elapsed days', () => {
    const optPeriod = createPeriod('2024-07-15', '2025-07-14', 'OPT')
    const stemPeriod = createPeriod('2025-07-15', '2027-07-14', 'STEM')

    const result = calculateUnemployment(optPeriod, stemPeriod, [], {
      referenceDate: new Date('2025-08-01'),
    })

    expect(result).not.toBeNull()
    expect(result!.phase1.usedDays).toBe(365)
    expect(result!.phase2).not.toBeNull()
    expect(result!.phase2!.limitDays).toBe(0)
    expect(result!.phase2!.usedDays).toBe(18)
    expect(result!.totalUsedDays).toBe(383)
    expect(result!.totalAllowedDays).toBe(150)
  })

  it('only counts the gap before the first employment entry', () => {
    const optPeriod = createPeriod('2024-07-16', '2025-07-14', 'OPT')
    const spans = [
      {
        id: '1',
        employerName: 'Soopra.ai',
        startDate: new Date('2024-08-01'),
        endDate: null,
      },
    ]

    const result = calculateUnemployment(optPeriod, null, spans, {
      referenceDate: new Date('2025-07-14'),
    })

    expect(result).not.toBeNull()
    expect(result!.phase1.usedDays).toBe(16)
    expect(result!.phase1.remainingDays).toBe(74)
  })
})
