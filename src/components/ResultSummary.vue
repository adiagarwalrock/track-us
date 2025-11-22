<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../stores/app'
import BaseAlert from './base/BaseAlert.vue'

const store = useAppStore()

const statusColor = computed(() => {
  if (!store.calculationResult) return 'gray'

  switch (store.calculationResult.status) {
    case 'normal':
      return 'green'
    case 'warning':
      return 'yellow'
    case 'violation':
      return 'red'
    default:
      return 'gray'
  }
})

const statusType = computed(() => {
  if (!store.calculationResult) return 'info'

  switch (store.calculationResult.status) {
    case 'normal':
      return 'success'
    case 'warning':
      return 'warning'
    case 'violation':
      return 'error'
    default:
      return 'info'
  }
})

function getPercentageColor(percentage: number): string {
  if (percentage >= 80) return 'text-red-600'
  if (percentage >= 60) return 'text-yellow-600'
  return 'text-green-600'
}
</script>

<template>
  <div>
    <!-- No Data State -->
    <div
      v-if="!store.calculationResult"
      class="text-center py-12 text-gray-500"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No data yet</h3>
      <p class="mt-1 text-sm text-gray-500">
        Enter your EAD dates to see your unemployment summary.
      </p>
    </div>

    <!-- Results -->
    <div v-else class="space-y-6">
      <!-- Status Alert -->
      <BaseAlert :type="statusType">
        <p class="font-medium">{{ store.calculationResult.statusMessage }}</p>
      </BaseAlert>

      <!-- Overall Summary -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <p class="text-sm text-gray-600">Total Used</p>
            <p :class="['text-2xl font-bold', getPercentageColor((store.calculationResult.totalUsedDays / store.calculationResult.totalAllowedDays) * 100)]">
              {{ store.calculationResult.totalUsedDays }}
            </p>
            <p class="text-xs text-gray-500">days</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Total Allowed</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ store.calculationResult.totalAllowedDays }}
            </p>
            <p class="text-xs text-gray-500">days</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="text-gray-600">Usage</span>
            <span
              :class="[
                'font-medium',
                getPercentageColor((store.calculationResult.totalUsedDays / store.calculationResult.totalAllowedDays) * 100)
              ]"
            >
              {{ Math.round((store.calculationResult.totalUsedDays / store.calculationResult.totalAllowedDays) * 100) }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              :class="[
                'h-2.5 rounded-full transition-all duration-300',
                statusColor === 'green' ? 'bg-green-500' :
                statusColor === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              ]"
              :style="{
                width: `${Math.min(100, (store.calculationResult.totalUsedDays / store.calculationResult.totalAllowedDays) * 100)}%`
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Phase 1: OPT -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-3">Phase 1: Post-Completion OPT</h4>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div>
            <p class="text-xs text-gray-600">Used</p>
            <p class="text-lg font-bold text-gray-900">
              {{ store.calculationResult.phase1.usedDays }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Remaining</p>
            <p class="text-lg font-bold text-primary-600">
              {{ store.calculationResult.phase1.remainingDays }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Limit</p>
            <p class="text-lg font-bold text-gray-900">
              {{ store.calculationResult.phase1.limitDays }}
            </p>
          </div>
        </div>

        <div class="mt-3">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              :class="[
                'h-2 rounded-full',
                store.calculationResult.phase1.percentage >= 80 ? 'bg-red-500' :
                store.calculationResult.phase1.percentage >= 60 ? 'bg-yellow-500' :
                'bg-green-500'
              ]"
              :style="{
                width: `${Math.min(100, store.calculationResult.phase1.percentage)}%`
              }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 text-right mt-1">
            {{ Math.round(store.calculationResult.phase1.percentage) }}% used
          </p>
        </div>
      </div>

      <!-- Phase 2: STEM (if applicable) -->
      <div
        v-if="store.calculationResult.phase2"
        class="border border-gray-200 rounded-lg p-4"
      >
        <h4 class="font-semibold text-gray-900 mb-3">Phase 2: STEM OPT Extension</h4>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div>
            <p class="text-xs text-gray-600">Used</p>
            <p class="text-lg font-bold text-gray-900">
              {{ store.calculationResult.phase2.usedDays }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Remaining</p>
            <p class="text-lg font-bold text-primary-600">
              {{ store.calculationResult.phase2.remainingDays }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Limit</p>
            <p class="text-lg font-bold text-gray-900">
              {{ store.calculationResult.phase2.limitDays }}
            </p>
          </div>
        </div>

        <div class="mt-3">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              :class="[
                'h-2 rounded-full',
                store.calculationResult.phase2.percentage >= 80 ? 'bg-red-500' :
                store.calculationResult.phase2.percentage >= 60 ? 'bg-yellow-500' :
                'bg-green-500'
              ]"
              :style="{
                width: `${Math.min(100, store.calculationResult.phase2.percentage)}%`
              }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 text-right mt-1">
            {{ Math.round(store.calculationResult.phase2.percentage) }}% used
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
