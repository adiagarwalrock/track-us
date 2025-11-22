import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  AppState,
  EmploymentSpan,
  EADPeriod,
  CalculationResult,
} from '../types'
import { calculateUnemployment } from '../utils/calculator'
import { saveState, loadState } from '../utils/storage'
import { v4 as uuidv4 } from 'uuid'

export const useAppStore = defineStore('app', () => {
  // State
  const optPeriod = ref<EADPeriod | null>(null)
  const stemPeriod = ref<EADPeriod | null>(null)
  const hasStemExtension = ref(false)
  const employmentSpans = ref<EmploymentSpan[]>([])
  const calculationResult = ref<CalculationResult | null>(null)

  // Computed
  const hasData = computed(() => {
    return optPeriod.value !== null || employmentSpans.value.length > 0
  })

  const canCalculate = computed(() => {
    return optPeriod.value !== null
  })

  // Actions
  function setOPTPeriod(startDate: Date, endDate: Date) {
    optPeriod.value = {
      startDate,
      endDate,
      type: 'OPT',
    }
    recalculate()
  }

  function setSTEMPeriod(startDate: Date, endDate: Date) {
    stemPeriod.value = {
      startDate,
      endDate,
      type: 'STEM',
    }
    recalculate()
  }

  function toggleStemExtension(enabled: boolean) {
    hasStemExtension.value = enabled
    if (!enabled) {
      stemPeriod.value = null
    }
    recalculate()
  }

  function addEmploymentSpan(
    employerName: string,
    startDate: Date,
    endDate: Date | null
  ) {
    const newSpan: EmploymentSpan = {
      id: uuidv4(),
      employerName,
      startDate,
      endDate,
    }
    employmentSpans.value.push(newSpan)
    recalculate()
  }

  function updateEmploymentSpan(
    id: string,
    employerName: string,
    startDate: Date,
    endDate: Date | null
  ) {
    const index = employmentSpans.value.findIndex((span) => span.id === id)
    if (index !== -1) {
      employmentSpans.value[index] = {
        id,
        employerName,
        startDate,
        endDate,
      }
      recalculate()
    }
  }

  function deleteEmploymentSpan(id: string) {
    employmentSpans.value = employmentSpans.value.filter(
      (span) => span.id !== id
    )
    recalculate()
  }

  function recalculate() {
    if (canCalculate.value) {
      calculationResult.value = calculateUnemployment(
        optPeriod.value,
        stemPeriod.value,
        employmentSpans.value
      )
    } else {
      calculationResult.value = null
    }
  }

  function clearAllData() {
    optPeriod.value = null
    stemPeriod.value = null
    hasStemExtension.value = false
    employmentSpans.value = []
    calculationResult.value = null
  }

  function hydrateFromStorage() {
    const savedState = loadState()
    if (savedState) {
      optPeriod.value = savedState.optPeriod ?? null
      stemPeriod.value = savedState.stemPeriod ?? null
      hasStemExtension.value = savedState.hasStemExtension ?? false
      employmentSpans.value = savedState.employmentSpans ?? []
      recalculate()
    }
  }

  // Watch for state changes and persist to localStorage
  watch(
    [optPeriod, stemPeriod, hasStemExtension, employmentSpans],
    () => {
      const state: AppState = {
        optPeriod: optPeriod.value,
        stemPeriod: stemPeriod.value,
        hasStemExtension: hasStemExtension.value,
        employmentSpans: employmentSpans.value,
        calculationResult: calculationResult.value,
      }
      saveState(state)
    },
    { deep: true }
  )

  return {
    // State
    optPeriod,
    stemPeriod,
    hasStemExtension,
    employmentSpans,
    calculationResult,

    // Computed
    hasData,
    canCalculate,

    // Actions
    setOPTPeriod,
    setSTEMPeriod,
    toggleStemExtension,
    addEmploymentSpan,
    updateEmploymentSpan,
    deleteEmploymentSpan,
    recalculate,
    clearAllData,
    hydrateFromStorage,
  }
})
