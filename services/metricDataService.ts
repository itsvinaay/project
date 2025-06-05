// A simple service to manage metric data
// In a real app, this would connect to Supabase or another backend

// Define the MetricEntry interface
export interface MetricEntry {
  id: string;
  metricId: string; // e.g., 'weight', 'chest', etc.
  value: string;
  unit: string;
  date: string;
  time: string;
  timestamp: number;
}

// In-memory storage for metric data (would be replaced with Supabase in production)
let metricData: MetricEntry[] = [
  // Sample weight data
  {
    id: '1',
    metricId: 'weight',
    value: '70',
    unit: 'kg',
    date: new Date().toISOString(),
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    timestamp: Date.now()
  },
  {
    id: '2',
    metricId: 'weight',
    value: '69.5',
    unit: 'kg',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    timestamp: Date.now() - 86400000
  },
  // Sample chest data
  {
    id: '3',
    metricId: 'chest',
    value: '90',
    unit: 'cm',
    date: new Date().toISOString(),
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    timestamp: Date.now()
  }
];

// Function to add a new metric entry
export const addMetricEntry = (entry: Omit<MetricEntry, 'id' | 'timestamp'>) => {
  console.log('Adding new metric entry:', entry);
  
  // Ensure date is in ISO format
  let entryDate = entry.date;
  if (typeof entryDate === 'string' && !entryDate.includes('T')) {
    // If it's not already in ISO format, convert it
    const date = new Date(entryDate);
    if (!isNaN(date.getTime())) {
      entryDate = date.toISOString();
    }
  }
  
  const newEntry: MetricEntry = {
    ...entry,
    date: entryDate,
    id: Math.random().toString(36).substring(2, 15),
    timestamp: Date.now()
  };
  
  console.log('New entry with ID:', newEntry.id);
  
  // Add to the beginning of the array
  metricData = [newEntry, ...metricData];
  console.log('Total metric entries after add:', metricData.length);
  
  return newEntry;
};

// Function to get all entries for a specific metric
export const getMetricEntries = (metricId: string): MetricEntry[] => {
  console.log(`Getting entries for metric: ${metricId}, total entries in store: ${metricData.length}`);
  
  const filteredEntries = metricData.filter(entry => entry.metricId === metricId);
  console.log(`Found ${filteredEntries.length} entries for metric ${metricId}`);
  
  // Log the first entry if available
  if (filteredEntries.length > 0) {
    console.log('First entry:', JSON.stringify(filteredEntries[0]));
  }
  
  return filteredEntries.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
};

// Function to check if any data exists for a metric
export const hasMetricData = (metricId: string): boolean => {
  console.log(`Checking if metric ${metricId} has data, total entries: ${metricData.length}`);
  const hasData = metricData.some(entry => entry.metricId === metricId);
  console.log(`Metric ${metricId} has data: ${hasData}`);
  return hasData;
};

// Function to add multiple metric entries at once (for log all metrics)
export const addMultipleMetricEntries = (entries: Omit<MetricEntry, 'id' | 'timestamp'>[]) => {
  const newEntries = entries.map(entry => ({
    ...entry,
    id: Math.random().toString(36).substring(2, 15),
    timestamp: Date.now()
  }));
  
  metricData = [...newEntries, ...metricData];
  return newEntries;
};
