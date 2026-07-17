export interface MeasurementData {
  id: string;
  timestamp: string;
  lotNo: string;
  partName: string;
  dimensionName: string;
  value: number;
  lsl: number;
  usl: number;
  inspector: string;
  status: 'PASS' | 'FAIL';
}

export interface SPCReport {
  partName: string;
  dimensionName: string;
  xbar: number;
  rBar: number;
  ucl: number;
  lcl: number;
  cp: number;
  cpk: number;
  anomalies: AnomalyFlag[];
  measurements: MeasurementData[];
}

export interface AnomalyFlag {
  index: number;
  lotNo: string;
  value: number;
  ruleViolated: string;
  description: string;
}

export interface SensorLog {
  timestamp: string;
  temperature: number; // in Celsius
  pressure: number; // in Bar
  vibration: number; // in mm/s
  voltage: number; // in V
  isDefective: boolean;
}

export interface DefenseReport {
  id: string;
  lotNo: string;
  generatedAt: string;
  partCount: number;
  passCount: number;
  failCount: number;
  status: 'VERIFIED' | 'BLOCKED' | 'PENDING';
  errors: string[];
  docUrl?: string;
}

export interface KDSStandard {
  id: string;
  code: string;
  title: string;
  category: string;
  specValue: string;
  torqueRange: string;
  cycle: string;
  page: number;
}
