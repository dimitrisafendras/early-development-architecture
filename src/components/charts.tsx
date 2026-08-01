import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Legend,
  Tooltip,
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { palettes, type PaletteId } from '@dimitrisafendras/liquid-glass/tokens'
import { useAppStore } from '../store'
import { useT } from '../i18n'

ChartJS.register(
  ArcElement,
  BarElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Legend,
  Tooltip,
)

ChartJS.defaults.font.family = "'Comfortaa Variable', ui-rounded, system-ui, sans-serif"

/**
 * Palette + theme aware chart colors, read straight off the design system's
 * ramps rather than copied out of them — chart.js needs literal colors, not
 * `var(--primary)`, and a hand-copied hex table is exactly how the charts once
 * ended up drawing the old crimson beside an already-retuned pink badge.
 *
 * The step choice is the design decision worth keeping here: charts sit on the
 * page background, not on a tinted surface, so `primary` takes the ramp step
 * that reads as the accent at that size (600 in light, 400 in dark) and
 * `primarySoft` the neighbouring step used for secondary segments.
 */
const rampStep = (palette: PaletteId, step: string) => {
  const found = palettes[palette].ramp.find((s) => s.name === step)
  if (!found) throw new Error(`Liquid Glass ramp ${palette} has no step ${step}`)
  return found.hex
}

const CHART_STEPS = {
  primary: { light: '600', dark: '400' },
  soft: { light: '300', dark: '500' },
} as const

/**
 * `scheme` pins a chart to one colour scheme instead of following the app's.
 *
 * The printable report needs it. Chart.js paints to a canvas from JavaScript
 * values, so a `@media print` rule cannot reach these colours the way it
 * reaches the rest of the page — a dark-theme axis label is light grey, and on
 * white paper it is invisible. The report is a sheet of paper whether it is on
 * screen or in a printer, so it asks for `light` and gets it in both.
 */
export type ChartScheme = 'light' | 'dark'

function useChartColors(scheme?: ChartScheme) {
  const themeDark = useAppStore((s) => s.dark)
  const palette = useAppStore((s) => s.palette)
  const dark = scheme ? scheme === 'dark' : themeDark
  const mode = dark ? 'dark' : 'light'
  return {
    text: dark ? '#cbd5e1' : '#475569',
    grid: dark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.15)',
    neutral: dark ? '#64748b' : '#cbd5e1',
    surface: dark ? '#262626' : '#ffffff',
    primary: rampStep(palette, CHART_STEPS.primary[mode]),
    primarySoft: rampStep(palette, CHART_STEPS.soft[mode]),
  }
}

