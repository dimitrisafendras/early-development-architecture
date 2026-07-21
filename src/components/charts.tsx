import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Legend,
  Tooltip,
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { useAppStore } from '../store'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Legend,
  Tooltip,
)

ChartJS.defaults.font.family = "'Geist Variable', system-ui, sans-serif"

/**
 * Palette + theme aware chart colors. `primary` tracks the active accent palette
 * (blue "Boy" / red "Girl") and lightens for dark theme; `primarySoft` is the
 * lighter ramp step used for secondary segments. Values mirror the ramps in
 * src/design-system/tokens.ts. Neutrals come from the DS neutral ramp.
 */
const paletteHex = {
  blue: {
    primary: { light: '#2172c6', dark: '#5da3ed' }, // 600 / 400
    soft: { light: '#97c6f9', dark: '#3a89da' }, //     300 / 500
  },
  red: {
    primary: { light: '#cc3744', dark: '#f48289' }, // 600 / 400
    soft: { light: '#fcb0b3', dark: '#e25a63' }, //     300 / 500
  },
} as const

function useChartColors() {
  const dark = useAppStore((s) => s.dark)
  const palette = useAppStore((s) => s.palette)
  const mode = dark ? 'dark' : 'light'
  return {
    text: dark ? '#cbd5e1' : '#475569',
    grid: dark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.15)',
    neutral: dark ? '#64748b' : '#cbd5e1',
    surface: dark ? '#262626' : '#ffffff',
    primary: paletteHex[palette].primary[mode],
    primarySoft: paletteHex[palette].soft[mode],
  }
}

export function BrainGrowthChart() {
  const c = useChartColors()
  return (
    <div style={{ position: 'relative', height: 256 }}>
      <Doughnut
        data={{
          labels: ['Newborn Brain Mass (25%)', 'First Year Growth (+45%)', 'Remaining Adult Growth (+30%)'],
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
  return (
    <div style={{ position: 'relative', height: 256 }}>
      <Bar
        data={{
          labels: ['Pitch Variance', 'Vowel Elongation', 'Infant Attention Span', 'Word Retention'],
          datasets: [
            {
              label: 'Standard Adult Speech',
              data: [30, 25, 35, 40],
              backgroundColor: c.neutral,
              borderRadius: 6,
            },
            {
              label: 'Parentese Acoustic Profile',
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

export function TummyTimeChart() {
  const c = useChartColors()
  return (
    <div style={{ position: 'relative', height: 256 }}>
      <Line
        data={{
          labels: ['Birth (Week 1)', '1 Month', '2 Months', '3 Months', '4 Months+'],
          datasets: [
            {
              label: 'Target Daily Minutes',
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
              title: { display: true, text: 'Cumulative Minutes / Day', font: { size: 11 }, color: c.text },
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
