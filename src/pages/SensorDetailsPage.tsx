import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chart.js/auto';
import { useGetSensorListQuery } from '../services/sensorApi';
import { useGetSensorReadingsQuery } from '../services/sensorDataApi';
import { formatSensorSerial } from '../utils/sensorUtils';
import { getChartOptions } from '../utils/chartConfig';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
);

const timeRanges = [
  { label: '24 Hours', hours: 24 },
  { label: '7 Days', hours: 168 },
  { label: '30 Days', hours: 720 },
];

export default function SensorDetailsPage() {
  const { sensorId } = useParams<{ sensorId: string }>();
  const navigate = useNavigate();
  const chartRef = useRef<ChartJS | null>(null);
  const [selectedRange, setSelectedRange] = useState(timeRanges[0]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - selectedRange.hours * 60 * 60 * 1000),
    end: new Date()
  });
  const [isZoomed, setIsZoomed] = useState(false);

  const { data: sensors } = useGetSensorListQuery();
  const sensor = sensors?.find(s => s.id === Number(sensorId));
  
  const { data: readings, isLoading } = useGetSensorReadingsQuery({
    sensorId: Number(sensorId),
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString()
  }, {
    pollingInterval: 30000
  });

  // Cleanup chart instance on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    setDateRange({
      start: new Date(Date.now() - selectedRange.hours * 60 * 60 * 1000),
      end: new Date()
    });
  }, [selectedRange]);

  const moveTimeWindow = (direction: 'forward' | 'backward') => {
    const timeWindow = selectedRange.hours * 60 * 60 * 1000;
    setDateRange(prev => {
      const offset = direction === 'forward' ? timeWindow : -timeWindow;
      return {
        start: new Date(prev.start.getTime() + offset),
        end: new Date(prev.end.getTime() + offset)
      };
    });
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
      setIsZoomed(false);
    }
  };

  if (!sensor) {
    return (
      <div className="p-6">
        <div className="text-red-600">Sensor not found</div>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        label: 'Temperature (°C)',
        data: readings?.map(reading => ({
          x: new Date(reading.timestamp),
          y: reading.temperature
        })) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.3,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHitRadius: 10,
        yAxisID: 'y'
      },
      ...(sensor.type === '3' ? [{
        label: 'Humidity (%RH)',
        data: readings?.map(reading => ({
          x: new Date(reading.timestamp),
          y: reading.hum
        })) || [],
        borderColor: 'rgb(192, 75, 192)',
        tension: 0.3,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHitRadius: 10,
        yAxisID: 'y1'
      }] : [])
    ]
  };

  const chartOptions = getChartOptions({
    sensorName: sensor.name,
    selectedRangeHours: selectedRange.hours,
    onZoomChange: setIsZoomed,
    showHumidity: sensor.type === '3'
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {sensor.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Serial: {formatSensorSerial(sensor.serialNo, sensor.type)}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            {timeRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            {isZoomed && (
              <button
                onClick={handleResetZoom}
                className="px-3 py-1 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Reset Zoom
              </button>
            )}
            <button
              onClick={() => moveTimeWindow('backward')}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Previous period"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => moveTimeWindow('forward')}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Next period"
              disabled={dateRange.end >= new Date()}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative h-[500px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500 dark:text-gray-400">Loading data...</span>
            </div>
          ) : (
            <Line
              ref={chartRef}
              data={chartData}
              options={chartOptions}
              style={{ height: '500px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}