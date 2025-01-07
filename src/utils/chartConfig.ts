import { ChartOptions } from 'chart.js';
import { enUS } from 'date-fns/locale';

interface ChartConfigOptions {
  sensorName: string;
  selectedRangeHours: number;
  onZoomChange: (zoomed: boolean) => void;
}

export const getChartOptions = ({
  sensorName,
  selectedRangeHours,
  onZoomChange
}: ChartConfigOptions): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0
  },
  layout: {
    padding: {
      top: 10,
      right: 20,
      bottom: 10,
      left: 10
    }
  },
  plugins: {
    zoom: {
      pan: {
        enabled: true,
        mode: 'x',
      },
      zoom: {
        wheel: {
          enabled: true,
          onZoom: () => onZoomChange(true)
        },
        drag: {
          enabled: true,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
          threshold: 10,
          onZoom: () => onZoomChange(true)
        },
        mode: 'x',
      },
    },
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: `Temperature Readings for ${sensorName}`
    }
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: selectedRangeHours <= 24 ? 'hour' : 'day',
        displayFormats: {
          hour: 'HH:mm',
          day: 'MMM d'
        },
        adapters: {
          date: {
            locale: enUS
          }
        }
      },
      title: {
        display: true,
        text: 'Time'
      },
      ticks: {
        maxRotation: 0
      }
    },
    y: {
      title: {
        display: true,
        text: 'Temperature (°C)'
      },
      beginAtZero: false
    }
  }
});