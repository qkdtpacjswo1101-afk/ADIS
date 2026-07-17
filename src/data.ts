import { MeasurementData, SensorLog, KDSStandard } from './types';

// Generate seed SPC measurement data for standard parts
export const SEED_MEASUREMENTS: MeasurementData[] = Array.from({ length: 30 }, (_, i) => {
  const baseValue = 12.5;
  // Introduce a slight drift or spike around index 18 to trigger Nelson Rules
  const randomShift = i === 18 ? 0.95 : (Math.sin(i / 2) * 0.15 + (Math.random() - 0.5) * 0.1);
  const value = parseFloat((baseValue + randomShift).toFixed(3));
  const lsl = 12.0;
  const usl = 13.0;
  
  return {
    id: `m-${i}`,
    timestamp: `2026-07-16T10:${String(i * 2).padStart(2, '0')}:00`,
    lotNo: `LOT-20260716-A${Math.floor(i / 10) + 1}`,
    partName: '신관 결합체 (Fuze Assembly - PGM-200)',
    dimensionName: '조립부 외경 (Coupling Outer Diameter)',
    value,
    lsl,
    usl,
    inspector: '김품질 (Inspector Kim)',
    status: value >= lsl && value <= usl ? 'PASS' : 'FAIL'
  };
});

// Seed data for standard KDS aerospace and PGM specs
export const SEED_KDS_STANDARDS: KDSStandard[] = [
  {
    id: 'kds-1',
    code: 'KDS 1375-4001',
    title: '유도탄용 화공품 안전설계 및 검사 규격',
    category: '화공품 (Pyrotechnics)',
    specValue: '점화 저항: 1.2 ± 0.2 Ω, 절연 저항: 50 MΩ 이상',
    torqueRange: 'N/A',
    cycle: '매 로트 생산시 100% 비파괴 검사',
    page: 14
  },
  {
    id: 'kds-2',
    code: 'KDS 1420-2004',
    title: '신관 안전 장전 장치(SAD) 허용 규격 및 검사 표준',
    category: '신관 (Fuze SAD)',
    specValue: '조립부 외경: 12.5 ± 0.5 mm, 조립 핀 결합력: 25 ~ 35 N',
    torqueRange: '허용 조임 토크: 1.8 ~ 2.4 N·m',
    cycle: '각 배치별 무작위 5샘플 파괴 검사, 100% 외관 검사',
    page: 38
  },
  {
    id: 'kds-3',
    code: 'KDS 5810-1012',
    title: '유도무기 날개 전개부(Control Fin) 정밀 피팅 규격',
    category: '조립 구동계 (Control Fin)',
    specValue: '날개 회전 각도 오차: ± 0.15 deg 이하, 힌지 간극: 0.05 ~ 0.12 mm',
    torqueRange: '고정 볼트 체결 토크: 4.5 ~ 5.5 N·m',
    cycle: '3개월 주기 정기 정밀 교정 및 초도 조립 검사',
    page: 72
  },
  {
    id: 'kds-4',
    code: 'KDS 8415-0098',
    title: '로켓 모터 연소관 체결용 고강도 볼트 검사 규격',
    category: '구조 체결부 (Rocket Motor)',
    specValue: '체결 깊이: 18.00 mm 이상, 나사산 결함 무결성 100%',
    torqueRange: '체결 허용 토크: 12.5 ~ 14.0 N·m',
    cycle: '공정 완료 후 전수 초음파 탐상 검사(UT)',
    page: 105
  }
];

// Generate synthetic sensor logs for Root Cause Analysis
// Let's create an anomaly peak around index 75 where temperature spikes and causes a dimension fault
export const SEED_SENSOR_LOGS: SensorLog[] = Array.from({ length: 100 }, (_, i) => {
  const isAnomalyZone = i >= 70 && i <= 75;
  const temperature = parseFloat((180 + Math.sin(i / 10) * 5 + (isAnomalyZone ? (i - 70) * 12 + Math.random() * 8 : Math.random() * 3)).toFixed(1));
  const pressure = parseFloat((12.4 + Math.cos(i / 8) * 0.4 + (isAnomalyZone ? (i - 70) * 1.5 + Math.random() * 0.5 : Math.random() * 0.2)).toFixed(2));
  const vibration = parseFloat((2.1 + Math.sin(i / 5) * 0.2 + (isAnomalyZone ? 3.5 + Math.random() * 1.5 : Math.random() * 0.4)).toFixed(2));
  const voltage = parseFloat((220.4 + (Math.random() - 0.5) * 1.2).toFixed(1));
  const isDefective = isAnomalyZone && i === 74;

  const baseMinutes = i * 2;
  const hours = Math.floor(baseMinutes / 60);
  const minutes = baseMinutes % 60;
  const timestamp = `2026-07-16T10:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  return {
    timestamp,
    temperature,
    pressure,
    vibration,
    voltage,
    isDefective
  };
});
