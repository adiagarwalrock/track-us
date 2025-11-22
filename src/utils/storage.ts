import type {
  AppState,
  EmploymentSpan,
  EmploymentSpanSerialized,
  EADPeriod,
  EADPeriodSerialized,
} from '../types'

const STORAGE_KEY = 'opt-unemployment-tracker-state'

/**
 * Serializes an EmploymentSpan to a JSON-friendly format
 */
function serializeEmploymentSpan(
  span: EmploymentSpan
): EmploymentSpanSerialized {
  return {
    id: span.id,
    employerName: span.employerName,
    startDate: span.startDate.toISOString(),
    endDate: span.endDate ? span.endDate.toISOString() : null,
  }
}

/**
 * Deserializes an EmploymentSpan from localStorage
 */
function deserializeEmploymentSpan(
  serialized: EmploymentSpanSerialized
): EmploymentSpan {
  return {
    id: serialized.id,
    employerName: serialized.employerName,
    startDate: new Date(serialized.startDate),
    endDate: serialized.endDate ? new Date(serialized.endDate) : null,
  }
}

/**
 * Serializes an EADPeriod to a JSON-friendly format
 */
function serializeEADPeriod(period: EADPeriod): EADPeriodSerialized {
  return {
    startDate: period.startDate.toISOString(),
    endDate: period.endDate.toISOString(),
    type: period.type,
  }
}

/**
 * Deserializes an EADPeriod from localStorage
 */
function deserializeEADPeriod(serialized: EADPeriodSerialized): EADPeriod {
  return {
    startDate: new Date(serialized.startDate),
    endDate: new Date(serialized.endDate),
    type: serialized.type,
  }
}

/**
 * Saves the app state to localStorage
 */
export function saveState(state: AppState): void {
  try {
    const serializedState = {
      optPeriod: state.optPeriod
        ? serializeEADPeriod(state.optPeriod)
        : null,
      stemPeriod: state.stemPeriod
        ? serializeEADPeriod(state.stemPeriod)
        : null,
      hasStemExtension: state.hasStemExtension,
      employmentSpans: state.employmentSpans.map(serializeEmploymentSpan),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedState))
  } catch (error) {
    console.error('Failed to save state to localStorage:', error)
  }
}

/**
 * Loads the app state from localStorage
 * Returns null if no state is found or if deserialization fails
 */
export function loadState(): Partial<AppState> | null {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY)

    if (!serializedState) {
      return null
    }

    const parsed = JSON.parse(serializedState)

    return {
      optPeriod: parsed.optPeriod
        ? deserializeEADPeriod(parsed.optPeriod)
        : null,
      stemPeriod: parsed.stemPeriod
        ? deserializeEADPeriod(parsed.stemPeriod)
        : null,
      hasStemExtension: parsed.hasStemExtension ?? false,
      employmentSpans: (parsed.employmentSpans || []).map(
        deserializeEmploymentSpan
      ),
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error)
    return null
  }
}

/**
 * Clears the app state from localStorage
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error)
  }
}

/**
 * Checks if the browser supports localStorage
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}
