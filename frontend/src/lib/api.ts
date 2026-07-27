export type HealthStatus = {
  status: "ok";
  service: string;
  database: "ok";
  version: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function getHealth(signal?: AbortSignal): Promise<HealthStatus> {
  const response = await fetch(`${API_URL}/health/`, { signal });

  if (!response.ok) {
    throw new Error(`Health request failed with ${response.status}`);
  }

  return response.json() as Promise<HealthStatus>;
}
