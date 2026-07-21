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

ChartJS.defaults.font.family = "'Plus Jakarta Sans', sans-serif"

function useChartColors() {
  const dark = useAppStore((s) => s.dark)
  return {
    text: dark ? '#cbd5e1' : '#475569',
    grid: dark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.15)',
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
              backgroundColor: ['#0284c7', '#f59e0b', '#cbd5e1'],
              borderWidth: 2,
              borderColor: '#ffffff',
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
              backgroundColor: '#94a3b8',
              borderRadius: 6,
            },
            {
              label: 'Parentese Acoustic Profile',
              data: [90, 85, 92, 88],
              backgroundColor: '#c026d3',
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
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#059669',
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
