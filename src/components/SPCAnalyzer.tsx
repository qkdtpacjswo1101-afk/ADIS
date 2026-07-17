import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { LineChart as ChartIcon, AlertTriangle, CheckCircle2, TrendingUp, Cpu, Info } from 'lucide-react';
import { MeasurementData, AnomalyFlag } from '../types';

interface SPCAnalyzerProps {
  measurements: MeasurementData[];
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SPCAnalyzer({ measurements, onUploadFile }: SPCAnalyzerProps) {
  const [selectedPart, setSelectedPart] = useState('All');

  const partNames = useMemo(() => {
    const names = new Set(measurements.map(m => m.partName));
    return ['All', ...Array.from(names)];
  }, [measurements]);

  const filteredMeasurements = useMemo(() => {
    if (selectedPart === 'All') return measurements;
    return measurements.filter(m => m.partName === selectedPart);
  }, [measurements, selectedPart]);

  // Perform rigorous statistical calculations (Cp, Cpk, UCL, LCL, Sigma, Mean)
  const stats = useMemo(() => {
    if (filteredMeasurements.length === 0) return null;

    const values = filteredMeasurements.map(m => m.value);
    const n = values.length;
    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    
    // Sample standard deviation (N-1)
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const sigma = Math.sqrt(variance);

    // Default target limits (grab from the first element or define defaults)
    const lsl = filteredMeasurements[0]?.lsl ?? 12.0;
    const usl = filteredMeasurements[0]?.usl ?? 13.0;

    // Control Limits (3-sigma)
    const ucl = mean + 3 * sigma;
    const lcl = mean - 3 * sigma;

    // Process Capability Indices (Cp, Cpk)
    const cp = (usl - lsl) / (6 * sigma);
    const cpkUpper = (usl - mean) / (3 * sigma);
    const cpkLower = (mean - lsl) / (3 * sigma);
    const cpk = Math.min(cpkUpper, cpkLower);

    // Implement Nelson Rules (Trend Monitoring Anomaly Detection)
    const anomalies: AnomalyFlag[] = [];
    
    values.forEach((v, idx) => {
      const lotNo = filteredMeasurements[idx].lotNo;
      
      // Rule 1: One point is more than 3 sigma from the mean (UCL/LCL breach)
      if (v > ucl || v < lcl) {
        anomalies.push({
          index: idx,
          lotNo,
          value: v,
          ruleViolated: 'Nelson Rule 1',
          description: `관리 한계선(UCL/LCL) 초과 탈피 개소 발견. 관찰 치수: ${v}`
        });
        return;
      }

      // Rule 2: Nine or more consecutive points on the same side of the mean
      if (idx >= 8) {
        const last9 = values.slice(idx - 8, idx + 1);
        const aboveMean = last9.every(x => x > mean);
        const belowMean = last9.every(x => x < mean);
        if (aboveMean || belowMean) {
          anomalies.push({
            index: idx,
            lotNo,
            value: v,
            ruleViolated: 'Nelson Rule 2',
            description: `연속 9개 지점이 평균선 한쪽에 위치 (편향 현상 검출)`
          });
          return;
        }
      }

      // Rule 3: Six consecutive points continually increasing or decreasing
      if (idx >= 5) {
        const last6 = values.slice(idx - 5, idx + 1);
        let increasing = true;
        let decreasing = true;
        for (let j = 1; j < last6.length; j++) {
          if (last6[j] <= last6[j - 1]) increasing = false;
          if (last6[j] >= last6[j - 1]) decreasing = false;
        }
        if (increasing || decreasing) {
          anomalies.push({
            index: idx,
            lotNo,
            value: v,
            ruleViolated: 'Nelson Rule 3',
            description: `연속 6개 지점이 계속 상승 또는 하락 (안정적 추세 이탈)`
          });
          return;
        }
      }

      // Rule 4: Fourteen or more consecutive points alternating up and down
      if (idx >= 13) {
        const last14 = values.slice(idx - 13, idx + 1);
        let alternates = true;
        for (let j = 1; j < last14.length; j++) {
          const diffCurr = last14[j] - last14[j - 1];
          const diffPrev = j > 1 ? last14[j - 1] - last14[j - 2] : 0;
          if (j > 1 && Math.sign(diffCurr) === Math.sign(diffPrev)) {
            alternates = false;
            break;
          }
        }
        if (alternates) {
          anomalies.push({
            index: idx,
            lotNo,
            value: v,
            ruleViolated: 'Nelson Rule 4',
            description: `연속 14개 지점이 상승과 하락을 번갈아 반복 (진동 성분 검출)`
          });
        }
      }
    });

    return {
      mean,
      sigma,
      ucl,
      lcl,
      lsl,
      usl,
      cp,
      cpk,
      anomalies
    };
  }, [filteredMeasurements]);

  // Build sequential plot data for the chart
  const chartData = useMemo(() => {
    return filteredMeasurements.map((m, idx) => {
      const isAnomaly = stats?.anomalies.some(a => a.index === idx);
      const ruleLabel = stats?.anomalies.find(a => a.index === idx)?.ruleViolated || '';
      return {
        sequence: idx + 1,
        lotNo: m.lotNo,
        value: m.value,
        mean: stats ? parseFloat(stats.mean.toFixed(4)) : 0,
        ucl: stats ? parseFloat(stats.ucl.toFixed(4)) : 0,
        lcl: stats ? parseFloat(stats.lcl.toFixed(4)) : 0,
        lsl: m.lsl,
        usl: m.usl,
        isAnomaly,
        anomalyLabel: ruleLabel
      };
    });
  }, [filteredMeasurements, stats]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-[#181818] p-5 rounded-xl border border-[#252525] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#1ed760] text-black p-2.5 rounded-full">
            <ChartIcon size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Smart SPC Quality Analyzer</h2>
            <p className="text-xs text-[#b3b3b3]">X-bar 관리도, 공정 능력 평가 및 Nelson Rules 통계적 이상 탐지 시스템</p>
          </div>
        </div>

        {/* Filters and upload button */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value)}
            className="bg-[#121212] border border-[#4d4d4d] text-white text-xs px-4 py-2 rounded-full font-bold focus:outline-none focus:border-[#1ed760]"
          >
            {partNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <input
            type="file"
            id="spc-csv-upload"
            className="hidden"
            accept=".csv"
            onChange={onUploadFile}
          />
          <label
            htmlFor="spc-csv-upload"
            className="bg-[#1ed760] text-black hover:scale-105 active:scale-95 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
          >
            배치 데이터 (.CSV) 로드
          </label>
        </div>
      </div>

      {/* Stats HUD row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#181818] p-4 rounded-xl border border-[#252525] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#b3b3b3] uppercase tracking-widest">Process Capability (Cp)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-mono text-white">{stats.cp.toFixed(3)}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${stats.cp >= 1.33 ? 'bg-emerald-950 text-[#1ed760]' : 'bg-rose-950 text-rose-400'}`}>
                {stats.cp >= 1.33 ? '우수 (Capable)' : '부족 (Under cap)'}
              </span>
            </div>
            <p className="text-[10px] text-[#b3b3b3] mt-1 leading-relaxed">디자인 공차 대비 공정 산포 능력지수</p>
          </div>

          <div className="bg-[#181818] p-4 rounded-xl border border-[#252525] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#b3b3b3] uppercase tracking-widest">Process Capability (Cpk)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-mono text-[#1ed760]">{stats.cpk.toFixed(3)}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${stats.cpk >= 1.0 ? 'bg-emerald-950 text-[#1ed760]' : 'bg-rose-950 text-rose-400'}`}>
                {stats.cpk >= 1.0 ? '안정 (Stable)' : '조치 요함'}
              </span>
            </div>
            <p className="text-[10px] text-[#b3b3b3] mt-1 leading-relaxed">평균 치우침이 고려된 실질 공정 능력 지수</p>
          </div>

          <div className="bg-[#181818] p-4 rounded-xl border border-[#252525] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#b3b3b3] uppercase tracking-widest">Statistical Limits (3σ)</span>
            <div className="mt-2 space-y-1 text-xs font-mono text-white">
              <div className="flex justify-between">
                <span className="text-rose-400">UCL:</span>
                <span>{stats.ucl.toFixed(4)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1ed760]">CL:</span>
                <span>{stats.mean.toFixed(4)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-400">LCL:</span>
                <span>{stats.lcl.toFixed(4)} mm</span>
              </div>
            </div>
          </div>

          <div className="bg-[#181818] p-4 rounded-xl border border-[#252525] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#b3b3b3] uppercase tracking-widest">Tolerance Specs</span>
            <div className="mt-2 space-y-1 text-xs font-mono text-white">
              <div className="flex justify-between">
                <span className="text-amber-500">USL:</span>
                <span>{stats.usl.toFixed(4)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-500">LSL:</span>
                <span>{stats.lsl.toFixed(4)} mm</span>
              </div>
              <div className="flex justify-between text-[#b3b3b3]">
                <span>표준편차 (σ):</span>
                <span>{stats.sigma.toFixed(5)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Control Chart Display */}
      <div className="bg-[#181818] p-5 rounded-2xl border border-[#252525]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#1ed760]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">X-bar Control Chart & Tolerance Boundaries</span>
          </div>
          <div className="flex gap-4 text-[10px] font-mono text-[#b3b3b3]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span> UCL / LCL (3σ 관리선)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-amber-500 inline-block"></span> USL / LSL (기품원 도면공차)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-[#1ed760] inline-block"></span> CL (공정 평균치)</span>
          </div>
        </div>

        <div className="h-[360px] w-full bg-[#121212] p-4 rounded-xl">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
              <XAxis dataKey="sequence" stroke="#4d4d4d" fontSize={11} tickLine={false} />
              <YAxis domain={['auto', 'auto']} stroke="#4d4d4d" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#181818', borderColor: '#252525' }}
                itemStyle={{ color: '#fff', fontSize: '12px' }}
                labelStyle={{ color: '#b3b3b3', fontSize: '11px', fontFamily: 'monospace' }}
              />
              
              {/* Plot the line */}
              <Line 
                type="monotone" 
                dataKey="value" 
                name="측정 치수" 
                stroke="#ffffff" 
                strokeWidth={2.5} 
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.isAnomaly) {
                    return (
                      <circle cx={cx} cy={cy} r={6} fill="#f3727f" stroke="#fff" strokeWidth={1} />
                    );
                  }
                  return <circle cx={cx} cy={cy} r={4} fill="#1ed760" stroke="#121212" strokeWidth={1.5} />;
                }}
              />
              
              {/* Plot dynamic reference lines based on calculations */}
              {stats && (
                <>
                  <ReferenceLine y={stats.mean} stroke="#1ed760" strokeDasharray="3 3" label={{ value: 'CL', fill: '#1ed760', position: 'right', fontSize: 10, fontFamily: 'monospace' }} />
                  <ReferenceLine y={stats.ucl} stroke="#f3727f" strokeDasharray="4 4" label={{ value: 'UCL', fill: '#f3727f', position: 'right', fontSize: 10, fontFamily: 'monospace' }} />
                  <ReferenceLine y={stats.lcl} stroke="#f3727f" strokeDasharray="4 4" label={{ value: 'LCL', fill: '#f3727f', position: 'right', fontSize: 10, fontFamily: 'monospace' }} />
                  <ReferenceLine y={stats.usl} stroke="#ffa42b" strokeWidth={1.5} label={{ value: 'USL', fill: '#ffa42b', position: 'left', fontSize: 10, fontFamily: 'monospace' }} />
                  <ReferenceLine y={stats.lsl} stroke="#ffa42b" strokeWidth={1.5} label={{ value: 'LSL', fill: '#ffa42b', position: 'left', fontSize: 10, fontFamily: 'monospace' }} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nelson Rules / Anomalies HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#181818] p-5 rounded-xl border border-[#252525] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-amber-500" size={18} />
              <h3 className="text-sm font-bold text-white">Nelson Rules 통계적 징후 알람</h3>
            </div>
            
            {stats && stats.anomalies.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-xs text-[#1ed760]">
                <CheckCircle2 size={18} />
                <span>검출된 이상 변동 징후가 없습니다. 공정이 매우 안정적입니다.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {stats?.anomalies.map((anom, idx) => (
                  <div key={idx} className="bg-[#1f1f1f] border border-rose-950/40 p-3 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
                    <span className="bg-red-950 text-red-400 font-bold px-2.5 py-0.5 rounded-full font-mono text-[10px]">
                      {anom.ruleViolated}
                    </span>
                    <div>
                      <span className="font-mono text-[#b3b3b3] block text-[10px] mb-0.5">배치 로트: {anom.lotNo}</span>
                      <p className="text-[#cbcbcb]">{anom.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-[#252525] flex items-center gap-2 text-[11px] text-[#b3b3b3]">
            <Cpu size={14} className="text-[#1ed760]" />
            <span>기품원 국방 검사 표준에 정의된 통계적 관리 규격 자동 추적</span>
          </div>
        </div>

        {/* Informative Help Card for SPC */}
        <div className="bg-[#181818] p-5 rounded-xl border border-[#252525] space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Info size={16} className="text-[#1ed760]" />
            <span>품질공정능력지수(Cp/Cpk) 해석 길잡이</span>
          </div>
          <div className="text-xs text-[#cbcbcb] space-y-2 leading-relaxed">
            <p>
              • <b>Cp &gt; 1.33</b>: 공정 능력이 우수하며 도면 공차 대비 산포가 좁게 형성되어 안정적인 생산이 유지되고 있음을 의미합니다.
            </p>
            <p>
              • <b>Cpk &lt; 1.00</b>: 평균이 규격 중심선(CL)으로부터 크게 치우쳤거나, 산포가 너무 커 불량 발생 확률이 높으므로 <b>금형 수정, 가공 피드율 보정 또는 치공구 점검</b>이 시급히 요구되는 상태입니다.
            </p>
            <p className="text-[10px] text-[#b3b3b3] font-mono bg-[#121212] p-3 rounded-lg border border-[#252525]">
              Cpk 계산 공식: Min( (USL - Mean)/(3*σ), (Mean - LSL)/(3*σ) )
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
