import { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { Play, Pause, SkipForward, SkipBack, Activity, AlertTriangle, ShieldAlert, Zap, Cpu } from 'lucide-react';
import { SensorLog } from '../types';

interface SensorTraceProps {
  sensorLogs: SensorLog[];
}

export default function SensorTrace({ sensorLogs }: SensorTraceProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Playback control effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= sensorLogs.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 150);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, sensorLogs.length]);

  const activeLogs = useMemo(() => {
    return sensorLogs.slice(0, currentIndex + 1);
  }, [sensorLogs, currentIndex]);

  const currentLog = useMemo(() => {
    return sensorLogs[currentIndex] || sensorLogs[0];
  }, [sensorLogs, currentIndex]);

  // Track the peak alarm zones
  const isTemperatureHigh = currentLog.temperature > 220;
  const isPressureHigh = currentLog.pressure > 16.0;
  const isVibrationHigh = currentLog.vibration > 4.5;
  const showPredictiveAlarm = isTemperatureHigh || isPressureHigh || isVibrationHigh;

  return (
    <div className="space-y-6">
      {/* Upper header summary */}
      <div className="bg-[#181818] p-6 rounded-xl border border-[#252525]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1ed760] text-black p-2.5 rounded-full">
              <Activity size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sensor-based Process Root Cause Trace</h2>
              <p className="text-xs text-[#b3b3b3]">설비 센서(온도, 압력, 진동) 로그 시계열 타임라인 상관관계 분석</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono bg-[#121212] px-4 py-2 rounded-full text-[#1ed760] border border-[#252525]">
            <span className="w-1.5 h-1.5 bg-[#1ed760] rounded-full animate-ping"></span>
            <span>REAL-TIME SCENARIO TRACE ACTIVE</span>
          </div>
        </div>
        <p className="text-xs text-[#b3b3b3] mt-4 leading-relaxed max-w-4xl">
          품질 결함이 발생된 특정 시점의 설비 센서 피크 구역을 역추적합니다. 
          아래의 <b>Spotify 스타일 플레이백 인터페이스</b>를 가동하여 공정 트렌드 이력의 흐름을 가시적으로 파악하고, 오차 한계를 탈피하기 전 조기 예측 예방 알람(Predictive Alarm) 상태를 자동 모니터링합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Graph */}
        <div className="lg:col-span-8 bg-[#181818] p-5 rounded-2xl border border-[#252525] space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white uppercase tracking-wider">공정 타임라인 센서 트랙 ({activeLogs.length} / {sensorLogs.length} 구간)</span>
            <div className="flex gap-4 text-[10px] font-mono text-[#b3b3b3]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm inline-block opacity-40"></span> 온도(Temp)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block opacity-40"></span> 압력(Pres)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-purple-500 rounded-sm inline-block opacity-40"></span> 진동(Vibr)</span>
            </div>
          </div>

          <div className="h-[280px] w-full bg-[#121212] p-4 rounded-xl">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeLogs}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPres" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVibr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" stroke="#4d4d4d" fontSize={9} tickFormatter={(t) => t.slice(11, 16)} />
                <YAxis stroke="#4d4d4d" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#252525' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                  labelStyle={{ color: '#b3b3b3', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="temperature" name="온도 (°C)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTemp)" />
                <Area type="monotone" dataKey="pressure" name="압력 (Bar)" stroke="#10b981" fillOpacity={1} fill="url(#colorPres)" />
                <Area type="monotone" dataKey="vibration" name="진동 (mm/s)" stroke="#a855f7" fillOpacity={1} fill="url(#colorVibr)" />
                
                {/* Visual marker of actual failure peak at index 74 */}
                {currentIndex >= 74 && (
                  <ReferenceLine x={sensorLogs[74].timestamp} stroke="#f3727f" strokeWidth={2} label={{ value: '공정 이탈 (Defective)', fill: '#f3727f', fontSize: 10 }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Spotify-inspired Playback Controls HUD */}
          <div className="bg-[#121212] p-4 rounded-xl border border-[#252525] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#1f1f1f] border border-[#252525] p-2.5 rounded-lg flex items-center justify-center">
                <Cpu size={20} className="text-[#1ed760]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#b3b3b3] block">NOW MONITORING AT</span>
                <span className="text-xs font-bold text-white font-mono">{currentLog.timestamp}</span>
              </div>
            </div>

            {/* Playback action buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 5)); }}
                className="text-[#b3b3b3] hover:text-white p-2 rounded-full cursor-pointer transition-colors"
                title="5단계 뒤로"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-[#1ed760] text-black hover:scale-105 active:scale-95 p-3 rounded-full flex items-center justify-center cursor-pointer transition-transform"
                title={isPlaying ? '일시 정지' : '자동 추적 시작'}
              >
                {isPlaying ? <Pause size={20} className="fill-black" /> : <Play size={20} className="fill-black translate-x-0.5" />}
              </button>

              <button
                onClick={() => { setCurrentIndex(Math.min(sensorLogs.length - 1, currentIndex + 5)); }}
                className="text-[#b3b3b3] hover:text-white p-2 rounded-full cursor-pointer transition-colors"
                title="5단계 앞으로"
              >
                <SkipForward size={18} />
              </button>
            </div>

            {/* Scrubber timeline bar */}
            <div className="flex-1 max-w-[220px] w-full flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#b3b3b3]">{currentIndex + 1}</span>
              <input
                type="range"
                min="0"
                max={sensorLogs.length - 1}
                value={currentIndex}
                onChange={(e) => { setCurrentIndex(parseInt(e.target.value)); setIsPlaying(false); }}
                className="flex-1 accent-[#1ed760] bg-[#252525] h-1 rounded-full cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#b3b3b3]">{sensorLogs.length}</span>
            </div>
          </div>
        </div>

        {/* Right Active Sensor Telemetry Diagnostics HUD */}
        <div className="lg:col-span-4 bg-[#181818] p-5 rounded-2xl border border-[#252525] flex flex-col justify-between space-y-5">
          <div>
            <div className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider mb-3">실시간 설비 계측 HUD</div>

            {/* Telemetry Readout parameters */}
            <div className="space-y-3">
              <div className="bg-[#121212] p-3.5 rounded-xl border border-[#252525] flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#b3b3b3] font-mono block">하우징 건조 온도 (TEMP)</span>
                  <span className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{currentLog.temperature} °C</span>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${isTemperatureHigh ? 'bg-red-950 text-red-400 font-bold' : 'bg-emerald-950 text-[#1ed760]'}`}>
                  {isTemperatureHigh ? '과열 임계치 초과' : '정상 범위'}
                </span>
              </div>

              <div className="bg-[#121212] p-3.5 rounded-xl border border-[#252525] flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#b3b3b3] font-mono block">체결 실린더 압력 (PRES)</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{currentLog.pressure} Bar</span>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${isPressureHigh ? 'bg-red-950 text-red-400 font-bold' : 'bg-emerald-950 text-[#1ed760]'}`}>
                  {isPressureHigh ? '압력 급증' : '정상 범위'}
                </span>
              </div>

              <div className="bg-[#121212] p-3.5 rounded-xl border border-[#252525] flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#b3b3b3] font-mono block">축 조립 미세 진동 (VIBR)</span>
                  <span className="text-lg font-bold font-mono text-purple-400 mt-0.5">{currentLog.vibration} mm/s</span>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${isVibrationHigh ? 'bg-red-950 text-red-400 font-bold' : 'bg-emerald-950 text-[#1ed760]'}`}>
                  {isVibrationHigh ? '이상 진동' : '정상 범위'}
                </span>
              </div>
            </div>
          </div>

          {/* Active alarms / predictive alarms block */}
          {showPredictiveAlarm ? (
            <div className="bg-rose-950/20 border border-rose-500/40 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle size={16} />
                <span>[알람] 설비 고장/이탈 전조 현상 탐지</span>
              </div>
              <p className="text-[11px] text-[#cbcbcb] leading-relaxed">
                현재 계측 시점에서 설비 센서 누적치가 허용 가이드 라인을 이탈하였습니다. 
                이 상태가 지속되면 <b>신관 외경 결합 품질 오차(Cp 저하)</b>로 전개 부품 불량이 촉발됩니다.
              </p>
              <div className="text-[9px] text-[#b3b3b3] font-mono bg-[#121212]/80 p-2.5 rounded">
                인과 요인: {isTemperatureHigh ? '온도 누적 가중치 초과 ' : ''}{isPressureHigh ? '실린더 과압 오차 ' : ''}{isVibrationHigh ? '베어링 손상 의심 진동' : ''}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/10 border border-emerald-900/30 p-4 rounded-xl flex gap-2 items-start text-[11px] text-[#b3b3b3] leading-relaxed">
              <Zap size={16} className="text-[#1ed760] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">예측 예방 유지보수 가동 중</span>
                설비의 각 피크가 추세 안전 지대 내에 안전하게 머무르고 있어 품질 이탈 위험이 극히 낮습니다.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
