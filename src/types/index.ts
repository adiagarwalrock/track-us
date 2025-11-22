/**
 * Represents a single employment period
 */
export interface EmploymentSpan {
  id: string
  employerName: string
  startDate: Date
  endDate: Date | null // null means ongoing employment
}

/**
 * Represents an EAD (Employment Authorization Document) period
 */
export interface EADPeriod {
  startDate: Date
  endDate: Date
  type: 'OPT' | 'STEM'
}

/**
 * Summary of unemployment days for a specific phase
 */
export interface UnemploymentSummary {
  phase: 'OPT' | 'STEM'
  usedDays: number
  remainingDays: number
  limitDays: number
  percentage: number // Percentage of limit used
}

/**
 * Overall status of the user's unemployment situation
 */
export type ComplianceStatus = 'normal' | 'warning' | 'violation'

/**
 * Complete calculation result
 */
export interface CalculationResult {
  phase1: UnemploymentSummary // OPT phase
  phase2: UnemploymentSummary | null // STEM phase (if applicable)
  totalUsedDays: number
  totalAllowedDays: number
  status: ComplianceStatus
  statusMessage: string
}

/**
 * Serializable version of EmploymentSpan for localStorage
 */
export interface EmploymentSpanSerialized {
  id: string
  employerName: string
  startDate: string // ISO date string
  endDate: string | null
}

/**
 * Serializable version of EADPeriod for localStorage
 */
export interface EADPeriodSerialized {
  startDate: string // ISO date string
  endDate: string
  type: 'OPT' | 'STEM'
}

/**
 * Application state structure for Pinia store
 */
export interface AppState {
  optPeriod: EADPeriod | null
  stemPeriod: EADPeriod | null
  hasStemExtension: boolean
  employmentSpans: EmploymentSpan[]
  calculationResult: CalculationResult | null
}

/**
 * Form validation error
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Merged employment span (internal use for calculations)
 */
export interface MergedSpan {
  startDate: Date
  endDate: Date
}
