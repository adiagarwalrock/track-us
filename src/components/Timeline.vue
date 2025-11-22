<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../stores/app'
import {
  addDays,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  max as maxDate,
  min as minDate,
  startOfDay,
} from 'date-fns'

const store = useAppStore()

type SegmentType = 'employed' | 'unemployed'

interface TimelineSegment {
  type: SegmentType
  startDate: Date
  endDate: Date
  percentage: number
}

interface TimelineData {
  start: Date
  end: Date
  totalDays: number
  segments: TimelineSegment[]
  hasStarted: boolean
}

const timelineData = computed(() => {
  if (!store.optPeriod) return null

  const start = startOfDay(store.optPeriod.startDate)
  const fullEnd = startOfDay(
    store.stemPeriod?.endDate || store.optPeriod.endDate
  )
  const today = startOfDay(new Date())
  const end = minDate([fullEnd, today])

  if (isBefore(end, start)) {
    return {
      start,
      end: start,
      totalDays: 0,
      segments: [],
      hasStarted: false,
    } satisfies TimelineData
  }

  const totalDays = differenceInCalendarDays(end, start) + 1

  // Create segments for employed and unemployed periods
  const segments: TimelineSegment[] = []

  // Sort employment spans by start date
  const sortedSpans = [...store.employmentSpans].sort((a, b) =>
    differenceInCalendarDays(a.startDate, b.startDate)
  )

  let currentDate = start

  sortedSpans.forEach((span) => {
    const normalizedStart = startOfDay(span.startDate)
    const normalizedEnd = span.endDate
      ? startOfDay(span.endDate)
      : today
    const spanStart = maxDate([normalizedStart, start])
    const spanEnd = minDate([normalizedEnd, end])

    if (
      isAfter(spanStart, end) ||
      isBefore(spanEnd, start) ||
      isBefore(spanEnd, spanStart) ||
      isBefore(spanEnd, currentDate)
    ) {
      return
    }

    // Add unemployed segment before this employment
    if (isBefore(currentDate, spanStart)) {
      const unemployedEnd = addDays(spanStart, -1)
      if (!isBefore(unemployedEnd, currentDate)) {
        const unemployedDays =
          differenceInCalendarDays(unemployedEnd, currentDate) + 1
        segments.push({
          type: 'unemployed',
          startDate: currentDate,
          endDate: unemployedEnd,
          percentage: (unemployedDays / totalDays) * 100,
        })
      }
    }

    // Add employed segment
    const employedStart = isBefore(spanStart, currentDate)
      ? currentDate
      : spanStart
    const employedDays =
      differenceInCalendarDays(spanEnd, employedStart) + 1
    if (employedDays > 0) {
      segments.push({
        type: 'employed',
        startDate: employedStart,
        endDate: spanEnd,
        percentage: (employedDays / totalDays) * 100,
      })
    }

    currentDate = addDays(spanEnd, 1)
  })

  // Add final unemployed segment if needed
  if (!isAfter(currentDate, end)) {
    const unemployedDays =
      differenceInCalendarDays(end, currentDate) + 1
    segments.push({
      type: 'unemployed',
      startDate: currentDate,
      endDate: end,
      percentage: (unemployedDays / totalDays) * 100,
    })
  }

  return {
    start,
    end,
    totalDays,
    segments,
    hasStarted: true,
  } satisfies TimelineData
})

function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy')
}
</script>

<template>
  <div>
    <!-- No Data State -->
    <div
      v-if="!timelineData"
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
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No timeline data</h3>
      <p class="mt-1 text-sm text-gray-500">
        Enter your EAD dates to see the timeline.
      </p>
    </div>

    <div
      v-else-if="!timelineData.hasStarted"
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">OPT period not started</h3>
      <p class="mt-1 text-sm text-gray-500">
        The timeline will appear once your OPT start date has passed.
      </p>
    </div>

    <!-- Timeline -->
    <div v-else class="space-y-4">
      <!-- Date Range -->
      <div class="flex justify-between text-sm text-gray-600">
        <span>{{ formatDate(timelineData.start) }}</span>
        <span class="font-medium">{{ timelineData.totalDays }} days</span>
        <span>{{ formatDate(timelineData.end) }}</span>
      </div>

      <!-- Visual Timeline Bar -->
      <div class="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
        <div class="absolute inset-0 flex">
          <div
            v-for="(segment, index) in timelineData.segments"
            :key="index"
            :class="[
              'h-full transition-all duration-300',
              segment.type === 'employed'
                ? 'bg-green-500'
                : 'bg-red-400',
            ]"
            :style="{ width: `${segment.percentage}%` }"
            :title="`${segment.type === 'employed' ? 'Employed' : 'Unemployed'}: ${formatDate(segment.startDate)} - ${formatDate(segment.endDate)}`"
          ></div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex justify-center space-x-6 text-sm">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span class="text-gray-700">Employed</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-red-400 rounded mr-2"></div>
          <span class="text-gray-700">Unemployed</span>
        </div>
      </div>

      <!-- Segments Details -->
      <div v-if="timelineData.segments.length > 0" class="mt-6">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Period Details</h4>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div
            v-for="(segment, index) in timelineData.segments"
            :key="index"
            class="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded"
          >
            <div class="flex items-center space-x-2">
              <div
                :class="[
                  'w-3 h-3 rounded-full',
                  segment.type === 'employed' ? 'bg-green-500' : 'bg-red-400',
                ]"
              ></div>
              <span class="font-medium text-gray-900">
                {{ segment.type === 'employed' ? 'Employed' : 'Unemployed' }}
              </span>
            </div>
            <span class="text-gray-600">
              {{ formatDate(segment.startDate) }} - {{ formatDate(segment.endDate) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
