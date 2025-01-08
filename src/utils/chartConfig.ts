import { ChartOptions } from 'chart.js';
import { enUS } from 'date-fns/locale';

interface ChartConfigOptions {
  sensorName: string;
  selectedRangeHours: number;
  onZoomChange: (zoomed: boolean) => void;
  showHumidity: boolean;
}

export const getChartOptions = ({
  sensorName,
  selectedRangeHours,
  onZoomChange,
  showHumidity
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
      text: `${sensorName} - Temperature${showHumidity ? ' & Humidity' : ''} Readings`
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
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Temperature (°C)'
      }
    },
    y1: {
      type: 'linear',
      display: showHumidity,
      position: 'right',
      title: {
        display: true,
        text: 'Humidity (%RH)'
      },
      grid: {
        drawOnChartArea: false
      }
    }
  }
});