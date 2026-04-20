export interface SyncLog {
  id: string;
  source: string;
  status: 'success' | 'error';
  productsUpdated: number;
  duration: string;
  errorMessage?: string;
  timestamp: string;
}

export const syncLogs: SyncLog[] = [
  { id: 's1', source: 'SAP B1', status: 'success', productsUpdated: 5, duration: '12s', timestamp: '2025-06-09T08:00:00Z' },
  { id: 's2', source: 'SAP B1', status: 'success', productsUpdated: 3, duration: '8s', timestamp: '2025-06-08T08:00:00Z' },
  { id: 's3', source: 'SAP B1', status: 'error', productsUpdated: 0, duration: '45s', errorMessage: 'Connection timeout: Unable to reach SAP B1 server at 192.168.1.100:8080. Retry limit exceeded after 3 attempts.', timestamp: '2025-06-07T08:00:00Z' },
  { id: 's4', source: 'SAP B1', status: 'success', productsUpdated: 12, duration: '22s', timestamp: '2025-06-06T08:00:00Z' },
  { id: 's5', source: 'SAP B1', status: 'success', productsUpdated: 1, duration: '5s', timestamp: '2025-06-05T08:00:00Z' },
  { id: 's6', source: 'SAP B1', status: 'error', productsUpdated: 0, duration: '30s', errorMessage: 'Data validation failed: Product SKU "EXT-9999" not found in local catalog. 2 products skipped due to missing category mapping.', timestamp: '2025-06-04T08:00:00Z' },
  { id: 's7', source: 'SAP B1', status: 'success', productsUpdated: 8, duration: '15s', timestamp: '2025-06-03T08:00:00Z' },
  { id: 's8', source: 'SAP B1', status: 'success', productsUpdated: 4, duration: '10s', timestamp: '2025-06-02T08:00:00Z' },
];
