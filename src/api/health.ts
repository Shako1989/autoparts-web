import axios from 'axios';

export type HealthResponse = { status: string };

const healthClient = axios.create({ baseURL: '/actuator', timeout: 5_000 });

export async function getHealth(): Promise<HealthResponse> {
  const r = await healthClient.get<HealthResponse>('/health');
  return r.data;
}
