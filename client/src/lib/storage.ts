import {
  type Recording,
  type InsertRecording,
  type Measurement,
  type InsertMeasurement
} from './schema';

// Interface for storage operations
export interface IStorage {
  // Recording operations
  getAllRecordings(): Promise<Recording[]>;
  getRecording(id: number): Promise<Recording | undefined>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  
  // Measurement operations
  getMeasurementsByRecordingId(recordingId: number): Promise<Measurement[]>;
  createMeasurement(measurement: InsertMeasurement): Promise<Measurement>;
}

// Local storage implementation using IndexedDB
export class LocalStorage implements IStorage {
  private recordings: Map<number, Recording>;
  private measurements: Map<number, Measurement>;
  private recordingIdCounter: number;
  private measurementIdCounter: number;
  
  constructor() {
    this.recordings = new Map();
    this.measurements = new Map();
    
    // Initialize counters from localStorage or default to 1
    this.recordingIdCounter = parseInt(localStorage.getItem('recordingIdCounter') || '1');
    this.measurementIdCounter = parseInt(localStorage.getItem('measurementIdCounter') || '1');
    
    // Load any existing data from localStorage
    this.loadFromLocalStorage();
  }
  
  private loadFromLocalStorage() {
    try {
      // Load recordings
      const storedRecordings = localStorage.getItem('recordings');
      if (storedRecordings) {
        const parsedRecordings = JSON.parse(storedRecordings) as Recording[];
        parsedRecordings.forEach(recording => {
          this.recordings.set(recording.id, recording);
        });
      }
      
      // Load measurements
      const storedMeasurements = localStorage.getItem('measurements');
      if (storedMeasurements) {
        const parsedMeasurements = JSON.parse(storedMeasurements) as Measurement[];
        parsedMeasurements.forEach(measurement => {
          this.measurements.set(measurement.id, measurement);
        });
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // If there's an error, reset the storage
      this.recordings = new Map();
      this.measurements = new Map();
    }
  }
  
  private saveToLocalStorage() {
    try {
      // Save recordings
      localStorage.setItem('recordings', JSON.stringify(Array.from(this.recordings.values())));
      
      // Save measurements
      localStorage.setItem('measurements', JSON.stringify(Array.from(this.measurements.values())));
      
      // Save counters
      localStorage.setItem('recordingIdCounter', this.recordingIdCounter.toString());
      localStorage.setItem('measurementIdCounter', this.measurementIdCounter.toString());
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }
  
  // Recording operations
  async getAllRecordings(): Promise<Recording[]> {
    return Array.from(this.recordings.values());
  }
  
  async getRecording(id: number): Promise<Recording | undefined> {
    return this.recordings.get(id);
  }
  
  async createRecording(recordingData: InsertRecording): Promise<Recording> {
    const id = this.recordingIdCounter++;
    const recording: Recording = { ...recordingData, id };
    this.recordings.set(id, recording);
    this.saveToLocalStorage();
    return recording;
  }
  
  // Measurement operations
  async getMeasurementsByRecordingId(recordingId: number): Promise<Measurement[]> {
    return Array.from(this.measurements.values()).filter(
      measurement => measurement.recordingId === recordingId
    );
  }
  
  async createMeasurement(measurementData: InsertMeasurement): Promise<Measurement> {
    const id = this.measurementIdCounter++;
    const measurement: Measurement = { ...measurementData, id };
    this.measurements.set(id, measurement);
    this.saveToLocalStorage();
    return measurement;
  }
}

// Export singleton instance
export const storage = new LocalStorage();