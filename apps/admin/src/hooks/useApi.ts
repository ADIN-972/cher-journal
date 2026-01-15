import { api } from "../lib/api";

// Simple hook that returns the API client
export function useApi() {
  return api;
}
