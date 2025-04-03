import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { storage } from "./storage";
import { Recording, Measurement, InsertRecording, InsertMeasurement } from "./schema";

// This file has been updated to use only localStorage with no backend dependencies

// Custom query function for local storage operations
export function getQueryFn<T>(options: {}): QueryFunction<T> {
  return async ({ queryKey }) => {
    // Log that we're using the standalone mode
    console.log("Using frontend-only mode with localStorage");
    
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
  // Log the operation in standalone mode
  console.log(`Performing ${method} operation on ${path} in frontend-only mode`);
  
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

// API request function (uses localStorage in frontend-only mode)
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string,
  data?: unknown,
): Promise<T> {
  // Always use localStorage for all operations
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