export function BrainGrowthChart() {
  const c = useChartColors()
  const t = useT()
  return (
    <div style={{ position: 'relative', height: 256 }}>
      <Doughnut
        data={{
          labels: [...t.charts.brainGrowth],
          datasets: [
            {
              data: [25, 45, 30],
              backgroundColor: [c.primary, c.primarySoft, c.neutral],
              borderWidth: 2,
              borderColor: c.surface,
              hoverOffset: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 11 }, boxWidth: 12, color: c.text },
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.label}: ${context.raw}%`,
              },
            },
          },
          cutout: '65%',
        }}
      />
    </div>
  )
}

export function ParenteseChart() {
  const c = useChartColors()
  const t = useT()
  return (
    <div style={{ position: 'relative', height: 256 }}>
      <Bar
        data={{
          labels: [...t.charts.parenteseAxis],
          datasets: [
            {
              label: t.charts.parenteseSeries[0],
              data: [30, 25, 35, 40],
              backgroundColor: c.neutral,
              borderRadius: 6,
            },
            {
              label: t.charts.parenteseSeries[1],
              data: [90, 85, 92, 88],
              backgroundColor: c.primary,
              borderRadius: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { callback: (value) => `${value}%`, color: c.text },
              grid: { color: c.grid },
            },
            x: {
              ticks: { color: c.text },
              grid: { color: c.grid },
            },
          },
          plugins: {
            legend: { position: 'top', labels: { font: { size: 11 }, color: c.text } },
          },
        }}
      />
    </div>
  )
}

/**
 * Weekly tummy-time bars with a dashed daily-target reference line (mixed
 * bar+line). Palette/theme aware via useChartColors.
 */
export function TummyWeekChart({
  labels,
  minutes,
  target,
  scheme,
}: {
  labels: string[]
  minutes: number[]
  target: number
  scheme?: ChartScheme
}) {
  const c = useChartColors(scheme)
  const max = Math.max(target, ...minutes, 1)
  return (
    <div style={{ position: 'relative', height: 240 }}>
      <Bar
        data={
          {
            labels,
            datasets: [
              {
                type: 'line' as const,
                label: 'Target',
                data: labels.map(() => target),
                borderColor: c.neutral,
                borderDash: [6, 6],
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
              },
              {
                type: 'bar' as const,
                label: 'Minutes',
                data: minutes,
                backgroundColor: c.primary,
                borderRadius: 6,
                maxBarThickness: 42,
              },
            ],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: Math.ceil((max * 1.2) / 10) * 10,
              ticks: { callback: (v) => `${v}m`, color: c.text },
              grid: { color: c.grid },
            },
            x: { ticks: { color: c.text }, grid: { color: c.grid } },
          },
          plugins: { legend: { position: 'top', labels: { font: { size: 11 }, color: c.text } } },
        }}
      />
    </div>
  )
}

/**
 * Weekly feeding: per-day volume (bars, left axis) with the feed count overlaid
 * as a line (right axis). Palette/theme aware via useChartColors.
 */
export function FeedWeekChart({
  labels,
  ml,
  counts,
  mlLabel,
  feedsLabel,
  scheme,
}: {
  labels: string[]
  ml: number[]
  counts: number[]
  mlLabel: string
  feedsLabel: string
  scheme?: ChartScheme
}) {
  const c = useChartColors(scheme)
  return (
    <div style={{ position: 'relative', height: 240 }}>
      <Bar
        data={
          {
            labels,
            datasets: [
              {
                type: 'line' as const,
                label: feedsLabel,
                data: counts,
                yAxisID: 'y1',
                borderColor: c.neutral,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: c.neutral,
                tension: 0.35,
                fill: false,
              },
              {
                type: 'bar' as const,
                label: mlLabel,
                data: ml,
                backgroundColor: c.primary,
                borderRadius: 6,
                maxBarThickness: 42,
                yAxisID: 'y',
              },
            ],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              position: 'left',
              title: { display: true, text: mlLabel, font: { size: 11 }, color: c.text },
              ticks: { color: c.text },
              grid: { color: c.grid },
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              ticks: { stepSize: 1, precision: 0, color: c.text },
              grid: { drawOnChartArea: false },
            },
            x: { ticks: { color: c.text }, grid: { color: c.grid } },
          },
          plugins: { legend: { position: 'top', labels: { font: { size: 11 }, color: c.text } } },
        }}
      />
    </div>
  )
}

/** Generic growth line (weight or height) over measurement dates. */
export function GrowthChart({
  labels,
  data,
  label,
  yTitle,
  scheme,
}: {
  labels: string[]
  data: (number | null)[]
  label: string
  yTitle: string
  scheme?: ChartScheme
}) {
  const c = useChartColors(scheme)
  return (
    <div style={{ position: 'relative', height: 240 }}>
      <Line
        data={{
          labels,
          datasets: [
            {
              label,
              data,
              borderColor: c.primary,
              backgroundColor: `${c.primary}26`,
              fill: true,
              tension: 0.35,
              spanGaps: true,
              pointBackgroundColor: c.primary,
              pointRadius: 4,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              title: { display: true, text: yTitle, font: { size: 11 }, color: c.text },
              ticks: { color: c.text },
              grid: { color: c.grid },
            },
            x: { ticks: { color: c.text }, grid: { color: c.grid } },
          },
          plugins: { legend: { display: false } },
        }}
      />
    </div>
  )
}

export function TummyTimeChart() {
  const c = useChartColors()
  const t = useT()
  return (
    <div style={{ position: 'relative', height: 256 }}>
      <Line
        data={{
          labels: [...t.charts.tummyAxis],
          datasets: [
            {
              label: t.charts.tummySeries,
              data: [5, 15, 30, 45, 60],
              borderColor: c.primary,
              backgroundColor: `${c.primary}26`,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: c.primary,
              pointRadius: 5,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 70,
              title: { display: true, text: t.charts.tummyYTitle, font: { size: 11 }, color: c.text },
              ticks: { color: c.text },
              grid: { color: c.grid },
            },
            x: {
              ticks: { color: c.text },
              grid: { color: c.grid },
            },
          },
          plugins: { legend: { display: false } },
        }}
      />
    </div>
  )
}
