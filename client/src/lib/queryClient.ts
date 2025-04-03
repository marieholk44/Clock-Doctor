import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { storage } from "./storage";
import { Recording, Measurement, InsertRecording, InsertMeasurement } from "./schema";

// Custom query function for local storage operations
export function getQueryFn<T>(options: {}): QueryFunction<T> {
  return async ({ queryKey }) => {
    const [path, ...params] = queryKey as string[];
    
    // Parse the path and route to appropriate storage methods
    if (path === '/api/recordings') {
      return await storage.getAllRecordings() as unknown as T;
    } 
    else if (path.match(/\/api\/recordings\/\d+$/)) {
      const id = parseInt(path.split('/').pop() || '0');
      return await storage.getRecording(id) as unknown as T;
    }
    else if (path.match(/\/api\/recordings\/\d+\/measurements$/)) {
      const id = parseInt(path.split('/')[3]);
      return await storage.getMeasurementsByRecordingId(id) as unknown as T;
    }
    
    throw new Error(`Unknown query path: ${path}`);
  };
}

// For mutations (create/update operations)
export async function localStorageRequest<T>(
  method: string,
  path: string,
  data?: unknown,
): Promise<T> {
  if (method === 'POST' && path === '/api/recordings' && data) {
    return await storage.createRecording(data as InsertRecording) as unknown as T;
  }
  else if (method === 'POST' && path.match(/\/api\/recordings\/\d+\/measurements$/) && data) {
    const recordingId = parseInt(path.split('/')[3]);
    const measurementData = {
      ...data as object,
      recordingId,
    } as InsertMeasurement;
    
    return await storage.createMeasurement(measurementData) as unknown as T;
  }
  
  throw new Error(`Unknown mutation: ${method} ${path}`);
}

// API request function compatible with the existing application's mutation pattern
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string,
  data?: unknown,
): Promise<T> {
  return localStorageRequest<T>(method, path, data);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({}),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
