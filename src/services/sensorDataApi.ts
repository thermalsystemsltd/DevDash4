import { rootApi } from './baseApi';
import { LiveDataResponse, SensorReading } from '../types/sensorData';

export const sensorDataApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getLiveData: builder.query<LiveDataResponse, void>({
      query: () => ({
        url: "/service3/getLiveData",
        method: "GET",
      }),
      providesTags: ['LiveData'],
      transformResponse: (response: any[]) => {
        if (!response || !Array.isArray(response)) {
          console.warn('Invalid live data response:', response);
          return [];
        }
        return response.map(item => ({
          sensor_id: item.sensor_id?.toString() ?? '',
          sensor_name: item.sensor_name ?? '',
          temperature: parseFloat(item.temperature ?? '0'),
          humidity: item.humidity ? parseFloat(item.humidity) : undefined,
          timestamp: item.timestamp
        }));
      }
    }),

    getSensorReadings: builder.query<SensorReading[], { sensorId: number; startDate: string; endDate: string }>({
      query: ({ sensorId, startDate, endDate }) => ({
        url: `/service3/sensors/${sensorId}/readings`,
        method: "GET",
        params: { startDate, endDate }
      }),
      transformResponse: (response: any[]) => {
        if (!Array.isArray(response)) {
          console.warn('Invalid readings response:', response);
          return [];
        }
        return response.map(reading => ({
          timestamp: reading.timestamp,
          temperature: parseFloat(reading.temperature),
          hum: reading.hum ? parseFloat(reading.hum) : undefined,
          battery: parseFloat(reading.Battery || '0'),
          rssi: reading.RSSI ? parseInt(reading.RSSI) : null
        }));
      }
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLiveDataQuery,
  useGetSensorReadingsQuery
} = sensorDataApi;