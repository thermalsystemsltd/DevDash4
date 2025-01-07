export interface LiveDataReading {
  sensor_id: string;
  sensor_name: string;
  temperature: number;
  timestamp: string;
}

export type LiveDataResponse = LiveDataReading[];

export interface SensorReading {
  timestamp: string;
  temperature: number;
  battery: number;
  rssi: number | null;
}